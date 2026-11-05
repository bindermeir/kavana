-- ============================================================
-- Kavana: full database schema
-- Run once in the Supabase SQL Editor.
-- Everything lives in its own schema, "kavana", so it can share a
-- Supabase project with another app without touching its tables.
-- After running: Settings -> API -> Exposed schemas -> add "kavana".
-- Every table has Row Level Security: a user can only ever
-- read or write their own rows. Admin-only tables have no
-- client policies at all; the server reaches them with the
-- service role key after checking ADMIN_EMAILS.
-- ============================================================

create extension if not exists "pgcrypto";

create schema if not exists kavana;
grant usage on schema kavana to anon, authenticated, service_role;

-- ------------------------------------------------------------
-- Helper: keep updated_at fresh
-- ------------------------------------------------------------
create or replace function kavana.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ------------------------------------------------------------
-- user_profiles: who the user is (filled gradually over week one)
-- ------------------------------------------------------------
create table if not exists kavana.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  language text not null default 'he' check (language in ('he', 'en')),
  -- how to address them in Hebrew: masculine, feminine, or neutral/plural
  gender text check (gender in ('m', 'f', 'n')),

  -- day one
  belief_system text,
  belief_custom text,
  current_goal text,

  -- getting to know you (week one)
  future_vision text,
  core_values text[] not null default '{}',
  current_state text,
  personal_abilities text[] not null default '{}',
  abilities_note text,
  work_money_place text,
  relationship_status text,
  relationship_approach_in_texts text,
  content_boundaries text[] not null default '{}',
  tone text not null default 'Adaptive',
  cultural_connections text[] not null default '{}',
  calendar_subscriptions text[] not null default '{}',

  -- rhythm and preferences
  morning_reminder_time text not null default '07:00',
  mincha_reminder_enabled boolean not null default true,
  mincha_reminder_time text not null default '13:30',
  evening_reminder_time text not null default '21:00',
  scroll_timing text not null default 'motzash' check (scroll_timing in ('friday', 'shabbat', 'motzash')),
  share_style text not null default 'mantra' check (share_style in ('mantra', 'choice', 'source')),

  -- onboarding state
  onboarding_completed boolean not null default false,
  answered_questions text[] not null default '{}',
  last_question_date date,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists user_profiles_touch on kavana.user_profiles;
create trigger user_profiles_touch before update on kavana.user_profiles
  for each row execute function kavana.touch_updated_at();

alter table kavana.user_profiles enable row level security;
create policy "own profile: select" on kavana.user_profiles for select using (auth.uid() = id);
create policy "own profile: insert" on kavana.user_profiles for insert with check (auth.uid() = id);
create policy "own profile: update" on kavana.user_profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "own profile: delete" on kavana.user_profiles for delete using (auth.uid() = id);

-- ------------------------------------------------------------
-- prayers: the morning kavana (shacharit)
-- ------------------------------------------------------------
create table if not exists kavana.prayers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  content text not null,
  action_line text,
  focus text,
  share_lines jsonb not null default '{}'::jsonb,
  feedback_score smallint,
  created_at timestamptz not null default now()
);
create index if not exists prayers_user_date on kavana.prayers (user_id, date desc);

alter table kavana.prayers enable row level security;
create policy "own prayers: select" on kavana.prayers for select using (auth.uid() = user_id);
create policy "own prayers: insert" on kavana.prayers for insert with check (auth.uid() = user_id);
create policy "own prayers: update" on kavana.prayers for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own prayers: delete" on kavana.prayers for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- mincha_checkins: the midday reset
-- ------------------------------------------------------------
create table if not exists kavana.mincha_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  feeling text,
  path text,
  created_at timestamptz not null default now()
);
create index if not exists mincha_user_date on kavana.mincha_checkins (user_id, date desc);

alter table kavana.mincha_checkins enable row level security;
create policy "own mincha: select" on kavana.mincha_checkins for select using (auth.uid() = user_id);
create policy "own mincha: insert" on kavana.mincha_checkins for insert with check (auth.uid() = user_id);
create policy "own mincha: delete" on kavana.mincha_checkins for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- journal_entries: the evening asif (arvit), one per day
-- ------------------------------------------------------------
create table if not exists kavana.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  success text,
  capability text,
  gratitude text,
  declaration text,
  share_lines jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);
create index if not exists journal_user_date on kavana.journal_entries (user_id, date desc);

drop trigger if exists journal_touch on kavana.journal_entries;
create trigger journal_touch before update on kavana.journal_entries
  for each row execute function kavana.touch_updated_at();

alter table kavana.journal_entries enable row level security;
create policy "own journal: select" on kavana.journal_entries for select using (auth.uid() = user_id);
create policy "own journal: insert" on kavana.journal_entries for insert with check (auth.uid() = user_id);
create policy "own journal: update" on kavana.journal_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own journal: delete" on kavana.journal_entries for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- tasks: the bank ("הצלחתי" and "יש בי")
-- ------------------------------------------------------------
create table if not exists kavana.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_type text not null check (task_type in ('success_list', 'capability_list')),
  content text not null,
  completed boolean not null default true,
  date date not null default current_date,
  created_at timestamptz not null default now()
);
create index if not exists tasks_user on kavana.tasks (user_id, created_at desc);

alter table kavana.tasks enable row level security;
create policy "own tasks: select" on kavana.tasks for select using (auth.uid() = user_id);
create policy "own tasks: insert" on kavana.tasks for insert with check (auth.uid() = user_id);
create policy "own tasks: update" on kavana.tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own tasks: delete" on kavana.tasks for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- offloads: emotional release (פריקה)
-- ------------------------------------------------------------
create table if not exists kavana.offloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  content text not null,
  ai_response text,
  created_at timestamptz not null default now()
);
create index if not exists offloads_user_date on kavana.offloads (user_id, date desc);

alter table kavana.offloads enable row level security;
create policy "own offloads: select" on kavana.offloads for select using (auth.uid() = user_id);
create policy "own offloads: insert" on kavana.offloads for insert with check (auth.uid() = user_id);
create policy "own offloads: update" on kavana.offloads for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own offloads: delete" on kavana.offloads for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- weekly_scrolls: the weekly synthesis (המגילה), one per week
-- ------------------------------------------------------------
create table if not exists kavana.weekly_scrolls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  content jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, week_start)
);

alter table kavana.weekly_scrolls enable row level security;
create policy "own scrolls: select" on kavana.weekly_scrolls for select using (auth.uid() = user_id);
create policy "own scrolls: insert" on kavana.weekly_scrolls for insert with check (auth.uid() = user_id);
create policy "own scrolls: update" on kavana.weekly_scrolls for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own scrolls: delete" on kavana.weekly_scrolls for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- user_memory: the evolving portrait the AI keeps of the user
-- The user can always read, edit and delete it.
-- ------------------------------------------------------------
create table if not exists kavana.user_memory (
  user_id uuid primary key references auth.users(id) on delete cascade,
  portrait text not null default '',
  updated_at timestamptz not null default now()
);

drop trigger if exists memory_touch on kavana.user_memory;
create trigger memory_touch before update on kavana.user_memory
  for each row execute function kavana.touch_updated_at();

alter table kavana.user_memory enable row level security;
create policy "own memory: select" on kavana.user_memory for select using (auth.uid() = user_id);
create policy "own memory: insert" on kavana.user_memory for insert with check (auth.uid() = user_id);
create policy "own memory: update" on kavana.user_memory for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own memory: delete" on kavana.user_memory for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- user_feedback: thumbs up/down on generated texts
-- Users can only add their own; only the admin (service role) reads.
-- ------------------------------------------------------------
create table if not exists kavana.user_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content_type text not null,
  generated_text text,
  feedback_score smallint not null,
  feedback_notes text,
  created_at timestamptz not null default now()
);

alter table kavana.user_feedback enable row level security;
create policy "own feedback: insert" on kavana.user_feedback for insert with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- admin_alerts: e.g. a user asked for a belief/culture we lack
-- ------------------------------------------------------------
create table if not exists kavana.admin_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  type text not null,
  content text not null,
  status text not null default 'pending' check (status in ('pending', 'resolved')),
  created_at timestamptz not null default now()
);

alter table kavana.admin_alerts enable row level security;
create policy "users can raise alerts" on kavana.admin_alerts for insert with check (auth.uid() = user_id and status = 'pending');

-- ------------------------------------------------------------
-- telemetry: anonymous product events (no user id stored)
-- ------------------------------------------------------------
create table if not exists kavana.telemetry (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  event_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table kavana.telemetry enable row level security;
create policy "signed-in users can log events" on kavana.telemetry for insert to authenticated with check (true);

-- ------------------------------------------------------------
-- dynamic_cultures: extra calendars managed by the admin
-- Everyone signed in can read; only the service role writes.
-- ------------------------------------------------------------
create table if not exists kavana.dynamic_cultures (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'religion',
  events_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table kavana.dynamic_cultures enable row level security;
create policy "signed-in users read cultures" on kavana.dynamic_cultures for select to authenticated using (true);

-- ------------------------------------------------------------
-- system_config: admin settings such as the global prompt note
-- No client policies: server (service role) only.
-- ------------------------------------------------------------
create table if not exists kavana.system_config (
  config_key text primary key,
  config_value text,
  updated_at timestamptz not null default now()
);

alter table kavana.system_config enable row level security;

-- ------------------------------------------------------------
-- Access for the API roles (RLS above still decides which rows)
-- ------------------------------------------------------------
grant select, insert, update, delete on all tables in schema kavana to authenticated;
grant all on all tables in schema kavana to service_role;
grant execute on all functions in schema kavana to authenticated, service_role;
alter default privileges in schema kavana grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema kavana grant all on tables to service_role;

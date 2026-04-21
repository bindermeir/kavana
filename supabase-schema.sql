-- ========================================
-- Kavana AI - Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ========================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- PROFILES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  gender TEXT,
  phone TEXT,
  date_of_birth DATE,
  belief_system TEXT,
  bio TEXT,
  custom_instructions JSONB DEFAULT '[]'::jsonb,
  processing_style TEXT,
  shadow_blocker TEXT,
  core_values JSONB DEFAULT '[]'::jsonb,
  success_bank JSONB DEFAULT '[]'::jsonb,
  content_boundaries JSONB DEFAULT '[]'::jsonb,
  identity_tags JSONB DEFAULT '[]'::jsonb,
  life_focus_areas JSONB DEFAULT '[]'::jsonb,
  ideologies JSONB DEFAULT '[]'::jsonb,
  personal_strengths JSONB DEFAULT '[]'::jsonb,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ========================================
-- PRAYERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS prayers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  focus_area TEXT,
  shadow_snapshot TEXT,
  emotional_snapshot TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_prayers_user_id ON prayers(user_id);
CREATE INDEX IF NOT EXISTS idx_prayers_created_at ON prayers(created_at DESC);

-- Policies
CREATE POLICY "Users can view own prayers" ON prayers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prayers" ON prayers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own prayers" ON prayers
  FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- JOURNAL ENTRIES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  gratitude_items JSONB DEFAULT '[]'::jsonb,
  daily_success TEXT,
  declaration TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_journal_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_date ON journal_entries(date DESC);

-- Policies
CREATE POLICY "Users can view own journal" ON journal_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal" ON journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal" ON journal_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal" ON journal_entries
  FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

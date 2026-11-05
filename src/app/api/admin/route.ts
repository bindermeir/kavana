import { getUserContext, getServiceClient, isAdminEmail, errorResponse, HttpError } from '@/lib/supabase-server';
import { readBody } from '@/lib/server/data';
import { cleanText } from '@/lib/ai/gemini';

/** Only signed-in users whose email is listed in ADMIN_EMAILS get past this. */
async function requireAdmin(req: Request) {
    const { user } = await getUserContext(req);
    if (!isAdminEmail(user.email)) throw new HttpError(403, 'Not an admin');
    return getServiceClient();
}

export async function GET(req: Request) {
    try {
        const db = await requireAdmin(req);
        const what = new URL(req.url).searchParams.get('what');

        switch (what) {
            case 'alerts': {
                const { data } = await db.from('admin_alerts').select('*').eq('status', 'pending').order('created_at', { ascending: false });
                return Response.json({ data: data || [] });
            }
            case 'cultures': {
                const { data } = await db.from('dynamic_cultures').select('*').order('created_at', { ascending: false });
                return Response.json({ data: data || [] });
            }
            case 'config': {
                const { data } = await db.from('system_config').select('config_value').eq('config_key', 'global_ai_prompt_override').maybeSingle();
                return Response.json({ data: data?.config_value || '' });
            }
            case 'feedback': {
                const { data } = await db.from('user_feedback').select('id, content_type, generated_text, feedback_score, feedback_notes, created_at').order('created_at', { ascending: false }).limit(200);
                return Response.json({ data: data || [] });
            }
            case 'telemetry': {
                const { data } = await db.from('telemetry').select('event_type').order('created_at', { ascending: false }).limit(5000);
                const counts: Record<string, number> = {};
                (data || []).forEach((d) => { counts[d.event_type] = (counts[d.event_type] || 0) + 1; });
                return Response.json({ data: Object.entries(counts).map(([type, count]) => ({ type, count })) });
            }
            case 'me':
                return Response.json({ data: true });
            default:
                throw new HttpError(400, 'Unknown request');
        }
    } catch (e) {
        return errorResponse(e);
    }
}

export async function POST(req: Request) {
    try {
        const db = await requireAdmin(req);
        const body = await readBody(req);

        switch (body.action) {
            case 'resolveAlert':
                await db.from('admin_alerts').update({ status: 'resolved' }).eq('id', String(body.id));
                break;
            case 'addCulture': {
                const name = cleanText(body.name, 100);
                if (!name) throw new HttpError(400, 'Missing name');
                await db.from('dynamic_cultures').insert({ name, type: cleanText(body.type, 50) || 'religion', events_json: [] });
                break;
            }
            case 'deleteCulture':
                await db.from('dynamic_cultures').delete().eq('id', String(body.id));
                break;
            case 'setConfig':
                await db.from('system_config').upsert({
                    config_key: 'global_ai_prompt_override',
                    config_value: cleanText(body.value, 4000),
                    updated_at: new Date().toISOString(),
                });
                break;
            default:
                throw new HttpError(400, 'Unknown action');
        }
        return Response.json({ ok: true });
    } catch (e) {
        return errorResponse(e);
    }
}

import { getAdminClient } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';

// GET /api/referral/owner?code=ABC123  → ชื่อผู้แนะนำ (โชว์บนหน้าเพื่อน)
export async function GET(req) {
  try {
    const code = new URL(req.url).searchParams.get('code');
    if (!code) return Response.json({ error: 'no code' }, { status: 400 });

    const db = getAdminClient();
    const { data } = await db
      .from('referrers').select('name').eq('code', code).maybeSingle();
    if (!data) return Response.json({ error: 'ไม่พบลิงก์นี้' }, { status: 404 });

    return Response.json({ name: data.name });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

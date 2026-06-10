import { getAdminClient } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';

// POST /api/referral  → เพื่อนกรอกข้อมูลผ่านลิงก์เฉพาะตัว (ผูก referrer อัตโนมัติ)
export async function POST(req) {
  try {
    const { code, friend_name, friend_phone, province } = await req.json();
    if (!code || !friend_name || !friend_phone) {
      return Response.json({ error: 'กรอกข้อมูลไม่ครบ' }, { status: 400 });
    }
    const db = getAdminClient();

    // ตรวจว่า code นี้มีผู้แนะนำจริง → นี่คือการ "ยืนยันว่าใครแนะนำ"
    const { data: ref } = await db
      .from('referrers').select('id, name').eq('code', code).maybeSingle();
    if (!ref) return Response.json({ error: 'ลิงก์ไม่ถูกต้อง' }, { status: 404 });

    const { error } = await db.from('referrals').insert({
      referrer_id: ref.id,
      friend_name,
      friend_phone,
      province: province || null,
    });
    if (error) throw error;

    return Response.json({ ok: true, referrer_name: ref.name });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

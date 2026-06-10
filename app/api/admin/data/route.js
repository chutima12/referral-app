import { cookies } from 'next/headers';
import { getAdminClient } from '../../../../lib/supabase';
import { REFERRAL_FEE, BONUS_TARGET } from '../../../../lib/config';

export const dynamic = 'force-dynamic';

function authed() {
  return cookies().get('lfl_admin')?.value === 'ok';
}

// GET /api/admin/data  → ดึงรายการแนะนำทั้งหมด + สรุปยอดต่อผู้แนะนำ
export async function GET() {
  if (!authed()) return Response.json({ error: 'unauthorized' }, { status: 401 });
  try {
    const db = getAdminClient();
    const { data: rows } = await db
      .from('referrals')
      .select('*, referrers(name, phone, code, line_id)')
      .order('created_at', { ascending: false });

    const list = rows || [];

    // สรุปต่อผู้แนะนำ: นับเฉพาะ "ลงทุนสำเร็จ" = ตรวจสอบว่าใครแนะนำได้ผลจริง
    const map = {};
    for (const r of list) {
      const key = r.referrer_id;
      if (!map[key]) {
        map[key] = {
          name: r.referrers?.name, phone: r.referrers?.phone, code: r.referrers?.code,
          total: 0, success: 0, fee: 0,
        };
      }
      map[key].total += 1;
      if (r.status === 'ลงทุนสำเร็จ') {
        map[key].success += 1;
        map[key].fee += Number(r.fee || 0);
      }
    }
    const summary = Object.values(map)
      .map((s) => ({ ...s, bonus: s.success >= BONUS_TARGET }))
      .sort((a, b) => b.success - a.success);

    return Response.json({ list, summary, fee: REFERRAL_FEE, target: BONUS_TARGET });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/admin/data  → อัปเดตสถานะ/ยอดลงทุน/การจ่ายเงิน
export async function POST(req) {
  if (!authed()) return Response.json({ error: 'unauthorized' }, { status: 401 });
  try {
    const { id, status, invest_amount, paid, note } = await req.json();
    const db = getAdminClient();

    const patch = {};
    if (status !== undefined) patch.status = status;
    if (invest_amount !== undefined) patch.invest_amount = Number(invest_amount) || 0;
    if (note !== undefined) patch.note = note;

    // ลงทุนสำเร็จ → เติมค่าแนะนำอัตโนมัติ (ถ้ายังเป็น 0)
    if (status === 'ลงทุนสำเร็จ') {
      const { data: cur } = await db.from('referrals').select('fee').eq('id', id).maybeSingle();
      if (!cur || !Number(cur.fee)) patch.fee = REFERRAL_FEE;
    }
    if (paid !== undefined) {
      patch.paid = !!paid;
      patch.paid_at = paid ? new Date().toISOString() : null;
    }

    const { error } = await db.from('referrals').update(patch).eq('id', id);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

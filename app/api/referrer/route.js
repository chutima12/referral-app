import { getAdminClient, genCode } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';

// POST /api/referrer  → สมัครเป็นผู้แนะนำ (ถ้าเบอร์ซ้ำ คืน code เดิม)
export async function POST(req) {
  try {
    const { name, phone, line_id } = await req.json();
    if (!name || !phone) {
      return Response.json({ error: 'กรุณากรอกชื่อและเบอร์โทร' }, { status: 400 });
    }
    const db = getAdminClient();

    const { data: existing } = await db
      .from('referrers').select('*').eq('phone', phone).maybeSingle();
    if (existing) {
      return Response.json({ code: existing.code, name: existing.name, existed: true });
    }

    // สุ่ม code ที่ไม่ซ้ำ
    let code = genCode();
    for (let i = 0; i < 5; i++) {
      const { data: dup } = await db.from('referrers').select('id').eq('code', code).maybeSingle();
      if (!dup) break;
      code = genCode();
    }

    const { data, error } = await db
      .from('referrers')
      .insert({ name, phone, line_id: line_id || null, code })
      .select().single();
    if (error) throw error;

    return Response.json({ code: data.code, name: data.name });
  } catch (e) {
    return Response.json({ error: e.message || 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}

// GET /api/referrer?phone=08x  → ข้อมูลผู้แนะนำ + รายการที่แนะนำ (สำหรับ Dashboard)
export async function GET(req) {
  try {
    const phone = new URL(req.url).searchParams.get('phone');
    if (!phone) return Response.json({ error: 'ต้องระบุเบอร์โทร' }, { status: 400 });

    const db = getAdminClient();
    const { data: ref } = await db
      .from('referrers').select('*').eq('phone', phone.trim()).maybeSingle();
    if (!ref) return Response.json({ error: 'ไม่พบเบอร์นี้ในระบบ กรุณาสมัครเป็นผู้แนะนำก่อน' }, { status: 404 });

    const { data: list } = await db
      .from('referrals').select('*').eq('referrer_id', ref.id)
      .order('created_at', { ascending: false });

    return Response.json({ referrer: ref, referrals: list || [] });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// POST /api/admin/login  → ตรวจรหัสผ่าน แล้วตั้ง cookie
export async function POST(req) {
  const { password } = await req.json();
  if (password && password === process.env.ADMIN_PASSWORD) {
    cookies().set('lfl_admin', 'ok', {
      httpOnly: true, path: '/', sameSite: 'lax', maxAge: 60 * 60 * 8,
    });
    return Response.json({ ok: true });
  }
  return Response.json({ error: 'รหัสผ่านไม่ถูกต้อง' }, { status: 401 });
}

// POST /api/admin/login?logout=1 ไม่ได้ใช้ — ออกจากระบบทำที่ฝั่ง client ได้
export async function DELETE() {
  cookies().delete('lfl_admin');
  return Response.json({ ok: true });
}

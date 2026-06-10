import { createClient } from '@supabase/supabase-js';

// ใช้เฉพาะฝั่ง server เท่านั้น (service_role key ต้องไม่หลุดไป client)
export function getAdminClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

// สร้างรหัสผู้แนะนำแบบสุ่ม อ่านง่าย (ตัด O/0/I/1 ที่สับสนออก)
export function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

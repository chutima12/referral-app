# ระบบเพื่อนชวนเพื่อน — Land for Loan

Web App แบบมืออาชีพ ตรวจสอบได้ว่า "ใครแนะนำใคร" ด้วย **ลิงก์เฉพาะตัว** (ปลอมไม่ได้)
สร้างด้วย Next.js + Supabase • ดีพลอยฟรีบน Vercel

## หน้าต่างๆ ในระบบ

| URL | ใคร | ทำอะไร |
|-----|-----|--------|
| `/` | ผู้แนะนำ | สมัคร → รับลิงก์เฉพาะตัว |
| `/r/[code]` | เพื่อน | กรอกข้อมูลผ่านลิงก์ (ผูกผู้แนะนำอัตโนมัติ) |
| `/dashboard` | ผู้แนะนำ | ดูยอด/ค่าแนะนำ/ความคืบหน้าโบนัส (ใช้เบอร์เข้า) |
| `/admin` | ทีมงาน | เปลี่ยนสถานะ/จ่ายเงิน/ดูว่าใครแนะนำสำเร็จจริง (ใช้รหัสผ่าน) |

---

## วิธีติดตั้ง (ครั้งเดียว ~15 นาที)

### 1) สร้างฐานข้อมูล Supabase (ฟรี)
1. สมัคร https://supabase.com → **New project** (จำรหัส database ไว้)
2. ไปที่เมนู **SQL Editor → New query** → คัดลอกโค้ดจากไฟล์ `supabase/schema.sql` มาวาง → กด **Run**
3. ไปที่ **Project Settings → API** เก็บค่า 2 ตัว:
   - `Project URL`  → ใช้เป็น `SUPABASE_URL`
   - `service_role` key (อยู่ใต้ Project API keys) → ใช้เป็น `SUPABASE_SERVICE_ROLE_KEY`

### 2) ทดสอบในเครื่อง (ถ้าต้องการ)
```bash
npm install
# สร้างไฟล์ .env.local แล้วใส่ค่าตาม .env.example
npm run dev
```
เปิด http://localhost:3000

### 3) ดีพลอยขึ้น Vercel (ฟรี)
1. อัปโค้ดขึ้น GitHub (หรือใช้ `vercel` CLI)
2. ไป https://vercel.com → **Add New → Project** → เลือก repo นี้
3. ใส่ Environment Variables 3 ตัว:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD` (ตั้งรหัสแอดมินเอง)
4. กด **Deploy** → ได้ลิงก์ เช่น `https://lfl-referral.vercel.app`

---

## เอาไปใช้กับ LINE Rich Menu

- ปุ่ม **"ชวนเพื่อนลงทุน"** → ลิงก์ `https://lfl-referral.vercel.app/`
  (ผู้แนะนำสมัครรับลิงก์ตัวเอง)
- ปุ่ม **"เช็คยอด/Dashboard"** → `https://lfl-referral.vercel.app/dashboard`
- ทีมงานเข้า `https://lfl-referral.vercel.app/admin`

## แก้เงื่อนไขโปรโมชัน
แก้ไฟล์ `lib/config.js` (ค่าแนะนำ / จำนวนเป้าโบนัส / วันหมดเขต / ลิงก์ LINE OA)

## ความปลอดภัย
- ทุกการเขียนฐานข้อมูลผ่าน server เท่านั้น (service_role key ไม่หลุดไป client)
- เปิด Row Level Security ไว้ — client ทั่วไปแตะฐานข้อมูลตรงๆ ไม่ได้
- หน้า `/admin` ป้องกันด้วยรหัสผ่าน + cookie

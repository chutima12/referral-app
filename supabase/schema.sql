-- ═══════════════════════════════════════════════════════════
--  รันสคริปต์นี้ใน Supabase → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════

-- ตารางผู้แนะนำ (แต่ละคนมี code เฉพาะตัว = ลิงก์ชวนเพื่อน)
create table if not exists referrers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text not null unique,
  line_id     text,
  code        text not null unique,
  created_at  timestamptz default now()
);

-- ตารางการแนะนำ (ผูกกับผู้แนะนำผ่าน referrer_id = ตรวจสอบได้ว่าใครชวน)
create table if not exists referrals (
  id            uuid primary key default gen_random_uuid(),
  referrer_id   uuid not null references referrers(id) on delete cascade,
  friend_name   text not null,
  friend_phone  text not null,
  province      text,
  status        text not null default 'รอติดต่อ',
  invest_amount numeric default 0,
  fee           numeric default 0,
  paid          boolean default false,
  paid_at       timestamptz,
  note          text,
  created_at    timestamptz default now()
);

create index if not exists idx_referrals_referrer on referrals(referrer_id);

-- เปิด RLS ไว้ (ไม่ตั้ง policy = client ทั่วไปเข้าไม่ได้)
-- แอปเข้าถึงผ่าน service_role key ฝั่ง server เท่านั้น → ปลอดภัย
alter table referrers enable row level security;
alter table referrals enable row level security;

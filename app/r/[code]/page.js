'use client';
import { useEffect, useState } from 'react';
import { COMPANY, LINE_OA } from '../../../lib/config';

export default function FriendPage({ params }) {
  const code = params.code;
  const [owner, setOwner] = useState(null);
  const [invalid, setInvalid] = useState(false);
  const [form, setForm] = useState({ friend_name: '', friend_phone: '', province: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/referral/owner?code=${encodeURIComponent(code)}`)
      .then((r) => r.json())
      .then((d) => (d.name ? setOwner(d.name) : setInvalid(true)))
      .catch(() => setInvalid(true));
  }, [code]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      const res = await fetch('/api/referral', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
    } catch (e) { setErr(e.message); }
    setLoading(false);
  }

  if (invalid) {
    return (
      <div className="wrap">
        <div className="card center">
          <div className="success-icon">⚠️</div>
          <h2>ลิงก์ไม่ถูกต้อง</h2>
          <p className="muted">ลิงก์ชวนเพื่อนนี้ไม่ถูกต้องหรือหมดอายุ กรุณาขอลิงก์ใหม่จากผู้แนะนำ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="brand"><span className="dot">L</span> {COMPANY}</div>
      <div className="hero">
        <span className="badge">โอกาสลงทุน สร้างรายได้ มั่นคง ปลอดภัย</span>
        <h1>ลงทุนจำนอง–ขายฝาก กับ {COMPANY}</h1>
        <p>มีอสังหาฯ ค้ำประกันทุกสัญญา • ผลตอบแทนมั่นคงทุกเดือน</p>
      </div>

      {!done ? (
        <form className="card" onSubmit={submit}>
          {owner && (
            <p className="muted" style={{ marginBottom: 8 }}>
              🤝 คุณได้รับการแนะนำโดย <b style={{ color: 'var(--red)' }}>คุณ{owner}</b>
            </p>
          )}
          <h2>ลงทะเบียนรับข้อมูลการลงทุน</h2>
          <label>ชื่อ-นามสกุล *</label>
          <input value={form.friend_name} onChange={set('friend_name')} placeholder="ชื่อของคุณ" required />
          <label>เบอร์โทร *</label>
          <input value={form.friend_phone} onChange={set('friend_phone')} placeholder="08x-xxx-xxxx" required />
          <label>จังหวัด/พื้นที่ทรัพย์ที่สนใจ</label>
          <input value={form.province} onChange={set('province')} placeholder="ไม่บังคับ" />
          {err && <div className="err">⚠️ {err}</div>}
          <button className="btn" disabled={loading || !owner}>{loading ? 'กำลังส่ง...' : 'ลงทะเบียน รับการติดต่อกลับ →'}</button>
          <div className="note">เจ้าหน้าที่จะติดต่อกลับภายใน 24 ชม. เพื่อแนะนำทรัพย์ที่เหมาะกับคุณ</div>
        </form>
      ) : (
        <div className="card center">
          <div className="success-icon">✅</div>
          <h2>ลงทะเบียนสำเร็จ!</h2>
          <p className="muted">ขอบคุณค่ะ 🙏 ขั้นตอนสุดท้าย กดเพิ่มเพื่อน LINE เพื่อรับข้อมูลทรัพย์และให้เจ้าหน้าที่ติดต่อกลับ</p>
          <a className="btn" href={LINE_OA} target="_blank" rel="noreferrer"
             style={{ textDecoration: 'none', marginTop: 18 }}>
            ➕ เพิ่มเพื่อน LINE @landforloan-invest
          </a>
          <div className="note">ระบบบันทึกผู้แนะนำของคุณไว้แล้ว ✅ ไม่ต้องแจ้งชื่อผู้แนะนำซ้ำ</div>
        </div>
      )}
    </div>
  );
}

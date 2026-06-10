'use client';
import { useState } from 'react';
import { COMPANY, REFERRAL_FEE, BONUS_TARGET, BONUS_LABEL, PROMO_END } from '../lib/config';

export default function Home() {
  const [form, setForm] = useState({ name: '', phone: '', line_id: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      const res = await fetch('/api/referrer', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (e) { setErr(e.message); }
    setLoading(false);
  }

  const link = result ? `${window.location.origin}/r/${result.code}` : '';

  function copy() {
    navigator.clipboard.writeText(link);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="wrap">
      <div className="brand"><span className="dot">L</span> {COMPANY}</div>

      <div className="hero">
        <span className="badge">เพื่อนชวนเพื่อน ชวนกันมารวย 🐯</span>
        <h1>ชวนเพื่อนลงทุน รับค่าแนะนำ {REFERRAL_FEE.toLocaleString()} บาท / รายชื่อ</h1>
        <p>แนะนำครบ {BONUS_TARGET} คน รับฟรี! {BONUS_LABEL}<br />*หมดเขต {PROMO_END}</p>
      </div>

      {!result ? (
        <form className="card" onSubmit={submit}>
          <h2>สมัครเป็นผู้แนะนำ (รับลิงก์เฉพาะตัว)</h2>
          <label>ชื่อ-นามสกุล *</label>
          <input value={form.name} onChange={set('name')} placeholder="เช่น สมชาย ใจดี" required />
          <label>เบอร์โทร *</label>
          <input value={form.phone} onChange={set('phone')} placeholder="08x-xxx-xxxx" required />
          <label>ชื่อ LINE (ถ้ามี)</label>
          <input value={form.line_id} onChange={set('line_id')} placeholder="ไม่บังคับ" />
          {err && <div className="err">⚠️ {err}</div>}
          <button className="btn" disabled={loading}>{loading ? 'กำลังสร้าง...' : 'รับลิงก์ชวนเพื่อนของฉัน →'}</button>
        </form>
      ) : (
        <div className="card">
          <div className="success-icon">🎉</div>
          <h2 className="center">{result.existed ? 'นี่คือลิงก์ของคุณ' : 'สร้างลิงก์สำเร็จ!'} คุณ{result.name}</h2>
          <p className="muted center">ส่งลิงก์นี้ให้เพื่อน เมื่อเพื่อนกรอกผ่านลิงก์นี้ ระบบจะนับให้คุณอัตโนมัติ ✅</p>
          <div className="linkbox">
            <code>{link}</code>
            <button className="btn btn-sm" onClick={copy}>{copied ? 'คัดลอกแล้ว ✓' : 'คัดลอก'}</button>
          </div>
          <a className="btn btn-ghost" href="/dashboard" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 14 }}>
            📊 ดูยอดการแนะนำของฉัน
          </a>
          <div className="note">
            💡 รหัสผู้แนะนำของคุณคือ <b>{result.code}</b> — ใช้เบอร์ {form.phone || 'ที่สมัคร'} เข้าดู Dashboard ได้ตลอด
          </div>
        </div>
      )}
    </div>
  );
}

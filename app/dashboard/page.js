'use client';
import { useState } from 'react';
import { COMPANY, REFERRAL_FEE, BONUS_TARGET, BONUS_LABEL } from '../../lib/config';

function statusPill(s) {
  if (s === 'ลงทุนสำเร็จ') return <span className="pill ok">{s}</span>;
  if (s === 'ไม่สนใจ') return <span className="pill no">{s}</span>;
  return <span className="pill wait">{s}</span>;
}

export default function Dashboard() {
  const [phone, setPhone] = useState('');
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function lookup(e) {
    e.preventDefault();
    setErr(''); setLoading(true); setData(null);
    try {
      const res = await fetch(`/api/referrer?phone=${encodeURIComponent(phone)}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setData(d);
    } catch (e) { setErr(e.message); }
    setLoading(false);
  }

  const success = data ? data.referrals.filter((r) => r.status === 'ลงทุนสำเร็จ').length : 0;
  const earned = data ? data.referrals.reduce((s, r) => s + Number(r.fee || 0), 0) : 0;
  const link = data ? `${window.location.origin}/r/${data.referrer.code}` : '';
  const pct = Math.min(100, (success / BONUS_TARGET) * 100);

  function copy() {
    navigator.clipboard.writeText(link);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="wrap">
      <div className="brand"><span className="dot">L</span> {COMPANY}</div>
      <h2 style={{ margin: '8px 0 16px', color: 'var(--red-dark)' }}>📊 Dashboard ผู้แนะนำ</h2>

      <form className="card" onSubmit={lookup}>
        <label>กรอกเบอร์โทรที่ใช้สมัครเป็นผู้แนะนำ</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08x-xxx-xxxx" required />
        {err && <div className="err">⚠️ {err}</div>}
        <button className="btn" disabled={loading}>{loading ? 'กำลังค้นหา...' : 'ดูยอดของฉัน'}</button>
      </form>

      {data && (
        <>
          <div className="card">
            <h2>สวัสดี คุณ{data.referrer.name} 👋</h2>
            <div className="stat-row">
              <div className="stat"><div className="num">{data.referrals.length}</div><div className="lbl">แนะนำทั้งหมด</div></div>
              <div className="stat"><div className="num">{success}</div><div className="lbl">ลงทุนสำเร็จ</div></div>
              <div className="stat"><div className="num">{earned.toLocaleString()}</div><div className="lbl">ค่าแนะนำ (บาท)</div></div>
            </div>

            <label>ความคืบหน้าโบนัส ({success}/{BONUS_TARGET} คน)</label>
            <div className="progress"><div style={{ width: pct + '%' }} /></div>
            <p className="muted">
              {success >= BONUS_TARGET
                ? `🎉 ยินดีด้วย! คุณได้รับ ${BONUS_LABEL}`
                : `อีก ${BONUS_TARGET - success} คน รับ ${BONUS_LABEL}`}
            </p>

            <div className="linkbox" style={{ marginTop: 16 }}>
              <code>{link}</code>
              <button className="btn btn-sm" onClick={copy}>{copied ? 'คัดลอกแล้ว ✓' : 'คัดลอก'}</button>
            </div>
          </div>

          <div className="card">
            <h2>รายชื่อที่คุณแนะนำ</h2>
            {data.referrals.length === 0 ? (
              <p className="muted">ยังไม่มีรายชื่อ — แชร์ลิงก์ด้านบนให้เพื่อนได้เลย!</p>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead><tr><th>ชื่อเพื่อน</th><th>เบอร์</th><th>สถานะ</th><th>ค่าแนะนำ</th></tr></thead>
                  <tbody>
                    {data.referrals.map((r) => (
                      <tr key={r.id}>
                        <td>{r.friend_name}</td>
                        <td>{r.friend_phone}</td>
                        <td>{statusPill(r.status)}</td>
                        <td>{Number(r.fee || 0).toLocaleString()}{r.paid ? ' ✅' : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="note">✅ = จ่ายค่าแนะนำแล้ว • ค่าแนะนำจะนับเมื่อเพื่อน "ลงทุนสำเร็จ"</div>
          </div>
        </>
      )}
    </div>
  );
}

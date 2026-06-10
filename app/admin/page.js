'use client';
import { useEffect, useState } from 'react';
import { COMPANY, STATUSES } from '../../lib/config';

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('list');

  async function load() {
    const res = await fetch('/api/admin/data');
    if (res.status === 401) { setAuthed(false); return; }
    const d = await res.json();
    setData(d); setAuthed(true);
  }
  useEffect(() => { load(); }, []);

  async function login(e) {
    e.preventDefault(); setErr('');
    const res = await fetch('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) { await load(); } else { setErr('รหัสผ่านไม่ถูกต้อง'); }
  }

  async function update(id, patch) {
    await fetch('/api/admin/data', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...patch }),
    });
    await load();
  }

  if (!authed) {
    return (
      <div className="wrap">
        <div className="brand"><span className="dot">L</span> {COMPANY} • Admin</div>
        <form className="card" onSubmit={login} style={{ marginTop: 16 }}>
          <h2>เข้าสู่ระบบแอดมิน</h2>
          <label>รหัสผ่าน</label>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required />
          {err && <div className="err">⚠️ {err}</div>}
          <button className="btn">เข้าสู่ระบบ</button>
        </form>
      </div>
    );
  }

  return (
    <div className="wrap wrap-wide">
      <div className="brand"><span className="dot">L</span> {COMPANY} • Admin</div>

      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <button className={'btn btn-sm ' + (tab === 'list' ? '' : 'btn-ghost')} onClick={() => setTab('list')}>รายการแนะนำ</button>
        <button className={'btn btn-sm ' + (tab === 'summary' ? '' : 'btn-ghost')} onClick={() => setTab('summary')}>สรุปต่อผู้แนะนำ</button>
      </div>

      {tab === 'summary' && data && (
        <div className="card">
          <h2>🏆 สรุปต่อผู้แนะนำ (ตรวจสอบว่าใครแนะนำสำเร็จจริง)</h2>
          <div className="table-scroll">
            <table>
              <thead><tr><th>ผู้แนะนำ</th><th>เบอร์</th><th>รหัส</th><th>แนะนำ</th><th>สำเร็จ</th><th>ค่าแนะนำรวม</th><th>โบนัส</th></tr></thead>
              <tbody>
                {data.summary.map((s, i) => (
                  <tr key={i}>
                    <td>{s.name}</td><td>{s.phone}</td><td><code>{s.code}</code></td>
                    <td>{s.total}</td><td><b>{s.success}</b></td>
                    <td>{s.fee.toLocaleString()}</td>
                    <td>{s.bonus ? <span className="pill ok">ได้ตั๋วฮ่องกง ✈️</span> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'list' && data && (
        <div className="card">
          <h2>รายการแนะนำทั้งหมด ({data.list.length})</h2>
          <div className="table-scroll">
            <table>
              <thead><tr>
                <th>วันที่</th><th>เพื่อน</th><th>เบอร์</th><th>ผู้แนะนำ</th>
                <th>สถานะ</th><th>ยอดลงทุน</th><th>ค่าแนะนำ</th><th>จ่ายแล้ว</th>
              </tr></thead>
              <tbody>
                {data.list.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.created_at).toLocaleDateString('th-TH')}</td>
                    <td>{r.friend_name}</td>
                    <td>{r.friend_phone}</td>
                    <td>{r.referrers?.name}<br /><span className="muted">{r.referrers?.code}</span></td>
                    <td>
                      <select value={r.status} onChange={(e) => update(r.id, { status: e.target.value })}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <input style={{ width: 110 }} type="number" defaultValue={r.invest_amount || 0}
                        onBlur={(e) => update(r.id, { invest_amount: e.target.value })} />
                    </td>
                    <td>{Number(r.fee || 0).toLocaleString()}</td>
                    <td className="center">
                      <input type="checkbox" checked={!!r.paid} style={{ width: 20 }}
                        onChange={(e) => update(r.id, { paid: e.target.checked })} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="note">เปลี่ยนสถานะเป็น "ลงทุนสำเร็จ" → ระบบเติมค่าแนะนำให้อัตโนมัติ • ติ๊ก "จ่ายแล้ว" เมื่อโอนเงินค่าแนะนำเรียบร้อย</div>
        </div>
      )}
    </div>
  );
}

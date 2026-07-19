'use client'

import { useState } from 'react'
import { D } from '@/lib/utils'

/* ─── Section wrapper ─── */
function Section({ title, icon, children }) {
  return (
    <div style={{ background: D.surfaceUp, borderRadius: 18, border: `1.5px solid ${D.border}`, marginBottom: 14, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${D.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <i className={`ti ${icon}`} style={{ fontSize: 16, color: D.accent }} />
        <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: D.textPri }}>{title}</p>
      </div>
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </div>
  )
}

/* ─── Backup & Restore ─── */
function BackupSection({ txs, budgets, onRestore }) {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleBackup = () => {
    const data = { transactions: txs, budgets, exportedAt: new Date().toISOString(), version: 2 }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `keuanganku-backup-${new Date().toISOString().slice(0,10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleRestore = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!data.transactions) throw new Error('Format tidak valid')
        await onRestore(data)
        setStatus({ ok: true, msg: `✅ ${data.transactions.length} transaksi berhasil dipulihkan!` })
      } catch {
        setStatus({ ok: false, msg: '❌ File tidak valid atau rusak.' })
      }
      setLoading(false)
      setTimeout(() => setStatus(null), 3000)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 4 }}>
        <div style={{ background: D.surfaceHi, borderRadius: 10, padding: '10px 14px' }}>
          <p style={{ margin: '0 0 2px', fontSize: 10, color: D.textMuted, textTransform: 'uppercase', fontWeight: 700 }}>Total Transaksi</p>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: D.accent }}>{txs.length}</p>
        </div>
        <div style={{ background: D.surfaceHi, borderRadius: 10, padding: '10px 14px' }}>
          <p style={{ margin: '0 0 2px', fontSize: 10, color: D.textMuted, textTransform: 'uppercase', fontWeight: 700 }}>Budget Tersimpan</p>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: D.saving.solid }}>{Object.keys(budgets).length}</p>
        </div>
      </div>

      <button onClick={handleBackup} style={{ width: '100%', padding: '13px', borderRadius: 12, fontSize: 14, fontWeight: 700, background: D.accent, color: '#0D0F1A', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 0 20px rgba(129,140,248,0.3)' }}>
        <i className="ti ti-download" style={{ fontSize: 16 }} />
        Unduh Backup (.json)
      </button>

      <label style={{ width: '100%', padding: '13px', borderRadius: 12, fontSize: 14, fontWeight: 700, background: D.surfaceHi, color: loading ? D.textMuted : D.textSec, border: `1.5px solid ${D.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: loading ? 'wait' : 'pointer', boxSizing: 'border-box' }}>
        <i className="ti ti-upload" style={{ fontSize: 16 }} />
        {loading ? 'Memulihkan...' : 'Pulihkan dari File'}
        <input type="file" accept=".json" onChange={handleRestore} style={{ display: 'none' }} disabled={loading} />
      </label>

      {status && (
        <div style={{ padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: status.ok ? D.income.dim : D.outcome.dim, color: status.ok ? D.income.solid : D.outcome.solid, border: `1px solid ${status.ok ? D.income.border : D.outcome.border}` }}>
          {status.msg}
        </div>
      )}

      <p style={{ margin: '4px 0 0', fontSize: 11, color: D.textMuted, lineHeight: 1.6 }}>
        <i className="ti ti-info-circle" style={{ marginRight: 4, fontSize: 12 }} />
        Backup menyimpan semua transaksi & budget ke file .json. Data tersimpan aman di Supabase.
      </p>
    </div>
  )
}

/* ─── Danger Zone ─── */
function DangerZone({ onDeleteAll }) {
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    await onDeleteAll()
    setLoading(false)
    setConfirm(false)
  }

  return (
    <>
      {!confirm ? (
        <button onClick={() => setConfirm(true)} style={{ width:'100%', padding:'12px', borderRadius:12, fontSize:14, fontWeight:700, background:D.outcome.dim, color:D.outcome.solid, border:`1.5px solid ${D.outcome.border}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          <i className="ti ti-trash" style={{ fontSize:15 }} />
          Hapus Semua Data Transaksi
        </button>
      ) : (
        <div style={{ background:D.outcome.dim, borderRadius:12, padding:'14px 16px', border:`1.5px solid ${D.outcome.border}` }}>
          <p style={{ margin:'0 0 12px', fontSize:13, fontWeight:700, color:D.outcome.solid }}>
            ⚠️ Yakin? Semua transaksi & budget akan terhapus permanen!
          </p>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => setConfirm(false)} style={{ flex:1, padding:'10px', borderRadius:10, fontSize:13, fontWeight:600, background:D.surfaceHi, color:D.textSec, border:`1px solid ${D.border}`, cursor:'pointer' }}>
              Batal
            </button>
            <button onClick={handleDelete} disabled={loading} style={{ flex:1, padding:'10px', borderRadius:10, fontSize:13, fontWeight:700, background:D.outcome.solid, color:'#fff', border:'none', cursor:loading?'wait':'pointer' }}>
              {loading ? 'Menghapus...' : 'Ya, Hapus Semua'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

/* ─── Settings Page ─── */
export default function Settings({ txs, budgets, onRestore, onLogout, onDeleteAll, userEmail }) {
  return (
    <div style={{ minHeight: '100vh', background: D.bg }}>
      <div style={{ background: 'rgba(13,15,26,0.9)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${D.border}`, padding: '14px 20px', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: D.textPri, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="ti ti-settings" style={{ fontSize: 18, color: D.accent }} />Pengaturan
        </h1>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: D.textMuted }}>Akun & manajemen data</p>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 16px 24px' }}>

        {/* Info akun */}
        <Section title="Akun" icon="ti-user-circle">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: D.accentDim, border: `1.5px solid #3730A3`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="ti ti-user" style={{ fontSize: 20, color: D.accent }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: D.textPri }}>{userEmail}</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: D.textMuted }}>Login via Supabase Auth</p>
            </div>
          </div>
        </Section>

        <Section title="Backup & Restore" icon="ti-database">
          <BackupSection txs={txs} budgets={budgets} onRestore={onRestore} />
        </Section>

        <Section title="Hapus Data" icon="ti-trash">
          <p style={{ margin:'0 0 12px', fontSize:13, color:D.textMuted }}>
            Hapus semua transaksi dan budget secara permanen. Data tidak bisa dipulihkan kecuali kamu punya backup.
          </p>
          <DangerZone onDeleteAll={onDeleteAll} />
        </Section>

        <Section title="Sesi" icon="ti-logout">
          <p style={{ margin:'0 0 12px', fontSize:13, color:D.textMuted }}>
            Keluar dari akun ini. Data kamu tetap aman tersimpan di server.
          </p>
          <button onClick={onLogout} style={{ width:'100%', padding:'12px', borderRadius:12, fontSize:14, fontWeight:700, background:D.outcome.dim, color:D.outcome.solid, border:`1.5px solid ${D.outcome.border}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            <i className="ti ti-logout" style={{ fontSize:15 }} />
            Keluar dari Akun
          </button>
        </Section>

        <p style={{ textAlign: 'center', fontSize: 11, color: D.textMuted, marginTop: 8, lineHeight: 1.7 }}>
          Keuanganku v2.0 · Fullstack · Data tersimpan di Supabase
        </p>
      </div>
    </div>
  )
}

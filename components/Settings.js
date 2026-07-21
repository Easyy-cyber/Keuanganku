'use client'

import { useState, useEffect } from 'react'

const DARK = {
  bg:       '#000000',
  surface:  '#0D0D0D',
  surfaceUp:'#141414',
  surfaceHi:'#1C1C1C',
  border:   '#2A2A2A',
  borderHi: '#3A3A3A',
  textPri:  '#FFFFFF',
  textSec:  '#888888',
  textMuted:'#444444',
  accent:   '#818CF8',
  accentDim:'#1E2148',
  income:  { solid:'#34D399', dim:'#0D2E22', border:'#1A5C40' },
  outcome: { solid:'#FB7185', dim:'#2E0D16', border:'#5C1A26' },
  saving:  { solid:'#FBBF24', dim:'#2E2105', border:'#5C400A' },
  asset:   { solid:'#A78BFA', dim:'#1E1240', border:'#3D2480' },
}

const LIGHT = {
  bg:       '#F5F5F5',
  surface:  '#FFFFFF',
  surfaceUp:'#F0F0F0',
  surfaceHi:'#E8E8E8',
  border:   '#DDDDDD',
  borderHi: '#CCCCCC',
  textPri:  '#111111',
  textSec:  '#555555',
  textMuted:'#999999',
  accent:   '#4F46E5',
  accentDim:'#EEF0FF',
  income:  { solid:'#059669', dim:'#ECFDF5', border:'#A7F3D0' },
  outcome: { solid:'#E11D48', dim:'#FFF1F2', border:'#FECDD3' },
  saving:  { solid:'#D97706', dim:'#FFFBEB', border:'#FDE68A' },
  asset:   { solid:'#7C3AED', dim:'#F5F3FF', border:'#DDD6FE' },
}

const MN  = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"]
const MNS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agt","Sep","Okt","Nov","Des"]
const getYM   = (iso) => { const d = new Date(iso); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}` }
const ymFull  = (ym)  => { const [y,m] = ym.split("-"); return `${MN[+m-1]} ${y}` }
const ymShort = (ym)  => { const [y,m] = ym.split("-"); return `${MNS[+m-1]} ${y}` }
const nowYM   = ()    => getYM(new Date().toISOString())

function Section({ title, icon, children, D }) {
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

/* ─── Export CSV ─── */
function ExportCSV({ txs, D }) {
  const months = [...new Set([nowYM(), ...txs.map(t => getYM(t.date))])].sort((a, b) => b.localeCompare(a))
  const [selectedMonth, setSelectedMonth] = useState(nowYM())

  const handleExport = () => {
    const filtered = txs.filter(t => getYM(t.date) === selectedMonth)
    if (filtered.length === 0) { alert('Tidak ada transaksi di bulan ini'); return }

    const rows = [
      ['Tanggal', 'Kategori', 'Nominal', 'Keterangan'],
      ...filtered.map(t => [
        new Date(t.date).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' }),
        t.category === 'income'  ? 'Pemasukan'   :
        t.category === 'outcome' ? 'Pengeluaran' :
        t.category === 'saving'  ? 'Tabungan'    : 'Aset',
        t.amount,
        t.description || '-',
      ])
    ]

    // Hitung ringkasan
    const sum = filtered.reduce((a, t) => ({ ...a, [t.category]: (a[t.category]||0) + t.amount }), {})
    rows.push([])
    rows.push(['RINGKASAN', '', '', ''])
    rows.push(['Total Pemasukan',   '', sum.income  || 0, ''])
    rows.push(['Total Pengeluaran', '', sum.outcome || 0, ''])
    rows.push(['Total Tabungan',    '', sum.saving  || 0, ''])
    rows.push(['Total Aset',        '', sum.asset   || 0, ''])
    rows.push(['Saldo Bersih',      '', (sum.income||0) - (sum.outcome||0), ''])

    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `keuanganku-${selectedMonth}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 4 }}>
        <div style={{ background: D.surfaceHi, borderRadius: 10, padding: '10px 14px' }}>
          <p style={{ margin: '0 0 2px', fontSize: 10, color: D.textMuted, textTransform: 'uppercase', fontWeight: 700 }}>Total Transaksi</p>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: D.accent }}>{txs.length}</p>
        </div>
        <div style={{ background: D.surfaceHi, borderRadius: 10, padding: '10px 14px' }}>
          <p style={{ margin: '0 0 2px', fontSize: 10, color: D.textMuted, textTransform: 'uppercase', fontWeight: 700 }}>Bulan Dipilih</p>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: D.saving.solid }}>{ymShort(selectedMonth)}</p>
        </div>
      </div>

      {/* Pilih bulan */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: D.textMuted, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Pilih Bulan</label>
        <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
          {months.map(m => {
            const active = selectedMonth === m
            const count  = txs.filter(t => getYM(t.date) === m).length
            return (
              <button key={m} onClick={() => setSelectedMonth(m)} style={{
                flexShrink: 0, padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                background: active ? D.accent : D.surfaceHi,
                color: active ? (D.bg === '#000000' ? '#000' : '#fff') : D.textSec,
                border: active ? 'none' : `1.5px solid ${D.border}`,
                cursor: 'pointer', transition: 'all 0.15s',
                boxShadow: active ? `0 0 12px ${D.accent}55` : 'none',
              }}>
                {ymShort(m)} <span style={{ opacity: 0.7, fontWeight: 500 }}>({count})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Info bulan */}
      <div style={{ background: D.surfaceHi, borderRadius: 10, padding: '10px 14px' }}>
        <p style={{ margin: 0, fontSize: 12, color: D.textSec }}>
          <i className="ti ti-calendar" style={{ marginRight: 6, color: D.accent, fontSize: 13 }} />
          <strong style={{ color: D.textPri }}>{ymFull(selectedMonth)}</strong>
          {' '}— {txs.filter(t => getYM(t.date) === selectedMonth).length} transaksi
        </p>
      </div>

      <button onClick={handleExport} style={{
        width: '100%', padding: '13px', borderRadius: 12, fontSize: 14, fontWeight: 700,
        background: D.accent, color: D.bg === '#000000' ? '#000' : '#fff',
        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        boxShadow: `0 0 20px ${D.accent}55`,
      }}>
        <i className="ti ti-file-spreadsheet" style={{ fontSize: 16 }} />
        Export CSV — {ymFull(selectedMonth)}
      </button>

      <p style={{ margin: 0, fontSize: 11, color: D.textMuted, lineHeight: 1.6 }}>
        <i className="ti ti-info-circle" style={{ marginRight: 4, fontSize: 12 }} />
        File CSV bisa dibuka di Excel, Google Sheets, atau Numbers. Termasuk ringkasan total di bagian bawah.
      </p>
    </div>
  )
}

/* ─── Danger Zone ─── */
function DangerZone({ onDeleteAll, D }) {
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
        <button onClick={() => setConfirm(true)} style={{ width: '100%', padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 700, background: D.outcome.dim, color: D.outcome.solid, border: `1.5px solid ${D.outcome.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <i className="ti ti-trash" style={{ fontSize: 15 }} />
          Hapus Semua Data Transaksi
        </button>
      ) : (
        <div style={{ background: D.outcome.dim, borderRadius: 12, padding: '14px 16px', border: `1.5px solid ${D.outcome.border}` }}>
          <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: D.outcome.solid }}>
            ⚠️ Yakin? Semua transaksi & budget akan terhapus permanen!
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setConfirm(false)} style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: D.surfaceHi, color: D.textSec, border: `1px solid ${D.border}`, cursor: 'pointer' }}>
              Batal
            </button>
            <button onClick={handleDelete} disabled={loading} style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: D.outcome.solid, color: '#fff', border: 'none', cursor: loading ? 'wait' : 'pointer' }}>
              {loading ? 'Menghapus...' : 'Ya, Hapus Semua'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

/* ─── Settings Page ─── */
export default function Settings({ txs, budgets, onLogout, onDeleteAll, userEmail, isDark, onToggleTheme }) {
  const D = isDark ? DARK : LIGHT

  return (
    <div style={{ minHeight: '100vh', background: D.bg }}>
      <div style={{ background: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(245,245,245,0.9)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${D.border}`, padding: '14px 20px', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: D.textPri, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="ti ti-settings" style={{ fontSize: 18, color: D.accent }} />Pengaturan
        </h1>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: D.textMuted }}>Akun & manajemen data</p>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 16px 24px' }}>

        {/* Akun */}
        <Section title="Akun" icon="ti-user-circle" D={D}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: D.accentDim, border: `1.5px solid ${D.borderHi}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="ti ti-user" style={{ fontSize: 20, color: D.accent }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: D.textPri }}>{userEmail}</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: D.textMuted }}>Login via Supabase Auth</p>
            </div>
          </div>
        </Section>

        {/* Tema */}
        <Section title="Tampilan" icon="ti-palette" D={D}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: D.textPri }}>
                {isDark ? '🌙 Mode Malam' : '☀️ Mode Siang'}
              </p>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: D.textMuted }}>
                {isDark ? 'Tampilan gelap, lebih nyaman di malam hari' : 'Tampilan terang, lebih jelas di siang hari'}
              </p>
            </div>
            <button onClick={onToggleTheme} style={{
              width: 52, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
              position: 'relative', background: isDark ? D.accent : D.border,
              transition: 'background 0.2s', flexShrink: 0,
            }}>
              <div style={{
                position: 'absolute', top: 4, left: isDark ? 28 : 4,
                width: 20, height: 20, borderRadius: '50%',
                background: '#fff', transition: 'left 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
              }}>
                {isDark ? '🌙' : '☀️'}
              </div>
            </button>
          </div>
        </Section>

        {/* Export CSV */}
        <Section title="Export CSV" icon="ti-file-spreadsheet" D={D}>
          <ExportCSV txs={txs} D={D} />
        </Section>

        {/* Hapus Data */}
        <Section title="Hapus Data" icon="ti-trash" D={D}>
          <p style={{ margin: '0 0 12px', fontSize: 13, color: D.textMuted }}>
            Hapus semua transaksi dan budget secara permanen. Data tidak bisa dipulihkan.
          </p>
          <DangerZone onDeleteAll={onDeleteAll} D={D} />
        </Section>

        {/* Logout */}
        <Section title="Sesi" icon="ti-logout" D={D}>
          <p style={{ margin: '0 0 12px', fontSize: 13, color: D.textMuted }}>
            Keluar dari akun ini. Data kamu tetap aman tersimpan di server.
          </p>
          <button onClick={onLogout} style={{ width: '100%', padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 700, background: D.outcome.dim, color: D.outcome.solid, border: `1.5px solid ${D.outcome.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <i className="ti ti-logout" style={{ fontSize: 15 }} />
            Keluar dari Akun
          </button>
        </Section>

        <p style={{ textAlign: 'center', fontSize: 11, color: D.textMuted, marginTop: 8, lineHeight: 1.7 }}>
          Keuanganku v4.0 · Fullstack · Data tersimpan di Supabase
        </p>
      </div>
    </div>
  )
}

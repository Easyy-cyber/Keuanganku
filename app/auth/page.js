'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const D = {
  bg:       '#0D0F1A',
  surface:  '#131525',
  surfaceUp:'#1A1D30',
  surfaceHi:'#20243A',
  border:   '#252840',
  borderHi: '#323660',
  textPri:  '#EEF0FF',
  textSec:  '#7B7FA0',
  textMuted:'#434668',
  accent:   '#818CF8',
  accentDim:'#1E2148',
  income:  { solid:'#34D399', dim:'#0D2E22', border:'#1A5C40' },
  outcome: { solid:'#FB7185', dim:'#2E0D16', border:'#5C1A26' },
}

export default function AuthPage() {
  const router = useRouter()
  const [mode,    setMode]    = useState('login') // login | register
  const [email,   setEmail]   = useState('')
  const [password,setPassword]= useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async () => {
    setError(''); setSuccess(''); setLoading(true)

    if (!email || !password) {
      setError('Email dan password wajib diisi'); setLoading(false); return
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter'); setLoading(false); return
    }

    if (mode === 'register') {
      const { error: err } = await supabase.auth.signUp({ email, password })
      if (err) { setError(err.message); setLoading(false); return }
      setSuccess('Akun berhasil dibuat! Silakan login.')
      setMode('login'); setPassword('')
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) { setError('Email atau password salah'); setLoading(false); return }
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: D.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: D.accentDim, border: '1.5px solid #3730A3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <i className="ti ti-wallet" style={{ fontSize: 28, color: D.accent }} />
          </div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: D.textPri }}>Keuanganku</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: D.textMuted }}>Manajemen keuangan pribadi</p>
        </div>

        {/* Card */}
        <div style={{ background: D.surface, borderRadius: 20, padding: 28, border: `1.5px solid ${D.borderHi}`, boxShadow: '0 0 40px rgba(129,140,248,0.08)' }}>

          {/* Tab */}
          <div style={{ display: 'flex', background: D.surfaceHi, borderRadius: 12, padding: 4, marginBottom: 24 }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }} style={{
                flex: 1, padding: '9px', borderRadius: 9, fontSize: 13, fontWeight: 700,
                background: mode === m ? D.accent : 'transparent',
                color: mode === m ? '#0D0F1A' : D.textSec,
                border: 'none', transition: 'all 0.15s',
                boxShadow: mode === m ? '0 0 14px rgba(129,140,248,0.3)' : 'none',
              }}>
                {m === 'login' ? 'Masuk' : 'Daftar'}
              </button>
            ))}
          </div>

          {/* Form */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: D.textMuted, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Email</label>
            <input
              type="email" placeholder="contoh@email.com"
              value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: D.textMuted, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Password</label>
            <input
              type="password" placeholder="Minimal 6 karakter"
              value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: D.outcome.dim, border: `1px solid ${D.outcome.border}`, borderRadius: 10, marginBottom: 16 }}>
              <i className="ti ti-alert-circle" style={{ fontSize: 14, color: D.outcome.solid, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: D.outcome.solid, fontWeight: 600 }}>{error}</span>
            </div>
          )}

          {/* Success */}
          {success && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: D.income.dim, border: `1px solid ${D.income.border}`, borderRadius: 10, marginBottom: 16 }}>
              <i className="ti ti-circle-check" style={{ fontSize: 14, color: D.income.solid, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: D.income.solid, fontWeight: 600 }}>{success}</span>
            </div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading} style={{
            width: '100%', padding: '14px', borderRadius: 12, fontSize: 14, fontWeight: 800,
            background: loading ? '#3730A3' : D.accent,
            color: '#0D0F1A', border: 'none',
            boxShadow: loading ? 'none' : '0 0 20px rgba(129,140,248,0.4)',
            transition: 'all 0.15s',
          }}>
            {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Buat Akun'}
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: D.textMuted }}>
          <i className="ti ti-lock" style={{ fontSize: 11, marginRight: 4 }} />
          Data kamu aman & terenkripsi
        </p>
      </div>
    </div>
  )
}

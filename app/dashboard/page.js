'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Dashboard  from '@/components/Dashboard'
import Analytics  from '@/components/Analytics'
import Budget     from '@/components/Budget'
import Settings   from '@/components/Settings'

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
}

/* ─── API Helper ─── */
async function apiFetch(path, method = 'GET', body = null) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  const res = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : null,
  })
  return res.json()
}

/* ─── Bottom Navigation ─── */
function BottomNav({ page, setPage }) {
  const items = [
    { id: 'dashboard', icon: 'ti-home-2',    label: 'Beranda'    },
    { id: 'analytics', icon: 'ti-chart-bar', label: 'Analitik'   },
    { id: 'budget',    icon: 'ti-target',    label: 'Budget'     },
    { id: 'settings',  icon: 'ti-settings',  label: 'Pengaturan' },
  ]
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: 'rgba(13,15,26,0.96)', backdropFilter: 'blur(16px)',
      borderTop: `1px solid ${D.border}`,
      display: 'flex', padding: '10px 0 12px',
    }}>
      {items.map(item => {
        const active = page === item.id
        return (
          <button key={item.id} onClick={() => setPage(item.id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            background: 'none', border: 'none', padding: '4px 0', cursor: 'pointer',
            color: active ? D.accent : D.textMuted, transition: 'color 0.15s',
          }}>
            <i className={`ti ${item.icon}`} style={{
              fontSize: 22,
              filter: active ? `drop-shadow(0 0 6px ${D.accent})` : 'none',
              transition: 'filter 0.15s',
            }} />
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, letterSpacing: '0.02em' }}>
              {item.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* ─── Dashboard Page ─── */
export default function DashboardPage() {
  const router  = useRouter()
  const [user,     setUser]     = useState(null)
  const [txs,      setTxs]      = useState([])
  const [budgets,  setBudgets]  = useState({})
  const [page,     setPage]     = useState('dashboard')
  const [loading,  setLoading]  = useState(true)

  /* Auth check */
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [txData, budgetData] = await Promise.all([
        apiFetch('/api/transactions'),
        apiFetch('/api/budgets'),
      ])
      if (Array.isArray(txData)) setTxs(txData)
      if (budgetData && !budgetData.error) setBudgets(budgetData)
    } catch (err) {
      console.error('loadData error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

    useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }
      setUser(session.user)
      loadData()
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session.user)
        loadData()
      }
      if (!session) router.push('/auth')
    })

    window.addEventListener('focus', loadData)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('focus', loadData)
    }
  }, [loadData])

  /* CRUD Transaksi */
  const addTx = async ({ amount, category, description }) => {
    try {
      const date = new Date().toISOString()
      const data = await apiFetch('/api/transactions', 'POST', { amount, category, description, date })
      if (data && !data.error) {
        setTxs(prev => [data, ...prev])
        router.refresh()
        return data.date.slice(0, 7)
      }
    } catch (err) {
      console.error('addTx error:', err)
    }
  }

  const updateTx = async (id, updates) => {
    const data = await apiFetch('/api/transactions', 'PUT', { id, ...updates })
    if (data && !data.error) {
      setTxs(prev => prev.map(t => t.id === id ? data : t))
    }
  }

  const deleteTx = async (id) => {
    await apiFetch('/api/transactions', 'DELETE', { id })
    setTxs(prev => prev.filter(t => t.id !== id))
  }

  const deleteAll = async () => {
    // Hapus semua transaksi satu per satu
    for (const tx of txs) {
      await apiFetch('/api/transactions', 'DELETE', { id: tx.id })
    }
    // Hapus semua budget sekaligus
    await apiFetch('/api/budgets', 'DELETE')
    
    // Reset state
    setTxs([])
    setBudgets({})
  }

  /* Budget */
  const saveBudget = async (key, amount) => {
    await apiFetch('/api/budgets', 'POST', { key, amount })
    setBudgets(prev => ({ ...prev, [key]: amount }))
  }

  /* Restore (Settings) */
  const handleRestore = async ({ transactions: newTxs, budgets: newBudgets }) => {
    if (newTxs) {
      // Hapus semua dulu lalu insert ulang
      for (const tx of txs) await apiFetch('/api/transactions', 'DELETE', { id: tx.id })
      const inserted = []
      for (const tx of newTxs) {
        const data = await apiFetch('/api/transactions', 'POST', {
          amount: tx.amount, category: tx.category,
          description: tx.description, date: tx.date,
        })
        if (data && !data.error) inserted.push(data)
      }
      setTxs(inserted)
    }
    if (newBudgets) {
      for (const [key, amount] of Object.entries(newBudgets)) {
        await saveBudget(key, amount)
      }
    }
  }

  /* Logout */
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: D.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, color: D.textMuted }}>
      <i className="ti ti-loader-2" style={{ fontSize: 32, color: D.accent }} />
      <span style={{ fontSize: 14 }}>Memuat data...</span>
    </div>
  )

  const shared = { txs, budgets, addTx, updateTx, deleteTx, saveBudget }

  return (
    <div style={{ background: D.bg, minHeight: '100vh', paddingBottom: 72 }}>
      {page === 'dashboard' && <Dashboard {...shared} />}
      {page === 'analytics' && <Analytics txs={txs} />}
      {page === 'budget'    && <Budget    {...shared} />}
      {page === 'settings'  && (
        <Settings
          txs={txs}
          budgets={budgets}
          onRestore={handleRestore}
          onLogout={handleLogout}
          onDeleteAll={deleteAll}
          userEmail={user?.email}
        />
      )}
      <BottomNav page={page} setPage={setPage} />
    </div>
  )
}

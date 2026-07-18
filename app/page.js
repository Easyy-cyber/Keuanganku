'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/dashboard')
      else router.push('/auth')
    })
  }, [router])

  return (
    <div style={{ minHeight: '100vh', background: '#0D0F1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#434668', flexDirection: 'column', gap: 14 }}>
      <i className="ti ti-loader-2" style={{ fontSize: 32, color: '#818CF8' }} />
      <span style={{ fontSize: 14 }}>Memuat...</span>
    </div>
  )
}

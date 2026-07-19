import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getSupabase(req) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
}

// GET — ambil semua budget user
export async function GET(req) {
  const supabase = getSupabase(req)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Ubah array jadi object { key: amount }
  const result = {}
  data.forEach(b => { result[b.key] = b.amount })
  return NextResponse.json(result)
}

// POST — set budget (upsert)
export async function POST(req) {
  const supabase = getSupabase(req)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { key, amount } = await req.json()
  const { data, error } = await supabase
    .from('budgets')
    .upsert({ user_id: user.id, key, amount }, { onConflict: 'user_id,key' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE — hapus semua budget user
export async function DELETE(req) {
  const supabase = getSupabase(req)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
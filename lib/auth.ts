import { NextResponse } from 'next/server'
import { createServerSupabase } from './supabase-auth'
import { supabaseAdmin } from './supabase'

export async function requireAuth() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) }
  }

  return { user, error: null }
}

export async function requireAdmin() {
  const auth = await requireAuth()
  if (auth.error) return auth

  const db = supabaseAdmin()
  const { data: profile } = await db
    .from('profiles')
    .select('role')
    .eq('id', auth.user!.id)
    .single()

  if (profile?.role !== 'admin') {
    return { user: null, error: NextResponse.json({ error: 'Admin access required' }, { status: 403 }) }
  }

  return auth
}

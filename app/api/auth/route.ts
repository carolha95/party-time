import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-auth'

export async function GET() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name')
    .eq('id', user.id)
    .single()

  return NextResponse.json({
    id: user.id,
    email: user.email,
    role: profile?.role || 'guest',
    display_name: profile?.display_name || user.email,
  })
}

export async function DELETE() {
  const supabase = await createServerSupabase()
  await supabase.auth.signOut()
  return NextResponse.json({ ok: true })
}

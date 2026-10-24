import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const { email, password, action } = await request.json()

  const db = supabaseAdmin()

  if (action === 'promote') {
    const { data: profiles } = await db
      .from('profiles')
      .select('id, role')
      .eq('role', 'admin')

    if (profiles && profiles.length > 0) {
      return NextResponse.json({ error: 'An admin already exists' }, { status: 403 })
    }

    const { data: { users } } = await db.auth.admin.listUsers()
    const user = users?.find(u => u.email === email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { error } = await db
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, message: 'Promoted to admin' })
  }

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  const { data: { users } } = await db.auth.admin.listUsers()
  if (users && users.length > 0) {
    return NextResponse.json({ error: 'Setup already completed. Use action: "promote" to promote an existing user.' }, { status: 403 })
  }

  const { data, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: email.split('@')[0] },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await db
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', data.user.id)

  return NextResponse.json({ ok: true, message: 'Admin account created. You can now sign in.' })
}

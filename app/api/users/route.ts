import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const db = supabaseAdmin()
  const { data: { users }, error } = await db.auth.admin.listUsers()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: profiles } = await db
    .from('profiles')
    .select('id, role, display_name')

  const profileMap = new Map((profiles || []).map(p => [p.id, p]))

  const result = users.map(u => {
    const profile = profileMap.get(u.id)
    return {
      id: u.id,
      email: u.email,
      display_name: profile?.display_name || u.email,
      role: profile?.role || 'guest',
      created_at: u.created_at,
    }
  })

  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { email, password, role, display_name } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  const validRoles = ['admin', 'host', 'guest']
  const userRole = validRoles.includes(role) ? role : 'guest'

  const db = supabaseAdmin()
  const { data, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: display_name || email.split('@')[0] },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (userRole !== 'guest') {
    await db
      .from('profiles')
      .update({ role: userRole, display_name: display_name || email.split('@')[0] })
      .eq('id', data.user.id)
  }

  return NextResponse.json({
    id: data.user.id,
    email: data.user.email,
    role: userRole,
    display_name: display_name || email.split('@')[0],
  }, { status: 201 })
}

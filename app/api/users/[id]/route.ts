import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { id } = await params
  const { role, display_name } = await request.json()

  const validRoles = ['admin', 'host', 'guest']
  const updates: Record<string, string> = {}

  if (role && validRoles.includes(role)) updates.role = role
  if (display_name !== undefined) updates.display_name = display_name

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const db = supabaseAdmin()
  const { error } = await db
    .from('profiles')
    .update(updates)
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { id } = await params

  if (id === auth.user!.id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
  }

  const db = supabaseAdmin()
  const { error } = await db.auth.admin.deleteUser(id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

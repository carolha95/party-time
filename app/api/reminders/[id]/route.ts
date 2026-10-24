import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, type Guest, type Event } from '@/lib/supabase'
import { twilioClient, twilioFrom } from '@/lib/twilio'
import { requireAuth } from '@/lib/auth'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const target: string = body.target || 'non_responders'

  const db = supabaseAdmin()

  const { data: event, error: eventError } = await db
    .from('events')
    .select('*')
    .eq('id', id)
    .single<Event>()

  if (eventError) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  let query = db.from('guests').select('*').eq('event_id', id)
  if (target === 'non_responders') query = query.eq('rsvp_status', 'pending')
  else if (target === 'attending') query = query.eq('rsvp_status', 'attending')

  const { data: guests, error: guestError } = await query
  if (guestError) return NextResponse.json({ error: guestError.message }, { status: 500 })

  const client = twilioClient()
  const from = twilioFrom()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'
  const results: { id: string; success: boolean; error?: string }[] = []

  for (const guest of (guests as Guest[])) {
    const link = `${baseUrl}/rsvp/${guest.invite_token}`
    const msg =
      target === 'attending'
        ? `Party Time: Hi ${guest.name}! Reminder — ${event.name} is on ${formatDate(event.date)}. See you there!`
        : `Party Time: Hi ${guest.name}! Reminder to RSVP for ${event.name} on ${formatDate(event.date)}: ${link}. Reply STOP to opt out.`

    try {
      await client.messages.create({ from, to: guest.phone, body: msg })
      results.push({ id: guest.id, success: true })
    } catch (err: unknown) {
      results.push({ id: guest.id, success: false, error: (err as Error).message })
    }
  }

  return NextResponse.json({ sent: results.filter((r) => r.success).length, results })
}

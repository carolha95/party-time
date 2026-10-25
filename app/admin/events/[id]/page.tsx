'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Event, Guest, RsvpStatus } from '@/lib/supabase'

function CopyLinkButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    const url = `${window.location.origin}/rsvp/${token}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      className="text-xs text-[#9BA3B5] hover:text-[#7C6E8A] transition-colors"
      title="Copy RSVP link"
    >
      {copied ? 'Copied' : 'Copy link'}
    </button>
  )
}

const STATUS_LABEL: Record<RsvpStatus, string> = {
  pending: 'Pending',
  attending: 'Attending',
  not_attending: 'Not Going',
  maybe: 'Maybe',
}

const STATUS_COLOR: Record<RsvpStatus, string> = {
  pending: 'bg-[#E8EAF0] text-[#9BA3B5]',
  attending: 'bg-[#E4EDE7] text-[#6D8B7A]',
  not_attending: 'bg-[#F5EAEA] text-[#C47A72]',
  maybe: 'bg-[#F5F0E0] text-[#B89B5A]',
}

function formatDateTime(dateStr: string, endTime?: string | null) {
  const start = new Date(dateStr).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
  return endTime ? `${start} – ${endTime}` : start
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [guestInput, setGuestInput] = useState('')
  const [addingGuests, setAddingGuests] = useState(false)
  const [sendingInvites, setSendingInvites] = useState(false)
  const [sendingReminder, setSendingReminder] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  async function loadData() {
    const [eventRes, guestsRes] = await Promise.all([
      fetch(`/api/events/${id}`),
      fetch(`/api/events/${id}/guests`),
    ])
    if (eventRes.ok) setEvent(await eventRes.json())
    if (guestsRes.ok) setGuests(await guestsRes.json())
    setLoading(false)
  }

  useEffect(() => { loadData() }, [id])

  function parseGuestInput(raw: string) {
    return raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split(/[,\t]+/).map((s) => s.trim())
        return { name: parts[0] || '', phone: parts[1] || '' }
      })
      .filter((g) => g.name && g.phone)
  }

  async function addGuests() {
    const parsed = parseGuestInput(guestInput)
    if (!parsed.length) return
    setAddingGuests(true)
    const res = await fetch('/api/guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: id, guests: parsed }),
    })
    if (res.ok) {
      setGuestInput('')
      await loadData()
      setMessage(`Added ${parsed.length} guest${parsed.length > 1 ? 's' : ''}`)
    }
    setAddingGuests(false)
  }

  async function sendInvites() {
    setSendingInvites(true)
    const res = await fetch(`/api/send-invites/${id}`, { method: 'POST' })
    const data = await res.json()
    setMessage(`Sent ${data.sent} invite${data.sent !== 1 ? 's' : ''}`)
    await loadData()
    setSendingInvites(false)
  }

  async function sendReminder(target: string) {
    setSendingReminder(target)
    const res = await fetch(`/api/reminders/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target }),
    })
    const data = await res.json()
    setMessage(`Sent ${data.sent} reminder${data.sent !== 1 ? 's' : ''}`)
    setSendingReminder(null)
  }

  const pending = guests.filter((g) => g.rsvp_status === 'pending')
  const attending = guests.filter((g) => g.rsvp_status === 'attending')
  const notAttending = guests.filter((g) => g.rsvp_status === 'not_attending')
  const maybe = guests.filter((g) => g.rsvp_status === 'maybe')
  const unsent = guests.filter((g) => !g.invite_sent_at)

  if (loading) return (
    <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center">
      <p className="font-[family-name:var(--font-display)] font-bold text-[#9BA3B5] italic">Loading...</p>
    </div>
  )
  if (!event) return (
    <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center">
      <p className="text-[#9BA3B5]">Event not found</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <header className="bg-white/80 backdrop-blur border-b border-[#E8EAF0] px-5 sm:px-8 py-4 sm:py-5 flex items-center gap-3">
        <Link href="/admin" className="text-[#9BA3B5] hover:text-[#1E2330] text-sm transition-colors">
          &larr; Events
        </Link>
        <span className="text-[#E8EAF0]">/</span>
        <span className="text-sm text-[#1E2330] truncate">{event.name}</span>
      </header>

      <main className="max-w-2xl mx-auto px-5 sm:px-6 py-10 sm:py-12 space-y-12">

        {/* Event header */}
        <section>
          {event.header_image_url && (
            <img
              src={event.header_image_url}
              alt=""
              className="w-full h-52 object-cover rounded-2xl mb-6"
            />
          )}
          <p className="text-[#7C6E8A] tracking-[0.2em] text-xs uppercase mb-1">{event.location}</p>
          <h2 className="font-[family-name:var(--font-display)] font-bold text-3xl sm:text-4xl text-[#1E2330]">{event.name}</h2>
          <p className="text-[#9BA3B5] font-light mt-1">{formatDateTime(event.date, event.end_time)}</p>
          {event.amazon_wishlist_url && (
            <a
              href={event.amazon_wishlist_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#7C6E8A] hover:text-[#5E4F6E] tracking-widest uppercase mt-3 inline-block underline underline-offset-4"
            >
              View Wishlist &rarr;
            </a>
          )}
        </section>

        {/* RSVP stats */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Attending', count: attending.length, bg: 'bg-[#E4EDE7]', text: 'text-[#6D8B7A]' },
            { label: 'Maybe', count: maybe.length, bg: 'bg-[#F5F0E0]', text: 'text-[#B89B5A]' },
            { label: 'Not Going', count: notAttending.length, bg: 'bg-[#F5EAEA]', text: 'text-[#C47A72]' },
            { label: 'Pending', count: pending.length, bg: 'bg-[#E8EAF0]', text: 'text-[#9BA3B5]' },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl p-4 text-center ${s.bg}`}>
              <p className={`text-3xl font-[family-name:var(--font-display)] font-bold ${s.text}`}>{s.count}</p>
              <p className={`text-xs mt-1 tracking-wide ${s.text}`}>{s.label}</p>
            </div>
          ))}
        </section>

        {/* Actions */}
        <section className="flex flex-wrap gap-3">
          <button
            onClick={sendInvites}
            disabled={sendingInvites || unsent.length === 0}
            className="px-5 py-2.5 bg-[#1E2330] text-white rounded-full text-xs tracking-widest uppercase hover:bg-[#3A3F50] disabled:opacity-40 transition-colors"
          >
            {sendingInvites ? 'Sending...' : `Send Invites (${unsent.length} unsent)`}
          </button>
          <button
            onClick={() => sendReminder('non_responders')}
            disabled={sendingReminder !== null || pending.length === 0}
            className="px-5 py-2.5 bg-white border border-[#E8EAF0] text-[#3A3F50] rounded-full text-xs tracking-widest uppercase hover:border-[#7C6E8A] hover:text-[#7C6E8A] disabled:opacity-40 transition-colors"
          >
            {sendingReminder === 'non_responders' ? 'Sending...' : `Nudge Non-Responders (${pending.length})`}
          </button>
          <button
            onClick={() => sendReminder('attending')}
            disabled={sendingReminder !== null || attending.length === 0}
            className="px-5 py-2.5 bg-white border border-[#E8EAF0] text-[#3A3F50] rounded-full text-xs tracking-widest uppercase hover:border-[#7C6E8A] hover:text-[#7C6E8A] disabled:opacity-40 transition-colors"
          >
            {sendingReminder === 'attending' ? 'Sending...' : `Remind Attendees (${attending.length})`}
          </button>
        </section>

        {message && (
          <p className="text-sm text-[#6D8B7A] bg-[#E4EDE7] px-5 py-3 rounded-xl">{message}</p>
        )}

        {/* Add guests */}
        <section>
          <p className="text-[#7C6E8A] tracking-[0.2em] text-xs uppercase mb-2">Add Guests</p>
          <p className="text-xs text-[#9BA3B5] mb-3">One per line &mdash; Name, Phone Number</p>
          <textarea
            value={guestInput}
            onChange={(e) => setGuestInput(e.target.value)}
            placeholder={"Sarah Johnson, +15555550100\nEmily Davis, +15555550101"}
            rows={4}
            className="w-full px-5 py-4 bg-white border border-[#E8EAF0] rounded-2xl text-[#1E2330] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#7C6E8A]/20 focus:border-[#7C6E8A] transition-colors resize-none"
          />
          <button
            onClick={addGuests}
            disabled={addingGuests || !guestInput.trim()}
            className="mt-3 px-6 py-2.5 bg-[#1E2330] text-white rounded-full text-xs tracking-widest uppercase hover:bg-[#3A3F50] disabled:opacity-40 transition-colors"
          >
            {addingGuests ? 'Adding...' : 'Add Guests'}
          </button>
        </section>

        {/* Guest list */}
        {guests.length > 0 && (
          <section>
            <p className="text-[#7C6E8A] tracking-[0.2em] text-xs uppercase mb-4">
              Guest List <span className="text-[#9BA3B5]">({guests.length})</span>
            </p>
            <div className="bg-white border border-[#E8EAF0] rounded-2xl divide-y divide-[#F0F1F4]">
              {guests.map((g) => (
                <div key={g.id} className="flex items-center justify-between px-5 sm:px-6 py-4">
                  <div className="min-w-0 mr-3">
                    <p className="font-[family-name:var(--font-display)] font-bold text-[#1E2330] truncate">{g.name}</p>
                    <p className="text-xs text-[#9BA3B5] mt-0.5">{g.phone}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {g.invite_sent_at && (
                      <span className="text-xs text-[#9BA3B5]">Invited</span>
                    )}
                    <span className={`text-xs px-4 py-2 rounded-full ${STATUS_COLOR[g.rsvp_status]}`}>
                      {STATUS_LABEL[g.rsvp_status]}
                    </span>
                    <CopyLinkButton token={g.invite_token} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

'use client'

import { use, useEffect, useState, useCallback } from 'react'
import { Confetti } from './confetti'
import { Reveal } from './reveal'
import './invite.css'

interface EventData {
  name: string
  date: string
  end_time: string | null
  location: string
  header_image_url: string | null
  amazon_wishlist_url: string | null
  tagline: string | null
  dress_code: string | null
  host_note: string | null
  accent_color: string | null
}

interface RsvpData {
  id: string
  name: string
  rsvp_status: string
  guest_count: number | null
  rsvp_note: string | null
  events: EventData
}

const ACCENTS: Record<string, { ink: string; soft: string }> = {
  '#2C7A5E': { ink: '#21604A', soft: '#E7F1EC' },
  '#CE6150': { ink: '#A8472F', soft: '#FBEAE6' },
  '#3F6FB0': { ink: '#2C5288', soft: '#E9EFF8' },
  '#B5872A': { ink: '#8A661D', soft: '#F6EFDD' },
}
const DEFAULT_ACCENT = '#2C7A5E'

const MOCK_DATA: RsvpData = {
  id: 'mock',
  name: 'Felipe & Olivia',
  rsvp_status: 'pending',
  guest_count: null,
  rsvp_note: null,
  events: {
    name: 'Party Animals Birthday Bash',
    date: new Date(Date.now() + 14 * 86400000).toISOString(),
    end_time: '5:00 PM',
    location: 'The Backyard Garden, 123 Oak Lane, Austin TX',
    header_image_url: null,
    amazon_wishlist_url: null,
    tagline: 'Two laps around the sun call for twice the fun',
    dress_code: 'Casual festive',
    host_note: 'Parking available on Oak Lane. Kids welcome!',
    accent_color: '#2C7A5E',
  },
}

function getAccent(color: string | null | undefined) {
  const c = color || DEFAULT_ACCENT
  const f = ACCENTS[c] || ACCENTS[DEFAULT_ACCENT]
  return { accent: c, ink: f.ink, soft: f.soft }
}

function dateParts(iso: string) {
  const d = new Date(iso)
  return {
    day: d.toLocaleDateString('en-US', { weekday: 'long' }),
    date: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  }
}

function calLink(ev: EventData) {
  const s = new Date(ev.date)
  const e = new Date(s.getTime() + 3 * 3600000)
  const f = (d: Date) => {
    const p = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`
  }
  return (
    'https://calendar.google.com/calendar/render?action=TEMPLATE&' +
    new URLSearchParams({ text: ev.name, dates: `${f(s)}/${f(e)}`, location: ev.location, details: ev.tagline || '' })
  )
}

function mapLink(loc: string) {
  return 'https://maps.google.com/?q=' + encodeURIComponent(loc)
}

export default function RsvpPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [data, setData] = useState<RsvpData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [celebrate, setCelebrate] = useState(0)

  const [choice, setChoice] = useState<'yes' | 'no' | null>(null)
  const [guestCount, setGuestCount] = useState(1)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetch(`/api/rsvp/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error('not found')
        return r.json()
      })
      .then((d) => {
        setData(d)
        if (d.rsvp_status !== 'pending') {
          setSubmitted(true)
          setChoice(d.rsvp_status === 'not_attending' ? 'no' : 'yes')
          if (d.guest_count) setGuestCount(d.guest_count)
          if (d.rsvp_note) setNote(d.rsvp_note)
        } else {
          setTimeout(() => setShowConfetti(true), 300)
        }
      })
      .catch(() => {
        if (process.env.NODE_ENV === 'development') {
          setData(MOCK_DATA)
          setTimeout(() => setShowConfetti(true), 300)
        } else {
          setNotFound(true)
        }
      })
      .finally(() => setLoading(false))
  }, [token])

  const handleConfettiDone = useCallback(() => setShowConfetti(false), [])
  const handleCelebrateDone = useCallback(() => setCelebrate(0), [])

  async function submitRsvp() {
    if (!choice) return
    setSubmitting(true)
    const res = await fetch(`/api/rsvp/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: choice === 'yes' ? 'attending' : 'not_attending',
        guest_count: choice === 'yes' ? guestCount : null,
        note: note.trim() || null,
      }),
    })
    if (res.ok) {
      const updated = await res.json()
      setData(updated)
      setSubmitted(true)
      if (choice === 'yes') setCelebrate((n) => n + 1)
    }
    setSubmitting(false)
  }

  function resetRsvp() {
    setSubmitted(false)
    setChoice(null)
    setGuestCount(1)
    setNote('')
  }

  if (loading) {
    return (
      <div className="invite-wrap">
        <div className="invite-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <p style={{ color: '#8C8E96', fontWeight: 500, fontSize: 15 }}>One moment&hellip;</p>
        </div>
      </div>
    )
  }

  if (notFound || !data) {
    return (
      <div className="invite-wrap">
        <div
          className="invite-page"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: 24 }}
        >
          <p style={{ fontSize: 24, fontWeight: 800, color: '#15161A', marginBottom: 8 }}>Invite not found</p>
          <p style={{ fontSize: 14, color: '#6A6C73' }}>This link may be invalid or expired.</p>
        </div>
      </div>
    )
  }

  const event = data.events
  const { accent, ink, soft } = getAccent(event.accent_color)
  const dp = dateParts(event.date)
  const locParts = event.location.split(',')
  const venue = locParts[0].trim()
  const city = locParts.length > 1 ? locParts.slice(1).join(',').trim() : null
  const hasDetails = event.dress_code || event.host_note

  return (
    <div className="invite-wrap">
      <div className="invite-page" style={{ '--accent': accent, '--accent-ink': ink, '--accent-soft': soft } as React.CSSProperties}>
        <Confetti play={showConfetti} kind="stars" accent={accent} onDone={handleConfettiDone} />
        {celebrate > 0 && <Confetti key={'c' + celebrate} play dense kind="stars" accent={accent} onDone={handleCelebrateDone} />}

        {/* Hero */}
        {event.header_image_url ? (
          <div className="hero">
            <img src={event.header_image_url} alt="" className="art" />
          </div>
        ) : (
          <div className="hero-fallback" />
        )}

        {/* Title */}
        <Reveal className="title-blk" delay={80}>
          <p className="eyebrow">You&apos;re invited</p>
          <h1 className="ev-name">{event.name}</h1>
          {event.tagline && <p className="ev-tag">{event.tagline}</p>}
        </Reveal>

        {/* When */}
        <Reveal className="when" delay={160}>
          <p className="meta-lbl">When</p>
          <div className="when-grid">
            <div className="when-cell">
              <span className="when-big" style={{ color: ink }}>{dp.day}</span>
              <span className="when-sub">{dp.date}</span>
            </div>
            <div className="when-div" />
            <div className="when-cell">
              <span className="when-big" style={{ color: ink }}>{dp.time}</span>
              {event.end_time && <span className="when-sub">Until {event.end_time}</span>}
            </div>
          </div>
          <a className="ghost-btn" href={calLink(event)} target="_blank" rel="noopener noreferrer">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Add to calendar
          </a>
        </Reveal>

        {/* Where */}
        <Reveal className="meta-section" delay={120}>
          <p className="meta-lbl">Where</p>
          <p className="meta-big" style={{ color: ink }}>{venue}</p>
          {city && <p className="meta-sub">{city}</p>}
          <a className="ghost-btn" href={mapLink(event.location)} target="_blank" rel="noopener noreferrer">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Get directions
          </a>
        </Reveal>

        {/* Details */}
        {hasDetails && (
          <Reveal className="details">
            <p className="meta-lbl">Good to know</p>
            {event.dress_code && (
              <div className="d-row">
                <span className="d-k">Dress</span>
                <span className="d-v">{event.dress_code}</span>
              </div>
            )}
            {event.host_note && (
              <div className="d-row">
                <span className="d-k">Note</span>
                <span className="d-v">{event.host_note}</span>
              </div>
            )}
          </Reveal>
        )}

        {/* RSVP */}
        <Reveal className="rsvp-blk">
          <p className="meta-lbl">Will you be there?</p>

          {submitted ? (
            <div className="rsvp-done">
              <div className="rsvp-done-mark" style={{ color: accent }}>
                {choice === 'yes' ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                )}
              </div>
              <p className="rsvp-done-lead">
                {choice === 'yes' ? "You’re on the list" : "Sorry you’ll miss it"}
                {data.name ? `, ${data.name.split(' ')[0]}` : ''}.
              </p>
              <p className="rsvp-done-sub">
                {choice === 'yes'
                  ? `${guestCount} ${guestCount > 1 ? 'guests' : 'guest'} · we can’t wait to see you.`
                  : 'Thanks for letting the host know.'}
              </p>
              {event.amazon_wishlist_url && choice === 'yes' && (
                <a href={event.amazon_wishlist_url} target="_blank" rel="noopener noreferrer" className="ghost-btn" style={{ marginBottom: 16 }}>
                  View the Wishlist
                </a>
              )}
              <button className="link-btn" onClick={resetRsvp}>
                Change response
              </button>
            </div>
          ) : (
            <>
              <div className="seg" role="group" aria-label="RSVP">
                <button
                  className={'seg-btn' + (choice === 'yes' ? ' on' : '')}
                  style={choice === 'yes' ? { background: accent, borderColor: accent, color: '#fff' } : undefined}
                  onClick={() => setChoice('yes')}
                >
                  Yes
                </button>
                <button
                  className={'seg-btn' + (choice === 'no' ? ' on' : '')}
                  style={choice === 'no' ? { background: accent, borderColor: accent, color: '#fff' } : undefined}
                  onClick={() => setChoice('no')}
                >
                  No
                </button>
              </div>

              <div className={'rsvp-form' + (choice ? ' open' : '')}>
                <div className="rsvp-form-inner">
                  {choice === 'yes' && (
                    <label className="fld">
                      <span className="fld-lbl">Guests in your party</span>
                      <div className="stepper">
                        <button type="button" onClick={() => setGuestCount((c) => Math.max(1, c - 1))} aria-label="fewer">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        </button>
                        <span>{guestCount}</span>
                        <button type="button" onClick={() => setGuestCount((c) => Math.min(8, c + 1))} aria-label="more">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        </button>
                      </div>
                    </label>
                  )}

                  <label className="fld">
                    <span className="fld-lbl">
                      {choice === 'no' ? 'Leave a note' : 'Note to the host'} <em>optional</em>
                    </span>
                    <textarea
                      className="fld-in"
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={choice === 'no' ? 'Wish we could make it…' : 'Dietary needs, a question…'}
                    />
                  </label>

                  <button className="cta" style={{ background: accent }} disabled={!choice || submitting} onClick={submitRsvp}>
                    Send RSVP
                  </button>
                </div>
              </div>
            </>
          )}
        </Reveal>

        {/* Footer */}
        <Reveal className="foot">
          <span className="foot-mark">
            party<span style={{ color: accent }}>&middot;</span>time
          </span>
        </Reveal>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AdminHeader } from '@/components/admin-header'
import type { Event } from '@/lib/supabase'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/events')
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setEvents(d) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <AdminHeader currentPage="events" />

      <main className="max-w-2xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[#7C6E8A] tracking-[0.2em] text-xs uppercase mb-1">Your</p>
            <h2 className="font-[family-name:var(--font-display)] font-bold text-4xl text-[#1E2330]">Events</h2>
          </div>
          <Link
            href="/admin/events/new"
            className="px-5 sm:px-6 py-2.5 bg-[#1E2330] text-white rounded-full text-xs tracking-widest uppercase hover:bg-[#3A3F50] transition-colors"
          >
            + New Event
          </Link>
        </div>

        {loading ? (
          <p className="text-[#9BA3B5] text-center py-20 font-[family-name:var(--font-display)] font-bold italic">Loading...</p>
        ) : events.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-[family-name:var(--font-display)] font-bold text-2xl text-[#9BA3B5] italic mb-2">No events yet</p>
            <p className="text-sm text-[#9BA3B5]">Create your first event to get started</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {events.map((event) => (
              <li key={event.id}>
                <Link
                  href={`/admin/events/${event.id}`}
                  className="group flex items-center justify-between bg-white border border-[#E8EAF0] rounded-2xl px-6 sm:px-7 py-5 hover:border-[#7C6E8A] hover:shadow-sm transition-all"
                >
                  <div className="min-w-0 mr-3">
                    <p className="font-[family-name:var(--font-display)] font-bold text-lg text-[#1E2330] group-hover:text-[#7C6E8A] transition-colors">
                      {event.name}
                    </p>
                    <p className="text-sm text-[#9BA3B5] mt-0.5 font-light truncate">
                      {formatDate(event.date)} &middot; {event.location}
                    </p>
                  </div>
                  <span className="text-[#C5CDD8] group-hover:text-[#7C6E8A] transition-colors text-lg shrink-0">&rarr;</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}

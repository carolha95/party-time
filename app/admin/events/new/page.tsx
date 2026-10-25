'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

function to24h(time: string): string {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return time
  let hours = parseInt(match[1])
  const minutes = match[2]
  const meridiem = match[3].toUpperCase()
  if (meridiem === 'AM' && hours === 12) hours = 0
  if (meridiem === 'PM' && hours !== 12) hours += 12
  return `${String(hours).padStart(2, '0')}:${minutes}`
}

export default function NewEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    header_image_url: '',
    amazon_wishlist_url: '',
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImagePreview(URL.createObjectURL(file))
    setUploading(true)
    setError('')

    const fd = new FormData()
    fd.append('file', file)

    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()

    if (res.ok) {
      set('header_image_url', data.url)
    } else {
      setError(data.error || 'Image upload failed')
      setImagePreview(null)
    }
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (uploading) return
    setLoading(true)
    setError('')

    const date = form.start_time
      ? new Date(`${form.date}T${to24h(form.start_time)}`).toISOString()
      : new Date(form.date).toISOString()

    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, date, end_time: form.end_time || null }),
    })

    if (res.ok) {
      const event = await res.json()
      router.push(`/admin/events/${event.id}`)
    } else {
      const data = await res.json()
      setError(data.error || 'Something went wrong')
      setLoading(false)
    }
  }

  const inputClass = "w-full px-5 py-3.5 bg-white border border-[#E8EAF0] rounded-xl text-[#1E2330] placeholder-[#9BA3B5] focus:outline-none focus:ring-2 focus:ring-[#7C6E8A]/20 focus:border-[#7C6E8A] transition-colors font-light"
  const labelClass = "block text-xs tracking-widest uppercase text-[#7C6E8A] mb-2"

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <header className="bg-white/80 backdrop-blur border-b border-[#E8EAF0] px-5 sm:px-8 py-4 sm:py-5 flex items-center gap-3">
        <Link href="/admin" className="text-[#9BA3B5] hover:text-[#1E2330] text-sm transition-colors">
          &larr; Events
        </Link>
        <span className="text-[#E8EAF0]">/</span>
        <span className="text-sm text-[#1E2330]">New Event</span>
      </header>

      <main className="max-w-lg mx-auto px-5 sm:px-6 py-10 sm:py-14">
        <p className="text-[#7C6E8A] tracking-[0.2em] text-xs uppercase mb-2">Plan something beautiful</p>
        <h2 className="font-[family-name:var(--font-display)] text-4xl text-[#1E2330] mb-10">New Event</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={labelClass}>Event Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Emma's Baby Shower"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Date *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Time *</label>
              <input
                type="text"
                value={form.start_time}
                onChange={(e) => set('start_time', e.target.value)}
                placeholder="3:00 PM"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>End Time</label>
              <input
                type="text"
                value={form.end_time}
                onChange={(e) => set('end_time', e.target.value)}
                placeholder="6:00 PM"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Location *</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="The Garden at Rosewood Estate"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Header Image</label>
            <p className="text-xs text-[#9BA3B5] mb-3">
              Best at <span className="text-[#7C6E8A]">1600 x 600 px</span> (landscape, 8:3 ratio) &mdash;
              at least 1200 px wide. JPEG or PNG.
            </p>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Header preview"
                  className="w-full h-40 object-cover rounded-2xl"
                />
                <div className="absolute inset-0 rounded-2xl bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="px-4 py-2 bg-white text-[#1E2330] rounded-full text-xs tracking-widest uppercase"
                  >
                    {uploading ? 'Uploading...' : 'Change'}
                  </button>
                </div>
                {uploading && (
                  <div className="absolute inset-0 rounded-2xl bg-white/60 flex items-center justify-center">
                    <p className="text-xs text-[#7C6E8A] tracking-widest uppercase">Uploading...</p>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full h-36 border-2 border-dashed border-[#E8EAF0] rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-[#7C6E8A] hover:bg-white transition-colors group"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9BA3B5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-[#7C6E8A] transition-colors">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
                <span className="text-xs text-[#9BA3B5] group-hover:text-[#7C6E8A] tracking-widest uppercase transition-colors">
                  Upload Photo
                </span>
              </button>
            )}
          </div>

          <div>
            <label className={labelClass}>Amazon Wishlist URL</label>
            <input
              type="url"
              value={form.amazon_wishlist_url}
              onChange={(e) => set('amazon_wishlist_url', e.target.value)}
              placeholder="https://amazon.com/hz/wishlist/..."
              className={inputClass}
            />
          </div>

          {error && <p className="text-[#C47A72] text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full py-4 bg-[#1E2330] text-white rounded-full font-light tracking-widest text-sm uppercase hover:bg-[#3A3F50] disabled:opacity-50 transition-colors mt-2"
          >
            {loading ? 'Creating...' : uploading ? 'Waiting for upload...' : 'Create Event'}
          </button>
        </form>
      </main>
    </div>
  )
}

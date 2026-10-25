'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface User {
  id: string
  email: string
  display_name: string
  role: 'admin' | 'host' | 'guest'
  created_at: string
}

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin',
  host: 'Host',
  guest: 'Guest',
}

const ROLE_STYLE: Record<string, string> = {
  admin: 'bg-[#EDE6F2] text-[#7C6E8A]',
  host: 'bg-[#E4EDE7] text-[#6D8B7A]',
  guest: 'bg-[#E8EAF0] text-[#9BA3B5]',
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', display_name: '', role: 'guest' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function loadUsers() {
    const res = await fetch('/api/users')
    if (res.ok) setUsers(await res.json())
    setLoading(false)
  }

  useEffect(() => { loadUsers() }, [])

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      setForm({ email: '', password: '', display_name: '', role: 'guest' })
      setShowForm(false)
      setMessage('User created')
      await loadUsers()
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to create user')
    }
    setSaving(false)
  }

  async function updateRole(id: string, role: string) {
    await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    await loadUsers()
  }

  async function deleteUser(id: string, email: string) {
    if (!confirm(`Remove ${email}? This cannot be undone.`)) return

    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setMessage('User removed')
      await loadUsers()
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to remove user')
    }
  }

  const inputClass = "w-full px-5 py-3.5 bg-white border border-[#E8EAF0] rounded-xl text-[#1E2330] placeholder-[#9BA3B5] focus:outline-none focus:ring-2 focus:ring-[#7C6E8A]/20 focus:border-[#7C6E8A] transition-colors font-light"
  const labelClass = "block text-xs tracking-widest uppercase text-[#7C6E8A] mb-2"

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <header className="bg-white/80 backdrop-blur border-b border-[#E8EAF0] px-5 sm:px-8 py-4 sm:py-5 flex items-center gap-3">
        <Link href="/admin" className="text-[#9BA3B5] hover:text-[#1E2330] text-sm transition-colors">
          &larr; Dashboard
        </Link>
        <span className="text-[#E8EAF0]">/</span>
        <span className="text-sm text-[#1E2330]">Users</span>
      </header>

      <main className="max-w-2xl mx-auto px-5 sm:px-6 py-10 sm:py-12">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[#7C6E8A] tracking-[0.2em] text-xs uppercase mb-1">Manage</p>
            <h2 className="font-[family-name:var(--font-display)] text-4xl text-[#1E2330]">Users</h2>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setError('') }}
            className="px-5 sm:px-6 py-2.5 bg-[#1E2330] text-white rounded-full text-xs tracking-widest uppercase hover:bg-[#3A3F50] transition-colors"
          >
            {showForm ? 'Cancel' : '+ Add User'}
          </button>
        </div>

        {message && (
          <p className="text-sm text-[#6D8B7A] bg-[#E4EDE7] px-5 py-3 rounded-xl mb-6">{message}</p>
        )}

        {showForm && (
          <form onSubmit={createUser} className="bg-white border border-[#E8EAF0] rounded-2xl p-6 sm:p-7 mb-8 space-y-5">
            <div>
              <label className={labelClass}>Display Name</label>
              <input
                type="text"
                placeholder="Carolina"
                value={form.display_name}
                onChange={(e) => setForm(f => ({ ...f, display_name: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input
                type="email"
                placeholder="carolina@example.com"
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Password *</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                required
                minLength={6}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
                className={inputClass}
              >
                <option value="guest">Guest</option>
                <option value="host">Host</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {error && <p className="text-[#C47A72] text-sm">{error}</p>}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 bg-[#1E2330] text-white rounded-full font-light tracking-widest text-sm uppercase hover:bg-[#3A3F50] disabled:opacity-50 transition-colors"
            >
              {saving ? 'Creating...' : 'Create User'}
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-[#9BA3B5] text-center py-20 font-[family-name:var(--font-display)] italic">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-center py-24 font-[family-name:var(--font-display)] text-2xl text-[#9BA3B5] italic">No users yet</p>
        ) : (
          <div className="bg-white border border-[#E8EAF0] rounded-2xl divide-y divide-[#F0F1F4]">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5">
                <div className="min-w-0 mr-3">
                  <p className="font-[family-name:var(--font-display)] text-[#1E2330] truncate">{user.display_name}</p>
                  <p className="text-xs text-[#9BA3B5] mt-0.5 truncate">{user.email}</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <select
                    value={user.role}
                    onChange={(e) => updateRole(user.id, e.target.value)}
                    className={`text-xs pl-4 pr-7 py-2 rounded-full border-0 cursor-pointer appearance-none bg-[length:12px] bg-[right_8px_center] bg-no-repeat ${ROLE_STYLE[user.role]}`}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M3 5l3 3 3-3' fill='none' stroke='%239BA3B5' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")` }}
                  >
                    <option value="guest">Guest</option>
                    <option value="host">Host</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={() => deleteUser(user.id, user.email)}
                    className="text-xs text-[#9BA3B5] hover:text-[#C47A72] transition-colors"
                    title="Remove user"
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

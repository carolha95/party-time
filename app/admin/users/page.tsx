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
  admin: 'bg-[#FBF0EE] text-[#C4826A]',
  host: 'bg-[#EAF2EA] text-[#5A8C5A]',
  guest: 'bg-[#F5F0EB] text-[#C4A090]',
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

  const inputClass = "w-full px-5 py-3.5 bg-white border border-[#EDE0D6] rounded-xl text-[#3D3530] placeholder-[#C4A090] focus:outline-none focus:ring-2 focus:ring-[#C4826A]/20 focus:border-[#C4826A] transition-colors font-lato font-light"
  const labelClass = "block text-xs font-lato tracking-widest uppercase text-[#C4826A] mb-2"

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <header className="bg-white/80 backdrop-blur border-b border-[#EDE0D6] px-8 py-5 flex items-center gap-3">
        <Link href="/admin" className="text-[#C4A090] hover:text-[#C4826A] text-sm font-lato transition-colors">
          &larr; Dashboard
        </Link>
        <span className="text-[#EDE0D6]">/</span>
        <span className="text-sm text-[#3D3530] font-lato">Users</span>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[#C4826A] tracking-[0.2em] text-xs uppercase mb-1">Manage</p>
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl text-[#3D3530]">Users</h2>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setError('') }}
            className="px-6 py-2.5 bg-[#C4826A] text-white rounded-full text-xs font-lato tracking-widest uppercase hover:bg-[#A6614C] transition-colors"
          >
            {showForm ? 'Cancel' : '+ Add User'}
          </button>
        </div>

        {message && (
          <p className="text-sm text-[#5A8C5A] bg-[#EAF2EA] px-5 py-3 rounded-xl font-lato mb-6">{message}</p>
        )}

        {showForm && (
          <form onSubmit={createUser} className="bg-white border border-[#EDE0D6] rounded-2xl p-7 mb-8 space-y-5">
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
            {error && <p className="text-[#C4826A] text-sm font-lato">{error}</p>}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 bg-[#C4826A] text-white rounded-full font-lato font-light tracking-widest text-sm uppercase hover:bg-[#A6614C] disabled:opacity-50 transition-colors"
            >
              {saving ? 'Creating...' : 'Create User'}
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-[#C4A090] text-center py-20 font-[family-name:var(--font-playfair)] italic">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-center py-24 font-[family-name:var(--font-playfair)] text-2xl text-[#C4A090] italic">No users yet</p>
        ) : (
          <div className="bg-white border border-[#EDE0D6] rounded-2xl divide-y divide-[#F5EFE9]">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between px-6 py-5">
                <div>
                  <p className="font-[family-name:var(--font-playfair)] text-[#3D3530]">{user.display_name}</p>
                  <p className="text-xs text-[#C4A090] font-lato mt-0.5">{user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={user.role}
                    onChange={(e) => updateRole(user.id, e.target.value)}
                    className={`text-xs px-3 py-1.5 rounded-full font-lato border-0 cursor-pointer ${ROLE_STYLE[user.role]}`}
                  >
                    <option value="guest">Guest</option>
                    <option value="host">Host</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={() => deleteUser(user.id, user.email)}
                    className="text-xs text-[#C4A090] hover:text-[#C4826A] font-lato transition-colors"
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

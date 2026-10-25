'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export function AdminHeader({ currentPage }: { currentPage?: string }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <header className="bg-white/80 backdrop-blur border-b border-[#E8EAF0] px-5 sm:px-8 py-4 sm:py-5">
      <div className="flex items-center justify-between">
        <Link href="/admin" className="font-[family-name:var(--font-script)] text-2xl text-[#1E2330]">
          party<span className="text-[#7C6E8A]">.</span>time
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-5">
          <Link
            href="/admin"
            className={`text-xs tracking-widest uppercase transition-colors ${currentPage === 'events' ? 'text-[#1E2330] font-medium' : 'text-[#9BA3B5] hover:text-[#1E2330]'}`}
          >
            Events
          </Link>
          <Link
            href="/admin/users"
            className={`text-xs tracking-widest uppercase transition-colors ${currentPage === 'users' ? 'text-[#1E2330] font-medium' : 'text-[#9BA3B5] hover:text-[#1E2330]'}`}
          >
            Users
          </Link>
          <button onClick={logout} className="text-xs text-[#7C6E8A] hover:text-[#5E4F6E] tracking-widest uppercase transition-colors">
            Sign out
          </button>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5"
          aria-label="Menu"
        >
          <span className={`block w-5 h-0.5 bg-[#1E2330] transition-all ${menuOpen ? 'rotate-45 translate-y-1' : ''}`} />
          <span className={`block w-5 h-0.5 bg-[#1E2330] transition-all ${menuOpen ? '-rotate-45 -translate-y-1' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="sm:hidden pt-4 pb-2 space-y-3 border-t border-[#E8EAF0] mt-4">
          <Link
            href="/admin"
            className="block text-sm text-[#1E2330] hover:text-[#7C6E8A] transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Events
          </Link>
          <Link
            href="/admin/users"
            className="block text-sm text-[#1E2330] hover:text-[#7C6E8A] transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Users
          </Link>
          <button onClick={logout} className="block text-sm text-[#7C6E8A] hover:text-[#5E4F6E] transition-colors">
            Sign out
          </button>
        </nav>
      )}
    </header>
  )
}

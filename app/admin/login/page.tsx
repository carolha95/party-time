'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [message, setMessage] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const supabase = createClient()

    if (mode === 'signup') {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: email.split('@')[0] } },
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      setMessage('Account created! You can now sign in.')
      setMode('login')
      setLoading(false)
      return
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <p className="text-[#7C6E8A] tracking-[0.2em] text-xs uppercase mb-3">
          {mode === 'login' ? 'Welcome back' : 'Get started'}
        </p>
        <h1 className="font-[family-name:var(--font-script)] text-5xl text-[#1E2330] mb-1">
          party<span className="text-[#7C6E8A]">.</span>time
        </h1>
        <div className="mb-10" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-3.5 bg-white border border-[#E8EAF0] rounded-full text-[#1E2330] placeholder-[#9BA3B5] focus:outline-none focus:ring-2 focus:ring-[#7C6E8A]/25 text-center tracking-wide"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-3.5 bg-white border border-[#E8EAF0] rounded-full text-[#1E2330] placeholder-[#9BA3B5] focus:outline-none focus:ring-2 focus:ring-[#7C6E8A]/25 text-center tracking-widest"
            required
            minLength={6}
          />
          {error && <p className="text-[#C47A72] text-sm">{error}</p>}
          {message && <p className="text-[#6D8B7A] text-sm">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#1E2330] text-white rounded-full font-light tracking-widest text-sm uppercase hover:bg-[#3A3F50] disabled:opacity-50 transition-colors"
          >
            {loading ? 'One moment...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage('') }}
          className="mt-6 text-xs text-[#9BA3B5] hover:text-[#7C6E8A] transition-colors"
        >
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}

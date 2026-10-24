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
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <p className="text-[#C4826A] tracking-[0.2em] text-xs uppercase font-lato mb-3">
          {mode === 'login' ? 'Welcome back' : 'Get started'}
        </p>
        <h1 className="font-[family-name:var(--font-playfair)] text-4xl text-[#3D3530] mb-10">Party Time</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-3.5 bg-white border border-[#E8C5B8] rounded-full text-[#3D3530] placeholder-[#C4A090] focus:outline-none focus:ring-2 focus:ring-[#C4826A]/30 text-center tracking-wide"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-3.5 bg-white border border-[#E8C5B8] rounded-full text-[#3D3530] placeholder-[#C4A090] focus:outline-none focus:ring-2 focus:ring-[#C4826A]/30 text-center tracking-widest"
            required
            minLength={6}
          />
          {error && <p className="text-[#C4826A] text-sm">{error}</p>}
          {message && <p className="text-[#5A8C5A] text-sm">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#C4826A] text-white rounded-full font-lato font-light tracking-widest text-sm uppercase hover:bg-[#A6614C] disabled:opacity-50 transition-colors"
          >
            {loading ? 'One moment...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage('') }}
          className="mt-6 text-xs text-[#C4A090] hover:text-[#C4826A] font-lato transition-colors"
        >
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}

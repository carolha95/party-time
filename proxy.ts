import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(req: NextRequest) {
  const res = NextResponse.next()
  const path = req.nextUrl.pathname

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            res.cookies.set(name, value, options)
          }
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', req.nextUrl))
    }
  }

  if (path === '/admin/login' && user) {
    return NextResponse.redirect(new URL('/admin', req.nextUrl))
  }

  return res
}

export default proxy

export const config = {
  matcher: ['/admin/:path*'],
}

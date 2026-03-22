import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const DEMO_PASSWORD = 'ema2026'
const COOKIE_NAME = 'trellis_demo_auth'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow: login page, auth API, static assets
  if (
    pathname === '/login' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Check for valid auth cookie
  const auth = request.cookies.get(COOKIE_NAME)
  if (auth?.value === DEMO_PASSWORD) return NextResponse.next()

  // Redirect unauthenticated users to login
  return NextResponse.redirect(new URL('/login', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}

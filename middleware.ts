import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const DEMO_PASSWORD = 'ema2026'
const COOKIE_NAME = 'trellis_demo_auth'

export function middleware(request: NextRequest) {
  // Allow the login page and its POST through
  if (request.nextUrl.pathname === '/login') return NextResponse.next()

  // Check for valid auth cookie
  const auth = request.cookies.get(COOKIE_NAME)
  if (auth?.value === DEMO_PASSWORD) return NextResponse.next()

  // Redirect to login
  return NextResponse.redirect(new URL('/login', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|login).*)'],
}

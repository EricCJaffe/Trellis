import { NextRequest, NextResponse } from 'next/server'

const DEMO_PASSWORD = 'ema2026'
const COOKIE_NAME = 'trellis_demo_auth'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  if (password === DEMO_PASSWORD) {
    const res = NextResponse.json({ ok: true })
    res.cookies.set(COOKIE_NAME, DEMO_PASSWORD, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
    return res
  }
  return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
}

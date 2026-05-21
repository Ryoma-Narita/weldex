import { NextRequest, NextResponse } from 'next/server'

const UNDER_CONSTRUCTION = ['工事中', '準備中', 'coming soon', 'under construction']

export async function POST(req: NextRequest) {
  const { url } = await req.json() as { url?: string }

  if (!url) return NextResponse.json({ level: 1, reason: 'no_url' })

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Weldex/1.0)' },
      redirect: 'follow',
    })

    if (!res.ok) {
      return NextResponse.json({ level: 2, reason: 'http_error', status: res.status })
    }

    const html = await res.text()
    const lower = html.toLowerCase()

    if (UNDER_CONSTRUCTION.some((kw) => lower.includes(kw))) {
      return NextResponse.json({ level: 2, reason: 'under_construction' })
    }

    // Check copyright year (3+ years old)
    const yearMatch = lower.match(/©\s*(\d{4})/)
    if (yearMatch) {
      const year = parseInt(yearMatch[1])
      if (new Date().getFullYear() - year >= 3) {
        return NextResponse.json({ level: 3, reason: 'old_copyright', year })
      }
    }

    return NextResponse.json({ level: 0, reason: 'ok' })
  } catch {
    return NextResponse.json({ level: 2, reason: 'fetch_error' })
  }
}

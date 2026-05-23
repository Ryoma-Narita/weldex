import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// ─── PATCH /api/hearing/[id] ──────────────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { status, memo } = body

    const sets: string[] = []
    const values: unknown[] = []
    let idx = 1

    if (status !== undefined) { sets.push(`status = $${idx++}`); values.push(status) }
    if (memo   !== undefined) { sets.push(`memo   = $${idx++}`); values.push(memo)   }

    if (sets.length === 0) {
      return NextResponse.json({ error: '更新項目なし' }, { status: 400 })
    }

    values.push(id)
    await pool.query(
      `UPDATE hearings SET ${sets.join(', ')} WHERE id = $${idx}`,
      values,
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[PATCH /api/hearing/[id]]', err)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

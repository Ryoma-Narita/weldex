'use server'

import pool from '@/lib/db'

// ─── 型定義（Admin.tsx と共有） ───────────────────────────────────────────────

export interface HearingRow {
  id: number
  company: string
  name: string
  industry: string
  industry_other: string | null
  url: string | null
  source: string | null
  issues: string[]
  goal: string | null
  monthly: string | null
  services: string[]
  budget: string | null
  deadline: string | null
  email: string
  phone: string | null
  note: string | null
  status: string
  memo: string
  created_at: string
}

// ─── ヒアリング一覧取得 ───────────────────────────────────────────────────────

/**
 * hearings テーブルを全件取得する（作成日時降順）。
 * Server Action として呼び出されるためシークレットは不要。
 */
export async function getHearings(): Promise<HearingRow[]> {
  const result = await pool.query(
    `SELECT * FROM hearings ORDER BY created_at DESC`,
  )
  return result.rows
}

// ─── ヒアリング更新 ───────────────────────────────────────────────────────────

/**
 * 指定 ID のヒアリングレコードを更新する。
 * status / memo のいずれか、または両方を同時に更新できる。
 */
export async function updateHearing(
  id: number,
  data: { status?: string; memo?: string },
): Promise<void> {
  const sets: string[] = []
  const values: (string | number)[] = []
  let idx = 1

  if (data.status !== undefined) { sets.push(`status = $${idx++}`); values.push(data.status) }
  if (data.memo   !== undefined) { sets.push(`memo   = $${idx++}`); values.push(data.memo)   }

  if (sets.length === 0) return

  values.push(id)
  await pool.query(
    `UPDATE hearings SET ${sets.join(', ')} WHERE id = $${idx}`,
    values,
  )
}

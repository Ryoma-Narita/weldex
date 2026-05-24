import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { requireAdminSecret } from '@/lib/auth'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ─── POST /api/hearing（公開：認証不要） ──────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      company, name, industry, industry_other,
      url, source, issues, goal, monthly,
      services, budget, deadline,
      email, phone, note,
    } = body

    // バリデーション
    if (!company || !name || !industry || !email) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 })
    }
    if (!EMAIL_RE.test(String(email))) {
      return NextResponse.json({ error: 'メールアドレスの形式が正しくありません' }, { status: 400 })
    }

    // DB保存
    const result = await pool.query(
      `INSERT INTO hearings
        (company, name, industry, industry_other, url, source,
         issues, goal, monthly, services, budget, deadline,
         email, phone, note)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING id`,
      [
        company, name, industry, industry_other ?? null,
        url ?? null, source ?? null,
        issues ?? [], goal ?? null, monthly ?? null,
        services ?? [], budget ?? null, deadline ?? null,
        email, phone ?? null, note ?? null,
      ],
    )

    const id = result.rows[0].id

    // Slack 通知（設定済みの場合のみ）
    const slackUrl = process.env.SLACK_WEBHOOK_URL
    if (slackUrl) {
      const text = [
        '📋 新しいヒアリング回答が届きました',
        `会社名：${company}`,
        `業種：${industry}`,
        `サービス：${(services ?? []).join('、') || '未選択'}`,
        `予算：${budget ?? '未回答'}`,
        `Email：${email}`,
      ].join('\n')

      await fetch(slackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      }).catch(() => { /* Slack 失敗はログのみ */ })
    }

    return NextResponse.json({ ok: true, id })
  } catch (err) {
    console.error('[POST /api/hearing]', err)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

// ─── GET /api/hearing（管理者のみ） ───────────────────────────────────────────
export async function GET(req: NextRequest) {
  const authErr = requireAdminSecret(req)
  if (authErr) return authErr

  try {
    const result = await pool.query(`SELECT * FROM hearings ORDER BY created_at DESC`)
    return NextResponse.json(result.rows)
  } catch (err) {
    console.error('[GET /api/hearing]', err)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

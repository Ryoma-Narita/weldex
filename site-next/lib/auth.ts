import { NextRequest, NextResponse } from 'next/server'

/**
 * 管理系API の認証チェック。
 * リクエストヘッダー x-admin-secret が ADMIN_SECRET 環境変数と一致するか確認する。
 * 一致しない場合は 401 レスポンスを返す。
 */
export function requireAdminSecret(req: NextRequest): NextResponse | null {
  const secret = process.env.ADMIN_SECRET
  if (!secret) {
    // 環境変数未設定は設定ミスとして 500 を返す
    return NextResponse.json({ error: 'ADMIN_SECRET が未設定です' }, { status: 500 })
  }
  const provided = req.headers.get('x-admin-secret')
  if (provided !== secret) {
    return NextResponse.json({ error: '認証エラー' }, { status: 401 })
  }
  return null // 認証OK
}

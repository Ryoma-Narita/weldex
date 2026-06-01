# セキュリティ TODO

> 参照元：`/Users/ryoma.narita/Downloads/weldex-security-instructions.md`
> 優先度順に並べ直し済み

---

## 🔴 緊急（DB 接続前に必須）

### 1. `NEXT_PUBLIC_ADMIN_SECRET` の修正
- **問題**: `NEXT_PUBLIC_` プレフィックスはクライアントバンドルに公開される → シークレットが筒抜け
- **対応**: Admin.tsx のフェッチをサーバーアクション経由に変更、または Clerk 導入で解決
- **ファイル**: `components/hearing/Admin.tsx`

### 2. DATABASE_URL を Vercel に設定（あなたの作業）
- Railway → PostgreSQL → Connection String をコピー
- Vercel → Settings → Environment Variables → `DATABASE_URL` を追加
- Railway のコンソールで `hearings` テーブルを CREATE（下記SQL）

```sql
CREATE TABLE hearings (
  id          SERIAL PRIMARY KEY,
  company     TEXT NOT NULL,
  name        TEXT NOT NULL,
  industry    TEXT NOT NULL,
  industry_other TEXT,
  url         TEXT,
  source      TEXT,
  issues      TEXT[],
  goal        TEXT,
  monthly     TEXT,
  services    TEXT[],
  budget      TEXT,
  deadline    TEXT,
  email       TEXT NOT NULL,
  phone       TEXT,
  note        TEXT,
  status      TEXT DEFAULT '未対応',
  memo        TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🟡 今週中（Clerk 認証）

### 3. Clerk アカウント作成（あなたの作業）
- https://clerk.com でアカウント作成
- アプリ作成 → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` と `CLERK_SECRET_KEY` を取得
- Vercel の Environment Variables に追加
- ダッシュボードで：
  - MFA を自分のアカウントに強制
  - セッション有効期限を24時間に設定
  - `admin` ロールを作成して自分に付与

### 4. Clerk 実装（私の作業）
- `middleware.ts` 作成（`/admin/*` と `/api/hearing*` を認証必須に）
- `app/layout.tsx` に `ClerkProvider` 追加
- `app/sign-in/page.tsx` 作成

---

## 🟢 後回し（LINE 連携実装時）

### 5. LINE HMAC 署名検証
- `lib/webhook-verify.ts` 作成
- `app/api/line/webhook/route.ts` に適用

### 6. セキュリティヘッダー（CSP 以外）
- `next.config.ts` に以下を追加：
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Strict-Transport-Security`
- ※ CSP はインラインスタイル多用のため保留

### 7. Upstash レートリミット
- https://upstash.com でアカウント作成・Redis 作成
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` を取得・設定
- `lib/rate-limit.ts` 作成
- `/api/contact` に適用（10回/分）

### 8. Zod + Sentry（LINE/SendGrid 連携後）
- https://sentry.io でアカウント作成・DSN 取得
- `lib/validators/line.ts` / `sendgrid.ts` 作成
- `lib/sentry.ts` 作成

### 9. git-secrets
```bash
brew install git-secrets
git secrets --install
git secrets --register-aws
```

### 10. .env.example 作成
- キー名だけ記載したサンプルファイルを Git に追加

---

## 既知の技術的負債

| 項目 | 内容 |
|------|------|
| CSP が使えない | インラインスタイル多用のため CSS Modules への移行が必要 |
| Prisma 未導入 | 現在は生 `pg` を使用。Prisma 移行は別途判断 |
| `NEXT_PUBLIC_ADMIN_SECRET` | 現在 Vercel に未設定なので実害なし。Clerk 導入で解決 |

---

*更新：2026-05-24*

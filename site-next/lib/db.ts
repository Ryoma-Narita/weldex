import { Pool } from 'pg'

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined
}

function getPool(): Pool {
  if (global._pgPool) return global._pgPool

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL が設定されていません。.env.local を確認してください。')
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : undefined,
    max: 5,
  })

  // 開発時はグローバルにキャッシュ（hot-reload 対策）
  if (process.env.NODE_ENV !== 'production') {
    global._pgPool = pool
  }

  return pool
}

// Proxy でクエリ呼び出し時に初めてプールを生成する（ビルド時の評価エラーを防ぐ）
const pool = new Proxy({} as Pool, {
  get(_target, prop) {
    return (getPool() as never)[prop]
  },
})

export default pool

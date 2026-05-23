import { Pool } from 'pg'

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined
}

function createPool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
    max: 5,
  })
}

// Hot-reload 対策：開発時はグローバルにキャッシュ
const pool = global._pgPool ?? createPool()
if (process.env.NODE_ENV !== 'production') global._pgPool = pool

export default pool

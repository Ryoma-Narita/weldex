import HearingAdmin from '@/components/hearing/Admin'

export const metadata = {
  title: 'ヒアリング管理 | Weldex Admin',
  robots: 'noindex',
}

export default function AdminHearingPage() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* 管理画面ヘッダー */}
      <div style={{
        height: 60,
        background: '#1a2540',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.5rem',
        gap: '1rem',
      }}>
        <span style={{
          fontWeight: 800, color: '#fff',
          fontSize: '1rem', letterSpacing: '-0.01em',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          Weldex<span style={{ color: '#b8960c' }}>.</span>
        </span>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>Admin</span>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
          / ヒアリング管理
        </span>
        <a
          href="/admin/outreach"
          style={{
            marginLeft: 'auto', color: 'rgba(255,255,255,0.5)',
            fontSize: '0.78rem', textDecoration: 'none',
          }}
        >
          営業管理 →
        </a>
      </div>

      <HearingAdmin />
    </div>
  )
}

import type { Metadata } from 'next'
import HearingForm from '@/components/hearing/Form'

export const metadata: Metadata = {
  title: 'ヒアリングシート | Weldex',
  description: 'WEBサイト制作・予約システム・LINE連携に関するヒアリングシートです。',
  robots: 'noindex',
}

export default function HearingPage() {
  return (
    <>
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
      />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin=""
      />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700;900&display=swap"
        rel="stylesheet"
      />
      <HearingForm />
    </>
  )
}

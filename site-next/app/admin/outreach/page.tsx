'use client'

import dynamic from 'next/dynamic'

const OutreachAdmin = dynamic(() => import('./OutreachAdmin'), { ssr: false })

export default function OutreachPage() {
  return <OutreachAdmin />
}

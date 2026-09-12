import type { Metadata } from 'next'
import './globals.css'
import { Noto_Sans_Sinhala } from 'next/font/google'

const notoSinhala = Noto_Sans_Sinhala({ subsets: ['sinhala'], weight: ['400','500','700'], display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL('https://heesara.lk'),
  title: { default: 'හීසර.lk - ලංකාවේ විශ්වාසනීයම මංගල යෝජනා | Heesara.lk', template: '%s | හීසර.lk' },
  description: 'ලංකාවේ විශ්වාසනීයම මංගල යෝජනා web පිටුව. Professional • Secure • Verified • PDPA Compliant • පොරොන්දම් 20, Guardian Verified. මුල් 100 Free Verified, 900 @ Rs.500',
  keywords: ['heesara', 'heesara.lk', 'මංගල යෝජනා', 'mangala yojana', 'sri lanka matrimony', 'porondam 20', 'horoscope matching'],
  alternates: { canonical: 'https://heesara.lk' },
  openGraph: {
    title: 'හීසර.lk - ලංකාවේ විශ්වාසනීයම මංගල යෝජනා',
    description: 'Professional • Secure • Verified • Guardian Verified • පොරොන්දම් 20',
    url: 'https://heesara.lk',
    siteName: 'හීසර.lk',
    locale: 'si_LK',
    type: 'website',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="si" className={notoSinhala.className}>
      <body className={notoSinhala.className}>{children}</body>
    </html>
  )
}
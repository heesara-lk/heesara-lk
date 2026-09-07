import type { Metadata } from 'next'
import './globals.css'
import { Noto_Sans_Sinhala } from 'next/font/google'

// This font properly supports ක්‍රීඩා, වෛද්‍ය, සාමාන්‍ය, etc.
const notoSinhala = Noto_Sans_Sinhala({
  subsets: ['sinhala'],
  weight: ['400','500','700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'හීසර.lk - හරි කෙනා හමුවන තැන',
  description: 'හීසරෙන් හීසරයට - Sri Lankan Matrimony - අනංගයාගේ ආදර ඊතලය',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="si" className={notoSinhala.className}>
      <body className={notoSinhala.className}>{children}</body>
    </html>
  )
}

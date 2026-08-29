import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'හීසර.lk - ඊ තලය | හරි කෙනා හමුවන තැන',
  description: 'හීසර = ඊ තලය - අනංගයාගේ ආදර මල් ඊතලය. ලංකාවේ Professional Matrimony - Auto Top 10 Matching 100න්, පොරොන්දම් 20, මුල් 1000ට Free!',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="si">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Sinhala:wght@400;600;700&family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{fontFamily:'Poppins, Noto Serif Sinhala, sans-serif'}}>{children}</body>
    </html>
  )
}

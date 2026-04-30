import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PerpKit Compare',
  description: 'Real-time perpetual futures exchange comparison — Binance · OKX · Gate',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen">{children}</body>
    </html>
  )
}

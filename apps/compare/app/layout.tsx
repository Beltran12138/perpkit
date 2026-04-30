import type { Metadata } from 'next'
import './globals.css'
import { NavBar } from '../components/NavBar'

export const metadata: Metadata = {
  title: 'PerpKit',
  description: 'Perpetual futures exchange tools — Compare · Learn',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        <NavBar />
        {children}
      </body>
    </html>
  )
}

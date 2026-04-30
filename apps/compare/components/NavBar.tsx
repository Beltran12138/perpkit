'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/', label: 'Compare' },
  { href: '/learn', label: 'Learn' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/history', label: 'History' },
] as const

export function NavBar() {
  const pathname = usePathname()
  return (
    <nav className="border-b border-gray-800 px-8 py-3 flex gap-6">
      {LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`text-sm font-medium transition-colors ${
            pathname === href
              ? 'text-white'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}

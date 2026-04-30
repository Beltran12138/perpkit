import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@perpkit/exchange-adapters', '@perpkit/types'],
}

export default nextConfig

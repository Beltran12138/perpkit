import type { FundingRate, FeeStructure } from '@perpkit/types'
import type { ExchangeAdapter } from './types'

export class HyperliquidAdapter implements ExchangeAdapter {
  readonly name = 'hyperliquid' as const

  async getFundingRate(symbol: string): Promise<FundingRate> {
    const res = await fetch('https://api.hyperliquid.xyz/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'metaAndAssetCtxs' }),
    })
    if (!res.ok) throw new Error(`Hyperliquid API error: ${res.status}`)
    const [meta, ctxs] = await res.json() as [
      { universe: { name: string; szDecimals: number }[] },
      { funding: string }[],
    ]
    const idx = meta.universe.findIndex((a) => a.name === symbol)
    if (idx === -1) throw new Error(`${symbol} not found on Hyperliquid`)
    const rate = parseFloat(ctxs[idx].funding)
    if (isNaN(rate)) throw new Error(`Hyperliquid: invalid funding rate "${ctxs[idx].funding}"`)
    const nextFundingTime = Math.ceil(Date.now() / 3_600_000) * 3_600_000
    return { exchange: 'hyperliquid', symbol, rate, nextFundingTime, fetchedAt: Date.now() }
  }

  async getFees(): Promise<FeeStructure> {
    return {
      exchange: 'hyperliquid',
      makerFee: 0.0002,
      takerFee: 0.0005,
      vipTiers: [
        { level: 'Regular', makerFee: 0.0002, takerFee: 0.0005, requirement: 'Default' },
        { level: 'MM', makerFee: 0.00005, takerFee: 0.0001, requirement: 'Market maker agreement' },
      ],
    }
  }
}

import type { FundingRate, FeeStructure } from '@perpkit/types'
import type { ExchangeAdapter } from './types'

export class DydxAdapter implements ExchangeAdapter {
  readonly name = 'dydx' as const

  async getFundingRate(symbol: string): Promise<FundingRate> {
    const dydxSymbol = `${symbol}-USD`
    const res = await fetch(
      `https://indexer.dydx.trade/v4/perpetualMarkets?ticker=${dydxSymbol}`,
    )
    if (!res.ok) throw new Error(`dYdX API error: ${res.status}`)
    const { markets } = await res.json() as {
      markets: Record<string, { nextFundingRate: string; status: string }>
    }
    const market = markets[dydxSymbol]
    if (!market) throw new Error(`${dydxSymbol} not found on dYdX`)
    const rate1h = parseFloat(market.nextFundingRate)
    if (isNaN(rate1h)) throw new Error(`dYdX: invalid funding rate "${market.nextFundingRate}"`)
    const rate8h = rate1h * 8
    const nextFundingTime = Math.ceil(Date.now() / 3_600_000) * 3_600_000
    return { exchange: 'dydx', symbol: dydxSymbol, rate: rate8h, nextFundingTime, fetchedAt: Date.now() }
  }

  async getFees(): Promise<FeeStructure> {
    return {
      exchange: 'dydx',
      makerFee: 0.0002,
      takerFee: 0.0005,
      vipTiers: [
        { level: 'Regular', makerFee: 0.0002, takerFee: 0.0005, requirement: 'Default' },
        { level: 'Advanced', makerFee: 0.00015, takerFee: 0.0004, requirement: '30d volume > 5M USDT' },
      ],
    }
  }
}

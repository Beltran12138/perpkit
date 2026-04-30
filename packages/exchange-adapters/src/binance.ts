import type { FundingRate, FeeStructure } from '@perpkit/types'
import type { ExchangeAdapter } from './types'

export class BinanceAdapter implements ExchangeAdapter {
  readonly name = 'binance' as const

  async getFundingRate(symbol: string): Promise<FundingRate> {
    const url = `https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${symbol}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Binance API error: ${res.status}`)
    const data = await res.json() as {
      symbol: string
      lastFundingRate: string
      nextFundingTime: number
    }
    return {
      exchange: 'binance',
      symbol: data.symbol,
      rate: parseFloat(data.lastFundingRate),
      nextFundingTime: data.nextFundingTime,
      fetchedAt: Date.now(),
    }
  }

  async getFees(): Promise<FeeStructure> {
    return {
      exchange: 'binance',
      makerFee: 0.0002,
      takerFee: 0.0005,
      vipTiers: [
        { level: 'Regular', makerFee: 0.0002, takerFee: 0.0005, requirement: 'Default' },
        { level: 'VIP 1', makerFee: 0.00016, takerFee: 0.0004, requirement: '30d volume > 1M USDT' },
        { level: 'VIP 2', makerFee: 0.00014, takerFee: 0.00035, requirement: '30d volume > 5M USDT' },
        { level: 'VIP 3', makerFee: 0.00012, takerFee: 0.00032, requirement: '30d volume > 20M USDT' },
      ],
    }
  }
}

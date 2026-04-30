import type { FundingRate, FeeStructure } from '@perpkit/types'
import type { ExchangeAdapter } from './types'

export class GateAdapter implements ExchangeAdapter {
  readonly name = 'gate' as const

  async getFundingRate(symbol: string): Promise<FundingRate> {
    const url = `https://api.gateio.ws/api/v4/futures/usdt/contracts/${symbol}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Gate API error: ${res.status}`)
    const data = await res.json() as {
      funding_rate: string
      funding_next_apply: number
    }
    const rate = parseFloat(data.funding_rate)
    if (isNaN(rate)) throw new Error(`Gate: invalid funding rate "${data.funding_rate}"`)
    return {
      exchange: 'gate',
      symbol,
      rate,
      nextFundingTime: data.funding_next_apply * 1000,
      fetchedAt: Date.now(),
    }
  }

  async getFees(): Promise<FeeStructure> {
    return {
      exchange: 'gate',
      makerFee: 0.00015,
      takerFee: 0.0005,
      vipTiers: [
        { level: 'Lv0', makerFee: 0.00015, takerFee: 0.0005, requirement: 'Default' },
        { level: 'Lv1', makerFee: 0.00010, takerFee: 0.00045, requirement: '30d volume > 500K USDT' },
        { level: 'Lv2', makerFee: 0.00008, takerFee: 0.0004, requirement: '30d volume > 2M USDT' },
      ],
    }
  }
}

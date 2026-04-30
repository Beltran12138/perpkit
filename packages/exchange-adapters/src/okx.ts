import type { FundingRate, FeeStructure } from '@perpkit/types'
import type { ExchangeAdapter } from './types'

export class OkxAdapter implements ExchangeAdapter {
  readonly name = 'okx' as const

  async getFundingRate(symbol: string): Promise<FundingRate> {
    const url = `https://www.okx.com/api/v5/public/funding-rate?instId=${symbol}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`OKX API error: ${res.status}`)
    const data = await res.json() as {
      code: string
      data: Array<{ fundingRate: string; nextFundingTime: string; instId: string }>
    }
    const latest = data.data[0]
    const rate = parseFloat(latest.fundingRate)
    if (isNaN(rate)) throw new Error(`OKX: invalid funding rate "${latest.fundingRate}"`)
    return {
      exchange: 'okx',
      symbol: latest.instId,
      rate,
      nextFundingTime: parseInt(latest.nextFundingTime, 10),
      fetchedAt: Date.now(),
    }
  }

  async getFees(): Promise<FeeStructure> {
    return {
      exchange: 'okx',
      makerFee: 0.00015,
      takerFee: 0.0005,
      vipTiers: [
        { level: 'Lv1', makerFee: 0.00015, takerFee: 0.0005, requirement: 'Default' },
        { level: 'Lv2', makerFee: 0.00010, takerFee: 0.00045, requirement: '30d volume > 1M USDT' },
        { level: 'Lv3', makerFee: 0.00008, takerFee: 0.0004, requirement: '30d volume > 5M USDT' },
      ],
    }
  }
}

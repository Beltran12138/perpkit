import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BinanceAdapter } from '../binance'

describe('BinanceAdapter', () => {
  let adapter: BinanceAdapter

  beforeEach(() => {
    adapter = new BinanceAdapter()
  })

  it('has correct exchange name', () => {
    expect(adapter.name).toBe('binance')
  })

  it('getFundingRate returns correct shape', async () => {
    // Binance premiumIndex returns a single object (not array)
    const mockResponse = {
      symbol: 'BTCUSDT',
      lastFundingRate: '0.00010000',
      nextFundingTime: 1714521600000,
    }
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const result = await adapter.getFundingRate('BTCUSDT')

    expect(result.exchange).toBe('binance')
    expect(result.symbol).toBe('BTCUSDT')
    expect(result.rate).toBe(0.0001)
    expect(result.nextFundingTime).toBe(1714521600000)
    expect(typeof result.fetchedAt).toBe('number')
  })

  it('getFees returns correct shape', async () => {
    const result = await adapter.getFees()
    expect(result.exchange).toBe('binance')
    expect(result.makerFee).toBe(0.0002)
    expect(result.takerFee).toBe(0.0005)
    expect(Array.isArray(result.vipTiers)).toBe(true)
  })
})

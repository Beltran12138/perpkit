import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HyperliquidAdapter } from '../hyperliquid'

describe('HyperliquidAdapter', () => {
  let adapter: HyperliquidAdapter

  beforeEach(() => {
    adapter = new HyperliquidAdapter()
  })

  it('has correct exchange name', () => {
    expect(adapter.name).toBe('hyperliquid')
  })

  it('getFundingRate returns correct shape for BTC', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { universe: [{ name: 'BTC', szDecimals: 5 }, { name: 'ETH', szDecimals: 4 }] },
        [{ funding: '0.0001250' }, { funding: '0.0000800' }],
      ],
    } as Response)

    const result = await adapter.getFundingRate('BTC')

    expect(result.exchange).toBe('hyperliquid')
    expect(result.symbol).toBe('BTC')
    expect(result.rate).toBeCloseTo(0.000125, 7)
    expect(result.nextFundingTime).toBeGreaterThan(Date.now())
    expect(typeof result.fetchedAt).toBe('number')
  })

  it('throws when symbol not found', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { universe: [{ name: 'ETH', szDecimals: 4 }] },
        [{ funding: '0.0001' }],
      ],
    } as Response)

    await expect(adapter.getFundingRate('BTC')).rejects.toThrow('BTC not found on Hyperliquid')
  })

  it('getFees returns correct shape', async () => {
    const result = await adapter.getFees()
    expect(result.exchange).toBe('hyperliquid')
    expect(result.makerFee).toBe(0.0002)
    expect(result.takerFee).toBe(0.0005)
    expect(Array.isArray(result.vipTiers)).toBe(true)
  })

  it('throws on HTTP error', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 } as Response)
    await expect(adapter.getFundingRate('BTC')).rejects.toThrow('Hyperliquid API error: 503')
  })
})

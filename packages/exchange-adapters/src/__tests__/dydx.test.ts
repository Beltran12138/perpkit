import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DydxAdapter } from '../dydx'

describe('DydxAdapter', () => {
  let adapter: DydxAdapter

  beforeEach(() => {
    adapter = new DydxAdapter()
  })

  it('has correct exchange name', () => {
    expect(adapter.name).toBe('dydx')
  })

  it('getFundingRate returns 8h-normalised rate for BTC', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        markets: {
          'BTC-USD': {
            ticker: 'BTC-USD',
            nextFundingRate: '0.000010',
            status: 'ACTIVE',
          },
        },
      }),
    } as Response)

    const result = await adapter.getFundingRate('BTC')

    expect(result.exchange).toBe('dydx')
    expect(result.symbol).toBe('BTC-USD')
    // 1h rate 0.000010 × 8 = 0.000080
    expect(result.rate).toBeCloseTo(0.00008, 8)
    expect(result.nextFundingTime).toBeGreaterThan(Date.now())
    expect(typeof result.fetchedAt).toBe('number')
  })

  it('throws when market not found', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ markets: {} }),
    } as Response)

    await expect(adapter.getFundingRate('XYZ')).rejects.toThrow('XYZ-USD not found on dYdX')
  })

  it('getFees returns correct shape', async () => {
    const result = await adapter.getFees()
    expect(result.exchange).toBe('dydx')
    expect(result.makerFee).toBe(0.0002)
    expect(result.takerFee).toBe(0.0005)
    expect(Array.isArray(result.vipTiers)).toBe(true)
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GateAdapter } from '../gate'

describe('GateAdapter', () => {
  let adapter: GateAdapter

  beforeEach(() => {
    adapter = new GateAdapter()
  })

  it('has correct exchange name', () => {
    expect(adapter.name).toBe('gate')
  })

  it('getFundingRate returns correct shape', async () => {
    const mockResponse = { funding_rate: '0.00012', funding_next_apply: 1714521600 }
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const result = await adapter.getFundingRate('BTC_USDT')

    expect(result.exchange).toBe('gate')
    expect(result.symbol).toBe('BTC_USDT')
    expect(result.rate).toBe(0.00012)
    expect(result.nextFundingTime).toBe(1714521600000)
  })

  it('getFees returns correct shape', async () => {
    const result = await adapter.getFees()
    expect(result.exchange).toBe('gate')
    expect(typeof result.makerFee).toBe('number')
    expect(Array.isArray(result.vipTiers)).toBe(true)
  })
})

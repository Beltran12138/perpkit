import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OkxAdapter } from '../okx'

describe('OkxAdapter', () => {
  let adapter: OkxAdapter

  beforeEach(() => {
    adapter = new OkxAdapter()
  })

  it('has correct exchange name', () => {
    expect(adapter.name).toBe('okx')
  })

  it('getFundingRate returns correct shape', async () => {
    const mockResponse = {
      code: '0',
      data: [{ fundingRate: '0.00015000', nextFundingTime: '1714521600000', instId: 'BTC-USDT-SWAP' }],
    }
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const result = await adapter.getFundingRate('BTC-USDT-SWAP')

    expect(result.exchange).toBe('okx')
    expect(result.symbol).toBe('BTC-USDT-SWAP')
    expect(result.rate).toBe(0.00015)
    expect(result.nextFundingTime).toBe(1714521600000)
    expect(typeof result.fetchedAt).toBe('number')
  })

  it('throws on OKX API-level error (HTTP 200, code !== 0)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ code: '50001', msg: 'Service unavailable', data: [] }),
    } as Response)
    await expect(adapter.getFundingRate('BTC-USDT-SWAP')).rejects.toThrow('OKX API error: code 50001')
  })

  it('getFees returns correct shape', async () => {
    const result = await adapter.getFees()
    expect(result.exchange).toBe('okx')
    expect(typeof result.makerFee).toBe('number')
    expect(typeof result.takerFee).toBe('number')
    expect(Array.isArray(result.vipTiers)).toBe(true)
  })
})

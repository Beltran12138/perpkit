import { describe, it, expect } from 'vitest'
import {
  calcBinanceRate,
  calcHyperliquidRate,
  calcDydxRate,
  simulateRates,
} from '../funding-formula'

describe('simulateRates', () => {
  it('longRatio=0.5 → all rates near 0', () => {
    const rates = simulateRates(0.5)
    expect(rates.binance).toBeCloseTo(0, 6)
    expect(rates.hyperliquid).toBeCloseTo(0, 6)
    expect(rates.dydx).toBeCloseTo(0, 6)
  })

  it('longRatio=1.0 → all rates positive', () => {
    const rates = simulateRates(1.0)
    expect(rates.binance).toBeGreaterThan(0)
    expect(rates.hyperliquid).toBeGreaterThan(0)
    expect(rates.dydx).toBeGreaterThan(0)
  })

  it('longRatio=0.0 → all rates negative', () => {
    const rates = simulateRates(0.0)
    expect(rates.binance).toBeLessThan(0)
    expect(rates.hyperliquid).toBeLessThan(0)
    expect(rates.dydx).toBeLessThan(0)
  })
})

describe('calcBinanceRate', () => {
  it('clamps at +0.75% for large positive premium', () => {
    expect(calcBinanceRate(0.01)).toBe(0.0075)
  })
  it('clamps at -0.75% for large negative premium', () => {
    expect(calcBinanceRate(-0.01)).toBe(-0.0075)
  })
  it('near-zero premium → near-zero rate', () => {
    expect(calcBinanceRate(0)).toBeCloseTo(0.0001, 5)
  })
})

describe('calcHyperliquidRate', () => {
  it('clamps at +0.75%', () => {
    expect(calcHyperliquidRate(0.01)).toBe(0.0075)
  })
  it('clamps at -0.75%', () => {
    expect(calcHyperliquidRate(-0.01)).toBe(-0.0075)
  })
  it('passes through in-range premium', () => {
    expect(calcHyperliquidRate(0.001)).toBe(0.001)
  })
})

describe('calcDydxRate', () => {
  it('clamps at +0.4%', () => {
    expect(calcDydxRate(0.1)).toBe(0.004)
  })
  it('clamps at -0.4%', () => {
    expect(calcDydxRate(-0.1)).toBe(-0.004)
  })
  it('applies 0.125 factor in-range', () => {
    expect(calcDydxRate(0.002)).toBeCloseTo(0.00025, 8)
  })
})

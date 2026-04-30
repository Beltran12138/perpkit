function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// Educational model — not production-exact
export function calcBinanceRate(premiumIndex: number, interestRate = 0.0001): number {
  return clamp(
    premiumIndex + clamp(interestRate - premiumIndex, -0.0005, 0.0005),
    -0.0075,
    0.0075,
  )
}

export function calcHyperliquidRate(premiumIndex: number): number {
  return clamp(premiumIndex, -0.0075, 0.0075)
}

// 8h TWAP factor (0.125) smooths volatility; tighter ±0.4% bounds
export function calcDydxRate(premiumIndex: number): number {
  return clamp(premiumIndex * 0.125, -0.004, 0.004)
}

// longRatio 0.5 → premiumIndex 0 (balanced)
// longRatio 1.0 → premiumIndex +0.002 (all long)
// longRatio 0.0 → premiumIndex -0.002 (all short)
export function simulateRates(
  longRatio: number,
): Record<'binance' | 'hyperliquid' | 'dydx', number> {
  const premiumIndex = (longRatio - 0.5) * 0.004
  return {
    binance: calcBinanceRate(premiumIndex),
    hyperliquid: calcHyperliquidRate(premiumIndex),
    dydx: calcDydxRate(premiumIndex),
  }
}

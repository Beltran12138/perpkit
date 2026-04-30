export type ExchangeName = 'binance' | 'okx' | 'gate' | 'hyperliquid' | 'dydx'

export interface FundingRate {
  exchange: ExchangeName
  symbol: string
  rate: number          // e.g. 0.0001 = 0.01%
  nextFundingTime: number  // unix ms
  fetchedAt: number     // unix ms
}

export interface FeeStructure {
  exchange: ExchangeName
  makerFee: number      // e.g. 0.0002 = 0.02%
  takerFee: number
  vipTiers: VipTier[]
}

export interface VipTier {
  level: string
  makerFee: number
  takerFee: number
  requirement: string
}

export interface TerminologyEntry {
  concept: string
  binance: string
  okx: string
  gate: string
  description: string
}

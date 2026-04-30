import type { FundingRate, FeeStructure, ExchangeName } from '@perpkit/types'

export interface ExchangeAdapter {
  readonly name: ExchangeName
  getFundingRate(symbol: string): Promise<FundingRate>
  getFees(): Promise<FeeStructure>
}

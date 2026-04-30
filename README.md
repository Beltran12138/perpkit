# PerpKit

Open-source toolkit for perpetual futures exchange operators and researchers.

## Apps

| App | Description |
|-----|-------------|
| [compare](./apps/compare) | Real-time exchange comparison — funding rates, fees, terminology |

## Packages

| Package | Description |
|---------|-------------|
| [@perpkit/types](./packages/types) | Shared TypeScript types |
| [@perpkit/exchange-adapters](./packages/exchange-adapters) | Exchange API adapters (Binance, OKX, Gate) |

## Contributing

Add a new exchange: implement `ExchangeAdapter` in `packages/exchange-adapters/src/` and open a PR.

```typescript
// packages/exchange-adapters/src/your-exchange.ts
export class YourExchangeAdapter implements ExchangeAdapter {
  readonly name = 'your-exchange' as const
  async getFundingRate(symbol: string): Promise<FundingRate> { ... }
  async getFees(): Promise<FeeStructure> { ... }
}
```

Then add to `src/index.ts` and update the SYMBOLS map in `apps/compare/app/api/funding-rates/route.ts`.

## Development

```bash
pnpm install
pnpm dev        # starts all apps
```

## Tech Stack

Turborepo · Next.js 15 · TypeScript · Tailwind CSS · Vitest

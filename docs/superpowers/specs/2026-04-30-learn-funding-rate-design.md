# /learn Funding Rate Visualizer — Design Spec

## Goal

Add a `/learn` route to `apps/compare` with a scrollytelling funding rate visualizer covering Binance, Hyperliquid, and dYdX v4. Prose scrolls left; interactive viz panel is sticky right. Real-time data from existing API adapters + simulation slider.

## Architecture

Extends `apps/compare` (no new Vercel project). New route: `app/learn/page.tsx`.

### New files

| File | Responsibility |
|------|---------------|
| `app/learn/page.tsx` | Route entry; composes `FundingRateStory` |
| `components/learn/FundingRateStory.tsx` | Scrollytelling container; owns `activeStep`, `longRatio`, `liveRates` state |
| `components/learn/FundingRateViz.tsx` | Sticky right panel; renders viz based on `activeStep` props |
| `components/learn/StepSection.tsx` | Single prose step with forwarded ref for IntersectionObserver |
| `components/learn/steps.ts` | Story steps array — `{ id, title, body, vizMode }` |
| `lib/funding-formula.ts` | Pure functions: protocol formulas + `simulateRates(longRatio)` |
| `lib/__tests__/funding-formula.test.ts` | Vitest unit tests for formula edge cases |

### Modified files

| File | Change |
|------|--------|
| `app/layout.tsx` | Add `Compare \| Learn` nav tabs |

## Story Steps (4 steps)

| # | Title | vizMode | Viz content |
|---|-------|---------|-------------|
| 0 | 資金費率是什麼？ | `live` | 三協議實時費率卡片（fetch from `/api/funding-rates`） |
| 1 | 為何費率不同？ | `formula` | 各協議公式高亮顯示，標注關鍵參數差異 |
| 2 | 模擬 OI 失衡 | `sim` | 滑塊（0–1 多空比例）→ 實算三協議費率，實時更新 |
| 3 | 下次結算倒計時 | `countdown` | `nextFundingTime` 倒計時 + 費率正負方向標注 |

## Components

### FundingRateStory

```tsx
'use client'
// state: activeStep: number, longRatio: number, liveRates: FundingRate[] | null, liveError: boolean
// useEffect 1: IntersectionObserver on StepSection refs → setActiveStep
// useEffect 2: fetch('/api/funding-rates') → setLiveRates | setLiveError(true)
// layout: flex row, left=overflow-y-auto, right=sticky top-8
```

### FundingRateViz

```tsx
// Props: { activeStep: number, longRatio: number, onLongRatioChange: (v: number) => void,
//          liveRates: FundingRate[] | null, liveError: boolean }
// Renders viz panel content based on activeStep
// If liveError && activeStep requires live data: show "Live data unavailable" badge, fallback to sim
```

### lib/funding-formula.ts

```ts
// Simplified educational models (not production-exact)
export function calcBinanceRate(premiumIndex: number, interestRate = 0.0001): number
// clamp(premiumIndex + clamp(interestRate - premiumIndex, -0.0005, 0.0005), -0.0075, 0.0075)

export function calcHyperliquidRate(premiumIndex: number): number
// clamp(premiumIndex, -0.0075, 0.0075)

export function calcDydxRate(premiumIndex: number): number
// clamp(premiumIndex * 0.125, -0.004, 0.004)  — 8h TWAP factor

export function simulateRates(longRatio: number): Record<'binance' | 'hyperliquid' | 'dydx', number>
// longRatio 0.5 → premiumIndex 0; longRatio 1.0 → premiumIndex 0.002; longRatio 0.0 → premiumIndex -0.002
// returns { binance: calcBinanceRate(p), hyperliquid: calcHyperliquidRate(p), dydx: calcDydxRate(p) }
```

## Data Flow

```
page load → FundingRateStory mounts
  → fetch /api/funding-rates (existing route, s-maxage=60)
  → liveRates populated or liveError=true

user scrolls
  → IntersectionObserver fires
  → activeStep updates
  → FundingRateViz re-renders with new vizMode

user moves slider (Step 2 only)
  → longRatio updates in FundingRateStory
  → simulateRates(longRatio) called in FundingRateViz render
  → three rate values update instantly (no fetch)
```

## Error Handling

- Live fetch fails → `liveError = true` → viz shows simulation mode for all steps + badge `"Live data unavailable"`
- Individual exchange errors (existing Promise.allSettled behavior) → show available exchanges, skip failed ones

## Navigation

`app/layout.tsx` adds top nav with two links:

```tsx
<nav>
  <Link href="/">Compare</Link>
  <Link href="/learn">Learn</Link>
</nav>
```

Active link highlighted via `usePathname()`.

## Testing

`lib/__tests__/funding-formula.test.ts` covers:

- `longRatio = 0.5` → all rates near 0
- `longRatio = 1.0` → positive rates, within clamp bounds
- `longRatio = 0.0` → negative rates, within clamp bounds
- `calcBinanceRate` clamp at ±0.75%
- `calcDydxRate` clamp at ±0.4%

Run: `pnpm test --filter=@perpkit/compare`

## Tech Stack

- Next.js 15 App Router, TypeScript strict, Tailwind CSS
- IntersectionObserver API (native, no deps)
- Vitest (already configured in `packages/exchange-adapters`, add to compare app)
- No new npm packages required

## Out of Scope (v1)

- Mobile scrollytelling optimization (desktop-first)
- Liquidation / Mark Price mechanisms
- MDX / CMS — prose written directly in React components
- SEO metadata for `/learn`

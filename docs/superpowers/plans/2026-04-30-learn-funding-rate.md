# /learn Funding Rate Visualizer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/learn` route to `apps/compare` with a scrollytelling funding rate visualizer — live data + OI simulation slider — covering Binance, Hyperliquid, and dYdX v4.

**Architecture:** Extend `apps/compare` (no new Vercel project). Left column scrolls through 4 prose steps; right column is a sticky `FundingRateViz` panel that changes state as the user scrolls, driven by `IntersectionObserver`. Pure formula functions live in `lib/funding-formula.ts` and are Vitest-tested independently.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, Tailwind CSS, IntersectionObserver (native), Vitest ^1.6.0 (no new runtime deps)

---

## File Map

| Status | File | What |
|--------|------|------|
| Create | `apps/compare/lib/funding-formula.ts` | Pure formula functions + simulateRates |
| Create | `apps/compare/lib/__tests__/funding-formula.test.ts` | Vitest unit tests |
| Create | `apps/compare/vitest.config.ts` | Vitest config for compare app |
| Modify | `apps/compare/package.json` | Add vitest devDep + test script |
| Create | `apps/compare/components/learn/steps.ts` | Story steps data array |
| Create | `apps/compare/components/learn/StepSection.tsx` | Single prose step with forwarded ref |
| Create | `apps/compare/components/learn/FundingRateViz.tsx` | Sticky right viz panel |
| Create | `apps/compare/components/learn/FundingRateStory.tsx` | Scrollytelling container |
| Create | `apps/compare/components/NavBar.tsx` | Top nav (Compare / Learn) |
| Create | `apps/compare/app/learn/page.tsx` | Route entry |
| Modify | `apps/compare/app/layout.tsx` | Add NavBar |

---

## Task 1: Vitest setup + failing formula tests

**Files:**
- Modify: `apps/compare/package.json`
- Create: `apps/compare/vitest.config.ts`
- Create: `apps/compare/lib/__tests__/funding-formula.test.ts`

- [ ] **Step 1: Add vitest to package.json**

Edit `apps/compare/package.json` — add `"test"` script and `vitest` devDependency:

```json
{
  "name": "@perpkit/compare",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start",
    "test": "vitest run"
  },
  "dependencies": {
    "@perpkit/exchange-adapters": "workspace:*",
    "@perpkit/types": "workspace:*",
    "next": "^15.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "recharts": "^2.12.0"
  },
  "devDependencies": {
    "@types/node": "25.6.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: Create vitest.config.ts**

Create `apps/compare/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
  },
})
```

- [ ] **Step 3: Install vitest**

Run from repo root:

```bash
pnpm install
```

Expected: lockfile updated, `vitest` appears in `apps/compare/node_modules/.bin/vitest`.

- [ ] **Step 4: Write failing tests**

Create `apps/compare/lib/__tests__/funding-formula.test.ts`:

```ts
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
```

- [ ] **Step 5: Run tests — verify they FAIL**

```bash
pnpm test --filter=@perpkit/compare
```

Expected: FAIL — `Cannot find module '../funding-formula'`

---

## Task 2: Implement lib/funding-formula.ts

**Files:**
- Create: `apps/compare/lib/funding-formula.ts`

- [ ] **Step 1: Create the file**

Create `apps/compare/lib/funding-formula.ts`:

```ts
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
```

- [ ] **Step 2: Run tests — verify they PASS**

```bash
pnpm test --filter=@perpkit/compare
```

Expected: PASS — all 10 tests green.

- [ ] **Step 3: Commit**

```bash
git add apps/compare/package.json apps/compare/vitest.config.ts apps/compare/lib/funding-formula.ts apps/compare/lib/__tests__/funding-formula.test.ts pnpm-lock.yaml
git commit -m "feat(compare): add funding formula lib with vitest"
```

---

## Task 3: Story steps data

**Files:**
- Create: `apps/compare/components/learn/steps.ts`

- [ ] **Step 1: Create steps.ts**

Create `apps/compare/components/learn/steps.ts`:

```ts
export type VizMode = 'live' | 'formula' | 'sim' | 'countdown'

export interface Step {
  id: number
  title: string
  body: string
  vizMode: VizMode
}

export const STEPS: Step[] = [
  {
    id: 0,
    title: 'What is a Funding Rate?',
    body: 'The funding rate anchors a perpetual contract\'s price to the spot index. When longs outnumber shorts, longs pay shorts (positive rate). When shorts dominate, shorts pay longs (negative rate). Settlement happens every 8 hours. The viz panel on the right shows live rates across three protocols right now.',
    vizMode: 'live',
  },
  {
    id: 1,
    title: 'Why Do Rates Differ Across Protocols?',
    body: 'Each protocol uses a different algorithm. Binance applies an interest-rate correction on top of the premium index, capped at ±0.75%. Hyperliquid uses the raw premium index directly, same cap. dYdX v4 multiplies the premium by 0.125 (an 8-hour TWAP dampening factor) with tighter ±0.4% bounds. Same market conditions → different rates.',
    vizMode: 'formula',
  },
  {
    id: 2,
    title: 'Simulate: What Happens When OI Becomes Imbalanced?',
    body: 'Drag the slider to shift the long/short open interest ratio. A market dominated by longs pushes the premium index positive — longs pay shorts. An all-short market does the reverse. Notice how the tighter dYdX bounds smooth out extreme imbalances compared to Binance and Hyperliquid.',
    vizMode: 'sim',
  },
  {
    id: 3,
    title: 'Next Settlement Countdown',
    body: 'Funding settles at 00:00, 08:00, and 16:00 UTC. Holding a position through settlement triggers a fee debit or credit. The countdown shows time until each protocol\'s next settlement. Rates shown are the current scheduled rate — they can change up until settlement.',
    vizMode: 'countdown',
  },
]
```

- [ ] **Step 2: Commit**

```bash
git add apps/compare/components/learn/steps.ts
git commit -m "feat(compare/learn): add story steps data"
```

---

## Task 4: StepSection component

**Files:**
- Create: `apps/compare/components/learn/StepSection.tsx`

- [ ] **Step 1: Create StepSection.tsx**

Create `apps/compare/components/learn/StepSection.tsx`:

```tsx
import { forwardRef } from 'react'

interface StepSectionProps {
  title: string
  body: string
  isActive: boolean
}

export const StepSection = forwardRef<HTMLDivElement, StepSectionProps>(
  ({ title, body, isActive }, ref) => (
    <div
      ref={ref}
      className={`min-h-[70vh] py-16 pr-8 transition-opacity duration-500 ${
        isActive ? 'opacity-100' : 'opacity-30'
      }`}
    >
      <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
      <p className="text-gray-300 leading-relaxed max-w-prose">{body}</p>
    </div>
  ),
)
StepSection.displayName = 'StepSection'
```

- [ ] **Step 2: Commit**

```bash
git add apps/compare/components/learn/StepSection.tsx
git commit -m "feat(compare/learn): add StepSection component"
```

---

## Task 5: FundingRateViz component

**Files:**
- Create: `apps/compare/components/learn/FundingRateViz.tsx`

- [ ] **Step 1: Create FundingRateViz.tsx**

Create `apps/compare/components/learn/FundingRateViz.tsx`:

```tsx
import type { FundingRate } from '@perpkit/types'
import { simulateRates } from '../../lib/funding-formula'
import type { VizMode } from './steps'

interface FundingRateVizProps {
  vizMode: VizMode
  longRatio: number
  onLongRatioChange: (v: number) => void
  liveRates: FundingRate[] | null
  liveError: boolean
}

function pct(rate: number): string {
  return `${(rate * 100).toFixed(4)}%`
}

function formatCountdown(nextFundingTime: number): string {
  const msLeft = nextFundingTime - Date.now()
  if (msLeft <= 0) return '00:00:00'
  const h = Math.floor(msLeft / 3_600_000)
  const m = Math.floor((msLeft % 3_600_000) / 60_000)
  const s = Math.floor((msLeft % 60_000) / 1_000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const FORMULA_INFO = [
  {
    exchange: 'Binance',
    formula: 'clamp(P + clamp(I − P, −0.05%, 0.05%), −0.75%, 0.75%)',
    note: 'P = premium index · I = interest rate (0.01%)',
    color: 'text-yellow-400',
  },
  {
    exchange: 'Hyperliquid',
    formula: 'clamp(P, −0.75%, 0.75%)',
    note: 'Raw premium index, no interest adjustment',
    color: 'text-blue-400',
  },
  {
    exchange: 'dYdX v4',
    formula: 'clamp(P × 0.125, −0.40%, 0.40%)',
    note: '8h TWAP dampening · tighter bounds',
    color: 'text-purple-400',
  },
] as const

function RateRow({ label, rate }: { label: string; rate: number }) {
  const positive = rate >= 0
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm capitalize text-gray-300">{label}</span>
      <span
        className={`font-mono text-sm font-bold ${
          positive ? 'text-green-400' : 'text-red-400'
        }`}
      >
        {positive ? '+' : ''}
        {pct(rate)}
      </span>
    </div>
  )
}

export function FundingRateViz({
  vizMode,
  longRatio,
  onLongRatioChange,
  liveRates,
  liveError,
}: FundingRateVizProps) {
  const simRates = simulateRates(longRatio)
  const EXCHANGES = ['binance', 'hyperliquid', 'dydx'] as const

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 space-y-5">
      {liveError && (
        <div className="text-xs text-orange-400 bg-orange-950/50 rounded px-3 py-1.5">
          Live data unavailable — showing simulation
        </div>
      )}

      {/* Step 0: live rates */}
      {vizMode === 'live' && (
        <div className="space-y-1">
          <div className="text-xs text-gray-400 uppercase tracking-widest mb-3">
            Current Funding Rate
          </div>
          {(liveRates && !liveError ? liveRates : []).map((r) => (
            <RateRow key={r.exchange} label={r.exchange} rate={r.rate} />
          ))}
          {(liveError || !liveRates) &&
            EXCHANGES.map((ex) => (
              <RateRow key={ex} label={ex} rate={simRates[ex]} />
            ))}
        </div>
      )}

      {/* Step 1: formula breakdown */}
      {vizMode === 'formula' && (
        <div className="space-y-4">
          <div className="text-xs text-gray-400 uppercase tracking-widest">
            Formula Comparison
          </div>
          {FORMULA_INFO.map((f) => (
            <div key={f.exchange} className="space-y-1">
              <div className={`text-sm font-semibold ${f.color}`}>{f.exchange}</div>
              <div className="font-mono text-xs text-gray-200 bg-gray-800 rounded px-3 py-1.5 break-all">
                {f.formula}
              </div>
              <div className="text-xs text-gray-500">{f.note}</div>
            </div>
          ))}
        </div>
      )}

      {/* Step 2: OI simulation */}
      {vizMode === 'sim' && (
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="text-xs text-gray-400 uppercase tracking-widest">
              OI Imbalance
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={longRatio}
              onChange={(e) => onLongRatioChange(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>All Short</span>
              <span>Balanced</span>
              <span>All Long</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">
              Simulated Rates
            </div>
            {EXCHANGES.map((ex) => (
              <RateRow key={ex} label={ex} rate={simRates[ex]} />
            ))}
          </div>
        </div>
      )}

      {/* Step 3: countdown */}
      {vizMode === 'countdown' && (
        <div className="space-y-3">
          <div className="text-xs text-gray-400 uppercase tracking-widest">
            Current Rate
          </div>
          {(liveRates ?? []).map((r) => (
            <RateRow key={r.exchange} label={r.exchange} rate={r.rate} />
          ))}
          <div className="border-t border-gray-700 pt-3 space-y-1">
            <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">
              Next Settlement
            </div>
            {(liveRates ?? []).map((r) => (
              <div key={r.exchange} className="flex justify-between items-center py-1">
                <span className="text-sm capitalize text-gray-300">{r.exchange}</span>
                <span className="font-mono text-sm text-gray-200">
                  {formatCountdown(r.nextFundingTime)}
                </span>
              </div>
            ))}
            {(!liveRates || liveError) && (
              <div className="text-xs text-gray-500">No live data</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/compare/components/learn/FundingRateViz.tsx
git commit -m "feat(compare/learn): add FundingRateViz sticky panel"
```

---

## Task 6: FundingRateStory scrollytelling container

**Files:**
- Create: `apps/compare/components/learn/FundingRateStory.tsx`

- [ ] **Step 1: Create FundingRateStory.tsx**

Create `apps/compare/components/learn/FundingRateStory.tsx`:

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import type { FundingRate } from '@perpkit/types'
import { STEPS } from './steps'
import { StepSection } from './StepSection'
import { FundingRateViz } from './FundingRateViz'

type LiveResult = FundingRate | { exchange: string; error: string }

export function FundingRateStory() {
  const [activeStep, setActiveStep] = useState(0)
  const [longRatio, setLongRatio] = useState(0.5)
  const [liveRates, setLiveRates] = useState<FundingRate[] | null>(null)
  const [liveError, setLiveError] = useState(false)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  // Fetch live rates once on mount
  useEffect(() => {
    fetch('/api/funding-rates')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<LiveResult[]>
      })
      .then((data) => {
        const rates = data.filter((r): r is FundingRate => !('error' in r))
        setLiveRates(rates)
      })
      .catch(() => setLiveError(true))
  }, [])

  // IntersectionObserver: update activeStep when a step enters viewport
  useEffect(() => {
    const observers: IntersectionObserver[] = []
    stepRefs.current.forEach((el, idx) => {
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveStep(idx)
        },
        { threshold: 0.5 },
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((obs) => obs.disconnect())
  }, [])

  return (
    <div className="flex gap-12 max-w-5xl mx-auto px-8">
      {/* Left: scrolling prose */}
      <div className="flex-1 min-w-0">
        {STEPS.map((step, idx) => (
          <StepSection
            key={step.id}
            ref={(el) => {
              stepRefs.current[idx] = el
            }}
            title={step.title}
            body={step.body}
            isActive={activeStep === idx}
          />
        ))}
        {/* Spacer so the last step can reach the 50% threshold */}
        <div className="min-h-[50vh]" />
      </div>

      {/* Right: sticky viz */}
      <div className="w-80 flex-shrink-0">
        <div className="sticky top-8">
          <FundingRateViz
            vizMode={STEPS[activeStep].vizMode}
            longRatio={longRatio}
            onLongRatioChange={setLongRatio}
            liveRates={liveRates}
            liveError={liveError}
          />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/compare/components/learn/FundingRateStory.tsx
git commit -m "feat(compare/learn): add FundingRateStory scrollytelling container"
```

---

## Task 7: /learn page route

**Files:**
- Create: `apps/compare/app/learn/page.tsx`

- [ ] **Step 1: Create the page**

Create `apps/compare/app/learn/page.tsx`:

```tsx
import { FundingRateStory } from '../../components/learn/FundingRateStory'

export default function LearnPage() {
  return (
    <main className="min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-8 mb-12">
        <h1 className="text-2xl font-bold text-white mb-2">
          How Perpetual Futures Work
        </h1>
        <p className="text-gray-400 text-sm">
          Funding rate mechanisms across Binance · Hyperliquid · dYdX v4
        </p>
      </div>
      <FundingRateStory />
    </main>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/compare/app/learn/page.tsx
git commit -m "feat(compare/learn): add /learn page route"
```

---

## Task 8: NavBar + update layout

**Files:**
- Create: `apps/compare/components/NavBar.tsx`
- Modify: `apps/compare/app/layout.tsx`

- [ ] **Step 1: Create NavBar.tsx**

Create `apps/compare/components/NavBar.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/', label: 'Compare' },
  { href: '/learn', label: 'Learn' },
] as const

export function NavBar() {
  const pathname = usePathname()
  return (
    <nav className="border-b border-gray-800 px-8 py-3 flex gap-6">
      {LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`text-sm font-medium transition-colors ${
            pathname === href
              ? 'text-white'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}
```

- [ ] **Step 2: Update layout.tsx**

Replace `apps/compare/app/layout.tsx` with:

```tsx
import type { Metadata } from 'next'
import './globals.css'
import { NavBar } from '../components/NavBar'

export const metadata: Metadata = {
  title: 'PerpKit',
  description: 'Perpetual futures exchange tools — Compare · Learn',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        <NavBar />
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Start dev server and verify**

```bash
pnpm dev --filter=@perpkit/compare
```

Open http://localhost:3000 — should show "Compare | Learn" nav.
Click "Learn" → scrollytelling page loads.
Scroll through 4 steps — right panel changes.
Step 2 slider moves → rates update.

- [ ] **Step 4: Commit**

```bash
git add apps/compare/components/NavBar.tsx apps/compare/app/layout.tsx
git commit -m "feat(compare): add NavBar with Compare/Learn tabs"
```

---

## Task 9: Push and verify Vercel deployment

- [ ] **Step 1: Run full test suite**

```bash
pnpm test --filter=@perpkit/compare
```

Expected: all tests pass.

- [ ] **Step 2: Build locally**

```bash
pnpm build --filter=@perpkit/compare
```

Expected: build succeeds, no TypeScript errors.

- [ ] **Step 3: Push**

```bash
git push origin master
```

- [ ] **Step 4: Verify on Vercel**

Open the deployed URL. Navigate to `/learn`. Scroll through all 4 steps. Confirm:
- Step 0: live rates from 3 exchanges visible
- Step 1: formula breakdown visible
- Step 2: slider moves → rates change
- Step 3: countdown timers visible

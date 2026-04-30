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
    note: 'Smoothing factor 0.125 · tighter ±0.4% bounds',
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

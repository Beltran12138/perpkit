'use client'

import { useEffect, useState } from 'react'
import type { FundingRate } from '@perpkit/types'

export function FundingCalculator() {
  const [positionSize, setPositionSize] = useState(10000)
  const [durationHours, setDurationHours] = useState(24)
  const [rates, setRates] = useState<FundingRate[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/funding-rates', { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data) =>
        setRates(data.filter((r: FundingRate | { exchange: string; error: string }) => !('error' in r)) as FundingRate[]),
      )
      .catch((e) => {
        if (e.name !== 'AbortError') setError(true)
      })
    return () => controller.abort()
  }, [])

  const calcCost = (rate: number): number =>
    positionSize * Math.abs(rate) * (durationHours / 8)

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="flex gap-6 flex-wrap">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-400 uppercase tracking-widest">
            Position Size (USD)
          </span>
          <input
            type="number"
            min={0}
            value={positionSize}
            onChange={(e) => setPositionSize(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white w-40 font-mono"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-400 uppercase tracking-widest">
            Hold Duration (hours)
          </span>
          <input
            type="number"
            min={0}
            step={8}
            value={durationHours}
            onChange={(e) => setDurationHours(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white w-40 font-mono"
          />
        </label>
      </div>

      {/* Error state */}
      {error && (
        <div className="text-orange-400 text-sm">Live data unavailable</div>
      )}

      {/* Loading state */}
      {!rates && !error && (
        <div className="text-gray-500 text-sm">Loading rates...</div>
      )}

      {/* Results table */}
      {rates && (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 uppercase tracking-widest border-b border-gray-800">
              <th className="pb-2">Exchange</th>
              <th className="pb-2">8h Rate</th>
              <th className="pb-2">Direction</th>
              <th className="pb-2 text-right">Est. Cost (USD)</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((r) => {
              const cost = calcCost(r.rate)
              const positive = r.rate >= 0
              return (
                <tr key={r.exchange} className="border-b border-gray-800/50">
                  <td className="py-2 capitalize text-gray-200">{r.exchange}</td>
                  <td
                    className={`py-2 font-mono ${
                      positive ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {positive ? '+' : ''}
                    {(r.rate * 100).toFixed(4)}%
                  </td>
                  <td className="py-2 text-gray-400 text-xs">
                    {positive ? 'Longs pay shorts' : 'Shorts pay longs'}
                  </td>
                  <td className="py-2 font-mono text-right text-white">
                    ${cost.toFixed(2)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {/* Formula note */}
      <p className="text-xs text-gray-600">
        Est. cost = position × |rate| × (hours ÷ 8). Based on current rates;
        actual rates vary each settlement.
      </p>
    </div>
  )
}

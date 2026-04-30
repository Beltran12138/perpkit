'use client'

import { useEffect, useState } from 'react'
import type { FundingRate } from '@perpkit/types'

type RateResult = FundingRate | { exchange: string; error: string }

function isError(r: RateResult): r is { exchange: string; error: string } {
  return 'error' in r
}

function formatRate(rate: number): string {
  return `${(rate * 100).toFixed(4)}%`
}

function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export function FundingRateTable() {
  const [rates, setRates] = useState<RateResult[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  async function fetchRates() {
    try {
      const res = await fetch('/api/funding-rates')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as RateResult[]
      setRates(data)
      setLastUpdate(new Date())
      setFetchError(null)
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRates()
    const interval = setInterval(fetchRates, 60_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-white">BTC Funding Rates</h2>
        {lastUpdate && (
          <span className="text-xs text-gray-400">Updated {lastUpdate.toLocaleTimeString()}</span>
        )}
      </div>
      {loading ? (
        <div className="text-gray-400 text-sm">Loading...</div>
      ) : fetchError ? (
        <div className="text-red-400 text-sm">Failed to load: {fetchError}</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-800">
              <th className="text-left py-2">Exchange</th>
              <th className="text-right py-2">Rate</th>
              <th className="text-right py-2">Next Funding</th>
              <th className="text-right py-2">Annual (est.)</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((r) => (
              <tr key={r.exchange} className="border-b border-gray-800/50">
                <td className="py-3 font-medium capitalize">{r.exchange}</td>
                {isError(r) ? (
                  <td colSpan={3} className="py-3 text-right text-red-400 text-xs">{r.error}</td>
                ) : (
                  <>
                    <td className={`py-3 text-right font-mono ${r.rate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatRate(r.rate)}
                    </td>
                    <td className="py-3 text-right text-gray-300">{formatTime(r.nextFundingTime)}</td>
                    <td className={`py-3 text-right font-mono text-xs ${r.rate * 3 * 365 >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
                      {formatRate(r.rate * 3 * 365)}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

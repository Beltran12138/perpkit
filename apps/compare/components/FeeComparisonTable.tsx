'use client'

import { useEffect, useState } from 'react'
import type { FeeStructure } from '@perpkit/types'

type FeeResult = FeeStructure | { exchange: string; error: string }

function isError(r: FeeResult): r is { exchange: string; error: string } {
  return 'error' in r
}

function pct(fee: number): string {
  return `${(fee * 100).toFixed(4)}%`
}

function bps(fee: number): string {
  return `${(fee * 10000).toFixed(1)} bps`
}

export function FeeComparisonTable() {
  const [fees, setFees] = useState<FeeResult[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/fees')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<FeeResult[]>
      })
      .then((data) => { setFees(data); setLoading(false) })
      .catch((e: unknown) => {
        setFetchError(e instanceof Error ? e.message : String(e))
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="text-gray-400 text-sm mb-8">Loading fees...</div>
  if (fetchError) return <div className="text-red-400 text-sm mb-8">Failed to load fees: {fetchError}</div>

  const successFees = fees.filter((f): f is FeeStructure => !isError(f))

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-white mb-3">Fee Structure</h2>
      <table className="w-full text-sm mb-4">
        <thead>
          <tr className="text-gray-400 border-b border-gray-800">
            <th className="text-left py-2">Exchange</th>
            <th className="text-right py-2">Maker</th>
            <th className="text-right py-2">Taker</th>
            <th className="text-right py-2">Round Trip</th>
          </tr>
        </thead>
        <tbody>
          {successFees.map((f) => (
            <tr key={f.exchange} className="border-b border-gray-800/50">
              <td className="py-3 font-medium capitalize">{f.exchange}</td>
              <td className="py-3 text-right font-mono text-blue-300">{pct(f.makerFee)}</td>
              <td className="py-3 text-right font-mono text-orange-300">{pct(f.takerFee)}</td>
              <td className="py-3 text-right font-mono text-gray-300">{bps(f.makerFee + f.takerFee)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

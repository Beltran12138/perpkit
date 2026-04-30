'use client'

import { useEffect, useState } from 'react'
import { FundingChart } from './FundingChart'

interface Snapshot {
  exchange: string
  rate: number
  recorded_at: string
}

export function HistoryPageClient() {
  const [days, setDays] = useState(7)
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    fetch(`/api/history?days=${days}`)
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json() as Promise<Snapshot[]>
      })
      .then((data) => {
        setSnapshots(data)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [days])

  if (loading) {
    return <div className="text-gray-400 text-sm py-12 text-center">Loading…</div>
  }

  if (error) {
    return <div className="text-red-400 text-sm py-12 text-center">Failed to load history.</div>
  }

  if (snapshots.length === 0) {
    return (
      <div className="text-gray-400 text-sm py-12 text-center">
        No data yet — cron job will populate this after first run.
      </div>
    )
  }

  return (
    <FundingChart snapshots={snapshots} days={days} onDaysChange={setDays} />
  )
}

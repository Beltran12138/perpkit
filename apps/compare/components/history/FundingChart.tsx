'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface Snapshot {
  exchange: string
  rate: number
  recorded_at: string
}

interface ChartPoint {
  time: number
  [exchange: string]: number
}

const EXCHANGE_COLORS: Record<string, string> = {
  binance: '#F0B90B',
  okx: '#3E70DD',
  gate: '#E74C3C',
  hyperliquid: '#60A5FA',
  dydx: '#A78BFA',
}

function buildSeries(snapshots: Snapshot[]): ChartPoint[] {
  const byTime = new Map<number, ChartPoint>()
  for (const s of snapshots) {
    const t = new Date(s.recorded_at).getTime()
    if (!byTime.has(t)) byTime.set(t, { time: t })
    const point = byTime.get(t)!
    point[s.exchange] = parseFloat((s.rate * 100).toFixed(6))
  }
  return Array.from(byTime.values()).sort((a, b) => a.time - b.time)
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function FundingChart({
  snapshots,
  days,
  onDaysChange,
}: {
  snapshots: Snapshot[]
  days: number
  onDaysChange: (d: number) => void
}) {
  const exchanges = Array.from(new Set(snapshots.map((s) => s.exchange)))
  const data = buildSeries(snapshots)

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[7, 30].map((d) => (
          <button
            key={d}
            onClick={() => onDaysChange(d)}
            className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
              days === d
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-gray-200'
            }`}
          >
            {d}d
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
          <XAxis
            dataKey="time"
            tickFormatter={formatTime}
            tick={{ fill: '#9ca3af', fontSize: 10 }}
            minTickGap={60}
          />
          <YAxis
            tickFormatter={(v: number) => `${v.toFixed(4)}%`}
            tick={{ fill: '#9ca3af', fontSize: 10 }}
            width={70}
          />
          <Tooltip
            formatter={(v: number, name: string) => [`${v.toFixed(4)}%`, name]}
            labelFormatter={(ts: number) => formatTime(ts)}
            contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 6 }}
            labelStyle={{ color: '#9ca3af' }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {exchanges.map((ex) => (
            <Line
              key={ex}
              type="monotone"
              dataKey={ex}
              stroke={EXCHANGE_COLORS[ex] ?? '#94a3b8'}
              dot={false}
              strokeWidth={1.5}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

import { NextResponse } from 'next/server'
import { BinanceAdapter, OkxAdapter, GateAdapter } from '@perpkit/exchange-adapters'

const adapters = [new BinanceAdapter(), new OkxAdapter(), new GateAdapter()]

export async function GET() {
  const results = await Promise.allSettled(adapters.map((a) => a.getFees()))

  const data = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value
    return { exchange: adapters[i].name, error: r.reason instanceof Error ? r.reason.message : String(r.reason) }
  })

  return NextResponse.json(data, {
    headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' },
  })
}

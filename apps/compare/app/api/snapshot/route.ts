import { getDb } from '../../../lib/db'

interface LiveRate {
  exchange: string
  rate: number
  nextFundingTime: number
}

export async function POST(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL
  if (!baseUrl) {
    return Response.json({ error: 'NEXT_PUBLIC_URL not set' }, { status: 500 })
  }

  const res = await fetch(`${baseUrl}/api/funding-rates`, { cache: 'no-store' })
  if (!res.ok) {
    return Response.json({ error: `upstream ${res.status}` }, { status: 502 })
  }

  const data: unknown[] = await res.json()
  const rates = data.filter(
    (r): r is LiveRate =>
      typeof r === 'object' &&
      r !== null &&
      !('error' in r) &&
      'exchange' in r &&
      'rate' in r &&
      'nextFundingTime' in r,
  )

  if (rates.length === 0) {
    return Response.json({ inserted: 0 })
  }

  const sql = getDb()
  await sql`
    INSERT INTO funding_snapshots (exchange, symbol, rate, next_funding_time)
    SELECT t.exchange, 'BTC', t.rate, t.next_funding_time
    FROM jsonb_to_recordset(${JSON.stringify(rates)}::jsonb)
      AS t(exchange text, rate float8, "nextFundingTime" bigint)
  `

  return Response.json({ inserted: rates.length })
}

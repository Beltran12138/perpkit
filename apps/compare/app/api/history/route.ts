import { sql } from '../../../lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const days = Math.min(parseInt(searchParams.get('days') ?? '7', 10), 30)

  const rows = await sql`
    SELECT exchange, rate, recorded_at
    FROM funding_snapshots
    WHERE recorded_at > NOW() - INTERVAL '1 day' * ${days}
    ORDER BY recorded_at ASC
  `

  return Response.json(rows, {
    headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
  })
}

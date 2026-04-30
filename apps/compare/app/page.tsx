import { FundingRateTable } from '../components/FundingRateTable'
import { FeeComparisonTable } from '../components/FeeComparisonTable'

export default function Page() {
  return (
    <main className="max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-2 text-white">PerpKit</h1>
      <p className="text-gray-400 text-sm mb-8">
        Perpetual futures exchange comparison — Binance · OKX · Gate
      </p>
      <FundingRateTable />
      <FeeComparisonTable />
    </main>
  )
}

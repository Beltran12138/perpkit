import { HistoryPageClient } from '../../components/history/HistoryPageClient'

export default function HistoryPage() {
  return (
    <main className="min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-8 mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          Historical Funding Rates
        </h1>
        <p className="text-gray-400 text-sm">
          BTC perpetual funding rates — updated every 15 minutes
        </p>
      </div>
      <div className="max-w-5xl mx-auto px-8">
        <HistoryPageClient />
      </div>
    </main>
  )
}

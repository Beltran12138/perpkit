import { FundingRateStory } from '../../components/learn/FundingRateStory'

export default function LearnPage() {
  return (
    <main className="min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-8 mb-12">
        <h1 className="text-2xl font-bold text-white mb-2">
          How Perpetual Futures Work
        </h1>
        <p className="text-gray-400 text-sm">
          Funding rate mechanisms across Binance · Hyperliquid · dYdX v4
        </p>
      </div>
      <FundingRateStory />
    </main>
  )
}

import { FundingCalculator } from '../../components/calculator/FundingCalculator'

export default function CalculatorPage() {
  return (
    <main className="min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Funding Cost Calculator
          </h1>
          <p className="text-gray-400 text-sm">
            Estimate the funding cost of holding a perpetual position across exchanges
          </p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
          <FundingCalculator />
        </div>
      </div>
    </main>
  )
}

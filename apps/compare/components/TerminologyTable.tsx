import type { TerminologyEntry } from '@perpkit/types'

const TERMINOLOGY: TerminologyEntry[] = [
  {
    concept: 'Funding Rate',
    binance: 'Funding Rate (資金費率)',
    okx: 'Funding Rate (資金費率)',
    gate: 'Funding Rate (資金費率)',
    description: '多空雙方定期結算的費率，維持合約價格與現貨錨定',
  },
  {
    concept: 'Mark Price',
    binance: 'Mark Price (標記價格)',
    okx: 'Mark Price (標記價格)',
    gate: 'Mark Price (標記價格)',
    description: '用於觸發強平的參考價格，基於現貨指數+基差平滑計算',
  },
  {
    concept: 'Liquidation',
    binance: 'Liquidation (強制平倉)',
    okx: 'Force Liquidation (強制平倉)',
    gate: 'Liquidation (強制平倉)',
    description: '當保證金率低於維持保證金率時觸發',
  },
  {
    concept: 'Maintenance Margin',
    binance: 'Maintenance Margin (維持保證金)',
    okx: 'Maintenance Margin (維持保證金)',
    gate: 'Maintenance Margin Ratio (維持保證金率)',
    description: '持倉所需的最低保證金，低於此值觸發強平',
  },
  {
    concept: 'ADL',
    binance: 'Auto-Deleveraging (自動減倉)',
    okx: 'Auto-Deleveraging (自動減倉)',
    gate: 'Auto Deleveraging (自動減倉)',
    description: '保險基金耗盡時，系統自動撮合對手方減倉',
  },
  {
    concept: 'Insurance Fund',
    binance: 'Insurance Fund (保險基金)',
    okx: 'Insurance Fund (保險基金)',
    gate: 'Insurance Fund (保險基金)',
    description: '吸收強平損失、防止 ADL 觸發的緩衝資金池',
  },
  {
    concept: 'Open Interest',
    binance: 'Open Interest (持倉量)',
    okx: 'Open Interest (持倉量)',
    gate: 'Open Interest (未平倉合約)',
    description: '當前未平倉合約的總數量或名義價值',
  },
]

export function TerminologyTable() {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-white mb-3">Terminology Comparison</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400 border-b border-gray-800">
            <th className="text-left py-2 w-36">Concept</th>
            <th className="text-left py-2">Binance</th>
            <th className="text-left py-2">OKX</th>
            <th className="text-left py-2">Gate</th>
            <th className="text-left py-2 text-gray-500">Description</th>
          </tr>
        </thead>
        <tbody>
          {TERMINOLOGY.map((t) => (
            <tr key={t.concept} className="border-b border-gray-800/50 align-top">
              <td className="py-3 font-medium text-white">{t.concept}</td>
              <td className="py-3 text-blue-300">{t.binance}</td>
              <td className="py-3 text-purple-300">{t.okx}</td>
              <td className="py-3 text-green-300">{t.gate}</td>
              <td className="py-3 text-gray-400 text-xs">{t.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

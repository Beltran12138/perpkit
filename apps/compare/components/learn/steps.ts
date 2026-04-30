export type VizMode = 'live' | 'formula' | 'sim' | 'countdown'

export interface Step {
  id: number
  title: string
  body: string
  vizMode: VizMode
}

export const STEPS: Step[] = [
  {
    id: 0,
    title: 'What is a Funding Rate?',
    body: 'The funding rate anchors a perpetual contract\'s price to the spot index. When longs outnumber shorts, longs pay shorts (positive rate). When shorts dominate, shorts pay longs (negative rate). Settlement happens every 8 hours. The viz panel on the right shows live rates across three protocols right now.',
    vizMode: 'live',
  },
  {
    id: 1,
    title: 'Why Do Rates Differ Across Protocols?',
    body: 'Each protocol uses a different algorithm. Binance applies an interest-rate correction on top of the premium index, capped at ±0.75%. Hyperliquid uses the raw premium index directly, same cap. dYdX v4 multiplies the premium by 0.125 (an 8-hour TWAP dampening factor) with tighter ±0.4% bounds. Same market conditions → different rates.',
    vizMode: 'formula',
  },
  {
    id: 2,
    title: 'Simulate: What Happens When OI Becomes Imbalanced?',
    body: 'Drag the slider to shift the long/short open interest ratio. A market dominated by longs pushes the premium index positive — longs pay shorts. An all-short market does the reverse. Notice how the tighter dYdX bounds smooth out extreme imbalances compared to Binance and Hyperliquid.',
    vizMode: 'sim',
  },
  {
    id: 3,
    title: 'Next Settlement Countdown',
    body: 'Funding settles at 00:00, 08:00, and 16:00 UTC. Holding a position through settlement triggers a fee debit or credit. The countdown shows time until each protocol\'s next settlement. Rates shown are the current scheduled rate — they can change up until settlement.',
    vizMode: 'countdown',
  },
]

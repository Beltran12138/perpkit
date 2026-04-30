'use client'

import { useEffect, useRef, useState } from 'react'
import type { FundingRate } from '@perpkit/types'
import { STEPS } from './steps'
import { StepSection } from './StepSection'
import { FundingRateViz } from './FundingRateViz'

type LiveResult = FundingRate | { exchange: string; error: string }

export function FundingRateStory() {
  const [activeStep, setActiveStep] = useState(0)
  const [longRatio, setLongRatio] = useState(0.5)
  const [liveRates, setLiveRates] = useState<FundingRate[] | null>(null)
  const [liveError, setLiveError] = useState(false)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  // Fetch live rates once on mount
  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/funding-rates', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<LiveResult[]>
      })
      .then((data) => {
        const rates = data.filter((r): r is FundingRate => !('error' in r))
        setLiveRates(rates)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setLiveError(true)
      })
    return () => controller.abort()
  }, [])

  // IntersectionObserver: update activeStep when a step enters viewport
  useEffect(() => {
    const observers: IntersectionObserver[] = []
    stepRefs.current.forEach((el, idx) => {
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveStep(idx)
        },
        { threshold: 0.5 },
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((obs) => obs.disconnect())
  }, [])

  return (
    <div className="flex gap-12 max-w-5xl mx-auto px-8">
      {/* Left: scrolling prose */}
      <div className="flex-1 min-w-0">
        {STEPS.map((step, idx) => (
          <StepSection
            key={step.id}
            ref={(el) => {
              stepRefs.current[idx] = el
            }}
            title={step.title}
            body={step.body}
            isActive={activeStep === idx}
          />
        ))}
        {/* Spacer so the last step can reach the 50% threshold */}
        <div className="min-h-[50vh]" />
      </div>

      {/* Right: sticky viz */}
      <div className="w-80 flex-shrink-0">
        <div className="sticky top-8">
          <FundingRateViz
            vizMode={STEPS[activeStep]?.vizMode ?? STEPS[0].vizMode}
            longRatio={longRatio}
            onLongRatioChange={setLongRatio}
            liveRates={liveRates}
            liveError={liveError}
          />
        </div>
      </div>
    </div>
  )
}

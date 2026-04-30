import { forwardRef } from 'react'

interface StepSectionProps {
  title: string
  body: string
  isActive: boolean
}

export const StepSection = forwardRef<HTMLDivElement, StepSectionProps>(
  ({ title, body, isActive }, ref) => (
    <div
      ref={ref}
      className={`min-h-[70vh] py-16 pr-8 transition-opacity duration-500 ${
        isActive ? 'opacity-100' : 'opacity-30'
      }`}
    >
      <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
      <p className="text-gray-300 leading-relaxed max-w-prose">{body}</p>
    </div>
  ),
)
StepSection.displayName = 'StepSection'

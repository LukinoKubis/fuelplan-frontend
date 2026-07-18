import { useEffect, useState } from 'react'

const LOADER_STEPS = [
  { headline: 'Building your plan', sub: 'Claude is reading your profile…', progress: 8 },
  { headline: 'Crunching macros', sub: 'Calculating your daily targets…', progress: 28 },
  { headline: 'Designing your meals', sub: "Crafting 7 days of food you'll love…", progress: 52 },
  { headline: 'Writing prep steps', sub: 'Planning your Sunday batch cook…', progress: 74 },
  { headline: 'Building your haul', sub: 'Compiling the shopping list…', progress: 90 },
  { headline: 'Almost ready', sub: 'Putting the finishing touches…', progress: 97 },
]

interface LoadingOverlayProps {
  onCancel: () => void
}

export function LoadingOverlay({ onCancel }: LoadingOverlayProps) {
  const [step, setStep] = useState(0)
  const [showCancel, setShowCancel] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => Math.min(s + 1, LOADER_STEPS.length - 1))
    }, 3200)
    const cancelTimer = setTimeout(() => setShowCancel(true), 3000)
    return () => {
      clearInterval(interval)
      clearTimeout(cancelTimer)
    }
  }, [])

  const current = LOADER_STEPS[step]

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center gap-6 bg-bg px-8">
      <svg width="56" height="56" viewBox="0 0 48 48" fill="none" className="animate-pulse">
        <rect width="48" height="48" rx="14" fill="#c8f542" />
        <path d="M25 7L13 27h12l-4 14 18-22H27L31 7H25z" fill="#0e0f11" />
      </svg>
      <div className="text-center">
        <h2 className="mb-1.5 text-xl text-text">{current.headline}</h2>
        <p className="text-sm text-muted">{current.sub}</p>
      </div>
      <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-lime transition-all duration-700" style={{ width: `${current.progress}%` }} />
      </div>
      <button
        onClick={onCancel}
        className="text-sm text-muted underline underline-offset-2 transition-opacity"
        style={{ opacity: showCancel ? 1 : 0, pointerEvents: showCancel ? 'auto' : 'none' }}
      >
        Cancel
      </button>
    </div>
  )
}

import { Suspense, lazy } from 'react'

// Code-split: the exercise library (~850KB of JSON + images) should never
// be part of the initial bundle for users who only use Fuel.
const ExerciseLibrary = lazy(() => import('../components/exercises/ExerciseLibrary').then((m) => ({ default: m.ExerciseLibrary })))

export function TrainSection() {
  return (
    <div>
      <div className="border-b border-border bg-card px-4 py-3">
        <h2 className="text-lg text-text">Exercise Library</h2>
        <p className="text-xs text-muted">Browse the full library — sport-specific workout builder is coming in Phase 3.</p>
      </div>
      <Suspense fallback={<div className="p-8 text-center text-sm text-muted">Loading…</div>}>
        <ExerciseLibrary />
      </Suspense>
    </div>
  )
}

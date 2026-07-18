import { Suspense, lazy, useRef, useState } from 'react'
import { useTrain } from '../state/TrainContext'
import { useAccount } from '../state/AccountContext'
import { TrainSetup } from '../components/train/TrainSetup'
import { WorkoutDayView } from '../components/train/WorkoutDayView'
import { DayTabs } from '../components/fuel/DayTabs'
import { LoadingOverlay } from '../components/shared/LoadingOverlay'
import { ErrorPanel } from '../components/shared/ErrorPanel'
import { loadExercises } from '../data/exercises'
import { buildWorkoutRequest, filterEligibleExercises } from '../api/generateWorkoutPrompt'
import { ApiError, postClaude } from '../api/client'
import type { Exercise } from '../types/exercise'
import type { WorkoutPlan } from '../types/workout'

const ExerciseLibrary = lazy(() => import('../components/exercises/ExerciseLibrary').then((m) => ({ default: m.ExerciseLibrary })))

type SubTab = 'workouts' | 'library'

export function TrainSection() {
  const { trainProfile, setTrainProfile, workoutPlan, setWorkoutPlan, clearWorkoutPlan } = useTrain()
  const { code } = useAccount()
  const [subTab, setSubTab] = useState<SubTab>('workouts')
  const [activeDay, setActiveDay] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<{ message: string; isOutOfPlans: boolean } | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  async function handleGenerate() {
    if (!navigator.onLine) {
      setError({ message: "You're offline — connect to generate a workout plan", isOutOfPlans: false })
      return
    }
    const trimmedCode = code.trim().toUpperCase()
    if (!trimmedCode) {
      setError({ message: 'Enter your activation code in Fuel first.', isOutOfPlans: false })
      return
    }

    setLoading(true)
    setError(null)
    abortRef.current = new AbortController()

    try {
      const all = await loadExercises()
      const candidates = filterEligibleExercises(all, trainProfile)
      const { system, messages, model, max_tokens } = buildWorkoutRequest({ profile: trainProfile, candidates })
      const response = await postClaude({ activationCode: trimmedCode, model, max_tokens, system, messages }, abortRef.current.signal)
      const rawText = response.content[0]?.text || ''
      const cleaned = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim()

      let plan: WorkoutPlan
      try {
        plan = JSON.parse(cleaned)
      } catch {
        const match = cleaned.match(/\{[\s\S]*\}/)
        if (!match) throw new Error('Claude returned invalid JSON. Please try again.')
        plan = JSON.parse(match[0])
      }

      setWorkoutPlan(plan)
      setActiveDay(0)
      setLoading(false)
    } catch (err) {
      setLoading(false)
      if (err instanceof DOMException && err.name === 'AbortError') return
      if (err instanceof ApiError) {
        setError({ message: err.message, isOutOfPlans: err.status === 402 })
      } else {
        setError({ message: (err as Error).message || 'Unknown error occurred.', isOutOfPlans: false })
      }
    }
  }

  if (loading) return <LoadingOverlay onCancel={() => { abortRef.current?.abort(); setLoading(false) }} />
  if (error)
    return (
      <ErrorPanel
        message={error.message}
        isOutOfPlans={error.isOutOfPlans}
        onRetry={() => {
          setError(null)
          handleGenerate()
        }}
        onDismiss={() => setError(null)}
        onTopUp={() => {
          window.location.href = 'https://fuelplan.fit/?buy=1'
        }}
      />
    )

  return (
    <div>
      <div className="flex border-b border-border bg-card px-4">
        {(['workouts', 'library'] as SubTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setSubTab(t)}
            className="border-b-2 px-3 py-3 text-sm font-semibold capitalize"
            style={{ borderColor: subTab === t ? 'var(--lime)' : 'transparent', color: subTab === t ? 'var(--lime)' : 'var(--muted)' }}
          >
            {t === 'workouts' ? 'Workouts' : 'Library'}
          </button>
        ))}
      </div>

      {subTab === 'library' && (
        <Suspense fallback={<div className="p-8 text-center text-sm text-muted">Loading…</div>}>
          <ExerciseLibrary />
        </Suspense>
      )}

      {subTab === 'workouts' &&
        (!workoutPlan ? (
          <TrainSetup profile={trainProfile} onChange={setTrainProfile} onGenerate={handleGenerate} />
        ) : (
          <WorkoutWeekView workoutPlan={workoutPlan} activeDay={activeDay} setActiveDay={setActiveDay} onRegenerate={clearWorkoutPlan} />
        ))}
    </div>
  )
}

function WorkoutWeekView({
  workoutPlan,
  activeDay,
  setActiveDay,
  onRegenerate,
}: {
  workoutPlan: WorkoutPlan
  activeDay: number
  setActiveDay: (i: number) => void
  onRegenerate: () => void
}) {
  const [exercises, setExercises] = useState<Exercise[] | null>(null)
  if (exercises === null) {
    loadExercises().then(setExercises)
    return <div className="p-8 text-center text-sm text-muted">Loading…</div>
  }
  const exerciseMap = new Map(exercises.map((e) => [e.id, e]))
  const day = workoutPlan.days[Math.min(activeDay, workoutPlan.days.length - 1)]

  return (
    <div>
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2.5">
        <span className="text-xs text-muted">Weekly workout plan</span>
        <button onClick={onRegenerate} className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-muted">
          New Plan
        </button>
      </div>
      <DayTabs days={workoutPlan.days.map((d) => d.day)} active={activeDay} onChange={setActiveDay} />
      <WorkoutDayView workout={day} exerciseMap={exerciseMap} />
    </div>
  )
}

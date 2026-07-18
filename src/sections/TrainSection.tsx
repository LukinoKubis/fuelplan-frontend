import { Suspense, lazy, useState } from 'react'
import { useTrain } from '../state/TrainContext'
import { TrainSetup } from '../components/train/TrainSetup'
import { WorkoutDayView } from '../components/train/WorkoutDayView'
import { StretchSetup } from '../components/train/StretchSetup'
import { StretchRoutineView } from '../components/train/StretchRoutineView'
import { DayTabs } from '../components/fuel/DayTabs'
import { LoadingOverlay } from '../components/shared/LoadingOverlay'
import { ErrorPanel } from '../components/shared/ErrorPanel'
import { loadExercises } from '../data/exercises'
import { buildWorkoutRequest } from '../api/generateWorkoutPrompt'
import { buildStretchRequest } from '../api/generateStretchPrompt'
import { useGeneration } from '../api/useGeneration'
import { validateStretchPlan, validateWorkoutPlan } from '../api/validateGenerated'
import type { Exercise } from '../types/exercise'
import type { WorkoutPlan } from '../types/workout'

const ExerciseLibrary = lazy(() => import('../components/exercises/ExerciseLibrary').then((m) => ({ default: m.ExerciseLibrary })))

type SubTab = 'workouts' | 'stretch' | 'library'

function useLibrary() {
  const [exercises, setExercises] = useState<Exercise[] | null>(null)
  if (exercises === null) loadExercises().then(setExercises)
  return exercises
}

export function TrainSection() {
  const { trainProfile, setTrainProfile, workoutPlan, setWorkoutPlan, clearWorkoutPlan, stretchPrefs, setStretchPrefs, stretchPlan, setStretchPlan, clearStretchPlan } =
    useTrain()
  const [subTab, setSubTab] = useState<SubTab>('workouts')
  const [activeDay, setActiveDay] = useState(0)
  const workoutGen = useGeneration<unknown>()
  const stretchGen = useGeneration<unknown>()
  const exercises = useLibrary()

  function handleBuyPlans() {
    window.location.href = 'https://fuelplan.fit/?buy=1'
  }

  async function handleGenerateWorkout() {
    const all = exercises || (await loadExercises())
    workoutGen.run(
      () => buildWorkoutRequest({ profile: trainProfile, allExercises: all }),
      (raw) => {
        setWorkoutPlan(validateWorkoutPlan(raw))
        setActiveDay(0)
      }
    )
  }

  async function handleGenerateStretch() {
    const all = exercises || (await loadExercises())
    stretchGen.run(
      () => buildStretchRequest({ prefs: stretchPrefs, allExercises: all }),
      (raw) => setStretchPlan(validateStretchPlan(raw, stretchPrefs.amDurationMin, stretchPrefs.pmDurationMin))
    )
  }

  const activeGen = subTab === 'workouts' ? workoutGen : subTab === 'stretch' ? stretchGen : null

  if (activeGen?.loading) return <LoadingOverlay onCancel={activeGen.cancel} />
  if (activeGen?.error)
    return (
      <ErrorPanel
        message={activeGen.error.message}
        isOutOfPlans={activeGen.error.isOutOfPlans}
        onRetry={() => {
          activeGen.setError(null)
          subTab === 'workouts' ? handleGenerateWorkout() : handleGenerateStretch()
        }}
        onDismiss={() => activeGen.setError(null)}
        onTopUp={handleBuyPlans}
      />
    )

  return (
    <div>
      <div className="flex border-b border-border bg-card px-4">
        {(['workouts', 'stretch', 'library'] as SubTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setSubTab(t)}
            className="border-b-2 px-3 py-3 text-sm font-semibold capitalize"
            style={{ borderColor: subTab === t ? 'var(--lime)' : 'transparent', color: subTab === t ? 'var(--lime)' : 'var(--muted)' }}
          >
            {t === 'workouts' ? 'Workouts' : t === 'stretch' ? 'Stretch' : 'Library'}
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
          <TrainSetup profile={trainProfile} onChange={setTrainProfile} onGenerate={handleGenerateWorkout} />
        ) : !exercises ? (
          <div className="p-8 text-center text-sm text-muted">Loading…</div>
        ) : (
          <WorkoutWeekView workoutPlan={workoutPlan} exercises={exercises} activeDay={activeDay} setActiveDay={setActiveDay} onRegenerate={clearWorkoutPlan} />
        ))}

      {subTab === 'stretch' &&
        (!stretchPlan ? (
          <StretchSetup prefs={stretchPrefs} onChange={setStretchPrefs} onGenerate={handleGenerateStretch} />
        ) : !exercises ? (
          <div className="p-8 text-center text-sm text-muted">Loading…</div>
        ) : (
          <StretchRoutineView plan={stretchPlan} exerciseMap={new Map(exercises.map((e) => [e.id, e]))} onRegenerate={clearStretchPlan} />
        ))}
    </div>
  )
}

function WorkoutWeekView({
  workoutPlan,
  exercises,
  activeDay,
  setActiveDay,
  onRegenerate,
}: {
  workoutPlan: WorkoutPlan
  exercises: Exercise[]
  activeDay: number
  setActiveDay: (i: number) => void
  onRegenerate: () => void
}) {
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

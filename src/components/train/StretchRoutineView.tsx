import { useState } from 'react'
import type { StretchPlan, StretchRoutine } from '../../types/stretch'
import type { Exercise } from '../../types/exercise'
import { ExerciseDetail } from '../exercises/ExerciseDetail'
import { useTrain } from '../../state/TrainContext'

function RoutineCard({ routine, label, exerciseMap }: { routine: StretchRoutine | null; label: string; exerciseMap: Map<string, Exercise> }) {
  const { completedStretches, toggleStretchComplete } = useTrain()
  const [detail, setDetail] = useState<Exercise | null>(null)

  if (!routine) return null

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wide text-lime">{label}</h3>
        <span className="text-xs text-muted">{routine.durationMin} min</span>
      </div>
      <div className="space-y-2">
        {routine.exercises.map((se, i) => {
          const exercise = exerciseMap.get(se.exerciseId)
          const id = `${routine.time}-${i}-${se.exerciseId}`
          const done = !!completedStretches[id]
          return (
            <div key={id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-2.5" style={{ opacity: done ? 0.6 : 1 }}>
              <button onClick={() => exercise && setDetail(exercise)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-bg2">
                  {exercise?.images[0] ? (
                    <img src={exercise.images[0]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                        <circle cx="12" cy="4" r="2" />
                        <path d="M12 6v6l-4 4M12 12l4 4M6 20h12" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-text">{exercise?.name || se.exerciseId}</div>
                  <div className="text-xs text-muted">Hold {se.holdSeconds}s</div>
                </div>
              </button>
              <button
                onClick={() => toggleStretchComplete(id)}
                className="shrink-0 rounded-lg border px-2.5 py-1.5 text-xs font-bold"
                style={{
                  borderColor: done ? 'var(--lime)' : 'var(--border)',
                  background: done ? 'rgba(200,245,66,0.15)' : 'transparent',
                  color: done ? 'var(--lime)' : 'var(--muted)',
                }}
              >
                {done ? '✓' : 'Done'}
              </button>
            </div>
          )
        })}
      </div>
      {detail && <ExerciseDetail exercise={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}

export function StretchRoutineView({
  plan,
  exerciseMap,
  onRegenerate,
}: {
  plan: StretchPlan
  exerciseMap: Map<string, Exercise>
  onRegenerate: () => void
}) {
  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs text-muted">AM/PM stretch routines</span>
        <button onClick={onRegenerate} className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-muted">
          New Routines
        </button>
      </div>
      <RoutineCard routine={plan.am} label="Morning" exerciseMap={exerciseMap} />
      <RoutineCard routine={plan.pm} label="Evening" exerciseMap={exerciseMap} />
    </div>
  )
}

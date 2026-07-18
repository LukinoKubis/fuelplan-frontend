import { useState } from 'react'
import type { DayWorkout } from '../../types/workout'
import type { Exercise } from '../../types/exercise'
import { ExerciseDetail } from '../exercises/ExerciseDetail'
import { useTrain } from '../../state/TrainContext'

export function WorkoutDayView({ workout, exerciseMap }: { workout: DayWorkout; exerciseMap: Map<string, Exercise> }) {
  const { completedSets, toggleSetComplete } = useTrain()
  const [detail, setDetail] = useState<Exercise | null>(null)

  if (!workout.exercises.length) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 px-8 text-center">
        <h3 className="text-lg text-text">Rest day</h3>
        <p className="text-sm text-muted">No workout scheduled — recover for the next session.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 p-4">
      {workout.sport && <div className="mb-1 text-xs font-bold uppercase tracking-wide text-lime">{workout.sport} day</div>}
      {workout.exercises.map((we, i) => {
        const exercise = exerciseMap.get(we.exerciseId)
        const id = `${workout.day}-${i}-${we.exerciseId}`
        const done = !!completedSets[id]
        return (
          <div key={id} className="rounded-2xl border border-border bg-card p-4" style={{ opacity: done ? 0.6 : 1 }}>
            <button onClick={() => exercise && setDetail(exercise)} className="mb-2 flex w-full items-center gap-3 text-left">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-bg2">
                {exercise?.images[0] ? (
                  <img src={exercise.images[0]} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <rect x="4" y="9" width="16" height="6" rx="1" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-text">{exercise?.name || we.exerciseId}</div>
                <div className="text-xs text-muted">
                  {we.sets} sets × {we.reps}
                </div>
              </div>
            </button>
            {we.notes && <p className="mb-3 text-xs italic text-muted">{we.notes}</p>}
            <button
              onClick={() => toggleSetComplete(id)}
              className="w-full rounded-lg border py-2 text-xs font-bold transition-colors"
              style={{
                borderColor: done ? 'var(--lime)' : 'var(--border)',
                background: done ? 'rgba(200,245,66,0.15)' : 'transparent',
                color: done ? 'var(--lime)' : 'var(--muted)',
              }}
            >
              {done ? '✓ Done' : 'Mark as done'}
            </button>
          </div>
        )
      })}

      {detail && <ExerciseDetail exercise={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}

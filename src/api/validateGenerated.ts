// Normalizes/validates AI-generated JSON before it ever reaches state or a
// render — an LLM response that's valid JSON but doesn't quite match the
// expected shape (missing an `exercises` array, a day with no `notes`
// field, etc.) must never crash a component; it should either get
// defaulted to something safe or throw here so it surfaces as a friendly
// error message instead of a blank screen.
import type { DayWorkout, WorkoutExercise, WorkoutPlan } from '../types/workout'
import type { StretchExercise, StretchPlan, StretchRoutine } from '../types/stretch'

function asWorkoutExercise(raw: unknown): WorkoutExercise | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  if (typeof r.exerciseId !== 'string') return null
  return {
    exerciseId: r.exerciseId,
    sets: typeof r.sets === 'number' ? r.sets : 3,
    reps: typeof r.reps === 'string' ? r.reps : '10',
    notes: typeof r.notes === 'string' ? r.notes : undefined,
  }
}

export function validateWorkoutPlan(raw: unknown): WorkoutPlan {
  if (!raw || typeof raw !== 'object' || !Array.isArray((raw as Record<string, unknown>).days)) {
    throw new Error('Claude returned an unexpected workout format. Please try again.')
  }
  const days: DayWorkout[] = (raw as { days: unknown[] }).days
    .map((d): DayWorkout | null => {
      if (!d || typeof d !== 'object') return null
      const dr = d as Record<string, unknown>
      if (typeof dr.day !== 'string') return null
      const exercises = Array.isArray(dr.exercises) ? dr.exercises.map(asWorkoutExercise).filter((e): e is WorkoutExercise => !!e) : []
      return { day: dr.day as DayWorkout['day'], sport: typeof dr.sport === 'string' ? (dr.sport as DayWorkout['sport']) : undefined, exercises }
    })
    .filter((d): d is DayWorkout => !!d)

  if (!days.length) throw new Error('Claude returned an empty workout plan. Please try again.')
  return { days }
}

function asStretchExercise(raw: unknown): StretchExercise | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  if (typeof r.exerciseId !== 'string') return null
  return { exerciseId: r.exerciseId, holdSeconds: typeof r.holdSeconds === 'number' ? r.holdSeconds : 30 }
}

function asStretchRoutine(raw: unknown, time: 'am' | 'pm', fallbackDuration: number): StretchRoutine | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const exercises = Array.isArray(r.exercises) ? r.exercises.map(asStretchExercise).filter((e): e is StretchExercise => !!e) : []
  if (!exercises.length) return null
  return { time, durationMin: typeof r.durationMin === 'number' ? r.durationMin : fallbackDuration, exercises }
}

export function validateStretchPlan(raw: unknown, fallbackAm: number, fallbackPm: number): StretchPlan {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Claude returned an unexpected stretch routine format. Please try again.')
  }
  const r = raw as Record<string, unknown>
  const am = asStretchRoutine(r.am, 'am', fallbackAm)
  const pm = asStretchRoutine(r.pm, 'pm', fallbackPm)
  if (!am && !pm) throw new Error('Claude returned an empty stretch plan. Please try again.')
  return { am, pm }
}

export type StretchTime = 'am' | 'pm'

export interface StretchExercise {
  exerciseId: string
  holdSeconds: number
}

export interface StretchRoutine {
  time: StretchTime
  durationMin: number
  exercises: StretchExercise[]
}

export interface StretchPlan {
  am: StretchRoutine | null
  pm: StretchRoutine | null
}

export interface StretchPrefs {
  amDurationMin: number
  pmDurationMin: number
  focusAreas: string
}

export function defaultStretchPrefs(): StretchPrefs {
  return { amDurationMin: 8, pmDurationMin: 12, focusAreas: '' }
}

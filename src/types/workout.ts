import type { SportTag } from './exercise'

export const EQUIPMENT_OPTIONS = [
  'body only',
  'dumbbell',
  'barbell',
  'kettlebells',
  'bands',
  'cable',
  'machine',
  'medicine ball',
  'exercise ball',
  'foam roll',
  'pool access',
] as const

export type Equipment = (typeof EQUIPMENT_OPTIONS)[number]

export const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const

export interface TrainDayPlan {
  day: (typeof WEEK_DAYS)[number]
  type: 'training' | 'rest'
  sport?: SportTag
}

export interface TrainProfile {
  sports: SportTag[]
  equipment: Equipment[]
  weekPlan: TrainDayPlan[]
  goals: string
  limitations: string
}

export function defaultTrainProfile(): TrainProfile {
  return {
    sports: ['general'],
    equipment: ['body only'],
    weekPlan: WEEK_DAYS.map((day, i) => ({ day, type: i % 2 === 0 ? 'training' : 'rest' })),
    goals: '',
    limitations: '',
  }
}

export interface WorkoutExercise {
  exerciseId: string
  sets: number
  reps: string
  notes?: string
}

export interface DayWorkout {
  day: (typeof WEEK_DAYS)[number]
  sport?: SportTag
  exercises: WorkoutExercise[]
}

export interface WorkoutPlan {
  days: DayWorkout[]
}

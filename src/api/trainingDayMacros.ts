import type { Macros } from '../types/plan'
import type { TrainDayPlan } from '../types/workout'

// Training days get extra calories, almost entirely from carbs (a common
// "carb cycling" approach) — protein and fat stay at the rest-day baseline
// since they're driven by body weight/goals, not the day's training load.
export const TRAINING_DAY_KCAL_BONUS = 300
export const TRAINING_DAY_CARB_BONUS_G = 75

export function applyTrainingDayAdjustment(base: Macros, dayType: 'training' | 'rest'): Macros {
  if (dayType === 'rest') return base
  return {
    ...base,
    kcal: base.kcal + TRAINING_DAY_KCAL_BONUS,
    carbs: base.carbs + TRAINING_DAY_CARB_BONUS_G,
  }
}

export function getDayType(day: string, weekPlan: TrainDayPlan[] | undefined): 'training' | 'rest' | null {
  if (!weekPlan?.length) return null
  const match = weekPlan.find((d) => d.day === day)
  return match?.type ?? null
}

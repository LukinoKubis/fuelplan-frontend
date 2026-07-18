import type { Macros } from '../types/plan'
import type { Profile, Sex } from '../types/profile'

// Ported as-is from the old calcMacros() — Mifflin-St Jeor BMR, 25% fat, protein at 2.2g/kg.
export function calculateMacros(params: { weight: number; height: number; age: number; sex: Sex; activity: number; goalOffset: number }): {
  macros: Macros
  tdee: number
} {
  const { weight, height, age, sex, activity, goalOffset } = params
  const bmr = sex === 'male' ? 10 * weight + 6.25 * height - 5 * age + 5 : 10 * weight + 6.25 * height - 5 * age - 161

  const tdee = Math.round(bmr * activity)
  const kcal = Math.max(1200, tdee + goalOffset)
  const protein = Math.round(2.2 * weight)
  const fat = Math.round((kcal * 0.25) / 9)
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4))

  return { macros: { kcal, protein, carbs, fat }, tdee }
}

export type GoalWeightWarning = 'ok' | 'info' | 'warn' | 'danger'

export interface GoalWeightResult {
  totalChangeKg: number
  weeksNeeded: number
  projectedDate: string
  dailyDiff: number
  cappedDailyDiff: number
  warning: GoalWeightWarning
  warningText: string
  isLosing: boolean
}

const MAX_KG_PER_WEEK = 1.5

// Ported as-is from the old calcGoalWeight() — derives a daily kcal offset
// from a target weight + a chosen weekly rate, with safety-rail warnings.
export function calculateGoalWeight(currentWeight: number, goalWeight: number, weeklyRate: number): GoalWeightResult {
  const totalChange = currentWeight - goalWeight // positive = want to lose
  const effectiveRate = totalChange >= 0 ? Math.abs(weeklyRate) : -Math.abs(weeklyRate)
  const weeksNeeded = totalChange !== 0 ? Math.abs(totalChange) / Math.abs(effectiveRate) : 0
  const dailyDiff = (effectiveRate * 7700) / 7 // positive = deficit

  const projDate = new Date()
  projDate.setDate(projDate.getDate() + Math.ceil(weeksNeeded * 7))

  let cappedDiff = dailyDiff
  let warning: GoalWeightWarning = 'ok'
  let warningText = ''

  if (totalChange === 0) {
    warningText = 'Already at goal weight! Plan will be set to maintenance.'
    warning = 'ok'
    cappedDiff = 0
  } else if (totalChange > 0) {
    // losing weight
    if (weeklyRate > MAX_KG_PER_WEEK) {
      cappedDiff = (MAX_KG_PER_WEEK * 7700) / 7
      warning = 'danger'
      warningText = '1.5kg/week is the absolute maximum. Extreme deficit — only if medically supervised. High protein (2.5g+/kg) is essential.'
    } else if (weeklyRate >= 1.0) {
      warning = 'warn'
      warningText = 'Very intense cut. Maintain protein at 2.2g+/kg to preserve muscle. Monitor energy and strength.'
    } else if (weeklyRate >= 0.75) {
      warning = 'info'
      warningText = 'Aggressive cut. Achievable with discipline and high protein. Watch for fatigue.'
    } else {
      warning = 'ok'
      warningText = 'Sustainable pace. Safe and effective — you’ll preserve muscle while losing fat.'
    }
  } else {
    // gaining
    if (weeklyRate >= 0.75) {
      warning = 'info'
      warningText = 'Fast bulk — expect some fat gain. Ideal lean bulk is 0.25–0.5kg/week.'
    } else {
      warning = 'ok'
      warningText = 'Lean bulk pace. Great for muscle gain with minimal fat.'
    }
  }

  return {
    totalChangeKg: totalChange,
    weeksNeeded,
    projectedDate: projDate.toISOString().slice(0, 10),
    dailyDiff,
    cappedDailyDiff: cappedDiff,
    warning,
    warningText,
    isLosing: totalChange >= 0,
  }
}

// Resolves a profile down to the macro targets that should actually be sent
// with a generate request — manual entry, or the calc-mode result (goal
// preset offset, or the offset implied by a target-weight + pace).
export function resolveProfileMacros(profile: Profile): Macros | null {
  if (profile.mode === 'manual') {
    const kcal = parseInt(profile.mKcal, 10)
    const protein = parseInt(profile.mProtein, 10)
    const carbs = parseInt(profile.mCarbs, 10)
    const fat = parseInt(profile.mFat, 10)
    if (!kcal || !protein || !carbs || !fat) return null
    return { kcal, protein, carbs, fat }
  }

  const weight = parseFloat(profile.weight)
  const height = parseFloat(profile.height)
  const age = parseFloat(profile.age)
  const activity = parseFloat(profile.activity)
  if (!weight || !height || !age) return null

  let goalOffset = profile.goalOffset
  if (profile.goalMode === 'target') {
    const goalWeight = parseFloat(profile.goalWeight)
    if (weight && goalWeight) {
      const result = calculateGoalWeight(weight, goalWeight, profile.goalWeeklyRate)
      goalOffset = -Math.round(result.cappedDailyDiff)
    } else {
      goalOffset = 0
    }
  }

  return calculateMacros({ weight, height, age, sex: profile.sex, activity, goalOffset }).macros
}

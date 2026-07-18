export interface GoalPreset {
  offset: number
  name: string
  color: string
  wide?: boolean
}

// Ported as-is from the old survey's goal-card grid.
export const GOAL_PRESETS: GoalPreset[] = [
  { offset: 200, name: 'Lean Bulk', color: '#c8f542' },
  { offset: 400, name: 'Bulking', color: '#a8e832' },
  { offset: 600, name: 'Aggressive Bulk', color: '#82cc1e', wide: true },
  { offset: 0, name: 'Maintaining', color: '#57a9ff', wide: true },
  { offset: -300, name: 'Cutting', color: '#ff9a42' },
  { offset: -500, name: 'Intense Cut', color: '#ff7b7b' },
  { offset: -750, name: 'Aggressive Cut', color: '#ff5757', wide: true },
]

export function formatGoalOffset(offset: number): string {
  if (offset === 0) return '±0'
  return offset > 0 ? `+${offset}` : `${offset}`
}

export function goalLabel(offset: number): string {
  const preset = GOAL_PRESETS.find((g) => g.offset === offset)
  const name = preset?.name || 'Maintaining'
  return `${name} (${formatGoalOffset(offset)})`
}

export interface PaceCategory {
  label: string
  desc: string
  color: string
}

// Ported as-is from the old _getPaceCategory().
export function getPaceCategory(rate: number): PaceCategory {
  if (rate < 0.15) return { label: 'Maintaining', desc: 'Holding weight — no deficit', color: 'var(--blue)' }
  if (rate < 0.35) return { label: 'Gentle cut', desc: 'Small deficit · very sustainable long-term', color: 'var(--lime)' }
  if (rate < 0.65) return { label: 'Moderate cut', desc: 'Steady fat loss · muscle preserved', color: 'var(--lime)' }
  if (rate < 0.9) return { label: 'Aggressive cut', desc: 'Significant deficit — keep protein above 2g/kg', color: '#ffb742' }
  if (rate < 1.2) return { label: 'Very aggressive', desc: 'Intense cut — 4–6 weeks max. Monitor strength.', color: 'var(--orange)' }
  return { label: 'Extreme cut', desc: 'Maximum deficit — medical supervision recommended', color: 'var(--red)' }
}

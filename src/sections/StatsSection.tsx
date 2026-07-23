import { usePlan } from '../state/PlanContext'
import { ComingSoon } from '../components/shared/ComingSoon'

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-2xl font-bold text-text">{value}</div>
      <div className="text-xs font-semibold text-muted">{label}</div>
      {sub && <div className="mt-1 text-[11px] text-muted">{sub}</div>}
    </div>
  )
}

export function StatsSection() {
  const { plan, eaten } = usePlan()

  if (!plan) {
    return <ComingSoon title="Stats" description="Generate a meal plan to start tracking progress." />
  }

  let mealsEaten = 0
  let mealsTotal = 0
  plan.days.forEach((d) => {
    mealsTotal += d.meals.length
    d.meals.forEach((_, i) => {
      if (eaten[`${d.day}-${i}`]) mealsEaten += 1
    })
  })

  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Meals eaten this week" value={`${mealsEaten}/${mealsTotal}`} />
      </div>
    </div>
  )
}

import { usePlan } from '../state/PlanContext'
import { useTrain } from '../state/TrainContext'
import { WEEK_DAYS } from '../types/workout'
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

function isDayFullyDone(dayExerciseCount: number, day: string, completedSets: Record<string, boolean>, exerciseIds: string[]) {
  if (!dayExerciseCount) return false
  return exerciseIds.every((_, i) => completedSets[`${day}-${i}-${exerciseIds[i]}`])
}

export function StatsSection() {
  const { plan, eaten } = usePlan()
  const { workoutPlan, completedSets, stretchPlan, completedStretches } = useTrain()

  if (!plan && !workoutPlan) {
    return <ComingSoon title="Stats" description="Generate a meal plan or workout plan to start tracking progress." />
  }

  let mealsEaten = 0
  let mealsTotal = 0
  if (plan) {
    plan.days.forEach((d) => {
      mealsTotal += d.meals.length
      d.meals.forEach((_, i) => {
        if (eaten[`${d.day}-${i}`]) mealsEaten += 1
      })
    })
  }

  let workoutsDone = 0
  let workoutsTotal = 0
  const dayDoneMap: Record<string, boolean> = {}
  if (workoutPlan) {
    workoutPlan.days.forEach((d) => {
      if (!d.exercises.length) return
      workoutsTotal += 1
      const ids = d.exercises.map((e) => e.exerciseId)
      const done = isDayFullyDone(d.exercises.length, d.day, completedSets, ids)
      dayDoneMap[d.day] = done
      if (done) workoutsDone += 1
    })
  }

  const todayIdx = WEEK_DAYS.indexOf(new Date().toLocaleDateString('en-US', { weekday: 'long' }) as (typeof WEEK_DAYS)[number])
  let streak = 0
  if (workoutPlan) {
    for (let i = todayIdx; i >= 0; i--) {
      const day = WEEK_DAYS[i]
      const scheduled = workoutPlan.days.find((d) => d.day === day)
      if (!scheduled || !scheduled.exercises.length) continue
      if (dayDoneMap[day]) streak += 1
      else break
    }
  }

  const stretchDoneCount = Object.values(completedStretches).filter(Boolean).length

  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-3">
        {plan && <StatCard label="Meals eaten this week" value={`${mealsEaten}/${mealsTotal}`} />}
        {workoutPlan && <StatCard label="Workouts completed" value={`${workoutsDone}/${workoutsTotal}`} />}
        {workoutPlan && <StatCard label="Current streak" value={`${streak} day${streak === 1 ? '' : 's'}`} sub="Consecutive training days done" />}
        {stretchPlan && <StatCard label="Stretch sessions logged" value={`${stretchDoneCount}`} />}
      </div>

      {!workoutPlan && (
        <div className="rounded-2xl border border-border bg-card p-4 text-center text-sm text-muted">
          Set up a training week in the Train tab to track workout streaks.
        </div>
      )}
    </div>
  )
}

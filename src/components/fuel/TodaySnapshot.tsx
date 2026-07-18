import { usePlan } from '../../state/PlanContext'
import { useTrain } from '../../state/TrainContext'
import type { Plan } from '../../types/plan'
import { getDayType } from '../../api/trainingDayMacros'

function parseMealHour(time: string): number {
  const match = time.match(/(\d{1,2}):(\d{2})/)
  if (!match) return 0
  return parseInt(match[1], 10) + parseInt(match[2], 10) / 60
}

function findNextMeal(plan: Plan, todayName: string) {
  const today = plan.days.find((d) => d.day === todayName)
  if (!today) return null
  const nowHour = new Date().getHours() + new Date().getMinutes() / 60
  const upcoming = today.meals
    .map((m) => ({ meal: m, hour: parseMealHour(m.time) }))
    .filter((m) => m.hour >= nowHour)
    .sort((a, b) => a.hour - b.hour)
  return upcoming[0]?.meal || today.meals[0] || null
}

export function TodaySnapshot({ onJumpToTrain }: { onJumpToTrain: () => void }) {
  const { plan } = usePlan()
  const { trainProfile, workoutPlan } = useTrain()
  if (!plan) return null

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const nextMeal = findNextMeal(plan, todayName)
  const dayType = workoutPlan ? getDayType(todayName, trainProfile.weekPlan) : null
  const todayWorkout = workoutPlan?.days.find((d) => d.day === todayName)

  if (!nextMeal && !todayWorkout) return null

  return (
    <div className="mx-4 mt-3 rounded-2xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-muted">Today · {todayName}</span>
        {dayType === 'training' && (
          <span className="rounded-full bg-lime/15 px-2 py-0.5 text-[10px] font-bold text-lime">Training day — macros adjusted</span>
        )}
      </div>

      {nextMeal && (
        <div className="mb-2 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth={2}>
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
          </svg>
          <span className="text-sm text-text">
            <span className="text-muted">Next up:</span> {nextMeal.name} <span className="text-muted">({nextMeal.time})</span>
          </span>
        </div>
      )}

      {todayWorkout && (
        <button onClick={onJumpToTrain} className="flex w-full items-center gap-2 text-left">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth={2}>
            <rect x="2" y="9" width="3" height="6" rx="1" />
            <rect x="19" y="9" width="3" height="6" rx="1" />
            <rect x="5" y="7" width="3" height="10" rx="1" />
            <rect x="16" y="7" width="3" height="10" rx="1" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          <span className="text-sm text-text">
            {todayWorkout.exercises.length ? (
              <>
                <span className="text-muted">Workout today:</span> {todayWorkout.sport || 'General'} day, {todayWorkout.exercises.length} exercises →
              </>
            ) : (
              <span className="text-muted">Rest day — no workout scheduled</span>
            )}
          </span>
        </button>
      )}
    </div>
  )
}

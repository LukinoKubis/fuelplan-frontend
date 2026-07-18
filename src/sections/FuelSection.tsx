import { useState } from 'react'
import { usePlan } from '../state/PlanContext'
import { useAccount } from '../state/AccountContext'
import { useTrain } from '../state/TrainContext'
import { applyTrainingDayAdjustment, getDayType } from '../api/trainingDayMacros'
import { SurveyFlow } from '../components/survey/SurveyFlow'
import { DayTabs } from '../components/fuel/DayTabs'
import { DayMacroBar } from '../components/fuel/DayMacroBar'
import { MealCard } from '../components/fuel/MealCard'
import { PrepPanel } from '../components/fuel/PrepPanel'
import { PlanNameModal } from '../components/fuel/PlanNameModal'
import { HistoryDrawer } from '../components/fuel/HistoryDrawer'
import { TodaySnapshot } from '../components/fuel/TodaySnapshot'

export function FuelSection({ onJumpToTrain }: { onJumpToTrain?: () => void } = {}) {
  const { plan, favorites, eaten, toggleEaten, toggleFavorite, surveyMode, setSurveyMode } = usePlan()
  const { remaining, code } = useAccount()
  const { trainProfile, workoutPlan } = useTrain()
  const [activeDay, setActiveDay] = useState(0)
  const [showNameModal, setShowNameModal] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const showSurvey = !plan || surveyMode

  function handleBuyPlans() {
    window.location.href = 'https://fuelplan.fit/?buy=1'
  }

  if (showSurvey) {
    return (
      <SurveyFlow
        onGenerated={() => {
          setSurveyMode(false)
          setActiveDay(0)
          setShowNameModal(true)
        }}
        onBuyPlans={handleBuyPlans}
        canCancel={!!plan}
        onCancel={() => setSurveyMode(false)}
      />
    )
  }

  const day = plan.days[Math.min(activeDay, plan.days.length - 1)]
  const isFavorite = (name: string) => favorites.some((f) => f.name === name)
  const activeDayType = workoutPlan ? getDayType(day.day, trainProfile.weekPlan) : null
  const dayTarget = activeDayType === 'training' ? applyTrainingDayAdjustment(plan.summary, 'training') : plan.summary

  return (
    <div>
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2.5">
        <div className="flex gap-2">
          <button onClick={() => setShowHistory(true)} className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-muted">
            My Plans
          </button>
          <button onClick={() => setSurveyMode(true)} className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-muted">
            New Plan
          </button>
        </div>
        {code && (
          <div className="text-xs text-muted">
            {remaining === null ? '' : remaining === 0 ? <span className="text-red">No plans left</span> : `${remaining} plans left`}
          </div>
        )}
      </div>

      <TodaySnapshot onJumpToTrain={() => onJumpToTrain?.()} />

      <DayTabs days={plan.days.map((d) => d.day)} active={activeDay} onChange={setActiveDay} />
      {activeDayType === 'training' && (
        <div className="border-b border-border bg-card px-4 pb-2">
          <span className="rounded-full bg-lime/15 px-2 py-0.5 text-[10px] font-bold text-lime">Training day — macros adjusted</span>
        </div>
      )}
      <DayMacroBar day={day} target={dayTarget} />

      <PrepPanel tasks={plan.prep_tasks} />

      <div className="space-y-3 p-4">
        {day.meals.map((meal, i) => (
          <MealCard
            key={i}
            meal={meal}
            eaten={!!eaten[`${day.day}-${i}`]}
            onToggleEaten={() => toggleEaten(`${day.day}-${i}`)}
            favorite={isFavorite(meal.name)}
            onToggleFavorite={() => toggleFavorite(meal.name)}
          />
        ))}
      </div>

      {showNameModal && <PlanNameModal onClose={() => setShowNameModal(false)} />}
      {showHistory && <HistoryDrawer onClose={() => setShowHistory(false)} />}
    </div>
  )
}

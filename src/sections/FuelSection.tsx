import { useState } from 'react'
import { usePlan } from '../state/PlanContext'
import { useAccount } from '../state/AccountContext'
import { createCheckout } from '../api/client'
import { SurveyFlow } from '../components/survey/SurveyFlow'
import { DayTabs } from '../components/fuel/DayTabs'
import { DayMacroBar } from '../components/fuel/DayMacroBar'
import { MealCard } from '../components/fuel/MealCard'
import { PlanNameModal } from '../components/fuel/PlanNameModal'
import { HistoryDrawer } from '../components/fuel/HistoryDrawer'

export function FuelSection() {
  const { plan, favorites, eaten, toggleEaten, toggleFavorite, surveyMode, setSurveyMode } = usePlan()
  const { remaining } = useAccount()
  const [activeDay, setActiveDay] = useState(() => {
    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    const todayIndex = plan?.days.findIndex((d) => d.day === todayName) ?? -1
    return todayIndex >= 0 ? todayIndex : 0
  })
  const [showNameModal, setShowNameModal] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const showSurvey = !plan || surveyMode

  async function handleBuyPlans() {
    try {
      const { url } = await createCheckout('10')
      window.location.href = url
    } catch {
      /* non-critical — user can retry from Settings' Top Up Plans */
    }
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
        <div className="text-xs text-muted">
          {remaining === null ? '' : remaining === 0 ? <span className="text-red">No plans left</span> : `${remaining} plans left`}
        </div>
      </div>

      <DayTabs days={plan.days.map((d) => d.day)} active={activeDay} onChange={setActiveDay} />
      <DayMacroBar day={day} target={plan.summary} />

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

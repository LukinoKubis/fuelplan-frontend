import { useRef, useState } from 'react'
import { Step0Start } from './steps/Step0Start'
import { Step1Training } from './steps/Step1Training'
import { Step2Food } from './steps/Step2Food'
import { Step3Macros } from './steps/Step3Macros'
import { LoadingOverlay } from '../shared/LoadingOverlay'
import { ErrorPanel } from '../shared/ErrorPanel'
import { usePlan } from '../../state/PlanContext'
import { useAccount } from '../../state/AccountContext'
import { useTrain } from '../../state/TrainContext'
import { ApiError, postClaude } from '../../api/client'
import { buildGenerateRequest } from '../../api/generatePrompt'
import { resolveProfileMacros } from '../../api/macros'
import type { Plan } from '../../types/plan'

const TOTAL_STEPS = 4

interface SurveyFlowProps {
  onGenerated: () => void
  onBuyPlans: () => void
  canCancel: boolean
  onCancel: () => void
}

export function SurveyFlow({ onGenerated, onBuyPlans, canCancel, onCancel }: SurveyFlowProps) {
  const { profile, setProfile, setPlan, favorites } = usePlan()
  const { refreshRemaining } = useAccount()
  // trainProfile.weekPlan always has a value (defaultTrainProfile() seeds an
  // alternating schedule) even for users who've never opened Train — only
  // treat it as real intent once they've actually generated a workout plan,
  // otherwise every meal plan would silently pick up an arbitrary default
  // training schedule nobody chose.
  const { trainProfile, workoutPlan } = useTrain()

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<{ message: string; isOutOfPlans: boolean } | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const patch = (p: Partial<typeof profile>) => setProfile(p)

  function toggleCuisine(value: string) {
    const exists = profile.cuisines.includes(value)
    setProfile({ cuisines: exists ? profile.cuisines.filter((c) => c !== value) : [...profile.cuisines, value] })
  }

  async function handleGenerate() {
    if (!navigator.onLine) {
      setError({ message: "You're offline — connect to generate a new plan", isOutOfPlans: false })
      return
    }

    const macros = resolveProfileMacros(profile)
    if (!macros) {
      setError({ message: 'Please fill in all macro / stat fields.', isOutOfPlans: false })
      setStep(3)
      return
    }

    setLoading(true)
    setError(null)
    abortRef.current = new AbortController()

    try {
      const { system, messages, model, max_tokens } = buildGenerateRequest({
        profile,
        macros,
        favorites,
        weekPlan: workoutPlan ? trainProfile.weekPlan : undefined,
      })
      const response = await postClaude({ model, max_tokens, system, messages }, abortRef.current.signal)
      const rawText = response.content[0]?.text || ''
      const cleaned = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim()

      let plan: Plan
      try {
        plan = JSON.parse(cleaned)
      } catch {
        const match = cleaned.match(/\{[\s\S]*\}/)
        if (!match) throw new Error('Got invalid JSON back. Please try again.')
        plan = JSON.parse(match[0])
      }

      setPlan(plan, profile.name.trim() || 'Your')
      setLoading(false)
      refreshRemaining()
      onGenerated()
    } catch (err) {
      setLoading(false)
      if (err instanceof DOMException && err.name === 'AbortError') return
      if (err instanceof ApiError) {
        setError({ message: err.message, isOutOfPlans: err.status === 402 })
      } else {
        setError({ message: (err as Error).message || 'Unknown error occurred.', isOutOfPlans: false })
      }
    }
  }

  function handleCancelLoading() {
    abortRef.current?.abort()
    setLoading(false)
  }

  function next() {
    if (step === TOTAL_STEPS - 1) {
      handleGenerate()
      return
    }
    setStep((s) => s + 1)
  }

  function prev() {
    if (step === 0) {
      if (canCancel) onCancel()
      return
    }
    setStep((s) => s - 1)
  }

  if (loading) return <LoadingOverlay onCancel={handleCancelLoading} />
  if (error)
    return (
      <ErrorPanel
        message={error.message}
        isOutOfPlans={error.isOutOfPlans}
        onRetry={() => {
          setError(null)
          handleGenerate()
        }}
        onDismiss={() => setError(null)}
        onTopUp={onBuyPlans}
      />
    )

  return (
    <div className="flex min-h-screen flex-col bg-bg px-5 pb-28 pt-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
          <div className="h-full rounded-full bg-lime transition-all duration-300" style={{ width: `${(step / (TOTAL_STEPS - 1)) * 100}%` }} />
        </div>
        <span className="text-xs font-semibold text-muted">{step + 1}/4</span>
      </div>

      {step === 0 && <Step0Start name={profile.name} onNameChange={(name) => patch({ name })} />}
      {step === 1 && (
        <Step1Training
          trainingDays={profile.trainingDays}
          onTrainingDays={(trainingDays) => patch({ trainingDays })}
          trainingStyle={profile.trainingStyle}
          onTrainingStyle={(trainingStyle) => patch({ trainingStyle })}
          cookingSkill={profile.cookingSkill}
          onCookingSkill={(cookingSkill) => patch({ cookingSkill })}
          prepTime={profile.prepTime}
          onPrepTime={(prepTime) => patch({ prepTime })}
        />
      )}
      {step === 2 && (
        <Step2Food
          dietPref={profile.dietPref}
          onDietPref={(dietPref) => patch({ dietPref })}
          dislikedFoods={profile.dislikedFoods}
          onDislikedFoods={(dislikedFoods) => patch({ dislikedFoods })}
          cuisines={profile.cuisines}
          onToggleCuisine={toggleCuisine}
          variety={profile.variety}
          onVariety={(variety) => patch({ variety })}
        />
      )}
      {step === 3 && <Step3Macros profile={profile} onChange={patch} />}

      <div className="fixed inset-x-0 bottom-0 z-[9000] flex gap-3 border-t border-border bg-bg px-5 py-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
        {(step > 0 || canCancel) && (
          <button onClick={prev} className="rounded-xl border border-border px-4 py-3 text-sm font-semibold text-muted">
            Back
          </button>
        )}
        <button onClick={next} className="flex-1 rounded-xl bg-lime py-3 text-sm font-extrabold text-bg">
          {step === TOTAL_STEPS - 1 ? 'Generate My Plan' : 'Continue'}
        </button>
      </div>
    </div>
  )
}

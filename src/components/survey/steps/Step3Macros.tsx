import { useMemo } from 'react'
import type { MacroMode, Profile } from '../../../types/profile'
import { calculateGoalWeight, calculateMacros } from '../../../api/macros'
import { ACTIVITY_OPTIONS } from '../options'
import { GoalPicker } from '../GoalPicker'
import { PaceSlider } from '../PaceSlider'

interface Step3Props {
  profile: Profile
  onChange: (patch: Partial<Profile>) => void
}

export function Step3Macros({ profile, onChange }: Step3Props) {
  const setMode = (mode: MacroMode) => onChange({ mode })

  const weight = parseFloat(profile.weight)
  const height = parseFloat(profile.height)
  const age = parseFloat(profile.age)
  const activity = parseFloat(profile.activity)
  const goalWeight = parseFloat(profile.goalWeight)

  const goalWeightResult = useMemo(() => {
    if (profile.goalMode !== 'target' || !weight || !goalWeight) return null
    return calculateGoalWeight(weight, goalWeight, profile.goalWeeklyRate)
  }, [profile.goalMode, weight, goalWeight, profile.goalWeeklyRate])

  const effectiveOffset = profile.goalMode === 'target' ? (goalWeightResult ? -Math.round(goalWeightResult.cappedDailyDiff) : 0) : profile.goalOffset

  const calcResult = useMemo(() => {
    if (!weight || !height || !age) return null
    return calculateMacros({ weight, height, age, sex: profile.sex, activity, goalOffset: effectiveOffset })
  }, [weight, height, age, profile.sex, activity, effectiveOffset])

  return (
    <div>
      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-lime">Step 4 of 4</p>
      <h2 className="mb-2 text-3xl leading-tight text-text">
        Macros &<br />
        your goal
      </h2>
      <p className="mb-6 text-sm text-muted">Set your daily targets. Enter them yourself or let us calculate from your stats.</p>

      <div className="mb-5 grid grid-cols-2 gap-2">
        <button
          onClick={() => setMode('manual')}
          className="rounded-xl border px-3 py-3 text-left"
          style={{ borderColor: profile.mode === 'manual' ? 'var(--lime)' : 'var(--border)', background: profile.mode === 'manual' ? 'rgba(200,245,66,0.12)' : 'var(--bg2)' }}
        >
          <div className="text-sm font-bold text-text">I know my macros</div>
          <div className="text-xs text-muted">Enter targets directly</div>
        </button>
        <button
          onClick={() => setMode('calc')}
          className="rounded-xl border px-3 py-3 text-left"
          style={{ borderColor: profile.mode === 'calc' ? 'var(--lime)' : 'var(--border)', background: profile.mode === 'calc' ? 'rgba(200,245,66,0.12)' : 'var(--bg2)' }}
        >
          <div className="text-sm font-bold text-text">Calculate for me</div>
          <div className="text-xs text-muted">From stats & goal</div>
        </button>
      </div>

      {profile.mode === 'manual' ? (
        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Daily Targets</div>
          <div className="grid grid-cols-4 gap-2">
            <NumField label="Calories" value={profile.mKcal} onChange={(v) => onChange({ mKcal: v })} placeholder="2000" />
            <NumField label="Protein (g)" value={profile.mProtein} onChange={(v) => onChange({ mProtein: v })} placeholder="180" />
            <NumField label="Carbs (g)" value={profile.mCarbs} onChange={(v) => onChange({ mCarbs: v })} placeholder="200" />
            <NumField label="Fat (g)" value={profile.mFat} onChange={(v) => onChange({ mFat: v })} placeholder="65" />
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Body Stats</div>
          <div className="mb-3 grid grid-cols-2 gap-2">
            <NumField label="Weight (kg)" value={profile.weight} onChange={(v) => onChange({ weight: v })} placeholder="80" />
            <NumField label="Height (cm)" value={profile.height} onChange={(v) => onChange({ height: v })} placeholder="178" />
            <NumField label="Age" value={profile.age} onChange={(v) => onChange({ age: v })} placeholder="28" />
            <div className="mb-1">
              <label className="mb-1.5 block text-xs font-semibold text-muted">Sex</label>
              <select
                value={profile.sex}
                onChange={(e) => onChange({ sex: e.target.value as Profile['sex'] })}
                className="w-full rounded-xl border border-border bg-bg2 px-3 py-2.5 text-sm text-text outline-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-semibold text-muted">Activity Level</label>
            <select
              value={profile.activity}
              onChange={(e) => onChange({ activity: e.target.value })}
              className="w-full rounded-xl border border-border bg-bg2 px-3 py-2.5 text-sm text-text outline-none"
            >
              {ACTIVITY_OPTIONS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-2.5 flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wide text-muted">Goal</div>
            <div className="flex overflow-hidden rounded-lg border border-border">
              <button
                onClick={() => onChange({ goalMode: 'preset' })}
                className="px-3 py-1.5 text-xs font-semibold"
                style={{ background: profile.goalMode === 'preset' ? 'var(--bg)' : 'transparent', color: profile.goalMode === 'preset' ? 'var(--text)' : 'var(--muted)' }}
              >
                Quick select
              </button>
              <button
                onClick={() => onChange({ goalMode: 'target' })}
                className="px-3 py-1.5 text-xs font-semibold"
                style={{ background: profile.goalMode === 'target' ? 'var(--bg)' : 'transparent', color: profile.goalMode === 'target' ? 'var(--text)' : 'var(--muted)' }}
              >
                Target weight
              </button>
            </div>
          </div>

          {profile.goalMode === 'preset' ? (
            <div className="mb-4">
              <GoalPicker value={profile.goalOffset} onChange={(goalOffset) => onChange({ goalOffset })} />
            </div>
          ) : (
            <div className="mb-4 space-y-3">
              <NumField label="Goal Weight (kg)" value={profile.goalWeight} onChange={(v) => onChange({ goalWeight: v })} placeholder="e.g. 75" />
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted">Weekly pace</label>
                <PaceSlider value={profile.goalWeeklyRate} onChange={(goalWeeklyRate) => onChange({ goalWeeklyRate })} />
              </div>
              {goalWeightResult && (
                <div className="rounded-xl border border-border bg-bg2 p-3 text-xs text-muted">
                  <div className="mb-1.5 text-text">{goalWeightResult.warningText}</div>
                  <div className="flex flex-wrap gap-3">
                    <span>{Math.abs(goalWeightResult.totalChangeKg).toFixed(1)}kg total</span>
                    <span>~{Math.ceil(goalWeightResult.weeksNeeded)} weeks</span>
                    <span>By {new Date(goalWeightResult.projectedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    <span>
                      {Math.abs(Math.round(goalWeightResult.cappedDailyDiff))} kcal/day{' '}
                      {goalWeightResult.cappedDailyDiff > 0 ? 'deficit' : goalWeightResult.cappedDailyDiff < 0 ? 'surplus' : ''}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {calcResult && (
            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Your Calculated Targets</div>
              <div className="grid grid-cols-4 gap-2 rounded-xl border border-border bg-bg2 p-3 text-center">
                <PreviewItem value={calcResult.macros.kcal} unit="kcal" />
                <PreviewItem value={calcResult.macros.protein} unit="protein g" />
                <PreviewItem value={calcResult.macros.carbs} unit="carbs g" />
                <PreviewItem value={calcResult.macros.fat} unit="fat g" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function NumField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-muted">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-bg2 px-3 py-2.5 text-sm text-text outline-none"
      />
    </div>
  )
}

function PreviewItem({ value, unit }: { value: number; unit: string }) {
  return (
    <div>
      <div className="text-lg font-extrabold text-lime">{value}</div>
      <div className="text-[10px] text-muted">{unit}</div>
    </div>
  )
}

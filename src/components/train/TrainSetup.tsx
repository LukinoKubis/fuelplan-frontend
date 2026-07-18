import { useState } from 'react'
import { CardGrid } from '../survey/Chips'
import type { ChipOption } from '../survey/Chips'
import { EQUIPMENT_OPTIONS, WEEK_DAYS, type TrainProfile } from '../../types/workout'
import type { SportTag } from '../../types/exercise'
import { Field } from '../survey/Field'

const SPORT_OPTIONS: ChipOption[] = [
  { value: 'general', label: 'General' },
  { value: 'hockey', label: 'Hockey' },
  { value: 'golf', label: 'Golf' },
  { value: 'football', label: 'Football' },
  { value: 'tennis', label: 'Tennis' },
  { value: 'powerlifting', label: 'Powerlifting' },
  { value: 'bodybuilding', label: 'Bodybuilding' },
]

const EQUIPMENT_LABELS: Record<string, string> = {
  'body only': 'Bodyweight only',
  dumbbell: 'Dumbbells',
  barbell: 'Barbell',
  kettlebells: 'Kettlebells',
  bands: 'Resistance bands',
  cable: 'Cable machine',
  machine: 'Gym machines',
  'medicine ball': 'Medicine ball',
  'exercise ball': 'Exercise ball',
  'foam roll': 'Foam roller',
  'pool access': 'Pool access',
}

const EQUIPMENT_CHIPS: ChipOption[] = EQUIPMENT_OPTIONS.map((e) => ({ value: e, label: EQUIPMENT_LABELS[e] || e }))

interface TrainSetupProps {
  profile: TrainProfile
  onChange: (patch: Partial<TrainProfile>) => void
  onGenerate: () => void
}

export function TrainSetup({ profile, onChange, onGenerate }: TrainSetupProps) {
  const [error, setError] = useState('')

  function toggleSport(value: string) {
    const sport = value as SportTag
    const exists = profile.sports.includes(sport)
    onChange({ sports: exists ? profile.sports.filter((s) => s !== sport) : [...profile.sports, sport] })
  }

  function toggleEquipment(value: string) {
    const exists = profile.equipment.includes(value as TrainProfile['equipment'][number])
    onChange({
      equipment: exists
        ? profile.equipment.filter((e) => e !== value)
        : [...profile.equipment, value as TrainProfile['equipment'][number]],
    })
  }

  function toggleDayType(day: (typeof WEEK_DAYS)[number]) {
    onChange({
      weekPlan: profile.weekPlan.map((d) => (d.day === day ? { ...d, type: d.type === 'training' ? 'rest' : 'training' } : d)),
    })
  }

  function setDaySport(day: (typeof WEEK_DAYS)[number], sport: SportTag) {
    onChange({ weekPlan: profile.weekPlan.map((d) => (d.day === day ? { ...d, sport } : d)) })
  }

  function handleGenerate() {
    if (!profile.sports.length) return setError('Pick at least one sport.')
    if (!profile.equipment.length) return setError('Pick at least one equipment option.')
    if (!profile.weekPlan.some((d) => d.type === 'training')) return setError('Mark at least one training day.')
    setError('')
    onGenerate()
  }

  return (
    <div className="p-4 pb-28">
      <h2 className="mb-1 text-xl text-text">Set up your training week</h2>
      <p className="mb-5 text-sm text-muted">We'll assemble a weekly workout plan from the exercise library based on your sport, equipment, and schedule.</p>

      <div className="mb-5">
        <label className="mb-1.5 block text-xs font-semibold text-muted">Sports (pick all that apply)</label>
        <CardGrid options={SPORT_OPTIONS} value={profile.sports} onChange={toggleSport} multi columns={3} />
      </div>

      <div className="mb-5">
        <label className="mb-1.5 block text-xs font-semibold text-muted">Equipment you have access to</label>
        <CardGrid options={EQUIPMENT_CHIPS} value={profile.equipment} onChange={toggleEquipment} multi columns={2} />
      </div>

      <div className="mb-5">
        <label className="mb-1.5 block text-xs font-semibold text-muted">Weekly schedule</label>
        <div className="space-y-2">
          {profile.weekPlan.map((d) => (
            <div key={d.day} className="flex items-center gap-2 rounded-xl border border-border bg-bg2 p-2.5">
              <span className="w-24 shrink-0 text-sm font-semibold text-text">{d.day.slice(0, 3)}</span>
              <button
                onClick={() => toggleDayType(d.day)}
                className="shrink-0 rounded-lg border px-2.5 py-1.5 text-xs font-bold"
                style={{
                  borderColor: d.type === 'training' ? 'var(--lime)' : 'var(--border)',
                  background: d.type === 'training' ? 'rgba(200,245,66,0.15)' : 'transparent',
                  color: d.type === 'training' ? 'var(--lime)' : 'var(--muted)',
                }}
              >
                {d.type === 'training' ? 'Training' : 'Rest'}
              </button>
              {d.type === 'training' && profile.sports.length > 1 && (
                <select
                  value={d.sport || profile.sports[0]}
                  onChange={(e) => setDaySport(d.day, e.target.value as SportTag)}
                  className="ml-auto rounded-lg border border-border bg-card px-2 py-1.5 text-xs text-text outline-none"
                >
                  {profile.sports.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
      </div>

      <Field label="Goals" optional value={profile.goals} onChange={(e) => onChange({ goals: e.target.value })} placeholder="e.g. build strength, improve on-ice speed…" />
      <Field
        label="Limitations / injuries"
        optional
        value={profile.limitations}
        onChange={(e) => onChange({ limitations: e.target.value })}
        placeholder="e.g. avoid overhead pressing, bad left knee…"
      />

      {error && <p className="mb-3 text-sm text-red">{error}</p>}

      <button onClick={handleGenerate} className="w-full rounded-xl bg-lime py-3.5 text-sm font-extrabold text-bg">
        Generate Workout Plan
      </button>
    </div>
  )
}

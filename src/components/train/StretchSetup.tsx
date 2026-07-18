import type { StretchPrefs } from '../../types/stretch'
import { Field } from '../survey/Field'

interface StretchSetupProps {
  prefs: StretchPrefs
  onChange: (patch: Partial<StretchPrefs>) => void
  onGenerate: () => void
}

export function StretchSetup({ prefs, onChange, onGenerate }: StretchSetupProps) {
  return (
    <div className="p-4">
      <h2 className="mb-1 text-xl text-text">Set up your stretch routines</h2>
      <p className="mb-5 text-sm text-muted">An AM routine to activate, a PM routine to wind down — both assembled from the mobility exercises in the library.</p>

      <DurationField label="Morning (AM) duration" value={prefs.amDurationMin} onChange={(v) => onChange({ amDurationMin: v })} />
      <DurationField label="Evening (PM) duration" value={prefs.pmDurationMin} onChange={(v) => onChange({ pmDurationMin: v })} />

      <Field
        label="Focus areas"
        optional
        value={prefs.focusAreas}
        onChange={(e) => onChange({ focusAreas: e.target.value })}
        placeholder="e.g. hips, lower back, shoulders…"
      />

      <button onClick={onGenerate} className="w-full rounded-xl bg-lime py-3.5 text-sm font-extrabold text-bg">
        Generate Stretch Routines
      </button>
    </div>
  )
}

function DurationField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="mb-5">
      <div className="mb-1.5 flex justify-between text-xs font-semibold text-muted">
        <span>{label}</span>
        <span className="text-lime">{value} min</span>
      </div>
      <input
        type="range"
        min={5}
        max={25}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="h-1.5 w-full appearance-none rounded-full"
        style={{ background: `linear-gradient(to right, var(--lime) ${((value - 5) / 20) * 100}%, var(--border) ${((value - 5) / 20) * 100}%)` }}
      />
    </div>
  )
}

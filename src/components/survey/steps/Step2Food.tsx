import { Field } from '../Field'
import { CardGrid, VarietyGroup } from '../Chips'
import { CUISINE_OPTIONS, VARIETY_OPTIONS } from '../options'

interface Step2Props {
  dietPref: string
  onDietPref: (v: string) => void
  dislikedFoods: string
  onDislikedFoods: (v: string) => void
  cuisines: string[]
  onToggleCuisine: (v: string) => void
  variety: string
  onVariety: (v: string) => void
}

export function Step2Food({ dietPref, onDietPref, dislikedFoods, onDislikedFoods, cuisines, onToggleCuisine, variety, onVariety }: Step2Props) {
  return (
    <div>
      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-orange">Step 3 of 4</p>
      <h2 className="mb-2 text-3xl leading-tight text-text">
        Food &<br />
        <span style={{ color: 'var(--orange)' }}>preferences</span>
      </h2>
      <p className="mb-6 text-sm text-muted">Your plan will be built around what you enjoy and what works for your body.</p>

      <Field
        label="Dietary Restrictions & Allergies"
        value={dietPref}
        onChange={(e) => onDietPref(e.target.value)}
        placeholder="e.g. no pork, lactose intolerant, nut allergy…"
      />
      <Field
        label="Foods You Dislike"
        optional
        value={dislikedFoods}
        onChange={(e) => onDislikedFoods(e.target.value)}
        placeholder="e.g. broccoli, tuna, cottage cheese…"
      />

      <div className="mb-5">
        <label className="mb-1.5 block text-xs font-semibold text-muted">
          Cuisine Style <span className="font-normal text-muted/70">optional</span>
        </label>
        <CardGrid options={CUISINE_OPTIONS} value={cuisines} onChange={onToggleCuisine} multi columns={3} />
      </div>

      <div className="mb-5">
        <label className="mb-1.5 block text-xs font-semibold text-muted">Meal Variety</label>
        <VarietyGroup options={VARIETY_OPTIONS} value={variety} onChange={onVariety} />
      </div>
    </div>
  )
}

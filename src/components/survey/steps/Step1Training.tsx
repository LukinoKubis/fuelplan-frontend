import { CardGrid, PillGroup } from '../Chips'
import { COOKING_SKILL_OPTIONS, PREP_TIME_OPTIONS, TRAINING_DAYS_OPTIONS, TRAINING_STYLE_OPTIONS } from '../options'

interface Step1Props {
  trainingDays: string
  onTrainingDays: (v: string) => void
  trainingStyle: string
  onTrainingStyle: (v: string) => void
  cookingSkill: string
  onCookingSkill: (v: string) => void
  prepTime: string
  onPrepTime: (v: string) => void
}

export function Step1Training({
  trainingDays,
  onTrainingDays,
  trainingStyle,
  onTrainingStyle,
  cookingSkill,
  onCookingSkill,
  prepTime,
  onPrepTime,
}: Step1Props) {
  return (
    <div>
      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-blue">Step 2 of 4</p>
      <h2 className="mb-2 text-3xl leading-tight text-text">
        How do
        <br />
        <span style={{ color: 'var(--blue)' }}>you train?</span>
      </h2>
      <p className="mb-6 text-sm text-muted">We'll match your calories and meal timing to your training load.</p>

      <div className="mb-5">
        <label className="mb-1.5 block text-xs font-semibold text-muted">Training Days Per Week</label>
        <PillGroup options={TRAINING_DAYS_OPTIONS} value={trainingDays} onChange={onTrainingDays} />
      </div>

      <div className="mb-5">
        <label className="mb-1.5 block text-xs font-semibold text-muted">Training Style</label>
        <CardGrid options={TRAINING_STYLE_OPTIONS} value={trainingStyle} onChange={onTrainingStyle} columns={2} />
      </div>

      <div className="mb-5">
        <label className="mb-1.5 block text-xs font-semibold text-muted">Cooking Skill</label>
        <CardGrid options={COOKING_SKILL_OPTIONS} value={cookingSkill} onChange={onCookingSkill} columns={3} />
      </div>

      <div className="mb-5">
        <label className="mb-1.5 block text-xs font-semibold text-muted">Sunday Prep Time</label>
        <CardGrid options={PREP_TIME_OPTIONS} value={prepTime} onChange={onPrepTime} columns={3} />
      </div>
    </div>
  )
}

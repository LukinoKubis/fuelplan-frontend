import type { DayPlan } from '../../types/plan'

function Bar({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0
  return (
    <div className="min-w-0">
      <div className="mb-1 flex flex-col text-[11px] text-muted">
        <span className="truncate">{label}</span>
        <span className="truncate">
          {value}/{target}
          {label !== 'kcal' ? 'g' : ''}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

export function DayMacroBar({ day, target }: { day: DayPlan; target: { kcal: number; protein: number; carbs: number; fat: number } }) {
  return (
    <div className="grid grid-cols-4 gap-2 border-b border-border bg-card px-4 py-3">
      <Bar label="kcal" value={day.kcal} target={target.kcal} color="var(--lime)" />
      <Bar label="protein" value={day.protein} target={target.protein} color="var(--blue)" />
      <Bar label="carbs" value={day.carbs} target={target.carbs} color="var(--orange)" />
      <Bar label="fat" value={day.fat} target={target.fat} color="var(--red)" />
    </div>
  )
}

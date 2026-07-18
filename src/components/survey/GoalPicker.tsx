import { GOAL_PRESETS, formatGoalOffset } from '../../types/goal'

interface GoalPickerProps {
  value: number
  onChange: (offset: number) => void
}

export function GoalPicker({ value, onChange }: GoalPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {GOAL_PRESETS.map((g) => {
        const active = g.offset === value
        return (
          <button
            key={g.offset}
            type="button"
            onClick={() => onChange(g.offset)}
            className={`flex flex-col gap-1 rounded-xl border px-3 py-2.5 text-left transition-colors ${g.wide ? 'col-span-2' : ''}`}
            style={{
              borderColor: active ? g.color : 'var(--border)',
              background: active ? `${g.color}22` : 'var(--bg2)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text">{g.name}</span>
              <span className="text-xs font-extrabold" style={{ color: g.color }}>
                {formatGoalOffset(g.offset)}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

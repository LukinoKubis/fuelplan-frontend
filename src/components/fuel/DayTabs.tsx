interface DayTabsProps {
  days: string[]
  active: number
  onChange: (index: number) => void
}

export function DayTabs({ days, active, onChange }: DayTabsProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto border-b border-border bg-card px-3 py-2.5" style={{ scrollbarWidth: 'none' }}>
      {days.map((day, i) => {
        const isActive = i === active
        return (
          <button
            key={day}
            onClick={() => onChange(i)}
            className="shrink-0 rounded-lg border px-3 py-1.5 text-xs font-bold"
            style={{
              background: isActive ? 'var(--lime)' : 'transparent',
              color: isActive ? '#0e0f11' : 'var(--muted)',
              borderColor: isActive ? 'var(--lime)' : 'var(--border)',
            }}
          >
            {day.slice(0, 3)}
          </button>
        )
      })}
    </div>
  )
}

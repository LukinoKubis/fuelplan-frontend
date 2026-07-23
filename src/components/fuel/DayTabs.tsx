import { useRef } from 'react'

interface DayTabsProps {
  days: string[]
  active: number
  onChange: (index: number) => void
}

const SWIPE_THRESHOLD_PX = 40

export function DayTabs({ days, active, onChange }: DayTabsProps) {
  const touchStartX = useRef<number | null>(null)
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const activeDay = days[active]

  function go(delta: number) {
    const next = active + delta
    if (next < 0 || next >= days.length) return
    onChange(next)
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return
    go(delta > 0 ? -1 : 1)
  }

  return (
    <div className="border-b border-border bg-card" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="flex items-center justify-between px-2 py-2.5">
        <button
          onClick={() => go(-1)}
          disabled={active === 0}
          aria-label="Previous day"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted disabled:opacity-30"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span className="text-sm font-bold text-text">
          {activeDay}
          {activeDay === todayName && <span className="ml-1.5 font-semibold text-muted">· Today</span>}
        </span>
        <button
          onClick={() => go(1)}
          disabled={active === days.length - 1}
          aria-label="Next day"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted disabled:opacity-30"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
      <div className="flex items-center justify-center gap-2.5 pb-2.5">
        {days.map((day, i) => (
          <button
            key={day}
            onClick={() => onChange(i)}
            aria-label={day}
            aria-current={i === active}
            className="flex h-4 w-4 items-center justify-center"
          >
            <span
              className="rounded-full transition-all"
              style={{
                width: i === active ? 8 : 6,
                height: i === active ? 8 : 6,
                background: i === active ? 'var(--lime)' : 'var(--border)',
              }}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

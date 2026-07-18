import { useState } from 'react'
import type { PrepTask } from '../../types/plan'

const LANE_LABEL: Record<string, string> = {
  stovetop: 'Stovetop',
  oven: 'Oven',
  active: 'Active prep',
  passive: 'Passive',
}

export function PrepPanel({ tasks }: { tasks: PrepTask[] }) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)

  if (!tasks.length) return null

  const totalMinutes = tasks.reduce((s, t) => s + t.durationMinutes, 0)

  return (
    <div className="mx-4 my-3 overflow-hidden rounded-2xl border border-border bg-card">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between px-4 py-3.5">
        <div className="text-left">
          <div className="text-sm text-text">Sunday Prep</div>
          <div className="text-xs text-muted">
            {tasks.length} steps · ~{Math.round(totalMinutes)} min active
          </div>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--muted)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="space-y-2 px-4 pb-4">
          {tasks.map((task, i) => (
            <div key={i} className="rounded-xl border border-border bg-bg2 p-3">
              <button className="flex w-full items-start justify-between gap-2 text-left" onClick={() => setExpanded(expanded === i ? null : i)}>
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime/20 text-[10px] font-bold text-lime">
                    {i + 1}
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-text">{task.task}</div>
                    <div className="text-[10px] text-muted">
                      {task.meal} · {LANE_LABEL[task.lane] || task.lane}
                      {task.durationMinutes > 0 ? ` · ${task.durationMinutes} min` : ''}
                    </div>
                  </div>
                </div>
              </button>
              {expanded === i && <p className="mt-2 pl-7 text-xs leading-relaxed text-muted">{task.detail}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { usePlan } from '../state/PlanContext'

const LANE_LABEL: Record<string, string> = {
  stovetop: 'Stovetop',
  oven: 'Oven',
  active: 'Active prep',
  passive: 'Passive',
}

export function PrepSection() {
  const { plan } = usePlan()
  const [expanded, setExpanded] = useState<number | null>(null)

  const tasks = plan?.prep_tasks || []
  const totalMinutes = tasks.reduce((s, t) => s + t.durationMinutes, 0)

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-lg font-extrabold text-text">Sunday Prep</h1>
        {tasks.length > 0 && (
          <div className="text-xs text-muted">
            {tasks.length} steps · ~{Math.round(totalMinutes)} min active
          </div>
        )}
      </div>

      {!tasks.length ? (
        <div className="rounded-2xl border border-border bg-card p-4 text-center text-sm text-muted">
          Generate a meal plan to see your Sunday prep list.
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-3">
              <button className="flex w-full items-start justify-between gap-2 text-left" onClick={() => setExpanded(expanded === i ? null : i)}>
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime/20 text-[10px] font-bold text-lime">
                    {i + 1}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-text">{task.task}</div>
                    <div className="text-[11px] text-muted">
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

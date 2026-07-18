import type { ReactNode } from 'react'

export interface ChipOption {
  value: string
  label: string
  icon?: ReactNode
  sub?: string
}

interface PillGroupProps {
  options: ChipOption[]
  value: string
  onChange: (value: string) => void
}

export function PillGroup({ options, value, onChange }: PillGroupProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors"
            style={{
              borderColor: active ? 'var(--lime)' : 'var(--border)',
              background: active ? 'rgba(200,245,66,0.15)' : 'var(--bg2)',
              color: active ? 'var(--lime)' : 'var(--muted)',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

interface CardGridProps {
  options: ChipOption[]
  value: string | string[]
  onChange: (value: string) => void
  multi?: boolean
  columns?: 2 | 3
}

export function CardGrid({ options, value, onChange, multi, columns = 2 }: CardGridProps) {
  const isActive = (v: string) => (multi ? (value as string[]).includes(v) : value === v)
  return (
    <div className={`grid gap-2 ${columns === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
      {options.map((opt) => {
        const active = isActive(opt.value)
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition-colors"
            style={{
              borderColor: active ? 'var(--lime)' : 'var(--border)',
              background: active ? 'rgba(200,245,66,0.12)' : 'var(--bg2)',
              color: active ? 'var(--lime)' : 'var(--text)',
            }}
          >
            {opt.icon}
            <span className="text-xs font-semibold">{opt.label}</span>
            {opt.sub && <small className="text-[10px] text-muted">{opt.sub}</small>}
          </button>
        )
      })}
    </div>
  )
}

interface VarietyGroupProps {
  options: { value: string; title: string; desc: string; icon?: ReactNode }[]
  value: string
  onChange: (value: string) => void
}

export function VarietyGroup({ options, value, onChange }: VarietyGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors"
            style={{
              borderColor: active ? 'var(--lime)' : 'var(--border)',
              background: active ? 'rgba(200,245,66,0.1)' : 'var(--bg2)',
            }}
          >
            <span style={{ color: active ? 'var(--lime)' : 'var(--muted)' }}>{opt.icon}</span>
            <div>
              <strong className="block text-sm text-text">{opt.title}</strong>
              <small className="text-xs text-muted">{opt.desc}</small>
            </div>
          </button>
        )
      })}
    </div>
  )
}

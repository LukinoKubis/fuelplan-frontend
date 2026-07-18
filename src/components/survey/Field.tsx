import type { InputHTMLAttributes, ReactNode } from 'react'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  optional?: boolean
  icon?: ReactNode
}

export function Field({ label, optional, icon, className, ...inputProps }: FieldProps) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-xs font-semibold text-muted">
        {label}
        {optional && <span className="ml-1.5 font-normal text-muted/70">optional</span>}
      </label>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-bg2 px-3 py-2.5">
        {icon && <span className="text-muted">{icon}</span>}
        <input
          {...inputProps}
          className={`w-full min-w-0 bg-transparent text-sm text-text outline-none placeholder:text-muted ${className || ''}`}
        />
      </div>
    </div>
  )
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">{children}</div>
}

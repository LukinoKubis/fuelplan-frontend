import type { ElementType, ReactNode } from 'react'

interface SettingsActionProps {
  icon: ReactNode
  iconColor?: string
  title: string
  desc: string
  onClick?: () => void
  danger?: boolean
  trailing?: ReactNode
}

export function SettingsAction({ icon, iconColor = 'var(--lime)', title, desc, onClick, danger, trailing }: SettingsActionProps) {
  // Renders as a <div> when there's an interactive `trailing` control (e.g. a
  // toggle switch) instead of a whole-row onClick — a <button> can't contain
  // another <button>, which is invalid HTML and breaks React's DOM diffing.
  const Wrapper = (trailing ? 'div' : 'button') as ElementType
  const wrapperProps = trailing ? {} : { onClick, disabled: !onClick }

  return (
    <Wrapper {...wrapperProps} className="flex w-full items-center gap-3 rounded-xl border border-border bg-bg2 p-3 text-left disabled:cursor-default">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: `${iconColor}1a`, color: iconColor }}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold" style={{ color: danger ? 'var(--red)' : 'var(--text)' }}>
          {title}
        </span>
        <span className="block text-xs text-muted">{desc}</span>
      </span>
      {trailing ?? (onClick && <span className="text-muted">›</span>)}
    </Wrapper>
  )
}

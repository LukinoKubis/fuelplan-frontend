import type { ReactNode } from 'react'
import type { Section } from '../../types/nav'

interface NavItem {
  id: Section
  label: string
  icon: ReactNode
}

const ICON_PROPS = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'fuel',
    label: 'Fuel',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    ),
  },
  {
    id: 'stats',
    label: 'Stats',
    icon: (
      <svg {...ICON_PROPS}>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    id: 'haul',
    label: 'Haul',
    icon: (
      <svg {...ICON_PROPS}>
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
]

interface BottomNavProps {
  active: Section
  onChange: (section: Section) => void
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[9000] flex items-stretch border-t border-border bg-card pb-[env(safe-area-inset-bottom)]"
      style={{ transform: 'translateZ(0)' }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = item.id === active
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5"
          >
            <span
              className="absolute inset-x-[20%] top-0 h-0.5 rounded-b bg-lime transition-opacity"
              style={{ opacity: isActive ? 1 : 0 }}
            />
            <span
              className="flex h-6 w-6 items-center justify-center transition-all"
              style={{ color: isActive ? 'var(--lime)' : 'var(--muted)', transform: isActive ? 'scale(1.1)' : 'scale(1)' }}
            >
              {item.icon}
            </span>
            <span
              className="text-[10px] font-semibold uppercase tracking-wide transition-colors"
              style={{ color: isActive ? 'var(--lime)' : 'var(--muted)' }}
            >
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

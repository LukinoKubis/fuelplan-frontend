import { useTheme } from '../../state/ThemeContext'

export function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="fixed inset-x-0 top-0 z-[9000] flex items-center justify-between border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-2">
        <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="14" fill="#c8f542" />
          <path d="M25 7L13 27h12l-4 14 18-22H27L31 7H25z" fill="#0e0f11" />
        </svg>
        <span className="text-lg tracking-tight text-text">Fuelplan</span>
      </div>
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted"
      >
        {theme === 'dark' ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>
    </header>
  )
}

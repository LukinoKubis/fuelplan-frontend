interface ErrorPanelProps {
  message: string
  onRetry: () => void
  onDismiss: () => void
  isOutOfPlans?: boolean
  onTopUp?: () => void
}

export function ErrorPanel({ message, onRetry, onDismiss, isOutOfPlans, onTopUp }: ErrorPanelProps) {
  return (
    <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center gap-4 bg-bg px-8 text-center">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <h2 className="text-xl text-text">{isOutOfPlans ? 'Out of plans' : 'Something went wrong'}</h2>
      <p className="max-w-xs text-sm text-muted">{message}</p>
      <div className="flex gap-3">
        {isOutOfPlans && onTopUp ? (
          <button onClick={onTopUp} className="rounded-xl bg-lime px-5 py-2.5 text-sm font-extrabold text-bg">
            Top up →
          </button>
        ) : (
          <button onClick={onRetry} className="rounded-xl bg-lime px-5 py-2.5 text-sm font-extrabold text-bg">
            Try Again
          </button>
        )}
        <button onClick={onDismiss} className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-muted">
          Back
        </button>
      </div>
    </div>
  )
}

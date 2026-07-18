import type { Exercise } from '../../types/exercise'

const CATEGORY_COLOR: Record<string, string> = {
  strength: 'var(--lime)',
  plyometric: 'var(--orange)',
  isometric: 'var(--blue)',
  mobility: '#a78bfa',
  conditioning: 'var(--red)',
}

export function ExerciseCard({ exercise, onClick }: { exercise: Exercise; onClick: () => void }) {
  const thumb = exercise.images[0]
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-2.5 text-left">
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-bg2">
        {thumb ? (
          <img src={thumb} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6.5 6.5 4 4" />
              <path d="M17.5 17.5 20 20" />
              <rect x="2" y="9" width="4" height="6" rx="1" />
              <rect x="18" y="9" width="4" height="6" rx="1" />
              <rect x="6" y="6" width="3" height="12" rx="1" />
              <rect x="15" y="6" width="3" height="12" rx="1" />
            </svg>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-text">{exercise.name}</div>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted">
          <span style={{ color: CATEGORY_COLOR[exercise.category] || 'var(--muted)' }}>{exercise.category}</span>
          {exercise.equipment && <span>· {exercise.equipment}</span>}
        </div>
      </div>
    </button>
  )
}

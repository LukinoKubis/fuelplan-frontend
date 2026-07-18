import type { Meal } from '../../types/plan'

interface MealCardProps {
  meal: Meal
  eaten: boolean
  onToggleEaten: () => void
  favorite: boolean
  onToggleFavorite: () => void
}

export function MealCard({ meal, eaten, onToggleEaten, favorite, onToggleFavorite }: MealCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4" style={{ opacity: eaten ? 0.6 : 1 }}>
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">{meal.time}</div>
          <h3 className="text-base text-text">{meal.name}</h3>
        </div>
        <button onClick={onToggleFavorite} aria-label="Favorite" className="shrink-0 p-1">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={favorite ? 'var(--lime)' : 'none'}
            stroke={favorite ? 'var(--lime)' : 'var(--muted)'}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <p className="mb-3 text-xs leading-relaxed text-muted">{meal.ingredients}</p>

      <div className="mb-3 flex gap-3 text-[11px] font-semibold text-muted">
        <span>{meal.kcal} kcal</span>
        <span>{meal.protein}g protein</span>
        <span>{meal.carbs}g carbs</span>
        <span>{meal.fat}g fat</span>
      </div>

      <button
        onClick={onToggleEaten}
        className="w-full rounded-lg border py-2 text-xs font-bold transition-colors"
        style={{
          borderColor: eaten ? 'var(--lime)' : 'var(--border)',
          background: eaten ? 'rgba(200,245,66,0.15)' : 'transparent',
          color: eaten ? 'var(--lime)' : 'var(--muted)',
        }}
      >
        {eaten ? '✓ Eaten' : 'Mark as eaten'}
      </button>
    </div>
  )
}

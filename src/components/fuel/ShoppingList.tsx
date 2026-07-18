import type { ShoppingCategory } from '../../types/plan'
import { usePlan } from '../../state/PlanContext'

export function ShoppingList({ categories }: { categories: ShoppingCategory[] }) {
  const { shopChecks, toggleShopCheck } = usePlan()

  if (!categories.length) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 px-8 text-center">
        <h2 className="text-xl text-text">Haul</h2>
        <p className="max-w-xs text-sm text-muted">Generate a meal plan in Fuel to see your shopping list here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 p-4">
      {categories.map((cat) => (
        <div key={cat.category} className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-muted">{cat.category}</div>
          <div>
            {cat.items.map((item, i) => {
              const id = `${cat.category}-${i}-${item.name}`
              const checked = !!shopChecks[id]
              return (
                <label key={id} className="flex items-center gap-3 border-b border-border px-4 py-2.5 last:border-b-0">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleShopCheck(id)}
                    className="h-4 w-4 shrink-0 accent-lime"
                  />
                  <span className="flex-1 text-sm" style={{ color: checked ? 'var(--muted)' : 'var(--text)', textDecoration: checked ? 'line-through' : 'none' }}>
                    {item.name}
                  </span>
                  <span className="text-xs text-muted">{item.qty}</span>
                </label>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

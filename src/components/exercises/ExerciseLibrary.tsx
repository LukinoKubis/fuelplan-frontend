import { useEffect, useMemo, useState } from 'react'
import { loadExercises } from '../../data/exercises'
import type { Exercise, ExerciseCategory, SportTag } from '../../types/exercise'
import { ExerciseCard } from './ExerciseCard'
import { ExerciseDetail } from './ExerciseDetail'

const SPORT_FILTERS: { value: SportTag | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'general', label: 'General' },
  { value: 'hockey', label: 'Hockey' },
  { value: 'golf', label: 'Golf' },
  { value: 'football', label: 'Football' },
  { value: 'tennis', label: 'Tennis' },
  { value: 'powerlifting', label: 'Powerlifting' },
  { value: 'bodybuilding', label: 'Bodybuilding' },
]

const CATEGORY_FILTERS: { value: ExerciseCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'strength', label: 'Strength' },
  { value: 'plyometric', label: 'Plyometric' },
  { value: 'isometric', label: 'Isometric' },
  { value: 'mobility', label: 'Mobility' },
  { value: 'conditioning', label: 'Conditioning' },
]

const PAGE_SIZE = 40

export function ExerciseLibrary() {
  const [all, setAll] = useState<Exercise[] | null>(null)
  const [query, setQuery] = useState('')
  const [sport, setSport] = useState<SportTag | 'all'>('all')
  const [category, setCategory] = useState<ExerciseCategory | 'all'>('all')
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [selected, setSelected] = useState<Exercise | null>(null)

  useEffect(() => {
    loadExercises().then(setAll)
  }, [])

  const filtered = useMemo(() => {
    if (!all) return []
    const q = query.trim().toLowerCase()
    return all.filter((e) => {
      if (sport !== 'all' && !e.sportTags.includes(sport)) return false
      if (category !== 'all' && e.category !== category) return false
      if (q && !e.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [all, query, sport, category])

  useEffect(() => setVisible(PAGE_SIZE), [query, sport, category])

  if (!all) {
    return <div className="p-8 text-center text-sm text-muted">Loading exercise library…</div>
  }

  const shown = filtered.slice(0, visible)

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center gap-2 rounded-xl border border-border bg-bg2 px-3 py-2.5">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search exercises…"
          className="w-full bg-transparent text-sm text-text outline-none placeholder:text-muted"
        />
      </div>

      <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {SPORT_FILTERS.map((f) => (
          <FilterChip key={f.value} active={sport === f.value} onClick={() => setSport(f.value)}>
            {f.label}
          </FilterChip>
        ))}
      </div>
      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {CATEGORY_FILTERS.map((f) => (
          <FilterChip key={f.value} active={category === f.value} onClick={() => setCategory(f.value)}>
            {f.label}
          </FilterChip>
        ))}
      </div>

      <div className="mb-2 text-xs text-muted">{filtered.length} exercises</div>

      <div className="space-y-2">
        {shown.map((ex) => (
          <ExerciseCard key={ex.id} exercise={ex} onClick={() => setSelected(ex)} />
        ))}
      </div>

      {visible < filtered.length && (
        <button
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
          className="mt-4 w-full rounded-xl border border-border py-2.5 text-sm font-semibold text-muted"
        >
          Load more ({filtered.length - visible} remaining)
        </button>
      )}

      {selected && <ExerciseDetail exercise={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold"
      style={{
        borderColor: active ? 'var(--lime)' : 'var(--border)',
        background: active ? 'rgba(200,245,66,0.15)' : 'var(--bg2)',
        color: active ? 'var(--lime)' : 'var(--muted)',
      }}
    >
      {children}
    </button>
  )
}

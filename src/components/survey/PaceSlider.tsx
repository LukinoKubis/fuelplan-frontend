import { getPaceCategory } from '../../types/goal'

interface PaceSliderProps {
  value: number
  onChange: (rate: number) => void
}

export function PaceSlider({ value, onChange }: PaceSliderProps) {
  const cat = getPaceCategory(value)
  const pct = ((value - 0.1) / (1.5 - 0.1)) * 100

  return (
    <div className="rounded-xl border border-border bg-bg2 p-3.5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-extrabold" style={{ color: cat.color }}>
          {value.toFixed(2)} kg/wk
        </span>
        <span className="text-xs font-semibold" style={{ color: cat.color }}>
          {cat.label}
        </span>
      </div>
      <input
        type="range"
        min={0.1}
        max={1.5}
        step={0.05}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1.5 w-full appearance-none rounded-full"
        style={{ background: `linear-gradient(to right, ${cat.color} ${pct}%, var(--border) ${pct}%)` }}
      />
      <div className="mt-1 flex justify-between text-[10px] text-muted">
        <span>0.1</span>
        <span>0.5</span>
        <span>0.75</span>
        <span>1.0</span>
        <span>1.5</span>
      </div>
      <div className="mt-2 text-xs text-muted">{cat.desc}</div>
    </div>
  )
}

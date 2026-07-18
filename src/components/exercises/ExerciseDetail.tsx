import { useState } from 'react'
import { Drawer } from '../shared/Drawer'
import type { Exercise } from '../../types/exercise'

export function ExerciseDetail({ exercise, onClose }: { exercise: Exercise; onClose: () => void }) {
  const [imgIndex, setImgIndex] = useState(0)

  return (
    <Drawer title={exercise.name} onClose={onClose}>
      {exercise.images.length > 0 && (
        <div className="mb-4">
          <div className="overflow-hidden rounded-xl bg-bg2">
            <img src={exercise.images[imgIndex]} alt={exercise.name} className="aspect-[3/2] w-full object-cover" />
          </div>
          {exercise.images.length > 1 && (
            <div className="mt-2 flex justify-center gap-1.5">
              {exercise.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: i === imgIndex ? 'var(--lime)' : 'var(--border)' }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-1.5">
        <Badge>{exercise.category}</Badge>
        {exercise.equipment && <Badge>{exercise.equipment}</Badge>}
        <Badge>{exercise.level}</Badge>
      </div>

      <div className="mb-4">
        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-muted">Muscles worked</div>
        <div className="text-sm text-text">
          {exercise.primaryMuscles.join(', ') || '—'}
          {exercise.secondaryMuscles.length > 0 && <span className="text-muted"> (+ {exercise.secondaryMuscles.join(', ')})</span>}
        </div>
      </div>

      <div>
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Instructions</div>
        <ol className="space-y-2.5">
          {exercise.instructions.map((step, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-text">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime/20 text-[10px] font-bold text-lime">{i + 1}</span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </Drawer>
  )
}

function Badge({ children }: { children: string }) {
  return <span className="rounded-full border border-border bg-bg2 px-2.5 py-1 text-[11px] font-semibold capitalize text-muted">{children}</span>
}

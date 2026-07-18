import type { Exercise } from '../../types/exercise'

// The imported set is ~850KB of JSON — loaded lazily (dynamic import, its
// own chunk) so it never bloats the initial bundle for users who only ever
// use Fuel. custom-exercises.json is tiny and hand-authored; it's never
// touched by scripts/import-exercises.mjs so re-imports can't clobber it.
let cache: Exercise[] | null = null

export async function loadExercises(): Promise<Exercise[]> {
  if (cache) return cache
  const [{ default: imported }, { default: custom }] = await Promise.all([
    import('./exercises.json'),
    import('./custom-exercises.json'),
  ])
  cache = [...(imported as Exercise[]), ...(custom as Exercise[])]
  return cache
}

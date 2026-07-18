// One-off import script — NOT part of the app runtime.
// Pulls free-exercise-db (public domain / Unlicense), trims to a
// browsable schema, converts images to WebP (much smaller footprint),
// and vendors everything into src/data/exercises + public/exercises so
// the library works offline as a PWA. Re-run any time to refresh from
// upstream — never touches custom-exercises.json.
//
// Usage: node scripts/import-exercises.mjs [--source <path-to-cloned-repo>]
//
// Source repo: https://github.com/yuhonas/free-exercise-db (clone it once,
// pass its path via --source; this script does not fetch over the network
// itself so re-runs are fast and don't depend on GitHub being reachable).

import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const sourceArg = process.argv.indexOf('--source')
const SOURCE_DIR = sourceArg !== -1 ? process.argv[sourceArg + 1] : null
if (!SOURCE_DIR || !fs.existsSync(SOURCE_DIR)) {
  console.error('Usage: node scripts/import-exercises.mjs --source <path-to-cloned-free-exercise-db>')
  process.exit(1)
}

const SOURCE_JSON = path.join(SOURCE_DIR, 'dist', 'exercises.json')
const SOURCE_IMAGES = path.join(SOURCE_DIR, 'exercises')
const OUT_JSON = path.join(ROOT, 'src', 'data', 'exercises', 'exercises.json')
const OUT_IMAGES = path.join(ROOT, 'public', 'exercises')

const CATEGORY_MAP = {
  strength: 'strength',
  stretching: 'mobility',
  plyometrics: 'plyometric',
  strongman: 'strength',
  powerlifting: 'strength',
  cardio: 'conditioning',
  'olympic weightlifting': 'strength',
}

function mapCategory(raw) {
  return CATEGORY_MAP[raw] || 'strength'
}

async function convertImage(srcPath, destPath) {
  await sharp(srcPath).resize(480).webp({ quality: 70 }).toFile(destPath)
}

async function main() {
  const raw = JSON.parse(fs.readFileSync(SOURCE_JSON, 'utf-8'))
  console.log(`Source: ${raw.length} exercises`)

  fs.mkdirSync(OUT_IMAGES, { recursive: true })
  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true })

  const out = []
  let imageCount = 0

  for (const ex of raw) {
    const destDir = path.join(OUT_IMAGES, ex.id)
    fs.mkdirSync(destDir, { recursive: true })

    const images = []
    for (const imgRel of ex.images) {
      const srcPath = path.join(SOURCE_IMAGES, imgRel)
      if (!fs.existsSync(srcPath)) continue
      const destName = path.basename(imgRel, path.extname(imgRel)) + '.webp'
      const destPath = path.join(destDir, destName)
      try {
        await convertImage(srcPath, destPath)
        images.push(`/exercises/${ex.id}/${destName}`)
        imageCount++
      } catch (e) {
        console.warn('Image convert failed:', srcPath, e.message)
      }
    }

    out.push({
      id: ex.id,
      name: ex.name,
      primaryMuscles: ex.primaryMuscles || [],
      secondaryMuscles: ex.secondaryMuscles || [],
      equipment: ex.equipment ?? null,
      level: ex.level || 'intermediate',
      instructions: ex.instructions || [],
      images,
      sportTags: ['general'],
      category: mapCategory(ex.category),
    })
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify(out))
  console.log(`Wrote ${out.length} exercises, ${imageCount} images converted to ${OUT_IMAGES}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

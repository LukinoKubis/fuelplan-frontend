# Fuelplan Frontend

AI-powered training + nutrition PWA. Vite + React 19 + TypeScript +
Tailwind CSS v4, shipped as a static build to Netlify.

> Currently mid-rebuild on branch `rebuild/v2` (see the root project's
> `PLAN.md` and `VISION.md`). This README describes the new stack — `main`
> has already been merged to it as of the Phase 0/1/2 rebuild (scaffold +
> Fuel section + exercise library).

## Setup

```bash
npm install
npm run dev
```

Opens on `http://localhost:5173`. No `.env` needed for local dev — the API
base URL is a constant in `src/api/client.ts` pointing at the deployed
Railway backend (there's no local backend proxy step; point it at a local
backend by editing `API_BASE` temporarily if you're also running the
backend locally).

```bash
npm run build     # tsc -b && vite build -> dist/
npm run preview   # serve the production build locally
```

## Tech stack

- **Vite 8 + React 19 + TypeScript** — no other framework/build-tool
  dependencies beyond what's listed here.
- **Tailwind CSS v4** (`@tailwindcss/vite` plugin, CSS-first config via
  `@theme` in `src/styles/global.css` — no `tailwind.config.js`).
- **State**: plain React Context + `useReducer`/`useState` — no Redux,
  Zustand, or similar. Three contexts: Theme, Plan, Account.
- **PWA**: `vite-plugin-pwa` (`injectManifest` strategy) — precaching via
  Workbox, hand-written service worker logic in `src/sw.ts` (push
  notifications, network-first API calls, cache-first exercise images).
- **No router** — the 4-tab bottom nav is plain `useState`, not URL-based.

## Project structure

```
src/
  main.tsx, App.tsx        — bootstrap, theme/section shell
  sw.ts                    — service worker source
  state/                   — ThemeContext, PlanContext, AccountContext
  api/                     — typed backend client, localStorage helper,
                              prompt builder, macro math, sanitization
  types/                   — shared TS types (plan, profile, exercise, goal)
  components/
    layout/                — BottomNav, Header
    survey/                — 4-step onboarding survey (+ steps/*)
    fuel/                  — day carousel, meal cards, prep panel, shopping
                              list, plan history, plan-naming modal
    exercises/              — exercise library list/detail/filters
    train/                  — training-week setup, workout day view
    shared/                — Drawer, Modal, Toast-ish overlays, Settings,
                              Onboarding/install flow
  sections/                — one component per bottom-nav tab
  data/exercises/           — exercise library data (see below)
public/
  icons/                    — PWA icons (192/512 + maskable)
  exercises/                — vendored exercise images (~27MB, WebP)
scripts/
  import-exercises.mjs      — one-off exercise data import (not part of the app)
```

Full detail (design tokens, exercise library internals, deploy mechanics)
is in `CLAUDE.md` — written for AI-agent-driven development, but useful for
a human onboarding too.

## Exercise library

`src/data/exercises/exercises.json` is auto-generated — **never hand-edit
it**. To refresh from upstream (`yuhonas/free-exercise-db`):

```bash
git clone https://github.com/yuhonas/free-exercise-db /tmp/free-exercise-db
node scripts/import-exercises.mjs --source /tmp/free-exercise-db
```

Hand-authored sport-specific exercises (hockey/golf/football/tennis) live
in `src/data/exercises/custom-exercises.json` — that file is never touched
by the import script.

## Deploying

Netlify auto-deploys on push to `main` (`npm run build`, publishes `dist/`).

```bash
git push origin main        # production deploy
netlify deploy --dir=dist   # draft/preview deploy — verify before merging to main
netlify deploy --prod       # manual prod deploy (rarely needed, git push does it)
```

After any deploy: hard refresh (Ctrl+Shift+R), check DevTools console for
errors, check Network tab for failed API calls. See `CLAUDE.md` for the
full verification checklist.

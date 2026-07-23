# Fuelplan — Frontend

> Vite+React+TS+Tailwind rewrite — all phases (0-6) merged to `main` and
> live. See `PLAN.md` in the project root for phase history. Auth was
> migrated from activation codes to real email/password accounts on
> 2026-07-19 — see "Auth" section below. The Train feature (AI workout
> builder, stretch/Reset routines, browsable exercise library, and its
> macro-adjustment coupling into Fuel) was removed outright on 2026-07-23
> — it wasn't working well (a hardcoded default weekly schedule could mark
> days "training" that the user never chose, and the macro-adjustment
> badge was easy to misread as having changed the actual meal plan when it
> only nudged the displayed target). Nothing was kept behind a flag; if
> training-day nutrition adjustment comes back, it should be redesigned
> rather than restored as-is.

## What this is
AI-powered meal prep PWA — Fuel (meal plans) is the only feature. Vite +
React 19 + TypeScript + Tailwind CSS v4. Ships as a static build to
Netlify.

## File structure
- `index.html` — Vite entry HTML (head meta, font links, icon links)
- `src/main.tsx` — app bootstrap, SW registration
- `src/App.tsx` — top-level shell: theme provider + 3-tab section switch
- `src/sw.ts` — service worker source (built by `vite-plugin-pwa`,
  `injectManifest` strategy — precaching is automatic via Workbox, no more
  manual `CACHE_NAME` bump)
- `src/state/` — React Context providers (Theme, Plan, Account — one per
  concern, plain `useReducer`/`useState`, no external state library)
- `src/components/` — `layout/` (nav, header), `survey/`, `fuel/`, `shared/`
- `src/sections/` — one top-level component per bottom-nav tab (Fuel,
  Prep, Haul)
- `src/api/` — typed fetch wrappers per backend endpoint + localStorage helper
- `src/types/` — shared TS types
- `src/styles/global.css` — Tailwind import + design tokens (`:root`/`.light`
  CSS variables, wired into Tailwind via `@theme`) + base resets
- `public/icons/` — PWA icons (192/512 + maskable variants)
- `vite.config.ts` — Vite + Tailwind + PWA plugin config

## Hosting & services
- Frontend: Netlify at https://fuelplan.fit
  - Auto-deploys on push to main branch of this repo
  - Deploy takes ~20-30 seconds
- Backend: Railway at https://fuelplan-backend-production.up.railway.app
  - *Should* auto-deploy on push to main of the backend repo, but the GitHub
    webhook has failed silently before — after pushing, verify with
    `railway status --json` (deployed commitHash) and force with
    `railway up --ci -m "description"` if it's stale. See the backend's
    `CLAUDE.md` for the full explanation.
  - Deploy takes ~30-60 seconds (has a cold start delay after inactivity)
  - Backend repo is at: C:\Users\lukas\desktop\projects\fuelplan\claude-backend
    (local folder name `claude-backend`; GitHub repo/package.json name is
    `fuelplan-backend` — historical mismatch, not a typo)
- Database: Upstash Redis (REST API)
  - Credentials live in Railway environment variables — never in code
  - Redis keys are now user-account-based (fuelplan:user:*, fuelplan:remaining:USERID,
    fuelplan:history:USERID, etc.) — see the backend's `CLAUDE.md` for the
    full key structure post-auth-migration
  - Cannot be queried directly — only through backend endpoints

## Netlify CLI — use this instead of the dashboard

# Check deploy status and site info
netlify status

# View recent deploy log — `netlify deploys` is NOT a real command (verified
# 2026-07-23, returns "not a netlify command"); use the API method instead:
netlify api listSiteDeploys --data '{"site_id":"7d52ad38-3f73-486b-974c-a39249839f1a"}'

# Manually trigger a deploy (usually not needed — git push does it)
netlify deploy --prod

# View and manage environment variables
netlify env:list
netlify env:set KEY value
netlify env:unset KEY

# Open the Netlify dashboard for this site in browser
netlify open

# View live function logs (if using Netlify functions)
netlify functions:list

## How to verify a deploy worked
1. Wait 30 seconds after git push
2. Run the `listSiteDeploys` API command above — check the top entry's
   `state` is `"ready"` and `commit_ref` matches your latest commit
   (Netlify's auto-deploy has been reliable so far, unlike Railway's — but
   worth the same quick confirmation habit)
3. Open https://fuelplan.fit in the browser (hard refresh: Ctrl+Shift+R)
4. Open DevTools → Console — check for JS errors
5. Open DevTools → Network — check API calls return 200 not 4xx/5xx
6. If old version still shows, service worker is caching it:
   DevTools → Application → Service Workers → Unregister → hard refresh

## How to test features that need an authed session
- Check current session: in DevTools console type `localStorage.getItem('fp_token')`
- 401 = not authenticated / expired token (log in again), 402 = no credits
  left, 503 = AI service overloaded (or `JWT_SECRET` unset on the backend —
  check the error message, don't assume), 504 = timeout

## How to debug backend issues
- Test backend is alive: curl https://fuelplan-backend-production.up.railway.app/
  Should return: {"status":"ok","service":"fuelplan-backend"}
- If that fails, Railway may be cold-starting — wait 20s and retry
- For Railway logs: cd to backend repo and run: railway logs

## Key architecture rules
- React + TypeScript + Tailwind, `npm run build` produces the static `dist/`
  Netlify deploys — this is no longer a build-free vanilla app
- Persisted state (profile, plan, activation code, etc.) lives in
  localStorage under `fp_`-prefixed keys, same naming as before, accessed
  through a typed helper in `src/api/storage.ts` (spiritual successor to the
  old `MEM` object)
- CSS variables defined in `:root` and `.light` (on `<html>`) in
  `src/styles/global.css` — wired into Tailwind via `@theme` so utilities
  like `bg-bg`, `text-muted`, `border-border` respond to the theme class.
  Always use these tokens, never hardcoded colours.
- Bottom nav has 3 sections: **Fuel, Prep, Haul** — plain React state
  in `App.tsx` (`section`), no router. Prep (`sections/PrepSection.tsx`)
  is the Sunday batch-cook checklist (`plan.prep_tasks`) — it used to be a
  collapsible card inline in Fuel, pulled out into its own tab on
  2026-07-23 when Stats (workout-streak tracking, tied to the since-removed
  Train feature) was removed and left the tab slot empty.
- No global mutable `planData` — plan state lives in `PlanContext`
- Escaping is not a concern the way it was in the old innerHTML-based
  renderer — JSX escapes by default. Don't use `dangerouslySetInnerHTML` on
  user-facing dynamic strings.

## localStorage keys (fp_ prefix)
- fp_token              — JWT auth token (90-day expiry), sent as `Authorization: Bearer` on every API call
- fp_userEmail          — signed-in user's email, shown in Settings
- fp_plan               — last generated plan JSON
- fp_planName           — user-set plan name
- fp_userName           — user's name
- fp_profile            — survey profile object
- fp_shopChecks         — shopping list checkbox states
- fp_activeSection      — last active bottom nav section
- fp_activeDay          — last active day tab id
- fp_eaten              — meal-eaten toggle state
- fp_activePlanSavedAt  — timestamp of the currently loaded plan
- fp_theme              — dark/light toggle
- fp_onboarded          — '1' if user has seen onboarding
- fp_installed          — '1' if user installed as PWA

## Auth
Real accounts (email/password), not activation codes — that model was
retired outright in the 2026-07-19 migration, nothing was auto-converted.
- `AuthScreen.tsx` (`components/shared/`) gates the entire app in `App.tsx`
  before any section renders — login/signup/forgot-password/reset-password,
  replacing the old onboarding-era "enter your code" step entirely.
- `AccountContext` holds the JWT + email (not a code string).
  `login()`/`signup()`/`logout()` call the backend auth endpoints and
  persist the session to `fp_token`/`fp_userEmail`.
- `api/client.ts`: every endpoint that used to send `activationCode` in the
  body now relies on the `Authorization: Bearer` header instead
  (`authHeaders()` reads `fp_token`).
- `App.tsx` handles `/?payment=success` (refreshes credit balance, shows a
  dismissible confirmation banner); `AuthScreen` handles `/?reset=TOKEN`
  (password reset deep link from the forgot-password email).
- To manually test as a signed-in user: sign up through the UI, or check
  `localStorage.getItem('fp_token')` is set. A 401 from any endpoint means
  the token is missing/expired — log in again.
- Don't reintroduce "Claude" by name in user-facing copy (error toasts,
  loading messages, settings descriptions) — a branding fix removed it
  everywhere on 2026-07-23; keep new copy provider-agnostic ("AI",
  "the server", etc).

## Fuel day switcher
`components/fuel/DayTabs.tsx` — a single-day swipeable header
("◀ Thursday · Today ▶", touch-swipe or arrow buttons to move ±1 day) plus
a tap-to-jump dot rail below it, replacing the old horizontal-scroll pill
row. `FuelSection.tsx`'s `activeDay` state defaults to today's weekday on
first load (falls back to day 0 if the plan has no matching day name)
rather than always opening on Monday.

## Deploy process
npm run build          — catch TS/build errors locally first
git add -A
git commit -m "feat: description"
git push origin main   — Netlify runs `npm run build`, publishes `dist/`

While on `rebuild/v2`: push to that branch only. Use `netlify deploy`
(without `--prod`) to get a draft preview URL for verification without
touching the live site — `main`/production stays on the old build until
this is reviewed.

## If a deploy breaks the live site
git log --oneline    — find the last working commit
git revert HEAD      — revert the broken commit
git push origin main — Netlify auto-deploys the revert
Within 30 seconds the site is back to the previous version

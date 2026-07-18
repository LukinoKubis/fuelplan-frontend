# Fuelplan — Frontend

> **Rebuild in progress (branch `rebuild/v2`)**: this file describes the
> Vite+React+TS+Tailwind rewrite. See `PLAN.md` in the project root for the
> phase-by-phase plan. `main` still runs the old vanilla build until the
> rebuild is reviewed and merged.

## What this is
AI-powered training + nutrition PWA ("Fuel" pillar: meal plans; "Train" and
"Reset" pillars: workouts and stretching, added post-Phase-1). Vite + React
19 + TypeScript + Tailwind CSS v4. Ships as a static build to Netlify.

## File structure
- `index.html` — Vite entry HTML (head meta, font links, icon links)
- `src/main.tsx` — app bootstrap, SW registration
- `src/App.tsx` — top-level shell: theme provider + 4-tab section switch
- `src/sw.ts` — service worker source (built by `vite-plugin-pwa`,
  `injectManifest` strategy — precaching is automatic via Workbox, no more
  manual `CACHE_NAME` bump)
- `src/state/` — React Context providers (Theme, Plan, Account — one per
  concern, plain `useReducer`/`useState`, no external state library)
- `src/components/` — `layout/` (nav, header), `survey/`, `fuel/`, `shared/`
- `src/sections/` — one top-level component per bottom-nav tab (Fuel, Train,
  Stats, Haul)
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
  - Auto-deploys on push to main of the backend repo
  - Deploy takes ~30-60 seconds (has a cold start delay after inactivity)
  - Backend repo is at: C:\Users\lukas\Desktop\fuelplan\fuelplan-backend
- Database: Upstash Redis (REST API)
  - Credentials live in Railway environment variables — never in code
  - Redis keys: fuelplan:codes (Set), fuelplan:remaining:CODE (String),
    fuelplan:history:CODE (JSON array)
  - Cannot be queried directly — only through backend endpoints

## Netlify CLI — use this instead of the dashboard

# Check deploy status and site info
netlify status

# View recent deploy log
netlify deploys

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
2. Run: netlify deploys — check the top entry shows "Published"
3. Open https://fuelplan.fit in the browser (hard refresh: Ctrl+Shift+R)
4. Open DevTools → Console — check for JS errors
5. Open DevTools → Network — check API calls return 200 not 4xx/5xx
6. If old version still shows, service worker is caching it:
   DevTools → Application → Service Workers → Unregister → hard refresh

## How to test features that need an activation code
- Check active code: in DevTools console type localStorage.getItem('fp_apikey')
- 403 = invalid code, 402 = no credits, 503 = Claude overloaded, 504 = timeout

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
- Bottom nav has 4 sections: **Fuel, Train, Stats, Haul** — plain React state
  in `App.tsx` (`section`), no router
- No global mutable `planData` — plan state lives in `PlanContext`
- Escaping is not a concern the way it was in the old innerHTML-based
  renderer — JSX escapes by default. Don't use `dangerouslySetInnerHTML` on
  user-facing dynamic strings.

## localStorage keys (fp_ prefix)
- fp_apikey         — activation code (uppercased)
- fp_plan           — last generated plan JSON
- fp_planName       — user-set plan name
- fp_userName       — user's name
- fp_profile        — survey profile object
- fp_shopChecks     — shopping list checkbox states
- fp_activeSection  — last active bottom nav section
- fp_activeDay      — last active day tab id
- fp_emailLinked    — '1' if email recovery has been set up
- fp_onboarded      — '1' if user has seen onboarding
- fp_installed      — '1' if user installed as PWA

## Email recovery
- Endpoint: POST /api/account/link-email — { activationCode, email } → links code to hashed email
- Endpoint: POST /api/account/recover — { email } → sends activation code to email if linked
- Emails are never stored plaintext; SHA-256 hashed before storing in Redis
- Requires RESEND_API_KEY and FROM_EMAIL env vars on Railway
- Frontend: shows "Save code to email" row in survey step 1 when code ≥ 6 chars
- fp_emailLinked = '1' collapses the save row after successful link

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
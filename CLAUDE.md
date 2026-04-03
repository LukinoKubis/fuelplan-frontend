# Fuelplan — Frontend

## What this is
AI-powered meal prep PWA. Vanilla HTML/CSS/JS, no framework, no build step.

## File structure
- index.html — all HTML structure
- styles.css  — all CSS (dark/light theme, variables in :root)
- app.js      — all JS (no modules, single file)
- sw.js       — service worker (bump CACHE_NAME on every deploy)

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
- NO frameworks, NO build tools, NO npm on the frontend
- All state in localStorage via the MEM helper (see top of app.js)
- planData is the global in-memory plan object
- CSS variables defined in :root and body.light — always use var(--x) not hardcoded colours
- Bottom nav has 3 sections: week, prep, haul — switchSection() controls them
- The plan JSON schema lives in the jsonTemplate string inside generate()
- escHtml() must be used on all user-facing dynamic strings
- switchDayTab(dayId) switches the day carousel and panel
- renderPlan(plan, userName, isRestoring, planName) is the main render function

## Deploy process
git add -A
git commit -m "feat: description"
git push origin main

## If a deploy breaks the live site
git log --oneline    — find the last working commit
git revert HEAD      — revert the broken commit
git push origin main — Netlify auto-deploys the revert
Within 30 seconds the site is back to the previous version
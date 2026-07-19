// Typed localStorage helper — spiritual successor to the old app.js MEM object.
// Same fp_-prefixed key naming so a returning user's saved profile still works.

export const STORAGE_KEYS = {
  token: 'fp_token',
  userEmail: 'fp_userEmail',
  plan: 'fp_plan',
  planName: 'fp_planName',
  userName: 'fp_userName',
  profile: 'fp_profile',
  shopChecks: 'fp_shopChecks',
  activeSection: 'fp_activeSection',
  activeDay: 'fp_activeDay',
  onboarded: 'fp_onboarded',
  installed: 'fp_installed',
  eaten: 'fp_eaten',
  activePlanSavedAt: 'fp_activePlanSavedAt',
  theme: 'fp_theme',
} as const

export function loadJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function saveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

export function loadString(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function saveString(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* ignore */
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

export function clearPlanData(): void {
  ;[
    STORAGE_KEYS.plan,
    STORAGE_KEYS.planName,
    STORAGE_KEYS.userName,
    STORAGE_KEYS.profile,
    STORAGE_KEYS.shopChecks,
    STORAGE_KEYS.activeDay,
    STORAGE_KEYS.eaten,
    STORAGE_KEYS.activePlanSavedAt,
  ].forEach(remove)
}

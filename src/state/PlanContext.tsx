import { createContext, useCallback, useContext, useReducer, useState, type ReactNode } from 'react'
import type { Plan } from '../types/plan'
import { EMPTY_PROFILE, type Profile } from '../types/profile'
import { loadJSON, remove, saveJSON, STORAGE_KEYS } from '../api/storage'

interface PlanState {
  plan: Plan | null
  userName: string
  planName: string
  profile: Profile
  shopChecks: Record<string, boolean>
  eaten: Record<string, boolean>
  favorites: { name: string }[]
}

type Action =
  | { type: 'SET_PLAN'; plan: Plan; userName: string; planName?: string }
  | { type: 'SET_PLAN_NAME'; planName: string }
  | { type: 'CLEAR_PLAN' }
  | { type: 'SET_PROFILE'; profile: Partial<Profile> }
  | { type: 'TOGGLE_SHOP_CHECK'; id: string }
  | { type: 'TOGGLE_EATEN'; id: string }
  | { type: 'TOGGLE_FAVORITE'; name: string }

function initState(): PlanState {
  return {
    plan: loadJSON<Plan>(STORAGE_KEYS.plan),
    userName: loadJSON<string>(STORAGE_KEYS.userName) || 'Your',
    planName: loadJSON<string>(STORAGE_KEYS.planName) || '',
    profile: { ...EMPTY_PROFILE, ...(loadJSON<Partial<Profile>>(STORAGE_KEYS.profile) || {}) },
    shopChecks: loadJSON<Record<string, boolean>>(STORAGE_KEYS.shopChecks) || {},
    eaten: loadJSON<Record<string, boolean>>(STORAGE_KEYS.eaten) || {},
    favorites: loadJSON<{ name: string }[]>('fp_favorites') || [],
  }
}

function reducer(state: PlanState, action: Action): PlanState {
  switch (action.type) {
    case 'SET_PLAN': {
      const next: PlanState = {
        ...state,
        plan: action.plan,
        userName: action.userName,
        planName: action.planName ?? '',
        shopChecks: {},
        eaten: {},
      }
      saveJSON(STORAGE_KEYS.plan, next.plan)
      saveJSON(STORAGE_KEYS.userName, next.userName)
      saveJSON(STORAGE_KEYS.planName, next.planName)
      saveJSON(STORAGE_KEYS.shopChecks, next.shopChecks)
      remove(STORAGE_KEYS.eaten)
      saveJSON(STORAGE_KEYS.activePlanSavedAt, new Date().toISOString())
      return next
    }
    case 'SET_PLAN_NAME': {
      saveJSON(STORAGE_KEYS.planName, action.planName)
      return { ...state, planName: action.planName }
    }
    case 'CLEAR_PLAN': {
      remove(STORAGE_KEYS.plan)
      remove(STORAGE_KEYS.planName)
      remove(STORAGE_KEYS.shopChecks)
      remove(STORAGE_KEYS.eaten)
      return { ...state, plan: null, planName: '', shopChecks: {}, eaten: {} }
    }
    case 'SET_PROFILE': {
      const profile = { ...state.profile, ...action.profile }
      saveJSON(STORAGE_KEYS.profile, profile)
      return { ...state, profile }
    }
    case 'TOGGLE_SHOP_CHECK': {
      const shopChecks = { ...state.shopChecks, [action.id]: !state.shopChecks[action.id] }
      saveJSON(STORAGE_KEYS.shopChecks, shopChecks)
      return { ...state, shopChecks }
    }
    case 'TOGGLE_EATEN': {
      const eaten = { ...state.eaten, [action.id]: !state.eaten[action.id] }
      saveJSON(STORAGE_KEYS.eaten, eaten)
      return { ...state, eaten }
    }
    case 'TOGGLE_FAVORITE': {
      const exists = state.favorites.some((f) => f.name === action.name)
      const favorites = exists ? state.favorites.filter((f) => f.name !== action.name) : [...state.favorites, { name: action.name }]
      saveJSON('fp_favorites', favorites)
      return { ...state, favorites }
    }
    default:
      return state
  }
}

interface PlanContextValue extends PlanState {
  setPlan: (plan: Plan, userName: string, planName?: string) => void
  setPlanName: (planName: string) => void
  clearPlan: () => void
  setProfile: (profile: Partial<Profile>) => void
  toggleShopCheck: (id: string) => void
  toggleEaten: (id: string) => void
  toggleFavorite: (name: string) => void
  // True while a fullscreen flow (survey/edit-profile) covers the app —
  // App.tsx hides the header/bottom-nav chrome while this is true.
  isFullscreenFlow: boolean
  setIsFullscreenFlow: (value: boolean) => void
}

const PlanContext = createContext<PlanContextValue | null>(null)

export function PlanProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState)
  const [isFullscreenFlow, setIsFullscreenFlow] = useState(false)

  const setPlan = useCallback((plan: Plan, userName: string, planName?: string) => dispatch({ type: 'SET_PLAN', plan, userName, planName }), [])
  const setPlanName = useCallback((planName: string) => dispatch({ type: 'SET_PLAN_NAME', planName }), [])
  const clearPlan = useCallback(() => dispatch({ type: 'CLEAR_PLAN' }), [])
  const setProfile = useCallback((profile: Partial<Profile>) => dispatch({ type: 'SET_PROFILE', profile }), [])
  const toggleShopCheck = useCallback((id: string) => dispatch({ type: 'TOGGLE_SHOP_CHECK', id }), [])
  const toggleEaten = useCallback((id: string) => dispatch({ type: 'TOGGLE_EATEN', id }), [])
  const toggleFavorite = useCallback((name: string) => dispatch({ type: 'TOGGLE_FAVORITE', name }), [])

  return (
    <PlanContext.Provider
      value={{ ...state, setPlan, setPlanName, clearPlan, setProfile, toggleShopCheck, toggleEaten, toggleFavorite, isFullscreenFlow, setIsFullscreenFlow }}
    >
      {children}
    </PlanContext.Provider>
  )
}

export function usePlan() {
  const ctx = useContext(PlanContext)
  if (!ctx) throw new Error('usePlan must be used within PlanProvider')
  return ctx
}

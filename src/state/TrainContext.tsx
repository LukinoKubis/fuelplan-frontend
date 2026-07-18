import { createContext, useCallback, useContext, useReducer, useState, type ReactNode } from 'react'
import type { WorkoutPlan } from '../types/workout'
import { defaultTrainProfile, type TrainProfile } from '../types/workout'
import type { StretchPlan, StretchPrefs } from '../types/stretch'
import { defaultStretchPrefs } from '../types/stretch'
import { loadJSON, saveJSON, remove } from '../api/storage'
import { validateStretchPlan, validateWorkoutPlan } from '../api/validateGenerated'

const KEYS = {
  trainProfile: 'fp_trainProfile',
  workoutPlan: 'fp_workoutPlan',
  completedSets: 'fp_completedSets',
  stretchPrefs: 'fp_stretchPrefs',
  stretchPlan: 'fp_stretchPlan',
  completedStretches: 'fp_completedStretches',
}

interface TrainState {
  trainProfile: TrainProfile
  workoutPlan: WorkoutPlan | null
  completedSets: Record<string, boolean>
  stretchPrefs: StretchPrefs
  stretchPlan: StretchPlan | null
  completedStretches: Record<string, boolean>
}

type Action =
  | { type: 'SET_PROFILE'; profile: Partial<TrainProfile> }
  | { type: 'SET_PLAN'; plan: WorkoutPlan }
  | { type: 'CLEAR_PLAN' }
  | { type: 'TOGGLE_SET'; id: string }
  | { type: 'SET_STRETCH_PREFS'; prefs: Partial<StretchPrefs> }
  | { type: 'SET_STRETCH_PLAN'; plan: StretchPlan }
  | { type: 'CLEAR_STRETCH_PLAN' }
  | { type: 'TOGGLE_STRETCH'; id: string }

// Defends against plans already sitting in localStorage from before response
// validation existed (this shipped as a fix for a real production bug: a
// malformed workout-plan response crashed the render with no boundary,
// leaving a blank/grey screen — and that bad data would otherwise keep
// crashing the app on every load even after the generation-time fix).
function loadValidatedWorkoutPlan(): WorkoutPlan | null {
  const raw = loadJSON<unknown>(KEYS.workoutPlan)
  if (!raw) return null
  try {
    return validateWorkoutPlan(raw)
  } catch {
    remove(KEYS.workoutPlan)
    return null
  }
}

function loadValidatedStretchPlan(amFallback: number, pmFallback: number): StretchPlan | null {
  const raw = loadJSON<unknown>(KEYS.stretchPlan)
  if (!raw) return null
  try {
    return validateStretchPlan(raw, amFallback, pmFallback)
  } catch {
    remove(KEYS.stretchPlan)
    return null
  }
}

function initState(): TrainState {
  const stretchPrefs = { ...defaultStretchPrefs(), ...(loadJSON<Partial<StretchPrefs>>(KEYS.stretchPrefs) || {}) }
  return {
    trainProfile: { ...defaultTrainProfile(), ...(loadJSON<Partial<TrainProfile>>(KEYS.trainProfile) || {}) },
    workoutPlan: loadValidatedWorkoutPlan(),
    completedSets: loadJSON<Record<string, boolean>>(KEYS.completedSets) || {},
    stretchPrefs,
    stretchPlan: loadValidatedStretchPlan(stretchPrefs.amDurationMin, stretchPrefs.pmDurationMin),
    completedStretches: loadJSON<Record<string, boolean>>(KEYS.completedStretches) || {},
  }
}

function reducer(state: TrainState, action: Action): TrainState {
  switch (action.type) {
    case 'SET_PROFILE': {
      const trainProfile = { ...state.trainProfile, ...action.profile }
      saveJSON(KEYS.trainProfile, trainProfile)
      return { ...state, trainProfile }
    }
    case 'SET_PLAN': {
      saveJSON(KEYS.workoutPlan, action.plan)
      remove(KEYS.completedSets)
      return { ...state, workoutPlan: action.plan, completedSets: {} }
    }
    case 'CLEAR_PLAN': {
      remove(KEYS.workoutPlan)
      remove(KEYS.completedSets)
      return { ...state, workoutPlan: null, completedSets: {} }
    }
    case 'TOGGLE_SET': {
      const completedSets = { ...state.completedSets, [action.id]: !state.completedSets[action.id] }
      saveJSON(KEYS.completedSets, completedSets)
      return { ...state, completedSets }
    }
    case 'SET_STRETCH_PREFS': {
      const stretchPrefs = { ...state.stretchPrefs, ...action.prefs }
      saveJSON(KEYS.stretchPrefs, stretchPrefs)
      return { ...state, stretchPrefs }
    }
    case 'SET_STRETCH_PLAN': {
      saveJSON(KEYS.stretchPlan, action.plan)
      remove(KEYS.completedStretches)
      return { ...state, stretchPlan: action.plan, completedStretches: {} }
    }
    case 'CLEAR_STRETCH_PLAN': {
      remove(KEYS.stretchPlan)
      remove(KEYS.completedStretches)
      return { ...state, stretchPlan: null, completedStretches: {} }
    }
    case 'TOGGLE_STRETCH': {
      const completedStretches = { ...state.completedStretches, [action.id]: !state.completedStretches[action.id] }
      saveJSON(KEYS.completedStretches, completedStretches)
      return { ...state, completedStretches }
    }
    default:
      return state
  }
}

interface TrainContextValue extends TrainState {
  setTrainProfile: (profile: Partial<TrainProfile>) => void
  setWorkoutPlan: (plan: WorkoutPlan) => void
  clearWorkoutPlan: () => void
  toggleSetComplete: (id: string) => void
  setStretchPrefs: (prefs: Partial<StretchPrefs>) => void
  setStretchPlan: (plan: StretchPlan) => void
  clearStretchPlan: () => void
  toggleStretchComplete: (id: string) => void
  surveyMode: boolean
  setSurveyMode: (value: boolean) => void
}

const TrainContext = createContext<TrainContextValue | null>(null)

export function TrainProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState)
  const [surveyMode, setSurveyMode] = useState(false)

  const setTrainProfile = useCallback((profile: Partial<TrainProfile>) => dispatch({ type: 'SET_PROFILE', profile }), [])
  const setWorkoutPlan = useCallback((plan: WorkoutPlan) => dispatch({ type: 'SET_PLAN', plan }), [])
  const clearWorkoutPlan = useCallback(() => dispatch({ type: 'CLEAR_PLAN' }), [])
  const toggleSetComplete = useCallback((id: string) => dispatch({ type: 'TOGGLE_SET', id }), [])
  const setStretchPrefs = useCallback((prefs: Partial<StretchPrefs>) => dispatch({ type: 'SET_STRETCH_PREFS', prefs }), [])
  const setStretchPlan = useCallback((plan: StretchPlan) => dispatch({ type: 'SET_STRETCH_PLAN', plan }), [])
  const clearStretchPlan = useCallback(() => dispatch({ type: 'CLEAR_STRETCH_PLAN' }), [])
  const toggleStretchComplete = useCallback((id: string) => dispatch({ type: 'TOGGLE_STRETCH', id }), [])

  return (
    <TrainContext.Provider
      value={{
        ...state,
        setTrainProfile,
        setWorkoutPlan,
        clearWorkoutPlan,
        toggleSetComplete,
        setStretchPrefs,
        setStretchPlan,
        clearStretchPlan,
        toggleStretchComplete,
        surveyMode,
        setSurveyMode,
      }}
    >
      {children}
    </TrainContext.Provider>
  )
}

export function useTrain() {
  const ctx = useContext(TrainContext)
  if (!ctx) throw new Error('useTrain must be used within TrainProvider')
  return ctx
}

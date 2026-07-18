import { createContext, useCallback, useContext, useReducer, useState, type ReactNode } from 'react'
import type { WorkoutPlan } from '../types/workout'
import { defaultTrainProfile, type TrainProfile } from '../types/workout'
import { loadJSON, saveJSON, remove } from '../api/storage'

const KEYS = {
  trainProfile: 'fp_trainProfile',
  workoutPlan: 'fp_workoutPlan',
  completedSets: 'fp_completedSets',
}

interface TrainState {
  trainProfile: TrainProfile
  workoutPlan: WorkoutPlan | null
  completedSets: Record<string, boolean>
}

type Action =
  | { type: 'SET_PROFILE'; profile: Partial<TrainProfile> }
  | { type: 'SET_PLAN'; plan: WorkoutPlan }
  | { type: 'CLEAR_PLAN' }
  | { type: 'TOGGLE_SET'; id: string }

function initState(): TrainState {
  return {
    trainProfile: { ...defaultTrainProfile(), ...(loadJSON<Partial<TrainProfile>>(KEYS.trainProfile) || {}) },
    workoutPlan: loadJSON<WorkoutPlan>(KEYS.workoutPlan),
    completedSets: loadJSON<Record<string, boolean>>(KEYS.completedSets) || {},
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
    default:
      return state
  }
}

interface TrainContextValue extends TrainState {
  setTrainProfile: (profile: Partial<TrainProfile>) => void
  setWorkoutPlan: (plan: WorkoutPlan) => void
  clearWorkoutPlan: () => void
  toggleSetComplete: (id: string) => void
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

  return (
    <TrainContext.Provider
      value={{ ...state, setTrainProfile, setWorkoutPlan, clearWorkoutPlan, toggleSetComplete, surveyMode, setSurveyMode }}
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

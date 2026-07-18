export type MacroMode = 'manual' | 'calc'
export type GoalMode = 'preset' | 'target'
export type Sex = 'male' | 'female'

export interface Profile {
  mode: MacroMode
  name: string
  dietPref: string
  dislikedFoods: string
  trainingDays: string
  trainingStyle: string
  cookingSkill: string
  prepTime: string
  variety: string
  cuisines: string[]

  goalOffset: number
  goalMode: GoalMode
  goalWeeklyRate: number
  goalWeight: string
  goalDate: string

  weight: string
  height: string
  age: string
  sex: Sex
  activity: string

  mKcal: string
  mProtein: string
  mCarbs: string
  mFat: string
}

export const EMPTY_PROFILE: Profile = {
  mode: 'manual',
  name: '',
  dietPref: '',
  dislikedFoods: '',
  trainingDays: '4',
  trainingStyle: '',
  cookingSkill: '',
  prepTime: '',
  variety: 'some variety',
  cuisines: [],

  goalOffset: 0,
  goalMode: 'preset',
  goalWeeklyRate: 0.5,
  goalWeight: '',
  goalDate: '',

  weight: '',
  height: '',
  age: '',
  sex: 'male',
  activity: '1.375',

  mKcal: '',
  mProtein: '',
  mCarbs: '',
  mFat: '',
}

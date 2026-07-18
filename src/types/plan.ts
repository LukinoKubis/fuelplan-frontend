export interface Macros {
  kcal: number
  protein: number
  carbs: number
  fat: number
}

export interface Meal {
  time: string
  name: string
  protein: number
  carbs: number
  fat: number
  kcal: number
  ingredients: string
}

export interface DayPlan {
  day: string
  kcal: number
  protein: number
  carbs: number
  fat: number
  meals: Meal[]
}

export interface PrepTask {
  task: string
  meal: string
  durationMinutes: number
  lane: string
  detail: string
}

export interface ShoppingItem {
  name: string
  qty: string
}

export interface ShoppingCategory {
  category: string
  items: ShoppingItem[]
}

export interface Plan {
  summary: Macros
  prep_tasks: PrepTask[]
  days: DayPlan[]
  shopping_list: ShoppingCategory[]
}

export interface HistoryEntryMeta {
  id: number
  savedAt: string
  userName: string
  planName: string
  macros: Macros
}

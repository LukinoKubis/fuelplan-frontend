export type ExerciseCategory = 'strength' | 'plyometric' | 'isometric' | 'mobility' | 'conditioning'

export type SportTag = 'hockey' | 'golf' | 'football' | 'tennis' | 'general' | 'powerlifting' | 'bodybuilding'

export interface Exercise {
  id: string
  name: string
  primaryMuscles: string[]
  secondaryMuscles: string[]
  equipment: string | null
  level: 'beginner' | 'intermediate' | 'expert'
  instructions: string[]
  images: string[]
  videoUrl?: string
  sportTags: SportTag[]
  category: ExerciseCategory
}

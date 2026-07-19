import { useRef, useState } from 'react'
import { ApiError, postClaude, type GenerateRequest } from './client'

export interface GenerationError {
  message: string
  isOutOfPlans: boolean
}

// Shared loading/error/abort/parse boilerplate for Claude-backed generation
// flows beyond the Fuel survey (which has its own, earlier, already-verified
// implementation) — used by workout and stretch-routine assembly, which are
// close enough to each other to justify not duplicating this a third time.
export function useGeneration<T>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<GenerationError | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  async function run(buildRequest: () => Pick<GenerateRequest, 'system' | 'messages' | 'model' | 'max_tokens'>, onSuccess: (result: T) => void) {
    if (!navigator.onLine) {
      setError({ message: "You're offline — connect to generate.", isOutOfPlans: false })
      return
    }

    setLoading(true)
    setError(null)
    abortRef.current = new AbortController()

    let cleanedTextForDebug = ''

    try {
      const { system, messages, model, max_tokens } = buildRequest()
      const response = await postClaude({ model, max_tokens, system, messages }, abortRef.current.signal)
      const rawText = response.content[0]?.text || ''
      const cleaned = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim()
      cleanedTextForDebug = cleaned

      let result: T
      try {
        result = JSON.parse(cleaned)
      } catch {
        const match = cleaned.match(/\{[\s\S]*\}/)
        if (!match) throw new Error('Claude returned invalid JSON. Please try again.')
        result = JSON.parse(match[0])
      }

      setLoading(false)
      onSuccess(result)
    } catch (err) {
      setLoading(false)
      if (err instanceof DOMException && err.name === 'AbortError') return
      if (err instanceof ApiError) {
        setError({ message: err.message, isOutOfPlans: err.status === 402 })
      } else {
        // Log the actual response so a shape mismatch is diagnosable from
        // DevTools console instead of a guess — this is exactly what's
        // needed to debug "Claude returned an unexpected format" reports.
        console.error('Generation failed:', err, 'raw response:', cleanedTextForDebug)
        setError({ message: (err as Error).message || 'Unknown error occurred.', isOutOfPlans: false })
      }
    }
  }

  function cancel() {
    abortRef.current?.abort()
    setLoading(false)
  }

  return { loading, error, setError, run, cancel }
}

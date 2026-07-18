import { useRef, useState } from 'react'
import { ApiError, postClaude, type GenerateRequest } from './client'
import { useAccount } from '../state/AccountContext'

export interface GenerationError {
  message: string
  isOutOfPlans: boolean
}

// Shared loading/error/abort/parse boilerplate for Claude-backed generation
// flows beyond the Fuel survey (which has its own, earlier, already-verified
// implementation) — used by workout and stretch-routine assembly, which are
// close enough to each other to justify not duplicating this a third time.
export function useGeneration<T>() {
  const { code } = useAccount()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<GenerationError | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  async function run(buildRequest: () => Pick<GenerateRequest, 'system' | 'messages' | 'model' | 'max_tokens'>, onSuccess: (result: T) => void) {
    if (!navigator.onLine) {
      setError({ message: "You're offline — connect to generate.", isOutOfPlans: false })
      return
    }
    const trimmedCode = code.trim().toUpperCase()
    if (!trimmedCode) {
      setError({ message: 'Enter your activation code in Fuel first.', isOutOfPlans: false })
      return
    }

    setLoading(true)
    setError(null)
    abortRef.current = new AbortController()

    try {
      const { system, messages, model, max_tokens } = buildRequest()
      const response = await postClaude({ activationCode: trimmedCode, model, max_tokens, system, messages }, abortRef.current.signal)
      const rawText = response.content[0]?.text || ''
      const cleaned = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim()

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

import type { HistoryEntryMeta, Macros, Plan } from '../types/plan'

export const API_BASE = 'https://fuelplan-backend-production.up.railway.app'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function parseErrorResponse(response: Response): Promise<never> {
  const err = await response.json().catch(() => ({}) as { error?: string; message?: string })
  const status = response.status
  if (status === 402) throw new ApiError(status, err.message || 'You have no plans left on this code.')
  if (status === 403) throw new ApiError(status, 'Invalid activation code. Please check your code and try again.')
  if (status === 401) throw new ApiError(status, 'No activation code provided.')
  if (status === 503) throw new ApiError(status, 'Claude API is temporarily overloaded. Please wait a moment and try again.')
  if (status === 504) throw new ApiError(status, 'Request timed out. Please try again — it usually works on the second attempt.')
  if (status === 502) throw new ApiError(status, 'Server error — please try again.')
  throw new ApiError(status, err.error || `API error ${status}`)
}

export interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

// A system block can carry a cache_control breakpoint — this is a standard
// (non-beta) Messages API feature. Anything at/before a cached block is
// reused across requests at ~10% of input-token cost instead of full price,
// as long as the bytes are byte-identical (prefix match). Our backend is a
// generic proxy that forwards whatever payload it's given straight to
// Anthropic, so this requires no backend changes.
export interface SystemBlock {
  type: 'text'
  text: string
  cache_control?: { type: 'ephemeral'; ttl?: '5m' | '1h' }
}

export interface GenerateRequest {
  activationCode: string
  model: string
  max_tokens: number
  system: string | SystemBlock[]
  messages: ClaudeMessage[]
}

export interface ClaudeResponse {
  content: { text?: string }[]
}

export async function postClaude(body: GenerateRequest, signal?: AbortSignal): Promise<ClaudeResponse> {
  const response = await fetch(`${API_BASE}/api/claude`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify(body),
  })
  if (!response.ok) return parseErrorResponse(response)
  return response.json()
}

export async function fetchUsage(activationCode: string): Promise<{ remaining: number }> {
  const response = await fetch(`${API_BASE}/api/usage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activationCode }),
  })
  if (!response.ok) return parseErrorResponse(response)
  return response.json()
}

export async function saveHistory(params: {
  activationCode: string
  plan: Plan
  userName: string
  planName: string
  macros: Macros
}): Promise<{ ok: boolean; id: number }> {
  const response = await fetch(`${API_BASE}/api/history/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!response.ok) return parseErrorResponse(response)
  return response.json()
}

export async function getHistoryList(activationCode: string): Promise<{ history: HistoryEntryMeta[] }> {
  const response = await fetch(`${API_BASE}/api/history/get`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activationCode }),
  })
  if (!response.ok) return parseErrorResponse(response)
  return response.json()
}

export async function restoreHistory(
  activationCode: string,
  planId: number
): Promise<{ plan: Plan; userName: string; planName: string; savedAt: string }> {
  const response = await fetch(`${API_BASE}/api/history/restore`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activationCode, planId }),
  })
  if (!response.ok) return parseErrorResponse(response)
  return response.json()
}

export async function deleteHistory(activationCode: string, planId: number): Promise<{ ok: boolean; remaining: number }> {
  const response = await fetch(`${API_BASE}/api/history/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activationCode, planId }),
  })
  if (!response.ok) return parseErrorResponse(response)
  return response.json()
}

export async function linkEmail(activationCode: string, email: string): Promise<{ ok: boolean }> {
  const response = await fetch(`${API_BASE}/api/account/link-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activationCode, email }),
  })
  if (!response.ok) return parseErrorResponse(response)
  return response.json()
}

export async function recoverEmail(email: string): Promise<{ ok: boolean }> {
  const response = await fetch(`${API_BASE}/api/account/recover`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  if (!response.ok) return parseErrorResponse(response)
  return response.json()
}

export async function registerCode(activationCode: string): Promise<{ ok: boolean; isNew: boolean }> {
  const response = await fetch(`${API_BASE}/api/register-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activationCode }),
  })
  if (!response.ok) return parseErrorResponse(response)
  return response.json()
}

export async function createCheckout(activationCode: string, plan: '5' | '10' | '20'): Promise<{ url: string }> {
  const response = await fetch(`${API_BASE}/api/create-checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activationCode, plan }),
  })
  if (!response.ok) return parseErrorResponse(response)
  return response.json()
}

export function warmUpBackend(): void {
  const attempt = () => {
    fetch(`${API_BASE}/`)
      .then((r) => {
        if (!r.ok) setTimeout(attempt, 5000)
      })
      .catch(() => setTimeout(attempt, 5000))
  }
  attempt()
}

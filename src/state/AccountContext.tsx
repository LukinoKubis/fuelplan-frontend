import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { fetchUsage } from '../api/client'
import { loadString, saveString, STORAGE_KEYS } from '../api/storage'

interface AccountContextValue {
  code: string
  setCode: (code: string) => void
  remaining: number | null
  refreshRemaining: () => Promise<void>
  emailLinked: boolean
  setEmailLinked: (linked: boolean) => void
}

const AccountContext = createContext<AccountContextValue | null>(null)

const POLL_INTERVAL_MS = 30_000

export function AccountProvider({ children }: { children: ReactNode }) {
  const [code, setCodeState] = useState<string>(() => loadString(STORAGE_KEYS.apiKey) || '')
  const [remaining, setRemaining] = useState<number | null>(null)
  const [emailLinked, setEmailLinkedState] = useState<boolean>(() => loadString(STORAGE_KEYS.emailLinked) === '1')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const setCode = useCallback((next: string) => {
    setCodeState(next)
    saveString(STORAGE_KEYS.apiKey, next)
  }, [])

  const setEmailLinked = useCallback((linked: boolean) => {
    setEmailLinkedState(linked)
    saveString(STORAGE_KEYS.emailLinked, linked ? '1' : '0')
  }, [])

  const refreshRemaining = useCallback(async () => {
    if (!code) return
    try {
      const { remaining: r } = await fetchUsage(code)
      setRemaining(r)
      saveString(STORAGE_KEYS.lastRemainingPrefix + code, String(r))
    } catch {
      /* non-critical */
    }
  }, [code])

  useEffect(() => {
    if (!code) return
    refreshRemaining()
    pollRef.current = setInterval(refreshRemaining, POLL_INTERVAL_MS)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [code, refreshRemaining])

  return (
    <AccountContext.Provider value={{ code, setCode, remaining, refreshRemaining, emailLinked, setEmailLinked }}>
      {children}
    </AccountContext.Provider>
  )
}

export function useAccount() {
  const ctx = useContext(AccountContext)
  if (!ctx) throw new Error('useAccount must be used within AccountProvider')
  return ctx
}

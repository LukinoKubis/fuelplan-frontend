import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { fetchUsage, login as apiLogin, signup as apiSignup, clearSession, saveSession } from '../api/client'
import { loadString, saveString, remove, STORAGE_KEYS } from '../api/storage'

interface AccountContextValue {
  token: string
  email: string
  isAuthed: boolean
  remaining: number | null
  refreshRemaining: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => void
  setSessionFromToken: (token: string, email: string) => void
}

const AccountContext = createContext<AccountContextValue | null>(null)

const POLL_INTERVAL_MS = 30_000

export function AccountProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string>(() => loadString(STORAGE_KEYS.token) || '')
  const [email, setEmail] = useState<string>(() => loadString(STORAGE_KEYS.userEmail) || '')
  const [remaining, setRemaining] = useState<number | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const setSessionFromToken = useCallback((nextToken: string, nextEmail: string) => {
    saveSession(nextToken)
    saveString(STORAGE_KEYS.userEmail, nextEmail)
    setToken(nextToken)
    setEmail(nextEmail)
  }, [])

  const login = useCallback(
    async (emailInput: string, password: string) => {
      const res = await apiLogin(emailInput, password)
      setSessionFromToken(res.token, res.email)
    },
    [setSessionFromToken]
  )

  const signup = useCallback(
    async (emailInput: string, password: string) => {
      const res = await apiSignup(emailInput, password)
      setSessionFromToken(res.token, res.email)
    },
    [setSessionFromToken]
  )

  const logout = useCallback(() => {
    clearSession()
    remove(STORAGE_KEYS.userEmail)
    setToken('')
    setEmail('')
    setRemaining(null)
  }, [])

  const refreshRemaining = useCallback(async () => {
    if (!token) return
    try {
      const { remaining: r } = await fetchUsage()
      setRemaining(r)
    } catch {
      /* non-critical */
    }
  }, [token])

  useEffect(() => {
    if (!token) return
    refreshRemaining()
    pollRef.current = setInterval(refreshRemaining, POLL_INTERVAL_MS)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [token, refreshRemaining])

  return (
    <AccountContext.Provider
      value={{ token, email, isAuthed: !!token, remaining, refreshRemaining, login, signup, logout, setSessionFromToken }}
    >
      {children}
    </AccountContext.Provider>
  )
}

export function useAccount() {
  const ctx = useContext(AccountContext)
  if (!ctx) throw new Error('useAccount must be used within AccountProvider')
  return ctx
}

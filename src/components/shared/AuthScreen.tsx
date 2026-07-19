import { useState } from 'react'
import { Field } from '../survey/Field'
import { useAccount } from '../../state/AccountContext'
import { forgotPassword, resetPassword } from '../../api/client'

type Mode = 'login' | 'signup' | 'forgot' | 'reset'

function getResetTokenFromUrl(): string | null {
  try {
    return new URLSearchParams(window.location.search).get('reset')
  } catch {
    return null
  }
}

export function AuthScreen() {
  const { login, signup } = useAccount()
  const [mode, setMode] = useState<Mode>(() => (getResetTokenFromUrl() ? 'reset' : 'login'))
  const resetToken = getResetTokenFromUrl()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') {
        await login(email.trim().toLowerCase(), password)
      } else if (mode === 'signup') {
        await signup(email.trim().toLowerCase(), password)
      }
    } catch (err) {
      setError((err as Error).message || 'Something went wrong — please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await forgotPassword(email.trim().toLowerCase())
      setNotice('If that email has an account, a reset link is on its way.')
    } catch {
      setNotice('If that email has an account, a reset link is on its way.')
    } finally {
      setBusy(false)
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (!resetToken) return
    setBusy(true)
    setError('')
    try {
      await resetPassword(resetToken, newPassword)
      setNotice('Password updated — you can log in now.')
      setMode('login')
      window.history.replaceState({}, '', window.location.pathname)
    } catch (err) {
      setError((err as Error).message || 'That reset link is invalid or has expired.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[10001] flex flex-col overflow-y-auto bg-bg px-6 py-8">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="mb-6 flex flex-col items-center">
          <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="14" fill="#c8f542" />
            <path d="M25 7L13 27h12l-4 14 18-22H27L31 7H25z" fill="#0e0f11" />
          </svg>
          <h1 className="mt-3 text-xl tracking-wide text-text">FUELPLAN</h1>
        </div>

        <div className="w-full max-w-sm">
          {mode === 'reset' ? (
            <form onSubmit={handleReset}>
              <h2 className="mb-1 text-lg font-semibold text-text">Set a new password</h2>
              <p className="mb-4 text-sm text-muted">Choose a new password for your account.</p>
              <Field
                label="New password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
                minLength={8}
              />
              {error && <p className="mb-3 text-sm text-red">{error}</p>}
              {notice && <p className="mb-3 text-sm text-lime">{notice}</p>}
              <button type="submit" disabled={busy} className="w-full rounded-xl bg-lime py-3 text-sm font-extrabold text-bg disabled:opacity-60">
                {busy ? 'Saving…' : 'Save new password'}
              </button>
            </form>
          ) : mode === 'forgot' ? (
            <form onSubmit={handleForgot}>
              <h2 className="mb-1 text-lg font-semibold text-text">Reset your password</h2>
              <p className="mb-4 text-sm text-muted">Enter your account email and we'll send a reset link.</p>
              <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />
              {notice && <p className="mb-3 text-sm text-lime">{notice}</p>}
              <button type="submit" disabled={busy} className="w-full rounded-xl bg-lime py-3 text-sm font-extrabold text-bg disabled:opacity-60">
                {busy ? 'Sending…' : 'Send reset link'}
              </button>
              <button type="button" onClick={() => setMode('login')} className="mt-3 w-full text-center text-sm font-semibold text-muted underline underline-offset-2">
                Back to log in
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="mb-1 text-lg font-semibold text-text">{mode === 'login' ? 'Log in' : 'Create your account'}</h2>
              <p className="mb-4 text-sm text-muted">
                {mode === 'login' ? 'Welcome back.' : 'Free plans to get started — top up any time in Settings.'}
              </p>
              <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />
              <Field
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={mode === 'signup' ? 8 : undefined}
              />
              {error && <p className="mb-3 text-sm text-red">{error}</p>}
              <button type="submit" disabled={busy} className="w-full rounded-xl bg-lime py-3 text-sm font-extrabold text-bg disabled:opacity-60">
                {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
              </button>

              {mode === 'login' && (
                <button type="button" onClick={() => { setMode('forgot'); setError(''); setNotice('') }} className="mt-3 w-full text-center text-sm font-semibold text-muted underline underline-offset-2">
                  Forgot password?
                </button>
              )}

              <div className="mt-4 text-center text-sm text-muted">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
                  className="font-semibold text-lime underline underline-offset-2"
                >
                  {mode === 'login' ? 'Sign up' : 'Log in'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

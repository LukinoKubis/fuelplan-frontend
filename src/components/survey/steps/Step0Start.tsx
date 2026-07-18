import { useState } from 'react'
import { Field } from '../Field'
import { linkEmail, recoverEmail } from '../../../api/client'

interface Step0Props {
  activationCode: string
  onActivationCodeChange: (code: string) => void
  name: string
  onNameChange: (name: string) => void
  emailLinked: boolean
  onEmailLinked: () => void
  onBuyPlans: () => void
}

export function Step0Start({ activationCode, onActivationCodeChange, name, onNameChange, emailLinked, onEmailLinked, onBuyPlans }: Step0Props) {
  const [email, setEmail] = useState('')
  const [linking, setLinking] = useState(false)
  const [msg, setMsg] = useState('')
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotMsg, setForgotMsg] = useState('')
  const [forgotSending, setForgotSending] = useState(false)

  const codeLooksReal = activationCode.replace(/[^A-Za-z0-9]/g, '').length >= 6

  async function handleSaveEmail() {
    if (!email.trim() || !activationCode.trim()) return
    setLinking(true)
    setMsg('')
    try {
      await linkEmail(activationCode.trim().toUpperCase(), email.trim())
      setMsg('Saved! You can recover your code by email.')
      onEmailLinked()
    } catch {
      setMsg('Could not save — check the email and try again.')
    } finally {
      setLinking(false)
    }
  }

  async function handleSendForgot() {
    if (!forgotEmail.trim()) return
    setForgotSending(true)
    setForgotMsg('')
    try {
      await recoverEmail(forgotEmail.trim())
      setForgotMsg('If that email is linked to a code, it’s on its way.')
    } catch {
      setForgotMsg('Something went wrong — try again shortly.')
    } finally {
      setForgotSending(false)
    }
  }

  return (
    <div>
      <p className="step-label mb-1 text-xs font-bold uppercase tracking-wide text-lime">Step 1 of 4</p>
      <h2 className="mb-2 text-3xl leading-tight text-text">
        Let's get
        <br />
        started
      </h2>
      <p className="mb-6 text-sm text-muted">Enter your activation code and tell us your name so we can personalise your plan.</p>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-semibold text-muted">Activation Code</label>
        <div className="rounded-xl border border-border bg-bg2 px-3 py-3">
          <input
            value={activationCode}
            onChange={(e) => onActivationCodeChange(e.target.value)}
            placeholder="FUEL-XXXX"
            autoCapitalize="characters"
            autoComplete="off"
            className="w-full bg-transparent text-center text-lg font-extrabold uppercase tracking-widest text-text outline-none placeholder:text-muted"
          />
        </div>
      </div>

      <Field label="First Name" optional value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="e.g. Alex" />

      {codeLooksReal && !emailLinked && (
        <div className="mt-2.5 rounded-xl border border-border bg-bg2 p-3">
          <div className="mb-2 text-xs font-semibold text-muted">Save code to email for recovery</div>
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="min-w-0 flex-1 rounded-lg border border-border bg-card px-2.5 py-2 text-sm text-text outline-none"
            />
            <button
              onClick={handleSaveEmail}
              disabled={linking}
              className="shrink-0 rounded-lg bg-lime px-3.5 py-2 text-sm font-extrabold text-bg disabled:opacity-60"
            >
              Save
            </button>
          </div>
          {msg && <div className="mt-1.5 text-center text-xs text-muted">{msg}</div>}
        </div>
      )}

      <div className="mt-3 text-center text-sm text-muted">
        Don't have a code?{' '}
        <button onClick={onBuyPlans} className="font-semibold text-lime underline underline-offset-2">
          Buy plans →
        </button>
      </div>
      <div className="mt-1.5 text-center text-sm text-muted">
        Lost your code?{' '}
        <button onClick={() => setShowForgot((v) => !v)} className="font-semibold text-muted underline underline-offset-2">
          Forgot code →
        </button>
      </div>

      {showForgot && (
        <div className="mt-3 rounded-xl border border-border bg-bg2 p-3.5">
          <div className="mb-2 text-sm font-semibold text-text">Send my code by email</div>
          <input
            type="email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-text outline-none"
          />
          <button
            onClick={handleSendForgot}
            disabled={forgotSending}
            className="mt-2 w-full rounded-lg bg-lime py-2.5 text-sm font-extrabold text-bg disabled:opacity-60"
          >
            Send my code
          </button>
          {forgotMsg && <div className="mt-2 text-center text-xs text-muted">{forgotMsg}</div>}
        </div>
      )}
    </div>
  )
}

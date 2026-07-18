import { useState } from 'react'
import { getInstallPrompt, triggerInstall } from '../../api/installPrompt'

type Screen = 'landing' | 'ios' | 'android'

function detectPlatform(): 'ios' | 'android' | 'other' {
  const ua = navigator.userAgent || ''
  if (/iP(hone|ad|od)/.test(ua)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'other'
}

interface OnboardingProps {
  onDismiss: () => void
  onBuyPlans: () => void
}

export function Onboarding({ onDismiss, onBuyPlans }: OnboardingProps) {
  const [screen, setScreen] = useState<Screen>('landing')
  const platform = detectPlatform()

  return (
    <div className="fixed inset-0 z-[10001] overflow-y-auto bg-bg px-6 py-8">
      {screen === 'landing' && <Landing platform={platform} onPick={setScreen} onDismiss={onDismiss} onBuyPlans={onBuyPlans} />}
      {screen === 'ios' && <IosGuide onBack={() => setScreen('landing')} onDismiss={onDismiss} />}
      {screen === 'android' && <AndroidGuide onBack={() => setScreen('landing')} onDismiss={onDismiss} />}
    </div>
  )
}

function Landing({
  platform,
  onPick,
  onDismiss,
  onBuyPlans,
}: {
  platform: 'ios' | 'android' | 'other'
  onPick: (s: Screen) => void
  onDismiss: () => void
  onBuyPlans: () => void
}) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="flex flex-1 flex-col items-center pt-8 text-center">
        <svg width="52" height="52" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="14" fill="#c8f542" />
          <path d="M25 7L13 27h12l-4 14 18-22H27L31 7H25z" fill="#0e0f11" />
        </svg>
        <h1 className="mt-4 text-2xl tracking-wide text-text">FUELPLAN</h1>
        <p className="mt-2 text-sm text-muted">
          AI-powered meal prep.
          <br />
          Your week, sorted in 30 seconds.
        </p>
        <div className="mt-5 space-y-1.5 self-stretch text-left text-xs text-muted">
          {['7-day personalised meal plan', 'Auto shopping list & batch cook guide', 'Macros tracked, meals you actually enjoy'].map((f) => (
            <div key={f} className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {f}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-2.5">
        <p className="mb-1 text-center text-xs font-semibold text-muted">How would you like to use Fuelplan?</p>
        <OptionButton
          title="Add to Home Screen"
          sub="iPhone / iPad · Best experience"
          highlight={platform === 'ios'}
          onClick={() => onPick('ios')}
        />
        <OptionButton
          title="Install App"
          sub="Android · Feels like a native app"
          highlight={platform === 'android'}
          onClick={() => onPick('android')}
        />
        <OptionButton title="Continue in Browser" sub="No install needed — use right now" onClick={onDismiss} secondary />

        <button onClick={() => { onDismiss(); onBuyPlans() }} className="w-full rounded-2xl bg-lime py-3.5 text-sm font-extrabold text-bg">
          Buy plans →
        </button>
        <button onClick={onDismiss} className="w-full rounded-2xl border border-border py-3 text-sm font-semibold text-muted">
          I already have a code
        </button>
      </div>
    </div>
  )
}

function OptionButton({ title, sub, onClick, highlight, secondary }: { title: string; sub: string; onClick: () => void; highlight?: boolean; secondary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left"
      style={{ borderColor: highlight ? 'var(--lime)' : 'var(--border)', background: secondary ? 'transparent' : 'var(--bg2)' }}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-text">{title}</span>
        <span className="block text-xs text-muted">{sub}</span>
      </span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  )
}

function GuideHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <h2 className="text-lg text-text">{title}</h2>
    </div>
  )
}

function Step({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div className="mb-4 flex gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lime/20 text-xs font-bold text-lime">{num}</span>
      <div>
        <p className="text-sm font-semibold text-text">{title}</p>
        <p className="text-xs leading-relaxed text-muted">{desc}</p>
      </div>
    </div>
  )
}

function IosGuide({ onBack, onDismiss }: { onBack: () => void; onDismiss: () => void }) {
  return (
    <div className="flex min-h-full flex-col">
      <GuideHeader title="Install on iPhone" onBack={onBack} />
      <div className="flex-1">
        <Step num={1} title="Open in Safari" desc="This must be done in Safari — not Chrome or Firefox. If you're in another browser, copy the URL and paste it into Safari." />
        <Step num={2} title="Tap the Share button" desc="At the bottom of Safari, tap the Share icon (the box with an arrow pointing up)." />
        <Step num={3} title='Tap "Add to Home Screen"' desc='Scroll down in the share sheet and tap "Add to Home Screen". Confirm the name and tap Add.' />
        <Step num={4} title="Open from your home screen" desc="Fuelplan will open full-screen like a native app — no browser bar, no distractions." />
      </div>
      <button onClick={onDismiss} className="w-full rounded-2xl bg-lime py-3.5 text-sm font-extrabold text-bg">
        Continue →
      </button>
    </div>
  )
}

function AndroidGuide({ onBack, onDismiss }: { onBack: () => void; onDismiss: () => void }) {
  const [installing, setInstalling] = useState(false)
  const hasPrompt = !!getInstallPrompt()

  async function handleInstall() {
    setInstalling(true)
    const outcome = await triggerInstall()
    if (outcome === 'accepted') {
      setTimeout(onDismiss, 400)
    } else {
      setInstalling(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <GuideHeader title="Install on Android" onBack={onBack} />
      <div className="flex-1">
        {hasPrompt ? (
          <p className="mb-4 text-sm text-muted">Tap the button below to install Fuelplan as an app.</p>
        ) : (
          <>
            <Step num={1} title="Open the browser menu" desc="Tap the ⋮ menu in the top-right corner of Chrome." />
            <Step num={2} title='Tap "Install app" or "Add to Home screen"' desc="This adds Fuelplan as an app icon on your device." />
            <Step num={3} title="Open from your home screen" desc="Fuelplan will open full-screen like a native app." />
          </>
        )}
      </div>
      {hasPrompt ? (
        <button onClick={handleInstall} disabled={installing} className="w-full rounded-2xl bg-lime py-3.5 text-sm font-extrabold text-bg disabled:opacity-60">
          {installing ? 'Installing…' : 'Install now'}
        </button>
      ) : (
        <button onClick={onDismiss} className="w-full rounded-2xl bg-lime py-3.5 text-sm font-extrabold text-bg">
          Continue →
        </button>
      )}
    </div>
  )
}

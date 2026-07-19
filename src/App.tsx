import { useEffect, useState } from 'react'
import { Header } from './components/layout/Header'
import { BottomNav } from './components/layout/BottomNav'
import { FuelSection } from './sections/FuelSection'
import { TrainSection } from './sections/TrainSection'
import { StatsSection } from './sections/StatsSection'
import { HaulSection } from './sections/HaulSection'
import { SettingsDrawer } from './components/shared/SettingsDrawer'
import { HistoryDrawer } from './components/fuel/HistoryDrawer'
import { Onboarding } from './components/shared/Onboarding'
import { AuthScreen } from './components/shared/AuthScreen'
import { ErrorBoundary } from './components/shared/ErrorBoundary'
import { usePlan } from './state/PlanContext'
import { useAccount } from './state/AccountContext'
import { isStandalone } from './api/installPrompt'
import { loadString, STORAGE_KEYS } from './api/storage'
import type { Section } from './types/nav'

const STORAGE_KEY = 'fp_activeSection'

function getInitialSection(): Section {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Section | null
    if (saved === 'fuel' || saved === 'train' || saved === 'stats' || saved === 'haul') return saved
  } catch {
    /* ignore */
  }
  return 'fuel'
}

function shouldShowOnboarding(): boolean {
  if (isStandalone()) return false
  if (loadString('fp_onboarded')) return false
  if (loadString(STORAGE_KEYS.token)) return false
  if (loadString('fp_plan')) return false
  return true
}

function App() {
  const [section, setSection] = useState<Section>(getInitialSection)
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(shouldShowOnboarding)
  const [paymentNotice, setPaymentNotice] = useState(false)
  const { plan, surveyMode, setSurveyMode } = usePlan()
  const { isAuthed, refreshRemaining } = useAccount()

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      if (params.get('payment') === 'success') {
        setPaymentNotice(true)
        refreshRemaining()
        window.history.replaceState({}, '', window.location.pathname)
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = (next: Section) => {
    setSection(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }

  function dismissOnboarding() {
    try {
      localStorage.setItem('fp_onboarded', '1')
    } catch {
      /* ignore */
    }
    setShowOnboarding(false)
  }

  if (showOnboarding) {
    // "Buy plans" from onboarding just proceeds — an account (created next,
    // via the auth gate below) is required before any checkout can happen,
    // since credits are tied to a logged-in user now, not a code typed in.
    return <Onboarding onDismiss={dismissOnboarding} onBuyPlans={dismissOnboarding} />
  }

  if (!isAuthed) {
    return <AuthScreen />
  }

  const chromeHidden = !plan || surveyMode

  return (
    <div className="min-h-screen bg-bg text-text">
      {paymentNotice && (
        <div className="fixed inset-x-0 top-0 z-[9500] flex items-center justify-between gap-3 bg-lime px-4 py-2.5 text-xs font-bold text-bg">
          <span>Payment received — your credits are updated.</span>
          <button onClick={() => setPaymentNotice(false)} className="shrink-0 underline underline-offset-2">
            Dismiss
          </button>
        </div>
      )}
      {!chromeHidden && <Header onOpenSettings={() => setShowSettings(true)} />}
      <main
        style={
          chromeHidden
            ? undefined
            : { paddingTop: 'calc(env(safe-area-inset-top) + 60px)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 72px)' }
        }
      >
        <ErrorBoundary key={section}>
          {section === 'fuel' && <FuelSection onJumpToTrain={() => handleChange('train')} />}
          {section === 'train' && <TrainSection />}
          {section === 'stats' && <StatsSection />}
          {section === 'haul' && <HaulSection />}
        </ErrorBoundary>
      </main>
      {!chromeHidden && <BottomNav active={section} onChange={handleChange} />}

      {showSettings && (
        <SettingsDrawer
          onClose={() => setShowSettings(false)}
          onGenerateNew={() => {
            setSection('fuel')
            setSurveyMode(true)
          }}
          onOpenHistory={() => setShowHistory(true)}
          onOpenInstallGuide={() => setShowOnboarding(true)}
        />
      )}
      {showHistory && <HistoryDrawer onClose={() => setShowHistory(false)} />}
    </div>
  )
}

export default App

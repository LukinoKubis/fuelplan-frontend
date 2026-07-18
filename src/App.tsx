import { useState } from 'react'
import { Header } from './components/layout/Header'
import { BottomNav } from './components/layout/BottomNav'
import { FuelSection } from './sections/FuelSection'
import { TrainSection } from './sections/TrainSection'
import { StatsSection } from './sections/StatsSection'
import { HaulSection } from './sections/HaulSection'
import { SettingsDrawer } from './components/shared/SettingsDrawer'
import { HistoryDrawer } from './components/fuel/HistoryDrawer'
import { Onboarding } from './components/shared/Onboarding'
import { ErrorBoundary } from './components/shared/ErrorBoundary'
import { usePlan } from './state/PlanContext'
import { isStandalone } from './api/installPrompt'
import { loadString } from './api/storage'
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
  if (loadString('fp_apikey')) return false
  if (loadString('fp_plan')) return false
  return true
}

function App() {
  const [section, setSection] = useState<Section>(getInitialSection)
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(shouldShowOnboarding)
  const { plan, surveyMode, setSurveyMode } = usePlan()

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

  function handleBuyPlans() {
    window.location.href = 'https://fuelplan.fit/?buy=1'
  }

  if (showOnboarding) {
    return <Onboarding onDismiss={dismissOnboarding} onBuyPlans={handleBuyPlans} />
  }

  const chromeHidden = !plan || surveyMode

  return (
    <div className="min-h-screen bg-bg text-text">
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

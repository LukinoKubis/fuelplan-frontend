import { useState } from 'react'
import { Header } from './components/layout/Header'
import { BottomNav } from './components/layout/BottomNav'
import { FuelSection } from './sections/FuelSection'
import { TrainSection } from './sections/TrainSection'
import { StatsSection } from './sections/StatsSection'
import { HaulSection } from './sections/HaulSection'
import { usePlan } from './state/PlanContext'
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

function App() {
  const [section, setSection] = useState<Section>(getInitialSection)
  const { isFullscreenFlow } = usePlan()

  const handleChange = (next: Section) => {
    setSection(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      {!isFullscreenFlow && <Header />}
      <main className={isFullscreenFlow ? '' : 'pt-[60px] pb-[72px]'}>
        {section === 'fuel' && <FuelSection />}
        {section === 'train' && <TrainSection />}
        {section === 'stats' && <StatsSection />}
        {section === 'haul' && <HaulSection />}
      </main>
      {!isFullscreenFlow && <BottomNav active={section} onChange={handleChange} />}
    </div>
  )
}

export default App

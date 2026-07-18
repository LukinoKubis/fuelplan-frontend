import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './styles/global.css'
import App from './App.tsx'
import { ThemeProvider } from './state/ThemeContext'
import { PlanProvider } from './state/PlanContext'
import { AccountProvider } from './state/AccountContext'
import { TrainProvider } from './state/TrainContext'
import { warmUpBackend } from './api/client'

registerSW({ immediate: true })
warmUpBackend()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AccountProvider>
        <PlanProvider>
          <TrainProvider>
            <App />
          </TrainProvider>
        </PlanProvider>
      </AccountProvider>
    </ThemeProvider>
  </StrictMode>
)

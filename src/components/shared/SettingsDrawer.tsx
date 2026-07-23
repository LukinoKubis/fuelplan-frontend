import { useState } from 'react'
import { Drawer } from './Drawer'
import { SettingsAction } from './SettingsAction'
import { useTheme } from '../../state/ThemeContext'
import { usePlan } from '../../state/PlanContext'
import { useAccount } from '../../state/AccountContext'
import { createCheckout } from '../../api/client'
import { getInstallPrompt, isStandalone, triggerInstall } from '../../api/installPrompt'

interface SettingsDrawerProps {
  onClose: () => void
  onGenerateNew: () => void
  onOpenHistory: () => void
  onOpenInstallGuide: () => void
}

export function SettingsDrawer({ onClose, onGenerateNew, onOpenHistory, onOpenInstallGuide }: SettingsDrawerProps) {
  const { theme, toggleTheme } = useTheme()
  const { profile } = usePlan()
  const { email, remaining, logout } = useAccount()
  const [resetConfirm, setResetConfirm] = useState(false)
  const [topupBusy, setTopupBusy] = useState(false)

  function resetWeekTracking() {
    // Eaten state lives per-meal-id; simplest correct reset is to clear the
    // whole eaten map, same effect as the old resetWeekTracking().
    try {
      localStorage.removeItem('fp_eaten')
    } catch {
      /* ignore */
    }
    window.location.reload()
  }

  function resetShopList() {
    try {
      localStorage.removeItem('fp_shopChecks')
    } catch {
      /* ignore */
    }
    window.location.reload()
  }

  async function handleTopUp(plan: '5' | '10' | '20') {
    setTopupBusy(true)
    try {
      const { url } = await createCheckout(plan)
      window.location.href = url
    } catch {
      setTopupBusy(false)
    }
  }

  async function handleInstall() {
    if (isStandalone()) return
    if (getInstallPrompt()) {
      await triggerInstall()
    } else {
      onOpenInstallGuide()
    }
  }

  function handleFullReset() {
    if (!resetConfirm) {
      setResetConfirm(true)
      return
    }
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('fp_'))
        .forEach((k) => localStorage.removeItem(k))
    } catch {
      /* ignore */
    }
    window.location.reload()
  }

  return (
    <Drawer title="Settings" onClose={onClose}>
      <div className="mb-5 rounded-xl border border-border bg-bg2 p-3.5">
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Current Profile</div>
        <Row label="Name" value={profile.name || '—'} />
        <Row label="Email" value={email || '—'} />
        <Row label="Plans left" value={remaining === null ? '—' : String(remaining)} last />
      </div>

      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Plans</div>
      <div className="mb-4 space-y-2">
        <SettingsAction
          icon={<BoltIcon />}
          title="Generate New Plan"
          desc="Keep your profile, get a fresh 7-day plan"
          onClick={() => {
            onClose()
            onGenerateNew()
          }}
        />
        <SettingsAction
          icon={<HistoryIcon />}
          iconColor="var(--blue)"
          title="My Plans"
          desc="Browse, restore or delete your saved plans"
          onClick={() => {
            onClose()
            onOpenHistory()
          }}
        />
      </div>

      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Preferences</div>
      <div className="mb-4">
        <SettingsAction
          icon={<ThemeIcon dark={theme === 'dark'} />}
          title="Appearance"
          desc={`Currently ${theme === 'dark' ? 'Dark' : 'Light'} mode`}
          trailing={
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
              style={{ background: theme === 'dark' ? 'var(--lime)' : 'var(--border)' }}
            >
              <span
                className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all"
                style={{ left: theme === 'dark' ? '22px' : '2px' }}
              />
            </button>
          }
        />
      </div>

      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Data</div>
      <div className="mb-4 space-y-2">
        <SettingsAction icon={<ResetIcon />} iconColor="var(--blue)" title="Reset Week Tracking" desc="Clear all eaten meals for a fresh start" onClick={resetWeekTracking} />
        <SettingsAction icon={<CartIcon />} iconColor="var(--orange)" title="Reset Shopping List" desc="Uncheck all ticked items to shop again" onClick={resetShopList} />
        <SettingsAction
          icon={<BoltIcon />}
          title="Top Up Plans"
          desc={topupBusy ? 'Opening checkout…' : 'Buy more AI-generated meal plans'}
          onClick={() => handleTopUp('10')}
        />
        {!isStandalone() && (
          <SettingsAction icon={<InstallIcon />} title="Add to Home Screen" desc="Install Fuelplan as an app for the best experience" onClick={handleInstall} />
        )}
        <SettingsAction
          icon={<LogoutIcon />}
          title="Log Out"
          desc="Sign out of this account on this device"
          onClick={() => {
            logout()
            onClose()
          }}
        />
        <SettingsAction
          icon={<TrashIcon />}
          iconColor="var(--red)"
          danger
          title={resetConfirm ? 'Tap again to confirm' : 'Full Reset'}
          desc="Clear everything — plan, profile, all data"
          onClick={handleFullReset}
        />
      </div>

      <p className="mt-2 text-center text-[11px] leading-relaxed text-muted">
        Your plan and profile are stored locally on this device.
        <br />
        Your account (email/credits) lives on the server.
      </p>
    </Drawer>
  )
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex justify-between py-1.5 text-xs ${last ? '' : 'border-b border-border'}`}>
      <span className="text-muted">{label}</span>
      <span className="font-semibold text-text">{value}</span>
    </div>
  )
}

const ICON_PROPS = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

function BoltIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M13 2L4.5 13.5H11L9 22L19.5 10H13L15 2H13z" />
    </svg>
  )
}
function HistoryIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M3 3h5l1.5 9h9l1.5-9H15" />
      <circle cx="9" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M12 3v9" />
    </svg>
  )
}
function ThemeIcon({ dark }: { dark: boolean }) {
  return dark ? (
    <svg {...ICON_PROPS}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ) : (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
    </svg>
  )
}
function ResetIcon() {
  return (
    <svg {...ICON_PROPS}>
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-3.36" />
    </svg>
  )
}
function CartIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}
function InstallIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}
function LogoutIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}
function TrashIcon() {
  return (
    <svg {...ICON_PROPS}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  )
}

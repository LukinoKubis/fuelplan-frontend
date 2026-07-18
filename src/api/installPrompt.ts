// Captures the Android/desktop-Chrome "beforeinstallprompt" event as early as
// possible (module load, before React mounts) so it's available whenever the
// user later taps "Add to Home Screen" — ported from the old app.js pattern.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let capturedEvent: BeforeInstallPromptEvent | null = null
const listeners = new Set<() => void>()

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  capturedEvent = e as BeforeInstallPromptEvent
  listeners.forEach((l) => l())
})

export function getInstallPrompt(): BeforeInstallPromptEvent | null {
  return capturedEvent
}

export function onInstallPromptAvailable(cb: () => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export async function triggerInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!capturedEvent) return 'unavailable'
  await capturedEvent.prompt()
  const choice = await capturedEvent.userChoice
  capturedEvent = null
  return choice.outcome
}

export function isStandalone(): boolean {
  return (window.navigator as unknown as { standalone?: boolean }).standalone === true || window.matchMedia('(display-mode: standalone)').matches
}

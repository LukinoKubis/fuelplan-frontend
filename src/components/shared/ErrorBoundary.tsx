import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  onReset?: () => void
}

interface State {
  error: Error | null
}

// Defense-in-depth: if a render crashes (e.g. an AI-generated response that
// doesn't quite match the expected shape slips past validation), show a
// recovery screen instead of an uncaught exception unmounting the whole
// app and leaving a blank/grey screen — which is exactly what happened in
// production before this existed (malformed workout-plan JSON crashed
// WorkoutDayView's render with no boundary to catch it).
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    console.error('Render error caught by ErrorBoundary:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-8 text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <h2 className="text-lg text-text">Something went wrong displaying this</h2>
          <p className="max-w-xs text-sm text-muted">This screen hit an unexpected error. Try again — your data hasn't been lost.</p>
          <button
            onClick={() => {
              this.setState({ error: null })
              this.props.onReset?.()
            }}
            className="rounded-xl bg-lime px-5 py-2.5 text-sm font-extrabold text-bg"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

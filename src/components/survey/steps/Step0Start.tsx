import { Field } from '../Field'

interface Step0Props {
  name: string
  onNameChange: (name: string) => void
}

export function Step0Start({ name, onNameChange }: Step0Props) {
  return (
    <div>
      <p className="step-label mb-1 text-xs font-bold uppercase tracking-wide text-lime">Step 1 of 4</p>
      <h2 className="mb-2 text-3xl leading-tight text-text">
        Let's get
        <br />
        started
      </h2>
      <p className="mb-6 text-sm text-muted">Tell us your name so we can personalise your plan.</p>

      <Field label="First Name" optional value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="e.g. Alex" />
    </div>
  )
}

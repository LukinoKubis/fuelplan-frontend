import { useState } from 'react'
import { Modal } from '../shared/Modal'
import { usePlan } from '../../state/PlanContext'
import { saveHistory } from '../../api/client'

export function PlanNameModal({ onClose }: { onClose: () => void }) {
  const { plan, userName, setPlanName } = usePlan()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!plan) return
    setSaving(true)
    const finalName = name.trim() || 'My Plan'
    try {
      await saveHistory({ plan, userName, planName: finalName, macros: plan.summary })
      setPlanName(finalName)
    } catch {
      /* non-critical — plan already saved locally */
    } finally {
      setSaving(false)
      onClose()
    }
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="mb-1.5 text-lg text-text">Name your plan</h2>
      <p className="mb-4 text-sm text-muted">Give this week's plan a name so you can find it later in My Plans.</p>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Cutting Week 1"
        className="mb-4 w-full rounded-xl border border-border bg-bg2 px-3 py-2.5 text-sm text-text outline-none"
      />
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-muted">
          Skip
        </button>
        <button onClick={handleSave} disabled={saving} className="flex-1 rounded-xl bg-lime py-2.5 text-sm font-extrabold text-bg disabled:opacity-60">
          Save
        </button>
      </div>
    </Modal>
  )
}

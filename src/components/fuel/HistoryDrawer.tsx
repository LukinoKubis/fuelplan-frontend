import { useEffect, useState } from 'react'
import { Drawer } from '../shared/Drawer'
import { deleteHistory, getHistoryList, restoreHistory } from '../../api/client'
import { usePlan } from '../../state/PlanContext'
import type { HistoryEntryMeta } from '../../types/plan'

export function HistoryDrawer({ onClose }: { onClose: () => void }) {
  const { setPlan } = usePlan()
  const [entries, setEntries] = useState<HistoryEntryMeta[] | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  useEffect(() => {
    getHistoryList()
      .then((res) => setEntries(res.history))
      .catch(() => setEntries([]))
  }, [])

  async function handleRestore(id: number) {
    setBusyId(id)
    try {
      const res = await restoreHistory(id)
      setPlan(res.plan, res.userName, res.planName)
      onClose()
    } catch {
      /* non-critical */
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(id: number) {
    setBusyId(id)
    try {
      await deleteHistory(id)
      setEntries((prev) => (prev ? prev.filter((e) => e.id !== id) : prev))
    } catch {
      /* non-critical */
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Drawer title="My Plans" onClose={onClose}>
      {entries === null && <p className="text-sm text-muted">Loading…</p>}
      {entries?.length === 0 && <p className="text-sm text-muted">No saved plans yet. Name a plan after generating it to see it here.</p>}
      <div className="space-y-2.5">
        {entries?.map((entry) => (
          <div key={entry.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-bg2 p-3.5">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-text">{entry.planName}</div>
              <div className="text-xs text-muted">
                {new Date(entry.savedAt).toLocaleDateString()} · {entry.macros?.kcal} kcal
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => handleRestore(entry.id)}
                disabled={busyId === entry.id}
                className="rounded-lg border border-lime/40 bg-lime/15 px-2.5 py-1.5 text-xs font-bold text-lime disabled:opacity-50"
              >
                Restore
              </button>
              <button
                onClick={() => handleDelete(entry.id)}
                disabled={busyId === entry.id}
                className="rounded-lg border border-red/30 bg-red/10 px-2.5 py-1.5 text-xs font-bold text-red disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </Drawer>
  )
}

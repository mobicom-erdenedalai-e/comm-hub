'use client'
import { useEffect, useState } from 'react'
import './sidebar.css'
import type { ArtifactType } from '@/lib/types'

type Client = { id: string; name: string }
type Artifact = { id: string; type: string; createdAt: string }

const ARTIFACT_TYPES: { type: ArtifactType; label: string; icon: string }[] = [
  { type: 'weekly-report', label: 'Weekly Report', icon: '📄' },
  { type: 'meeting-summary', label: 'Meeting Summary', icon: '🗒️' },
  { type: 'status-reply', label: 'Status Reply', icon: '💬' },
  { type: 'handover-doc', label: 'Handover Doc', icon: '📦' },
]

type Props = {
  selectedClientId: string | null
  selectedArtifactType: ArtifactType
  onClientChange: (id: string) => void
  onArtifactTypeChange: (type: ArtifactType) => void
  onHistorySelect: (artifactId: string) => void
}

export default function Sidebar({ selectedClientId, selectedArtifactType, onClientChange, onArtifactTypeChange, onHistorySelect }: Props) {
  const [clients, setClients] = useState<Client[]>([])
  const [history, setHistory] = useState<Artifact[]>([])

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(setClients)
  }, [])

  useEffect(() => {
    if (!selectedClientId) return
    fetch(`/api/artifacts?clientId=${selectedClientId}`).then(r => r.json()).then(setHistory)
  }, [selectedClientId])

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">🐙 CommHub</div>

      <div className="sidebar-section-label">Client</div>
      <select
        className="sidebar-client-select"
        value={selectedClientId ?? ''}
        onChange={e => onClientChange(e.target.value)}
      >
        <option value="" disabled>Select client…</option>
        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      <div className="sidebar-section-label">Generate</div>
      {ARTIFACT_TYPES.map(({ type, label, icon }) => (
        <button
          key={type}
          className={`sidebar-nav-item${selectedArtifactType === type ? ' active' : ''}`}
          onClick={() => onArtifactTypeChange(type)}
        >
          {icon} {label}
        </button>
      ))}

      {history.length > 0 && (
        <>
          <div className="sidebar-section-label">History</div>
          {history.slice(0, 5).map(a => (
            <div key={a.id} className="sidebar-history-item" onClick={() => onHistorySelect(a.id)} style={{ cursor: 'pointer' }}>
              {new Date(a.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })} — {a.type.replace('-', ' ')}
            </div>
          ))}
        </>
      )}
    </aside>
  )
}

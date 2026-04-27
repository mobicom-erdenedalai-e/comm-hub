'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/sidebar/Sidebar'
import ArtifactPanel from '@/components/artifact-panel/ArtifactPanel'
import type { ArtifactType } from '@/lib/types'

type Artifact = { id: string; content: string; type: string; createdAt: string }

export default function DashboardPage() {
  const [clientId, setClientId] = useState<string | null>(null)
  const [artifactType, setArtifactType] = useState<ArtifactType>('weekly-report')
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null)
  const [historicDraft, setHistoricDraft] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedArtifactId || !clientId) { setHistoricDraft(null); return }
    fetch(`/api/artifacts?clientId=${clientId}`)
      .then(r => r.json())
      .then((arts: Artifact[]) => {
        const found = arts.find(a => a.id === selectedArtifactId)
        if (found) setHistoricDraft(found.content)
      })
  }, [selectedArtifactId, clientId])

  function handleClientChange(id: string) {
    setClientId(id)
    setSelectedArtifactId(null)
    setHistoricDraft(null)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        selectedClientId={clientId}
        selectedArtifactType={artifactType}
        onClientChange={handleClientChange}
        onArtifactTypeChange={setArtifactType}
        onHistorySelect={id => setSelectedArtifactId(id)}
      />
      <main style={{ flex: 1, padding: '32px' }}>
        {!clientId ? (
          <p style={{ color: '#888', marginTop: '80px', textAlign: 'center' }}>
            Select a client from the sidebar to get started.
          </p>
        ) : (
          <>
            {historicDraft && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Past artifact</span>
                  <button
                    onClick={() => { setSelectedArtifactId(null); setHistoricDraft(null) }}
                    style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '12px' }}
                  >
                    ✕ Close
                  </button>
                </div>
                <div style={{ background: '#f7f8fc', border: '1px solid #dde3f0', borderRadius: '8px', padding: '16px', fontSize: '14px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                  {historicDraft}
                </div>
              </div>
            )}
            <ArtifactPanel clientId={clientId} artifactType={artifactType} />
          </>
        )}
      </main>
    </div>
  )
}

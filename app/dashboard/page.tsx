'use client'
import { useState } from 'react'
import Sidebar from '@/components/sidebar/Sidebar'
import ArtifactPanel from '@/components/artifact-panel/ArtifactPanel'
import type { ArtifactType } from '@/lib/types'

export default function DashboardPage() {
  const [clientId, setClientId] = useState<string | null>(null)
  const [artifactType, setArtifactType] = useState<ArtifactType>('weekly-report')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        selectedClientId={clientId}
        selectedArtifactType={artifactType}
        onClientChange={setClientId}
        onArtifactTypeChange={setArtifactType}
      />
      <main style={{ flex: 1, padding: '32px' }}>
        {!clientId ? (
          <p style={{ color: '#888', marginTop: '80px', textAlign: 'center' }}>
            Select a client from the sidebar to get started.
          </p>
        ) : (
          <ArtifactPanel clientId={clientId} artifactType={artifactType} />
        )}
      </main>
    </div>
  )
}

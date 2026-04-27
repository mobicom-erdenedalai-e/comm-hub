'use client'
import { useState } from 'react'
import Sidebar from '@/components/sidebar/Sidebar'
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
      <main style={{ flex: 1, padding: '24px' }}>
        {!clientId ? (
          <p style={{ color: '#888' }}>Select a client to get started.</p>
        ) : (
          <p style={{ color: '#888' }}>ArtifactPanel coming next…</p>
        )}
      </main>
    </div>
  )
}

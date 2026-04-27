'use client'
import { useState } from 'react'
import './artifact-panel.css'
import Banner from '@/components/ui/Banner'
import type { ArtifactType } from '@/lib/types'

const LABELS: Record<ArtifactType, string> = {
  'weekly-report': 'Weekly Report',
  'meeting-summary': 'Meeting Summary',
  'status-reply': 'Status Reply',
  'handover-doc': 'Handover Doc',
}

function todayMinus(days: number) {
  const d = new Date(); d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]
}

type Props = { clientId: string; artifactType: ArtifactType }

export default function ArtifactPanel({ clientId, artifactType }: Props) {
  const [from, setFrom] = useState(todayMinus(7))
  const [to, setTo] = useState(todayMinus(0))
  const [question, setQuestion] = useState('')
  const [transcript, setTranscript] = useState('')
  const [draft, setDraft] = useState('')
  const [sourcesUsed, setSourcesUsed] = useState<string[]>([])
  const [sourcesFailed, setSourcesFailed] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retries, setRetries] = useState(0)
  const [copied, setCopied] = useState(false)

  async function generate() {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, artifactType, dateRange: { from, to }, question, transcript }),
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Generation failed')
      }
      const data = await res.json()
      setDraft(data.draft)
      setSourcesUsed(data.sourcesUsed)
      setSourcesFailed(data.sourcesFailed)
      setRetries(0)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      if (retries >= 2) {
        setError('AI unavailable — try again later.')
      } else {
        setError(msg)
        setRetries(r => r + 1)
      }
    } finally {
      setLoading(false)
    }
  }

  function copy() {
    navigator.clipboard.writeText(draft)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="artifact-panel">
      <div className="artifact-panel-header">
        <h2 className="artifact-panel-title">{LABELS[artifactType]}</h2>
      </div>

      {error && <Banner type="error" message={error} />}

      <div className="date-range-row">
        <label style={{ fontSize: '13px', color: '#555' }}>From</label>
        <input className="date-input" type="date" value={from} onChange={e => setFrom(e.target.value)} />
        <label style={{ fontSize: '13px', color: '#555' }}>To</label>
        <input className="date-input" type="date" value={to} onChange={e => setTo(e.target.value)} />
        <button className="generate-btn" onClick={generate} disabled={loading}>
          {loading ? 'Generating…' : 'Generate'}
        </button>
      </div>

      {artifactType === 'status-reply' && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '4px' }}>Client question</label>
          <input
            style={{ width: '100%', padding: '8px 10px', border: '1px solid #dde3f0', borderRadius: '6px', fontSize: '13px' }}
            placeholder="e.g. Where are we on the payment integration?"
            value={question}
            onChange={e => setQuestion(e.target.value)}
          />
        </div>
      )}

      {artifactType === 'meeting-summary' && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '4px' }}>Meeting transcript (paste or upload)</label>
          <textarea
            style={{ width: '100%', padding: '8px 10px', border: '1px solid #dde3f0', borderRadius: '6px', fontSize: '13px', minHeight: '100px' }}
            placeholder="Paste transcript here…"
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
          />
        </div>
      )}

      {draft && (
        <>
          <div className="draft-box">{draft}</div>
          <div className="sources-note">
            Sources used: {sourcesUsed.join(', ') || 'none'}
            {sourcesFailed.length > 0 && <span className="failed"> · Unavailable: {sourcesFailed.join(', ')}</span>}
          </div>
          <div className="draft-actions" style={{ marginTop: '8px' }}>
            <button className="draft-action-btn primary" onClick={copy}>{copied ? 'Copied!' : 'Copy'}</button>
            <button className="draft-action-btn" onClick={generate}>Regenerate</button>
          </div>
        </>
      )}
    </div>
  )
}

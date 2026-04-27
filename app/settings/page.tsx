'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Integration = { source: string; config: Record<string, string> }
type FormState = {
  name: string; tone: string; language: string; format: string
  githubOwner: string; githubRepo: string
  jiraBaseUrl: string; jiraEmail: string; jiraToken: string; jiraProjectKey: string
  slackToken: string; slackChannelId: string
}

const DEFAULT: FormState = {
  name: '', tone: 'formal', language: 'en', format: 'email-prose',
  githubOwner: '', githubRepo: '', jiraBaseUrl: '', jiraEmail: '',
  jiraToken: '', jiraProjectKey: '', slackToken: '', slackChannelId: '',
}

export default function SettingsPage() {
  const [form, setForm] = useState<FormState>(DEFAULT)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  function set(key: keyof FormState, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function save() {
    setSaving(true)
    const integrations: Integration[] = []
    if (form.githubOwner && form.githubRepo)
      integrations.push({ source: 'github', config: { owner: form.githubOwner, repo: form.githubRepo } })
    if (form.jiraBaseUrl && form.jiraEmail && form.jiraToken && form.jiraProjectKey)
      integrations.push({ source: 'jira', config: { baseUrl: form.jiraBaseUrl, email: form.jiraEmail, apiToken: form.jiraToken, projectKey: form.jiraProjectKey } })
    if (form.slackToken && form.slackChannelId)
      integrations.push({ source: 'slack', config: { token: form.slackToken, channelId: form.slackChannelId } })

    await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, tone: form.tone, language: form.language, format: form.format, integrations }),
    })
    setSaving(false); setSaved(true)
    setTimeout(() => { setSaved(false); router.push('/dashboard') }, 1200)
  }

  const field = (label: string, key: keyof FormState, placeholder?: string) => (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '4px' }}>{label}</label>
      <input
        style={{ width: '100%', padding: '7px 10px', border: '1px solid #dde3f0', borderRadius: '6px', fontSize: '13px' }}
        value={form[key]}
        onChange={e => set(key, e.target.value)}
        placeholder={placeholder ?? label}
      />
    </div>
  )

  return (
    <div style={{ maxWidth: '540px', margin: '40px auto', padding: '0 24px' }}>
      <h2 style={{ marginBottom: '24px' }}>Add Client</h2>

      {field('Client name', 'name', 'e.g. Acme Corp')}

      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '4px' }}>Tone</label>
          <select
            style={{ width: '100%', padding: '7px 10px', border: '1px solid #dde3f0', borderRadius: '6px', fontSize: '13px' }}
            value={form.tone}
            onChange={e => set('tone', e.target.value)}
          >
            <option value="formal">Formal</option>
            <option value="friendly">Friendly</option>
            <option value="technical">Technical</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '4px' }}>Format</label>
          <select
            style={{ width: '100%', padding: '7px 10px', border: '1px solid #dde3f0', borderRadius: '6px', fontSize: '13px' }}
            value={form.format}
            onChange={e => set('format', e.target.value)}
          >
            <option value="email-prose">Email prose</option>
            <option value="bullet-points">Bullet points</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>{field('Language', 'language', 'en')}</div>
      </div>

      <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#555', margin: '20px 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>GitHub</h3>
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>{field('Owner / Org', 'githubOwner', 'myorg')}</div>
        <div style={{ flex: 1 }}>{field('Repo', 'githubRepo', 'my-project')}</div>
      </div>

      <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#555', margin: '8px 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Jira</h3>
      {field('Base URL', 'jiraBaseUrl', 'https://myorg.atlassian.net')}
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>{field('Email', 'jiraEmail', 'dev@myorg.com')}</div>
        <div style={{ flex: 1 }}>{field('API Token', 'jiraToken', '••••••••')}</div>
        <div style={{ flex: 1 }}>{field('Project Key', 'jiraProjectKey', 'PROJ')}</div>
      </div>

      <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#555', margin: '8px 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Slack</h3>
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>{field('Bot Token', 'slackToken', 'xoxb-…')}</div>
        <div style={{ flex: 1 }}>{field('Channel ID', 'slackChannelId', 'C1234567890')}</div>
      </div>

      <button
        onClick={save}
        disabled={saving || !form.name.trim()}
        style={{ marginTop: '20px', padding: '10px 24px', background: saving ? '#9ba5fc' : '#3b4ef8', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}
      >
        {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Client'}
      </button>
    </div>
  )
}

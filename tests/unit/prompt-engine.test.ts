import { describe, it, expect } from 'vitest'
import { buildPrompt } from '@/lib/prompt-engine'
import type { ActivityBundle, ToneConfig } from '@/lib/types'

const bundle: ActivityBundle = {
  clientId: 'client-1',
  dateRange: { from: new Date('2026-04-14'), to: new Date('2026-04-20') },
  items: [
    { source: 'github', type: 'commit', title: 'fix: auth bug', date: new Date('2026-04-18'), author: 'Alice' },
    { source: 'github', type: 'pull-request', title: 'feat: payment module', date: new Date('2026-04-17') },
    { source: 'jira', type: 'ticket', title: 'PROJ-42: Fix login', date: new Date('2026-04-16') },
  ],
  sourcesUsed: ['github', 'jira'],
  sourcesFailed: [],
}

const tone: ToneConfig = { tone: 'formal', language: 'en', format: 'email-prose' }

describe('buildPrompt', () => {
  it('includes commits, PRs, and tickets in the weekly-report prompt', () => {
    const prompt = buildPrompt('weekly-report', bundle, tone)
    expect(prompt).toContain('fix: auth bug')
    expect(prompt).toContain('feat: payment module')
    expect(prompt).toContain('PROJ-42: Fix login')
    expect(prompt).toContain('formal')
  })

  it('notes failed sources in the prompt', () => {
    const bundleWithFailure = { ...bundle, sourcesFailed: ['slack'] }
    const prompt = buildPrompt('weekly-report', bundleWithFailure, tone)
    expect(prompt).toContain('slack')
  })

  it('applies tone and format instructions', () => {
    const friendlyTone: ToneConfig = { tone: 'friendly', language: 'en', format: 'bullet-points' }
    const prompt = buildPrompt('weekly-report', bundle, friendlyTone)
    expect(prompt).toContain('friendly')
    expect(prompt).toContain('bullet')
  })

  it('throws for unsupported artifact type', () => {
    expect(() => buildPrompt('handover-doc' as any, bundle, tone)).not.toThrow()
  })
})

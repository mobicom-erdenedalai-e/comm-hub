import { describe, it, expect } from 'vitest'

// Unit tests for input validation logic extracted from clients API routes

function validateClientInput(body: Record<string, unknown>) {
  const { name } = body
  if (!name || typeof name !== 'string' || (name as string).trim().length === 0) {
    return { valid: false, error: 'name is required' }
  }
  return { valid: true, error: null }
}

function sanitizeIntegrations(integrations: unknown[]) {
  return integrations.map((i: unknown) => {
    const item = i as { source: string; config?: unknown }
    return { source: item.source, config: item.config ?? {} }
  })
}

describe('validateClientInput', () => {
  it('rejects missing name', () => {
    const result = validateClientInput({})
    expect(result.valid).toBe(false)
    expect(result.error).toBe('name is required')
  })

  it('rejects empty string name', () => {
    const result = validateClientInput({ name: '   ' })
    expect(result.valid).toBe(false)
  })

  it('rejects non-string name', () => {
    const result = validateClientInput({ name: 42 })
    expect(result.valid).toBe(false)
  })

  it('accepts valid name', () => {
    const result = validateClientInput({ name: 'Acme Corp' })
    expect(result.valid).toBe(true)
    expect(result.error).toBeNull()
  })
})

describe('sanitizeIntegrations', () => {
  it('maps source and config', () => {
    const result = sanitizeIntegrations([{ source: 'github', config: { owner: 'org', repo: 'repo' } }])
    expect(result[0].source).toBe('github')
    expect(result[0].config).toEqual({ owner: 'org', repo: 'repo' })
  })

  it('defaults config to empty object when missing', () => {
    const result = sanitizeIntegrations([{ source: 'jira' }])
    expect(result[0].config).toEqual({})
  })

  it('handles empty integrations array', () => {
    expect(sanitizeIntegrations([])).toEqual([])
  })
})

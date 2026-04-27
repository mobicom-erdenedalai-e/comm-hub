import { describe, it, expect } from 'vitest'
import { parseMeetingTranscript } from '@/lib/connectors/meeting'

describe('parseMeetingTranscript', () => {
  it('returns empty items for empty transcript', () => {
    const result = parseMeetingTranscript('')
    expect(result.source).toBe('meeting')
    expect(result.items).toEqual([])
  })

  it('returns empty items for whitespace-only transcript', () => {
    const result = parseMeetingTranscript('   ')
    expect(result.items).toEqual([])
  })

  it('returns single transcript item for non-empty text', () => {
    const result = parseMeetingTranscript('Alice: great sprint this week.')
    expect(result.source).toBe('meeting')
    expect(result.items).toHaveLength(1)
    expect(result.items[0].title).toBe('Meeting transcript')
    expect(result.items[0].description).toBe('Alice: great sprint this week.')
    expect(result.items[0].type).toBe('transcript')
  })

  it('preserves full transcript in description', () => {
    const text = 'Alice: line one\nBob: line two'
    const result = parseMeetingTranscript(text)
    expect(result.items[0].description).toBe(text)
  })
})

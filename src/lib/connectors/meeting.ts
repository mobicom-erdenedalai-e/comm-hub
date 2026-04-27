import type { ConnectorResult } from '../types'

export function parseMeetingTranscript(text: string): ConnectorResult {
  if (!text.trim()) return { source: 'meeting', items: [] }
  return {
    source: 'meeting',
    items: [{
      source: 'meeting',
      type: 'transcript',
      title: 'Meeting transcript',
      description: text,
      date: new Date(),
    }],
  }
}

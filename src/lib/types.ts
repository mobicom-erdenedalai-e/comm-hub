export type ArtifactType =
  | 'weekly-report'
  | 'meeting-summary'
  | 'status-reply'
  | 'handover-doc'

export type ToneConfig = {
  tone: 'formal' | 'friendly' | 'technical'
  language: string
  format: 'email-prose' | 'bullet-points'
}

export type ActivityItem = {
  source: 'github' | 'jira' | 'slack' | 'meeting'
  type: string
  title: string
  description?: string
  url?: string
  date: Date
  author?: string
}

export type ConnectorResult = {
  source: 'github' | 'jira' | 'slack' | 'meeting'
  items: ActivityItem[]
  error?: string
}

export type DateRange = {
  from: Date
  to: Date
}

export type ActivityBundle = {
  clientId: string
  dateRange: DateRange
  items: ActivityItem[]
  sourcesUsed: string[]
  sourcesFailed: string[]
}

export type GenerateRequest = {
  clientId: string
  artifactType: ArtifactType
  dateRange: DateRange
  question?: string  // used by status-reply only
}

export type GenerateResponse = {
  draft: string
  sourcesUsed: string[]
  sourcesFailed: string[]
  artifactId: string
}

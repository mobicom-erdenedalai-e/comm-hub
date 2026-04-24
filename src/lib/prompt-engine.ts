import type { ActivityBundle, ArtifactType, ToneConfig } from './types'

const TONE_TEXT: Record<ToneConfig['tone'], string> = {
  formal: 'Use formal, professional language suitable for executive communication.',
  friendly: 'Use a warm, friendly tone while remaining professional.',
  technical: 'Use precise technical language; the reader is a technical stakeholder.',
}

const FORMAT_TEXT: Record<ToneConfig['format'], string> = {
  'email-prose': 'Write in email prose with clear paragraphs. Use bullet points only for lists.',
  'bullet-points': 'Use concise bullet points throughout.',
}

function sourceNote(bundle: ActivityBundle): string {
  if (bundle.sourcesFailed.length === 0) return ''
  return `\nNote: Data from ${bundle.sourcesFailed.join(', ')} was unavailable and not included.`
}

function weeklyReportPrompt(bundle: ActivityBundle, tone: ToneConfig): string {
  const commits = bundle.items.filter(i => i.type === 'commit')
  const prs = bundle.items.filter(i => i.type === 'pull-request')
  const tickets = bundle.items.filter(i => i.type === 'ticket')

  return `You are writing a weekly progress report on behalf of a software development team for their client.

${TONE_TEXT[tone.tone]}
${FORMAT_TEXT[tone.format]}
Write in language: ${tone.language}.

Activity this week:

COMMITS (${commits.length}):
${commits.map(c => `- ${c.title}${c.author ? ` (${c.author})` : ''}`).join('\n') || '- None'}

MERGED PULL REQUESTS (${prs.length}):
${prs.map(p => `- ${p.title}`).join('\n') || '- None'}

COMPLETED JIRA TICKETS (${tickets.length}):
${tickets.map(t => `- ${t.title}`).join('\n') || '- None'}
${sourceNote(bundle)}

Write a weekly progress report with exactly three sections:
1. Done This Week
2. In Progress
3. Planned for Next Week

For "In Progress" and "Planned for Next Week", make reasonable inferences based on the completed work. Do not invent specific ticket numbers.`
}

function meetingSummaryPrompt(bundle: ActivityBundle, tone: ToneConfig, transcript?: string): string {
  const meetingContent = transcript
    ?? (bundle.items.filter(i => i.source === 'meeting').map(i => i.description).join('\n') || '(No transcript provided)')

  return `You are summarizing a meeting for a software development team.

${TONE_TEXT[tone.tone]}
Write in language: ${tone.language}.

Meeting transcript:
${meetingContent}

Write a meeting summary with three sections:
1. Decisions Made (bullet points)
2. Action Items (bullet points, each with: what, who is responsible, deadline if mentioned)
3. Open Questions (bullet points)`
}

function statusReplyPrompt(bundle: ActivityBundle, tone: ToneConfig, question?: string): string {
  const recentItems = bundle.items.slice(0, 10)
  return `You are drafting a reply to a client question on behalf of a software development team.

${TONE_TEXT[tone.tone]}
Write in language: ${tone.language}.

Client question: "${question ?? '(no question provided)'}"

Recent project activity:
${recentItems.map(i => `- [${i.source}] ${i.title}`).join('\n') || '- None'}
${sourceNote(bundle)}

Write a concise, professional reply (2-4 sentences) that directly answers the client's question using the activity data above.`
}

function handoverDocPrompt(bundle: ActivityBundle, tone: ToneConfig): string {
  return `You are writing a project handover document for a software development team handing off a project to a client or new team.

${TONE_TEXT[tone.tone]}
Write in language: ${tone.language}.

Project activity summary:
${bundle.items.map(i => `- [${i.type}] ${i.title}`).join('\n') || '- None'}
${sourceNote(bundle)}

Write a handover document in markdown with these sections:
1. Project Overview
2. Architecture Summary (infer from the commit and PR history)
3. Deployment Steps
4. Known Issues / Open Items
5. Contacts and Resources`
}

export function buildPrompt(
  type: ArtifactType,
  bundle: ActivityBundle,
  tone: ToneConfig,
  extra?: { question?: string; transcript?: string }
): string {
  switch (type) {
    case 'weekly-report':
      return weeklyReportPrompt(bundle, tone)
    case 'meeting-summary':
      return meetingSummaryPrompt(bundle, tone, extra?.transcript)
    case 'status-reply':
      return statusReplyPrompt(bundle, tone, extra?.question)
    case 'handover-doc':
      return handoverDocPrompt(bundle, tone)
  }
}

import { env } from '@/lib/env'

export type GenerateOptions = {
  prompt: string
  maxRetries?: number
}

export async function generateWithGitHubModels(options: GenerateOptions): Promise<string> {
  const { prompt, maxRetries = 2 } = options
  const token = env.GITHUB_TOKEN

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch('https://models.inference.ai.azure.com/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1500,
        }),
        signal: AbortSignal.timeout(30_000),
      })
      if (!res.ok) throw new Error(`GitHub Models API error: ${res.status} ${await res.text()}`)
      const data = await res.json()
      const content = data?.choices?.[0]?.message?.content
      if (typeof content !== 'string') throw new Error('Unexpected response shape from GitHub Models API')
      return content
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      if (attempt < maxRetries) continue
    }
  }

  throw lastError ?? new Error('Generation failed')
}

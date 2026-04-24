export type GenerateOptions = {
  prompt: string
  maxRetries?: number
}

export async function generateWithGitHubModels(options: GenerateOptions): Promise<string> {
  const { prompt, maxRetries = 2 } = options
  const token = process.env.GITHUB_TOKEN
  if (!token) throw new Error('GITHUB_TOKEN environment variable is not set')

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
      })
      if (!res.ok) throw new Error(`GitHub Models API error: ${res.status} ${await res.text()}`)
      const data = await res.json()
      return data.choices[0].message.content as string
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      if (attempt < maxRetries) continue
    }
  }

  throw lastError ?? new Error('Generation failed')
}

const buckets = new Map<string, number[]>()

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const cutoff = now - windowMs
  const times = (buckets.get(key) ?? []).filter(t => t > cutoff)
  if (times.length >= limit) return false
  times.push(now)
  buckets.set(key, times)
  return true
}

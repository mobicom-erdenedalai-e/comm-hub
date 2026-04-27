const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    if (isBuildPhase) return ''
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export const env = {
  get GITHUB_TOKEN() { return requireEnv('GITHUB_TOKEN') },
  get GITHUB_CLIENT_ID() { return requireEnv('GITHUB_CLIENT_ID') },
  get GITHUB_CLIENT_SECRET() { return requireEnv('GITHUB_CLIENT_SECRET') },
  get CREDENTIAL_ENCRYPTION_KEY() { return requireEnv('CREDENTIAL_ENCRYPTION_KEY') },
}

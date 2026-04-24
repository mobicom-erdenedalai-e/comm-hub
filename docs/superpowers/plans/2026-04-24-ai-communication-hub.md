# AI Communication Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Wiki requirement:** After every task, the subagent MUST write wiki pages per `wiki/SCHEMA.md`. Every task ends with a "Update wiki" step — do not skip it. Read `wiki/README.md` before starting any task.

**Goal:** Build an internal Next.js web app that pulls GitHub, Jira, Slack, and meeting data and uses GitHub Models API (GPT-4o) to generate client-facing communication artifacts.

**Architecture:** Four connector modules normalize data from each source into a shared `ActivityBundle`. A prompt engine injects that bundle into artifact-specific templates and sends them to GitHub Models API. A sidebar-nav dashboard lets devs select a client, pick an artifact type, generate a draft, and copy it.

**Tech Stack:** Next.js 14, TypeScript, Prisma + PostgreSQL, NextAuth (GitHub OAuth), GitHub Models API (fetch, OpenAI-compatible), Vitest (unit), Playwright (E2E)

---

## File Structure

```
src/
  app/
    api/
      auth/[...nextauth]/route.ts   NextAuth GitHub OAuth handler
      clients/route.ts              GET list, POST create
      clients/[id]/route.ts         GET, PUT, DELETE
      generate/route.ts             POST trigger generation
      artifacts/route.ts            GET history
    dashboard/page.tsx              Main dashboard
    settings/page.tsx               Client settings
    login/page.tsx                  Login page
    layout.tsx                      Root layout with auth session
    page.tsx                        Redirects to /dashboard
  components/
    sidebar/
      Sidebar.tsx                   Client selector + artifact type nav + history
      sidebar.css
    artifact-panel/
      ArtifactPanel.tsx             Date range, generate, draft editor
      artifact-panel.css
    ui/
      Button.tsx
      Banner.tsx                    Error / warning banners
  lib/
    types.ts                        All shared TypeScript types
    prisma.ts                       Prisma client singleton
    github-models.ts                GitHub Models API client (fetch)
    aggregator.ts                   Calls connectors in parallel
    prompt-engine.ts                One template per artifact type
    connectors/
      github.ts                     GitHub API connector
      jira.ts                       Jira REST API connector
      slack.ts                      Slack API connector (Phase 2)
      meeting.ts                    Meeting transcript parser (Phase 2)
prisma/
  schema.prisma
tests/
  unit/
    connectors/
      github.test.ts
      jira.test.ts
      slack.test.ts                 (Phase 2)
    aggregator.test.ts
    prompt-engine.test.ts
    github-models.test.ts
  e2e/
    generate-report.spec.ts
.env.example
next.config.ts
tsconfig.json
vitest.config.ts
playwright.config.ts
```

---

## PHASE 1: Foundation

---

### Task 1: Project Setup

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `.env.example`

- [ ] **Step 1: Scaffold Next.js app**

```bash
cd /Users/erdenedalai/Desktop/dk/devevo
npx create-next-app@14 . --typescript --app --no-tailwind --no-eslint --no-src-dir --import-alias "@/*"
```

Expected: Next.js project created with `app/` directory and `tsconfig.json`.

- [ ] **Step 2: Install dependencies**

```bash
npm install next-auth@4 @prisma/client @octokit/rest
npm install -D prisma vitest @vitest/coverage-v8 @playwright/test
```

Expected: `node_modules/` populated, no peer dependency errors.

- [ ] **Step 3: Create `.env.example`**

```bash
cat > .env.example << 'EOF'
DATABASE_URL="postgresql://user:password@localhost:5432/commhub"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
GITHUB_CLIENT_ID="your-github-oauth-app-client-id"
GITHUB_CLIENT_SECRET="your-github-oauth-app-client-secret"
GITHUB_TOKEN="your-github-pat-for-models-api"
EOF
```

- [ ] **Step 4: Create `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/lib/**/*.ts'],
      thresholds: { lines: 80, functions: 80 },
    },
  },
})
```

- [ ] **Step 5: Create `playwright.config.ts`**

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:3000' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

- [ ] **Step 6: Add test scripts to `package.json`**

In `package.json`, add under `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage",
"test:e2e": "playwright test"
```

- [ ] **Step 7: Commit**

```bash
git init
git add package.json package-lock.json tsconfig.json next.config.ts vitest.config.ts playwright.config.ts .env.example .gitignore
git commit -m "chore: scaffold Next.js 14 project with Vitest and Playwright"
```

---

### Task 2: Shared Types

**Files:**
- Create: `src/lib/types.ts`

- [ ] **Step 1: Create `src/lib/types.ts`**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat: add shared types for ActivityBundle and ArtifactType"
```

---

### Task 3: Prisma Schema & Database Migration

**Files:**
- Create: `prisma/schema.prisma`

- [ ] **Step 1: Initialize Prisma**

```bash
npx prisma init --datasource-provider postgresql
```

Expected: `prisma/schema.prisma` and `.env` created.

- [ ] **Step 2: Write `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  githubId  String   @unique
  name      String?
  email     String?
  image     String?
  createdAt DateTime @default(now())
  clients   Client[]
}

model Client {
  id           String        @id @default(cuid())
  userId       String
  user         User          @relation(fields: [userId], references: [id])
  name         String
  tone         String        @default("formal")
  language     String        @default("en")
  format       String        @default("email-prose")
  createdAt    DateTime      @default(now())
  integrations Integration[]
  artifacts    Artifact[]
}

model Integration {
  id        String   @id @default(cuid())
  clientId  String
  client    Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  source    String
  config    Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Artifact {
  id            String    @id @default(cuid())
  clientId      String
  client        Client    @relation(fields: [clientId], references: [id], onDelete: Cascade)
  type          String
  content       String
  sourcesUsed   String[]
  dateRangeFrom DateTime?
  dateRangeTo   DateTime?
  createdAt     DateTime  @default(now())
}
```

- [ ] **Step 3: Run migration (requires local PostgreSQL running)**

```bash
npx prisma migrate dev --name init
```

Expected: Migration file created in `prisma/migrations/`, Prisma Client generated.

- [ ] **Step 4: Commit**

```bash
git add prisma/
git commit -m "feat: add Prisma schema with User, Client, Integration, Artifact tables"
```

---

### Task 4: Prisma Client Singleton

**Files:**
- Create: `src/lib/prisma.ts`

- [ ] **Step 1: Create `src/lib/prisma.ts`**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error'] : [] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/prisma.ts
git commit -m "feat: add Prisma client singleton"
```

---

### Task 5: GitHub OAuth with NextAuth

**Files:**
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/app/api/auth/[...nextauth]/auth.ts`
- Create: `src/app/login/page.tsx`
- Create: `src/app/layout.tsx`

- [ ] **Step 1: Create `src/app/api/auth/[...nextauth]/auth.ts`**

```typescript
import NextAuth, { type NextAuthOptions } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: { params: { scope: 'read:user user:email repo' } },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account || account.provider !== 'github') return false
      await prisma.user.upsert({
        where: { githubId: String(account.providerAccountId) },
        update: { name: user.name, email: user.email, image: user.image },
        create: {
          githubId: String(account.providerAccountId),
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      return true
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        const dbUser = await prisma.user.findUnique({ where: { githubId: token.sub } })
        if (dbUser) (session.user as any).id = dbUser.id
      }
      return session
    },
    async jwt({ token, account }) {
      if (account?.provider === 'github') token.sub = String(account.providerAccountId)
      return token
    },
  },
  pages: { signIn: '/login' },
}

export default NextAuth(authOptions)
```

- [ ] **Step 2: Create `src/app/api/auth/[...nextauth]/route.ts`**

```typescript
import NextAuth from 'next-auth'
import { authOptions } from './auth'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

- [ ] **Step 3: Create `src/app/login/page.tsx`**

```tsx
'use client'
import { signIn } from 'next-auth/react'

export default function LoginPage() {
  return (
    <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ marginBottom: '8px' }}>CommHub</h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>AI-powered client communication for your dev team</p>
        <button
          onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
          style={{ padding: '10px 24px', background: '#24292f', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
        >
          Sign in with GitHub
        </button>
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Create `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/auth'
import SessionProvider from '@/components/SessionProvider'

export const metadata: Metadata = { title: 'CommHub' }

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 5: Create `src/components/SessionProvider.tsx`**

```tsx
'use client'
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'

export default function SessionProvider({ children, session }: { children: React.ReactNode; session: Session | null }) {
  return <NextAuthSessionProvider session={session}>{children}</NextAuthSessionProvider>
}
```

- [ ] **Step 6: Create `src/app/page.tsx`**

```tsx
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/auth'

export default async function Home() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/dashboard')
  else redirect('/login')
}
```

- [ ] **Step 7: Commit**

```bash
git add src/
git commit -m "feat: add GitHub OAuth with NextAuth, login page, and root layout"
```

---

### Task 6: GitHub Models API Client

**Files:**
- Create: `src/lib/github-models.ts`
- Create: `tests/unit/github-models.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/github-models.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateWithGitHubModels } from '@/lib/github-models'

describe('generateWithGitHubModels', () => {
  beforeEach(() => {
    process.env.GITHUB_TOKEN = 'test-token'
    vi.stubGlobal('fetch', vi.fn())
  })

  it('returns the generated text on success', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'Generated text' } }] }),
    } as Response)

    const result = await generateWithGitHubModels({ prompt: 'Hello' })
    expect(result).toBe('Generated text')
  })

  it('retries up to maxRetries times then throws', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    } as Response)

    await expect(generateWithGitHubModels({ prompt: 'Hello', maxRetries: 2 }))
      .rejects.toThrow('GitHub Models API error: 500')
    expect(fetch).toHaveBeenCalledTimes(3) // 1 initial + 2 retries
  })

  it('throws when GITHUB_TOKEN is not set', async () => {
    delete process.env.GITHUB_TOKEN
    await expect(generateWithGitHubModels({ prompt: 'Hello' }))
      .rejects.toThrow('GITHUB_TOKEN environment variable is not set')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/unit/github-models.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/github-models'`

- [ ] **Step 3: Create `src/lib/github-models.ts`**

```typescript
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/unit/github-models.test.ts
```

Expected: PASS — 3 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/lib/github-models.ts tests/unit/github-models.test.ts
git commit -m "feat: add GitHub Models API client with retry logic"
```

---

### Task 7: GitHub Connector

**Files:**
- Create: `src/lib/connectors/github.ts`
- Create: `tests/unit/connectors/github.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/connectors/github.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchGitHubActivity } from '@/lib/connectors/github'

vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn().mockImplementation(() => ({
    repos: {
      listCommits: vi.fn().mockResolvedValue({
        data: [
          {
            sha: 'abc123',
            commit: {
              message: 'fix: resolve auth bug\n\nDetailed description',
              author: { name: 'Alice', date: '2026-04-20T10:00:00Z' },
            },
            html_url: 'https://github.com/org/repo/commit/abc123',
          },
        ],
      }),
    },
    pulls: {
      list: vi.fn().mockResolvedValue({
        data: [
          {
            title: 'feat: add payment module',
            html_url: 'https://github.com/org/repo/pull/42',
            merged_at: '2026-04-19T15:00:00Z',
            user: { login: 'bob' },
          },
        ],
      }),
    },
  })),
}))

describe('fetchGitHubActivity', () => {
  const dateRange = { from: new Date('2026-04-14'), to: new Date('2026-04-20') }

  it('returns normalized commits and merged PRs', async () => {
    const result = await fetchGitHubActivity('token', 'org', 'repo', dateRange)
    expect(result.source).toBe('github')
    expect(result.error).toBeUndefined()
    const commit = result.items.find(i => i.type === 'commit')
    expect(commit?.title).toBe('fix: resolve auth bug')
    expect(commit?.author).toBe('Alice')
    const pr = result.items.find(i => i.type === 'pull-request')
    expect(pr?.title).toBe('feat: add payment module')
  })

  it('returns error field when Octokit throws', async () => {
    const { Octokit } = await import('@octokit/rest')
    vi.mocked(Octokit).mockImplementationOnce(() => ({
      repos: { listCommits: vi.fn().mockRejectedValue(new Error('API rate limit')) },
      pulls: { list: vi.fn() },
    }) as any)
    const result = await fetchGitHubActivity('bad-token', 'org', 'repo', dateRange)
    expect(result.error).toContain('API rate limit')
    expect(result.items).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/unit/connectors/github.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/connectors/github'`

- [ ] **Step 3: Create `src/lib/connectors/github.ts`**

```typescript
import { Octokit } from '@octokit/rest'
import type { ActivityItem, ConnectorResult, DateRange } from '../types'

export async function fetchGitHubActivity(
  token: string,
  owner: string,
  repo: string,
  dateRange: DateRange
): Promise<ConnectorResult> {
  const octokit = new Octokit({ auth: token })
  const items: ActivityItem[] = []

  try {
    const { data: commits } = await octokit.repos.listCommits({
      owner,
      repo,
      since: dateRange.from.toISOString(),
      until: dateRange.to.toISOString(),
      per_page: 100,
    })

    for (const c of commits) {
      items.push({
        source: 'github',
        type: 'commit',
        title: c.commit.message.split('\n')[0],
        description: c.commit.message,
        url: c.html_url,
        date: new Date(c.commit.author?.date ?? ''),
        author: c.commit.author?.name,
      })
    }

    const { data: prs } = await octokit.pulls.list({
      owner,
      repo,
      state: 'closed',
      sort: 'updated',
      direction: 'desc',
      per_page: 50,
    })

    for (const pr of prs) {
      if (
        pr.merged_at &&
        new Date(pr.merged_at) >= dateRange.from &&
        new Date(pr.merged_at) <= dateRange.to
      ) {
        items.push({
          source: 'github',
          type: 'pull-request',
          title: pr.title,
          url: pr.html_url,
          date: new Date(pr.merged_at),
          author: pr.user?.login,
        })
      }
    }

    return { source: 'github', items }
  } catch (error) {
    return { source: 'github', items: [], error: String(error) }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/unit/connectors/github.test.ts
```

Expected: PASS — 2 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/lib/connectors/github.ts tests/unit/connectors/github.test.ts
git commit -m "feat: add GitHub connector with commit and PR normalization"
```

---

### Task 8: Jira Connector

**Files:**
- Create: `src/lib/connectors/jira.ts`
- Create: `tests/unit/connectors/jira.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/connectors/jira.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchJiraActivity } from '@/lib/connectors/jira'

const jiraConfig = {
  baseUrl: 'https://myorg.atlassian.net',
  email: 'dev@myorg.com',
  apiToken: 'test-token',
  projectKey: 'PROJ',
}
const dateRange = { from: new Date('2026-04-14'), to: new Date('2026-04-20') }

describe('fetchJiraActivity', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('returns normalized completed tickets', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        issues: [
          {
            key: 'PROJ-42',
            fields: {
              summary: 'Fix login redirect',
              updated: '2026-04-18T10:00:00Z',
              description: null,
            },
          },
        ],
      }),
    } as Response)

    const result = await fetchJiraActivity(jiraConfig, dateRange)
    expect(result.source).toBe('jira')
    expect(result.error).toBeUndefined()
    expect(result.items).toHaveLength(1)
    expect(result.items[0].title).toBe('PROJ-42: Fix login redirect')
    expect(result.items[0].url).toBe('https://myorg.atlassian.net/browse/PROJ-42')
  })

  it('returns error field when fetch fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) } as Response)
    const result = await fetchJiraActivity(jiraConfig, dateRange)
    expect(result.error).toContain('Jira API error: 401')
    expect(result.items).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/unit/connectors/jira.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/connectors/jira'`

- [ ] **Step 3: Create `src/lib/connectors/jira.ts`**

```typescript
import type { ActivityItem, ConnectorResult, DateRange } from '../types'

export type JiraConfig = {
  baseUrl: string
  email: string
  apiToken: string
  projectKey: string
}

export async function fetchJiraActivity(
  config: JiraConfig,
  dateRange: DateRange
): Promise<ConnectorResult> {
  const { baseUrl, email, apiToken, projectKey } = config
  const auth = Buffer.from(`${email}:${apiToken}`).toString('base64')
  const from = dateRange.from.toISOString().split('T')[0]
  const to = dateRange.to.toISOString().split('T')[0]
  const jql = `project = ${projectKey} AND status = Done AND updated >= "${from}" AND updated <= "${to}"`

  try {
    const res = await fetch(
      `${baseUrl}/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=50&fields=summary,description,updated`,
      { headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' } }
    )

    if (!res.ok) throw new Error(`Jira API error: ${res.status}`)

    const data = await res.json()
    const items: ActivityItem[] = data.issues.map((issue: any) => ({
      source: 'jira' as const,
      type: 'ticket',
      title: `${issue.key}: ${issue.fields.summary}`,
      description: issue.fields.description?.content?.[0]?.content?.[0]?.text ?? undefined,
      url: `${baseUrl}/browse/${issue.key}`,
      date: new Date(issue.fields.updated),
    }))

    return { source: 'jira', items }
  } catch (error) {
    return { source: 'jira', items: [], error: String(error) }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/unit/connectors/jira.test.ts
```

Expected: PASS — 2 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/lib/connectors/jira.ts tests/unit/connectors/jira.test.ts
git commit -m "feat: add Jira connector with completed ticket normalization"
```

---

### Task 9: Aggregator

**Files:**
- Create: `src/lib/aggregator.ts`
- Create: `tests/unit/aggregator.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/aggregator.test.ts
import { describe, it, expect, vi } from 'vitest'
import { aggregate } from '@/lib/aggregator'
import type { ConnectorResult } from '@/lib/types'

vi.mock('@/lib/connectors/github', () => ({
  fetchGitHubActivity: vi.fn(),
}))
vi.mock('@/lib/connectors/jira', () => ({
  fetchJiraActivity: vi.fn(),
}))

import { fetchGitHubActivity } from '@/lib/connectors/github'
import { fetchJiraActivity } from '@/lib/connectors/jira'

const dateRange = { from: new Date('2026-04-14'), to: new Date('2026-04-20') }

describe('aggregate', () => {
  it('merges items from all successful connectors', async () => {
    vi.mocked(fetchGitHubActivity).mockResolvedValue({
      source: 'github', items: [{ source: 'github', type: 'commit', title: 'fix: bug', date: new Date(), }],
    })
    vi.mocked(fetchJiraActivity).mockResolvedValue({
      source: 'jira', items: [{ source: 'jira', type: 'ticket', title: 'PROJ-1: Task', date: new Date() }],
    })

    const bundle = await aggregate('client-1', {
      github: { token: 'tok', owner: 'org', repo: 'repo' },
      jira: { baseUrl: 'https://x.atlassian.net', email: 'a@b.com', apiToken: 'tok', projectKey: 'PROJ' },
    }, dateRange)

    expect(bundle.items).toHaveLength(2)
    expect(bundle.sourcesUsed).toContain('github')
    expect(bundle.sourcesUsed).toContain('jira')
    expect(bundle.sourcesFailed).toHaveLength(0)
  })

  it('marks a connector as failed and continues when it returns an error', async () => {
    vi.mocked(fetchGitHubActivity).mockResolvedValue({ source: 'github', items: [], error: 'rate limit' })
    vi.mocked(fetchJiraActivity).mockResolvedValue({
      source: 'jira', items: [{ source: 'jira', type: 'ticket', title: 'PROJ-2: Done', date: new Date() }],
    })

    const bundle = await aggregate('client-1', {
      github: { token: 'tok', owner: 'org', repo: 'repo' },
      jira: { baseUrl: 'https://x.atlassian.net', email: 'a@b.com', apiToken: 'tok', projectKey: 'PROJ' },
    }, dateRange)

    expect(bundle.items).toHaveLength(1)
    expect(bundle.sourcesFailed).toContain('github')
    expect(bundle.sourcesUsed).toContain('jira')
  })

  it('only calls connectors that have config', async () => {
    vi.mocked(fetchJiraActivity).mockResolvedValue({ source: 'jira', items: [] })
    await aggregate('client-1', { jira: { baseUrl: 'x', email: 'a', apiToken: 't', projectKey: 'P' } }, dateRange)
    expect(fetchGitHubActivity).not.toHaveBeenCalled()
    expect(fetchJiraActivity).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/unit/aggregator.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/aggregator'`

- [ ] **Step 3: Create `src/lib/aggregator.ts`**

```typescript
import type { ActivityBundle, ConnectorResult, DateRange } from './types'
import { fetchGitHubActivity } from './connectors/github'
import { fetchJiraActivity } from './connectors/jira'

export type AggregatorConfig = {
  github?: { token: string; owner: string; repo: string }
  jira?: { baseUrl: string; email: string; apiToken: string; projectKey: string }
}

export async function aggregate(
  clientId: string,
  config: AggregatorConfig,
  dateRange: DateRange
): Promise<ActivityBundle> {
  const tasks: Promise<ConnectorResult>[] = []

  if (config.github) tasks.push(fetchGitHubActivity(config.github.token, config.github.owner, config.github.repo, dateRange))
  if (config.jira) tasks.push(fetchJiraActivity(config.jira, dateRange))

  const results = await Promise.allSettled(tasks)

  const sourcesUsed: string[] = []
  const sourcesFailed: string[] = []
  const allItems = []

  for (const result of results) {
    if (result.status === 'fulfilled') {
      if (result.value.error) {
        sourcesFailed.push(result.value.source)
      } else {
        sourcesUsed.push(result.value.source)
        allItems.push(...result.value.items)
      }
    } else {
      sourcesFailed.push('unknown')
    }
  }

  return {
    clientId,
    dateRange,
    items: allItems.sort((a, b) => b.date.getTime() - a.date.getTime()),
    sourcesUsed,
    sourcesFailed,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/unit/aggregator.test.ts
```

Expected: PASS — 3 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/lib/aggregator.ts tests/unit/aggregator.test.ts
git commit -m "feat: add aggregator with parallel connector calls and partial failure handling"
```

---

### Task 10: Prompt Engine — Weekly Report

**Files:**
- Create: `src/lib/prompt-engine.ts`
- Create: `tests/unit/prompt-engine.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/prompt-engine.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/unit/prompt-engine.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/prompt-engine'`

- [ ] **Step 3: Create `src/lib/prompt-engine.ts`**

```typescript
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
  return `You are summarizing a meeting for a software development team.

${TONE_TEXT[tone.tone]}
Write in language: ${tone.language}.

Meeting transcript:
${transcript ?? bundle.items.filter(i => i.source === 'meeting').map(i => i.description).join('\n') || '(No transcript provided)'}

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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/unit/prompt-engine.test.ts
```

Expected: PASS — 4 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/lib/prompt-engine.ts tests/unit/prompt-engine.test.ts
git commit -m "feat: add prompt engine with weekly-report, meeting-summary, status-reply, handover-doc templates"
```

---

### Task 11: Generate API Route

**Files:**
- Create: `src/app/api/generate/route.ts`

- [ ] **Step 1: Create `src/app/api/generate/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/auth'
import { prisma } from '@/lib/prisma'
import { aggregate, type AggregatorConfig } from '@/lib/aggregator'
import { buildPrompt } from '@/lib/prompt-engine'
import { generateWithGitHubModels } from '@/lib/github-models'
import type { GenerateRequest, ToneConfig } from '@/lib/types'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: GenerateRequest = await req.json()
  const { clientId, artifactType, dateRange, question } = body

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { integrations: true },
  })
  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

  const tone: ToneConfig = {
    tone: client.tone as ToneConfig['tone'],
    language: client.language,
    format: client.format as ToneConfig['format'],
  }

  const config: AggregatorConfig = {}
  const githubToken = process.env.GITHUB_TOKEN!
  for (const integration of client.integrations) {
    if (integration.source === 'github') {
      const c = integration.config as any
      config.github = { token: githubToken, owner: c.owner, repo: c.repo }
    }
    if (integration.source === 'jira') config.jira = integration.config as any
    if (integration.source === 'slack') config.slack = integration.config as any
  }

  const parsedRange = {
    from: new Date(dateRange.from),
    to: new Date(dateRange.to),
  }

  const bundle = await aggregate(clientId, config, parsedRange)
  const prompt = buildPrompt(artifactType, bundle, tone, { question })
  const draft = await generateWithGitHubModels({ prompt })

  const artifact = await prisma.artifact.create({
    data: {
      clientId,
      type: artifactType,
      content: draft,
      sourcesUsed: bundle.sourcesUsed,
      dateRangeFrom: parsedRange.from,
      dateRangeTo: parsedRange.to,
    },
  })

  return NextResponse.json({
    draft,
    sourcesUsed: bundle.sourcesUsed,
    sourcesFailed: bundle.sourcesFailed,
    artifactId: artifact.id,
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/generate/route.ts
git commit -m "feat: add generate API route — aggregates data, builds prompt, calls GitHub Models API"
```

---

### Task 12: Clients CRUD API

**Files:**
- Create: `src/app/api/clients/route.ts`
- Create: `src/app/api/clients/[id]/route.ts`
- Create: `src/app/api/artifacts/route.ts`

- [ ] **Step 1: Create `src/app/api/clients/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id ?? '' } })
  if (!user) return NextResponse.json([], { status: 200 })

  const clients = await prisma.client.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { integrations: true },
  })
  return NextResponse.json(clients)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, tone = 'formal', language = 'en', format = 'email-prose' } = body

  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const user = await prisma.user.findFirst({ where: { email: session.user?.email ?? '' } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const client = await prisma.client.create({
    data: { name, tone, language, format, userId: user.id },
  })
  return NextResponse.json(client, { status: 201 })
}
```

- [ ] **Step 2: Create `src/app/api/clients/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, tone, language, format, integrations } = body

  const client = await prisma.client.update({
    where: { id: params.id },
    data: { name, tone, language, format },
  })

  if (integrations) {
    await prisma.integration.deleteMany({ where: { clientId: params.id } })
    await prisma.integration.createMany({
      data: integrations.map((i: any) => ({ clientId: params.id, source: i.source, config: i.config })),
    })
  }

  return NextResponse.json(client)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.client.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 3: Create `src/app/api/artifacts/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clientId = req.nextUrl.searchParams.get('clientId')
  if (!clientId) return NextResponse.json({ error: 'clientId required' }, { status: 400 })

  const artifacts = await prisma.artifact.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
  return NextResponse.json(artifacts)
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/clients/ src/app/api/artifacts/
git commit -m "feat: add clients CRUD API routes and artifact history endpoint"
```

---

### Task 13: Dashboard Layout & Sidebar

**Files:**
- Create: `src/app/dashboard/page.tsx`
- Create: `src/components/sidebar/Sidebar.tsx`
- Create: `src/components/sidebar/sidebar.css`
- Create: `src/app/dashboard/layout.tsx`

- [ ] **Step 1: Create `src/components/sidebar/sidebar.css`**

```css
.sidebar {
  width: 220px;
  min-height: 100vh;
  background: #f7f8fc;
  border-right: 1px solid #e0e6f0;
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  flex-shrink: 0;
}

.sidebar-logo {
  font-weight: 800;
  font-size: 16px;
  color: #1a1f2e;
  padding: 0 16px 16px;
  border-bottom: 1px solid #e0e6f0;
}

.sidebar-section-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #999;
  padding: 12px 16px 6px;
  text-transform: uppercase;
}

.sidebar-client-select {
  margin: 0 12px;
  padding: 6px 10px;
  border: 1px solid #dde3f0;
  border-radius: 6px;
  background: white;
  font-size: 13px;
  color: #1a1f2e;
  width: calc(100% - 24px);
}

.sidebar-nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 13px;
  color: #555;
  cursor: pointer;
  border-radius: 0;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}

.sidebar-nav-item:hover { background: #eef0f8; }

.sidebar-nav-item.active {
  background: #eef0f8;
  color: #3b4ef8;
  font-weight: 600;
}

.sidebar-history-item {
  padding: 6px 16px;
  font-size: 11px;
  color: #888;
  cursor: pointer;
}

.sidebar-history-item:hover { color: #555; }
```

- [ ] **Step 2: Create `src/components/sidebar/Sidebar.tsx`**

```tsx
'use client'
import { useEffect, useState } from 'react'
import './sidebar.css'
import type { ArtifactType } from '@/lib/types'

type Client = { id: string; name: string }
type Artifact = { id: string; type: string; createdAt: string }

const ARTIFACT_TYPES: { type: ArtifactType; label: string; icon: string }[] = [
  { type: 'weekly-report', label: 'Weekly Report', icon: '📄' },
  { type: 'meeting-summary', label: 'Meeting Summary', icon: '🗒️' },
  { type: 'status-reply', label: 'Status Reply', icon: '💬' },
  { type: 'handover-doc', label: 'Handover Doc', icon: '📦' },
]

type Props = {
  selectedClientId: string | null
  selectedArtifactType: ArtifactType
  onClientChange: (id: string) => void
  onArtifactTypeChange: (type: ArtifactType) => void
}

export default function Sidebar({ selectedClientId, selectedArtifactType, onClientChange, onArtifactTypeChange }: Props) {
  const [clients, setClients] = useState<Client[]>([])
  const [history, setHistory] = useState<Artifact[]>([])

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(setClients)
  }, [])

  useEffect(() => {
    if (!selectedClientId) return
    fetch(`/api/artifacts?clientId=${selectedClientId}`).then(r => r.json()).then(setHistory)
  }, [selectedClientId])

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">🐙 CommHub</div>

      <div className="sidebar-section-label">Client</div>
      <select
        className="sidebar-client-select"
        value={selectedClientId ?? ''}
        onChange={e => onClientChange(e.target.value)}
      >
        <option value="" disabled>Select client…</option>
        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      <div className="sidebar-section-label">Generate</div>
      {ARTIFACT_TYPES.map(({ type, label, icon }) => (
        <button
          key={type}
          className={`sidebar-nav-item${selectedArtifactType === type ? ' active' : ''}`}
          onClick={() => onArtifactTypeChange(type)}
        >
          {icon} {label}
        </button>
      ))}

      {history.length > 0 && (
        <>
          <div className="sidebar-section-label">History</div>
          {history.slice(0, 5).map(a => (
            <div key={a.id} className="sidebar-history-item">
              {new Date(a.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })} — {a.type.replace('-', ' ')}
            </div>
          ))}
        </>
      )}
    </aside>
  )
}
```

- [ ] **Step 3: Create `src/app/dashboard/layout.tsx`**

```tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '../api/auth/[...nextauth]/auth'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  return <>{children}</>
}
```

- [ ] **Step 4: Create `src/app/dashboard/page.tsx`** (shell — ArtifactPanel added next task)

```tsx
'use client'
import { useState } from 'react'
import Sidebar from '@/components/sidebar/Sidebar'
import type { ArtifactType } from '@/lib/types'

export default function DashboardPage() {
  const [clientId, setClientId] = useState<string | null>(null)
  const [artifactType, setArtifactType] = useState<ArtifactType>('weekly-report')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        selectedClientId={clientId}
        selectedArtifactType={artifactType}
        onClientChange={setClientId}
        onArtifactTypeChange={setArtifactType}
      />
      <main style={{ flex: 1, padding: '24px' }}>
        {!clientId ? (
          <p style={{ color: '#888' }}>Select a client to get started.</p>
        ) : (
          <p style={{ color: '#888' }}>ArtifactPanel coming next…</p>
        )}
      </main>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/sidebar/ src/app/dashboard/
git commit -m "feat: add dashboard layout and Sidebar component with client selector and artifact nav"
```

---

### Task 14: ArtifactPanel Component

**Files:**
- Create: `src/components/artifact-panel/ArtifactPanel.tsx`
- Create: `src/components/artifact-panel/artifact-panel.css`
- Create: `src/components/ui/Banner.tsx`
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Create `src/components/ui/Banner.tsx`**

```tsx
type Props = { type: 'error' | 'warning'; message: string; action?: { label: string; href: string } }

export default function Banner({ type, message, action }: Props) {
  const bg = type === 'error' ? '#fff0f0' : '#fff8e1'
  const border = type === 'error' ? '#ffb3b3' : '#f5c842'
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '6px', padding: '10px 14px', fontSize: '13px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>{message}</span>
      {action && <a href={action.href} style={{ color: '#3b4ef8', fontWeight: 600, fontSize: '12px' }}>{action.label}</a>}
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/artifact-panel/artifact-panel.css`**

```css
.artifact-panel { max-width: 760px; }

.artifact-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.artifact-panel-title { font-size: 18px; font-weight: 700; color: #1a1f2e; }

.date-range-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.date-input {
  padding: 6px 10px;
  border: 1px solid #dde3f0;
  border-radius: 6px;
  font-size: 13px;
  color: #1a1f2e;
}

.generate-btn {
  padding: 8px 20px;
  background: #3b4ef8;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.generate-btn:disabled { background: #9ba5fc; cursor: not-allowed; }

.draft-box {
  background: #f7f8fc;
  border: 1px solid #dde3f0;
  border-radius: 8px;
  padding: 16px;
  min-height: 200px;
  font-size: 14px;
  line-height: 1.7;
  color: #1a1f2e;
  white-space: pre-wrap;
  margin-bottom: 12px;
}

.draft-actions { display: flex; gap: 8px; }

.draft-action-btn {
  padding: 7px 16px;
  border: 1px solid #dde3f0;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  background: white;
  color: #333;
}

.draft-action-btn.primary { background: #3b4ef8; color: white; border-color: #3b4ef8; }
.draft-action-btn:hover { background: #f0f0f0; }
.draft-action-btn.primary:hover { background: #2d3de0; }

.sources-note { font-size: 11px; color: #888; margin-top: 8px; }
.sources-note .failed { color: #e05252; }
```

- [ ] **Step 3: Create `src/components/artifact-panel/ArtifactPanel.tsx`**

```tsx
'use client'
import { useState } from 'react'
import './artifact-panel.css'
import Banner from '@/components/ui/Banner'
import type { ArtifactType } from '@/lib/types'

const LABELS: Record<ArtifactType, string> = {
  'weekly-report': 'Weekly Report',
  'meeting-summary': 'Meeting Summary',
  'status-reply': 'Status Reply',
  'handover-doc': 'Handover Doc',
}

function todayMinus(days: number) {
  const d = new Date(); d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]
}

type Props = { clientId: string; artifactType: ArtifactType }

export default function ArtifactPanel({ clientId, artifactType }: Props) {
  const [from, setFrom] = useState(todayMinus(7))
  const [to, setTo] = useState(todayMinus(0))
  const [question, setQuestion] = useState('')
  const [transcript, setTranscript] = useState('')
  const [draft, setDraft] = useState('')
  const [sourcesUsed, setSourcesUsed] = useState<string[]>([])
  const [sourcesFailed, setSourcesFailed] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retries, setRetries] = useState(0)
  const [copied, setCopied] = useState(false)

  async function generate() {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, artifactType, dateRange: { from, to }, question, transcript }),
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Generation failed')
      }
      const data = await res.json()
      setDraft(data.draft)
      setSourcesUsed(data.sourcesUsed)
      setSourcesFailed(data.sourcesFailed)
      setRetries(0)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      if (retries >= 2) {
        setError('AI unavailable — try again later.')
      } else {
        setError(msg)
        setRetries(r => r + 1)
      }
    } finally {
      setLoading(false)
    }
  }

  function copy() {
    navigator.clipboard.writeText(draft)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="artifact-panel">
      <div className="artifact-panel-header">
        <h2 className="artifact-panel-title">{LABELS[artifactType]}</h2>
      </div>

      {error && <Banner type="error" message={error} />}

      <div className="date-range-row">
        <label style={{ fontSize: '13px', color: '#555' }}>From</label>
        <input className="date-input" type="date" value={from} onChange={e => setFrom(e.target.value)} />
        <label style={{ fontSize: '13px', color: '#555' }}>To</label>
        <input className="date-input" type="date" value={to} onChange={e => setTo(e.target.value)} />
        <button className="generate-btn" onClick={generate} disabled={loading}>
          {loading ? 'Generating…' : 'Generate'}
        </button>
      </div>

      {artifactType === 'status-reply' && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '4px' }}>Client question</label>
          <input
            style={{ width: '100%', padding: '8px 10px', border: '1px solid #dde3f0', borderRadius: '6px', fontSize: '13px' }}
            placeholder="e.g. Where are we on the payment integration?"
            value={question}
            onChange={e => setQuestion(e.target.value)}
          />
        </div>
      )}

      {artifactType === 'meeting-summary' && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '4px' }}>Meeting transcript (paste or upload)</label>
          <textarea
            style={{ width: '100%', padding: '8px 10px', border: '1px solid #dde3f0', borderRadius: '6px', fontSize: '13px', minHeight: '100px' }}
            placeholder="Paste transcript here…"
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
          />
        </div>
      )}

      {draft && (
        <>
          <div className="draft-box">{draft}</div>
          <div className="sources-note">
            Sources used: {sourcesUsed.join(', ') || 'none'}
            {sourcesFailed.length > 0 && <span className="failed"> · Unavailable: {sourcesFailed.join(', ')}</span>}
          </div>
          <div className="draft-actions" style={{ marginTop: '8px' }}>
            <button className="draft-action-btn primary" onClick={copy}>{copied ? 'Copied!' : 'Copy'}</button>
            <button className="draft-action-btn" onClick={generate}>Regenerate</button>
          </div>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Update `src/app/dashboard/page.tsx`** to use ArtifactPanel

```tsx
'use client'
import { useState } from 'react'
import Sidebar from '@/components/sidebar/Sidebar'
import ArtifactPanel from '@/components/artifact-panel/ArtifactPanel'
import type { ArtifactType } from '@/lib/types'

export default function DashboardPage() {
  const [clientId, setClientId] = useState<string | null>(null)
  const [artifactType, setArtifactType] = useState<ArtifactType>('weekly-report')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        selectedClientId={clientId}
        selectedArtifactType={artifactType}
        onClientChange={setClientId}
        onArtifactTypeChange={setArtifactType}
      />
      <main style={{ flex: 1, padding: '32px' }}>
        {!clientId ? (
          <p style={{ color: '#888', marginTop: '80px', textAlign: 'center' }}>
            Select a client from the sidebar to get started.
          </p>
        ) : (
          <ArtifactPanel clientId={clientId} artifactType={artifactType} />
        )}
      </main>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/artifact-panel/ src/components/ui/ src/app/dashboard/page.tsx
git commit -m "feat: add ArtifactPanel with date range, generate, draft display, copy and retry logic"
```

---

### Task 15: E2E Test — Weekly Report Flow

**Files:**
- Create: `tests/e2e/generate-report.spec.ts`

- [ ] **Step 1: Create `tests/e2e/generate-report.spec.ts`**

```typescript
import { test, expect } from '@playwright/test'

test.describe('Weekly Report Generation', () => {
  test('unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('login page shows GitHub sign-in button', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('button', { name: /sign in with github/i })).toBeVisible()
  })
})
```

- [ ] **Step 2: Run E2E tests**

```bash
npx playwright test tests/e2e/generate-report.spec.ts
```

Expected: PASS — 2 tests (auth redirect + login page visible)

- [ ] **Step 3: Run full test suite to confirm Phase 1 is green**

```bash
npm run test:coverage
```

Expected: All unit tests passing, coverage > 80% on `src/lib/**`

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/generate-report.spec.ts
git commit -m "test: add E2E tests for auth redirect and login page"
```

---

## PHASE 2: Slack + Meeting Summary

---

### Task 16: Slack Connector

**Files:**
- Create: `src/lib/connectors/slack.ts`
- Create: `tests/unit/connectors/slack.test.ts`
- Modify: `src/lib/aggregator.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/connectors/slack.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchSlackActivity } from '@/lib/connectors/slack'

const slackConfig = { token: 'xoxb-test', channelId: 'C12345' }
const dateRange = { from: new Date('2026-04-14'), to: new Date('2026-04-20') }

describe('fetchSlackActivity', () => {
  beforeEach(() => { vi.stubGlobal('fetch', vi.fn()) })

  it('returns normalized messages from the channel', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        messages: [
          { text: 'Deployed v2.1 to staging', ts: '1713427200.000000', username: 'alice' },
          { text: 'Sprint review at 3pm', ts: '1713340800.000000', username: 'bob' },
        ],
      }),
    } as Response)

    const result = await fetchSlackActivity(slackConfig, dateRange)
    expect(result.source).toBe('slack')
    expect(result.error).toBeUndefined()
    expect(result.items[0].title).toBe('Deployed v2.1 to staging')
    expect(result.items[0].author).toBe('alice')
  })

  it('returns error when Slack API returns ok:false', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: false, error: 'invalid_auth' }),
    } as Response)
    const result = await fetchSlackActivity(slackConfig, dateRange)
    expect(result.error).toContain('invalid_auth')
    expect(result.items).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/unit/connectors/slack.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/connectors/slack'`

- [ ] **Step 3: Create `src/lib/connectors/slack.ts`**

```typescript
import type { ActivityItem, ConnectorResult, DateRange } from '../types'

export type SlackConfig = { token: string; channelId: string }

export async function fetchSlackActivity(config: SlackConfig, dateRange: DateRange): Promise<ConnectorResult> {
  const { token, channelId } = config
  const oldest = Math.floor(dateRange.from.getTime() / 1000).toString()
  const latest = Math.floor(dateRange.to.getTime() / 1000).toString()

  try {
    const res = await fetch(
      `https://slack.com/api/conversations.history?channel=${channelId}&oldest=${oldest}&latest=${latest}&limit=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const data = await res.json()
    if (!data.ok) throw new Error(data.error ?? 'Slack API error')

    const items: ActivityItem[] = data.messages
      .filter((m: any) => m.text && !m.subtype)
      .map((m: any) => ({
        source: 'slack' as const,
        type: 'message',
        title: m.text.slice(0, 120),
        description: m.text,
        date: new Date(parseFloat(m.ts) * 1000),
        author: m.username ?? m.user,
      }))

    return { source: 'slack', items }
  } catch (error) {
    return { source: 'slack', items: [], error: String(error) }
  }
}
```

- [ ] **Step 4: Add Slack to `src/lib/aggregator.ts`**

Add import and config at the top:
```typescript
import { fetchSlackActivity } from './connectors/slack'
```

Add `slack` to `AggregatorConfig`:
```typescript
export type AggregatorConfig = {
  github?: { token: string; owner: string; repo: string }
  jira?: { baseUrl: string; email: string; apiToken: string; projectKey: string }
  slack?: { token: string; channelId: string }
}
```

Add to `aggregate` function, after the `jira` push:
```typescript
if (config.slack) tasks.push(fetchSlackActivity(config.slack, dateRange))
```

- [ ] **Step 5: Run tests**

```bash
npm test
```

Expected: All tests passing including new Slack tests

- [ ] **Step 6: Commit**

```bash
git add src/lib/connectors/slack.ts tests/unit/connectors/slack.test.ts src/lib/aggregator.ts
git commit -m "feat: add Slack connector and wire into aggregator"
```

---

### Task 17: Meeting Connector

**Files:**
- Create: `src/lib/connectors/meeting.ts`
- Modify: `src/app/api/generate/route.ts`

- [ ] **Step 1: Create `src/lib/connectors/meeting.ts`**

```typescript
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
```

- [ ] **Step 2: Update `src/app/api/generate/route.ts`** to pass transcript into prompt builder

In `route.ts`, find the `buildPrompt` call and update to:
```typescript
const draft = await generateWithGitHubModels({
  prompt: buildPrompt(artifactType, bundle, tone, { question, transcript: body.transcript }),
})
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/connectors/meeting.ts src/app/api/generate/route.ts
git commit -m "feat: add meeting transcript connector and wire transcript into generate route"
```

---

## PHASE 3: Status Reply + Handover Doc

> The prompt templates for `status-reply` and `handover-doc` are already implemented in `src/lib/prompt-engine.ts` (Task 10). Phase 3 adds the Settings page so users can configure clients with integrations.

---

### Task 18: Client Settings Page

**Files:**
- Create: `src/app/settings/page.tsx`

- [ ] **Step 1: Create `src/app/settings/page.tsx`**

```tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Integration = { source: string; config: Record<string, string> }
type FormState = {
  name: string; tone: string; language: string; format: string
  githubOwner: string; githubRepo: string
  jiraBaseUrl: string; jiraEmail: string; jiraToken: string; jiraProjectKey: string
  slackToken: string; slackChannelId: string
}

const DEFAULT: FormState = {
  name: '', tone: 'formal', language: 'en', format: 'email-prose',
  githubOwner: '', githubRepo: '', jiraBaseUrl: '', jiraEmail: '',
  jiraToken: '', jiraProjectKey: '', slackToken: '', slackChannelId: '',
}

export default function SettingsPage() {
  const [form, setForm] = useState<FormState>(DEFAULT)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  function set(key: keyof FormState, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function save() {
    setSaving(true)
    const integrations: Integration[] = []
    if (form.githubOwner && form.githubRepo)
      integrations.push({ source: 'github', config: { owner: form.githubOwner, repo: form.githubRepo } })
      // Note: GitHub token is injected server-side from GITHUB_TOKEN env var, not stored in DB
    if (form.jiraBaseUrl && form.jiraEmail && form.jiraToken && form.jiraProjectKey)
      integrations.push({ source: 'jira', config: { baseUrl: form.jiraBaseUrl, email: form.jiraEmail, apiToken: form.jiraToken, projectKey: form.jiraProjectKey } })
    if (form.slackToken && form.slackChannelId)
      integrations.push({ source: 'slack', config: { token: form.slackToken, channelId: form.slackChannelId } })

    await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, tone: form.tone, language: form.language, format: form.format, integrations }),
    })
    setSaving(false); setSaved(true)
    setTimeout(() => { setSaved(false); router.push('/dashboard') }, 1200)
  }

  const field = (label: string, key: keyof FormState, placeholder?: string) => (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '4px' }}>{label}</label>
      <input style={{ width: '100%', padding: '7px 10px', border: '1px solid #dde3f0', borderRadius: '6px', fontSize: '13px' }}
        value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder ?? label} />
    </div>
  )

  return (
    <div style={{ maxWidth: '540px', margin: '40px auto', padding: '0 24px' }}>
      <h2 style={{ marginBottom: '24px' }}>Add Client</h2>

      {field('Client name', 'name', 'e.g. Acme Corp')}

      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '4px' }}>Tone</label>
          <select style={{ width: '100%', padding: '7px 10px', border: '1px solid #dde3f0', borderRadius: '6px', fontSize: '13px' }}
            value={form.tone} onChange={e => set('tone', e.target.value)}>
            <option value="formal">Formal</option>
            <option value="friendly">Friendly</option>
            <option value="technical">Technical</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '4px' }}>Format</label>
          <select style={{ width: '100%', padding: '7px 10px', border: '1px solid #dde3f0', borderRadius: '6px', fontSize: '13px' }}
            value={form.format} onChange={e => set('format', e.target.value)}>
            <option value="email-prose">Email prose</option>
            <option value="bullet-points">Bullet points</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          {field('Language', 'language', 'en')}
        </div>
      </div>

      <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#555', margin: '20px 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>GitHub</h3>
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>{field('Owner / Org', 'githubOwner', 'myorg')}</div>
        <div style={{ flex: 1 }}>{field('Repo', 'githubRepo', 'my-project')}</div>
      </div>

      <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#555', margin: '8px 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Jira</h3>
      {field('Base URL', 'jiraBaseUrl', 'https://myorg.atlassian.net')}
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>{field('Email', 'jiraEmail', 'dev@myorg.com')}</div>
        <div style={{ flex: 1 }}>{field('API Token', 'jiraToken', '••••••••')}</div>
        <div style={{ flex: 1 }}>{field('Project Key', 'jiraProjectKey', 'PROJ')}</div>
      </div>

      <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#555', margin: '8px 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Slack</h3>
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>{field('Bot Token', 'slackToken', 'xoxb-…')}</div>
        <div style={{ flex: 1 }}>{field('Channel ID', 'slackChannelId', 'C1234567890')}</div>
      </div>

      <button
        onClick={save} disabled={saving || !form.name.trim()}
        style={{ marginTop: '20px', padding: '10px 24px', background: saving ? '#9ba5fc' : '#3b4ef8', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}
      >
        {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Client'}
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/settings/page.tsx
git commit -m "feat: add client settings page with GitHub, Jira, and Slack integration forms"
```

---

## PHASE 4: Artifact History & Refinements

---

### Task 19: Wire Artifact History into Sidebar

> The Sidebar already fetches history and renders it (Task 13). This task adds a link to view a past artifact in the main panel.

**Files:**
- Modify: `src/components/sidebar/Sidebar.tsx`
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Update Sidebar to emit selected history artifact**

Add `onHistorySelect` prop to `Sidebar`:

```tsx
// Add to Props type:
onHistorySelect: (artifactId: string) => void

// Add to history item onClick:
<div key={a.id} className="sidebar-history-item" onClick={() => onHistorySelect(a.id)} style={{ cursor: 'pointer' }}>
```

- [ ] **Step 2: Update `src/app/dashboard/page.tsx`** to fetch and display selected artifact

```tsx
const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null)
const [historicDraft, setHistoricDraft] = useState<string | null>(null)

useEffect(() => {
  if (!selectedArtifactId) { setHistoricDraft(null); return }
  fetch(`/api/artifacts?clientId=${clientId}`)
    .then(r => r.json())
    .then((arts: any[]) => {
      const found = arts.find(a => a.id === selectedArtifactId)
      if (found) setHistoricDraft(found.content)
    })
}, [selectedArtifactId])
```

Pass `onHistorySelect={id => { setSelectedArtifactId(id) }}` to Sidebar.

When `historicDraft` is set, render it in a read-only box above the ArtifactPanel:
```tsx
{historicDraft && (
  <div style={{ marginBottom: '24px' }}>
    <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
      <span>Past artifact</span>
      <button onClick={() => { setSelectedArtifactId(null); setHistoricDraft(null) }} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '12px' }}>✕ Close</button>
    </div>
    <div style={{ background: '#f7f8fc', border: '1px solid #dde3f0', borderRadius: '8px', padding: '16px', fontSize: '14px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
      {historicDraft}
    </div>
  </div>
)}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/sidebar/Sidebar.tsx src/app/dashboard/page.tsx
git commit -m "feat: wire artifact history click-through to display past drafts in main panel"
```

---

### Task 20: Run All Tests & Coverage Check

- [ ] **Step 1: Run unit tests with coverage**

```bash
npm run test:coverage
```

Expected output:
```
 PASS  tests/unit/github-models.test.ts
 PASS  tests/unit/connectors/github.test.ts
 PASS  tests/unit/connectors/jira.test.ts
 PASS  tests/unit/connectors/slack.test.ts
 PASS  tests/unit/aggregator.test.ts
 PASS  tests/unit/prompt-engine.test.ts

Coverage: lines > 80%
```

- [ ] **Step 2: Run E2E tests**

```bash
npx playwright test
```

Expected: 2 E2E tests passing

- [ ] **Step 3: Start dev server and do manual smoke test**

```bash
npm run dev
```

Navigate to `http://localhost:3000`:
- Redirects to `/login` ✓
- Login button visible ✓

After auth (requires real GitHub OAuth app configured in `.env.local`):
- `/dashboard` shows sidebar with client selector ✓
- Selecting a client shows ArtifactPanel ✓
- Generate button calls `/api/generate` ✓

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final polish and test confirmation for all phases"
```

---

---

## Wiki Update Protocol (applies to every task)

After completing every task's code steps, the subagent writes wiki pages before committing. Pattern:

**Step W1: Write changelog entry**

```bash
# Create wiki/changelog/YYYY-MM-DD-task-N-<slug>.md
```

Contents (fill in for the actual task):
```markdown
# Task N: <Task Title>

**Date:** YYYY-MM-DD
**Files changed:** list exact paths

## What was added
- bullet list

## What changed
- bullet list

## Why (purpose)
- reason this exists in the system

## Patterns introduced
- link to patterns/ page if applicable

## Open questions / known limitations
- anything the next agent should know
```

**Step W2: Write or update component page(s)**

For each new file created in `src/lib/` or `src/app/api/`, write `wiki/components/<name>.md` following the template in `wiki/SCHEMA.md`.

**Step W3: Commit wiki alongside code**

```bash
git add wiki/
git commit -m "docs(wiki): Task N — <title>"
```

---

## Environment Variables Reference

Copy `.env.example` to `.env.local` and fill in:

| Variable | Where to get it |
|----------|----------------|
| `DATABASE_URL` | Local PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` |
| `GITHUB_CLIENT_ID` | GitHub → Settings → Developer settings → OAuth Apps |
| `GITHUB_CLIENT_SECRET` | Same OAuth App |
| `GITHUB_TOKEN` | GitHub → Settings → Developer settings → Personal access tokens (scopes: `repo`, `read:user`) — this is also the token used for GitHub Models API |

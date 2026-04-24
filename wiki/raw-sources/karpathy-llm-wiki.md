# Raw Source: Karpathy LLM Wiki Pattern

**Source:** https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
**Ingested:** 2026-04-24
**Status:** immutable — do not edit

---

## Core Concept

Andrej Karpathy's pattern proposes that LLMs incrementally build and maintain a structured wiki — a markdown-based knowledge layer between raw sources and the user. Rather than re-discovering information from scratch on each query, the system compiles knowledge once and keeps it current.

## Architecture

The pattern operates across three layers:

**Raw sources** — Immutable documents (articles, PDFs, etc.) that serve as the source of truth.

**The wiki** — LLM-maintained markdown files containing summaries, entity pages, and cross-references. The LLM owns this layer entirely.

**The schema** — A configuration document defining wiki structure, conventions, and workflows (e.g., `CLAUDE.md` for Claude Code, `SCHEMA.md` in this project).

## Key Operations

**Ingest** — New sources are processed; the LLM reads them, discusses takeaways, writes summaries, and updates relevant wiki pages.

**Query** — Users ask questions; the LLM searches relevant pages and synthesizes answers with citations.

**Lint** — Periodic health checks identify contradictions, orphaned pages, and knowledge gaps.

## Application to CommHub

This wiki applies the Karpathy pattern to a software project (AI Communication Hub):

- **Raw sources** = this gist + project spec + Karpathy's original content
- **Wiki** = `wiki/` directory — all architecture, component, pattern, and changelog pages
- **Schema** = `wiki/SCHEMA.md` — defines what subagents must log after each task
- **Ingest** = every subagent task ends by writing wiki pages (changelog + component updates)
- **Query** = future agents read the wiki before working to understand context
- **Lint** = periodic passes to check for contradictions between wiki and actual code

## Key Insights from the Pattern

1. **LLMs don't get bored** — the tedious bookkeeping of updating cross-references, summaries, and changelogs is exactly what LLMs are good at. Automate it.

2. **Wiki drift is the main risk** — if the wiki diverges from the code, it becomes harmful rather than helpful. Mitigate by: (a) always trusting code over wiki, (b) updating component pages whenever the file changes.

3. **Schema is the forcing function** — without a schema, wiki quality degrades over time. The schema defines the format so every agent produces consistent pages.

4. **Provenance matters** — every wiki page should reference where the information came from (which task created it, which file it describes). This makes drift detectable.

## Critical Considerations

- Hallucination accumulation: LLM-generated summaries can drift from reality. Mitigation: component pages reference exact file paths; agents must re-read the file before updating the page.
- Zettelkasten alternative: immutable atomic notes with stable IDs are more durable than mutable pages, but harder to maintain programmatically.
- Hybrid approach: humans define structure (schema), LLMs enrich connections and write summaries.

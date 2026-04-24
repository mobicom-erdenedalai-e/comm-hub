# ADR-002: GitHub Models API as AI Engine

**Date:** 2026-04-24
**Status:** accepted

## Context
The team already has GitHub Copilot Enterprise. Needed an AI API that works within that existing subscription rather than adding a new vendor (OpenAI, Anthropic).

## Decision
Use GitHub Models API (`models.inference.ai.azure.com`) with GPT-4o. The API is OpenAI-compatible and authenticated via a standard GitHub personal access token (`GITHUB_TOKEN`).

## Consequences
- No additional billing — uses Copilot Enterprise entitlement
- The same token used for GitHub repo access also authenticates AI calls
- OpenAI-compatible format means switching models later is a one-line change
- Trade-off: GitHub Models API is newer and has lower rate limits than OpenAI direct; mitigated by retry logic in [[components/github-models-client]]

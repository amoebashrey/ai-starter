# Probe — Intelligent Interview Companion

> What do you actually understand?

Probe is an intelligent learning companion that helps career-switchers stress-test their understanding the night before a high-stakes interview. Built for **PromptWars 2026 (MIT WPU Pune)**.

**Live URL:** https://mayas-mirror-802596387039.asia-south1.run.app

---

## The Problem

The hackathon brief: *Create an intelligent assistant that helps users learn new concepts effectively. The system should personalize content and adapt to user pace and understanding.*

Most learning tools tell you what to know. **Probe finds out what you don't** — through targeted questioning that adapts in real-time to the user's responses.

## How It Adapts

1. User picks a concept (LLM Evals, RAG, Agentic Systems, etc.)
2. Types what they think they understand
3. AI asks ONE sharp question that exposes the gap
4. Status flips: **Cracked → Shaky → Solid**
5. End-of-session "Cheat Sheet" shows exactly what they know vs. need to review

The personalization is **conversational, not curricular** — every probe is generated from the user's exact response, their session history, and current status. No two sessions are alike.

---

## Google Cloud Services Used

| Service | Role |
|---|---|
| **Vertex AI** (Gemini 2.5 Flash) | Core probing dialogue engine. Chosen for low latency + structured JSON output that drives state transitions. |
| **Cloud Run** (asia-south1) | Serverless deployment. Auto-scales to zero. |
| **Cloud Build** | Containerized CI/CD. Multi-stage Docker build with build-arg secret injection. |
| **Artifact Registry** | Versioned container image storage in `asia-south1`. |
| **Firebase Firestore** | Session persistence with graceful fail-soft (offline-resilient). |

## Architecture
User → Cloud Run (nginx)
↓
React SPA (Vite)
↓
Vertex AI (Gemini 2.5 Flash)
↓ JSON-validated response
Zustand store
↓ persistProgress
Firestore (fail-soft)

## Prompt Architecture

Single tightly-bound system prompt enforces a contract:
- ONE question per turn
- Never lecture
- Output as validated JSON with status transitions
- Three valid statuses only: `cracked | shaky | solid`

Validated client-side via `parseSocraticResponse` — defends against malformed model output corrupting state.

## Security

- Vertex API key restricted to single API
- Input sanitization (`security.ts`): max length, strip control chars, type guards
- HTTPS via Cloud Run
- No PII collection, no auth surface, no SQL surface
- Status enum validated at runtime — can't be poisoned by model

## Tech Stack

- **Frontend:** Vite + React 18 + TypeScript + Zustand
- **Tests:** Vitest + Testing Library (20+ tests)
- **Hosting:** Cloud Run + Cloud Build
- **AI:** Vertex AI (Gemini 2.5 Flash)
- **Persistence:** Firestore

## Run Locally

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # run test suite
npm run build    # production build
```

Demo mode: append `?demo=1` to the URL for a deterministic 3-turn arc (no network required).

---

Built solo · April 25, 2026

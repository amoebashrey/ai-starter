---
trigger: always_on
---

## Project context
Solo build. React + Supabase web app on Antigravity.

## Stack (locked)
- Vite + React + TypeScript + Tailwind CSS
- Zustand for state
- Supabase (Postgres, Auth, Realtime, Storage) — keys in .env.local
- Google AI Studio (Gemini) wrapped in src/lib/ai.ts
- Deployed on Vercel, auto-deploys from main

## Design system
- All colors from CSS variables in src/styles/tokens.css. Never hardcode.
- Typography: Instrument Serif (display), Inter (body), JetBrains Mono (technical chrome). Loaded in index.html.
- Aesthetic: premium minimalism. Generous whitespace, subtle shadows, accent used sparingly. No gradients, no glassmorphism.

## Non-negotiables
- Seed data, not live data unless required.
- One happy path end-to-end before any second path.
- Demo mode (?demo=1) must produce a guaranteed working scenario.
- Every phase ends with: diff summary + screenshot (if UI) + assumptions list.
- If unsure, ASK. Do not guess.

## Code conventions
- Functional React components, named exports from src/features/.
- Zustand stores colocated with their feature.
- Single Supabase client from src/lib/supabase.ts. Single AI client from src/lib/ai.ts.
- RLS: permissive for build, every table gets `-- TODO: harden RLS before prod`.
- No premature abstraction. Files under 200 lines where possible.
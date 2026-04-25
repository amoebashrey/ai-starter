---
trigger: always_on
---

## Project context
Solo build. AI app on Google's stack, built on Antigravity. Judged on 7 axes:
1. Code quality — clean, readable, idiomatic TypeScript and React
2. Security — no exposed secrets, input validation, safe auth patterns
3. Efficiency — minimal re-renders, debounced calls, lean bundle
4. Testing — at least one meaningful test per critical function
5. Accessibility — WCAG AA, semantic HTML, keyboard nav, ARIA where needed
6. Problem alignment — every feature ladders to the stated user problem
7. Google services usage — prefer Google APIs/services where they fit

## Stack (locked, prefer Google)
- Vite + React + TypeScript + Tailwind
- Zustand for state
- Google AI Studio (Gemini) via src/lib/ai.ts (PRIMARY for AI/LLM)
- Firebase (Firestore, Auth) via src/lib/firebase.ts (PRIMARY for DB/auth — prefer over Supabase)
- Supabase available as fallback only if Firebase doesn't fit
- Google Maps / Speech / Vision / Cloud Translate — pull in if scope demands
- Vitest + React Testing Library for unit tests
- Vercel deploy from main

## Design system (premium minimalism)
- All colors/type/spacing from CSS variables in src/styles/tokens.css. NEVER hardcode.
- Typography: Instrument Serif (h1-h4), Inter (body), JetBrains Mono (technical chrome).
- Generous whitespace, subtle shadows, ONE accent per screen, no gradients/glassmorphism.
- Radius: --radius-md for cards, --radius-full for buttons.

## Code quality non-negotiables
- TypeScript strict. No `any`. Use proper types or `unknown` + narrowing.
- Functional React components, named exports, hooks at top.
- Zustand stores colocated with feature in src/features/[name]/.
- No premature abstraction. Inline until repeated 3+ times.
- Files under 200 lines.
- Single client per service (Gemini/Firebase/etc.).

## Security non-negotiables
- NEVER commit .env.local or secrets. Already in .gitignore.
- All env vars exposed to client must be PUBLIC by nature (Firebase config IS designed for client exposure; Gemini API key for hackathon demo only — would proxy in production).
- Validate all user input before sending to Firestore or Gemini. Use Zod or simple guards.
- Firestore Rules: locked-down by default (no public writes without auth). Mark TODO if permissive for demo.
- No eval(), no dangerouslySetInnerHTML unless escaped, no untrusted HTML.

## Efficiency non-negotiables
- React: memo expensive components. useMemo/useCallback only when there's a real problem.
- Debounce user input that hits AI/Firestore (300ms minimum).
- Avoid N+1 patterns when querying Firestore.
- Bundle size: don't import full lodash. Use specific imports.

## Testing non-negotiables
- Vitest set up by Phase A.
- At minimum: one unit test for the core business-logic function (AI prompt builder, Firestore query helper, etc.).
- One component render test for the primary user surface.
- Tests run on git push (later).

## Accessibility non-negotiables
- Semantic HTML: <main>, <nav>, <button>, <label>, <h1-h6> hierarchy.
- All interactive elements keyboard-reachable. Visible focus states (use --color-accent ring).
- Form inputs have associated <label> elements.
- Images have alt text or alt="" if decorative.
- Color contrast: tokens above are AA-compliant. Don't override.
- Screen reader: aria-label on icon-only buttons. aria-live for async UI updates.
- Test: tab through the whole flow keyboard-only before pitch.

## Build discipline
- Seed data, not live external APIs unless scope demands.
- One happy path end-to-end before second path.
- Demo mode (?demo=1) produces guaranteed working scenario without network.
- Every phase ends with: diff summary + screenshot if UI + assumptions list + accessibility check.
- If unsure, ASK. Do not guess.

## How agents communicate with me
- Confirm understanding in 1-2 sentences before acting.
- Concise bullets. No corporate preamble.
- Show minimal diffs, not full files.
- Highlight risks before they materialize.
- Push back on scope creep, security holes, accessibility gaps.
- Do not be a people pleaser.
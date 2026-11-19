# Feature: mediterranean-redesign

Objective: redesign the landing into the "Cal y cobalto" direction: minimalist, subtle, elegant, professional. Its art direction is Japanese print and editorial craft (washi, seigaiha, one sun, the hanko, the emakimono, a mincho voice), and it preserves all behavior. Copy changes are limited to the user-approved addendum.

Problem: the original page was a generic cream/earth template. Its problems:
- the same grayscale photo was used 3 times;
- stock undraw art;
- a services carousel hid most services;
- the hero name was clipped on mobile;
- the form had placeholder-only labels.

History:
- Attempt 1, "Un día en la pared": rejected by the client as neo-brutalist.
- Attempt 2, a minimal restyle of attempt 1: stopped. The user called the study and its graphics "cutres" and asked to redo it.
- Attempt 3: a new study, "Cal y cobalto", cross-checked against the design plugins. The user approved the changes ("cambia lo que haga falta, tenés aprobación").

Spec: `C:/Users/Nitropc/AppData/Local/Temp/claude/4986492def0e3bf1/fa29e168-b634-48dd-a4f5-a5da23439eba/scratchpad/design-study.md` (study plus approved addendum). Direction contract: `.impeccable/surfaces/app-page-tsx.md`. Product truth: `PRODUCT.md`.

Branch: feat/mediterranean-redesign.

Model: every subagent runs on Opus 5.5 (user instruction).

TDD: the global mode is "Strict TDD", but the project has no test runner, so verification uses functional checks: tsc, next build, eslint, and Playwright screenshots at 1440 and 390.

Delivery strategy: ask-on-risk. The forecast is over 400 authored lines.

Commits: deferred. The branch carries the user's pre-existing uncommitted WIP (Hero, Intro, Servicios…). How to commit is the user's decision.

## Tasks
- [x] T0 Critique, PRODUCT.md, and direction rounds. Route: inline plus Opus study/review agents.
- [ ] T1 Build "Cal y cobalto": tokens, fonts, all sections, removals, AGENTS.md, and direction contract. Route: delegated Opus writer (2+ non-trivial files).
- [ ] T2 Verify: parent spot check (tsc/build), screenshots, impeccable detector, finish reviewer (Opus).
- [ ] T3 DESIGN.md via the documenter (Opus).

## Acceptance
- All 5 services are visible and selectable, and the preselect into the form works.
- There are no illustrations, no gradients, no blur, and no shadows. The portrait appears once, in color.
- Cobalt is ≤3% of the surface. Orange only appears as the selected-service dot.
- Form labels are visible, the submit state uses aria-disabled, and error copy includes how to recover.
- The hero name is never clipped at 390px, there is no horizontal overflow, and touch targets are ≥44px.
- `pnpm build` passes.

## Progress
- T0 done. T1 is running with the Opus writer.

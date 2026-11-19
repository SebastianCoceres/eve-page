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

## Feedback round: points instead of paragraphs (Mi enfoque, Sobre mí)

Client feedback: users do not read; present the message as short, high-impact points. Mi enfoque: the problem on the left with the sun on the right, then the sun moves left and the answer is summarised on the right. Sobre mí: remove the image and stop showing all the text at once. The muted-to-ink scroll reveal must reach full ink and hold. The client authorised distilling the copy, deriving every point only from Eve's existing words.

- [x] T4 Mi enfoque in two acts + sun crossing + held ink (hero greeting included). Route: delegated writer (Opus). Commit: b4f73ef.
  - Act 1 "El marketing tradicional": Centrado en vender / Estrategias persuasivas / Ventas a cualquier costo. Act 2 "El marketing consciente": Integridad y conexión genuina / Valores éticos / Transparencia y bienestar / Relaciones duraderas.
  - Pin from 1024px (280% of the viewport); phases in `FOCUS_SCENE`, shared by the sun leg: act 1 in ink at 24%, held to 34%; sun crosses east to west at 37–57%; act 2 in ink at 86%, held to the unpin. After the pin the sun leaves west and re-enters the emakimono sky from the east out of view.
- [x] T5 Sobre mí without the portrait: afternoon sun on the seigaiha band (sticky from 1280px) + opening line + five milestones, each turning to ink with a hold. `public/eve-bust.webp` deleted. Route: delegated writer (Opus). Commit: b394ba1.
- [x] T6 Docs: AGENTS.md, DESIGN.md (Point and Held Ink rules, new signatures), PRODUCT.md (no photos, distilled-copy exception), `.impeccable/design.json`. Route: delegated writer (Opus).

Verification (T4–T6):
- `pnpm exec tsc --noEmit`: pass.
- `pnpm build`: pass.
- `pnpm exec eslint .`: the 5 known errors only (Carousel.tsx, stores/*-provider.tsx).
- Playwright sun sweep (40px steps, whole page): 1440 no discontinuities, min text gap 48px; 1024 none, 56px; 390 none, 58px; no horizontal overflow at 390/768/1024/1440.
- Ink check: every Mi enfoque point computes to the ink token at 33% (act 1), 92% and 99.5% (act 2) of the pin; Sobre mí points all ink once read; hero greeting lines back to opacity 1 from 63% of its pin. Reduced motion: stacked, static, all ink, static disc.

Next step: client review of the distilled copy; push/PR remain the user's decision.

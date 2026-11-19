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

## T7 Impeccable deep pass

- [x] T7 Impeccable critique, then polish and audit of `app/page.tsx`. Route: delegated Opus writer. The critique ran as two isolated Opus assessments: A (design review) and B (detector, browser, a11y and lint). There was one fix batch and one confirmation round.

Critique (before): 22/32 (heuristics 7 and 10 n/a), Good. The design is authored, not interchangeable. The CLI detector found 0 issues. The browser detector found 4 low issues: the hero clip (an intentional crop), display line-height, Geist share, and an unlocated height transition. These are false positives or taste. Snapshot: `.impeccable/critique/2026-11-19T15-15-24Z__app-page-tsx.md`.

Findings and outcome:
- P1. Service selection had no visible signifier. Fixed: each panel now has a "Me interesa" / "Servicio elegido" cue in the link style. Commit 57c2f72.
- P1. The Contacto help line promises a phone field that does not exist. Not changed: it is confirmed copy, so it needs the client's decision.
- P2. Servicios is a wall of text. Not changed: distilling it needs approval to extend the distillation exception.
- P2. The send success was only a toast. Fixed: an inline `role="status"` confirmation, plus error copy that names the fix (empty email, limits with their number). Commit 142e20d.
- P2. There are empty valleys in the pinned chapters. Left alone: changing them is choreography, beyond refinement.
- Minor fixes in 2cb5e7f:
  - On mobile, the values row left a separator orphaned at the start of the second line. The values now stack.
  - The footer sea's fills bit into the sun before its strokes were drawn. The sea now draws as soon as it enters.
- Cleanup:
  - Store providers use a lazy `useState` instead of reading a ref during render (6fb13c4).
  - Removed the unused Accordion, Carousel, Dialog, Drawer and HoverCard components, along with their deps and next-themes (6923a77).
  - Removed the unreferenced `fondo.png`, `fondo-hero.webp` and `undraw_*.svg` (6923a77).

Verification:
- `pnpm exec tsc --noEmit`: pass.
- `pnpm build`: pass.
- `pnpm exec eslint .`: 0 problems. This clears the 5 known errors.
- Impeccable detect on the changed sections: `[]`.
- Sun sweep (40px steps, whole page): no discontinuities and no text closer than 48px at any width. Minimum gaps: 48px at 1440, 56px at 1024, 58px at 390.
- No horizontal overflow at any width, and no console errors.
- Form check (mocked `/api/send`):
  - an empty email shows "Escribe tu correo para que pueda responderte.";
  - after sending, the status reads "Mensaje enviado. Te responderé pronto.";
  - the status clears on the next edit.

Next step: the client decides on the phone line and on distilling Servicios.

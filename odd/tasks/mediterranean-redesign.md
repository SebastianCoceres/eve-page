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

## T8 Servicios points, optional phone, whole afternoon sun

Client-approved: distil Servicios while keeping the emakimono's look; add an optional phone field; remove the seigaiha waves under the Sobre mí sun.

- [x] T8.1 Servicios distilled. Route: delegated Opus writer (2+ non-trivial files). Each service keeps its name, order and `key` (the form preselect depends on them) and is said in two or three short points taken only from Eve's copy for that service (`points` in `lib/services.ts`, renamed from `.tsx`). Dropped: "resultados excepcionales", "garantizando", "impulsan el crecimiento y el éxito de tu negocio", "el éxito de tu negocio en el mundo digital", "cautivan a tu audiencia", "orientación experta", "generar un impacto significativo", "experiencia en línea atractiva y envolvente". Panels keep fans, pin, horizon, sun crossing, the "Me interesa" / "Servicio elegido" cue and `aria-pressed`. Pinned panels are now 420–520px from 1280 (34vw) and 460–520px at 1024–1279 (50vw), 400–520px tall (56vh), with the cue at the panel's foot; the pin is ≈1250px at 1440 (was ≈1900) and ≈1620px at 1024 (was ≈2030). Commit c2dcee5.
- [x] T8.2 Optional phone. Route: same writer. "Teléfono (opcional)" between Correo and the service (`type="tel"`, `inputMode="tel"`, `autoComplete="tel"`, 48px, half a row from 768). One schema in `lib/contact.ts` shared by the form and `app/api/send/route.ts`: checked on blur only when filled, digits/spaces/hyphens/parentheses/leading +, 6–20 digits; errors name the fix. The route returns 400 with the issues on invalid bodies, HTML-escapes every email field and adds the phone only when present. The help line about the phone is now true. Commit c9ac331.
- [x] T8.3 Whole afternoon sun. Route: same writer. The band, the paper strip and the unused `band` sea preset are gone. The disc is 198px (174px on phones), flush left under the heading. The parked sun never sinks, it only warms; from 1280 it slides out to the west margin during the last 35% vh of the sticky travel (it keeps its viewport height, so it never rides under the navbar and stays ≥48px from Contacto's section mark), then sinks; at 768–1279 (column not sticky) it arrives at 62% vh, keeps its place on the page and slides out over 22% vh before its top could reach the navbar (an eased variant that drifted down the page came within 23px of the opening line at 1024 and was dropped); on phones it arrives at 62% vh and is gone by 20%. Reduced motion shows the same whole disc. Commit 97c1f3a. Follow-up eee5155: the loose-column exit (above) and, at 768–1023 where the gap above Sobre mí is too tight to cross in view with 48px to spare, the sun leaves its Servicios zone east and switches to the west out of view (the old in-view crossing came within 20px of a "Me interesa" cue at 800).
- [x] T8.4 Docs: AGENTS.md, DESIGN.md, PRODUCT.md (Servicios exception, phone), `.impeccable/design.json`. Commit: see below.

Verification (T8):
- `pnpm exec tsc --noEmit`: pass.
- `pnpm build`: pass.
- `pnpm exec eslint .`: 0 problems.
- Sun sweep (40px steps, whole page): no discontinuities and no text closer than 48px at any width. Minimum gaps: 48px at 1440, 55px at 1280, 51px at 1024, 52px at 800, 53px at 390. No horizontal overflow at 1440/1280/1024/800/390.
- Navbar check, Sobre mí to footer (20px steps): no visible disc under the 64px navbar and the parked disc never cropped at 1440, 1280, 1024, 800 and 390. Contacto section mark gap: 48px at 1440 (900 and 720 tall), ≥223px at 1280.
- Form (mocked `/api/send`, 1440/1024/390): labels in order Nombre, Correo, Teléfono (opcional), Me interesa un servicio, Mensaje; empty phone sends (`"phone":""`); "abc 12" shows "Revisa el número: usa solo dígitos, espacios o el prefijo +." and blocks the send; "12 34" shows the 6–20 digits message; "+34 (600) 123-456" clears the error and is in the payload.
- Route: invalid phone, short phone, empty email and non-JSON bodies all return 400 with the field messages. Validator unit check (node, `lib/contact.ts`): 19/19 pass.
- Reduced motion: stacked panels, whole 198/174px disc visible, no horizontal overflow, no console errors at 1440/1024/390.

Next step: client review of the distilled service points; push/PR remain the user's decision.

## T9 A calm sun

User report: "while I scroll, the sun goes up and down the whole time; I scroll slowly and it is very annoying; make the transition smoother."

- [x] T9.1 Diagnose with data. Route: inline (one hook, the probe in the scratchpad). A Playwright probe scrolled the whole page in 10px steps (40ms settle) and with real 24px wheel steps at 1440, 1024 and 390, and recorded the sun's viewport centre per step (`scratchpad/t9/probe.mjs`, traces `trace-before.json` / `trace-final.json`, summaries `summary-*.txt`). Root cause: the legs between pinned chapters were MotionPath routes in document coordinates, while the pins hold the sun in the viewport. On a document-space leg the sun rode up with the page at 1px per px on every level stretch, then plunged along the margin (up to 2.18px per scroll px) to reach the next pin's viewport target, and inside Mi enfoque it entered low (62% vh) and climbed again, then arced up and down over the crossing. At 1440: 5 vertical reversals, 2108px up and 974px down (308px of vertical travel per 1000px of scroll). No tween conflicts or refresh jumps were involved.
- [x] T9.2 Fix. Route: inline (one hook plus lib/sunPath). Passages between chapters now leave and enter sideways in the frame of each chapter (held by a pin, or riding with the page) and change height only out of view (transparent when they change sides). Mi enfoque: enters at its resting height (42% vh) and holds; the crossing sinks 4% vh (`FOCUS_SINK`) instead of arcing. The sunrise uses a gentler ease (peak 1.29x the mean speed). The timeline now computes the exact place at the real scroll and a ticker draws it with an exponential ease (`SMOOTHING` 0.3s, like a 0.8s scrub, capped at 20% vh of lag) applied only to the sun's own motion, per leg frame, so a pin never drifts from it. `route()` was removed from lib/sunPath. Commit e5a77cc.
- [x] T9.3 Reload. Coordinator report: after F5 the sun did not appear. Caused by T9.2, not pre-existing (the previous build passed the same reload probe): each track leg was a fromTo that rendered its start on creation, so the goal held a late leg's start (out of view by the footer), and `time(0)` on a fresh timeline renders nothing. Track legs no longer render immediately and each build renders the timeline once through every leg. Commit 972d3f1.
- [x] T9.4 Docs: AGENTS.md and DESIGN.md sun rules (calm, frames, passages, smoothing). Commit: see below.

Verification (T9, final tree including T10):
- Probe, 10px steps / wheel, before → after:
  - 1440: 5 / 4 → 2 / 2 reversals (the sunrise and the sunset); 308 / 302 → 125 / 127px of vertical travel per 1000px; max 2.18 → 1.02 / 1.00px per scroll px.
  - 1024: 2 / 2 → 1 / 1 reversals; 246 / 242 → 136 / 146px per 1000px; max 1.23 → 1.23 / 1.04 (the remaining peak is the sunrise).
  - 390: 0 / 0 → 0 / 0 reversals; 205 / 192 → 237 / 253px per 1000px, all of it riding with the page (max 1.00 both): on phones the sun only rests beside the page, and the eased sideways exits keep it in view slightly longer.
- Reload probe (`scratchpad/t10/reload.mjs`: F5 and a hard reload at 0, mid-hero, Mi enfoque, Servicios and Sobre mí; 1440/1024/390): 0 failures; the sun is at its place and visible (or transparent only on a designed side switch) right after load.
- Whole-page sweep (40px steps, settled): no discontinuities, no text closer than 48px (min 48 at 1440, 54 at 1280, 51 at 1024, 52 at 800, 53 at 390), no horizontal overflow at 1440/1280/1024/800/390.
- `pnpm exec tsc --noEmit`: pass. `pnpm exec eslint .`: 0 problems. `pnpm build`: pass.

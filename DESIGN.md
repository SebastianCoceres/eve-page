---
name: Evelyn Bogado
description: One day on warm washi paper, made with the means of Japanese print and editorial craft.
colors:
  paper-morning: "#efe4cd"
  paper-midday: "#efe7d8"
  paper-afternoon: "#eadfca"
  paper-dusk: "#e4d3b9"
  surface: "color-mix(in oklab, var(--paper), #6b5233 6%)"
  field: "color-mix(in oklab, var(--paper), #fffcf5 28%)"
  hairline: "color-mix(in oklab, var(--paper), #16181d 13%)"
  foreground: "#16181d"
  muted-foreground: "#57504a"
  input-border: "#7d7367"
  primary: "#1e4ba8"
  primary-hover: "#173c88"
  primary-foreground: "#f6f1e7"
  sun: "#e2672b"
  sun-warm: "#cc4a1e"
  error: "#b3261e"
  success: "#2e6a4e"
typography:
  display:
    fontFamily: "Zen Old Mincho, Yu Mincho, Hiragino Mincho ProN, serif"
    fontSize: "clamp(2.75rem, 1.6rem + 5.2vw, 5.25rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Zen Old Mincho, Yu Mincho, Hiragino Mincho ProN, serif"
    fontSize: "clamp(2rem, 1.5rem + 2.2vw, 3.25rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  subtitle:
    fontFamily: "Zen Old Mincho, Yu Mincho, Hiragino Mincho ProN, serif"
    fontSize: "clamp(1.5rem, 1.3rem + 0.9vw, 2rem)"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  hero-lead:
    fontFamily: "Zen Old Mincho, Yu Mincho, Hiragino Mincho ProN, serif"
    fontSize: "min(clamp(1.75rem, 1rem + 3.2vw, 3.75rem), max(1.75rem, 6vh))"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "-0.01em"
  point:
    fontFamily: "Zen Old Mincho, Yu Mincho, Hiragino Mincho ProN, serif"
    fontSize: "min(clamp(1.625rem, 0.9rem + 2vw, 2.75rem), max(1.5rem, 4.6vh))"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "-0.015em"
  values:
    fontFamily: "Zen Old Mincho, Yu Mincho, Hiragino Mincho ProN, serif"
    fontSize: "min(clamp(1.75rem, 1rem + 2.4vw, 3.5rem), max(1.75rem, 5vh))"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  statement:
    fontFamily: "Zen Old Mincho, Yu Mincho, Hiragino Mincho ProN, serif"
    fontSize: "min(clamp(1.5rem, 1rem + 2vw, 2.625rem), max(1.5rem, 4.8vh))"
    fontWeight: 400
    lineHeight: 1.24
    letterSpacing: "-0.01em"
  lead:
    fontFamily: "Zen Old Mincho, Yu Mincho, Hiragino Mincho ProN, serif"
    fontSize: "clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)"
    fontWeight: 400
    lineHeight: 1.45
  item:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "-0.005em"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  field: "6px"
  pill: "9999px"
  none: "0px"
spacing:
  gutter-sm: "24px"
  gutter-md: "40px"
  container: "1200px"
  section-sm: "96px"
  section-md: "128px"
  section-xl: "160px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 28px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.primary-foreground}"
  button-primary-compact:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "44px"
  link:
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    height: "44px"
  nav-link:
    textColor: "{colors.muted-foreground}"
    typography: "{typography.label}"
    padding: "0 12px"
    height: "44px"
  nav-link-active:
    textColor: "{colors.foreground}"
  input:
    backgroundColor: "{colors.field}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    padding: "0 16px"
    height: "48px"
  hanko-seal:
    backgroundColor: "{colors.sun-warm}"
    textColor: "{colors.paper-dusk}"
    rounded: "{rounded.none}"
    size: "42px"
---

# Design System: Evelyn Bogado

## Overview

**Creative North Star: "Washi y cobalto"**

The page is one day on warm washi paper, made with the means of Japanese print and editorial craft. The ground turns from a kinari dawn to an autumn dusk as the reader scrolls, one cobalt ink marks every decision and draws the seigaiha, and one orange sun (a hinomaru disc) crosses the whole page under a single owner. Services unroll as an emakimono, the afternoon sun rests whole beside Eve's milestones in Sobre mí, and an EB hanko stamps the end of the day.

The system is minimal, flat and editorial: type is the protagonist, color is rare, there are no photographs, and hierarchy comes from size and weight only. Copy is said in short points, not paragraphs: a large mincho line with at most one short Geist note. Structure is 1px hairlines; there are no boxes, cards, shadows, gradients, blur or texture. Curves belong to two things only: the sun (circles) and the seigaiha (concentric semicircles), generated in code, never drawn as illustration. It refuses the cream personal-brand template and it refuses Japanese kitsch (no invented kanji, torii or sakura).

Motion is one grammar: content enters once (expo.out / power3.out, 0.6 to 1.1s), micro-interactions take 150ms, and scroll-driven motion is reserved for chapters (the hero "Amanecer" pin, the Mi enfoque pin, the emakimono, the Sobre mí milestones, and the sun with the paper's day). Under reduced motion everything is static and visible. Implementation conventions (GSAP ownership, hooks, anchors) live in AGENTS.md.

**Key Characteristics:**
- A live paper ground (`--paper`) tweened through four flat stops by one scrubbed timeline; static midday under reduced motion.
- One cobalt for actions, links, hairline accents, the seigaiha and the focus ring.
- One orange sun, warming to persimmon, with one timeline owner across the page.
- Zen Old Mincho for the voice, Geist for body and UI; never uppercase outside the logotype.
- Flat: 1px hairlines are the only structure.
- Seigaiha generated in code: seas, section marks, fans, value separators.

## Colors

A warm paper that changes with the day, an ink, one cobalt and one sun; nothing else carries color.

### Primary
- **Indigo Cobalt** (primary): primary pills, text links (also `--link`), the focus ring (also `--focus-ring`), the selection highlight, the caret, the hero hairline, the emakimono horizon and panel rules (at 45%), and every seigaiha stroke (at 70% on marks and fans, flat per-row opacities in the seas). AA on the darkest paper (5.5:1).
- **Deep Cobalt** (primary-hover): pressed and hovered pill fill only.
- **Paper White** (primary-foreground): text on cobalt; a warm off-white, never #fff.

### Secondary
- **Hinomaru Orange** (sun, also `--accent`): the sun disc, the 6px dot on the selected service. Never text, never a fill behind text.
- **Kaki Persimmon** (sun-warm): the sun as the day turns (the live sun is `--sun-now` mixed toward persimmon by `--sun-late`), the sunset disc in the footer, and the hanko seal.

### Neutral
- **Kinari Dawn / Midday / Autumn Afternoon / Dusk** (paper-morning, paper-midday, paper-afternoon, paper-dusk): the four flat stops of the live `--paper`, which is the page background and every sea fill.
- **Paper Shade** (surface): a fixed 6% step of the paper toward umber; scrollbar track.
- **Paper Light** (field): a fixed 28% step of the paper toward light; form fields and toasts.
- **Paper Hairline** (hairline): a fixed 13% step of the paper toward ink; every border by default.
- **Sumi Ink** (foreground): headings, body text, emphasis.
- **Warm Ash** (muted-foreground): secondary text, notes, act labels, and the starting tone of every point revealed to ink; 5.4:1 on dusk.
- **Field Stone** (input-border): form field borders and inactive progress ticks; 3.2:1 on dusk.
- **Error Red** (error) and **Moss** (success): form validation and toasts only.

### Named Rules
**The Paper Step Rule.** Every surface is the live paper or a fixed color-mix step of it. A surface that does not follow the paper's day is a stray rectangle.

**The No White Rule.** No pure or near-pure white anywhere; the lightest value is the paper-mixed field and the paper-white text on cobalt.

**The One Sun Rule.** Orange is the sun and its echoes (the selected-service dot and the hanko). There is one traveling sun on the page, owned by one timeline; anchors only mark where it rests. A scale is never an orange disc, and a gull is never orange.

## Typography

**Display Font:** Zen Old Mincho (with Yu Mincho, Hiragino Mincho ProN, serif)
**Body Font:** Geist (with ui-sans-serif, system-ui, sans-serif)

**Character:** A Japanese old-style mincho with full Latin carries Eve's voice (headings, leads, the greeting, the values, points and statements); Geist carries reading and interface. The mincho has no italic, so emphasis is tonal.

### Hierarchy
- **Display** (600, fluid to 5.25rem, 1.1): page-level h1 style; the hero h1 is the brand logotype SVG, sized by its cap height.
- **Title** (600, fluid to 3.25rem, 1.1): section headings, revealed line by line out of a mask.
- **Subtitle** (400, fluid to 2rem, 1.2): h3 default.
- **Hero lead** (400, height-bounded, 1.12): the greeting, spoken line by line in the pin.
- **Point / Values / Statement** (400, height-bounded): the Mi enfoque points and the Sobre mí milestones (point, fluid to 2.75rem, 1.12), the values row (stacked, without separators, below 768px), and the Sobre mí opening line and close (statement). Height-bounded with `min(clamp(), max(_, vh))` so pinned scenes always fit.
- **Lead** (400, fluid to 1.5rem, 1.45): section leads.
- **Note** (Geist 400, 16px, 18px from 768px): the one short line under a point, in Warm Ash, at most 40 to 44ch.
- **Item** (Geist 500, 1.25rem, 1.35): list headings; service titles override it with the mincho at 400.
- **Body** (Geist 400, 16px, 1.6): paragraphs, 60 to 62ch.
- **Label** (Geist 500, 15px): buttons, nav, form labels (14px).

### Named Rules
**The Tonal Emphasis Rule.** Emphasis is tonal: Geist 500 in full ink inside a muted paragraph, or a point that turns from muted to full ink as it is read. Never italic, never synthetic oblique.

**The Held Ink Rule.** Anything revealed from muted to ink reaches full ink with room to spare and holds there (in a pinned scene, an explicit pause before the next act or the unpin). Nothing is read half dark.

**The Point Rule.** Say it in points: two to six words in the mincho, at most one short Geist note under it, revealed one at a time. Distill only from the confirmed copy; never add claims.

**The Lowercase Voice Rule.** Never uppercase outside the logotype (EVELYN / BOGADO and its subline). No eyebrows, kickers or section numerals above headings (Mi enfoque's act labels are h3 subtitles in Warm Ash under the heading, not above it).

## Layout

One content column: 1200px max, 24px gutter below 768px and 40px from 768px. Only two breakpoints exist, md (768px) and xl (1280px); the emakimono pins from 1024px by media query in script. Sections share one vertical rhythm of 96 / 128 / 160px. There is no navbar: the one persistent action is a floating Contáctame pill in the bottom-right corner of the content column. Grids are 12 columns with 24px gaps; Sobre mí and Contacto split 5 / 6 with a column gap at xl. The hero stage is one viewport (min 560px). Text never runs over the seas; the sun rests only in computed free zones at least 48px from text, and between them waits at a side edge (see The Sun).

**The Two Breakpoints Rule.** Design for below 768px, from 768px and from 1280px. Do not introduce sm, lg or 2xl.

## Elevation & Depth

Completely flat. There are no box-shadows (the `--shadow-*` namespace is reset), no gradients, no blur. Depth is made the way a print makes it: occlusion. Seigaiha rows are drawn back to front with opaque paper fills so nearer rows hide farther ones exactly, the sea hides the sun, and per-row stroke opacities (flat values, light far to dark near) give recession.

**The Occlusion Rule.** Depth is something in front of something else on the same paper, never a shadow or a glow.

## Shapes

Square by default. Primary actions are full pills; form fields have a 6px radius; everything else, including toasts and the hanko, is square. Circles are the sun. All other curves are seigaiha: concentric semicircles (four rings, innermost first) sharing one base line, at any scale from a 24px chapter mark to a full-bleed sea. Lines are 1px, with non-scaling strokes.

**The Two Curves Rule.** A circle means the sun; an arc means the sea. No other rounded or organic form enters the page. The one exception is the kamome (gull) the scales turn into while they fly with the sun: a woodblock-print glyph, one shallow gull-wing "M" in the cobalt line with a small flat wedge for a body, never a drawn illustration. (The momiji of Sobre mí, the earlier exception, is gone.)

## Components

### Buttons
Quiet and confident: one cobalt pill per decision.
- **Shape:** full pill.
- **Primary:** cobalt fill, paper-white Geist 500 at 15px, 48px tall with 28px side padding; compact variant 44px with 24px.
- **Hover / Focus:** fill deepens to Deep Cobalt over 150ms; 2px cobalt outline at 2px offset, following the pill.
- **Busy:** signalled with `aria-disabled` and a spinner, never the disabled attribute.
- **Link variant:** the one link rule (below), 44px hit area.

### Links
- **Style:** cobalt, 1px underline at 4px offset, the underline at 40% that turns solid on hover in 150ms. Every text link uses it.

### Inputs / Fields
- **Style:** 48px tall, paper-light fill, 1px Field Stone border, 6px radius, 16px side padding; labels above in Geist 500 at 14px.
- **Focus:** border turns cobalt and the 2px cobalt ring appears at 2px offset. Hover darkens the border to Warm Ash.
- **Error / Disabled:** error-red border with a message below that names the fix (an empty email asks for it; limits name their number); disabled at 60% opacity.
- **Optional phone:** "Teléfono (opcional)" sits between Correo and the service, half a row wide from 768px, a `tel` field (tel keyboard and autofill). It is checked on blur only when filled, with a lenient international pattern (digits, spaces, hyphens, parentheses, a leading +; 6 to 20 digits), and its errors say how to fix it.
- **Sent:** the confirmation stays under the send pill as a mincho lead ("Mensaje enviado. Te responderé pronto.", a polite status) until a new message is started; no success toast.

### Navigation
No menu: the page is one day read top to bottom. A skip link ("Saltar al contenido") is the first stop.
- **Floating Contáctame:** the primary pill (cobalt, 48px, no shadow), fixed in the bottom-right corner inside the content column's gutter, above the safe area on phones. That corner is the one the sun never crosses (it rests top right in the hero and sets bottom left). It appears only once the hero's own Contáctame has left the viewport, and hides when that button returns and while Contacto or the footer is in view. It enters with a short rise, fade and scale from its corner (0.45s expo.out) and leaves in 0.2s; under reduced motion it simply appears. Hidden, it is inert. It scrolls to Contacto and moves focus there.

### Seigaiha (signature)
Generated in code (`lib/seigaiha`), never as an image. Seas: whole scales in three depth tiers with a swell line, flat per-row opacities and the nearest rows dissolving into the paper. The hero and footer seas are alive: each row bobs 1 to 2px (more at the front) out of phase with its neighbours and every other row drifts a pixel or two sideways, slowly, only while the sea is in view; under reduced motion they are still. Marks: a single 48px scale at the column edge between chapters, drawn from the centre outward once on enter. Fans: a single scale used as the emakimono's resting fans, the values' separators and Sobre mí's milestones.

### The Sun (signature)
One orange disc with one timeline owner. It never leaves the screen. It rises from the hero sea (which dissolves under it), stands right of the problem in Mi enfoque and crosses the sky to stand left of the answer (pinned from 1024px), drifts in the west of the emakimono's sky, parks whole as the afternoon disc in Sobre mí (sticky from 1280px; it only warms there, never sinks or gets cropped, and slides out to the west margin before the column lets go), and sets into the footer sea in persimmon. Its motion is calm: it rises once (the hero sunrise) and from then on never bobs. Inside a chapter it moves in one slow direction or holds (it stands still beside the problem, sinks a little while it crosses Mi enfoque's sky, crosses the emakimono level), and between chapters it moves sideways to its side edge in the frame of the chapter (held in the viewport by a pin, or riding with the page beside text that scrolls) and waits there as a crescent (40% of the disc in view, 20% on phones, where it is also smaller), changing height slowly while the page scrolls past, then comes in sideways. To change sides between chapters it climbs to the top edge, crosses along it and comes down the other edge, in view: the old rule that it is never seen going west to east is retired. Waiting at the edge is the one place it may come closer than 48px to text: where text runs to the edge (the full-bleed emakimono panels as they leave, and the 24px gutter on phones) its crescent passes behind it. It is drawn in one coordinate frame, the viewport: a fixed layer the browser never scrolls, placed every frame at its exact place for the live scroll position (document position minus scroll), in the same frame in which the pinned chapters are placed. Nothing is eased in time, so it never trails the scroll, overshoots or bounces back while a smooth wheel scroll animates; where it rides with the page it moves with the page exactly. Its softness lives in the shape of the path (eased segments, a descent that never lurches), not in a lag. Static anchors stand in for it under reduced motion.

### Scale Journey (signature)
"Las escamas viajan con el sol": the hero sea becomes a flock of kamome that follows the sun through the day, so the sea is never just a border.
- **Hero:** at rest the full sea is there, alive. While the sun rises, the crest breathes with the scroll (a 3px ripple, never a loop) and its crest scales lift off one by one, nearest the sun first; behind them the whole sea dissolves, row after row from the horizon to the front, so no wave is left when the hero ends (scrolling back rebuilds it exactly). A lifted scale leaves the sea (its copy there is hidden): it is never drawn twice. Most flip away as they lift (edge on, gone); a flock of them, once clear of the crest, turns into gulls with the same flip (edge on, back as a kamome).
- **Gull phase (the whole page):** the gulls trail the sun (its place a few scroll px ago) as a loose flock around it that opens away from the text, banking with the sun's motion on screen and beating their wings with the scroll (each its own phase and depth, subtle). They stay on screen with the sun the whole way: pressed into the room beside it when it waits at an edge, spread along the sky band in the emakimono, around the parked disc in Sobre mí.
- **Footer:** they follow the setting sun down, turn back into scales (the same flip) just before they land, and land in the sunset sea behind its crest, where the hanko stamps the end of the day.
- **Retired:** the scales no longer settle into the emakimono fans (the fans draw themselves in again) and no longer fall as momiji in Sobre mí; one story, gulls, from the hero to the footer.

**The Scale Journey Rule.** Every scale and gull is an exact function of the live scroll, like the sun: no easing in time, no trailing, no spring back (the wingbeat runs with the scroll too). They keep 24px from all text, controls and the floating Contáctame (they fade out before coming closer), never cover the sun (they pass behind it and the seas), carry no shadow, gradient or glow, and are cobalt only, never orange. The scales reuse the seas' exact geometry and 1px line; the gull is a woodblock glyph at a 1.25px line so it holds at small sizes. About a hundred loose crest scales from 768px (three dozen on phones), of which 32 fly as gulls (14 on phones). Under reduced motion there are none: the seas stay whole and still.

### Emakimono (signature)
Servicios as a hand-scroll pinned from 1024px: panels (about a third of the viewport wide, 420 to 520px) joined by 1px hairlines, one continuous cobalt horizon at 45%, a fan resting on it at an uneven position in each panel, and a row of 1px progress ticks (active in cobalt). A panel's hover and focus frame turns its hairlines to solid cobalt; the selected service shows the 6px sun dot. Each panel says its service in points: the mincho title and two or three short Geist lines in Warm Ash, split by 1px hairlines, distilled only from Eve's copy for that service (no promises such as "resultados excepcionales" or "garantizando"). Every panel ends in a visible cue in the link style, "Me interesa" ("Servicio elegido" once picked), resting at the panel's foot when pinned, whose underline turns solid with the panel frame: the panel is the button, and touch has no hover to reveal it. Stacked with cobalt top rules below 1024px.

### Mi enfoque in two acts (signature)
The problem, then the answer: "El marketing tradicional" as three points on the left with the sun on the right; the sun crosses the sky; "El marketing consciente" as four points on the right with the sun on the left. Each point rises in Warm Ash, turns to Sumi Ink and holds.

### Sol de la tarde (signature)
No photograph: in Sobre mí a pure, whole sun disc rests under the heading, flush with its left edge, beside five milestones that arrive one at a time. Nothing stands in front of it (no band, no paper strip): the traveling sun parks as it and only warms while the text is read.

### Hanko seal (signature)
The final stamp: a 42px persimmon square, an inset 1.25px paper border and an E and B joined by their bars in 1.5px paper strokes, on the right edge of the content grid in the footer.

## Do's and Don'ts

### Do:
- **Do** derive every surface from the live paper with a fixed color-mix step (field +28% light, hairline +13% ink, surface +6% umber).
- **Do** keep cobalt to pills, links, the focus ring, hairline accents and seigaiha strokes.
- **Do** keep orange to the one sun, the selected-service dot and the hanko.
- **Do** set the voice in Zen Old Mincho and reading/UI in Geist; emphasize with Geist 500 in full ink.
- **Do** use 1px hairlines as the only structure, and occlusion as the only depth.
- **Do** generate seigaiha in code with 1px non-scaling strokes and flat per-row opacities.
- **Do** let the scales and gulls travel only with the sun, as an exact function of the scroll, clear of text by 24px.
- **Do** reveal text with the one SplitText primitive (rise or fade by lines), once, and make every scene static under reduced motion.

### Don't:
- **Don't** use pure or near-pure white, gradients, box-shadows, blur, texture or illustration.
- **Don't** use italics, uppercase outside the logotype, eyebrows, kickers or section numerals.
- **Don't** add a second sun, a second accent hue, or an orange that is not the sun.
- **Don't** round anything except pills (actions), 6px fields, the sun and the seigaiha.
- **Don't** put cards, boxes or icon tiles around content; no stacked service cards.
- **Don't** use invented kanji, torii, sakura or other Japanese kitsch.
- **Don't** run text over the seas or over the sun where it rests (only its waiting crescent at an edge may pass behind text).

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
  question:
    fontFamily: "Zen Old Mincho, Yu Mincho, Hiragino Mincho ProN, serif"
    fontSize: "min(clamp(1.75rem, 1rem + 2.6vw, 3.125rem), max(1.75rem, 5.6vh))"
    fontWeight: 400
    lineHeight: 1.15
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
  answer:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 1rem + 0.4vw, 1.375rem)"
    fontWeight: 400
    lineHeight: 1.55
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
  navbar: "64px"
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

The page is one day on warm washi paper, made with the means of Japanese print and editorial craft. The ground turns from a kinari dawn to an autumn dusk as the reader scrolls, one cobalt ink marks every decision and draws the seigaiha, and one orange sun (a hinomaru disc) crosses the whole page under a single owner. Services unroll as an emakimono, Eve's portrait stands in front of the sun like a figure on a print, and an EB hanko stamps the end of the day.

The system is minimal, flat and editorial: type is the protagonist, color is rare, the photograph is a single object, and hierarchy comes from size and weight only. Structure is 1px hairlines; there are no boxes, cards, shadows, gradients, blur or texture. Curves belong to two things only: the sun (circles) and the seigaiha (concentric semicircles), generated in code, never drawn as illustration. It refuses the cream personal-brand template and it refuses Japanese kitsch (no invented kanji, torii or sakura).

Motion is one grammar: content enters once (expo.out / power3.out, 0.6 to 1.1s), micro-interactions take 150ms, and scroll-driven motion is reserved for chapters (the hero "Amanecer" pin, the Mi enfoque pin, the emakimono, the Sobre mí journey, and the sun with the paper's day). Under reduced motion everything is static and visible. Implementation conventions (GSAP ownership, hooks, anchors) live in AGENTS.md.

**Key Characteristics:**
- A live paper ground (`--paper`) tweened through four flat stops by one scrubbed timeline; static midday under reduced motion.
- One cobalt for actions, links, hairline accents, the seigaiha and the focus ring.
- One orange sun, warming to persimmon, with one timeline owner across the page.
- Zen Old Mincho for the voice, Geist for body and UI; never uppercase outside the logotype.
- Flat: 1px hairlines are the only structure.
- Seigaiha generated in code: seas, section marks, fans, value separators, the portrait's band.

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
- **Kinari Dawn / Midday / Autumn Afternoon / Dusk** (paper-morning, paper-midday, paper-afternoon, paper-dusk): the four flat stops of the live `--paper`, which is the page background, the navbar and every sea fill.
- **Paper Shade** (surface): a fixed 6% step of the paper toward umber; scrollbar track.
- **Paper Light** (field): a fixed 28% step of the paper toward light; form fields and toasts.
- **Paper Hairline** (hairline): a fixed 13% step of the paper toward ink; every border by default.
- **Sumi Ink** (foreground): headings, body text, emphasis.
- **Warm Ash** (muted-foreground): secondary text, descriptions, the traditional half of the Mi enfoque statement; 5.4:1 on dusk.
- **Field Stone** (input-border): form field borders and inactive progress ticks; 3.2:1 on dusk.
- **Error Red** (error) and **Moss** (success): form validation and toasts only.

### Named Rules
**The Paper Step Rule.** Every surface is the live paper or a fixed color-mix step of it. A surface that does not follow the paper's day is a stray rectangle.

**The No White Rule.** No pure or near-pure white anywhere; the lightest value is the paper-mixed field and the paper-white text on cobalt.

**The One Sun Rule.** Orange is the sun and its two echoes (the selected-service dot and the hanko). There is one traveling sun on the page, owned by one timeline; anchors only mark where it rests.

## Typography

**Display Font:** Zen Old Mincho (with Yu Mincho, Hiragino Mincho ProN, serif)
**Body Font:** Geist (with ui-sans-serif, system-ui, sans-serif)

**Character:** A Japanese old-style mincho with full Latin carries Eve's voice (headings, leads, the greeting, the values, statements and questions); Geist carries reading and interface. The mincho has no italic, so emphasis is tonal.

### Hierarchy
- **Display** (600, fluid to 5.25rem, 1.1): page-level h1 style; the hero h1 is the brand logotype SVG, sized by its cap height.
- **Title** (600, fluid to 3.25rem, 1.1): section headings, revealed line by line out of a mask.
- **Subtitle** (400, fluid to 2rem, 1.2): h3 default.
- **Hero lead** (400, height-bounded, 1.12): the greeting, spoken line by line in the pin.
- **Question / Values / Statement** (400, height-bounded): the mondō questions, the values row, the Mi enfoque statement and the Sobre mí close. Height-bounded with `min(clamp(), max(_, vh))` so pinned scenes always fit.
- **Lead** (400, fluid to 1.5rem, 1.45): section leads.
- **Answer** (Geist 400, fluid to 1.375rem, 1.55): mondō answers, at most 52ch, beside a 1px hairline.
- **Item** (Geist 500, 1.25rem, 1.35): list headings; service titles override it with the mincho at 400.
- **Body** (Geist 400, 16px, 1.6): paragraphs, 60 to 62ch; 17px / 1.7 for Sobre mí chapters from 768px.
- **Label** (Geist 500, 15px): buttons, nav, form labels (14px).

### Named Rules
**The Tonal Emphasis Rule.** Emphasis is Geist 500 in full ink inside a muted paragraph, or the muted-to-ink contrast within a statement. Never italic, never synthetic oblique.

**The Lowercase Voice Rule.** Never uppercase outside the logotype (EVELYN / BOGADO and its subline). No eyebrows, kickers or section numerals above headings.

## Layout

One content column: 1200px max, 24px gutter below 768px and 40px from 768px. Only two breakpoints exist, md (768px) and xl (1280px); the emakimono pins from 1024px by media query in script. Sections share one vertical rhythm of 96 / 128 / 160px. The navbar is 64px and opaque in the live paper, with a hairline that appears after 8px of scroll. Grids are 12 columns with 24px gaps; Sobre mí and Contacto split 5 / 6 with a column gap at xl. The hero stage is one viewport under the navbar (min 560px). Text never runs over the seas or the sun; the sun travels only through computed free zones at least 48px from text.

**The Two Breakpoints Rule.** Design for below 768px, from 768px and from 1280px. Do not introduce sm, lg or 2xl.

## Elevation & Depth

Completely flat. There are no box-shadows (the `--shadow-*` namespace is reset), no gradients, no blur. Depth is made the way a print makes it: occlusion. Seigaiha rows are drawn back to front with opaque paper fills so nearer rows hide farther ones exactly, the sea hides the sun, the portrait band hides the bust's edge, and per-row stroke opacities (flat values, light far to dark near) give recession.

**The Occlusion Rule.** Depth is something in front of something else on the same paper, never a shadow or a glow.

## Shapes

Square by default. Primary actions are full pills; form fields have a 6px radius; everything else, including toasts and the hanko, is square. Circles are the sun. All other curves are seigaiha: concentric semicircles (four rings, innermost first) sharing one base line, at any scale from a 24px chapter mark to a full-bleed sea. Lines are 1px, with non-scaling strokes.

**The Two Curves Rule.** A circle means the sun; an arc means the sea. No other rounded or organic form enters the page.

## Components

### Buttons
Quiet and confident: one cobalt pill per decision.
- **Shape:** full pill.
- **Primary:** cobalt fill, paper-white Geist 500 at 15px, 48px tall with 28px side padding; compact variant 44px with 24px (the navbar's Contacto).
- **Hover / Focus:** fill deepens to Deep Cobalt over 150ms; 2px cobalt outline at 2px offset, following the pill.
- **Busy:** signalled with `aria-disabled` and a spinner, never the disabled attribute.
- **Link variant:** the one link rule (below), 44px hit area.

### Links
- **Style:** cobalt, 1px underline at 4px offset, the underline at 40% that turns solid on hover in 150ms. Every text link uses it.

### Inputs / Fields
- **Style:** 48px tall, paper-light fill, 1px Field Stone border, 6px radius, 16px side padding; labels above in Geist 500 at 14px.
- **Focus:** border turns cobalt and the 2px cobalt ring appears at 2px offset. Hover darkens the border to Warm Ash.
- **Error / Disabled:** error-red border with a message below; disabled at 60% opacity.

### Navigation
- **Desktop:** no brand mark; Mi enfoque, ¿Qué ofrezco? and Sobre mí as 15px muted links flush left, ink when active, and the compact cobalt pill on the right. One 1px ink underline slides and stretches between links (0.45s power3.out).
- **Mobile:** "Menú" alone on the right opens a full paper panel of mincho links at 32px, closed by "Cerrar".

### Seigaiha (signature)
Generated in code (`lib/seigaiha`), never as an image. Seas: whole scales in three depth tiers with a swell line, flat per-row opacities and the nearest rows dissolving into the paper. Marks: a single 48px scale at the column edge between chapters, drawn from the centre outward once on enter. Fans: a single scale used as the emakimono's resting fans, the values' separators and Sobre mí's chapter milestones.

### The Sun (signature)
One orange disc with one timeline owner. It rises from the hero sea, climbs to midday beside Mi enfoque, crosses the emakimono's sky, parks as the disc behind Eve's portrait (sticky from 1280px), and sets into the footer sea in persimmon. Static anchors stand in for it under reduced motion.

### Emakimono (signature)
Servicios as a hand-scroll pinned from 1024px: tall panels joined by 1px hairlines, one continuous cobalt horizon at 45%, a fan resting on it at an uneven position in each panel, and a row of 1px progress ticks (active in cobalt). A panel's hover and focus frame turns its hairlines to solid cobalt; the selected service shows the 6px sun dot. Stacked with cobalt top rules below 1024px.

### Retrato frente al sol (signature)
The one photograph: a warm color cut-out bust in front of the sun disc, its head breaking out above it, rising from a three-row seigaiha band that hides its straight edge.

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
- **Do** reveal text with the one SplitText primitive (rise or fade by lines), once, and make every scene static under reduced motion.

### Don't:
- **Don't** use pure or near-pure white, gradients, box-shadows, blur, texture or illustration.
- **Don't** use italics, uppercase outside the logotype, eyebrows, kickers or section numerals.
- **Don't** add a second sun, a second accent hue, or an orange that is not the sun.
- **Don't** round anything except pills (actions), 6px fields, the sun and the seigaiha.
- **Don't** put cards, boxes or icon tiles around content; no stacked service cards.
- **Don't** use invented kanji, torii, sakura or other Japanese kitsch.
- **Don't** run text over the seas or the sun.

# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Brands and small businesses looking for a digital-marketing partner who works ethically and authentically. Primary market focus: Spain (expansion), with prior Latin American and European experience. Visitors arrive to evaluate whether Eve is the right person to help their brand grow, then get in touch.

## Product Purpose

Personal landing page for Evelyn "Eve" Bogado, an independent marketing professional. Success means a qualified visitor sends a message through the contact form (optionally preselecting the service they are interested in).

## Positioning

"Marketing consciente": growth through integrity, transparency, and genuine connection with the audience, as opposed to persuasive or intrusive selling. Tagline: "Vibra alto con un marketing consciente."

## Operating Context

Single-page landing in Spanish. Sections: Hero, Mi enfoque, Servicios, Sobre mí, Contacto, Footer. Contact goes through `app/api/send/route.ts` (nodemailer, Gmail SMTP): name, email, an optional phone, an optional service and the message, validated with the same schema in the browser and on the server. Selecting a service card scrolls to the form and preselects that service.

## Capabilities and Constraints

- Services (exact set, 5): Consultoría en marketing digital, Gestión de redes sociales, Estrategias de contenido, Desarrollo web consciente, Otros servicios.
- Values: Transparencia, Innovación, Compromiso.
- Contact form: an optional phone field ("Teléfono (opcional)"), approved by the client, so the help line "Si prefieres, déjame tu número de teléfono y charlamos sobre tu proyecto." is now true.
- Existing copy is confirmed and must be preserved. Exception, approved by the client: Mi enfoque and Sobre mí are distilled into short points (a mincho line plus at most one short note), derived only from Eve's confirmed copy, so visitors scan instead of read. The client extended it to Servicios, keeping the emakimono's look: each service keeps its name and order and is said in two or three short points taken only from Eve's copy for that service. Overpromising phrases ("resultados excepcionales", "garantizando", "el éxito de tu negocio") were dropped, per Authenticity over persuasion.
- Navigation: no menu (approved by the client: it added little to a one-page read). The only persistent action is a floating "Contáctame" pill, shown once the hero's own Contáctame has scrolled away and hidden while Contacto is in view, so contacting Eve stays one tap away from every section (Principle 2).
- Stack per AGENTS.md: Next.js App Router, Tailwind v4 tokens in `app/globals.css`, GSAP for motion, Zustand stores. No dark mode.

## Brand Commitments

- Name: Evelyn Bogado ("Eve"). Voice: warm, close, first person, Spanish.
- Social: instagram.com/evelyn.digitalmkt, linkedin.com/in/evebogado.

## Evidence on Hand

- Photos: none on the page. The Sobre mí portrait (`eve-bust.webp`) was removed at the client's request (git history keeps it); Sobre mí now shows the afternoon sun as one whole disc (the seigaiha band under it was removed at the client's request). The sources `public/fondo-hero.png` (full photo, 2016×1134) and `public/fondo-hero-no-bg.png` (cut-out) stay in `public/` untracked (never committed), for any later need. The hero has no photo (the logotype and the code-generated seigaiha sea and sun lead it).
- Logo: `public/logo-sin-fondo.png`, `public/logotipo.svg`.
- No testimonials, client logos, case studies, or metrics exist. Do not fabricate any.

## Product Principles

1. Authenticity over persuasion: never invent claims, proof, or urgency.
2. Make contacting Eve the obvious next step from every section.
3. Every service must be visible and selectable, not hidden.
4. Warm and personal: Eve is a person, not an agency.

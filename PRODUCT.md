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

Single-page landing in Spanish. Sections: Hero, Mi enfoque, Servicios, Sobre mí, Contacto, Footer. Contact goes through `app/api/send/route.ts` (nodemailer, Gmail SMTP). Selecting a service card scrolls to the form and preselects that service.

## Capabilities and Constraints

- Services (exact set, 5): Consultoría en marketing digital, Gestión de redes sociales, Estrategias de contenido, Desarrollo web consciente, Otros servicios.
- Values: Transparencia, Innovación, Compromiso.
- Existing copy is confirmed and must be preserved.
- Stack per AGENTS.md: Next.js App Router, Tailwind v4 tokens in `app/globals.css`, GSAP for motion, Zustand stores. No dark mode.

## Brand Commitments

- Name: Evelyn Bogado ("Eve"). Voice: warm, close, first person, Spanish.
- Social: instagram.com/evelyn.digitalmkt, linkedin.com/in/evebogado.

## Evidence on Hand

- Portrait: `public/eve-bust.webp` (655×510, with alpha) is derived from the cutout `public/fondo-hero-no-bg.png` (2016×1134): cropped to Eve's bust only (no laptop, stray fragment or chair), alpha eroded by 1px, slight warm grade. It is used exactly once: in Sobre mí, under the heading, Eve standing in front of the parked sun disc and rising from a narrow seigaiha band. `public/fondo-hero.png` (2016×1134) is the full photo, kept for any other need; `public/fondo-hero.webp` is no longer used. The hero has no photo (the logotype and the code-generated seigaiha sea and sun lead it). Do not add the portrait anywhere else.
- Logo: `public/logo-sin-fondo.png`, `public/logotipo.svg`.
- No testimonials, client logos, case studies, or metrics exist. Do not fabricate any.

## Product Principles

1. Authenticity over persuasion: never invent claims, proof, or urgency.
2. Make contacting Eve the obvious next step from every section.
3. Every service must be visible and selectable, not hidden.
4. Warm and personal: Eve is a person, not an agency.

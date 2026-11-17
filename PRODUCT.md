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

- One real portrait photo: `public/fondo-hero.webp`.
- Logo: `public/logo-sin-fondo.png`, `public/logotipo.svg`.
- No testimonials, client logos, case studies, or metrics exist. Do not fabricate any.

## Product Principles

1. Authenticity over persuasion: never invent claims, proof, or urgency.
2. Make contacting Eve the obvious next step from every section.
3. Every service must be visible and selectable, not hidden.
4. Warm and personal: Eve is a person, not an agency.

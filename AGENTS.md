# AGENTS.md

Contexto completo del proyecto para cualquier agente (o humano) que trabaje en este repo. Leer antes de cualquier tarea no trivial.

## Stack

- **Next.js 16.4.6** (App Router, todo vive en `app/`, no hay `src/`)
- **React 19** / **React DOM 19**
- **TypeScript** en modo `strict` (ver `tsconfig.json`)
- **Tailwind CSS v4**, configurado íntegramente en CSS — no existe `tailwind.config.*`. Todos los tokens (colores, radios, animaciones) viven en `app/globals.css`, bloque `@theme inline`.
- **pnpm** es el único package manager soportado (`packageManager` fijado en `package.json`). No usar `yarn` ni `npm` — no generan lockfiles compatibles con el resto del equipo/CI.

## Estructura y convenciones de carpetas

- `app/` — solo rutas, layout raíz, metadata y route handlers (App Router). `app/page.tsx` únicamente orquesta el orden de las secciones de la landing; no contiene JSX de contenido propio.
- `components/sections/*.tsx` — un componente por sección de la landing (`Navbar`, `Hero`, `Intro`, `Servicios`, `SobreMi`, `Contacto`, `Footer`), cada uno mapeado 1:1 a un `id` de sección referenciado en `navbarItems` (`components/sections/Navbar.tsx`). El componente exportado debe nombrarse igual al dominio de su archivo — **no reutilizar nombres entre archivos** (esto pasó antes: `Servicios.tsx` exportaba un componente interno llamado `SobreMi`, chocando con el nombre real de `SobreMi.tsx`; ya corregido, pero sirve de ejemplo de qué evitar).
- `components/ui/*.tsx` — primitives estilo shadcn: Radix UI + `cva` (class-variance-authority) + `cn()` de `lib/utils.ts`. Sin conocimiento de negocio ni contenido específico de esta landing — deben poder reutilizarse en cualquier proyecto.
- `components/vectors/*.tsx` — SVGs como componentes React. Hoy solo `SocialIcons.tsx` (glifos de Instagram y LinkedIn). No hay ilustraciones: la dirección "Cal y cobalto" las prohíbe.
- `hooks/*.ts` — un hook por archivo, nombrado `useXxx.ts`, sin JSX.
- `stores/<dominio>/` — un store de zustand por dominio (`stores/nav`, `stores/service`), cada uno con su propio Context Provider y hook `use<Dominio>Store`. Ver `stores/nav` como referencia del patrón.
- `lib/` — utilidades y datos: `cn()` (`utils.ts`), registro central de plugins GSAP (`gsap.ts`), `scrollToSection()` (`scroll.ts`) y el catálogo de servicios (`services.tsx`).

## Convención de animación: GSAP, no framer-motion

Este proyecto migró de `framer-motion` a **GSAP** (`gsap@^3.15` + `@gsap/react`). `framer-motion` está retirado del código y **prohibido para código nuevo**.

Patrones por caso de uso:

- **Entrada del hero**: `hooks/useHeroAnimation.ts`, un `gsap.timeline()` de 0.3s `power2.out` (opacity + y 8px, stagger 0.06) y luego la imagen solo con opacity.
- **Entrada de sección**: `hooks/useFadeStagger.ts`, opacity sola, 0.2s, `ScrollTrigger` con `once: true` sobre los hijos `.reveal`.
- **Scroll a una sección**: `scrollToSection(id)` de `lib/scroll.ts` (`ScrollToPlugin`, 0.3s, offset del navbar; salto instantáneo con reduced motion).
- **Micro-interacciones**: CSS a 150ms (color, fondo, subrayado). Nada de scrub, parallax ni bucles.

Todo pasa por `gsap.matchMedia()` con `prefers-reduced-motion: no-preference`: con reduced motion se muestra todo sin animar.

**Cleanup en componentes React**: siempre vía `useGSAP(callback, { scope, dependencies })` de `@gsap/react`. Nunca dejar animaciones o `ScrollTrigger`s vivos tras un unmount — `useGSAP` lo resuelve automáticamente (equivalente al `gsap.context()` + `.revert()` manual).

**No todo lo que trackea scroll necesita GSAP**: si el caso de uso es solo detectar si un elemento está en viewport (sin animar nada), usar `IntersectionObserver` nativo. Si es solo togglear una clase CSS en scroll (sin animar propiedades), un listener nativo de `scroll` alcanza. Reservar `ScrollTrigger` para cuando realmente se anima algo.

**Registro de plugins**: centralizado en `lib/gsap.ts` (`ScrollTrigger`, `ScrollToPlugin`, `useGSAP`). Importar `gsap` desde ahí, no desde `gsap` directo.

## Convención de estilos

Tailwind v4. Los tokens viven en `app/globals.css`: valores hex en `:root` (dentro de `@layer base`) mapeados a `--color-*` en `@theme inline`. Tokens: `background` (#FAFAF7, cal), `surface` (#F1F0EA, lado en sombra), `field` (#FFFFFF, fondo de inputs), `foreground`, `muted-foreground`, `hairline` (filetes de 1px), `input-border`, `primary` / `primary-hover` / `primary-foreground` (cobalto), `accent` (naranja), `link`, `ring`, `error`, `success`.

**Nunca hardcodear colores en componentes**: siempre vía token semántico (`text-muted-foreground`, `bg-surface`, etc.), nunca hex sueltos. Si hace falta un token nuevo, se agrega en `globals.css` siguiendo el mismo patrón.

Paleta "Cal y cobalto": una página encalada a mediodía. El blanco hace el trabajo; `surface` marca las bandas en sombra (Mi enfoque, el índice de Servicios, Footer). El cobalto vive solo en el botón primario, los enlaces y el focus ring (≤3% de la superficie, un botón primario por viewport como máximo). El naranja (`accent`) es solo el punto de 6px del servicio elegido: nunca texto, fondo ni borde. Sin gradientes, sin blur, sin sombras, sin bordes de más de 1px; radio de 2px (`rounded-xs`) solo en inputs y botones. Sin ilustraciones ni iconos decorativos: la única imagen es el retrato del hero. **Dark mode no está implementado**: no agregar overrides `.dark` sin pedido explícito.

Tipografía: **Libre Caslon Display** 400 (`font-display`) para el nombre y los títulos; **Libre Caslon Text** (`font-serif`) para el lead y la itálica de énfasis; **Geist** (`font-sans`) para el cuerpo y la UI. Se cargan con `next/font/google` en `app/layout.tsx`. Utilidades de escala en `globals.css`: `text-display`, `text-title`, `text-subtitle`, `text-lead`, `text-eyebrow`. Cuerpo 16px / 1.6, medida máxima 65ch. Nunca mayúsculas.

`Heading` (`components/ui/Heading.tsx`) separa elemento y aspecto: `is` elige la etiqueta (`h1`–`h6`) y `variant` el estilo (`display`, `title`, `subtitle`, `item`). Hay un solo `h1` (el nombre en el hero); los títulos de sección son `h2`.

### Retícula y spacing

Solo dos breakpoints: `md` (768px) y `xl` (1280px); `sm`, `lg` y `2xl` están desactivados. `container` = máximo 1200px de contenido con gutter de 24px (<768) y 40px (≥768). Las secciones de contenido usan la utilidad `section-pad` (96 / 128 / 160px). No agregar `py-*` ad-hoc por sección. Todo sobre la grilla de 4/8pt; touch targets de 44px como mínimo.

### Énfasis tipográfico

En textos largos, las frases clave van en `<em>` con Libre Caslon Text itálica en `text-foreground` y el resto en `text-muted-foreground` (ver `SobreMi.tsx`). Los `<strong>` del copy de servicios van en Geist 500 `text-foreground`. No reescribir el copy para aplicar el patrón: solo envolver el texto existente.

### Accesibilidad

Skip link "Saltar al contenido" como primer foco (`app/page.tsx`). Focus ring de 2px cobalto con offset de 2px. El menú móvil (`components/ui/Navbar.tsx`) es un diálogo con focus trap, se cierra con Esc y devuelve el foco al botón "Menú". El submit del formulario usa `aria-disabled` mientras envía, nunca `disabled`.

## State management

Zustand, patrón store-per-domain con Context Provider (no un store global único). Ver `stores/nav/nav-store.ts` + `stores/nav/nav-providers.tsx` como referencia canónica antes de crear un store nuevo.

## Formularios

`react-hook-form` + `zod` + `@hookform/resolvers/zod`. El schema de validación se define inline junto al componente que lo usa (patrón actual en `components/sections/Contacto.tsx`). El envío va vía route handler (`app/api/send/route.ts`) + `nodemailer`.

## Comandos

```
pnpm dev      # servidor de desarrollo
pnpm build    # build de producción
pnpm start    # levantar el build
pnpm lint     # eslint . (flat config, next/core-web-vitals)
```

No hay script `typecheck` propio — usar `pnpm exec tsc --noEmit` si hace falta validar tipos por fuera de `next build`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

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
- **Micro-interacciones**: CSS a 150ms (color, fondo, subrayado). Nada de scrub, parallax ni bucles fuera del viaje del sol (ver "El viaje del sol").
- **Gráfico ("El viaje del sol")**: `hooks/useSeaField.ts` (tinta del mar y del footer), `hooks/useTravelingSun.ts` (el sol, un solo scrub sobre el documento) y la marca de sección; ver más abajo.

Todo pasa por `gsap.matchMedia()` con `prefers-reduced-motion: no-preference`: con reduced motion se muestra todo sin animar.

**Cleanup en componentes React**: siempre vía `useGSAP(callback, { scope, dependencies })` de `@gsap/react`. Nunca dejar animaciones o `ScrollTrigger`s vivos tras un unmount — `useGSAP` lo resuelve automáticamente (equivalente al `gsap.context()` + `.revert()` manual).

**No todo lo que trackea scroll necesita GSAP**: si el caso de uso es solo detectar si un elemento está en viewport (sin animar nada), usar `IntersectionObserver` nativo. Si es solo togglear una clase CSS en scroll (sin animar propiedades), un listener nativo de `scroll` alcanza. Reservar `ScrollTrigger` para cuando realmente se anima algo.

**Registro de plugins**: centralizado en `lib/gsap.ts` (`ScrollTrigger`, `ScrollToPlugin`, `DrawSVGPlugin`, `MotionPathPlugin`, `useGSAP`). Importar `gsap` desde ahí, no desde `gsap` directo.

## Convención de estilos

Tailwind v4. Los tokens viven en `app/globals.css`: valores hex en `:root` (dentro de `@layer base`) mapeados a `--color-*` en `@theme inline`. Tokens: `background` (#FAFAF7, cal), `surface` (#F1F0EA, lado en sombra), `field` (#FFFFFF, fondo de inputs), `foreground`, `muted-foreground`, `hairline` (filetes de 1px), `input-border`, `primary` / `primary-hover` / `primary-foreground` (cobalto), `accent` (naranja), `link`, `ring`, `error`, `success`.

**Nunca hardcodear colores en componentes**: siempre vía token semántico (`text-muted-foreground`, `bg-surface`, etc.), nunca hex sueltos. Si hace falta un token nuevo, se agrega en `globals.css` siguiendo el mismo patrón.

Paleta "Cal y cobalto": una página encalada a mediodía. El blanco hace el trabajo; `surface` queda solo para el panel del índice de Servicios (las bandas en sombra se quitaron: la página es toda cal). El cobalto vive solo en el botón primario, los enlaces y el focus ring (≤3% de la superficie, un botón primario por viewport como máximo). El naranja (`accent`) es solo el punto de 6px del servicio elegido: nunca texto, fondo ni borde (fuera del sol y del sello "EB" del footer). Sin gradientes, sin blur, sin sombras, sin bordes de más de 1px. **Regla de forma**: sin arcos de marco: las curvas viven solo en el gráfico (las ondas seigaiha, la marca de sección y el disco del sol); los botones primarios son píldoras (`rounded-full`; el focus ring sigue la forma); inputs, textarea, trigger y popover del select llevan 6px (`rounded-field`); todo lo demás (filetes, bandas, panel de servicios, toasts, grilla) va recto. Sin ilustraciones ni iconos decorativos fuera del hero.

### Gráfico: "El viaje del sol" (seigaiha + un sol)

Un día en una página. Sin foto ni marco: el retrato se quitó por decisión de la clienta (`public/fondo-hero.webp` queda en disco, sin uso). Colores: fondo cal, líneas cobalto (`primary`, 1px) y un único disco naranja (`sun`, que se calienta a `sun-warm`). Nada más. El texto nunca pisa ondas ni sol.

- **Mar seigaiha** (`components/ui/SeaField.tsx` + `lib/seigaiha.ts`): aparece **solo** en el hero (con un oleaje que sube hacia el sol a la derecha) y en el footer (atardecer, oleaje espejado, más alto a la izquierda). El generador es exacto: escamas de radio R con 4 arcos, cada fila baja R/2 y se corre R, y las filas se dibujan de atrás hacia adelante con discos opacos del color del fondo, así las cercanas tapan a las lejanas y el sol queda detrás sin rendijas. El oleaje quita escamas **enteras** de las filas del fondo por columna (función `swell`), y la profundidad es una opacidad plana por fila (0.3 atrás → 0.7 adelante, sin degradés). Se mide el ancho y se genera 1:1 en píxeles CSS (trazo de 1px nítido). Alturas: hero 280/192px, footer 200/120px (desktop/móvil), reservadas en `SeaField`. Unos 44 paths en total.
- **Marca de sección** (`components/ui/SectionMark.tsx`): una sola escama (4 semicírculos, 48px) centrada en el eje, como un *mon* entre capítulos. Solo en Mi enfoque → Servicios y Sobre mí → Contacto; en el resto, separa el blanco. No hay franjas de seigaiha entre secciones.
- **Sol viajero** (`components/ui/TravelingSun.tsx` + `hooks/useTravelingSun.ts` + `lib/sunPath.ts`): un solo elemento para toda la página, en una capa del tamaño del documento detrás de `main` y `footer`, que lo recorta en los bordes sin generar scroll horizontal. Sale del ancla del hero (`[data-sun-anchor="hero"]`) y termina en la del footer (`[data-sun-anchor="footer"]`). En cada capítulo se estaciona en la **zona libre** de esa sección, calculada con el layout real: el lugar más cercano a un x objetivo (este → oeste: Mi enfoque y Servicios a la derecha, Sobre mí y Contacto a la izquierda) cuyo disco queda a **≥48px** de todo texto y superficie opaca. Entre capítulos viaja solo por blanco (sale al margen, baja por él, cruza el hueco entre secciones y entra) con MotionPath `sine.inOut`. Todo va en un único ScrollTrigger con scrub y se recalcula al cambiar el tamaño del documento. El encabezado de Sobre mí ya no es sticky, para dejar libre esa columna a la tarde. Móvil (<768): sin viaje horizontal; espera fuera del borde derecho y solo asoma en las marcas de sección, hasta ponerse en el footer (a la derecha).

**Movimiento**: (1) intro del hero, una vez (~1.8s): cada fila del mar se dibuja desde su centro hacia afuera (DrawSVG), escalonada desde la fila del medio, mientras el sol sube desde detrás de las olas (`expo.out`). (2) Scroll: el viaje del sol (sube y se achica hacia la zona libre de Mi enfoque, mediodía en Servicios, baja y se calienta en Sobre mí, se pone en el mar del footer). (3) El mar del footer y las marcas se dibujan una vez al entrar (≤0.8s; la marca va de adentro hacia afuera, 0.6s `power2.out`). Nada se mueve en bucle y nada anima bajo texto. Solo transforms, opacity y attr. Con reduced motion no hay sol viajero: el sol estático del hero y el atardecer estático del footer (los mismos anclas, visibles solo en ese modo) y todo dibujado.

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

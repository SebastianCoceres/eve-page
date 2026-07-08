# AGENTS.md

Contexto completo del proyecto para cualquier agente (o humano) que trabaje en este repo. Leer antes de cualquier tarea no trivial.

## Stack

- **Next.js 16.2.10** (App Router, todo vive en `app/`, no hay `src/`)
- **React 19** / **React DOM 19**
- **TypeScript** en modo `strict` (ver `tsconfig.json`)
- **Tailwind CSS v4**, configurado íntegramente en CSS — no existe `tailwind.config.*`. Todos los tokens (colores, radios, animaciones) viven en `app/globals.css`, bloque `@theme inline`.
- **pnpm** es el único package manager soportado (`packageManager` fijado en `package.json`). No usar `yarn` ni `npm` — no generan lockfiles compatibles con el resto del equipo/CI.

## Estructura y convenciones de carpetas

- `app/` — solo rutas, layout raíz, metadata y route handlers (App Router). `app/page.tsx` únicamente orquesta el orden de las secciones de la landing; no contiene JSX de contenido propio.
- `components/sections/*.tsx` — un componente por sección de la landing (`Navbar`, `Hero`, `Intro`, `Servicios`, `SobreMi`, `Contacto`, `Footer`), cada uno mapeado 1:1 a un `id` de sección referenciado en `navbarItems` (`components/sections/Navbar.tsx`). El componente exportado debe nombrarse igual al dominio de su archivo — **no reutilizar nombres entre archivos** (esto pasó antes: `Servicios.tsx` exportaba un componente interno llamado `SobreMi`, chocando con el nombre real de `SobreMi.tsx`; ya corregido, pero sirve de ejemplo de qué evitar).
- `components/ui/*.tsx` — primitives estilo shadcn: Radix UI + `cva` (class-variance-authority) + `cn()` de `lib/utils.ts`. Sin conocimiento de negocio ni contenido específico de esta landing — deben poder reutilizarse en cualquier proyecto.
- `components/vectors/*.tsx` — SVGs a medida como componentes React (iconos animados, ilustraciones propias). Distinto de `public/*.svg` / `public/undraw_*` (assets estáticos de stock, servidos vía `next/image` o `<img>`).
- `hooks/*.ts` — un hook por archivo, nombrado `useXxx.ts`, sin JSX.
- `stores/<dominio>/` — un store de zustand por dominio (`stores/nav`, `stores/service`), cada uno con su propio Context Provider y hook `use<Dominio>Store`. Ver `stores/nav` como referencia del patrón.
- `lib/` — utilidades puras sin JSX (`cn()` hoy).

## Convención de animación: GSAP, no framer-motion

Este proyecto migró de `framer-motion` a **GSAP** (`gsap@^3.15` + `@gsap/react`). `framer-motion` está retirado del código y **prohibido para código nuevo**.

Patrones por caso de uso:

- **Scroll reveals** (fade/slide al entrar en viewport): `ScrollTrigger`, con `start` ajustado al efecto deseado y `toggleActions`/`once` según si debe repetirse.
- **Layout animations** (mover/redimensionar un elemento entre dos estados del DOM, ej. un indicador que salta entre items): plugin `Flip`.
- **Secuencias con varios pasos coordinados**: `gsap.timeline()`, nunca animaciones sueltas encadenadas a mano.
- **Dibujado progresivo de SVG**: `DrawSVGPlugin`.

Todos estos plugins vienen incluidos gratis en `gsap@3.15+` (ex-Club GreenSock, liberados tras la adquisición de Webflow) — se importan directo (`gsap/ScrollTrigger`, `gsap/Flip`, `gsap/DrawSVGPlugin`), no requieren dependencias adicionales.

**Cleanup en componentes React**: siempre vía `useGSAP(callback, { scope, dependencies })` de `@gsap/react`. Nunca dejar animaciones o `ScrollTrigger`s vivos tras un unmount — `useGSAP` lo resuelve automáticamente (equivalente al `gsap.context()` + `.revert()` manual).

**No todo lo que trackea scroll necesita GSAP**: si el caso de uso es solo detectar si un elemento está en viewport (sin animar nada), usar `IntersectionObserver` nativo. Si es solo togglear una clase CSS en scroll (sin animar propiedades), un listener nativo de `scroll` alcanza. Reservar `ScrollTrigger` para cuando realmente se anima algo.

**Registro de plugins**: centralizado e idempotente (GSAP tolera `registerPlugin` repetido, pero evitar registrar el mismo plugin en cada render/módulo sin necesidad).

## Convención de estilos

Tailwind v4, tokens semánticos en HSL definidos en `app/globals.css` (`:root` dentro de `@layer base`, mapeados a `--color-nombre: hsl(var(--nombre))` en `@theme inline`). Tokens disponibles: `background`, `foreground`, `primary`, `secondary`, `muted`, `accent`, `error`, `success`, `warning`, `info`, `border`, `input`, `ring`.

**Nunca hardcodear colores en componentes** — siempre vía token semántico (`text-primary`, `bg-secondary/10`, etc.), no valores HSL/hex sueltos. Si se necesita un token nuevo, agregarlo en `globals.css` siguiendo el mismo patrón (variable en `:root` + mapeo en `@theme inline`).

Paleta actual: tierra/terracota (`primary`) + azul petróleo (`secondary`) sobre fondo crema (`background`), tipografía Roboto Condensed (`next/font/google`, aplicada globalmente al body) con un detalle de fuente script (Sacramento) solo en la firma del footer. **Dark mode no está implementado** (infraestructura de `next-themes` presente pero sin `ThemeProvider` montado) — no agregar overrides `.dark` sin pedido explícito.

### Spacing vertical de secciones

Todas las secciones de contenido (`Hero.tsx`, `Intro.tsx`, `Servicios.tsx`, `SobreMi.tsx`, `Contacto.tsx`) usan el mismo par de clases responsive de padding vertical: **`py-20 md:py-32`**. Es la convención única de spacing vertical del proyecto — no agregar `py-*`/`pb-*`/`pt-*` ad-hoc por sección; si una sección necesita más o menos aire, se ajusta este valor global, no se crea una excepción local.

## State management

Zustand, patrón store-per-domain con Context Provider (no un store global único). Ver `stores/nav/nav-store.ts` + `stores/nav/nav-providers.tsx` como referencia canónica antes de crear un store nuevo.

## Formularios

`react-hook-form` + `zod` + `@hookform/resolvers/zod`. El schema de validación se define inline junto al componente que lo usa (patrón actual en `components/sections/Contacto.tsx`). El envío va vía route handler (`app/api/send/route.ts`) + `nodemailer`.

## Comandos

```
pnpm dev      # servidor de desarrollo
pnpm build    # build de producción
pnpm start    # levantar el build
pnpm lint     # eslint (next/core-web-vitals)
```

No hay script `typecheck` propio — usar `pnpm exec tsc --noEmit` si hace falta validar tipos por fuera de `next build`.

**Nota sobre `pnpm lint`**: actualmente falla por una incompatibilidad de upstream, no del código de este repo. `eslint-config-next@16.2.10` exige `eslint@10.6.0` como peer, pero arrastra `eslint-plugin-react@7.37.5` (la última versión publicada), que todavía no soporta la API de reglas de ESLint 10 (`contextOrFilename.getFilename is not a function`). Ya está migrada la config a flat config (`eslint.config.mjs`), así que en cuanto `eslint-plugin-react` publique una versión compatible, `pnpm lint` debería volver a funcionar sin más cambios. Mientras tanto, `pnpm build` (que corre el typecheck completo de TypeScript) es la señal de verificación confiable.

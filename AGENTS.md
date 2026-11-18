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
- `components/vectors/*.tsx` — SVGs como componentes React. Hoy solo `SocialIcons.tsx` (Instagram y LinkedIn redibujados como una familia: contorno de 1.5px, el mismo marco cuadrado redondeado de 16.5px en grilla de 24). No hay ilustraciones: la dirección las prohíbe.
- `hooks/*.ts` — un hook por archivo, nombrado `useXxx.ts`, sin JSX.
- `stores/<dominio>/` — un store de zustand por dominio (`stores/nav`, `stores/service`), cada uno con su propio Context Provider y hook `use<Dominio>Store`. Ver `stores/nav` como referencia del patrón.
- `lib/` — utilidades y datos: `cn()` (`utils.ts`), registro central de plugins GSAP (`gsap.ts`), `scrollToSection()` (`scroll.ts`) y el catálogo de servicios (`services.tsx`).

## Convención de animación: GSAP, no framer-motion

Este proyecto migró de `framer-motion` a **GSAP** (`gsap@^3.15` + `@gsap/react`). `framer-motion` está retirado del código y **prohibido para código nuevo**.

Patrones por caso de uso:

- **Entrada del hero**: `hooks/useHeroAnimation.ts`, un `gsap.timeline()` de 0.3s `power2.out` (opacity + y 8px, stagger 0.06) y luego la imagen solo con opacity.
- **Entrada de sección**: `hooks/useFadeStagger.ts`, opacity sola, 0.2s, `ScrollTrigger` con `once: true` sobre los hijos `.reveal`.
- **Entradas de página** (`hooks/usePageMotion.ts`, montado por `components/ui/PageMotion.tsx` en `app/page.tsx`; no toca el hero ni Servicios, que tienen su propio movimiento): una sola gramática, `expo.out` / `power3.out`, 0.6–1.1s, una vez al entrar. Títulos `h2`: líneas con SplitText (`mask: "lines"`, clase `split-line`) que suben de `yPercent 100` a 0, stagger 0.08. Leads (`.text-lead`): líneas que aparecen en opacidad, stagger 0.08. Mi enfoque: las dos columnas suben (y 24) mientras su filete superior (`[data-focus-rule]`, un elemento propio) se dibuja de izquierda a derecha (scaleX). Sobre mí: el retrato se descubre desde abajo (`clip-path: inset()` sobre su propia caja). Contacto: los campos entran en cascada (y 16, stagger 0.08) y, solo con puntero fino, la píldora "Enviar mensaje" sigue al cursor ≤6px (`quickTo`). Todo parte del layout visible del servidor (sin JS se ve todo), sin layout shift, solo transform, opacity y clip-path.
- **Navbar**: el subrayado de la sección activa es un único elemento de 1px (`[data-nav-underline]`) que se desliza y estira hasta el texto del enlace actual (x + scaleX, 0.45s `power3.out`; instantáneo con reduced motion).
- **Scroll a una sección**: `scrollToSection(id)` de `lib/scroll.ts` (`ScrollToPlugin`, 0.3s, offset del navbar; salto instantáneo con reduced motion).
- **Micro-interacciones**: CSS a 150ms (color, fondo, subrayado). Nada de scrub, parallax ni bucles fuera del viaje del sol (ver "El viaje del sol").
- **Registro**: SplitText también se registra en `lib/gsap.ts`. `useTravelingSun` mide las líneas de un título que todavía no subió donde van a quedar (descuenta su transform), así la clearance del sol no depende del estado de la animación.
- **Gráfico ("El viaje del sol")**: `hooks/useSeaField.ts` (tinta del mar y del footer), `hooks/useTravelingSun.ts` (el sol, un solo scrub sobre el documento), `hooks/usePaperDay.ts` (el papel del día, un solo scrub sobre `--paper` y `--sun-now`) y la marca de sección; ver más abajo.

Todo pasa por `gsap.matchMedia()` con `prefers-reduced-motion: no-preference`: con reduced motion se muestra todo sin animar.

**Cleanup en componentes React**: siempre vía `useGSAP(callback, { scope, dependencies })` de `@gsap/react`. Nunca dejar animaciones o `ScrollTrigger`s vivos tras un unmount — `useGSAP` lo resuelve automáticamente (equivalente al `gsap.context()` + `.revert()` manual).

**No todo lo que trackea scroll necesita GSAP**: si el caso de uso es solo detectar si un elemento está en viewport (sin animar nada), usar `IntersectionObserver` nativo. Si es solo togglear una clase CSS en scroll (sin animar propiedades), un listener nativo de `scroll` alcanza. Reservar `ScrollTrigger` para cuando realmente se anima algo.

**Registro de plugins**: centralizado en `lib/gsap.ts` (`ScrollTrigger`, `ScrollToPlugin`, `DrawSVGPlugin`, `MotionPathPlugin`, `useGSAP`). Importar `gsap` desde ahí, no desde `gsap` directo.

## Convención de estilos

Tailwind v4. Los tokens viven en `app/globals.css`: valores en `:root` (dentro de `@layer base`) mapeados a `--color-*` en `@theme inline`. Tokens: `paper` (el papel vivo), `background` (= paper), `surface` (paper + 6% de sombra cálida, solo el panel de Servicios), `field` (paper + 28% de luz, inputs y popovers), `hairline` (paper + 13% de tinta), `foreground`, `muted-foreground` (#57504A, gris cálido), `input-border` (#7D7367), `primary` / `primary-hover` / `primary-foreground` (cobalto con texto papel #F6F1E7), `accent` (naranja), `link`, `ring`, `error`, `success`, `sun` / `sun-warm` / `sun-now`.

**Nunca hardcodear colores en componentes**: siempre vía token semántico (`text-muted-foreground`, `bg-surface`, etc.), nunca hex sueltos. Si hace falta un token nuevo, se agrega en `globals.css` siguiendo el mismo patrón. **Nada es blanco**: ninguna superficie usa #FFF ni un casi-blanco; todo es el papel o un paso fijo de él (`color-mix` sobre `--paper`), así ningún rectángulo desentona cuando el papel cambia.

Paleta "Washi y cobalto": papel washi cálido que pasa de la mañana al atardecer de otoño con el scroll. Paradas (colores planos, nunca degradés): mañana `#F3EEE3` (hero), mediodía kinari `#EFE7D8` (Servicios a media pantalla), tarde `#EADFCA` (Sobre mí a media pantalla), anochecer `#E4D3B9` (final de la página). Un único tween de GSAP con scrub (`hooks/usePaperDay.ts`, keyframes en % calculados del layout real) anima `--paper` y `--sun-now` en `<html>`; con reduced motion el CSS fija un mediodía estático. Contraste sobre el papel más oscuro (anochecer): tinta 12.1:1, muted 5.4:1, cobalto 5.5:1, borde de input 3.2:1 (todo AA). El cobalto vive solo en el botón primario, los enlaces, las líneas del mar y el focus ring. El naranja es el sol (que se calienta a caqui, `#CC4A1E`, al anochecer), el punto de 6px del servicio elegido y el sello: nunca texto, fondo ni borde de UI. Sin gradientes, sin blur, sin sombras, sin bordes de más de 1px. Sin textura de fibra: se evaluó y se omitió.

**Enlaces**: todo enlace de texto usa la utilidad `link` (o `Button variant="link"`): cobalto, subrayado de 1px al 40% con offset 4px que pasa a sólido al hover en 150ms. Aplica al "Quiero conocerte más" del hero, a Instagram de Sobre mí y a las redes de Contacto y del footer. Sin eyebrows ni kickers sobre los títulos: el saludo del hero abre el lead serif ("¡Hola! Soy Eve. Vibra alto…") y "¡Estoy aquí para ti!" es el lead serif bajo "Hablemos de tu proyecto". El énfasis de Sobre mí es Caslon Text itálica a 0.98em (iguala el x-height de Geist) en el mismo color del párrafo.

**Regla de forma**: un único arco figurativo, el del retrato de Sobre mí (puerta en arco, 4:5, medio círculo exacto arriba vía `rounded-t-[999px]`, base recta); fuera de él las curvas viven solo en el gráfico (las ondas seigaiha, la marca de sección y el disco del sol); los botones primarios son píldoras (`rounded-full`; el focus ring sigue la forma); inputs, textarea, trigger y popover del select llevan 6px (`rounded-field`); todo lo demás (filetes, bandas, panel de servicios, sello, toasts, grilla) va recto. Sin ilustraciones ni iconos decorativos fuera del gráfico.

### Gráfico: "El viaje del sol" (seigaiha + un sol)

Un día en una página. Una sola foto, el retrato de Eve (`public/fondo-hero.webp`), y solo en Sobre mí, dentro del arco: `next/image` con `sizes`, alt "Evelyn Bogado", recorte `object-[71%_center]` con la cara dentro del arco, impreso sobre el papel (una capa `bg-paper` en `mix-blend-multiply` al 50% y `saturate-[0.9]`; sin borde, sombra, blur ni degradé). Ancho: 384px desde 768 (columna izquierda en desktop, bajo el título), ancho completo menos gutters en móvil, siempre entre el título y el texto. El hero no tiene foto. Colores: fondo papel, líneas cobalto (`primary`, 1px) y un único disco naranja (`sun`, que se calienta a `sun-warm`). Nada más. El texto nunca pisa ondas ni sol.

- **Mar seigaiha** (`components/ui/SeaField.tsx` + `lib/seigaiha.ts`): aparece **solo** en el hero (el oleaje sube hacia el sol a la derecha) y en el footer (atardecer: calmo a la izquierda, donde se pone el sol, y crece hacia la derecha; el footer no tiene padding superior: el `section-pad` de Contacto es la pausa). **Profundidad**: las escamas se achican hacia el horizonte en tres escalones (R abajo, 0.8R, 0.6R arriba); dentro de cada escalón la retícula clásica es exacta (cada fila baja r/2 y se corre r) y los tres escalones se trazan desde la x del sol, así coinciden donde mira el ojo. Las filas se dibujan de atrás hacia adelante; cada escama se rellena con su semidisco superior más toda la columna bajo su base, en color papel y 0.5px más ancha por lado: las filas cercanas tapan exactamente a las lejanas y el sol nunca asoma por una rendija. El oleaje quita escamas **enteras** cuya cresta quedaría sobre la línea del oleaje (función `swell`, en px), y la profundidad del trazo es una opacidad plana por fila (0.3 atrás → 0.7 adelante). **Fusión** (solo el hero): las tres filas más cercanas bajan en escalones planos (0.45 → 0.25 → 0.1, opción `fade`), así el mar se disuelve en el papel como una estampa en vez de terminar en un corte recto; Mi enfoque empieza con su `section-pad` completo debajo. Se genera 1:1 en píxeles CSS (trazo de 1px nítido). Alturas fijas (`SEA_HEIGHT`): hero 280/192px, footer 200/120px (desktop/móvil), reservadas en `SeaField`; los rellenos usan `var(--background)`, así siguen al papel.
- **Marca de sección** (`components/ui/SectionMark.tsx`): una sola escama (4 semicírculos, 48px) alineada al borde izquierdo de la columna de texto (el gutter), como un *mon* entre capítulos. Solo en Mi enfoque → Servicios y Sobre mí → Contacto.
- **Sello** (`Seal` en `components/sections/Footer.tsx`): un hanko de 42px, cuadrado en el caqui del sol poniente (`sun-warm`), con un filete interior de 1.25px en color papel y un monograma E+B unido por sus barras superior e inferior, trazado en SVG a 1.5px en color papel. Alineado al borde derecho de la columna de contenido (gutter), sobre el mar del footer, a todos los anchos.
- **Atardecer del footer**: el disco (120px móvil, 200px desde 768) se pone a la izquierda: sobre el borde izquierdo de la columna de contenido hasta 1279px y, desde 1280, en el carril libre entre el logo y las redes del footer (contenido + 222px), por donde baja su último descenso. El mar queda plano (valle calmo) bajo el sol y crece hacia la derecha (`swell` con tramo `calm`); el disco muestra la mitad sobre las crestas, que solo muerden su borde inferior (ancla a 36px del fondo en desktop, 23px en móvil). El ancla estática de reduced motion muestra este mismo encuadre.
- **Sol viajero** (`components/ui/TravelingSun.tsx` + `hooks/useTravelingSun.ts` + `lib/sunPath.ts`): un solo elemento para toda la página, en una capa del tamaño del documento detrás de `main` y `footer`, que lo recorta en los bordes sin generar scroll horizontal. Su color es `--sun-now` (naranja → caqui con el papel). Sale del ancla del hero (`[data-sun-anchor="hero"]`) y termina en la del footer (`[data-sun-anchor="footer"]`). Todo se mide del layout vivo en cada cambio de tamaño del documento (incluido cualquier pin spacer). **Desde 768px**: en Mi enfoque y Servicios se estaciona en la **zona libre** de la sección: el lugar más cercano a un x objetivo cuyo disco queda a **≥48px** de todo texto y superficie opaca, **entero** en pantalla, en su mitad del día y debajo del navbar (borde superior ≥ 64 + 32px; `NAVBAR` en `lib/sunPath.ts`); si no hay zona, saltea la sección por el margen. En **Sobre mí** se estaciona en el ancla `[data-sun-anchor="about"]`: detrás del arco del retrato (la foto lo tapa), asomando por su hombro superior derecho con ~43% del disco a la vista, ≥48px del título y del texto (el ancla es estática bajo reduced motion). Entre capítulos viaja solo por blanco con MotionPath `sine.inOut`. **Desde Sobre mí solo baja**: un único descenso, lineal en el scroll y más rápido que la página (`SINK` = 1.3 px de documento por px de scroll, así baja también en el viewport, sin saltos ni subidas). Desde 1280px: sale hacia el margen izquierdo antes de Contacto, vuelve a entrar bajo el texto de la columna izquierda de Contacto y baja recto por el carril entre el logo y las redes hasta ponerse en el mar (x con smoothstep entre puntos, y lineal). Contacto ya no es estacionamiento. Entre 768 y 1279: sale por su lado bajando (detrás del retrato), desciende fuera de vista y entra bajo el texto del footer para ponerse. **Móvil (<768)**: nunca cruza ni acompaña texto. Sale del hero hacia la derecha, asoma (40% del disco, cortado por el borde) desde la derecha en la banda vacía entre Mi enfoque y Servicios y desde la izquierda entre Servicios y Sobre mí (≤112px, ≥48px de todo texto; el cambio de lado ocurre fuera de vista, con el disco transparente), y al final entra desde la izquierda, bajando un poco, para ponerse en el mar del footer. Nunca se estaciona bajo el navbar.

**Movimiento**: (1) intro del hero, una vez (~1.8s): cada fila del mar se dibuja desde su centro hacia afuera (DrawSVG), escalonada desde la fila del medio, mientras el sol sube desde detrás de las olas (`expo.out`). (2) Scroll: el viaje del sol (sube y se achica hacia la zona libre de Mi enfoque, mediodía en Servicios, baja y se calienta en Sobre mí, se pone en el mar del footer) y, con él, el papel del día (mañana → mediodía → tarde → anochecer, un solo tween). (3) El mar del footer y las marcas se dibujan una vez al entrar (≤0.8s; la marca va de adentro hacia afuera, 0.6s `power2.out`). Nada se mueve en bucle y nada anima bajo texto. Solo transforms, opacity y attr. Con reduced motion no hay sol viajero ni papel que cambia ni entradas: un mediodía estático, los soles estáticos del hero, de Sobre mí (detrás del arco, desde 768px) y del footer (los mismos anclas, visibles solo en ese modo) y todo dibujado.

**Contacto**: la columna izquierda es la invitación (título, lead "¡Estoy aquí para ti!" y una línea de ayuda en `muted`, "Si prefieres, déjame tu número de teléfono…"); el formulario a la derecha desde 1280px. Las redes viven una sola vez, en el footer.

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

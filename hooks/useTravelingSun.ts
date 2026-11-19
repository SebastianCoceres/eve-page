import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { CLEARANCE, NAVBAR, findZone, parkedScroll, route, type Point, type Rect, type Zone } from "@/lib/sunPath";
import { getHeroPinRange } from "@/hooks/useHeroAnimation";
import { getEmakiPinRange } from "@/hooks/useEmakiScroll";

const docRect = (element: Element): Rect => {
    const r = element.getBoundingClientRect();
    return { l: r.left, t: r.top + window.scrollY, r: r.right, b: r.bottom + window.scrollY };
};

/**
 * Hidden from assistive tech and from the sun's clearance alike, except the pieces
 * of a split text (SplitText `aria: "auto"` hides the pieces and labels the parent):
 * those are real, visible words.
 */
const isDecorative = (element: Element) => {
    if (element.closest(".sr-only")) return true;
    const hidden = element.closest("[aria-hidden='true']");
    return Boolean(hidden && !hidden.closest("[aria-label]"));
};

/**
 * Every text line and opaque surface the sun must keep clear of, in document
 * coordinates. The hero is left out: it pins, and its own choreography keeps the
 * sun clear of its text (see Hero and the hero leg below).
 */
function collectObstacles(): Rect[] {
    const rects: Rect[] = [];
    document.querySelectorAll("main, footer").forEach((scope) => {
        const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
        let node: Node | null;
        while ((node = walker.nextNode())) {
            const parent = node.parentElement;
            if (!node.textContent?.trim() || !parent || isDecorative(parent) || parent.closest("#home")) continue;
            const range = document.createRange();
            range.selectNodeContents(node);
            // A heading line that has not risen yet (TextReveal) is measured where it will rest.
            const line = parent.closest<HTMLElement>(".split-line");
            const shift = line ? Number(gsap.getProperty(line, "y")) + (Number(gsap.getProperty(line, "yPercent")) / 100) * line.offsetHeight : 0;
            for (const r of range.getClientRects()) {
                rects.push({ l: r.left, t: r.top + window.scrollY - shift, r: r.right, b: r.bottom + window.scrollY - shift });
            }
        }
        // The emakimono's fans are drawn on the sky: never under the sun either.
        scope.querySelectorAll("input, textarea, button, [role='combobox'], .bg-surface, [data-section-mark], [data-emaki-fan]").forEach((element) => {
            if (!element.closest("#home")) rects.push(docRect(element));
        });
    });
    return rects;
}

// Where the day should be in each chapter: x as a fraction of the viewport width
// (east to west), how high in the viewport the sun sits when it arrives, and its
// size by time of day: smallest at midday, larger toward the horizon (as a low
// sun looks). Sizes are tried largest first and shrink only to fit a free zone.
// A chapter with an `anchor` parks on that element instead of a computed zone:
// in Sobre mí the afternoon sun becomes the disc behind Eve's portrait. Contacto is
// not a parking spot: from Sobre mí the sun only goes down (see the descent below).
const CHAPTERS: ReadonlyArray<{ id: string; targetX: number; height: number; sizes: number[]; anchor?: string }> = [
    { id: "focus", targetX: 0.82, height: 0.3, sizes: [180, 150, 120] },
    { id: "services", targetX: 0.72, height: 0.26, sizes: [150, 130, 110] },
    { id: "about", targetX: 0.2, height: 0.42, sizes: [200, 170, 140, 120], anchor: "about" },
];

/**
 * The descent's slowest vertical speed, in document px per scroll px: above 1,
 * so the sun keeps sinking in the viewport even where it moves most sideways.
 */
const SINK = 1.06;

/** Share of the hero pin over which the sun climbs (done before the greeting's second line); it then rides the pin at rest. */
const HERO_RISE = 0.4;

type Leg = {
    points: Point[];
    zone: Zone;
    at: number;
    hidden?: boolean;
    /** MotionPath curviness (default 0.6); lower keeps a corner tight against a band. */
    curviness?: number;
    /** A leg driven by a function of the scroll position (document px) instead of a motion path. */
    track?: (scroll: number) => Zone;
};

const smooth = (t: number) => t * t * (3 - 2 * t);
const sine = (t: number) => (1 - Math.cos(Math.PI * Math.min(1, Math.max(0, t)))) / 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * A path that only goes down, timed over `window` scroll px. Its shape is x as a
 * function of y: x eases between the keys (smoothstep, so it never kinks) and
 * the size follows y. It is walked at one even speed along its length, except
 * where that would sink slower than SINK (the most sideways stretches), which
 * are hurried just enough: so the sun never rises in the viewport and never
 * lurches. The even speed is solved so the whole walk fills the window.
 */
function descentTrack(keys: Zone[], window: number) {
    const first = keys[0];
    const last = keys[keys.length - 1];
    const shape = (y: number): Zone => {
        let i = 0;
        while (i < keys.length - 2 && y > keys[i + 1].y) i++;
        const a = keys[i];
        const b = keys[i + 1];
        const t = b.y > a.y ? Math.min(1, Math.max(0, (y - a.y) / (b.y - a.y))) : 1;
        const d = first.d + (last.d - first.d) * ((y - first.y) / Math.max(1, last.y - first.y));
        return { x: a.x + (b.x - a.x) * smooth(t), y, d };
    };
    // Samples every 4px of height: drop and length of each step.
    const steps: Array<{ y: number; dy: number; dl: number }> = [];
    let previous = shape(first.y);
    for (let y = first.y + 4; ; y += 4) {
        const point = shape(Math.min(y, last.y));
        steps.push({ y: point.y, dy: point.y - previous.y, dl: Math.hypot(point.x - previous.x, point.y - previous.y) });
        previous = point;
        if (point.y >= last.y) break;
    }
    const duration = (speed: number) => steps.reduce((sum, step) => sum + Math.min(step.dl / speed, step.dy / SINK), 0);
    // Bisection on the even speed (the walk's duration falls as the speed rises).
    let lo = 0.01;
    let hi = 100;
    for (let i = 0; i < 50; i++) {
        const mid = (lo + hi) / 2;
        if (duration(mid) > window) lo = mid; else hi = mid;
    }
    const speed = hi;
    const times: number[] = [0];
    for (const step of steps) times.push(times[times.length - 1] + Math.min(step.dl / speed, step.dy / SINK));
    const total = times[times.length - 1] || 1;
    return (progress: number): Zone => {
        const target = progress * total;
        let low = 0;
        let high = times.length - 1;
        while (high - low > 1) {
            const mid = (low + high) >> 1;
            if (times[mid] < target) low = mid; else high = mid;
        }
        const y0 = low === 0 ? first.y : steps[low - 1].y;
        const y1 = steps[high - 1].y;
        const t = times[high] > times[low] ? (target - times[low]) / (times[high] - times[low]) : 0;
        return shape(y0 + (y1 - y0) * t);
    };
}

/**
 * "El viaje del sol": one sun crosses the page along a day's arc, east to west.
 *
 * The sun is a document-level layer (behind main and footer) whose path is
 * computed from the real layout on every resize and every ScrollTrigger refresh
 * (pin spacers included). It is the only owner of the sun: the pinned chapters
 * (hero, emakimono) do not move it; their pin ranges become legs of its one
 * timeline, where a pinned position is a viewport position plus the scroll.
 *
 * From 768px:
 * - hero pin: the sun rises from the hero anchor, out of the sea, to the
 *   `hero-high` anchor in the upper right, shrinking as it climbs, then rides
 *   the rest of the pin at rest;
 * - Mi enfoque: it parks in the section's free zone (at least 48px from any text,
 *   fully below the navbar; see lib/sunPath), travelling only through whitespace
 *   (out to the side margin, along it, across the gap, in; MotionPath sine.inOut);
 * - emakimono (pinned from 1024px): it slides into the sky band from the right as
 *   the pin begins and crosses it east to west for the whole unroll, above the
 *   horizon and below the heading, behind the fans, never over panel text; it
 *   leaves by the west edge as the pin ends;
 * - out of view, it comes down the west margin to the height of the disc behind
 *   Eve's portrait and slides in behind her from the west: a calm leg whose
 *   visible part is one horizontal glide (narrower: the classic margin route);
 * - Sobre mí: it parks exactly as that disc (`[data-sun-anchor="about"]`);
 * - from there it only sinks: one continuous descent, linear in scroll and faster
 *   than the page (SINK), so it moves down the viewport the whole way. From
 *   1280px it slips out from behind her to the left margin before Contacto,
 *   comes back in under Contacto's left column, and goes straight down between
 *   the footer's logo and socials into the sea. Narrower, it leaves by its side
 *   margin, sinks out of view and slides in low, under the footer text, to set.
 * One ScrollTrigger maps scroll to the whole journey without smoothing (scrub
 * true), so a pinned chapter and the sun never drift apart.
 *
 * Phones (<768px): never beside text. After rising in the hero it slides out to
 * the right; it peeks in from the right edge in the empty band between Mi
 * enfoque and Servicios; it switches sides out of view and slides in from the
 * west behind Eve's portrait, parks as its disc, slides back out to the west
 * and finally sets in the footer sea.
 * Reduced motion: never runs; the static anchors show instead.
 */
export function useTravelingSun() {
    const scope = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const root = scope.current;
        const disc = root?.querySelector<HTMLElement>("[data-sun-disc]");
        if (!root || !disc) return;

        const mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", () => {
            let timeline: gsap.core.Timeline | null = null;
            let trigger: ScrollTrigger | null = null;
            let introPlayed = false;

            const build = () => {
                trigger?.kill();
                timeline?.kill();
                const heroAnchor = document.querySelector('[data-sun-anchor="hero"]');
                const highAnchor = document.querySelector('[data-sun-anchor="hero-high"]');
                const footerAnchor = document.querySelector('[data-sun-anchor="footer"]');
                const hero = document.getElementById("home");
                if (!heroAnchor || !footerAnchor || !hero) return;

                const vh = window.innerHeight;
                const vw = document.documentElement.clientWidth;
                const maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
                const contentLeft = vw >= 1280 ? (vw - 1200) / 2 : 40;
                const contentRight = vw - contentLeft;

                const anchorZone = (element: Element): Zone => {
                    const r = docRect(element);
                    return { x: (r.l + r.r) / 2, y: (r.t + r.b) / 2, d: r.r - r.l };
                };
                // A pinned element's centre in the viewport while its section is pinned
                // with its top at `top` (the pinned section and the element move together).
                const pinnedZone = (element: Element, section: Element, top: number): Zone => {
                    const r = element.getBoundingClientRect();
                    const s = section.getBoundingClientRect();
                    return { x: (r.left + r.right) / 2, y: top + (r.top + r.bottom) / 2 - s.top, d: r.width };
                };

                const heroPin = getHeroPinRange();
                const heroRise = heroPin && highAnchor ? {
                    from: pinnedZone(heroAnchor, hero, NAVBAR),
                    to: pinnedZone(highAnchor, hero, NAVBAR),
                } : null;
                const start: Zone = heroPin && heroRise
                    ? { ...heroRise.from, y: heroRise.from.y + heroPin.start }
                    : anchorZone(heroAnchor);
                const end = anchorZone(footerAnchor);
                const base = start.d;

                // The layer is sized to the hero sun; every state is translate + scale.
                gsap.set(root, { width: base, height: base, opacity: 1 });
                const place = (p: Point) => ({ x: p.x - base / 2, y: p.y - base / 2 });

                const legs: Leg[] = [];
                const obstacles = collectObstacles();
                const inside = (rect: Rect) => obstacles.filter((o) => o.t >= rect.t && o.b <= rect.b);
                const textTop = (rect: Rect) => Math.min(rect.b, ...inside(rect).map((o) => o.t));
                const textBottom = (rect: Rect) => Math.max(rect.t, ...inside(rect).map((o) => o.b));
                const aboutAnchor = document.querySelector('[data-sun-anchor="about"]');
                const about = aboutAnchor && aboutAnchor.getBoundingClientRect().width > 0 ? anchorZone(aboutAnchor) : null;

                if (vw >= 768) {
                    let previous: Zone = start;
                    // The hero's box in the flow: its pin spacer when pinned.
                    const heroBox = hero.parentElement?.classList.contains("pin-spacer") ? hero.parentElement : hero;
                    let previousRect = docRect(heroBox);
                    let previousTime = 0;

                    // 1. The sunrise, over the hero pin: out of the sea up to the high anchor.
                    if (heroPin && heroRise) {
                        const { from, to } = heroRise;
                        const span = Math.max(1, heroPin.end - heroPin.start);
                        legs.push({
                            points: [],
                            zone: { ...to, y: to.y + heroPin.end },
                            at: heroPin.end,
                            track: (scroll) => {
                                const t = sine((scroll - heroPin.start) / (span * HERO_RISE));
                                return { x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t) + scroll, d: lerp(from.d, to.d, t) };
                            },
                        });
                        previous = { ...to, y: to.y + heroPin.end };
                        previousTime = heroPin.end;
                    }

                    const emakiPin = vw >= 1024 ? getEmakiPinRange() : null;
                    let fromWestEdge: Zone | null = null;

                    for (const chapter of CHAPTERS) {
                        const section = document.getElementById(chapter.id);
                        if (!section) continue;
                        const sectionBox = section.parentElement?.classList.contains("pin-spacer") ? section.parentElement : section;
                        const rect = docRect(sectionBox);

                        // 2. The emakimono: one chapter, its sky band crossed east to west.
                        if (chapter.id === "services" && emakiPin) {
                            const track = section.querySelector("[data-emaki-track]");
                            const horizon = section.querySelector("[data-emaki-horizon]");
                            const heading = section.querySelector("[data-emaki-heading]");
                            if (track && horizon && heading) {
                                const s = section.getBoundingClientRect();
                                const skyTop = track.getBoundingClientRect().top - s.top;
                                const horizonY = horizon.getBoundingClientRect().top - s.top;
                                const headingBottom = heading.getBoundingClientRect().bottom - s.top;
                                const top = Math.max(skyTop + 4, headingBottom + CLEARANCE);
                                // Clear of the horizon by 24px, so the panel titles below it stay 48px+ away.
                                const d = Math.max(64, Math.min(150, horizonY - 24 - top));
                                const skyY = top + d / 2;
                                const xIn = Math.min(vw * 0.78, vw - d / 2 - 24);
                                const xOut = -d / 2 - 8;
                                const span = Math.max(1, emakiPin.end - emakiPin.start);
                                const zoneIn: Zone = { x: xIn, y: skyY + emakiPin.start, d };
                                const gapY = Math.min(zoneIn.y, Math.max(previous.y, (textBottom(previousRect) + textTop(rect)) / 2));
                                legs.push({
                                    points: route(previous, zoneIn, gapY, vw, contentLeft, contentRight),
                                    zone: zoneIn,
                                    at: Math.max(previousTime + 1, emakiPin.start),
                                    // A tight last corner: it enters the sky level, never dipping toward the panels.
                                    curviness: 0.2,
                                });
                                legs.push({
                                    points: [],
                                    zone: { x: xOut, y: skyY + emakiPin.end, d },
                                    at: emakiPin.end,
                                    track: (scroll) => ({
                                        x: lerp(xIn, xOut, sine((scroll - emakiPin.start) / span)),
                                        y: skyY + scroll,
                                        d,
                                    }),
                                });
                                previous = { x: xOut, y: skyY + emakiPin.end, d };
                                previousRect = rect;
                                previousTime = emakiPin.end;
                                fromWestEdge = previous;
                                continue;
                            }
                        }

                        const anchored = chapter.anchor ? about : null;
                        const zone = anchored ?? findZone({
                            section: rect,
                            obstacles,
                            viewportWidth: vw,
                            viewportHeight: vh,
                            targetX: chapter.targetX,
                            sizes: [...chapter.sizes],
                        });
                        if (!zone) continue;
                        const at = Math.min(maxScroll - 1, Math.max(previousTime + 1, parkedScroll(zone, chapter.height, vh)));

                        // 3. After the emakimono: down the west margin out of view, then one
                        // horizontal glide in behind Eve's portrait.
                        if (anchored && fromWestEdge) {
                            const edge: Zone = { x: -zone.d / 2 - 4, y: zone.y, d: zone.d };
                            const glide = Math.min(vh * 0.55, Math.max(1, (at - previousTime) * 0.6));
                            legs.push({ points: [previous, edge], zone: edge, at: Math.max(previousTime + 1, at - glide) });
                            legs.push({ points: [edge, zone], zone, at });
                        } else {
                            const gapY = Math.min(zone.y, Math.max(previous.y, (textBottom(previousRect) + textTop(rect)) / 2));
                            legs.push({ points: route(previous, zone, gapY, vw, contentLeft, contentRight), zone, at });
                        }
                        previous = zone;
                        previousRect = rect;
                        previousTime = at;
                    }
                    // 4. It rests as the portrait's disc for a while (moving with her), then
                    // slides out from behind her, west, at the same height, easing to the
                    // sunset's size on the way, before it sinks.
                    if (about && previous === about) {
                        const hold = Math.min(maxScroll - 3, previousTime + vh * 0.25);
                        const out: Zone = { x: contentLeft - CLEARANCE - end.d / 2, y: about.y, d: end.d };
                        const slideAt = Math.min(maxScroll - 2, hold + vh * 0.35);
                        legs.push({ points: [about, about], zone: about, at: hold });
                        legs.push({ points: [about, out], zone: out, at: slideAt });
                        previous = out;
                        previousTime = slideAt;
                    }
                    // The last way down: it never rises again after the last park.
                    const dMax = Math.max(previous.d, end.d);
                    const below = (y: number, xMin: number, xMax: number) => Math.min(
                        Infinity,
                        ...obstacles.filter((o) => o.t > y && o.l < xMax + CLEARANCE && o.r > xMin - CLEARANCE).map((o) => o.t),
                    );
                    const sink = (keys: Zone[]) => {
                        // Leaves the park almost at once, while it is still well in view.
                        const begin = Math.min(maxScroll - 2, previousTime + vh * 0.04);
                        legs.push({ points: [previous, previous], zone: previous, at: begin });
                        const walk = descentTrack(keys, maxScroll - begin);
                        legs.push({ points: [], zone: end, at: maxScroll, track: (scroll) => walk((scroll - begin) / Math.max(1, maxScroll - begin)) });
                    };
                    let planned = false;
                    const contact = document.getElementById("contact");
                    if (vw >= 1280 && contact) {
                        const r = dMax / 2;
                        const mx = contentLeft - CLEARANCE - r;
                        // Out to the margin (from behind the portrait) before anything below it in its column.
                        const y1 = below(previous.y, mx - r, Math.max(previous.x, end.x) + r) - CLEARANCE - r;
                        // Back in under Contacto's left column, then down the footer's open lane.
                        const contactRect = docRect(contact);
                        const leftText = obstacles.filter((o) => o.t >= contactRect.t && o.b <= contactRect.b && o.l < end.x + r + CLEARANCE);
                        const y2 = Math.max(contactRect.t, ...leftText.map((o) => o.b)) + CLEARANCE + r;
                        const y3 = Math.min(y2 + 360, below(y2, mx - r, end.x + r) - CLEARANCE - r);
                        if (y1 > previous.y + 40 && y2 > y1 && y3 - y2 >= 160 && end.y > y3) {
                            sink([
                                previous,
                                { x: mx, y: y1, d: previous.d },
                                { x: mx, y: y2, d: previous.d },
                                { x: end.x, y: y3, d: end.d },
                                end,
                            ]);
                            planned = true;
                        }
                    }
                    if (!planned) {
                        // Out by its own side, down out of view, and in low under the footer text.
                        const side = previous.x < vw / 2 ? "left" : "right";
                        const outX = (which: "left" | "right") => (which === "left" ? -dMax / 2 - 4 : vw + dMax / 2 + 4);
                        const low = end.y - 12;
                        const slide = Math.min(vh * 0.35, (maxScroll - previousTime) / 3);
                        // Leaves sinking (from behind the portrait, never toward text below it).
                        const r = dMax / 2;
                        const exitY = Math.max(previous.y, Math.min(
                            previous.y + vh * 0.3 * SINK,
                            below(previous.y, Math.min(outX(side), previous.x) - r, Math.max(outX(side), previous.x) + r) - CLEARANCE - r,
                        ));
                        const outAt = Math.min(maxScroll - slide - 2, previousTime + Math.max(vh * 0.25, (exitY - previous.y) / SINK));
                        legs.push({ points: [previous, { x: outX(side), y: exitY }], zone: { ...previous, x: outX(side), y: exitY }, at: Math.max(previousTime + 1, outAt) });
                        legs.push({ points: [{ x: outX(side), y: exitY }, { x: outX(side), y: low }], zone: { x: outX(side), y: low, d: end.d }, at: maxScroll - slide - 1 });
                        if (side === "right") {
                            legs.push({ points: [{ x: outX("right"), y: low }, { x: outX("left"), y: low }], zone: { x: outX("left"), y: low, d: end.d }, at: maxScroll - slide, hidden: true });
                        }
                        legs.push({ points: [{ x: outX("left"), y: low }, end], zone: end, at: maxScroll });
                    }
                } else {
                    // Phones: peeks and the portrait's disc only, never beside text.
                    let time = 0;
                    let from: Zone = start;
                    const hop = (zone: Zone, when: number, hidden = false) => {
                        const t = Math.min(maxScroll - 1, Math.max(time + 1, when));
                        legs.push({ points: [{ x: from.x, y: from.y }, { x: zone.x, y: zone.y }], zone, at: t, hidden });
                        from = zone;
                        time = t;
                    };
                    // Wholly out of view past an edge, or 40% of the disc in view.
                    const out = (side: "left" | "right", y: number, d: number): Zone =>
                        ({ x: side === "right" ? vw + d / 2 + 4 : -d / 2 - 4, y, d });
                    const peek = (side: "left" | "right", y: number, d: number): Zone =>
                        ({ x: side === "right" ? vw + d * 0.1 : -d * 0.1, y, d });

                    // Leaves the hero sideways, toward the edge it rose from.
                    hop(out("right", start.y, start.d), vh * 0.35);
                    // East, between Mi enfoque and Servicios.
                    const a = document.getElementById("focus");
                    const b = document.getElementById("services");
                    if (a && b) {
                        const top = textBottom(docRect(a));
                        const bottom = textTop(docRect(b));
                        const d = Math.min(112, bottom - top - 2 * CLEARANCE);
                        if (d >= 64) {
                            const y = (top + bottom) / 2;
                            hop(out("right", y, d), y - vh * 0.85);
                            hop(peek("right", y, d), y - vh * 0.6);
                            hop(peek("right", y, d), y - vh * 0.42);
                            hop(out("right", y, d), y - vh * 0.28);
                        }
                    }
                    let side: "left" | "right" = "right";
                    // West: slides in behind Eve's portrait, parks as its disc, slides back out.
                    if (about) {
                        hop(out("left", about.y, about.d), about.y - vh * 1.05, true);
                        hop(about, parkedScroll(about, 0.42, vh));
                        hop(about, about.y - vh * 0.3);
                        hop(out("left", about.y, about.d), about.y - vh * 0.05);
                        side = "left";
                    }
                    // Sets on the left (west): out of view down to the sea, then in, sinking a little.
                    hop(out("left", end.y - 12, end.d), maxScroll - vh * 0.35, side !== "left");
                    legs.push({ points: [{ x: from.x, y: from.y }, { x: end.x, y: end.y }], zone: end, at: maxScroll });
                }

                // Exposed for layout checks: the scroll position at which each keyframe lands.
                root.dataset.keyframes = legs.map((leg) => Math.round(leg.at)).join(",");

                timeline = gsap.timeline({ paused: true, defaults: { ease: "sine.inOut" } });
                timeline.set(root, { ...place(start), scale: 1 }, 0);
                let time = 0;
                for (const leg of legs) {
                    const duration = Math.max(1, leg.at - time);
                    // A hidden leg switches sides out of view: the disc is transparent on the way.
                    if (leg.hidden) timeline.set(root, { opacity: 0 }, time);
                    const track = leg.track;
                    if (track) {
                        const from = time;
                        const proxy = { scroll: from };
                        timeline.fromTo(proxy, { scroll: from }, {
                            scroll: from + duration,
                            duration,
                            ease: "none",
                            onUpdate: () => {
                                const zone = track(proxy.scroll);
                                gsap.set(root, { ...place(zone), scale: zone.d / base });
                            },
                        }, time);
                    } else {
                        timeline.to(root, {
                            motionPath: { path: leg.points.map(place), curviness: leg.curviness ?? 0.6 },
                            scale: leg.zone.d / base,
                            duration,
                        }, time);
                    }
                    if (leg.hidden) timeline.set(root, { opacity: 1 }, time + duration);
                    time += duration;
                }
                // The colour warms with the paper's day (--sun-now, usePaperDay).
                // Timeline seconds equal scroll pixels.
                if (timeline.duration() < maxScroll) timeline.set({}, {}, maxScroll);

                // No scrub smoothing: a pinned chapter's position is exact, so the sun stays in step.
                trigger = ScrollTrigger.create({ start: 0, end: maxScroll, scrub: true, animation: timeline });
                timeline.progress(window.scrollY / maxScroll);

                if (!introPlayed) {
                    introPlayed = true;
                    // Rises out of the hero sea, with the name and the sea's ink (one gesture).
                    gsap.from(disc, { yPercent: 60, duration: 1.4, delay: 0.15, ease: "expo.out" });
                }
            };

            build();
            let frame = 0;
            const schedule = () => {
                cancelAnimationFrame(frame);
                frame = requestAnimationFrame(build);
            };
            let lastHeight = document.documentElement.scrollHeight;
            let lastWidth = document.documentElement.clientWidth;
            const observer = new ResizeObserver(() => {
                const height = document.documentElement.scrollHeight;
                const width = document.documentElement.clientWidth;
                if (height === lastHeight && width === lastWidth) return;
                lastHeight = height;
                lastWidth = width;
                schedule();
            });
            observer.observe(document.body);
            // Pins (hero, emakimono) are measured on refresh: rebuild with their ranges.
            ScrollTrigger.addEventListener("refresh", schedule);

            return () => {
                observer.disconnect();
                ScrollTrigger.removeEventListener("refresh", schedule);
                cancelAnimationFrame(frame);
                trigger?.kill();
                timeline?.kill();
            };
        });

        return () => mm.revert();
    }, { scope });

    return scope;
}

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { CLEARANCE, NAVBAR, findZone, parkedScroll, route, type Point, type Rect, type Zone } from "@/lib/sunPath";
import { getHeroPinRange } from "@/hooks/useHeroAnimation";
import { getEmakiPinRange } from "@/hooks/useEmakiScroll";
import { FOCUS_PIN_TOP, FOCUS_SCENE, getFocusPinRange } from "@/hooks/useFocusScene";

const docRect = (element: Element): Rect => {
    const r = element.getBoundingClientRect();
    return { l: r.left, t: r.top + window.scrollY, r: r.right, b: r.bottom + window.scrollY };
};

/**
 * A sticky block's travel (Sobre mí's left column, `[data-sun-sticky]`, which
 * rests at the top of its grid cell): how far it has moved down its cell now and
 * at most (px), and the scroll range over which it moves. Null when it is not
 * sticky at this width.
 */
type StickyTravel = { now: number; total: number; start: number; end: number };
function stickyTravel(sticky: HTMLElement | null): StickyTravel | null {
    const cell = sticky?.parentElement;
    if (!sticky || !cell) return null;
    const style = getComputedStyle(sticky);
    if (style.position !== "sticky") return null;
    const top = parseFloat(style.top) || 0;
    const c = docRect(cell);
    const total = Math.max(0, c.b - c.t - sticky.offsetHeight);
    const now = sticky.getBoundingClientRect().top - cell.getBoundingClientRect().top;
    return { now, total, start: c.t - top, end: c.t - top + total };
}

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
 * sun clear of its text (see Hero and the hero leg below). Text in a sticky block
 * is measured where it rests once the block has travelled its whole cell (where
 * it stays for everything after it, like the descent).
 */
function collectObstacles(): Rect[] {
    const rects: Rect[] = [];
    const travels = new Map<Element, number>();
    const stickyShift = (element: Element) => {
        const sticky = element.closest<HTMLElement>("[data-sun-sticky]");
        if (!sticky) return 0;
        if (!travels.has(sticky)) {
            const travel = stickyTravel(sticky);
            travels.set(sticky, travel ? travel.total - travel.now : 0);
        }
        return travels.get(sticky) ?? 0;
    };
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
            const shift = (line ? Number(gsap.getProperty(line, "y")) + (Number(gsap.getProperty(line, "yPercent")) / 100) * line.offsetHeight : 0) - stickyShift(parent);
            for (const r of range.getClientRects()) {
                rects.push({ l: r.left, t: r.top + window.scrollY - shift, r: r.right, b: r.bottom + window.scrollY - shift });
            }
        }
        // The emakimono's fans are drawn on the sky: never under the sun either.
        scope.querySelectorAll("input, textarea, button, [role='combobox'], .bg-surface, [data-section-mark], [data-emaki-fan], [data-chapter-mark]").forEach((element) => {
            if (element.closest("#home")) return;
            const r = docRect(element);
            const shift = stickyShift(element);
            rects.push({ ...r, t: r.t + shift, b: r.b + shift });
        });
    });
    return rects;
}

// Where the day should be in each chapter: x as a fraction of the viewport width
// (east to west), how high in the viewport the sun sits when it arrives, and its
// size by time of day: smallest at midday, larger toward the horizon (as a low
// sun looks). Sizes are tried largest first and shrink only to fit a free zone.
// A chapter with an `anchor` parks on that element instead of a computed zone:
// in Sobre mí the afternoon sun becomes the disc standing on the band. Contacto is
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
/** Share of the Mi enfoque pin over which the sun climbs beside the problem (done before the crossing). */
const FOCUS_PROBLEM_RISE = FOCUS_SCENE.CROSS[0];
/** How far the parked sun sinks into the Sobre mí band while the text is read, as a share of its diameter (the paper strip under the band hides it). */
const PARK_SINK = 0.12;

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
 * - Mi enfoque, pinned from 1024px (two acts, see useFocusScene): it comes in from
 *   the right margin as the pin begins and stands right of the problem (48px+
 *   from its text), climbing a little; as the problem steps back it crosses the
 *   sky to the left in one arc (FOCUS_SCENE.CROSS) and stands left of the answer
 *   until the unpin, then leaves by the west edge at its height. Not pinned
 *   (768–1023px or a stage too tall), it parks in the section's free zone (at
 *   least 48px from any text, fully below the navbar; see lib/sunPath),
 *   travelling only through whitespace (out to the side margin, along it, across
 *   the gap, in; MotionPath sine.inOut);
 * - emakimono (pinned from 1024px): it slides into the sky band from the right as
 *   the pin begins (from Mi enfoque's west it crosses out of view, transparent,
 *   never west to east in view) and crosses it east to west for the whole
 *   unroll, above the horizon and below the heading, behind the fans, never over
 *   panel text; it leaves by the west edge as the pin ends;
 * - out of view, it comes down the west margin to the height of the
 *   afternoon sun's disc in Sobre mí and slides in from the west: a calm leg whose
 *   visible part is one horizontal glide (narrower: the classic margin route);
 * - Sobre mí: it parks exactly as that disc (`[data-sun-anchor="about"]`);
 * - from there it only sinks: one continuous descent, linear in scroll and faster
 *   than the page (SINK), so it moves down the viewport the whole way. From
 *   1280px it slips out from its column to the left margin before Contacto,
 *   comes back in under Contacto's left column, and goes straight down between
 *   the footer's logo and socials into the sea. Narrower, it leaves by its side
 *   margin, sinks out of view and slides in low, under the footer text, to set.
 * One ScrollTrigger maps scroll to the whole journey without smoothing (scrub
 * true), so a pinned chapter and the sun never drift apart.
 *
 * Phones (<768px): never beside text. After rising in the hero it slides out to
 * the right; it peeks in from the right edge in the empty band between Mi
 * enfoque and Servicios; it switches sides out of view and slides in from the
 * west to the Sobre mí disc, parks as it, slides back out to the west
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
                // Sobre mí's left column is sticky from 1280px: the disc's place is a
                // function of the scroll. `about` is where it rests before the column sticks.
                const aboutTravel = aboutAnchor ? stickyTravel(aboutAnchor.closest<HTMLElement>("[data-sun-sticky]")) : null;
                const aboutRest = aboutAnchor && aboutAnchor.getBoundingClientRect().width > 0 ? anchorZone(aboutAnchor) : null;
                const about = aboutRest && aboutTravel ? { ...aboutRest, y: aboutRest.y - aboutTravel.now } : aboutRest;
                const aboutY = (scroll: number) => (about ? about.y : 0)
                    + (aboutTravel ? Math.min(aboutTravel.total, Math.max(0, scroll - aboutTravel.start)) : 0);
                let warmFrom = -1;
                let warmTo = -1;

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
                    const focusPin = getFocusPinRange();
                    let fromWestEdge: Zone | null = null;
                    let parkedAbout = false;

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
                                const enterAt = Math.max(previousTime + 1, emakiPin.start);
                                if (previous.x < vw / 2) {
                                    // From the west (Mi enfoque's answer): out by the west edge at its
                                    // height, across out of view (transparent), and in from the east
                                    // along the sky as the pin begins. Never west to east in view.
                                    const room = enterAt - previousTime;
                                    const exitAt = previousTime + Math.max(1, Math.min(vh * 0.3, room * 0.35));
                                    const inFrom = Math.max(exitAt + 1, enterAt - Math.min(vh * 0.35, room * 0.4));
                                    const westOut: Zone = { x: -previous.d / 2 - 8, y: previous.y, d: previous.d };
                                    const eastOut: Zone = { x: vw + d / 2 + 8, y: zoneIn.y, d };
                                    legs.push({ points: [previous, westOut], zone: westOut, at: exitAt });
                                    legs.push({ points: [westOut, eastOut], zone: eastOut, at: inFrom, hidden: true });
                                    legs.push({ points: [eastOut, zoneIn], zone: zoneIn, at: enterAt });
                                } else {
                                    const gapY = Math.min(zoneIn.y, Math.max(previous.y, (textBottom(previousRect) + textTop(rect)) / 2));
                                    legs.push({
                                        points: route(previous, zoneIn, gapY, vw, contentLeft, contentRight),
                                        zone: zoneIn,
                                        at: enterAt,
                                        // A tight last corner: it enters the sky level, never dipping toward the panels.
                                        curviness: 0.2,
                                    });
                                }
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

                        // 2a. Mi enfoque, pinned (from 1024px): two acts. It comes in from the
                        // right margin as the pin begins and stands right of the problem,
                        // climbing a little; as the problem steps back it crosses the sky to
                        // the left (one arc, through the room the acts leave), and stands left
                        // of the answer until the unpin.
                        const focusStage = chapter.id === "focus" && focusPin ? section.querySelector("[data-focus-stage]") : null;
                        const problemAct = focusStage?.querySelector("[data-focus-act='problem']");
                        const answerAct = focusStage?.querySelector("[data-focus-act='answer']");
                        if (focusPin && focusStage && problemAct && answerAct) {
                            // Horizontal text extents (the scene only moves its acts vertically).
                            const extent = (element: Element) => {
                                const range = document.createRange();
                                range.selectNodeContents(element);
                                return range.getBoundingClientRect();
                            };
                            const problemRight = extent(problemAct).right;
                            const answerLeft = extent(answerAct).left;
                            const stageTop = focusStage.getBoundingClientRect().top;
                            const heading = focusStage.querySelector("h2");
                            // The heading's bottom in the viewport while the stage is pinned.
                            const headingBottom = FOCUS_PIN_TOP + (heading ? heading.getBoundingClientRect().bottom - stageTop : 0);
                            const fits = (d: number) => problemRight + CLEARANCE + d / 2 <= vw - d / 2 - 8 && answerLeft - CLEARANCE - d / 2 >= d / 2 + 8;
                            const d = chapter.sizes.find(fits) ?? chapter.sizes[chapter.sizes.length - 1];
                            const east = Math.min(vw - d / 2 - 8, Math.max(problemRight + CLEARANCE + d / 2, vw * chapter.targetX));
                            const west = Math.max(d / 2 + 8, Math.min(answerLeft - CLEARANCE - d / 2, vw * (1 - chapter.targetX)));
                            // Midday: high, but whole under the navbar and 48px+ under the heading.
                            const high = Math.max(NAVBAR + 40 + d / 2, headingBottom + CLEARANCE + d / 2);
                            const rest = Math.max(high, vh * 0.42);
                            const low = Math.max(rest, Math.min(vh * 0.62, vh - 24 - d / 2));
                            const lift = Math.max(0, Math.min(vh * 0.06, rest - high));
                            const pin = focusPin;
                            const span = Math.max(1, pin.end - pin.start);
                            const [crossFrom, crossTo] = FOCUS_SCENE.CROSS;
                            const at = (scroll: number) => (scroll - pin.start) / span;
                            const zoneIn: Zone = { x: east, y: low + pin.start, d };
                            const gapY = Math.min(zoneIn.y, Math.max(previous.y, (textBottom(previousRect) + textTop(rect)) / 2));
                            legs.push({ points: route(previous, zoneIn, gapY, vw, contentLeft, contentRight), zone: zoneIn, at: Math.max(previousTime + 1, pin.start) });
                            legs.push({
                                points: [],
                                zone: { x: west, y: rest + pin.end, d },
                                at: pin.end,
                                track: (scroll) => {
                                    const p = at(scroll);
                                    const t = Math.min(1, Math.max(0, (p - crossFrom) / (crossTo - crossFrom)));
                                    const climb = sine(p / FOCUS_PROBLEM_RISE);
                                    return {
                                        x: lerp(east, west, sine(t)),
                                        // Climbs while the problem is told, arcs over the crossing.
                                        y: lerp(low, rest, climb) - lift * Math.sin(Math.PI * t) + scroll,
                                        d,
                                    };
                                },
                            });
                            previous = { x: west, y: rest + pin.end, d };
                            previousRect = rect;
                            previousTime = pin.end;
                            continue;
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
                        // horizontal glide in to the Sobre mí disc.
                        if (anchored && fromWestEdge) {
                            const glide = Math.min(vh * 0.55, Math.max(1, (at - previousTime) * 0.6));
                            const glideFrom = Math.max(previousTime + 1, at - glide);
                            const edge: Zone = { x: -zone.d / 2 - 4, y: aboutY(glideFrom), d: zone.d };
                            legs.push({ points: [previous, edge], zone: edge, at: glideFrom });
                            // One horizontal glide in, following the column if it already sticks.
                            legs.push({
                                points: [],
                                zone: { ...zone, y: aboutY(at) },
                                at,
                                track: (scroll) => ({
                                    x: lerp(edge.x, zone.x, sine((scroll - glideFrom) / Math.max(1, at - glideFrom))),
                                    y: aboutY(scroll),
                                    d: zone.d,
                                }),
                            });
                        } else {
                            const gapY = Math.min(zone.y, Math.max(previous.y, (textBottom(previousRect) + textTop(rect)) / 2));
                            legs.push({ points: route(previous, zone, gapY, vw, contentLeft, contentRight), zone, at });
                        }
                        previous = zone;
                        previousRect = rect;
                        previousTime = at;
                        if (anchored) parkedAbout = true;
                    }
                    // 4. It rests as the Sobre mí disc for a while (moving with its column), then
                    // slides out of the column, west, at the same height, easing to the
                    // sunset's size on the way, before it sinks.
                    // While the column sticks it stays locked to the disc, sinking a
                    // little (PARK_SINK) and warming (--sun-late) as the text is read.
                    if (about && parkedAbout) {
                        const parkFrom = previousTime;
                        const hold = Math.min(maxScroll - 3, Math.max(parkFrom + vh * 0.25, aboutTravel ? aboutTravel.end : 0));
                        const sink = about.d * PARK_SINK;
                        const sinking = (scroll: number) => sink * sine((scroll - parkFrom) / Math.max(1, hold - parkFrom));
                        const rest: Zone = { ...about, y: aboutY(hold) + sink };
                        legs.push({
                            points: [],
                            zone: rest,
                            at: hold,
                            track: (scroll) => ({ ...about, y: aboutY(scroll) + sinking(scroll) }),
                        });
                        warmFrom = parkFrom;
                        warmTo = hold;
                        const out: Zone = { x: contentLeft - CLEARANCE - end.d / 2, y: rest.y, d: end.d };
                        const slideAt = Math.min(maxScroll - 2, hold + vh * 0.35);
                        legs.push({ points: [rest, out], zone: out, at: slideAt });
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
                        // Out to the margin (from the parked disc) before anything below it in its column.
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
                        // Leaves sinking (from the parked disc, never toward text below it).
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
                    // Phones: peeks and the Sobre mí disc only, never beside text.
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
                    // West: slides in to the Sobre mí disc, parks as it, slides back out.
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
                // The colour warms with the paper's day (--sun-now, usePaperDay), and further,
                // to persimmon, while it rests in Sobre mí (--sun-late, see --color-sun-live).
                if (warmTo > warmFrom && warmFrom >= 0) {
                    timeline.fromTo(root, { "--sun-late": 0 }, { "--sun-late": 1, duration: warmTo - warmFrom, ease: "none" }, warmFrom);
                } else {
                    gsap.set(root, { "--sun-late": 0 });
                }
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

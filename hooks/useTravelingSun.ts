import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { CLEARANCE, SKY_TOP, docRect, findZone, parkedScroll, stickyTravel, type Point, type Rect, type Zone } from "@/lib/sunPath";
import { publishSunTrack } from "@/lib/sunTrack";
import { getHeroPinRange } from "@/hooks/useHeroAnimation";
import { getEmakiPinRange } from "@/hooks/useEmakiScroll";
import { FOCUS_PIN_TOP, FOCUS_SCENE, getFocusPinRange } from "@/hooks/useFocusScene";

/** Scroll px between two samples of the published sun track (lib/sunTrack). */
const TRACK_STEP = 4;

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
// in Sobre mí the afternoon sun becomes the whole disc under the heading. Contacto is
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
/** Where the sun arrives at the Sobre mí disc, as a share of the viewport height, when its column does not stick (below 1280px). */
const ABOUT_LOOSE_HEIGHT = 0.62;
/** How far the sun sinks while it crosses Mi enfoque's sky, as a share of the viewport height (the afternoon begins). */
const FOCUS_SINK = 0.04;
/**
 * Between chapters the sun waits at a side edge: its centre this share of its
 * diameter past the edge (40% of the disc in view; 20% on phones, whose gutter is
 * narrow).
 */
const PEEK = { wide: 0.1, narrow: 0.3 };

type Leg = {
    points: Point[];
    zone: Zone;
    at: number;
    /** A leg driven by a function of the scroll position (document px) instead of a motion path. */
    track?: (scroll: number) => Zone;
};

const smooth = (t: number) => t * t * (3 - 2 * t);
const sine = (t: number) => (1 - Math.cos(Math.PI * Math.min(1, Math.max(0, t)))) / 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Half sine, half even: eased ends with a peak speed only 1.29 times the mean (sine's is 1.57). */
const gentle = (t: number) => (Math.min(1, Math.max(0, t)) + sine(t)) / 2;

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
 * "El viaje del sol": one sun crosses the page along a day's arc, east to west,
 * and never leaves the screen.
 *
 * The sun is a fixed, viewport-sized layer (behind main and footer) whose path is
 * computed in document coordinates from the real layout on every resize and every
 * ScrollTrigger refresh (pin spacers included). It is the only owner of the sun:
 * the pinned chapters (hero, Mi enfoque, emakimono) do not move it; their pin
 * ranges become legs of its one timeline, where a pinned position is a viewport
 * position plus the scroll.
 *
 * Calm and always in view: it rises once (the hero sunrise, while the hero sea
 * dissolves under it) and never bobs after that. Inside a chapter it holds or
 * moves one slow way; between chapters (`passage`) it moves sideways to its side
 * edge in the frame of the chapter it leaves and waits there as a crescent (PEEK:
 * 40% of the disc in view, 20% on phones), held in the viewport, changing height
 * slowly while the page scrolls past, then comes in sideways in the frame of the
 * chapter it reaches. To change sides between chapters it climbs to the top edge,
 * crosses along it (a crescent) and comes down the other edge.
 *
 * From 768px:
 * - hero pin: the sun rises from the hero anchor to the `hero-high` anchor in the
 *   upper right, shrinking as it climbs, then rides the rest of the pin at rest;
 *   after the unpin it waits at the east edge;
 * - Mi enfoque, pinned from 1024px (two acts, see useFocusScene): it slides in from
 *   the east as the pin begins and stands still right of the problem (48px+
 *   from its text); as the problem steps back it crosses the sky to the left
 *   (FOCUS_SCENE.CROSS), sinking a little, and stands left of the answer until
 *   the unpin, then waits at the west edge. Not pinned (768–1023px or a stage too
 *   tall), it parks in the section's free zone (at least 48px from any text,
 *   whole in view; see lib/sunPath), arriving and leaving sideways through the
 *   free band beside it;
 * - emakimono (pinned from 1024px): it waits at the west edge at the sky's height
 *   until the pin holds the heading still, comes in over the first stretch of the
 *   unroll (above the horizon, below the heading, behind the fans, never over panel
 *   text) and drifts back out to the west edge by the end of the pin;
 * - down the west edge it glides in with the page to the afternoon sun's disc in
 *   Sobre mí;
 * - Sobre mí: it parks exactly as that disc (`[data-sun-anchor="about"]`), whole:
 *   nothing occludes it there, so it never sinks, it only warms;
 * - from there it only sinks: one continuous descent, linear in scroll and faster
 *   than the page (SINK), so it moves down the viewport the whole way. From
 *   1280px it slips out from its column to the left margin before Contacto (at
 *   least 24px of it in view), comes back in under Contacto's left column, and goes
 *   straight down between the footer's logo and socials into the sea. Narrower, it
 *   goes down its side edge and comes in low, under the footer text, to set.
 * The timeline maps the exact scroll to the sun's exact place; every frame a ticker
 * reads the live scroll and draws that place, unsmoothed, in the viewport (see
 * `draw`): the sun is a pure function of the scroll, so it never trails, overshoots
 * or bounces back. Its softness comes from the path (eased segments), not from time.
 *
 * Phones (<768px): after the hero it waits high at the right edge, small (a 20%
 * crescent, the gutter is narrow), crosses to the west along the top edge for the
 * Sobre mí disc, parks as it, waits small at the west edge on the way down and
 * sets in the footer sea.
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
            // What the ticker draws from: the latest build's timeline and its goal.
            let view: {
                timeline: gsap.core.Timeline;
                goal: { x: number; y: number; scale: number; opacity: number; late: number };
                maxScroll: number;
            } | null = null;
            // The scroll position last drawn (-1: draw on the next frame whatever the scroll).
            let drawnAt = -1;
            let introPlayed = false;

            const build = () => {
                timeline?.kill();
                view = null;
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
                    from: pinnedZone(heroAnchor, hero, 0),
                    to: pinnedZone(highAnchor, hero, 0),
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

                // The passage between two chapters, never out of view. Sideways to its side
                // edge in the frame of the chapter it leaves (with the page, or held in the
                // viewport), any change of height at the edge as a crescent held in the
                // viewport, and sideways in, in the frame of the chapter it reaches. It never
                // drifts with the page and is pulled back, and never bobs between two chapters.
                // At the edge, never gone: the disc's centre a little past its side edge,
                // so a crescent of it stays in view while the page scrolls past.
                const peek = PEEK[vw >= 768 ? "wide" : "narrow"];
                const edgeX = (side: "left" | "right", d: number) => (side === "right" ? vw + d * peek : -d * peek);
                const sideOf = (zone: Zone) => (zone.x >= vw / 2 ? "right" : "left");
                // Its document y in a frame: fixed on the page (0), or fixed in the viewport (1).
                const yIn = (frame: 0 | 1, zone: Zone, time: number, scroll: number) => (frame ? zone.y - time + scroll : zone.y);
                const passage = (a: Zone, aFrame: 0 | 1, t0: number, b: Zone, bFrame: 0 | 1, t1: number) => {
                    const span = Math.max(3, t1 - t0);
                    // Short enough that a disc riding with the page is still in view when it
                    // reaches the edge (and already in view when it leaves it).
                    let exit = Math.min(vh * 0.25, span * 0.3);
                    let enter = Math.min(vh * 0.3, span * 0.4);
                    if (!aFrame) exit = Math.max(1, Math.min(exit, a.y - t0 + a.d * peek));
                    if (!bFrame) enter = Math.max(1, Math.min(enter, vh + b.d * peek - (b.y - t1)));
                    const m0 = t0 + exit;
                    const m1 = Math.max(m0 + 1, t1 - enter);
                    const gone: Zone = { x: edgeX(sideOf(a), a.d), y: yIn(aFrame, a, t0, m0), d: a.d };
                    const coming: Zone = { x: edgeX(sideOf(b), b.d), y: yIn(bFrame, b, t1, m1), d: b.d };
                    legs.push({
                        points: [], zone: gone, at: m0,
                        track: (scroll) => ({ x: lerp(a.x, gone.x, sine((scroll - t0) / exit)), y: yIn(aFrame, a, t0, scroll), d: a.d }),
                    });
                    // At the edge, held in the viewport: from one height to the other. To change
                    // sides it climbs to the top edge, crosses along it and comes down the other.
                    const v0 = gone.y - m0;
                    const v1 = coming.y - m1;
                    const sameSide = sideOf(gone) === sideOf(coming);
                    const sky = -Math.max(a.d, b.d) * PEEK.wide;
                    legs.push({
                        points: [], zone: coming, at: m1,
                        track: (scroll) => {
                            const q = (scroll - m0) / Math.max(1, m1 - m0);
                            if (sameSide) {
                                const t = sine(q);
                                return { x: lerp(gone.x, coming.x, t), y: lerp(v0, v1, t) + scroll, d: lerp(a.d, b.d, t) };
                            }
                            const up = sine(q / 0.3);
                            const across = sine((q - 0.3) / 0.4);
                            const down = sine((q - 0.7) / 0.3);
                            const d = lerp(a.d, b.d, across);
                            const x = lerp(edgeX(sideOf(gone), d), edgeX(sideOf(coming), d), across);
                            const y = q < 0.7 ? lerp(v0, sky, up) : lerp(sky, v1, down);
                            return { x, y: y + scroll, d };
                        },
                    });
                    if (m1 < t1) {
                        legs.push({
                            points: [], zone: b, at: t1,
                            track: (scroll) => ({ x: lerp(coming.x, b.x, sine((scroll - m1) / Math.max(1, t1 - m1))), y: yIn(bFrame, b, t1, scroll), d: b.d }),
                        });
                    }
                };

                if (vw >= 768) {
                    let previous: Zone = start;
                    let previousFrame: 0 | 1 = 1;
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
                                // Gently: its fastest climb stays near the page's own speed.
                                const t = gentle((scroll - heroPin.start) / (span * HERO_RISE));
                                return { x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t) + scroll, d: lerp(from.d, to.d, t) };
                            },
                        });
                        previous = { ...to, y: to.y + heroPin.end };
                        previousTime = heroPin.end;
                    } else {
                        previousFrame = 0;
                    }

                    const emakiPin = vw >= 1024 ? getEmakiPinRange() : null;
                    const focusPin = getFocusPinRange();
                    let parkedAbout = false;

                    for (const chapter of CHAPTERS) {
                        const section = document.getElementById(chapter.id);
                        if (!section) continue;
                        const sectionBox = section.parentElement?.classList.contains("pin-spacer") ? section.parentElement : section;
                        const rect = docRect(sectionBox);

                        // 2. The emakimono: one chapter, its sky band crossed east to west, level.
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
                                // In the west of the sky (it crossed in Mi enfoque), drifting slowly on
                                // toward the west edge over the unroll, where it waits for Sobre mí.
                                // It waits at the west edge until the pin holds the heading still, comes in
                                // over the first stretch of the unroll and drifts back out to the edge.
                                const xIn = edgeX("left", d);
                                const xMid = Math.max(d / 2 + 24, vw * 0.3);
                                const xOut = edgeX("left", d);
                                const span = Math.max(1, emakiPin.end - emakiPin.start);
                                const zoneIn: Zone = { x: xIn, y: skyY + emakiPin.start, d };
                                const emakiX = (t: number) => (t < 0.3 ? lerp(xIn, xMid, sine(t / 0.3)) : lerp(xMid, xOut, sine((t - 0.3) / 0.7)));
                                passage(previous, previousFrame, previousTime, zoneIn, 1, Math.max(previousTime + 3, emakiPin.start));
                                legs.push({
                                    points: [],
                                    zone: { x: xOut, y: skyY + emakiPin.end, d },
                                    at: emakiPin.end,
                                    track: (scroll) => ({
                                        x: emakiX((scroll - emakiPin.start) / span),
                                        y: skyY + scroll,
                                        d,
                                    }),
                                });
                                previous = { x: xOut, y: skyY + emakiPin.end, d };
                                previousFrame = 1;
                                previousTime = emakiPin.end;
                                continue;
                            }
                        }

                        // 2a. Mi enfoque, pinned (from 1024px): two acts. It slides in from the
                        // right as the pin begins and stands right of the problem, still; as the
                        // problem steps back it crosses the sky to the left, sinking a little (the
                        // afternoon begins), and stands left of the answer until the unpin.
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
                            // Midday: high, but whole in view and 48px+ under the heading.
                            const high = Math.max(SKY_TOP + d / 2, headingBottom + CLEARANCE + d / 2);
                            const rest = Math.max(high, vh * 0.42);
                            const sink = Math.max(0, Math.min(vh * FOCUS_SINK, vh - 24 - d / 2 - rest));
                            const pin = focusPin;
                            const span = Math.max(1, pin.end - pin.start);
                            const [crossFrom, crossTo] = FOCUS_SCENE.CROSS;
                            const zoneIn: Zone = { x: east, y: rest + pin.start, d };
                            const at = Math.max(previousTime + 3, pin.start);
                            passage(previous, previousFrame, previousTime, zoneIn, 1, at);
                            legs.push({
                                points: [],
                                zone: { x: west, y: rest + sink + pin.end, d },
                                at: pin.end,
                                track: (scroll) => {
                                    const t = sine(((scroll - pin.start) / span - crossFrom) / (crossTo - crossFrom));
                                    return { x: lerp(east, west, t), y: rest + sink * t + scroll, d };
                                },
                            });
                            previous = { x: west, y: rest + sink + pin.end, d };
                            previousFrame = 1;
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
                        // Where Sobre mí's column does not stick, the parked disc moves with the
                        // page: it arrives lower, so it can rest and leave before reaching the top edge.
                        const height = anchored && !aboutTravel ? ABOUT_LOOSE_HEIGHT : chapter.height;
                        const at = Math.min(maxScroll - 1, Math.max(previousTime + 3, parkedScroll(zone, height, vh)));
                        // 3. A free zone (768–1023px), or the Sobre mí disc: it arrives with the
                        // page, gliding in sideways through the free band beside it (findZone keeps
                        // that band clear; the disc's band is the margin under the heading).
                        const arrival: Zone = anchored ? { ...zone, y: aboutY(at) } : zone;
                        passage(previous, previousFrame, previousTime, arrival, 0, at);
                        previous = arrival;
                        previousFrame = 0;
                        previousTime = at;
                        if (anchored) parkedAbout = true;
                    }
                    // 4. It rests as the Sobre mí disc, whole (nothing stands in front of it, so
                    // it never sinks), and warms (--sun-late) as the text is read; then it
                    // slides out west to the margin, easing to the sunset's size, and sinks.
                    // - Column sticky (from 1280px): it is locked to the disc and slides out
                    //   during the last stretch of the column's travel, still at the disc's
                    //   height in the viewport, so it is in the margin before the column lets
                    //   go: it never rides up to the top edge, and Contacto's section mark,
                    //   still far below, never meets it. Past the release it already sinks.
                    // - Column loose (below 1280px), the disc moves with the page: it keeps its
                    //   place on the page (so the text below keeps its distance) and slides out
                    //   quickly, early enough that its top never reaches the top edge.
                    let slidDown = false;
                    if (about && parkedAbout) {
                        const parkFrom = previousTime;
                        const slide = vh * (aboutTravel ? 0.35 : 0.22);
                        const travelEnd = aboutTravel ? aboutTravel.end : -Infinity;
                        const latest = aboutTravel ? Infinity : about.y - about.d / 2 - SKY_TOP - slide;
                        const hold = Math.min(maxScroll - 3, Math.max(parkFrom + 1, Math.min(latest, Math.max(parkFrom + vh * 0.25, travelEnd - slide))));
                        const rest: Zone = { ...about, y: aboutY(hold) };
                        legs.push({
                            points: [],
                            zone: rest,
                            at: hold,
                            track: (scroll) => ({ ...about, y: aboutY(scroll) }),
                        });
                        warmFrom = parkFrom;
                        warmTo = hold;
                        const slideAt = Math.min(maxScroll - 2, hold + slide);
                        const span = Math.max(1, slideAt - hold);
                        // Its height on the page during the slide.
                        const slideY = (scroll: number) => {
                            if (aboutTravel) return aboutY(scroll) + SINK * Math.max(0, scroll - travelEnd);
                            return rest.y;
                        };
                        const out: Zone = { x: Math.max(24 - end.d / 2, contentLeft - CLEARANCE - end.d / 2), y: slideY(slideAt), d: end.d };
                        legs.push({
                            points: [],
                            zone: out,
                            at: slideAt,
                            track: (scroll) => {
                                const t = sine((scroll - hold) / span);
                                return { x: lerp(rest.x, out.x, t), y: slideY(scroll), d: lerp(rest.d, out.d, t) };
                            },
                        });
                        previous = out;
                        previousTime = slideAt;
                        slidDown = true;
                    }
                    // The last way down: it never rises again after the last park.
                    const dMax = Math.max(previous.d, end.d);
                    const below = (y: number, xMin: number, xMax: number) => Math.min(
                        Infinity,
                        ...obstacles.filter((o) => o.t > y && o.l < xMax + CLEARANCE && o.r > xMin - CLEARANCE).map((o) => o.t),
                    );
                    const sink = (keys: Zone[]) => {
                        // Leaves the park almost at once, while it is still well in view; after a
                        // slide that already goes down, at once (no pause that would lift it).
                        const begin = Math.min(maxScroll - 2, previousTime + (slidDown ? 1 : vh * 0.04));
                        legs.push({ points: [previous, previous], zone: previous, at: begin });
                        const walk = descentTrack(keys, maxScroll - begin);
                        legs.push({ points: [], zone: end, at: maxScroll, track: (scroll) => walk((scroll - begin) / Math.max(1, maxScroll - begin)) });
                    };
                    let planned = false;
                    const contact = document.getElementById("contact");
                    if (vw >= 1280 && contact) {
                        const r = dMax / 2;
                        const mx = Math.max(24 - r, contentLeft - CLEARANCE - r);
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
                        // Out to its side edge, down it in view, and in low under the footer text.
                        passage(previous, slidDown ? 0 : previousFrame, previousTime, end, 0, maxScroll);
                    }
                } else {
                    // Phones: never beside text. It waits high at the right edge (a crescent in
                    // view), crosses to the west along the top edge for the Sobre mí disc, parks
                    // as it, and goes down the west edge to set in the footer sea.
                    const d = Math.min(80, start.d);
                    const waitV = vh * 0.16;
                    const waitFrom = Math.min(maxScroll - 4, vh * 0.5);
                    passage(start, 0, 0, { x: edgeX("right", d), y: waitV + waitFrom, d }, 1, waitFrom);
                    let wait: Zone = { x: edgeX("right", d), y: waitV + waitFrom, d };
                    let waitTo = waitFrom;
                    const hold = (until: number) => {
                        const to = Math.min(maxScroll - 3, Math.max(waitTo + 1, until));
                        legs.push({ points: [], zone: { ...wait, y: waitV + to }, at: to, track: (scroll) => ({ ...wait, y: waitV + scroll }) });
                        wait = { ...wait, y: waitV + to };
                        waitTo = to;
                    };
                    if (about) {
                        // It moves with the page there (nothing sticks): arrives low and rests.
                        const arrive = Math.min(maxScroll - 2, Math.max(waitTo + vh * 0.6, parkedScroll(about, ABOUT_LOOSE_HEIGHT, vh)));
                        hold(arrive - vh * 1.8);
                        passage(wait, 1, waitTo, about, 0, arrive);
                        const leave = Math.min(maxScroll - 1, Math.max(arrive + 1, about.y - vh * 0.42));
                        legs.push({ points: [], zone: about, at: leave, track: () => about });
                        // Small again at the west edge on the way down, then in low to set.
                        const low: Zone = { x: edgeX("left", d), y: 0, d };
                        const lowFrom = Math.max(leave + 3, Math.min(maxScroll - vh * 0.5, leave + vh * 0.5));
                        passage(about, 0, leave, { ...low, y: vh * 0.3 + lowFrom }, 1, lowFrom);
                        passage({ ...low, y: vh * 0.3 + lowFrom }, 1, lowFrom, end, 0, maxScroll);
                    } else {
                        hold(maxScroll - vh * 1.2);
                        passage(wait, 1, waitTo, end, 0, maxScroll);
                    }
                }

                // Exposed for layout checks: the scroll position at which each keyframe lands.
                root.dataset.keyframes = legs.map((leg) => Math.round(leg.at)).join(",");

                // The timeline computes where the sun belongs at each scroll position (its
                // seconds are scroll px) into `goal`, in document coordinates; `draw` shows it.
                const goal = { x: 0, y: 0, scale: 1, opacity: 1, late: 0 };
                timeline = gsap.timeline({ paused: true, defaults: { ease: "sine.inOut" } });
                timeline.set(goal, { ...place(start), scale: 1 }, 0);
                let time = 0;
                for (const leg of legs) {
                    const duration = Math.max(1, leg.at - time);
                    const track = leg.track;
                    if (track) {
                        const from = time;
                        const proxy = { scroll: from };
                        timeline.fromTo(proxy, { scroll: from }, {
                            scroll: from + duration,
                            duration,
                            ease: "none",
                            // Rendered only by the playhead: an immediate render of a later leg
                            // would leave its start in `goal` (see the first render below).
                            immediateRender: false,
                            onUpdate: () => {
                                const zone = track(proxy.scroll);
                                Object.assign(goal, place(zone), { scale: zone.d / base });
                            },
                        }, time);
                    } else {
                        timeline.to(goal, {
                            motionPath: { path: leg.points.map(place), curviness: 0.6 },
                            scale: leg.zone.d / base,
                            duration,
                        }, time);
                    }
                    time += duration;
                }
                // The colour warms with the paper's day (--sun-now, usePaperDay), and further,
                // to persimmon, while it rests in Sobre mí (--sun-late, see --color-sun-live).
                if (warmTo > warmFrom && warmFrom >= 0) {
                    timeline.fromTo(goal, { late: 0 }, { late: 1, duration: warmTo - warmFrom, ease: "none" }, warmFrom);
                }
                // Timeline seconds equal scroll pixels.
                if (timeline.duration() < maxScroll) timeline.set({}, {}, maxScroll);

                // A first render through every leg, so `goal` holds the place at the
                // current scroll even when the playhead does not move (a reload at the
                // top, where time(0) on a fresh timeline renders nothing).
                timeline.time(maxScroll);
                // The whole path as a table, for the companions that follow the sun
                // (the scale journey): the same timeline sampled every TRACK_STEP px.
                const samples = Math.ceil(maxScroll / TRACK_STEP) + 1;
                const track = {
                    step: TRACK_STEP,
                    maxScroll,
                    x: new Float32Array(samples),
                    y: new Float32Array(samples),
                    d: new Float32Array(samples),
                    o: new Float32Array(samples),
                };
                for (let k = 0; k < samples; k++) {
                    timeline.time(Math.min(maxScroll, k * TRACK_STEP));
                    track.x[k] = goal.x + base / 2;
                    track.y[k] = goal.y + base / 2;
                    track.d[k] = goal.scale * base;
                    track.o[k] = goal.opacity;
                }
                view = { timeline, goal, maxScroll };
                drawnAt = -1;
                draw();
                publishSunTrack(track);

                if (!introPlayed) {
                    introPlayed = true;
                    // Rises out of the hero sea, with the name and the sea's ink (one gesture).
                    gsap.from(disc, { yPercent: 60, duration: 1.4, delay: 0.15, ease: "expo.out" });
                }
            };

            /**
             * Draws the sun every frame, in the frame of the fixed layer (the viewport):
             * the timeline's place at the live scroll position, minus that same scroll.
             * Nothing is eased or carried over from the previous frame, so the drawn sun
             * is always exactly the function of the scroll the browser is about to
             * paint, the same frame in which ScrollTrigger places the pinned chapters
             * (no trailing, no overshoot, no bounce while a smooth scroll animates).
             */
            const draw = () => {
                if (!view) return;
                const scroll = Math.min(view.maxScroll, Math.max(0, window.scrollY));
                if (scroll === drawnAt) return;
                drawnAt = scroll;
                view.timeline.time(scroll);
                const { goal } = view;
                gsap.set(root, { x: goal.x, y: goal.y - scroll, scale: goal.scale, opacity: goal.opacity, "--sun-late": goal.late });
            };

            build();
            gsap.ticker.add(draw);
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
                gsap.ticker.remove(draw);
                observer.disconnect();
                ScrollTrigger.removeEventListener("refresh", schedule);
                cancelAnimationFrame(frame);
                timeline?.kill();
                publishSunTrack(null);
            };
        });

        return () => mm.revert();
    }, { scope });

    return scope;
}

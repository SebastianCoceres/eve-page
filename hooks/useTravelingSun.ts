import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { CLEARANCE, findZone, parkedScroll, route, type Point, type Rect, type Zone } from "@/lib/sunPath";

const docRect = (element: Element): Rect => {
    const r = element.getBoundingClientRect();
    return { l: r.left, t: r.top + window.scrollY, r: r.right, b: r.bottom + window.scrollY };
};

/** Every text line and opaque surface the sun must keep clear of, in document coordinates. */
function collectObstacles(): Rect[] {
    const rects: Rect[] = [];
    document.querySelectorAll("main, footer").forEach((scope) => {
        const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
        let node: Node | null;
        while ((node = walker.nextNode())) {
            const parent = node.parentElement;
            if (!node.textContent?.trim() || !parent || parent.closest(".sr-only, [aria-hidden='true']")) continue;
            const range = document.createRange();
            range.selectNodeContents(node);
            // A heading line that has not risen yet (usePageMotion) is measured where it will rest.
            const line = parent.closest<HTMLElement>(".split-line");
            const shift = line ? Number(gsap.getProperty(line, "y")) + (Number(gsap.getProperty(line, "yPercent")) / 100) * line.offsetHeight : 0;
            for (const r of range.getClientRects()) {
                rects.push({ l: r.left, t: r.top + window.scrollY - shift, r: r.right, b: r.bottom + window.scrollY - shift });
            }
        }
        scope.querySelectorAll("input, textarea, button, [role='combobox'], .bg-surface, [data-section-mark], h1 svg").forEach((element) => {
            rects.push(docRect(element));
        });
    });
    return rects;
}

// Where the day should be in each chapter: x as a fraction of the viewport width
// (east to west), how high in the viewport the sun sits when it arrives, and its
// size by time of day: smallest at midday, larger toward the horizon (as a low
// sun looks). Sizes are tried largest first and shrink only to fit a free zone.
// A chapter with an `anchor` parks on that element instead of a computed zone:
// in Sobre mí the afternoon sun sets behind the portrait's arch. Contacto is not
// a parking spot: from Sobre mí the sun only goes down (see the descent below).
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

// Phones: the sun only peeks in, cropped by the page edge, in the empty band
// between two sections: east (right) at midday, west (left) in the afternoon.
const PEEKS = [
    { from: "focus", to: "services", side: "right" },
    { from: "services", to: "about", side: "left" },
] as const;

type Leg = {
    points: Point[];
    zone: Zone;
    at: number;
    hidden?: boolean;
    /** A leg driven by a function of its progress (linear in scroll) instead of a motion path. */
    track?: (progress: number) => Zone;
};

const smooth = (t: number) => t * t * (3 - 2 * t);

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
 * computed from the real layout on every resize:
 * - it starts on the hero anchor, rising out of the hero sea;
 * - for each chapter it parks in that section's free zone (at least 48px from any
 *   text, fully below the navbar; see lib/sunPath), sized by the time of day;
 * - between chapters it travels only through whitespace: out to the side margin,
 *   along it, across the gap between sections, and in (MotionPath, sine.inOut);
 * - in Sobre mí it parks behind the portrait's arch, peeking past its shoulder;
 * - from there it only sinks: one continuous descent, linear in scroll and faster
 *   than the page (SINK), so it moves down the viewport the whole way. From
 *   1280px it slips out to the left margin before Contacto, comes back in under
 *   Contacto's left column, and goes straight down between the footer's logo and
 *   socials into the sea. Narrower, it leaves by its side margin, sinks out of
 *   view and slides in low, under the footer text, to set.
 * Everything is measured from the live layout (pin spacers included), so a
 * section that changes the document height only moves the keyframes.
 * One scrubbed ScrollTrigger maps scroll to the whole journey; each leg is timed
 * so the sun reaches a zone as that zone reaches its height in the viewport.
 *
 * Phones (<768px): never across or beside text. After rising in the hero it
 * slides out to the right; it peeks in from the right edge in the empty band
 * between Mi enfoque and Servicios, from the left edge between Servicios and
 * Sobre mí (the side switch happens out of view, hidden), and finally slides in
 * from the left to set in the footer sea.
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
                const footerAnchor = document.querySelector('[data-sun-anchor="footer"]');
                if (!heroAnchor || !footerAnchor) return;

                const vh = window.innerHeight;
                const vw = document.documentElement.clientWidth;
                const maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
                const contentLeft = vw >= 1280 ? (vw - 1200) / 2 : 40;
                const contentRight = vw - contentLeft;

                const anchorZone = (element: Element): Zone => {
                    const r = docRect(element);
                    return { x: (r.l + r.r) / 2, y: (r.t + r.b) / 2, d: r.r - r.l };
                };
                const start = anchorZone(heroAnchor);
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

                if (vw >= 768) {

                    let previous: Zone = start;
                    let previousRect = docRect(document.getElementById("home") ?? heroAnchor);
                    let previousTime = 0;

                    for (const chapter of CHAPTERS) {
                        const section = document.getElementById(chapter.id);
                        if (!section) continue;
                        const rect = docRect(section);
                        const anchor = chapter.anchor ? document.querySelector(`[data-sun-anchor="${chapter.anchor}"]`) : null;
                        const anchored = anchor ? anchorZone(anchor) : null;
                        const zone = anchored && anchored.d > 0 ? anchored : findZone({
                            section: rect,
                            obstacles,
                            viewportWidth: vw,
                            viewportHeight: vh,
                            targetX: chapter.targetX,
                            sizes: [...chapter.sizes],
                        });
                        if (!zone) continue;
                        const gapY = (textBottom(previousRect) + textTop(rect)) / 2;
                        const at = Math.min(maxScroll - 1, Math.max(previousTime + 1, parkedScroll(zone, chapter.height, vh)));
                        legs.push({ points: route(previous, zone, gapY, vw, contentLeft, contentRight), zone, at });
                        previous = zone;
                        previousRect = rect;
                        previousTime = at;
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
                        legs.push({ points: [], zone: end, at: maxScroll, track: descentTrack(keys, maxScroll - begin) });
                    };
                    let planned = false;
                    const contact = document.getElementById("contact");
                    if (vw >= 1280 && contact) {
                        const r = dMax / 2;
                        const mx = contentLeft - CLEARANCE - r;
                        // Out to the margin before anything below it in its column.
                        const y1 = below(previous.y, mx - r, previous.x + r) - CLEARANCE - r;
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
                        // Leaves sinking (behind the portrait, never toward text below it).
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
                    // Phones: peeks only, never beside text (see PEEKS).
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
                    let side: "left" | "right" = "right";

                    // Leaves the hero sideways, toward the edge it rose from.
                    hop(out("right", start.y, start.d), vh * 0.35);
                    for (const p of PEEKS) {
                        const a = document.getElementById(p.from);
                        const b = document.getElementById(p.to);
                        if (!a || !b) continue;
                        const top = textBottom(docRect(a));
                        const bottom = textTop(docRect(b));
                        const d = Math.min(112, bottom - top - 2 * CLEARANCE);
                        if (d < 64) continue;
                        const y = (top + bottom) / 2;
                        hop(out(p.side, y, d), y - vh * 0.85, p.side !== side);
                        hop(peek(p.side, y, d), y - vh * 0.6);
                        hop(peek(p.side, y, d), y - vh * 0.42);
                        hop(out(p.side, y, d), y - vh * 0.28);
                        side = p.side;
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
                        const proxy = { progress: 0 };
                        timeline.fromTo(proxy, { progress: 0 }, {
                            progress: 1,
                            duration,
                            ease: "none",
                            onUpdate: () => {
                                const zone = track(proxy.progress);
                                gsap.set(root, { ...place(zone), scale: zone.d / base });
                            },
                        }, time);
                    } else {
                        timeline.to(root, {
                            motionPath: { path: leg.points.map(place), curviness: 0.6 },
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

                trigger = ScrollTrigger.create({ start: 0, end: maxScroll, scrub: 0.5, animation: timeline });
                timeline.progress(window.scrollY / maxScroll);

                if (!introPlayed) {
                    introPlayed = true;
                    // Rises out of the hero sea, with the hero's ink intro.
                    gsap.from(disc, { yPercent: 70, duration: 1.8, ease: "expo.out" });
                }
            };

            build();
            let frame = 0;
            let lastHeight = document.documentElement.scrollHeight;
            let lastWidth = document.documentElement.clientWidth;
            const observer = new ResizeObserver(() => {
                const height = document.documentElement.scrollHeight;
                const width = document.documentElement.clientWidth;
                if (height === lastHeight && width === lastWidth) return;
                lastHeight = height;
                lastWidth = width;
                cancelAnimationFrame(frame);
                frame = requestAnimationFrame(build);
            });
            observer.observe(document.body);

            return () => {
                observer.disconnect();
                cancelAnimationFrame(frame);
                trigger?.kill();
                timeline?.kill();
            };
        });

        return () => mm.revert();
    }, { scope });

    return scope;
}

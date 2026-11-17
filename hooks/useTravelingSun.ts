import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { findZone, parkedScroll, route, type Point, type Rect, type Zone } from "@/lib/sunPath";

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
            for (const r of range.getClientRects()) {
                rects.push({ l: r.left, t: r.top + window.scrollY, r: r.right, b: r.bottom + window.scrollY });
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
const CHAPTERS = [
    { id: "focus", targetX: 0.82, height: 0.3, sizes: [180, 150, 120] },
    { id: "services", targetX: 0.72, height: 0.26, sizes: [150, 130, 110] },
    { id: "about", targetX: 0.2, height: 0.42, sizes: [200, 170, 140, 120] },
    { id: "contact", targetX: 0.15, height: 0.52, sizes: [220, 180, 150, 120] },
] as const;

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
 * - it ends on the footer anchor, setting into the footer sea, warming on the way.
 * One scrubbed ScrollTrigger maps scroll to the whole journey; each leg is timed
 * so the sun reaches a zone as that zone reaches its height in the viewport.
 *
 * Phones (<768px): no horizontal travel. After the hero it waits out of view by
 * the right edge and only peeks in at the section marks before setting in the
 * footer. Reduced motion: never runs; the static anchors show instead.
 */
export function useTravelingSun() {
    const scope = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const root = scope.current;
        const disc = root?.querySelector<HTMLElement>("[data-sun-disc]");
        if (!root || !disc) return;

        const mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", () => {
            const css = getComputedStyle(document.documentElement);
            const warm = css.getPropertyValue("--sun-warm").trim();
            const sunColor = css.getPropertyValue("--sun").trim();

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

                const legs: Array<{ points: Point[]; zone: Zone; at: number }> = [];

                if (vw >= 768) {
                    const obstacles = collectObstacles();
                    const inside = (rect: Rect) => obstacles.filter((o) => o.t >= rect.t && o.b <= rect.b);
                    const textTop = (rect: Rect) => Math.min(rect.b, ...inside(rect).map((o) => o.t));
                    const textBottom = (rect: Rect) => Math.max(rect.t, ...inside(rect).map((o) => o.b));

                    let previous: Zone = start;
                    let previousRect = docRect(document.getElementById("home") ?? heroAnchor);
                    let previousTime = 0;

                    for (const chapter of CHAPTERS) {
                        const section = document.getElementById(chapter.id);
                        if (!section) continue;
                        const rect = docRect(section);
                        const zone = findZone({
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
                    // The last leg crosses behind the footer sea (the scales' fills hide it), not
                    // through the gap above the footer, which is too narrow for a sun at tablet widths.
                    const footerSea = document.querySelector('[data-sea-field="footer"]');
                    const seaRect = footerSea ? docRect(footerSea) : null;
                    const gapY = seaRect ? (seaRect.t + seaRect.b) / 2 + end.d / 2 : end.y;
                    legs.push({ points: route(previous, end, gapY, vw, contentLeft, contentRight), zone: end, at: maxScroll });
                } else {
                    // Phones: out by the right edge, peeking in at each section mark.
                    const d = 140;
                    const out = (y: number): Zone => ({ x: vw + d, y, d });
                    const peek = (y: number): Zone => ({ x: vw + d * 0.15, y, d });
                    const marks = Array.from(document.querySelectorAll("[data-section-mark]")).map((m) => {
                        const r = docRect(m);
                        return (r.t + r.b) / 2;
                    });
                    let time = 0;
                    let from: Zone = start;
                    const hop = (zone: Zone, when: number) => {
                        const t = Math.min(maxScroll - 1, Math.max(time + 1, when));
                        legs.push({ points: [{ x: from.x, y: from.y }, { x: zone.x, y: zone.y }], zone, at: t });
                        from = zone;
                        time = t;
                    };
                    for (const y of marks) {
                        hop(out(y - vh * 0.4), y - vh * 0.9);
                        hop(peek(y), y - vh * 0.5);
                        hop(out(y + vh * 0.4), y - vh * 0.1);
                    }
                    hop(out(end.y - vh * 0.3), maxScroll - vh * 0.4);
                    legs.push({ points: [{ x: from.x, y: from.y }, { x: end.x, y: end.y }], zone: end, at: maxScroll });
                }

                // Exposed for layout checks: the scroll position at which each keyframe lands.
                root.dataset.keyframes = legs.map((leg) => Math.round(leg.at)).join(",");

                timeline = gsap.timeline({ paused: true, defaults: { ease: "sine.inOut" } });
                timeline.set(root, { ...place(start), scale: 1 }, 0);
                let time = 0;
                for (const leg of legs) {
                    const duration = Math.max(1, leg.at - time);
                    timeline.to(root, {
                        motionPath: { path: leg.points.map(place), curviness: 0.6 },
                        scale: leg.zone.d / base,
                        duration,
                    }, time);
                    time += duration;
                }

                // Warm through the afternoon: from Sobre mí to the sunset.
                const about = document.getElementById("about");
                const warmFrom = about ? Math.max(0, docRect(about).t - vh) : maxScroll * 0.6;
                timeline.fromTo(disc, { backgroundColor: sunColor }, { backgroundColor: warm, duration: Math.max(1, maxScroll - warmFrom), ease: "none" }, warmFrom);
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

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { looseCrestFor, seaFor, RINGS, type SeigaihaScale } from "@/lib/seigaiha";
import { SKY_TOP } from "@/lib/sunPath";
import { getSunTrack, onSunTrack, sunAt, type SunSample, type SunTrack } from "@/lib/sunTrack";
import { getEmakiPinRange } from "@/hooks/useEmakiScroll";
import { getHeroPinRange } from "@/hooks/useHeroAnimation";
import {
    CLEARANCE_RAMP, GULL, TEXT_CLEARANCE, bezier, boxGap, clamp01, gullWings, haloAngle, hash, lerp, smooth, span,
} from "@/lib/scaleJourney";

/** How many lifted scales become gulls: a calm flock. The rest flip away as they lift. */
const FLOCK = { wide: 32, narrow: 14 };
/** Line opacity of a scale in the air. */
const AIR_OPACITY = 0.55;

type Box = { l: number; t: number; r: number; b: number; c: number };
type Lines = { element: Element; lines: number[] };

interface Particle {
    index: number;
    home: SeigaihaScale;
    /** Its row in the hero sea (0 = the horizon). */
    row: number;
    /** One of the flock; the others flip away (edge on, gone) as they lift. */
    gull: boolean;
    /** Scroll px it trails the sun by. */
    lag: number;
    /** Its place around the sun: angle off the flock's opening, and how far out (0–1). */
    theta: number;
    reach: number;
    tilt: number;
    detach: number;
    rise: number;
    /** When it turns into a kamome (once clear of the crest). */
    gullFrom: number;
    gullTo: number;
    /** Wingbeat: scroll px per beat, its phase and its depth (0–1). */
    beat: number;
    phase: number;
    wing: number;
    /** When it starts down to the footer sea, and when it is in it. */
    sink: number;
    sea: number;
    /** Footer crest scale it lands on. */
    target: SeigaihaScale | null;
    /** The hero sea's own copy of this scale. */
    group: SVGGElement | null;
    hidden: boolean;
}

interface Plan {
    track: SunTrack;
    vw: number;
    vh: number;
    maxScroll: number;
    particles: Particle[];
    sea: SVGSVGElement | null;
    footerSea: SVGSVGElement | null;
    blocks: Lines[];
    floating: HTMLElement | null;
    aboutDisc: Element | null;
    /** Until when the flock is held above the hero's crest. */
    heroEnd: number;
    /** The hero sea's rows (horizon first) and when each one dissolves. */
    rows: Array<{ group: SVGGElement; from: number; to: number; shown: string }>;
    /** The highest crest apex in the hero sea's own box (px from its top). */
    crestTop: number;
    /** Scroll range over which the flock flattens into the emakimono's sky band. */
    band: { from: number; to: number } | null;
    primary: string;
}


/** Hidden from assistive tech and from the clearance alike, except the pieces of a split text. */
const isDecorative = (element: Element) => {
    if (element.closest(".sr-only")) return true;
    const hidden = element.closest("[aria-hidden='true']");
    return Boolean(hidden && !hidden.closest("[aria-label]"));
};

/**
 * Every line of text (and every control, pill, logo and the seal) the scales keep
 * 24px from, as offsets from an element whose live box is read each frame: text
 * that rises, pins or sticks is avoided where it actually is.
 */
function collectBlocks(): Lines[] {
    const groups = new Map<Element, number[]>();
    const add = (element: Element, l: number, t: number, r: number, b: number) => {
        const box = element.getBoundingClientRect();
        const lines = groups.get(element) ?? [];
        lines.push(l - box.left, t - box.top, r - box.left, b - box.top);
        groups.set(element, lines);
    };
    document.querySelectorAll("main, footer, [data-floating-contact]").forEach((scope) => {
        const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
        let node: Node | null;
        while ((node = walker.nextNode())) {
            const parent = node.parentElement;
            if (!node.textContent?.trim() || !parent || isDecorative(parent)) continue;
            const range = document.createRange();
            range.selectNodeContents(node);
            for (const r of range.getClientRects()) add(parent, r.left, r.top, r.right, r.bottom);
        }
        // Drawn words and solid controls: the logotypes, pills, fields and the seal.
        scope.querySelectorAll("[data-hero-logo], [data-hero-subline], footer a[href='#home'], .bg-primary, input, textarea, [role='combobox'], footer svg[viewBox='0 0 42 42']").forEach((element) => {
            const r = element.getBoundingClientRect();
            add(element, r.left, r.top, r.right, r.bottom);
        });
    });
    return [...groups].map(([element, lines]) => ({ element, lines }));
}

/**
 * "Las escamas viajan con el sol": the hero's seigaiha sea becomes a flock of
 * kamome that follows the sun through the day, and lands in the sunset sea.
 *
 * 1. Hero: the sea's crest breathes with the scroll while the sun rises; its crest
 *    scales lift off one by one (nearest the sun first) and the whole sea
 *    dissolves behind them, row after row from the horizon to the front, so no
 *    wave is left when the hero ends. A lifted scale leaves the sea (its own SVG
 *    copy is hidden): it is never drawn twice. Most flip away as they lift; a
 *    flock of them, once clear of the crest, turns into gulls (the flip: edge on,
 *    back as a kamome).
 * 2. In the air the gulls trail the sun (its place a few scroll px ago) as a loose
 *    flock around it, opening away from the text, flattened into the sky band in
 *    the emakimono, banking with the sun's motion and beating their wings with
 *    the scroll. They stay on screen with the sun the whole way.
 * 3. Footer: they follow the setting sun down, turn back into scales (the same
 *    flip) and land in the sunset sea behind its crest, where the hanko stamps
 *    the day.
 *
 * Drawn on one canvas, fixed to the viewport, behind the sun, main and the footer
 * (the sun and the seas occlude it the way rows of a print do). It reads the
 * sun's path (lib/sunTrack) instead of owning a sun: every place is an exact
 * function of the live scroll, like the sun's; nothing is eased in time, nothing
 * trails or springs back. Every piece keeps 24px from any text, control or the
 * floating Contáctame, and fades out before it would come closer.
 * The work stops while the scroll is still (after the scrubbed emakimono settles)
 * and while the tab is hidden. Reduced motion: nothing runs, the seas are drawn
 * as they are.
 */
export function useScaleJourney() {
    const scope = useRef<HTMLCanvasElement>(null);

    useGSAP(() => {
        const canvas = scope.current;
        const context = canvas?.getContext("2d");
        if (!canvas || !context) return;

        const mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", () => {
            let plan: Plan | null = null;
            let lastScroll = -1;
            let liveUntil = 0;
            let dpr = 1;
            let frame = 0;
            let lastRetry = 0;

            const resize = () => {
                dpr = Math.min(2, window.devicePixelRatio || 1);
                const w = canvas.clientWidth;
                const h = canvas.clientHeight;
                if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
                    canvas.width = Math.round(w * dpr);
                    canvas.height = Math.round(h * dpr);
                }
                lastScroll = -1;
            };

            const release = () => {
                plan?.particles.forEach((p) => p.group?.style.removeProperty("visibility"));
                plan?.rows.forEach((row) => {
                    row.group.style.removeProperty("opacity");
                    row.group.style.removeProperty("transform");
                });
                context.setTransform(1, 0, 0, 1, 0, 0);
                context.clearRect(0, 0, canvas.width, canvas.height);
            };

            const build = () => {
                release();
                plan = null;
                const track = getSunTrack();
                const sea = document.querySelector<SVGSVGElement>('[data-sea-field="hero"] [data-sea-svg]');
                if (!track || !sea) return;
                resize();
                const vw = document.documentElement.clientWidth;
                const vh = window.innerHeight;
                const wide = vw >= 768;
                const maxScroll = track.maxScroll;

                // The hero sea's loose crest (the same generator and width as SeaField).
                const seaWidth = Math.round(sea.getBoundingClientRect().width);
                const heroField = seaFor("hero", seaWidth, looseCrestFor(seaWidth));
                const crest = heroField.crest;
                const groups = new Map<number, SVGGElement>();
                sea.querySelectorAll<SVGGElement>("[data-sea-scale]").forEach((g) => groups.set(Number(g.dataset.seaScale), g));
                if (crest.length === 0 || groups.size === 0) return;

                // The hero's scroll: its pin from 768px, else the stage scrolling away.
                const heroPin = getHeroPinRange();
                const hero = heroPin ?? { start: 0, end: vh * 0.9 };
                const heroSpan = Math.max(1, hero.end - hero.start);

                // The whole hero sea dissolves with the hero, row after row from the
                // horizon down to the front: no wave is left when the hero ends.
                const rowGroups = [...sea.children].filter((g): g is SVGGElement => g instanceof SVGGElement);
                const rowBases = heroField.rows.map((row) => row.base);
                const rows = rowGroups.map((group, k) => {
                    const from = hero.start + heroSpan * (0.32 + 0.53 * (k / Math.max(1, rowGroups.length - 1)));
                    return { group, from, to: from + heroSpan * 0.15, shown: "" };
                });

                // The flock: spread over the crest, not one end of it.
                const flockSize = Math.min(crest.length, FLOCK[wide ? "wide" : "narrow"]);
                const order = crest.map((_, k) => k).sort((a, b) => hash(a, 7) - hash(b, 7));
                const flock = new Map(order.slice(0, flockSize).map((k, n) => [k, n]));

                // The footer sea's crest, nearest the setting sun first (clear of the seal).
                const footerSea = document.querySelector<SVGSVGElement>('[data-sea-field="footer"] [data-sea-svg]');
                const footerWidth = footerSea ? Math.round(footerSea.getBoundingClientRect().width) : vw;
                const sunset = track.x[track.x.length - 1];
                const landOn = footerSea
                    ? seaFor("footer", footerWidth, flockSize * 2).crest
                        .filter((s) => s.cx + s.radius < footerWidth - 120)
                        .sort((a, b) => Math.abs(a.cx - sunset) - Math.abs(b.cx - sunset))
                    : [];

                // Lift order: nearest the sun (east) first.
                const byX = [...crest].sort((a, b) => b.cx - a.cx);
                const rank = new Map(byX.map((s, k) => [s, k]));

                const particles: Particle[] = crest.map((home, index) => {
                    const k = (rank.get(home) ?? 0) / Math.max(1, crest.length - 1);
                    const detach = hero.start + heroSpan * (0.04 + 0.32 * k + 0.04 * hash(index, 1));
                    const n = flock.get(index);
                    const rise = heroSpan * 0.32;
                    const gullFrom = detach + rise * (0.5 + 0.25 * hash(index, 13));
                    const gullTo = gullFrom + rise * 0.45;
                    const sea = maxScroll - hash(index, 8) * vh * 0.1;
                    return {
                        index,
                        home,
                        row: Math.max(0, rowBases.indexOf(home.base)),
                        gull: n !== undefined,
                        lag: hash(index, 2) * vh * (wide ? 0.22 : 0.15),
                        theta: (hash(index, 3) - 0.5) * 3.3,
                        reach: hash(index, 4),
                        tilt: (hash(index, 9) - 0.5) * 1.2,
                        detach,
                        rise,
                        gullFrom,
                        gullTo,
                        beat: 220 + 140 * hash(index, 15),
                        phase: hash(index, 16) * Math.PI * 2,
                        wing: 0.55 + 0.45 * hash(index, 17),
                        sink: Math.max(gullTo + 1, sea - vh * 0.75),
                        sea,
                        target: n !== undefined && landOn.length ? landOn[n % landOn.length] : null,
                        group: groups.get(home.id) ?? null,
                        hidden: false,
                    };
                });

                // The flock flattens into the emakimono's sky band (it never reaches the heading).
                const emakiPin = getEmakiPinRange();
                const band = emakiPin ? { from: emakiPin.start, to: emakiPin.end } : null;
                const css = getComputedStyle(document.documentElement);
                plan = {
                    track, vw, vh, maxScroll, particles, sea, footerSea,
                    heroEnd: hero.end,
                    rows,
                    crestTop: Math.min(...crest.map((s) => s.base - s.radius)),
                    blocks: collectBlocks(),
                    floating: document.querySelector<HTMLElement>("[data-floating-contact]"),
                    aboutDisc: document.querySelector('[data-sun-anchor="about"]'),
                    band,
                    primary: css.getPropertyValue("--primary").trim() || "#1e4ba8",
                };
                canvas.dataset.particles = String(particles.length);
                canvas.dataset.gulls = String(flockSize);
                canvas.dataset.hero = `${Math.round(hero.start)},${Math.round(hero.end)}`;
                lastScroll = -1;
            };

            /** Draws one seigaiha scale: its rings share a base line at (0, 0). */
            const scaleAt = (radius: number) => {
                context.beginPath();
                for (let ring = RINGS; ring >= 1; ring--) {
                    const r = (radius * ring) / RINGS;
                    context.moveTo(-r, 0);
                    context.arc(0, 0, r, Math.PI, Math.PI * 2);
                }
                context.stroke();
            };
            /** Draws one kamome: half-span `half`, body at (0, 0), wings at `flap` of their beat. */
            const gullAt = (half: number, flap: number, ink: string) => {
                const { tip, shoulder } = gullWings(flap);
                context.lineWidth = GULL.line;
                context.lineJoin = "round";
                context.lineCap = "round";
                context.beginPath();
                context.moveTo(-half, tip * half);
                context.quadraticCurveTo(-half * 0.45, shoulder * half, 0, 0);
                context.quadraticCurveTo(half * 0.45, shoulder * half, half, tip * half);
                context.stroke();
                // A hint of body: a small flat wedge under the join.
                context.fillStyle = ink;
                context.beginPath();
                context.moveTo(-half * 0.09, -half * 0.03);
                context.lineTo(half * 0.09, -half * 0.03);
                context.lineTo(0, half * GULL.body);
                context.closePath();
                context.fill();
            };

            const render = (scroll: number) => {
                const p = plan;
                if (!p) return;
                const { vw, vh, track } = p;

                // Reads first (live boxes), then the canvas and the few DOM writes.
                const seaBox = p.sea?.getBoundingClientRect();
                const footBox = p.footerSea?.getBoundingClientRect();
                const boxes: Box[] = [];
                for (const block of p.blocks) {
                    const r = block.element.getBoundingClientRect();
                    if (r.width === 0 && r.height === 0) continue;
                    if (r.bottom < -120 || r.top > vh + 120) continue;
                    for (let i = 0; i < block.lines.length; i += 4) {
                        boxes.push({ l: r.left + block.lines[i], t: r.top + block.lines[i + 1], r: r.left + block.lines[i + 2], b: r.top + block.lines[i + 3], c: TEXT_CLEARANCE });
                    }
                }
                if (p.floating && p.floating.dataset.state !== "hidden") {
                    const r = p.floating.getBoundingClientRect();
                    boxes.push({ l: r.left, t: r.top, r: r.right, b: r.bottom, c: TEXT_CLEARANCE });
                }
                const disc = p.aboutDisc?.getBoundingClientRect();
                if (disc && disc.width > 0) boxes.push({ l: disc.left, t: disc.top, r: disc.right, b: disc.bottom, c: 10 });

                context.setTransform(dpr, 0, 0, dpr, 0, 0);
                context.clearRect(0, 0, vw, vh);
                context.lineWidth = 1;
                context.strokeStyle = p.primary;

                const sun: SunSample = { x: 0, y: 0, d: 0, o: 0 };
                const before: SunSample = { x: 0, y: 0, d: 0, o: 0 };
                const flat = p.band ? span(scroll, p.band.from - vh * 0.2, p.band.from) * (1 - span(scroll, p.band.to, p.band.to + vh * 0.2)) : 0;

                for (const q of p.particles) {
                    // Still in the sea: the crest breathes with the scroll (its SVG copy hides
                    // once the scroll has moved, so it is drawn once, here).
                    const home = q.home;
                    const homeX = seaBox ? seaBox.left + home.cx : 0;
                    const homeY = seaBox ? seaBox.top + home.base : 0;
                    q.hidden = scroll >= 1;
                    const breath = -3 * (0.5 - 0.5 * Math.cos(2 * Math.PI * (scroll / 360 + home.cx / 280))) * span(scroll, 0, 80);

                    let x = homeX;
                    let y = homeY + breath;
                    let radius = home.radius;
                    let tilt = 0;
                    let gull = 0;
                    let flip = 1;
                    let ink = home.opacity;
                    let alpha = 1;
                    let visible = scroll >= 1;
                    // Not lifted yet: it dissolves with its row.
                    const row = p.rows[q.row];
                    if (row && scroll <= q.detach) alpha = 1 - span(scroll, row.from, row.to);

                    if (scroll > q.detach) {
                        // In the sun's wake: where the sun was `lag` px of scroll ago, around it.
                        const back = scroll - q.lag;
                        sunAt(track, back, sun);
                        const cx = sun.x;
                        const cy = sun.y - back;
                        // In the sky band the flock spreads to both sides of the sun.
                        const angle = haloAngle(cx, vw) + q.theta * (1 + flat) + 0.18 * Math.sin(scroll / 520 + q.index);
                        const out = sun.d / 2 + 22 + q.reach * (sun.d * 0.32 + 36);
                        const airRadius = home.radius * 0.72;
                        // Over the hero's crest until the hero ends; always on screen, with the sun.
                        const hold = 1 - span(scroll, p.heroEnd, p.heroEnd + vh * 0.4);
                        const margin = airRadius * GULL.span + 8;
                        // Where the sun is near an edge, the flock is pressed into the room it has
                        // (its shape kept, never piled against the edge).
                        const reachMax = sun.d * 0.82 + 58;
                        const dx = Math.cos(angle) * out * (1 + 1.4 * flat);
                        const dy = Math.sin(angle) * out * (1 - 0.7 * flat);
                        const roomX = dx >= 0 ? vw - margin - cx : cx - margin;
                        const roomY = dy < 0 ? cy - SKY_TOP - margin : vh - 48 - cy;
                        const kx = Math.min(1, Math.max(0.3, roomX / (reachMax * (1 + 1.4 * flat))));
                        const ky = Math.min(1, Math.max(0.3, roomY / (reachMax * (1 - 0.7 * flat))));
                        const wx = Math.min(vw - margin, Math.max(margin, cx + dx * kx));
                        const onScreen = Math.min(vh - 48, Math.max(SKY_TOP + margin, cy + dy * ky));
                        const wy = seaBox ? lerp(onScreen, Math.min(onScreen, seaBox.top + p.crestTop - airRadius - 16 - q.reach * 90), hold) : onScreen;
                        const airTilt = q.tilt * Math.sin(scroll / 700 + q.index * 1.7);

                        // The lift: up off the crest, then over to the wake.
                        const e = span(scroll, q.detach, q.detach + q.rise);
                        const lift = homeY - 70 * (home.radius / 40);
                        x = bezier(homeX, wx, wx, e);
                        y = bezier(homeY + breath, lift, wy, e);
                        radius = lerp(home.radius, airRadius, e);
                        tilt = airTilt * e;
                        ink = lerp(home.opacity, AIR_OPACITY, e);
                        alpha = lerp(1, sun.o, e);

                        if (!q.gull) {
                            // Not of the flock: it flips away (edge on, gone) as it lifts.
                            const away = span(scroll, q.detach + q.rise * 0.2, q.detach + q.rise * 0.65);
                            flip = Math.cos((Math.PI / 2) * away);
                            if (away >= 1) visible = false;
                        } else {
                            // A gull once clear of the crest, banking along the sun's own motion on screen.
                            gull = span(scroll, q.gullFrom, q.gullTo);
                            if (gull > 0) {
                                const earlier = back - 24;
                                sunAt(track, earlier, before);
                                const vx = cx - before.x;
                                const vy = cy - (before.y - earlier);
                                const bank = Math.max(-0.42, Math.min(0.42, Math.atan2(vy, Math.abs(vx)) * Math.sign(vx) * 0.7)) * clamp01(Math.abs(vx) / 6);
                                tilt = lerp(tilt, bank + airTilt * 0.25, clamp01(gull * 2));
                            }
                            if (q.target && footBox && scroll > q.sink) {
                                // Down into the sunset sea: a scale again (the same flip), behind its crest.
                                const s = clamp01((scroll - q.sink) / Math.max(1, q.sea - q.sink));
                                const tx = footBox.left + q.target.cx;
                                const ty = footBox.top + q.target.base;
                                x = lerp(x, tx, smooth(Math.min(1, s * 1.6)));
                                y = lerp(y, ty, s * s);
                                // Still a gull on the way down; a scale again just before it lands.
                                gull *= 1 - span(s, 0.45, 0.8);
                                radius = lerp(radius, q.target.radius, smooth(s));
                                tilt = lerp(tilt, 0, smooth(s));
                                ink = lerp(ink, q.target.opacity, s);
                                alpha = lerp(alpha, 1, smooth(s * 1.5));
                                if (s >= 1) visible = false;
                            }
                        }
                    } else if (scroll < 1) {
                        q.hidden = false;
                    }

                    if (!visible || alpha <= 0.01) continue;
                    // Extents of the piece: a scale is a half disc on its base line.
                    const gullish = gull >= 0.5;
                    const half = gullish ? radius * GULL.span : radius;
                    const top = gullish ? y - half * 0.75 : y - half;
                    const bottom = gullish ? y + half * 0.4 : y;
                    if (x + half < 0 || x - half > vw || bottom < 0 || top > vh) continue;
                    let clear = 1;
                    for (const box of boxes) {
                        const gap = boxGap(x - half, top, x + half, bottom, box.l, box.t, box.r, box.b);
                        if (gap < box.c + CLEARANCE_RAMP) {
                            clear = Math.min(clear, clamp01((gap - box.c) / CLEARANCE_RAMP));
                            if (clear <= 0) break;
                        }
                    }
                    alpha *= clear;
                    if (alpha <= 0.01) continue;

                    context.save();
                    context.translate(x, y);
                    context.rotate(tilt);
                    // The turn: edge on, then the other face (a scale becomes a gull, and back).
                    context.scale(Math.max(0.04, flip * Math.abs(Math.cos(Math.PI * gull))), 1);
                    if (gullish) {
                        // The wingbeat runs with the scroll (still when the page is still).
                        context.globalAlpha = alpha * Math.max(ink, GULL.ink);
                        gullAt(half, q.wing * Math.sin((2 * Math.PI * scroll) / q.beat + q.phase), p.primary);
                    } else {
                        context.globalAlpha = alpha * ink;
                        context.lineWidth = 1;
                        scaleAt(radius);
                    }
                    context.restore();
                }

                // DOM writes, only on change: the sea's rows and its loose copies.
                for (const row of p.rows) {
                    const t = span(scroll, row.from, row.to);
                    const shown = t <= 0 ? "" : t.toFixed(3);
                    if (row.shown === shown) continue;
                    row.shown = shown;
                    if (t <= 0) {
                        row.group.style.removeProperty("opacity");
                        row.group.style.removeProperty("transform");
                    } else {
                        row.group.style.opacity = (1 - t).toFixed(3);
                        row.group.style.transform = `translateY(${(-6 * t).toFixed(2)}px)`;
                    }
                }
                for (const q of p.particles) {
                    if (!q.group) continue;
                    const want = q.hidden ? "hidden" : "";
                    if (q.group.style.visibility !== want) q.group.style.visibility = want;
                }
            };

            const tick = () => {
                if (document.hidden) return;
                const p = plan;
                if (!p) {
                    // The sea or the sun's path may not be ready yet: try again, gently.
                    const now = performance.now();
                    if (getSunTrack() && now - lastRetry > 500) {
                        lastRetry = now;
                        build();
                    }
                    return;
                }
                // SeaField re-rendered (a new width): its loose copies are new elements.
                if (p.particles[0]?.group && !p.particles[0].group.isConnected) {
                    schedule();
                    return;
                }
                const scroll = Math.min(p.maxScroll, Math.max(0, window.scrollY));
                const now = performance.now();
                if (scroll !== lastScroll) {
                    lastScroll = scroll;
                    // Keep drawing a moment after the scroll stops: the emakimono's scrub settles.
                    liveUntil = now + 1200;
                } else if (now > liveUntil) {
                    return;
                }
                render(scroll);
            };

            const schedule = () => {
                cancelAnimationFrame(frame);
                frame = requestAnimationFrame(build);
            };

            build();
            const offTrack = onSunTrack(schedule);
            const sizeObserver = new ResizeObserver(() => {
                resize();
                liveUntil = performance.now() + 100;
            });
            sizeObserver.observe(canvas);
            // Text that moves in the layout (a refresh, a font swap) is measured again.
            ScrollTrigger.addEventListener("refresh", schedule);
            gsap.ticker.add(tick);

            return () => {
                gsap.ticker.remove(tick);
                offTrack();
                sizeObserver.disconnect();
                ScrollTrigger.removeEventListener("refresh", schedule);
                cancelAnimationFrame(frame);
                release();
                plan = null;
            };
        });

        return () => mm.revert();
    }, { scope });

    return scope;
}

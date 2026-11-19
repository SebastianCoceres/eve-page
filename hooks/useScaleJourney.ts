import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { looseCrestFor, seaFor, RINGS, type SeigaihaScale } from "@/lib/seigaiha";
import { docRect, stickyTravel, type StickyTravel } from "@/lib/sunPath";
import { getSunTrack, onSunTrack, sunAt, type SunSample, type SunTrack } from "@/lib/sunTrack";
import { getEmakiPinRange } from "@/hooks/useEmakiScroll";
import { getHeroPinRange } from "@/hooks/useHeroAnimation";
import {
    CLEARANCE_RAMP, MOMIJI, TEXT_CLEARANCE, bezier, boxGap, clamp01, haloAngle, hash, lerp, smooth, span,
} from "@/lib/scaleJourney";

/** Scales that settle into each emakimono fan: one becomes the fan, the rest fold into it. */
const PER_FAN = { wide: 8, narrow: 3 };
/** Line opacity of a scale in the air, and of a fan (EmakiFan). */
const AIR_OPACITY = 0.55;
const FAN_OPACITY = 0.7;

type Box = { l: number; t: number; r: number; b: number; c: number };
type Lines = { element: Element; lines: number[] };

interface Particle {
    index: number;
    home: SeigaihaScale;
    /** Emakimono fan it settles into, or -1 (it becomes a leaf). */
    fan: number;
    /** The one scale of its fan that becomes the fan (the others fold into it). */
    lead: boolean;
    /** Scroll px it trails the sun by. */
    lag: number;
    /** Its place on the halo: angle off the halo's opening, and how far out (0–1). */
    theta: number;
    reach: number;
    tilt: number;
    detach: number;
    rise: number;
    /** Leaf: when it turns, settles, leaves its lane, starts to sink and is in the sea. */
    turn: number;
    settle: number;
    leave: number;
    sink: number;
    sea: number;
    /** Leaf: place in its lane (0–1), size, and whether it is a print of the sun's colour. */
    laneX: number;
    laneY: number;
    size: number;
    filled: boolean;
    /** Footer crest scale it sinks into. */
    target: SeigaihaScale | null;
    /** The hero sea's own copy of this scale. */
    group: SVGGElement | null;
    hidden: boolean;
}

interface Fan {
    svg: SVGSVGElement;
    /** Scroll positions where its scales set off and where they land. */
    from: number;
    land: number;
    shown: boolean | null;
}

interface Plan {
    track: SunTrack;
    vw: number;
    vh: number;
    maxScroll: number;
    particles: Particle[];
    fans: Fan[];
    sea: SVGSVGElement | null;
    footerSea: SVGSVGElement | null;
    blocks: Lines[];
    floating: HTMLElement | null;
    aboutDisc: Element | null;
    sticky: HTMLElement | null;
    stickyTitle: Element | null;
    aboutOpen: Element | null;
    travel: StickyTravel | null;
    gutter: number;
    /** Until when the wake is held inside the viewport (the hero's spray stays in view). */
    heroEnd: number;
    /** The highest crest apex in the hero sea's own box (px from its top). */
    crestTop: number;
    /** Scroll range over which the halo flattens into the emakimono's sky band. */
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
 * "Las escamas viajan con el sol": the seigaiha scales are the thread that
 * follows the sun through the day.
 *
 * 1. Hero: the sea's crest breathes with the scroll while the sun rises; then its
 *    crest scales lift off one by one (nearest the sun first), as spray, and rise
 *    into the sun's wake. Each one leaves the sea (its own SVG copy is hidden): it
 *    is never drawn twice.
 * 2. In the air they trail the sun (its place a few scroll px ago) and ring it as
 *    a halo that opens away from the text (east of the middle it opens east, west
 *    of it west, turning over the top in between), flattened into the sky band in
 *    the emakimono. In Mi enfoque they follow its crossing as a wake.
 * 3. Servicios: a few scales settle into each panel's fan as it comes in; the
 *    last one becomes the fan (same geometry, same line) and the fan is shown in
 *    that frame, the others fold into it.
 * 4. Sobre mí, autumn: the others turn into momiji (a flip: the scale goes edge on
 *    and comes back a leaf) and fall slowly in the left column, near the parked
 *    sun, never over text or the disc.
 * 5. Footer: they follow the setting sun down, turn back into scales and sink
 *    into the sunset sea behind its crest, where the hanko stamps the day.
 *
 * Drawn on one canvas, fixed to the viewport, behind the sun, main and the footer
 * (so the sun and the seas occlude the scales the way rows of a print do). It reads the
 * sun's path (lib/sunTrack) instead of owning a sun: every place is an exact
 * function of the live scroll, like the sun's; nothing is eased in time, nothing
 * trails or springs back. Every piece keeps 24px from any text, control or the
 * floating Contáctame, and fades out before it would come closer.
 * The work stops while the scroll is still (after the scrubbed emakimono settles)
 * and while the tab is hidden. Reduced motion: nothing runs, the seas and fans
 * are drawn as they are.
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
                plan?.fans.forEach((fan) => fan.svg.style.removeProperty("opacity"));
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
                const crest = seaFor("hero", seaWidth, looseCrestFor(seaWidth)).crest;
                const groups = new Map<number, SVGGElement>();
                sea.querySelectorAll<SVGGElement>("[data-sea-scale]").forEach((g) => groups.set(Number(g.dataset.seaScale), g));
                if (crest.length === 0 || groups.size === 0) return;

                // The hero's scroll: its pin from 768px, else the stage scrolling away.
                const heroPin = getHeroPinRange();
                const hero = heroPin ?? { start: 0, end: vh * 0.9 };
                const heroSpan = Math.max(1, hero.end - hero.start);

                // Emakimono fans: when each one's scales set off and land.
                const emakiPin = getEmakiPinRange();
                const fanSvgs = [...document.querySelectorAll<SVGSVGElement>("[data-emaki-fan] svg")];
                const fans: Fan[] = [];
                const emakiTrack = document.querySelector<HTMLElement>("[data-emaki-track]");
                const viewport = document.querySelector<HTMLElement>("[data-emaki-viewport]");
                if (emakiPin && emakiTrack && viewport) {
                    const pinSpan = Math.max(1, emakiPin.end - emakiPin.start);
                    const distance = Math.max(1, emakiTrack.scrollWidth - viewport.clientWidth);
                    const x = Number(gsap.getProperty(emakiTrack, "x")) || 0;
                    const flight = pinSpan * 0.2;
                    let previous = emakiPin.start;
                    fanSvgs.forEach((svg, g) => {
                        const r = svg.getBoundingClientRect();
                        // Its centre at the start of the unroll, and where it lands (60% across).
                        const atStart = (r.left + r.right) / 2 - x;
                        const progress = (atStart - vw * 0.6) / distance;
                        const land = Math.min(emakiPin.end, Math.max(emakiPin.start + progress * pinSpan, previous + pinSpan * 0.07, emakiPin.start + flight + g * 8));
                        previous = land;
                        fans.push({ svg, from: land - flight, land, shown: null });
                    });
                } else {
                    // Stacked: the fan lands as its base reaches 62% of the viewport.
                    fanSvgs.forEach((svg) => {
                        const base = docRect(svg).b;
                        const land = Math.max(1, base - vh * 0.62);
                        fans.push({ svg, from: land - vh * 0.4, land, shown: null });
                    });
                }

                // Sobre mí: when the sun is parked as the disc (read off its path).
                const aboutDisc = document.querySelector('[data-sun-anchor="about"]');
                const sticky = document.querySelector<HTMLElement>("[data-sun-sticky]");
                const travel = stickyTravel(sticky);
                let parkFrom = -1;
                let parkTo = -1;
                if (aboutDisc && aboutDisc.getBoundingClientRect().width > 0) {
                    const rest = docRect(aboutDisc);
                    const restY = (rest.t + rest.b) / 2 - (travel ? travel.now : 0);
                    const restX = (rest.l + rest.r) / 2;
                    const sample: SunSample = { x: 0, y: 0, d: 0, o: 0 };
                    for (let s = 0; s <= maxScroll; s += track.step) {
                        sunAt(track, s, sample);
                        const y = restY + (travel ? Math.min(travel.total, Math.max(0, s - travel.start)) : 0);
                        if (Math.abs(sample.x - restX) < 3 && Math.abs(sample.y - y) < 3) {
                            if (parkFrom < 0) parkFrom = s;
                            parkTo = s;
                        }
                    }
                }
                const about = document.getElementById("about");
                if (parkFrom < 0 && about) {
                    const top = docRect(about).t;
                    parkFrom = top - vh * 0.4;
                    parkTo = top + vh * 0.6;
                }
                // Where the column does not stick, the leaves fall beside the disc for as
                // long as it is in view, not only while the sun rests on it.
                if (!travel && aboutDisc && aboutDisc.getBoundingClientRect().width > 0) {
                    const rest = docRect(aboutDisc);
                    parkFrom = Math.min(parkFrom, rest.t - vh * 0.75);
                    parkTo = Math.max(parkTo, rest.b - vh * 0.2);
                }
                const leafSpan = Math.max(vh * 0.4, parkTo - parkFrom);

                // The footer sea's crest, nearest the setting sun first (clear of the seal).
                const footerSea = document.querySelector<SVGSVGElement>('[data-sea-field="footer"] [data-sea-svg]');
                const footerWidth = footerSea ? Math.round(footerSea.getBoundingClientRect().width) : vw;
                const sunset = track.x[track.x.length - 1];
                const fanCount = fans.length * PER_FAN[wide ? "wide" : "narrow"];
                const leafCount = Math.max(0, crest.length - fanCount);
                const sinkInto = footerSea
                    ? seaFor("footer", footerWidth, leafCount * 2).crest
                        .filter((s) => s.cx + s.radius < footerWidth - 120)
                        .sort((a, b) => Math.abs(a.cx - sunset) - Math.abs(b.cx - sunset))
                    : [];

                // Lift order: nearest the sun (east) first.
                const byX = [...crest].sort((a, b) => b.cx - a.cx);
                const rank = new Map(byX.map((s, k) => [s, k]));
                // Which scales settle into fans: spread over the crest, not one end of it.
                const order = crest.map((_, k) => k).sort((a, b) => hash(a, 7) - hash(b, 7));
                const fanOf = new Map<number, number>();
                const leads = new Set<number>();
                order.slice(0, fanCount).forEach((k, n) => {
                    fanOf.set(k, n % Math.max(1, fans.length));
                    if (n < fans.length) leads.add(k);
                });

                let leaf = 0;
                const particles: Particle[] = crest.map((home, index) => {
                    const fan = fanOf.get(index) ?? -1;
                    const k = (rank.get(home) ?? 0) / Math.max(1, crest.length - 1);
                    const detach = hero.start + heroSpan * (0.04 + 0.5 * k + 0.04 * hash(index, 1));
                    const leafIndex = fan < 0 ? leaf++ : -1;
                    const u = hash(index, 5);
                    const turn = parkFrom - vh * 0.1 + u * Math.min(vh * 0.3, leafSpan * 0.3);
                    const settle = turn + Math.min(vh * 0.25, leafSpan * 0.3);
                    const leave = Math.max(settle + vh * 0.1, parkTo - vh * 0.05 + hash(index, 6) * vh * 0.2);
                    const sea = maxScroll - hash(index, 8) * vh * 0.1;
                    return {
                        index,
                        home,
                        fan,
                        lead: leads.has(index),
                        lag: hash(index, 2) * vh * (wide ? 0.22 : 0.15),
                        theta: (hash(index, 3) - 0.5) * 3.3,
                        reach: hash(index, 4),
                        tilt: (hash(index, 9) - 0.5) * 1.2,
                        detach,
                        rise: heroSpan * 0.32,
                        turn,
                        settle,
                        leave,
                        sink: Math.max(leave + vh * 0.3, sea - vh * 0.75),
                        sea,
                        laneX: hash(index, 10),
                        laneY: hash(index, 11),
                        size: hash(index, 12),
                        filled: leafIndex % 3 === 1,
                        target: leafIndex >= 0 && sinkInto.length ? sinkInto[leafIndex % sinkInto.length] : null,
                        group: groups.get(home.id) ?? null,
                        hidden: false,
                    };
                });

                // The halo flattens into the emakimono's sky band (it never reaches the heading).
                const band = emakiPin ? { from: emakiPin.start, to: emakiPin.end } : null;
                const css = getComputedStyle(document.documentElement);
                plan = {
                    track, vw, vh, maxScroll, particles, fans, sea, footerSea,
                    heroEnd: hero.end,
                    crestTop: Math.min(...crest.map((s) => s.base - s.radius)),
                    blocks: collectBlocks(),
                    floating: document.querySelector<HTMLElement>("[data-floating-contact]"),
                    aboutDisc,
                    sticky,
                    stickyTitle: sticky?.querySelector("h2") ?? null,
                    aboutOpen: document.querySelector("[data-about-open]"),
                    travel,
                    gutter: vw >= 1280 ? Math.max(40, (vw - 1200) / 2) : wide ? 40 : 24,
                    band,
                    primary: css.getPropertyValue("--primary").trim() || "#1e4ba8",
                };
                canvas.dataset.particles = String(particles.length);
                canvas.dataset.leaves = String(leafCount);
                canvas.dataset.park = `${Math.round(parkFrom)},${Math.round(parkTo)}`;
                canvas.dataset.fans = fans.map((fan) => Math.round(fan.land)).join(",");
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
            const leafOutline = new Path2D(MOMIJI.outline);
            const leafStem = new Path2D(MOMIJI.stem);

            // A leaf's radius: larger beside the wide sticky column, smaller on phones.
            const leafSize = (q: Particle) => (plan && plan.vw >= 768 ? 13 + 7 * q.size : 10 + 4 * q.size);

            const render = (scroll: number) => {
                const p = plan;
                if (!p) return;
                const { vw, vh, track } = p;

                // Reads first (live boxes), then the canvas and the few DOM writes.
                const seaBox = p.sea?.getBoundingClientRect();
                const footBox = p.footerSea?.getBoundingClientRect();
                const fanBoxes = p.fans.map((fan) => fan.svg.getBoundingClientRect());
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
                // Sobre mí's leaf lane: the left column under its heading (sticky from 1280px),
                // or beside the disc where the column does not stick.
                let lane: { l: number; t: number; r: number; b: number } | null = null;
                if (disc && disc.width > 0) {
                    if (p.travel && p.sticky) {
                        const column = p.sticky.getBoundingClientRect();
                        const title = p.stickyTitle?.getBoundingClientRect();
                        const open = p.aboutOpen?.getBoundingClientRect();
                        lane = {
                            l: column.left,
                            r: Math.min(column.left + Math.max(disc.width * 2.2, 240), open ? open.left - 40 : column.right),
                            t: (title ? title.bottom : column.top) + 36,
                            b: Math.min(vh - 40, column.bottom + vh * 0.5),
                        };
                    } else {
                        lane = { l: disc.right + 36, r: vw - p.gutter - 8, t: disc.top - 4, b: disc.bottom + 24 };
                    }
                    if (lane.r - lane.l < 40) lane = null;
                }
                const sunColor = document.documentElement.style.getPropertyValue("--sun-now").trim() || getComputedStyle(document.documentElement).getPropertyValue("--sun").trim();

                context.setTransform(dpr, 0, 0, dpr, 0, 0);
                context.clearRect(0, 0, vw, vh);
                context.lineWidth = 1;
                context.strokeStyle = p.primary;
                context.fillStyle = sunColor;

                const sun: SunSample = { x: 0, y: 0, d: 0, o: 0 };
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
                    let morph = 0;
                    let ink = home.opacity;
                    let alpha = 1;
                    let visible = scroll >= 1;

                    if (scroll > q.detach) {
                        // In the sun's wake: where the sun was `lag` px of scroll ago, on its halo.
                        sunAt(track, scroll - q.lag, sun);
                        const cx = sun.x;
                        const cy = sun.y - (scroll - q.lag);
                        const angle = haloAngle(cx, vw) + q.theta + 0.18 * Math.sin(scroll / 520 + q.index);
                        const out = sun.d / 2 + 22 + q.reach * (sun.d * 0.32 + 36);
                        // Flattened and spread along the emakimono's sky band; held in view
                        // through the hero, so the spray is seen before it follows the sun out.
                        const airRadius = home.radius * 0.72;
                        const hold = 1 - span(scroll, p.heroEnd, p.heroEnd + vh * 0.4);
                        const free = cx + Math.cos(angle) * out * (1 + 1.4 * flat);
                        const wx = lerp(free, Math.min(vw - airRadius - 8, Math.max(airRadius + 8, free)), hold);
                        const sky = cy + Math.sin(angle) * out * (1 - 0.7 * flat);
                        // Never back down into the sea it left (the rising sun is still behind it).
                        const wy = seaBox ? lerp(sky, Math.min(sky, seaBox.top + p.crestTop - airRadius - 16 - q.reach * 90), hold) : sky;
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

                        if (q.fan >= 0) {
                            // 3. Into its fan, then gone: the fan itself takes over.
                            const fan = p.fans[q.fan];
                            const box = fanBoxes[q.fan];
                            if (scroll >= fan.land) visible = false;
                            else if (scroll > fan.from && box.width > 0) {
                                const f = clamp01((scroll - fan.from) / (fan.land - fan.from));
                                const tx = (box.left + box.right) / 2;
                                const ty = box.bottom;
                                // Down (or up) to the fan's line first, then along it.
                                x = lerp(x, tx, smooth(f));
                                y = lerp(y, ty, smooth(Math.min(1, f * 1.8)));
                                radius = lerp(radius, box.width / 2, smooth(f));
                                tilt = lerp(tilt, 0, smooth(f));
                                ink = lerp(ink, FAN_OPACITY, f);
                                alpha = lerp(alpha, 1, smooth(f * 2));
                                // The others fold into the one that becomes the fan.
                                if (!q.lead) alpha *= 1 - smooth((f - 0.55) / 0.45);
                            }
                        } else if (scroll > q.turn) {
                            // 4. A momiji in Sobre mí's left column, then 5. back into the wake.
                            const inLane = span(scroll, q.turn, q.settle) * (1 - span(scroll, q.leave, q.leave + vh * 0.35));
                            morph = span(scroll, q.turn, q.settle);
                            if (lane) {
                                const fall = clamp01(q.laneY * 0.55 + 0.45 * (scroll - q.turn) / Math.max(1, q.leave - q.turn));
                                const size = leafSize(q);
                                const lx = lane.l + size + q.laneX * Math.max(0, lane.r - lane.l - 2 * size) + 9 * Math.sin(scroll / 260 + q.index);
                                const ly = lane.t + size + fall * Math.max(0, lane.b - lane.t - 2 * size);
                                x = lerp(x, lx, inLane);
                                y = lerp(y, ly, inLane);
                                alpha = lerp(alpha, 1, inLane);
                                tilt = lerp(tilt, q.tilt * 0.8 + 0.5 * Math.sin(scroll / 300 + q.index * 2.3), inLane);
                            }
                            radius = lerp(radius, leafSize(q), morph);
                            if (q.target && footBox && scroll > q.sink) {
                                // Down into the sunset sea, a scale again, behind its crest.
                                const s = clamp01((scroll - q.sink) / Math.max(1, q.sea - q.sink));
                                const tx = footBox.left + q.target.cx;
                                const ty = footBox.top + q.target.base;
                                x = lerp(x, tx, smooth(Math.min(1, s * 1.6)));
                                y = lerp(y, ty, s * s);
                                morph *= 1 - smooth(s * 1.8);
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
                    // Half extents of the piece: a scale is a half disc on its base line.
                    const leafish = morph >= 0.5;
                    const half = radius;
                    const top = y - half;
                    const bottom = leafish ? y + half : y;
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
                    // The turn: edge on, then the other face (a scale becomes a leaf, and back).
                    context.scale(Math.max(0.04, Math.abs(Math.cos(Math.PI * morph))), 1);
                    if (!leafish) {
                        context.globalAlpha = alpha * ink;
                        scaleAt(radius);
                    } else {
                        const k = radius / 50;
                        context.scale(k, k);
                        context.lineWidth = 1 / k;
                        if (q.filled) {
                            context.globalAlpha = alpha * 0.9;
                            context.fill(leafOutline);
                            context.stroke(leafStem);
                        } else {
                            context.globalAlpha = alpha * 0.8;
                            context.stroke(leafOutline);
                            context.stroke(leafStem);
                        }
                    }
                    context.restore();
                }

                // DOM writes, only on change: the sea's copies and the fans.
                for (const q of p.particles) {
                    if (!q.group) continue;
                    const want = q.hidden ? "hidden" : "";
                    if (q.group.style.visibility !== want) q.group.style.visibility = want;
                }
                p.fans.forEach((fan) => {
                    const shown = scroll >= fan.land;
                    if (fan.shown === shown) return;
                    fan.shown = shown;
                    fan.svg.style.opacity = shown ? "1" : "0";
                });
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

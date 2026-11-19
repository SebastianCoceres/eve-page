/**
 * Layout maths for "El viaje del sol". Everything is in document coordinates.
 *
 * For each section the sun gets a keyframe "zone": the free spot nearest a target
 * x (east to west across the page) whose disc keeps at least CLEARANCE px from
 * every text block and opaque surface, and that can slide out to its side edge
 * through empty space. Between zones the sun goes sideways through that space to
 * its side edge and waits there in view (see the passage in useTravelingSun).
 */

export interface Rect { l: number; t: number; r: number; b: number }
export interface Point { x: number; y: number }
export interface Zone extends Point { d: number }

/** An element's box in document coordinates. */
export const docRect = (element: Element): Rect => {
    const r = element.getBoundingClientRect();
    return { l: r.left, t: r.top + window.scrollY, r: r.right, b: r.bottom + window.scrollY };
};

/**
 * A sticky block's travel (Sobre mí's left column, `[data-sun-sticky]`, which
 * rests at the top of its grid cell): how far it has moved down its cell now and
 * at most (px), and the scroll range over which it moves. Null when it is not
 * sticky at this width.
 */
export type StickyTravel = { now: number; total: number; start: number; end: number };
export function stickyTravel(sticky: HTMLElement | null): StickyTravel | null {
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

export const CLEARANCE = 48;
/** The least room between a parked disc and the top of the viewport. */
export const SKY_TOP = 32;

/**
 * Scroll position at which a parked sun sits at `fraction` of the viewport
 * height, nudged so the whole disc stays in view: its top at least
 * SKY_TOP below the top edge and its bottom 24px above the bottom edge.
 */
export function parkedScroll(zone: Zone, fraction: number, viewportHeight: number) {
    const radius = zone.d / 2;
    const wanted = zone.y - viewportHeight * fraction;
    const latest = zone.y - radius - SKY_TOP; // disc top just under the top edge
    const earliest = zone.y + radius + 24 - viewportHeight; // disc bottom above the fold
    return Math.max(earliest, Math.min(wanted, latest));
}

const circleHitsRect = (cx: number, cy: number, radius: number, rect: Rect) => {
    const nx = Math.max(rect.l, Math.min(cx, rect.r));
    const ny = Math.max(rect.t, Math.min(cy, rect.b));
    return (nx - cx) ** 2 + (ny - cy) ** 2 < radius * radius;
};
const rectsOverlap = (a: Rect, b: Rect) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;

export interface ZoneQuery {
    section: Rect;
    obstacles: Rect[];
    viewportWidth: number;
    viewportHeight: number;
    /** Preferred centre x as a fraction of the viewport width. */
    targetX: number;
    /** Sizes to try, largest first. */
    sizes: number[];
}

/** The best free zone in a section, or null when none of the sizes fits. */
export function findZone({ section, obstacles, viewportWidth, viewportHeight, targetX, sizes }: ZoneQuery): Zone | null {
    const step = 12;
    const local = obstacles.filter((o) => o.b > section.t - 400 && o.t < section.b + 400);
    const wantX = targetX * viewportWidth;
    const wantY = section.t + viewportHeight * 0.3;

    for (const d of sizes) {
        const radius = d / 2;
        let best: Zone | null = null;
        let bestScore = Infinity;
        const yEnd = Math.min(section.b - radius, section.t + viewportHeight * 1.1);

        for (let y = section.t + radius; y <= yEnd; y += step) {
            // Parked whole: never half cut by the page edge.
            // Parked whole (never half cut by the page edge) and on its side of the day:
            // a west chapter never parks east of the middle, nor an east one west of it.
            const west = targetX < 0.5;
            const xMin = west ? radius + 8 : Math.max(radius + 8, viewportWidth / 2);
            const xMax = west ? Math.min(viewportWidth / 2, viewportWidth - radius - 8) : viewportWidth - radius - 8;
            for (let x = xMin; x <= xMax; x += step) {
                if (local.some((o) => circleHitsRect(x, y, radius + CLEARANCE, o))) continue;
                // It must be able to leave sideways through empty space.
                const toRight = x >= viewportWidth / 2;
                const band: Rect = {
                    l: toRight ? x : 0,
                    r: toRight ? viewportWidth : x,
                    t: y - radius - CLEARANCE / 2,
                    b: y + radius + CLEARANCE / 2,
                };
                if (local.some((o) => rectsOverlap(band, o))) continue;
                const score = Math.abs(x - wantX) + 0.6 * Math.abs(y - wantY);
                if (score < bestScore) {
                    bestScore = score;
                    best = { x, y, d };
                }
            }
        }
        if (best) return best;
    }
    return null;
}

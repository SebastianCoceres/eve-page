/**
 * Layout maths for "El viaje del sol". Everything is in document coordinates.
 *
 * For each section the sun gets a keyframe "zone": the free spot nearest a target
 * x (east to west across the page) whose disc keeps at least CLEARANCE px from
 * every text block and opaque surface, and that can slide out to its side edge
 * through empty space. Between zones the sun leaves sideways through that space
 * and changes height only out of view (see the passage in useTravelingSun).
 */

export interface Rect { l: number; t: number; r: number; b: number }
export interface Point { x: number; y: number }
export interface Zone extends Point { d: number }

export const CLEARANCE = 48;
/** The sticky navbar's height: an occupied band at the top of every viewport. */
export const NAVBAR = 64;

/**
 * Scroll position at which a parked sun sits at `fraction` of the viewport
 * height, nudged so the whole disc stays below the navbar (top at least
 * NAVBAR + 32px) and above the bottom edge (24px).
 */
export function parkedScroll(zone: Zone, fraction: number, viewportHeight: number) {
    const radius = zone.d / 2;
    const wanted = zone.y - viewportHeight * fraction;
    const latest = zone.y - radius - (NAVBAR + 32); // disc top just below the navbar
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

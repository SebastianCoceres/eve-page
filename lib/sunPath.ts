/**
 * Layout maths for "El viaje del sol". Everything is in document coordinates.
 *
 * For each section the sun gets a keyframe "zone": the free spot nearest a target
 * x (east to west across the page) whose disc keeps at least CLEARANCE px from
 * every text block and opaque surface, and that can slide out to its side edge
 * through empty space. Between zones the sun is routed through whitespace only:
 * out to the side margin, along the margin, across the gap between the two
 * sections, then in to the next zone.
 */

export interface Rect { l: number; t: number; r: number; b: number }
export interface Point { x: number; y: number }
export interface Zone extends Point { d: number }

export const CLEARANCE = 48;

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
            for (let x = radius * 0.4; x <= viewportWidth - radius * 0.4; x += step) {
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

/**
 * Waypoints from one zone to the next through whitespace: out to the side margin,
 * down that margin to the gap between the sections, across the gap if the sides
 * differ, down the other margin, and in.
 */
export function route(from: Zone, to: Zone, gapY: number, viewportWidth: number, contentLeft: number, contentRight: number): Point[] {
    const marginX = (side: "left" | "right", d: number) =>
        side === "right" ? contentRight + 48 + d / 2 : contentLeft - 48 - d / 2;
    const sideOf = (zone: Zone) => (zone.x >= viewportWidth / 2 ? "right" : "left");
    const a = sideOf(from);
    const b = sideOf(to);
    const d = Math.max(from.d, to.d);

    const points: Point[] = [{ x: from.x, y: from.y }, { x: marginX(a, d), y: from.y }, { x: marginX(a, d), y: gapY }];
    if (a !== b) points.push({ x: marginX(b, d), y: gapY });
    points.push({ x: marginX(b, d), y: to.y }, { x: to.x, y: to.y });
    return points;
}

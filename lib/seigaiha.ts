/**
 * Seigaiha (青海波) generator: rows of fan-shaped "scales", each a stack of
 * concentric semicircles, in the classic rhythm.
 *
 * - A scale has radius R and width 2R. Scales in a row touch at their base corners.
 * - Each row sits R/2 below the previous one and is shifted by R, so a scale's
 *   apex lands in the notch between the two scales behind it.
 * - Rows are drawn back to front. Every scale carries an opaque full-circle fill in
 *   the page colour (only its upper half is ever visible), so nearer rows hide the
 *   lower part of farther rows: that produces the pointed fan silhouette. Full
 *   circles, not half-discs, close the hairline gaps at each apex, so nothing
 *   behind the field (the sun) can show through.
 * - Swell: an optional per-column cut drops whole scales from the back rows, so
 *   the sea's top edge rises and falls in a slow swell built only from complete
 *   scales (no half-scale artifacts).
 * - Depth: each row has one flat line opacity, rising from the back (lighter, far)
 *   to the front (darker, near). Flat per-row values, never gradients.
 *
 * Geometry is in CSS pixels (the SVG viewBox is 1:1 with its box), so a 1px stroke
 * lands on device pixels. Rows run one scale past each edge, so the viewport
 * crops whole scales. Pure functions, no DOM.
 */

export interface SeigaihaRow {
    /** Back (0) to front. */
    index: number;
    /** y of the scales' base line. */
    base: number;
    /** Line opacity for the whole row. */
    opacity: number;
    /** Opaque discs that occlude the rows behind. */
    fill: string;
    /** The concentric arcs. */
    stroke: string;
}

export interface SeigaihaField {
    width: number;
    height: number;
    radius: number;
    rows: SeigaihaRow[];
}

export interface SeigaihaOptions {
    width: number;
    radius: number;
    rows: number;
    /** Concentric rings per scale, outermost included (4: the calm, classic count). */
    rings?: number;
    /** First visible row for a scale centred at x (whole scales only). */
    cut?: (x: number) => number;
    /** Line opacity of the back row and of the front row. */
    opacity?: [number, number];
}

// Two decimals is far below a device pixel and keeps the path strings short.
const n = (value: number) => Math.round(value * 100) / 100;

const disc = (cx: number, base: number, r: number) =>
    `M${n(cx - r)} ${n(base)}A${n(r)} ${n(r)} 0 1 1 ${n(cx + r)} ${n(base)}A${n(r)} ${n(r)} 0 1 1 ${n(cx - r)} ${n(base)}Z`;

const arc = (cx: number, base: number, r: number) =>
    `M${n(cx - r)} ${n(base)}A${n(r)} ${n(r)} 0 0 1 ${n(cx + r)} ${n(base)}`;

export function seigaiha({ width, radius, rows, rings = 4, cut, opacity = [0.55, 0.55] }: SeigaihaOptions): SeigaihaField {
    const period = radius * 2;
    const step = radius / 2;
    const height = radius + (rows - 1) * step;
    const result: SeigaihaRow[] = [];

    for (let index = 0; index < rows; index++) {
        const base = radius + index * step;
        const shift = index % 2 === 0 ? 0 : radius;
        const t = rows > 1 ? index / (rows - 1) : 1;
        let fill = "";
        let stroke = "";

        for (let cx = shift - period; cx <= width + period; cx += period) {
            if (cut && index < cut(cx)) continue;
            fill += disc(cx, base, radius);
            for (let ring = rings; ring >= 1; ring--) {
                stroke += arc(cx, base, (radius * ring) / rings);
            }
        }

        if (stroke) {
            result.push({ index, base, opacity: n(opacity[0] + (opacity[1] - opacity[0]) * t), fill, stroke });
        }
    }

    return { width, height, radius, rows: result };
}

/**
 * A slow swell: `maxCut` rows are dropped where the sea is lowest and none where
 * it peaks. `rise` is the side the swell climbs toward. Eased with a half cosine
 * that peaks at 85% of the width and stays there, so the crest sits under the sun.
 */
export function swell(width: number, maxCut: number, rise: "right" | "left") {
    return (x: number) => {
        const along = Math.min(1, Math.max(0, x / width));
        const u = rise === "right" ? along : 1 - along;
        const height = (1 - Math.cos(Math.PI * Math.min(1, u / 0.85))) / 2;
        return Math.round(maxCut * (1 - height));
    };
}

export type SeaKind = "hero" | "footer";

/**
 * Presets per placement and viewport: 80px scales from 768px up, 48px on phones.
 * Heights must match the reserved heights in SeaField:
 * hero 280 / 192, footer 200 / 120. The full sea appears only in these two places.
 */
export function seaFor(kind: SeaKind, width: number): SeigaihaField {
    const wide = width >= 768;
    const radius = wide ? 40 : 24;

    switch (kind) {
        case "hero":
            return seigaiha({
                width, radius, rows: wide ? 13 : 15,
                cut: swell(width, wide ? 6 : 4, "right"),
                opacity: [0.3, 0.7],
            });
        case "footer":
            return seigaiha({
                width, radius, rows: 9,
                cut: swell(width, wide ? 4 : 3, "left"),
                opacity: [0.3, 0.65],
            });
    }
}

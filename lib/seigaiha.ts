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
 *
 * Geometry is in CSS pixels (the SVG viewBox is 1:1 with its box), so a 1px stroke
 * lands on device pixels. Rows run two scales past each edge so they can drift
 * by exactly one scale width and wrap with no seam. Pure functions, no DOM.
 */

export interface SeigaihaRow {
    /** Back (0) to front. */
    index: number;
    /** y of the scales' base line. */
    base: number;
    /** Opaque discs that occlude the rows behind. */
    fill: string;
    /** The concentric arcs. */
    stroke: string;
}

export interface SeigaihaField {
    width: number;
    height: number;
    radius: number;
    /** Horizontal period of the pattern (one scale width, 2R). */
    period: number;
    rows: SeigaihaRow[];
}

export interface SeigaihaOptions {
    width: number;
    radius: number;
    rows: number;
    /** Concentric rings per scale, outermost included (4: the calm, classic count). */
    rings?: number;
}

// Two decimals is far below a device pixel and keeps the path strings short.
const n = (value: number) => Math.round(value * 100) / 100;

const disc = (cx: number, base: number, r: number) =>
    `M${n(cx - r)} ${n(base)}A${n(r)} ${n(r)} 0 1 1 ${n(cx + r)} ${n(base)}A${n(r)} ${n(r)} 0 1 1 ${n(cx - r)} ${n(base)}Z`;

const arc = (cx: number, base: number, r: number) =>
    `M${n(cx - r)} ${n(base)}A${n(r)} ${n(r)} 0 0 1 ${n(cx + r)} ${n(base)}`;

export function seigaiha({ width, radius, rows, rings = 4 }: SeigaihaOptions): SeigaihaField {
    const period = radius * 2;
    const step = radius / 2;
    const height = radius + (rows - 1) * step;
    const result: SeigaihaRow[] = [];

    for (let index = 0; index < rows; index++) {
        const base = radius + index * step;
        const shift = index % 2 === 0 ? 0 : radius;
        let fill = "";
        let stroke = "";

        for (let cx = shift - 2 * period; cx <= width + 2 * period; cx += period) {
            fill += disc(cx, base, radius);
            for (let ring = rings; ring >= 1; ring--) {
                stroke += arc(cx, base, (radius * ring) / rings);
            }
        }

        result.push({ index, base, fill, stroke });
    }

    return { width, height, radius, period, rows: result };
}

/**
 * Scale and density per viewport: 80px scales on desktop, 48px on phones. Heights
 * (280px / 192px) must match --field-h in HeroSeigaiha.
 */
export function seigaihaFor(width: number): SeigaihaField {
    return width >= 768
        ? seigaiha({ width, radius: 40, rows: 13 })
        : seigaiha({ width, radius: 24, rows: 15 });
}

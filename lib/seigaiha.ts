/**
 * Seigaiha (青海波) generator: rows of fan-shaped "scales", each a stack of
 * concentric semicircles, receding toward the horizon.
 *
 * - A scale has radius r and width 2r. Scales in a row touch at their base corners;
 *   every other row is shifted by half a period, so a scale's apex lands in the
 *   notch between the two scales behind it.
 * - Depth: scales step down toward the horizon in three tiers, from the full
 *   radius R at the front (bottom) to `depth`·R (0.6R) at the top. Rows are spaced
 *   by half their mean radius, so the rhythm holds at every size, and every tier
 *   is laid out from one x (under the sun), so the tiers line up where the eye is.
 * - Rows are drawn back to front. Each scale's fill is its upper half-disc plus
 *   the full column below its base line, in the paper colour, overlapping its
 *   neighbours by half a pixel: the rows in front hide everything below their
 *   crests exactly, and nothing behind the sea (the sun) shows through a seam.
 * - Swell: a scale whose crest would rise above the swell line at its x is
 *   dropped, so the sea's top edge rises and falls with whole scales only.
 * - Line depth: each row has one flat stroke opacity, light at the back and
 *   darker at the front. Flat per-row values, never gradients.
 *
 * Geometry is in CSS pixels (the SVG viewBox is 1:1 with its box), so a 1px
 * stroke lands on device pixels. Rows run past each edge, so the viewport crops
 * whole scales. Pure functions, no DOM.
 */

export interface SeigaihaRow {
    /** Back (0) to front. */
    index: number;
    /** y of the scales' base line. */
    base: number;
    /** Scale radius of this row. */
    radius: number;
    /** Line opacity for the whole row. */
    opacity: number;
    /** Opaque paper that occludes the rows behind. */
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
    /** Height of the field; the front row's base line sits on its bottom edge. */
    height: number;
    /** Front (nearest) scale radius. */
    radius: number;
    /** Radius of the farthest row as a fraction of `radius`. */
    depth?: number;
    /** Concentric rings per scale, outermost included (4: the calm, classic count). */
    rings?: number;
    /** The x every row's columns are laid out from (where the sun sits). */
    vanishX?: number;
    /** Depth of the swell line from the top edge at x, in px. */
    swell?: (x: number) => number;
    /** Line opacity of the back row and of the front row. */
    opacity?: [number, number];
    /**
     * Flat opacities for the last rows, nearest last, so the sea dissolves into
     * the paper instead of ending on a ruled edge (e.g. [0.45, 0.25, 0.1]).
     */
    fade?: number[];
}

// Two decimals is far below a device pixel and keeps the path strings short.
const n = (value: number) => Math.round(value * 100) / 100;

// The upper half-disc plus the column below the base line, 0.5px wider each side.
const paper = (cx: number, base: number, r: number, bottom: number) =>
    `M${n(cx - r - 0.5)} ${n(bottom)}V${n(base)}H${n(cx - r)}A${n(r)} ${n(r)} 0 0 1 ${n(cx + r)} ${n(base)}H${n(cx + r + 0.5)}V${n(bottom)}Z`;

const arc = (cx: number, base: number, r: number) =>
    `M${n(cx - r)} ${n(base)}A${n(r)} ${n(r)} 0 0 1 ${n(cx + r)} ${n(base)}`;

export function seigaiha({
    width,
    height,
    radius,
    depth = 0.6,
    rings = 4,
    vanishX = width / 2,
    swell,
    opacity = [0.3, 0.7],
    fade = [],
}: SeigaihaOptions): SeigaihaField {
    // Three depth tiers (depth·R, the midpoint, R), each a band of the field. Within
    // a tier every row shares one radius, so the classic lattice is exact; only at
    // the two tier seams does a nearer crest line overlap a farther pattern.
    const tiers = [depth, (depth + 1) / 2, 1];
    const radiusAt = (y: number) => {
        const t = Math.max(0, Math.min(1, y / height));
        return radius * (t < 0.36 ? tiers[0] : t < 0.66 ? tiers[1] : tiers[2]);
    };

    // Lay the rows out from the front (bottom) toward the horizon until a row's
    // crest would leave the field.
    const layout: Array<{ base: number; radius: number }> = [];
    let base = height;
    let r = radius;
    while (base - r >= -0.01) {
        layout.push({ base, radius: r });
        // Next row up: spaced by half the mean radius of the two rows.
        let next = r;
        for (let i = 0; i < 3; i++) next = radiusAt(base - (r + next) / 4);
        base -= (r + next) / 4;
        r = next;
    }
    layout.reverse();

    const count = layout.length;
    const rows: SeigaihaRow[] = [];
    layout.forEach(({ base, radius: r }, index) => {
        const period = r * 2;
        // The front row is unshifted; rows alternate by half a period behind it.
        const shift = (count - 1 - index) % 2 === 0 ? 0 : r;
        const first = Math.floor((-period - vanishX - shift) / period);
        let fill = "";
        let stroke = "";
        for (let k = first; ; k++) {
            const cx = vanishX + shift + k * period;
            if (cx > width + period) break;
            if (swell && base - r < swell(cx)) continue;
            fill += paper(cx, base, r, height);
            for (let ring = rings; ring >= 1; ring--) {
                stroke += arc(cx, base, (r * ring) / rings);
            }
        }
        if (!stroke) return;
        // The ramp runs back to the last unfaded row; the faded rows step down from there.
        const ramp = Math.max(1, count - 1 - fade.length);
        const fromFront = count - 1 - index;
        const value = fromFront < fade.length
            ? fade[fade.length - 1 - fromFront]
            : opacity[0] + (opacity[1] - opacity[0]) * Math.min(1, index / ramp);
        rows.push({ index, base: n(base), radius: n(r), opacity: n(value), fill, stroke });
    });

    return { width, height, radius, rows };
}

/**
 * A slow swell, as the depth (px) of the sea's top edge below the field's top.
 * `toward` is the side the swell climbs to: the sea is `low` px deep at the
 * other side (and flat out to `calm` px from it) and reaches the top edge at
 * 85% of the remaining width, staying there. Eased with a half cosine.
 */
export function swell(width: number, low: number, toward: "right" | "left", calm = 0) {
    return (x: number) => {
        // Distance into the swell, past the calm stretch on the low side.
        const into = toward === "right" ? x - calm : width - x - calm;
        const u = Math.min(1, Math.max(0, into / Math.max(1, width - calm)));
        const rise = (1 - Math.cos(Math.PI * Math.min(1, u / 0.85))) / 2;
        return low * (1 - rise);
    };
}

export type SeaKind = "hero" | "footer" | "band";

/**
 * Field heights per placement and viewport; SeaField reserves exactly these.
 * The sun anchors in Hero and Footer are positioned against them.
 */
export const SEA_HEIGHT: Record<SeaKind, { wide: number; narrow: number }> = {
    hero: { wide: 280, narrow: 192 },
    footer: { wide: 200, narrow: 120 },
    band: { wide: 36, narrow: 36 },
};

/**
 * Presets per placement and viewport: 80px front scales from 768px up, 48px on
 * phones, both receding to 0.6 of that size at the horizon.
 * - hero: the swell climbs toward the rising sun on the right;
 * - footer (sunset): the swell climbs to the right and leaves a calm trough on
 *   the left, where the sun sets, so its lower half sinks behind two or three
 *   crests instead of being cut by a single scale;
 * - band: three rows of small (16px) scales, no swell, no depth tiers: the base
 *   Eve's portrait rises from in Sobre mí (the top row's notches sit 20px below
 *   the band's top edge, see BAND_NOTCH).
 */
export function seaFor(kind: SeaKind, width: number): SeigaihaField {
    const wide = width >= 768;
    const radius = wide ? 40 : 24;
    const height = SEA_HEIGHT[kind][wide ? "wide" : "narrow"];

    switch (kind) {
        case "hero":
            return seigaiha({
                width, height, radius,
                vanishX: wide ? width - Math.min(160, width * 0.12) : width - 24,
                swell: swell(width, wide ? 120 : 72, "right"),
                opacity: [0.3, 0.7],
                // The near rows fade out, so the sea bleeds into the paper like a print.
                fade: [0.45, 0.25, 0.1],
            });
        case "band":
            return seigaiha({ width, height, radius: 16, depth: 1, vanishX: width / 2, opacity: [0.35, 0.6] });
        case "footer": {
            const contentLeft = wide ? Math.max(40, (width - 1200) / 2) : 24;
            // The sun's centre: see the footer anchor (between the logo and the
            // socials from 1280px, on the content's left edge below that).
            const sunX = contentLeft + (width >= 1280 ? 322 : wide ? 100 : 60);
            return seigaiha({
                width, height, radius,
                vanishX: sunX,
                swell: swell(width, wide ? 64 : 34, "right", sunX + (wide ? 60 : 30)),
                opacity: [0.3, 0.65],
            });
        }
    }
}

/** Depth of the band's top row notches below its top edge (base 36 − two half-radius steps). */
export const BAND_NOTCH = 20;

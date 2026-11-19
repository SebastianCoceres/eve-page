/**
 * Shared maths for "Las escamas viajan con el sol" (hooks/useScaleJourney): the
 * seigaiha scales that leave the hero sea, follow the sun as a wake and a halo,
 * settle into the emakimono's fans, fall as momiji in Sobre mí and sink into the
 * footer sea. Pure functions, no DOM: every value here is a function of the
 * scroll position (and of the layout measured by the hook).
 */

/** The layer's marker: while it is mounted the journey owns the emakimono fans' reveal. */
export const JOURNEY_ATTR = "data-scale-journey";

/**
 * True when the scale journey is on the page (it is not rendered under reduced
 * motion): the emakimono fans are then revealed by the scales that land on them,
 * not drawn in on their own (hooks/useEmakiScroll).
 */
export const journeyOwnsFans = () =>
    typeof document !== "undefined" && document.querySelector(`[${JOURNEY_ATTR}]`) !== null;

/** Least room between a scale or a leaf and any text, control or the floating button (px). */
export const TEXT_CLEARANCE = 24;
/** Over this many px past the clearance a piece comes back to full ink. */
export const CLEARANCE_RAMP = 14;

export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Smoothstep on [0, 1]. */
export const smooth = (t: number) => {
    const u = clamp01(t);
    return u * u * (3 - 2 * u);
};
/** Progress of `value` through [from, to], eased (0 before, 1 after). */
export const span = (value: number, from: number, to: number) => smooth((value - from) / Math.max(1, to - from));

/** A stable pseudo-random number in [0, 1) for a particle and a purpose. */
export const hash = (index: number, salt: number) => {
    const v = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
    return v - Math.floor(v);
};

/**
 * Where the halo opens, as an angle (radians, screen axes): away from the text,
 * which sits on the other side of the page's middle. East of the middle the halo
 * opens east (0); west of it, west (-π). In between it turns over the top of the
 * sun, so it never flips from one side to the other.
 */
export const haloAngle = (sunX: number, viewportWidth: number) =>
    -Math.PI * smooth((viewportWidth * 0.62 - sunX) / (viewportWidth * 0.24));

/** Gap between two boxes (0 when they overlap). */
export function boxGap(
    al: number, at: number, ar: number, ab: number,
    bl: number, bt: number, br: number, bb: number,
) {
    const dx = Math.max(0, bl - ar, al - br);
    const dy = Math.max(0, bt - ab, at - bb);
    return Math.hypot(dx, dy);
}

/** Quadratic Bézier point. */
export const bezier = (a: number, c: number, b: number, t: number) => {
    const u = 1 - t;
    return u * u * a + 2 * u * t * c + t * t * b;
};

/**
 * A momiji (maple) leaf as a flat print: seven broad, pointed lobes cut halfway to
 * the heart, and a stem. Unit: the leaf fits a circle of radius 50 around its
 * heart (0, 0), stem pointing down. Straight segments only, so it reads as a cut
 * stamp, not an illustration.
 */
export const MOMIJI = (() => {
    // Lobes: angle from straight up (degrees) and length (share of 50).
    const lobes: Array<[number, number]> = [[-112, 0.5], [-72, 0.8], [-36, 0.94], [0, 1], [36, 0.94], [72, 0.8], [112, 0.5]];
    const point = (deg: number, length: number) => {
        const a = ((deg - 90) * Math.PI) / 180;
        return `${(Math.cos(a) * 50 * length).toFixed(2)} ${(Math.sin(a) * 50 * length).toFixed(2)}`;
    };
    let outline = `M${point(-140, 0.2)}`;
    lobes.forEach(([deg, length], index) => {
        const before = index === 0 ? -140 : (lobes[index - 1][0] + deg) / 2;
        const after = index === lobes.length - 1 ? 140 : (lobes[index + 1][0] + deg) / 2;
        // Notch, shoulder, tip, shoulder: a broad lobe that narrows to its point.
        outline += `L${point(before, 0.44)}L${point(deg - (deg - before) * 0.62, length * 0.7)}L${point(deg, length)}`;
        outline += `L${point(deg + (after - deg) * 0.62, length * 0.7)}`;
    });
    outline += `L${point(140, 0.44)}L${point(140, 0.2)}Z`;
    return { outline, stem: "M0 8L0 30" };
})();

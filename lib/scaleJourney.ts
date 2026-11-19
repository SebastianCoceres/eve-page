/**
 * Shared maths for "Las escamas viajan con el sol" (hooks/useScaleJourney): the
 * seigaiha scales that leave the hero sea, turn into kamome (gulls) that follow
 * the sun across the page, and turn back into scales to land in the footer sea.
 * Pure functions, no DOM: every value here is a function of the scroll position
 * (and of the layout measured by the hook).
 */

/** The layer's marker. */
export const JOURNEY_ATTR = "data-scale-journey";

/** Least room between a scale or a gull and any text, control or the floating button (px). */
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
 * A kamome (gull) as a woodblock-print glyph: a shallow gull-wing "M" in one
 * cobalt line with a hint of body. Unit: a half-span of 1 (wing tips at x = ±1),
 * the body at (0, 0), y down. `span` is the half-span as a share of the scale's
 * radius; `line` its stroke (the seas' 1px line, a touch firmer to hold at 12px).
 */
export const GULL = { span: 1.05, line: 1.25, body: 0.22, ink: 0.8 };

/**
 * The wings at a point of the beat: `flap` in [-1, 1], -1 wings raised, 1 wings
 * lowered. Returns each wing's tip height and its shoulder (the quadratic control
 * that lifts the wing's middle), in the glyph's unit.
 */
export const gullWings = (flap: number) => ({
    tip: -0.05 + 0.34 * flap,
    shoulder: -0.72 + 0.3 * flap,
});

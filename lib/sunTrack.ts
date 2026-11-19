/**
 * The sun's whole path as a table: where the traveling sun is at every scroll
 * position, sampled from its one timeline (hooks/useTravelingSun) each time that
 * timeline is rebuilt. Companions that move with the sun (the scale journey,
 * hooks/useScaleJourney) read it instead of owning a second sun: the same path,
 * so a wake or a halo follows the sun exactly, at any scroll, with no lag.
 *
 * x is in viewport px (the sun's layer never scrolls sideways), y in document
 * px (its viewport y is y - scroll), d its diameter, o its opacity (0 while it
 * switches sides out of view).
 */
export interface SunTrack {
    /** Scroll px between two samples. */
    step: number;
    maxScroll: number;
    x: Float32Array;
    y: Float32Array;
    d: Float32Array;
    o: Float32Array;
}

export interface SunSample {
    x: number;
    /** Document y; the viewport y is `y - scroll`. */
    y: number;
    d: number;
    o: number;
}

let current: SunTrack | null = null;
const listeners = new Set<(track: SunTrack | null) => void>();

/** Called by the sun's owner after every build (null when it stops). */
export function publishSunTrack(track: SunTrack | null) {
    current = track;
    listeners.forEach((listener) => listener(track));
}

export const getSunTrack = () => current;

/** Subscribes to every rebuild of the sun's path; returns the unsubscribe. */
export function onSunTrack(listener: (track: SunTrack | null) => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

/** The sun at a scroll position (linear between samples, clamped to the page). */
export function sunAt(track: SunTrack, scroll: number, out: SunSample = { x: 0, y: 0, d: 0, o: 0 }): SunSample {
    const last = track.x.length - 1;
    const at = Math.min(last, Math.max(0, scroll / track.step));
    const i = Math.min(last - 1, Math.floor(at));
    if (i < 0) {
        out.x = track.x[0]; out.y = track.y[0]; out.d = track.d[0]; out.o = track.o[0];
        return out;
    }
    const t = at - i;
    out.x = track.x[i] + (track.x[i + 1] - track.x[i]) * t;
    out.y = track.y[i] + (track.y[i + 1] - track.y[i]) * t;
    out.d = track.d[i] + (track.d[i + 1] - track.d[i]) * t;
    // Opacity switches, it never fades: transparent if either neighbour is.
    out.o = Math.min(track.o[i], track.o[i + 1]);
    return out;
}

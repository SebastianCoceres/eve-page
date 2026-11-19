'use client'
import { useScaleJourney } from "@/hooks/useScaleJourney";
import { JOURNEY_ATTR } from "@/lib/scaleJourney";

/**
 * "Las escamas viajan con el sol": the seigaiha scales that leave the hero sea and
 * follow the sun through the page (see hooks/useScaleJourney). One canvas, fixed
 * to the viewport, behind the sun, main and the footer, never in the way: no pointer
 * events, hidden from assistive tech, never wider than the viewport. Not rendered
 * under reduced motion (the seas and fans stay as they are); without JS it is an
 * empty, transparent layer.
 */
export function ScaleJourney() {
    const scope = useScaleJourney();
    return (
        <canvas
            ref={scope}
            {...{ [JOURNEY_ATTR]: "" }}
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-0 block h-full w-full motion-reduce:hidden"
        />
    )
}

export default ScaleJourney

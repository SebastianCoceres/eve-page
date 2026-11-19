'use client'
import { usePaperDay } from "@/hooks/usePaperDay";
import { useTravelingSun } from "@/hooks/useTravelingSun";

/**
 * The page's one sun ("El viaje del sol"). A fixed, viewport-sized layer that
 * clips the sun at the viewport edges, so it can be cropped or wait out of view
 * without creating horizontal scroll. Fixed, so the browser never scrolls it: its
 * place in the viewport is drawn every frame from the live scroll, in the same
 * frame as the pinned chapters (no lag, no bounce under smooth scrolling). It sits
 * behind all content: main and footer stack above it. The disc is positioned
 * entirely by useTravelingSun, hidden until placed, and never rendered under
 * reduced motion: the static suns in the hero and footer stand in for it.
 * Its colour is --color-sun-live: --sun-now, which warms with the paper's day
 * (usePaperDay), warmed further by --sun-late while it rests in Sobre mí (useTravelingSun).
 */
export function TravelingSun() {
    const scope = useTravelingSun();
    usePaperDay();
    return (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden motion-reduce:hidden">
            <div ref={scope} className="absolute left-0 top-0 origin-center opacity-0 will-change-transform">
                <div data-sun-disc className="size-full rounded-full bg-sun-live" />
            </div>
        </div>
    )
}

export default TravelingSun

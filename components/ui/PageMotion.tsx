'use client'
import { usePageMotion } from "@/hooks/usePageMotion";

/** Mounts the page-wide entrances (see usePageMotion). Renders nothing. */
export function PageMotion() {
    usePageMotion();
    return null;
}

export default PageMotion

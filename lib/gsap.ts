import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

// Single, idempotent registration point for every GSAP plugin used in the app.
if (typeof window !== "undefined") {
    gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin, DrawSVGPlugin);
}

export { gsap, useGSAP, ScrollTrigger, ScrollToPlugin, DrawSVGPlugin };

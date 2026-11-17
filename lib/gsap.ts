import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

// Single, idempotent registration point for every GSAP plugin used in the app.
if (typeof window !== "undefined") {
    gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin);
}

export { gsap, useGSAP, ScrollTrigger, ScrollToPlugin };

import { gsap, useGSAP } from "@/lib/gsap";

// One motion grammar: reveals 0.6–1.1s on expo.out / power3.out, once, on enter.
const onEnter = (trigger: Element, start = "top 85%") => ({ trigger, start, once: true });

/**
 * Page-wide entrances for the sections below the hero (the hero, Mi enfoque,
 * Servicios and the Sobre mí text own their motion). Everything starts from the visible, server-rendered layout
 * and only animates transforms, opacity and clip-path, so nothing shifts and
 * nothing is hidden without JavaScript. Reduced motion: nothing runs.
 *
 * Text reveals are not here: section headings and leads are components/ui/TextReveal
 * (the React Bits SplitText), the page's one text-reveal primitive.
 *
 * - Sobre mí: Eve's bust rises out of its seigaiha band (clip-path inset from the bottom);
 * - Contacto: the form fields cascade in; on a fine pointer the send pill
 *   follows the cursor by at most 6px.
 */
export function usePageMotion() {
    useGSAP(() => {
        const mm = gsap.matchMedia();

        mm.add("(prefers-reduced-motion: no-preference)", () => {
            gsap.utils.toArray<HTMLElement>("[data-portrait-photo]").forEach((photo) => {
                gsap.fromTo(photo,
                    { clipPath: "inset(100% 0% 0% 0%)" },
                    { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "expo.out", clearProps: "clipPath", scrollTrigger: onEnter(photo, "top 80%") },
                );
            });

            const form = document.querySelector("#contact form");
            if (form) {
                gsap.from(form.children, { opacity: 0, y: 16, duration: 0.7, ease: "power3.out", stagger: 0.08, scrollTrigger: onEnter(form) });
            }

        });

        mm.add("(prefers-reduced-motion: no-preference) and (pointer: fine)", () => {
            const pill = document.querySelector<HTMLElement>('#contact button[type="submit"]');
            if (!pill) return;
            const toX = gsap.quickTo(pill, "x", { duration: 0.4, ease: "power3.out" });
            const toY = gsap.quickTo(pill, "y", { duration: 0.4, ease: "power3.out" });
            const follow = (event: PointerEvent) => {
                const box = pill.getBoundingClientRect();
                const limit = (value: number) => gsap.utils.clamp(-6, 6, value * 0.15);
                toX(limit(event.clientX - (box.left + box.width / 2)));
                toY(limit(event.clientY - (box.top + box.height / 2)));
            };
            const settle = () => { toX(0); toY(0); };
            pill.addEventListener("pointermove", follow);
            pill.addEventListener("pointerleave", settle);
            return () => {
                pill.removeEventListener("pointermove", follow);
                pill.removeEventListener("pointerleave", settle);
                gsap.set(pill, { clearProps: "x,y" });
            };
        });

        return () => mm.revert();
    });
}

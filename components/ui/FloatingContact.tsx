'use client'
import { useRef, type MouseEvent } from "react";
import { Button } from "@/components/ui/Button";
import { gsap, useGSAP } from "@/lib/gsap";
import { scrollToSection } from "@/lib/scroll";

/**
 * The floating "Contáctame": the page's only persistent action (there is no
 * navbar). It rests in the bottom-right corner, inside the content column's
 * gutter (above the iOS home indicator on phones), the one corner the sun never
 * crosses: the sun rests top right in the hero and travels the upper half of
 * the sky on the right, and sets bottom left.
 *
 * It appears only once the hero's own Contáctame (`[data-hero-cta][href="#contact"]`)
 * has left the viewport and hides again when that button comes back, and while
 * Contacto or the footer is in view (it would only repeat the form). Hidden, it
 * is invisible and inert, so it is never focusable. It enters with a short rise
 * and fade from its corner (0.45s expo.out) and leaves faster (0.2s); under
 * reduced motion it appears and disappears at once.
 */
export function FloatingContact() {
    const scope = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const root = scope.current;
        const cta = document.querySelector('[data-hero-cta][href="#contact"]');
        const ends = [document.getElementById("contact"), document.querySelector("footer")].filter((element): element is HTMLElement => Boolean(element));
        if (!root || !cta) return;

        let heroCtaGone = false;
        const endsInView = new Set<Element>();
        let shown = false;

        const update = () => {
            const show = heroCtaGone && endsInView.size === 0;
            if (show === shown) return;
            shown = show;
            root.inert = !show;
            root.dataset.state = show ? "shown" : "hidden";
            gsap.killTweensOf(root);
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(root, { autoAlpha: show ? 1 : 0, y: 0, scale: 1 });
            } else if (show) {
                gsap.fromTo(root, { autoAlpha: 0, y: 24, scale: 0.92 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: "expo.out" });
            } else {
                gsap.to(root, { autoAlpha: 0, y: 12, scale: 0.96, duration: 0.2, ease: "power2.in" });
            }
        };

        const ctaObserver = new IntersectionObserver(([entry]) => {
            heroCtaGone = !entry.isIntersecting;
            update();
        });
        ctaObserver.observe(cta);
        const endObserver = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) endsInView.add(entry.target);
                else endsInView.delete(entry.target);
            }
            update();
        });
        ends.forEach((element) => endObserver.observe(element));

        return () => {
            ctaObserver.disconnect();
            endObserver.disconnect();
        };
    }, { scope });

    const goToContact = (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        scrollToSection("contact");
    };

    return (
        <div
            ref={scope}
            data-floating-contact
            data-state="hidden"
            inert
            className="invisible fixed right-6 md:right-10 xl:right-[max(40px,calc((100vw-1200px)/2))] bottom-[max(24px,calc(env(safe-area-inset-bottom)+16px))] z-50 origin-bottom-right opacity-0"
        >
            <Button asChild>
                <a href="#contact" onClick={goToContact}>Contáctame</a>
            </Button>
        </div>
    );
}

export default FloatingContact;

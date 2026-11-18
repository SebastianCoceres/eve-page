'use client';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import {
    Navbar,
    NavbarClose,
    NavbarPanel,
    NavbarTrigger,
    NavigationItem,
    NavigationList,
    useNavbarContext,
} from "@/components/ui/Navbar";
import { Button } from "@/components/ui/Button";
import { useNavbarStore } from '@/stores/nav/nav-providers'
import { scrollToSection } from "@/lib/scroll";
import { cn } from "@/lib/utils";
import { gsap, useGSAP } from "@/lib/gsap";

export const navbarItems = [
    {
        key: 'home',
        name: 'Inicio',
        href: '#home',
    }, {
        key: 'focus',
        name: 'Mi enfoque',
        href: '#focus',
    }, {
        key: 'services',
        name: '¿Qué ofrezco?',
        href: '#services',
    }, {
        key: 'about',
        name: 'Sobre mí',
        href: '#about',
    },
    {
        key: 'contact',
        name: 'Contacto',
        href: '#contact',
    }
] as const

export type NavbarKeys = typeof navbarItems[number]['key']

// "Contacto" is the button and the hero leads with the logotype, so the text links
// are the three middle sections.
const textLinks = navbarItems.filter(item => item.key !== 'home' && item.key !== 'contact')

const desktopLinkClasses =
    "inline-flex min-h-11 items-center px-3 text-[15px] text-muted-foreground underline decoration-1 decoration-transparent underline-offset-[6px] transition-colors duration-150 ease-out hover:text-foreground hover:decoration-current aria-[current=location]:text-foreground aria-[current=location]:hover:decoration-transparent motion-reduce:transition-none"

const panelLinkClasses =
    "inline-flex min-h-11 items-center font-display text-[32px] leading-[1.2] text-foreground underline decoration-1 decoration-transparent underline-offset-[8px] aria-[current=location]:decoration-current"

/**
 * The active section's underline: one 1px element that slides and stretches to
 * the current link's text (x + scaleX only, 0.45s power3.out; instant under
 * reduced motion). Hidden when no desktop link is current (hero, Contacto).
 */
function useActiveUnderline(active: string) {
    const scope = useRef<HTMLDivElement>(null)
    useGSAP(() => {
        const root = scope.current
        const bar = root?.querySelector<HTMLElement>("[data-nav-underline]")
        if (!root || !bar) return
        const place = (animate: boolean) => {
            const link = root.querySelector<HTMLElement>('a[aria-current="location"]')
            const still = !animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches
            if (!link) {
                gsap.to(bar, { opacity: 0, duration: still ? 0 : 0.15 })
                return
            }
            const box = root.getBoundingClientRect()
            const text = link.getBoundingClientRect()
            // The links carry 12px of hit-area padding on each side; the line sits 6px under the text.
            gsap.to(bar, {
                x: text.left - box.left + 12,
                y: text.top - box.top + text.height / 2 + 15,
                scaleX: Math.max(1, text.width - 24),
                opacity: 1,
                duration: still ? 0 : 0.45,
                ease: "power3.out",
            })
        }
        const firstPaint = bar.dataset.placed !== "true"
        bar.dataset.placed = "true"
        place(!firstPaint)
        const onResize = () => place(false)
        window.addEventListener("resize", onResize)
        return () => window.removeEventListener("resize", onResize)
    }, { scope, dependencies: [active] })
    return scope
}

function NavbarContent() {
    const { selectedNavbarItem, setSelectedNavbarItem } = useNavbarStore(state => state)
    const { close } = useNavbarContext()
    const underlineScope = useActiveUnderline(selectedNavbarItem)

    const navigate = (event: MouseEvent<HTMLAnchorElement>, key: NavbarKeys) => {
        event.preventDefault()
        close()
        setSelectedNavbarItem(key)
        scrollToSection(key)
    }

    // No brand mark in the bar: the logotype leads the hero. Links sit flush with the
    // container's left edge (the -ml-3 cancels their hit-area padding) and the pill
    // closes the row on the right. On mobile the bar holds only "Menú", on the right;
    // the hero's "Contáctame" is the one primary action in that viewport.
    const contactPill = (
        <Button asChild size="compact">
            <a
                href="#contact"
                aria-current={selectedNavbarItem === 'contact' ? "location" : undefined}
                onClick={(event) => navigate(event, 'contact')}
            >
                Contacto
            </a>
        </Button>
    )

    return (
        <>
            <div ref={underlineScope} className="relative -ml-3 hidden md:block">
            <span data-nav-underline aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-px w-px origin-left bg-foreground opacity-0" />
            <NavigationList className="flex items-center gap-1">
                {textLinks.map((item) => (
                    <NavigationItem
                        key={item.key}
                        href={item.href}
                        isActive={item.key === selectedNavbarItem}
                        onClick={(event) => navigate(event, item.key)}
                        className={desktopLinkClasses}
                    >
                        {item.name}
                    </NavigationItem>
                ))}
            </NavigationList>
            </div>

            <NavbarTrigger className="ml-auto inline-flex min-h-11 min-w-11 items-center justify-end text-[15px] font-medium text-foreground md:hidden">
                Menú
            </NavbarTrigger>

            <div className="hidden md:block">{contactPill}</div>

            <NavbarPanel label="Menú" className="flex flex-col bg-background md:hidden">
                <div className="container flex h-16 shrink-0 items-center justify-end border-b border-hairline">
                    <NavbarClose className="inline-flex min-h-11 min-w-11 items-center justify-end text-[15px] font-medium text-foreground">
                        Cerrar
                    </NavbarClose>
                </div>
                <NavigationList className="container flex-col gap-4 pt-12">
                    {textLinks.map((item) => (
                        <NavigationItem
                            key={item.key}
                            href={item.href}
                            isActive={item.key === selectedNavbarItem}
                            onClick={(event) => navigate(event, item.key)}
                            className={panelLinkClasses}
                        >
                            {item.name}
                        </NavigationItem>
                    ))}
                    <NavigationItem
                        href="#contact"
                        isActive={selectedNavbarItem === 'contact'}
                        onClick={(event) => navigate(event, 'contact')}
                        className={panelLinkClasses}
                        itemClassName="mt-8"
                    >
                        Contacto
                    </NavigationItem>
                </NavigationList>
            </NavbarPanel>
        </>
    )
}

export function NavbarSection() {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 8)
        handleScroll()
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div
            className={cn(
                "border-b bg-background transition-colors duration-150 ease-out motion-reduce:transition-none",
                scrolled ? "border-hairline" : "border-transparent"
            )}
        >
            <Navbar aria-label="Principal" className="container h-16 justify-between">
                <NavbarContent />
            </Navbar>
        </div>
    )
}

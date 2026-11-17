'use client';
import { useEffect, useState, type MouseEvent } from 'react';
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
import { Logo } from "@/components/ui/Logo";
import { useNavbarStore } from '@/stores/nav/nav-providers'
import { scrollToSection } from "@/lib/scroll";
import { cn } from "@/lib/utils";

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

// The logo already links home and "Contacto" is the button, so the text links
// are the three middle sections.
const textLinks = navbarItems.filter(item => item.key !== 'home' && item.key !== 'contact')

const desktopLinkClasses =
    "inline-flex min-h-11 items-center px-3 text-[15px] text-muted-foreground underline decoration-1 decoration-transparent underline-offset-[6px] transition-colors duration-150 ease-out hover:text-foreground hover:decoration-current aria-[current=location]:text-foreground aria-[current=location]:decoration-current motion-reduce:transition-none"

const panelLinkClasses =
    "inline-flex min-h-11 items-center font-display text-[32px] leading-[1.2] text-foreground underline decoration-1 decoration-transparent underline-offset-[8px] aria-[current=location]:decoration-current"

const HomeLink = ({ onNavigate }: { onNavigate: (event: MouseEvent<HTMLAnchorElement>, key: NavbarKeys) => void }) => (
    <a
        href="#home"
        onClick={(event) => onNavigate(event, 'home')}
        className="inline-flex min-h-11 items-center text-foreground"
    >
        <span className="sr-only">Evelyn Bogado, inicio</span>
        <span aria-hidden="true" className="block h-6 w-[121px] [&_svg]:size-full [&_svg]:fill-current">
            <Logo />
        </span>
    </a>
)

function NavbarContent() {
    const { selectedNavbarItem, setSelectedNavbarItem } = useNavbarStore(state => state)
    const { close } = useNavbarContext()

    const navigate = (event: MouseEvent<HTMLAnchorElement>, key: NavbarKeys) => {
        event.preventDefault()
        close()
        setSelectedNavbarItem(key)
        scrollToSection(key)
    }

    return (
        <>
            <HomeLink onNavigate={navigate} />

            <div className="hidden items-center gap-6 md:flex">
                <NavigationList className="items-center gap-1">
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
                <Button asChild size="compact">
                    <a
                        href="#contact"
                        aria-current={selectedNavbarItem === 'contact' ? "location" : undefined}
                        onClick={(event) => navigate(event, 'contact')}
                    >
                        Contacto
                    </a>
                </Button>
            </div>

            <NavbarTrigger className="inline-flex min-h-11 min-w-11 items-center justify-end text-[15px] font-medium text-foreground md:hidden">
                Menú
            </NavbarTrigger>

            <NavbarPanel label="Menú" className="flex flex-col bg-background md:hidden">
                <div className="container flex h-16 shrink-0 items-center justify-between border-b border-hairline">
                    <HomeLink onNavigate={navigate} />
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

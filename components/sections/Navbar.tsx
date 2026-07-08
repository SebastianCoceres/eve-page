'use client';
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { Navbar, NavigationList, NavigationItem, NavbarTrigger } from "@/components/ui/Navbar";
import { Home, UserRound, HandHeart, Mail, Menu, X, Lightbulb } from "lucide-react";
import { useNavbarStore } from '@/stores/nav/nav-providers'
import { Logo } from "@/components/ui/Logo";
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

gsap.registerPlugin(useGSAP, Flip);

export const navbarItems = [
    {
        key: 'home',
        name: 'Inicio',
        href: '#home',
        icon: <Home />
    }, {
        key: 'focus',
        name: 'Mi enfoque',
        href: '#focus',
        icon: <Lightbulb />
    }, {
        key: 'services',
        name: '¿Qué ofrezco?',
        href: '#services',
        icon: <HandHeart />
    }, {
        key: 'about',
        name: 'Sobre mí',
        href: '#about',
        icon: <UserRound />
    },
    {
        key: 'contact',
        name: 'Contacto',
        href: '#contact',
        icon: <Mail />
    }
] as const

export type NavbarKeys = typeof navbarItems[number]['key']
export function NavbarSection() {
    const { selectedNavbarItem, setSelectedNavbarItem } = useNavbarStore(state => state)
    const [hasbg, setHasbg] = useState(false)
    const underlineRef = useRef<HTMLDivElement>(null)
    const hasPositionedOnce = useRef(false)

    useEffect(() => {
        const handleScroll = () => setHasbg(window.scrollY > 100)
        handleScroll()
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Underline lives as the last child of <NavigationList> (not inside a single
    // NavigationItem) so it inherits the same transform/opacity the mobile menu
    // applies to the whole list, and stays hidden/shown together with it.
    useGSAP(() => {
        const underline = underlineRef.current
        if (!underline) return
        const wrapper = underline.parentElement
        if (!wrapper) return

        const activeItem = navbarItems.find(item => item.key === selectedNavbarItem)
        if (!activeItem) return

        const activeLink = wrapper.querySelector<HTMLAnchorElement>(`a[href="${activeItem.href}"]`)
        if (!activeLink) return

        const wrapperRect = wrapper.getBoundingClientRect()
        const linkRect = activeLink.getBoundingClientRect()

        // Reproduces the original "-bottom-4 h-1" offset (16px gap - 4px own
        // height = 12px between the link's bottom edge and the underline's top).
        const nextPosition = {
            left: linkRect.left - wrapperRect.left,
            top: linkRect.bottom - wrapperRect.top + 12,
            width: linkRect.width,
        }

        if (!hasPositionedOnce.current) {
            gsap.set(underline, nextPosition)
            hasPositionedOnce.current = true
            return
        }

        const state = Flip.getState(underline)
        gsap.set(underline, nextPosition)
        Flip.from(state, { duration: 0.35, ease: "power2.out" })
    }, { scope: underlineRef, dependencies: [selectedNavbarItem] })

    return (
        <Navbar className={cn('flex justify-between md:justify-center items-center transition-colors', hasbg ? '!bg-background' : 'bg-transparent')}>
            <div className='w-36 md:hidden'>
                <span className="sr-only">Evelyn Bogado</span>
                <Logo />
            </div>
            <NavbarTrigger className="text-3xl" closedIcon={<X />} openIcon={<Menu />}></NavbarTrigger>
            <NavigationList className="text-lg md:text-2xl gap-8 uppercase">
                {
                    navbarItems.map((item, index) => (
                        <NavigationItem key={index} href={item.href} className={item.key === selectedNavbarItem ? 'text-primary' : ''} onClick={(e) => {

                            setSelectedNavbarItem(item.key)
                        }}>
                            {item.icon}{item.name}
                        </NavigationItem>
                    ))
                }
                <div ref={underlineRef} className="navbar-underline h-1 bg-primary absolute pointer-events-none"></div>
            </NavigationList>
        </Navbar >
    )
}

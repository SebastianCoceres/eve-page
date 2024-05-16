'use client';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Navbar, NavigationList, NavigationItem, NavbarTrigger } from "@/components/ui/Navbar";
import { Home, UserRound, HandHeart, Mail, Menu, X, Lightbulb } from "lucide-react";
import { useNavbarStore } from '@/stores/nav/nav-providers'
import { Logo } from "@/components/ui/Logo";
import { cn } from '@/lib/utils';
import { useState } from 'react';


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
    const { scrollY } = useScroll()
    useMotionValueEvent(scrollY, "change", (latest) => {
        setHasbg(latest > 100)
    })
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
                        <NavigationItem key={index} href={item.href} className={item.key === selectedNavbarItem ? 'relative text-primary' : 'relative'} onClick={(e) => {

                            setSelectedNavbarItem(item.key)
                        }}>
                            {item.icon}{item.name}
                            {item.key === selectedNavbarItem ?
                                (<motion.div className="h-1 w-full bg-primary absolute -bottom-4" layoutId="underline"></motion.div>) : null
                            }
                        </NavigationItem>
                    ))
                }
            </NavigationList>
        </Navbar >
    )
}
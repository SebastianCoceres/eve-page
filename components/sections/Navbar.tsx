'use client';
import { motion } from 'framer-motion';
import { Navbar, NavigationList, NavigationItem, NavbarTrigger } from "@/components/ui/Navbar";
import { Home, UserRound, HandHeart, Mail, Menu, X, Lightbulb } from "lucide-react";
import { useNavbarStore } from '@/stores/nav-providers'



export const navbarItems = [
    {
        key: 'home',
        name: 'Inicio',
        href: '#home',
        icon: <Home />
    }, {
        key: 'focus',
        name: 'Mi diferencial',
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
    return (
        <Navbar>
            <NavbarTrigger className="text-3xl" closedIcon={<X />} openIcon={<Menu />}></NavbarTrigger>
            <NavigationList className="text-2xl gap-8 uppercase">
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
'use client';
import React from 'react'


import { cn } from "@/lib/utils"
import Link from 'next/link'

interface NavbarContextType {
    isOpen: boolean;
    toggleMenu: () => void;
}

const NavbarContext = React.createContext<NavbarContextType | undefined>(undefined);

const useNavbarContext = () => {
    const context = React.useContext(NavbarContext);
    if (!context) {
        throw new Error('useNavbarContext must be used within a NavbarProvider');
    }
    return context;
};

interface NavbarProps extends React.HTMLAttributes<HTMLDivElement> {

}

const Navbar: React.FC<NavbarProps> = ({
    className,
    children,
    ...props
}) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };
    return (
        <NavbarContext.Provider value={{ isOpen, toggleMenu }}>
            <nav className={cn("relative md:bg-background/10 p-4 flex justify-center items-center", className)} {...props}>
                {children}
            </nav>
        </NavbarContext.Provider>
    )
}

interface triggerProps extends React.HTMLAttributes<HTMLButtonElement> {
    openIcon?: React.ReactNode
    closedIcon?: React.ReactNode
}

const NavbarTrigger: React.FC<triggerProps> = ({
    className,
    children,
    openIcon,
    closedIcon,
    ...props
}) => {
    const { isOpen, toggleMenu } = useNavbarContext();
    return (
        <button className={cn("absolute top-1/2 -translate-y-1/2 right-8 z-50 md:hidden", className)} {...props} onClick={toggleMenu}>
            {
                openIcon && !isOpen
                    ? openIcon
                    : closedIcon
            } {children}</button>
    )
}

interface NavigationListProps extends React.HTMLAttributes<HTMLUListElement> {

}

const NavigationList: React.FC<NavigationListProps> = ({
    className,
    children,
    ...props
}) => {
    const { isOpen } = useNavbarContext();

    return (
        <ul className={cn("transition-all fixed inset-0 flex flex-wrap flex-col items-center justify-center md:flex-row gap-8 bg-background md:bg-transparent p-8 md:p-0 md:!opacity-100 md:!translate-y-0 md:relative", className && isOpen ? "opacity-100 translate-y-0" : "-translate-y-full opacity-0")} {...props}>
            {children}
        </ul >

    )
}

interface NavigationItemProps extends React.HTMLAttributes<HTMLLIElement> {
    href: string,
    label?: string;
    Icon?: React.FC
}

const NavigationItem: React.FC<NavigationItemProps> = ({
    className,
    children,
    href,
    Icon = undefined,
    ...props
}) => {
    const { toggleMenu } = useNavbarContext();
    return (
        <li className={cn("hover:text-secondary", className)} {...props}>
            <Link className="font-bold text-inherit flex items-center justify-center gap-2 text-3xl md:text-2xl" href={href} onClick={(e) => {
                e.preventDefault();
                toggleMenu();
                const target = e.target
                if (!target) return
                if (target instanceof HTMLAnchorElement) {
                    document.querySelector(target.hash)?.scrollIntoView({ behavior: 'smooth' })
                }
            }}>
                {Icon && <Icon />} {children}
            </Link>
        </li>
    )
}


Navbar.displayName = "Navbar"
NavbarTrigger.displayName = "NavbarTrigger"
NavigationList.displayName = "NavigationList"
NavigationItem.displayName = "NavigationItem"


export {
    Navbar,
    NavigationList,
    NavigationItem,
    NavbarTrigger
}

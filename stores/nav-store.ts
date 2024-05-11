import { createStore } from 'zustand'
import { NavbarKeys, navbarItems } from '@/components/sections/Navbar'

export type NavbarState = {
    selectedNavbarItem: NavbarKeys
}

export type NavbarActions = {
    setSelectedNavbarItem: (Navbar: NavbarKeys) => void
}

export type NavbarStore = NavbarState & NavbarActions

export const defaultNavbarState: NavbarState = {
    selectedNavbarItem: navbarItems[0].key
}

export const createNavbarStore = () => {
    return createStore<NavbarStore>()((set) => ({
        ...defaultNavbarState,
        setSelectedNavbarItem: (NavbarItem: NavbarKeys) => set((state) => ({
            ...state,
            selectedNavbarItem: NavbarItem
        })),
    }))
}
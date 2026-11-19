'use client'

import { type ReactNode, createContext, useContext, useState } from 'react'
import { type StoreApi, useStore } from 'zustand'
import {
    type NavbarStore,
    createNavbarStore
} from './nav-store'

export const NavbarContext = createContext<StoreApi<NavbarStore> | null>(null)

export interface NavbarProviderProps {
    children: ReactNode
}

export const NavbarProvider = ({ children }: NavbarProviderProps) => {
    // Lazy initializer: one store per provider instance, created once, no ref read during render.
    const [store] = useState(createNavbarStore)
    return (
        <NavbarContext.Provider value={store}>
            {children}
        </NavbarContext.Provider>
    )
}

export const useNavbarStore = <T,>(selector: (store: NavbarStore) => T,): T => {
    const navbarStoreContext = useContext(NavbarContext)
    if (!navbarStoreContext) {
        throw new Error('useNavbarStore must be used within a NavbarProvider')
    }

    return useStore(navbarStoreContext, selector)
}
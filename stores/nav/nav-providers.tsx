'use client'

import { type ReactNode, createContext, useRef, useContext } from 'react'
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
    const storeRef = useRef<StoreApi<NavbarStore>>()
    if (!storeRef.current) {
        storeRef.current = createNavbarStore()
    }
    return (
        <NavbarContext.Provider value={storeRef.current}>
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
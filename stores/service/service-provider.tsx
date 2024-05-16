'use client'

import { type ReactNode, createContext, useRef, useContext } from 'react'
import { type StoreApi, useStore } from 'zustand'
import {
    type ServiceStore,
    createServiceStore
} from '../service/service-store'

export const ServiceContext = createContext<StoreApi<ServiceStore> | null>(null)

export interface ServiceProviderProps {
    children: ReactNode
}

export const ServiceProvider = ({ children }: ServiceProviderProps) => {
    const storeRef = useRef<StoreApi<ServiceStore>>()
    if (!storeRef.current) {
        storeRef.current = createServiceStore()
    }
    return (
        <ServiceContext.Provider value={storeRef.current}>
            {children}
        </ServiceContext.Provider>
    )
}

export const useServicesStore = <T,>(selector: (store: ServiceStore) => T,): T => {
    const serviceStoreContext = useContext(ServiceContext)
    if (!serviceStoreContext) {
        throw new Error('useServicesStore must be used within a NavbarProvider')
    }

    return useStore(serviceStoreContext, selector)
}
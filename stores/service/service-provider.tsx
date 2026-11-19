'use client'

import { type ReactNode, createContext, useContext, useState } from 'react'
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
    // Lazy initializer: one store per provider instance, created once, no ref read during render.
    const [store] = useState(createServiceStore)
    return (
        <ServiceContext.Provider value={store}>
            {children}
        </ServiceContext.Provider>
    )
}

export const useServicesStore = <T,>(selector: (store: ServiceStore) => T,): T => {
    const serviceStoreContext = useContext(ServiceContext)
    if (!serviceStoreContext) {
        throw new Error('useServicesStore must be used within a ServiceProvider')
    }

    return useStore(serviceStoreContext, selector)
}
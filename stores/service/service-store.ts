import { createStore } from 'zustand'
import { ServiceKeys } from '@/components/sections/Servicios'

export type ServiceState = {
    selectedService: ServiceKeys | undefined
}

export type ServiceActions = {
    setSelectedService: (Navbar: ServiceKeys) => void
}

export type ServiceStore = ServiceState & ServiceActions

export const defaultServiceState: ServiceState = {
    selectedService: undefined,
}

export const createServiceStore = () => {
    return createStore<ServiceStore>()((set) => ({
        ...defaultServiceState,
        setSelectedService: (NavbarItem: ServiceKeys) => set((state) => ({
            ...state,
            selectedService: NavbarItem
        })),
    }))
}
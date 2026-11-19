import { createStore } from 'zustand'
import { ServiceKeys } from '@/lib/services'

export type ServiceState = {
    selectedService: ServiceKeys | undefined
}

export type ServiceActions = {
    setSelectedService: (key: ServiceKeys) => void
}

export type ServiceStore = ServiceState & ServiceActions

export const defaultServiceState: ServiceState = {
    selectedService: undefined,
}

export const createServiceStore = () => {
    return createStore<ServiceStore>()((set) => ({
        ...defaultServiceState,
        setSelectedService: (key: ServiceKeys) => set((state) => ({
            ...state,
            selectedService: key
        })),
    }))
}
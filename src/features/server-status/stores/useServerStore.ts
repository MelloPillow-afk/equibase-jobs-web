import { create } from 'zustand'

export type ServerStatus = 'online' | 'offline' | 'starting'

interface ServerState {
    status: ServerStatus
    lastApiCall: number
    isIdle: boolean
    setStatus: (status: ServerStatus) => void
    updateLastApiCall: () => void
    setIdle: (isIdle: boolean) => void
}

export const useServerStore = create<ServerState>((set) => ({
    status: 'starting', // Default to starting on load
    lastApiCall: Date.now(),
    isIdle: false,
    setStatus: (status) => set({ status }),
    updateLastApiCall: () => set({ lastApiCall: Date.now(), isIdle: false }),
    setIdle: (isIdle) => set({ isIdle, status: isIdle ? 'offline' : 'online' }),
}))

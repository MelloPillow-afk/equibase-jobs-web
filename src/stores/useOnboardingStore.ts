import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface OnboardingState {
    isOpen: boolean
    hasSeenOnboarding: boolean
    openOnboarding: () => void
    closeOnboarding: () => void
    finishOnboarding: () => void
    resetOnboarding: () => void
}

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set) => ({
            isOpen: false,
            hasSeenOnboarding: false,
            openOnboarding: () => set({ isOpen: true }),
            closeOnboarding: () => set({ isOpen: false }),
            finishOnboarding: () => set({ isOpen: false, hasSeenOnboarding: true }),
            resetOnboarding: () => set({ isOpen: true, hasSeenOnboarding: false }),
        }),
        {
            name: 'onboarding-storage',
            partialize: (state) => ({ hasSeenOnboarding: state.hasSeenOnboarding }),
        }
    )
)

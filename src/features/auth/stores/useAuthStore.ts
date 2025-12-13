import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'

interface AuthState {
    session: Session | null
    user: User | null
    isAuthModalOpen: boolean
    setSession: (session: Session | null) => void
    setIsAuthModalOpen: (isOpen: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
    session: null,
    user: null,
    isAuthModalOpen: false,
    setSession: (session) => set({
        session,
        user: session?.user ?? null,
        // If we have a session, close the modal. If no session, open it (app logic will handle this detailed check too)
        isAuthModalOpen: !session
    }),
    setIsAuthModalOpen: (isOpen) => set({ isAuthModalOpen: isOpen }),
}))

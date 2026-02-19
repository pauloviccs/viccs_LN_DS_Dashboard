import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(
    persist(
        (set) => ({
            user: null,
            role: null, // 'admin' | 'client' | 'editor'
            setUser: (user) => set({ user }),
            setRole: (role) => set({ role }),

            // UI State
            isLoading: false,
            setLoading: (isLoading) => set({ isLoading }),
        }),
        {
            name: 'lumia-storage', // unique name
            partialize: (state) => ({ user: state.user, role: state.role }), // Only persist user and role
        }
    )
)

export default useStore

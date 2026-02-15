import { create } from 'zustand'

const useStore = create((set) => ({
    user: null,
    role: null, // 'admin' | 'client'
    setUser: (user) => set({ user }),
    setRole: (role) => set({ role }),

    // UI State
    isLoading: false,
    setLoading: (isLoading) => set({ isLoading }),
}))

export default useStore

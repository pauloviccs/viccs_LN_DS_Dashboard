import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import useStore from '../stores/useStore'

export function useAuth() {
    const { user, role, setUser, setRole } = useStore()
    const [loading, setLoading] = useState(true)

    const handleSession = async (session) => {
        // Prevent setting state if the component is unmounted (handled by useEffect cleanup, but good practice)
        if (!session?.user) {
            console.log("useAuth: No session or user found");
            setUser(null)
            setRole(null)
            setLoading(false)
            return
        }

        // Only fetch role if we have a NEW user or if role is missing
        if (user?.id === session.user.id && role) {
            console.log("useAuth: User and role already loaded, skipping fetch.");
            setLoading(false);
            return;
        }

        console.log("useAuth: User found", session.user.id);
        setUser(session.user)

        // Fetch Role with Retry Logic (to handle Trigger delay)
        let fetchedRole = null;
        let attempts = 0;
        const maxAttempts = 3;

        try {
            while (attempts < maxAttempts && !fetchedRole) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single()

                if (data && data.role) {
                    fetchedRole = data.role;
                    break;
                } else if (error && error.code !== 'PGRST116') {
                    // PGRST116 = no rows returned, which is expected if profile doesn't exist yet
                    console.warn(`useAuth: Error fetching role, attempt ${attempts + 1}/${maxAttempts}:`, error);
                }

                if (attempts < maxAttempts - 1) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                attempts++;
            }
        } catch (err) {
            console.error('useAuth: Exception while fetching role:', err);
        }

        if (fetchedRole) {
            console.log("useAuth: Role found", fetchedRole);
            setRole(fetchedRole)
        } else {
            console.warn("useAuth: Failed to fetch role after retries. Defaulting to 'client'.");
            // Default to 'client' to avoid infinite redirect loops if profile is missing
            setRole('client');
        }

        // Always set loading to false, even if there were errors
        setLoading(false)
    }

    useEffect(() => {
        let mounted = true
        let timeoutId = null

        // Safety timeout: if loading takes more than 5 seconds, force stop loading
        timeoutId = setTimeout(() => {
            if (mounted) {
                console.warn('useAuth: Loading timeout reached, forcing loading to false (Safety Valve)')
                setLoading(false)
            }
        }, 5000)

        const initAuth = async () => {
            try {
                // 1. Check active session immediately
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) {
                    throw error
                }

                if (mounted) {
                    await handleSession(session)
                }

            } catch (err) {
                console.error('useAuth: Exception initializing auth:', err)
                if (mounted) {
                    setUser(null)
                    setRole(null)
                    setLoading(false)
                }
            } finally {
                if (timeoutId) clearTimeout(timeoutId)
            }
        }

        initAuth()

        // 2. Listen for auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`useAuth: Auth state change: ${event}`)
            if (mounted) {
                // Optimization: INITIAL_SESSION is already handled by getSession logic usually, but to be safe:
                if (event === 'INITIAL_SESSION') {
                    // already handled by initAuth usually, but we can double check
                } else if (event === 'SIGNED_OUT') {
                    setUser(null)
                    setRole(null)
                    setLoading(false)
                } else {
                    await handleSession(session)
                }
            }
        })

        return () => {
            mounted = false
            if (timeoutId) clearTimeout(timeoutId)
            subscription.unsubscribe()
        }
    }, [])

    return { user, role, loading }
}

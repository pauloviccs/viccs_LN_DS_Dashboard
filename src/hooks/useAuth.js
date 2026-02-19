import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import useStore from '../stores/useStore'

export function useAuth() {
    const { user, role, setUser, setRole } = useStore()
    const [loading, setLoading] = useState(true)

    const handleSession = async (session) => {
        console.log("useAuth: handleSession called", { session });
        if (!session?.user) {
            console.log("useAuth: No session or user found");
            setUser(null)
            setRole(null)
            setLoading(false)
            return
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
        let loadingResolved = false

        // Safety timeout: if loading takes more than 10 seconds, force stop loading
        timeoutId = setTimeout(() => {
            if (mounted && !loadingResolved) {
                console.warn('useAuth: Loading timeout reached, forcing loading to false')
                setLoading(false)
                loadingResolved = true
            }
        }, 10000)

        // Check active session immediately and restore it
        const restoreSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()
                
                if (error) {
                    console.error('useAuth: Error getting session:', error)
                    if (mounted) {
                        loadingResolved = true
                        if (timeoutId) clearTimeout(timeoutId)
                        setUser(null)
                        setRole(null)
                        setLoading(false)
                    }
                    return
                }

                if (mounted) {
                    loadingResolved = true
                    if (timeoutId) clearTimeout(timeoutId)
                    await handleSession(session)
                }
            } catch (err) {
                console.error('useAuth: Exception restoring session:', err)
                if (mounted) {
                    loadingResolved = true
                    if (timeoutId) clearTimeout(timeoutId)
                    setUser(null)
                    setRole(null)
                    setLoading(false)
                }
            }
        }

        restoreSession()

        // Listen for auth state changes (login, logout, token refresh, etc.)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (mounted) {
                loadingResolved = true
                if (timeoutId) clearTimeout(timeoutId)
                await handleSession(session)
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

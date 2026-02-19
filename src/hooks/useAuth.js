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

        while (attempts < maxAttempts && !fetchedRole) {
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single()

            if (data) {
                fetchedRole = data.role;
            } else {
                console.warn(`useAuth: Profile not found, attempt ${attempts + 1}/${maxAttempts}. Retrying in 500ms...`);
                await new Promise(resolve => setTimeout(resolve, 500));
                attempts++;
            }
        }

        if (fetchedRole) {
            console.log("useAuth: Role found", fetchedRole);
            setRole(fetchedRole)
        } else {
            console.error("useAuth: Failed to fetch role after retries. Defaulting to 'client' or null.");
            // Default to 'client' to avoid infinite redirect loops if profile is missing
            setRole('client');
        }

        setLoading(false)
    }

    useEffect(() => {
        let mounted = true

        // Check active session immediately and restore it
        const restoreSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()
                
                if (error) {
                    console.error('useAuth: Error getting session:', error)
                    if (mounted) {
                        setUser(null)
                        setRole(null)
                        setLoading(false)
                    }
                    return
                }

                if (mounted) {
                    await handleSession(session)
                }
            } catch (err) {
                console.error('useAuth: Exception restoring session:', err)
                if (mounted) {
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
                await handleSession(session)
            }
        })

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [])

    return { user, role, loading }
}

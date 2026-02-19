import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import useStore from '../stores/useStore'

export function useAuth() {
    const { setUser, setRole } = useStore()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleSession(session)
        })

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            handleSession(session)
        })

        return () => subscription.unsubscribe()
    }, [])

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

        // Fetch Role
        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()

        if (error) {
            console.error("useAuth: Error fetching role", error);
        }

        if (data) {
            console.log("useAuth: Role found", data.role);
            setRole(data.role)
        } else {
            // Fallback for new users (if trigger didn't run yet)
            console.warn("useAuth: No profile found, using default role logic or null");
            // Optional: Insert profile if it doesn't exist?
            // For now, let's assume client role if null to avoid redirect loop?
        }

        setLoading(false)
    }

    return { loading }
}

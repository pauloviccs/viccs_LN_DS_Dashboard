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
        if (!session?.user) {
            setUser(null)
            setRole(null)
            setLoading(false)
            return
        }

        setUser(session.user)

        // Fetch Role
        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()

        if (data) {
            setRole(data.role)
        }

        setLoading(false)
    }

    return { loading }
}

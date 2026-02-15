import { supabase } from '../lib/supabase'

export const screenService = {
    // List all screens assigned to current user (admin sees all usually, or just theirs)
    // For now, let's assume Admin sees screens they own/manage
    async listScreens() {
        const { data, error } = await supabase
            .from('screens')
            .select('*, playlists(name)')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    // Pair a screen using a code (Simulated logic for now, real player would generate this)
    async pairScreen(name, pairingCode) {
        const { data: { user } } = await supabase.auth.getUser()

        // In a real scenario, we'd check if a screen with this pairing code exists and has no owner
        // For this SaaS Minimum Viable Product, we just creating a screen entry manually
        const { data, error } = await supabase
            .from('screens')
            .insert({
                name,
                pairing_code: pairingCode,
                status: 'offline',
                assigned_to: user.id
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    async assignPlaylist(screenId, playlistId) {
        const { error } = await supabase
            .from('screens')
            .update({ playlist_id: playlistId })
            .eq('id', screenId)

        if (error) throw error
    },

    async deleteScreen(id) {
        const { error } = await supabase
            .from('screens')
            .delete()
            .eq('id', id)

        if (error) throw error
    }
}

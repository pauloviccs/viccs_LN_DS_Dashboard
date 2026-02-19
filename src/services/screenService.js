import { supabase } from '../lib/supabase'

export const screenService = {
    // List all screens assigned to current user (admin sees all usually, or just theirs)
    // For now, let's assume Admin sees screens they own/manage
    async listScreens() {
        const { data, error } = await supabase
            .from('screens')
            .select('*, playlists:playlists!screens_playlist_id_fkey(name)')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    // Pair a screen using a code (Simulated logic for now, real player would generate this)
    // Pair a screen using a code
    async pairScreen(name, pairingCode) {
        const { data: { user } } = await supabase.auth.getUser()

        // 1. Find the screen with this code
        const { data: existingScreen, error: searchError } = await supabase
            .from('screens')
            .select('id')
            .eq('pairing_code', pairingCode)
            .maybeSingle()

        if (searchError) throw searchError
        if (!existingScreen) throw new Error('Código de pareamento não encontrado.')

        // 2. Update the screen (Claim it)
        const { data, error } = await supabase
            .from('screens')
            .update({
                name,
                assigned_to: user.id,
                status: 'online', // Activate the screen
                pairing_code: null // Clear code to prevent reuse and satisfy player logic
            })
            .eq('id', existingScreen.id)
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

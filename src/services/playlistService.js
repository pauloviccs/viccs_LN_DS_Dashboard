import { supabase } from '../lib/supabase'

export const playlistService = {
    async createPlaylist(name) {
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
            .from('playlists')
            .insert({
                name,
                items: [],
                owner_id: user.id
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    async listPlaylists() {
        const { data, error } = await supabase
            .from('playlists')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    async getPlaylist(id) {
        const { data, error } = await supabase
            .from('playlists')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    },

    async updatePlaylistItems(id, items) {
        const { error } = await supabase
            .from('playlists')
            .update({
                items,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)

        if (error) throw error
    },

    async deletePlaylist(id) {
        const { error } = await supabase
            .from('playlists')
            .delete()
            .eq('id', id)

        if (error) throw error
    }
}

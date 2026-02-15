import { supabase } from '../lib/supabase'

export const storageService = {
    // Upload file to 'media' bucket
    async uploadMedia(file, onProgress) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        const { data, error } = await supabase.storage
            .from('media')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (error) throw error

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('media')
            .getPublicUrl(filePath)

        // Save metadata to 'media' table
        const { data: dbData, error: dbError } = await supabase
            .from('media')
            .insert({
                title: file.name,
                url: publicUrl,
                type: file.type.startsWith('image') ? 'image' : 'video',
                size: file.size,
                owner_id: (await supabase.auth.getUser()).data.user.id
            })
            .select()
            .single()

        if (dbError) throw dbError

        return dbData
    },

    // List all media
    async listMedia() {
        const { data, error } = await supabase
            .from('media')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    // Delete media
    async deleteMedia(id, url) {
        // 1. Delete from Storage
        const path = url.split('/').pop() // simplistic extraction
        const { error: storageError } = await supabase.storage
            .from('media')
            .remove([path])

        if (storageError) console.error('Storage delete error:', storageError)

        // 2. Delete from DB
        const { error: dbError } = await supabase
            .from('media')
            .delete()
            .eq('id', id)

        if (dbError) throw dbError
    }
}

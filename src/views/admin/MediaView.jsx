import { useEffect, useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Trash2, Image as ImageIcon, Video, Loader2 } from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import LiquidButton from '../../components/ui/LiquidButton'
import { storageService } from '../../services/storageService'

const MediaView = () => {
    const [mediaItems, setMediaItems] = useState([])
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(true)

    const fetchMedia = async () => {
        try {
            const data = await storageService.listMedia()
            setMediaItems(data)
        } catch (error) {
            console.error('Error fetching media:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMedia()
    }, [])

    const onDrop = useCallback(async (acceptedFiles) => {
        setUploading(true)
        try {
            // Parallel uploads
            await Promise.all(acceptedFiles.map(file => storageService.uploadMedia(file)))
            await fetchMedia()
        } catch (error) {
            alert('Upload failed: ' + error.message)
        } finally {
            setUploading(false)
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': [],
            'video/*': []
        }
    })

    const handleDelete = async (id, url) => {
        if (!confirm('Delete this file?')) return
        try {
            await storageService.deleteMedia(id, url)
            setMediaItems(prev => prev.filter(item => item.id !== id))
        } catch (error) {
            console.error(error)
            alert('Delete failed')
        }
    }

    return (
        <div className="space-y-6">
            {/* Upload Zone */}
            <GlassCard
                {...getRootProps()}
                className={`border-2 border-dashed cursor-pointer transition-colors ${isDragActive ? 'border-blue-400 bg-blue-500/10' : 'border-white/10 hover:border-white/30'}`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center py-12 text-center text-white/60">
                    {uploading ? (
                        <Loader2 className="animate-spin mb-4 text-blue-400" size={48} />
                    ) : (
                        <Upload className="mb-4" size={48} />
                    )}
                    <p className="text-lg font-medium">
                        {uploading ? 'Uploading...' : isDragActive ? 'Drop files here' : 'Drag & drop media files, or click to select'}
                    </p>
                    <p className="text-sm mt-2">Supports content: Images & Video (Max 50MB)</p>
                </div>
            </GlassCard>

            {/* Media Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <AnimatePresence>
                    {mediaItems.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            layout
                            className="group relative aspect-square rounded-xl overflow-hidden bg-black/40 border border-white/5"
                        >
                            {item.type === 'video' ? (
                                <video src={item.url} className="w-full h-full object-cover opacity-80" />
                            ) : (
                                <img src={item.url} alt={item.title} className="w-full h-full object-cover opacity-80" />
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                <p className="text-xs truncate font-medium mb-2">{item.title}</p>
                                <button
                                    onClick={() => handleDelete(item.id, item.url)}
                                    className="p-2 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-colors w-fit"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <div className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-md">
                                    {item.type === 'video' ? <Video size={14} /> : <ImageIcon size={14} />}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {mediaItems.length === 0 && !loading && (
                <div className="text-center py-12 text-white/30">
                    No media found. Upload something to get started.
                </div>
            )}
        </div>
    )
}

export default MediaView

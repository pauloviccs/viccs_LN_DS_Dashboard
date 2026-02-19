import React, { useState, useEffect, useCallback } from 'react';
import GlassCard from '../../components/ui/GlassCard';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../../lib/supabase';
import {
    UploadCloud,
    Image as ImageIcon,
    Film,
    Trash2,
    Loader2,
    Search,
    Filter,
    MoreVertical,
    CheckCircle
} from 'lucide-react';
import { storageService } from '../../services/storageService';

const MediaView = () => {
    // --- State ---
    const [mediaItems, setMediaItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [filter, setFilter] = useState('all'); // all, image, video
    const [search, setSearch] = useState('');
    const [isDragActive, setIsDragActive] = useState(false);

    // --- Effects ---
    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('media')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMediaItems(data || []);
        } catch (error) {
            console.error('Error fetching media:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- Upload Logic ---
    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;
        setUploading(true);
        setUploadProgress(0);

        let successCount = 0;
        const total = acceptedFiles.length;

        for (const [index, file] of acceptedFiles.entries()) {
            try {
                await storageService.uploadMedia(file);
                successCount++;
                setUploadProgress(Math.round(((index + 1) / total) * 100));
            } catch (error) {
                console.error(`Error uploading ${file.name}:`, error);
                alert(`Erro ao fazer upload de ${file.name}: ${error.message}`);
            }
        }

        if (successCount > 0) {
            await fetchMedia();
        }
        setUploading(false);
        setUploadProgress(0);
    }, []);

    const { getRootProps, getInputProps, isDragAccept } = useDropzone({
        onDrop,
        accept: {
            'image/*': [],
            'video/*': []
        },
        noClick: false,
        noKeyboard: true
    });

    // --- Actions ---
    const handleDelete = async (id, url, e) => {
        e.stopPropagation();
        if (!confirm('Tem certeza que deseja excluir este arquivo?')) return;

        try {
            // Optimistic update
            setMediaItems(prev => prev.filter(item => item.id !== id));

            await storageService.deleteMedia(id, url);
        } catch (error) {
            alert('Erro ao excluir: ' + error.message);
            fetchMedia(); // Revert on error
        }
    };

    // --- Filtering ---
    const filteredItems = mediaItems.filter(item => {
        const matchesFilter = filter === 'all' || item.type === filter;
        const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="space-y-6 animate-fade-in relative h-[calc(100vh-140px)] flex flex-col">

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 w-full md:w-auto">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm transition-all ${filter === 'all' ? 'bg-lumen-accent text-white shadow-glow' : 'text-white/50 hover:text-white'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFilter('image')}
                        className={`px-4 py-2 rounded-lg text-sm transition-all ${filter === 'image' ? 'bg-lumen-accent text-white shadow-glow' : 'text-white/50 hover:text-white'}`}
                    >
                        Imagens
                    </button>
                    <button
                        onClick={() => setFilter('video')}
                        className={`px-4 py-2 rounded-lg text-sm transition-all ${filter === 'video' ? 'bg-lumen-accent text-white shadow-glow' : 'text-white/50 hover:text-white'}`}
                    >
                        Vídeos
                    </button>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        placeholder="Buscar mídia..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white outline-none focus:border-lumen-accent/50 transition-all placeholder:text-white/20"
                    />
                </div>
            </div>

            {/* Upload Area / Dropzone */}
            <div
                {...getRootProps()}
                className={`
                    relative group flex flex-col items-center justify-center p-8 
                    border-2 border-dashed rounded-2xl transition-all cursor-pointer
                    ${isDragAccept || uploading
                        ? 'border-lumen-accent bg-lumen-accent/10'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                    }
                `}
            >
                <input {...getInputProps()} />

                {uploading ? (
                    <div className="flex flex-col items-center animate-pulse">
                        <Loader2 className="w-10 h-10 text-lumen-accent animate-spin mb-4" />
                        <p className="text-white font-medium">Enviando arquivos... {uploadProgress}%</p>
                    </div>
                ) : (
                    <>
                        <div className="p-4 rounded-full bg-white/5 group-hover:bg-lumen-accent/20 transition-colors mb-4">
                            <UploadCloud className="w-8 h-8 text-white/50 group-hover:text-lumen-accent transition-colors" />
                        </div>
                        <p className="text-white font-medium text-lg text-center">
                            Arraste arquivos aqui ou clique para fazer upload
                        </p>
                        <p className="text-white/40 text-sm mt-2 text-center">
                            Suporta imagens (JPG, PNG) e vídeos (MP4)
                        </p>
                    </>
                )}
            </div>

            {/* Media Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-20 text-white/30">
                        <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p>Nenhuma mídia encontrada.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-10">
                        {filteredItems.map((item) => (
                            <GlassCard
                                key={item.id}
                                className="group relative aspect-square overflow-hidden border-white/5 hover:border-lumen-accent/50 transition-all"
                            >
                                <div className="absolute inset-0 bg-black/20" />

                                {item.type === 'video' ? (
                                    <video
                                        src={item.url}
                                        className="w-full h-full object-cover"
                                        muted
                                        onMouseOver={e => e.target.play()} // Preview on hover
                                        onMouseOut={e => { e.target.pause(); e.target.currentTime = 0; }}
                                    />
                                ) : (
                                    <img
                                        src={item.url}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                )}

                                {/* Overlay Info */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                    <p className="text-white text-sm font-medium truncate">{item.title}</p>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-[10px] uppercase tracking-wider text-white/60 bg-white/10 px-1.5 py-0.5 rounded">
                                            {item.type}
                                        </span>
                                        <button
                                            onClick={(e) => handleDelete(item.id, item.url, e)}
                                            className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Type Icon Badge */}
                                <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm p-1.5 rounded-lg text-white/70">
                                    {item.type === 'video' ? <Film size={14} /> : <ImageIcon size={14} />}
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaView;

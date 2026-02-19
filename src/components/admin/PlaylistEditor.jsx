import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion } from 'framer-motion';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    X, Save, Clock, Image as ImageIcon, Film, Plus, GripVertical, Trash2,
    Edit, Cloud, Search
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// --- Sortable Item Component ---
function SortableItem({ id, item, onDelete, onUpdateDuration, onDurationDetected }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    const handleVideoLoad = (e) => {
        if (item.type === 'video' && (!item.duration || item.duration === 10)) {
            const vidDuration = Math.round(e.target.duration);
            if (vidDuration && vidDuration > 0) {
                onDurationDetected(id, vidDuration);
            }
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
                group relative flex items-center gap-4 p-3 rounded-xl border border-white/5 bg-white/5 
                hover:border-white/10 hover:bg-white/10 transition-all mb-2
                ${isDragging ? 'shadow-glow border-lumen-accent' : ''}
            `}
        >
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 text-white/20 hover:text-white">
                <GripVertical size={20} />
            </div>

            <div className="w-16 h-10 rounded-lg overflow-hidden bg-black/50 border border-white/5 flex-shrink-0 relative">
                {item.type === 'video' ? (
                    <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        muted
                        onLoadedMetadata={handleVideoLoad}
                    />
                ) : (
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate text-sm">{item.title || item.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider border border-white/10 px-1.5 py-0.5 rounded">
                        {item.type}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 bg-black/20 rounded-lg px-2 py-1 border border-white/5">
                <Clock size={12} className="text-white/40" />
                <input
                    type="number"
                    value={item.duration || 10}
                    onChange={(e) => onUpdateDuration(id, parseInt(e.target.value))}
                    className="w-12 bg-transparent text-white text-sm text-center outline-none"
                    min="1"
                />
                <span className="text-xs text-white/40">s</span>
            </div>

            <button
                onClick={() => onDelete(id)}
                className="p-2 text-white/20 hover:text-lumen-error hover:bg-lumen-error/10 rounded-lg transition-colors"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
}

// --- Main Editor Component ---
export default function PlaylistEditor({ playlist, onClose, onSave }) {
    const [items, setItems] = useState(playlist.items || []);
    const [mediaLibrary, setMediaLibrary] = useState([]);
    const [isLoadingMedia, setIsLoadingMedia] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [search, setSearch] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        setIsLoadingMedia(true);
        try {
            const { data, error } = await supabase
                .from('media')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMediaLibrary(data || []);
        } catch (e) {
            console.error("Error fetching media:", e);
        } finally {
            setIsLoadingMedia(false);
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex(i => i.uniqueId === active.id);
                const newIndex = items.findIndex(i => i.uniqueId === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const addItem = (mediaItem) => {
        const newItem = {
            uniqueId: Math.random().toString(36).substr(2, 9),
            id: mediaItem.id,
            name: mediaItem.title,
            type: mediaItem.type,
            url: mediaItem.url,
            duration: mediaItem.type === 'video' ? 10 : 15 // Default durations
        };
        setItems([...items, newItem]);
    };

    const removeItem = (uniqueId) => {
        setItems(items.filter(i => i.uniqueId !== uniqueId));
    };

    const updateDuration = (uniqueId, newDuration) => {
        setItems(items.map(i => i.uniqueId === uniqueId ? { ...i, duration: newDuration } : i));
    };

    const handleDurationDetected = (uniqueId, detectedDuration) => {
        setItems(prevItems => prevItems.map(i => {
            if (i.uniqueId === uniqueId && i.type === 'video') {
                return { ...i, duration: detectedDuration };
            }
            return i;
        }));
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const { error } = await supabase
                .from('playlists')
                .update({ items: items })
                .eq('id', playlist.id);

            if (error) throw error;
            onSave();
        } catch (error) {
            alert('Erro ao salvar: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const filteredLibrary = mediaLibrary.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase())
    );

    return ReactDOM.createPortal(
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
        >
            <div className="w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Edit className="text-lumen-accent" />
                            Editor: {playlist.name}
                        </h2>
                        <p className="text-white/50 text-sm mt-1">Arraste os itens para reordenar.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="px-4 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-colors">
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-lumen-accent hover:bg-lumen-accent/80 text-white px-6 py-2 rounded-xl font-medium flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                            {isSaving ? <span className="animate-spin">⏳</span> : <Save size={18} />}
                            <span>Salvar Playlist</span>
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* LEFT: Timeline */}
                    <div className="w-1/2 p-6 overflow-y-auto bg-black/20 custom-scrollbar">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Linha do Tempo</h3>
                            <span className="text-xs text-white/40">
                                {items.length} itens • {items.reduce((acc, i) => acc + (parseInt(i.duration) || 0), 0)}s total
                            </span>
                        </div>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={items.map(i => i.uniqueId)}
                                strategy={verticalListSortingStrategy}
                            >
                                {items.length === 0 ? (
                                    <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 text-center">
                                        <p className="text-white/30">Playlist vazia.</p>
                                        <p className="text-white/20 text-sm mt-2">Clique nos itens à direita para adicionar.</p>
                                    </div>
                                ) : (
                                    items.map((item) => (
                                        <SortableItem
                                            key={item.uniqueId}
                                            id={item.uniqueId}
                                            item={item}
                                            onDelete={removeItem}
                                            onUpdateDuration={updateDuration}
                                            onDurationDetected={handleDurationDetected}
                                        />
                                    ))
                                )}
                            </SortableContext>
                        </DndContext>
                    </div>

                    {/* RIGHT: Library */}
                    <div className="w-1/2 p-6 border-l border-white/10 bg-white/[0.02] flex flex-col">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input
                                    type="text"
                                    placeholder="Buscar na biblioteca..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white outline-none focus:border-lumen-accent/50 transition-all text-sm"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                            {isLoadingMedia ? (
                                <div className="flex justify-center py-10">
                                    <span className="animate-spin text-white/20">⏳</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-3">
                                    {filteredLibrary.map((media) => (
                                        <div
                                            key={media.id}
                                            onClick={() => addItem(media)}
                                            className="group relative cursor-pointer rounded-xl overflow-hidden aspect-video border border-white/5 hover:border-lumen-accent/50 transition-all hover:scale-105"
                                        >
                                            <div className="absolute inset-0 bg-black/20" />
                                            {media.type === 'video' ? (
                                                <video src={media.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                            ) : (
                                                <img src={media.url} alt={media.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                            )}

                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="bg-lumen-accent text-white p-1 rounded-full shadow-lg">
                                                    <Plus size={14} />
                                                </div>
                                            </div>

                                            <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                                                <p className="text-xs text-white truncate">{media.title}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>,
        document.body
    );
}

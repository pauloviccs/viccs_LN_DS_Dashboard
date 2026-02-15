import { useState, useEffect } from 'react'
import GlassCard from '../../components/ui/GlassCard'
import LiquidButton from '../../components/ui/LiquidButton'
import GlassInput from '../../components/ui/GlassInput'
import { Plus, Trash2, Edit, Save, X, GripVertical } from 'lucide-react'
import { playlistService } from '../../services/playlistService'
import { storageService } from '../../services/storageService'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const PlaylistsView = () => {
    const [playlists, setPlaylists] = useState([])
    const [editingId, setEditingId] = useState(null)
    const [editorItems, setEditorItems] = useState([]) // Current items in editor
    const [mediaLibrary, setMediaLibrary] = useState([]) // All available media
    const [showCreate, setShowCreate] = useState(false)
    const [newPlaylistName, setNewPlaylistName] = useState('')

    useEffect(() => {
        loadPlaylists()
        loadMedia()
    }, [])

    const loadPlaylists = async () => {
        const data = await playlistService.listPlaylists()
        setPlaylists(data)
    }

    const loadMedia = async () => {
        const data = await storageService.listMedia()
        setMediaLibrary(data)
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        if (!newPlaylistName.trim()) return
        await playlistService.createPlaylist(newPlaylistName)
        setNewPlaylistName('')
        setShowCreate(false)
        loadPlaylists()
    }

    const startEdit = (playlist) => {
        setEditingId(playlist.id)
        setEditorItems(Array.isArray(playlist.items) ? playlist.items : [])
    }

    const saveEdit = async () => {
        await playlistService.updatePlaylistItems(editingId, editorItems)
        setEditingId(null)
        loadPlaylists()
    }

    const addToPlaylist = (media) => {
        setEditorItems([...editorItems, {
            ...media,
            uniqueId: Math.random().toString(36), // Unique ID for DND
            duration: 10 // default duration
        }])
    }

    const removeFromPlaylist = (uniqueId) => {
        setEditorItems(editorItems.filter(i => i.uniqueId !== uniqueId))
    }

    // DND Logic
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const handleDragEnd = (event) => {
        const { active, over } = event
        if (active.id !== over?.id) {
            setEditorItems((items) => {
                const oldIndex = items.findIndex(i => i.uniqueId === active.id)
                const newIndex = items.findIndex(i => i.uniqueId === over.id)
                return arrayMove(items, oldIndex, newIndex)
            })
        }
    }

    if (editingId) {
        return (
            <div className="flex gap-6 h-[calc(100vh-140px)]">
                {/* Editor Zone */}
                <div className="flex-1 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Editing Playlist</h2>
                        <div className="flex gap-2">
                            <LiquidButton variant="secondary" onClick={() => setEditingId(null)}><X size={16} /> Cancel</LiquidButton>
                            <LiquidButton onClick={saveEdit}><Save size={16} /> Save</LiquidButton>
                        </div>
                    </div>

                    <GlassCard className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={editorItems.map(i => i.uniqueId)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-2">
                                    {editorItems.map((item, index) => (
                                        <SortableItem
                                            key={item.uniqueId}
                                            id={item.uniqueId}
                                            item={item}
                                            index={index}
                                            onRemove={() => removeFromPlaylist(item.uniqueId)}
                                        />
                                    ))}
                                    {editorItems.length === 0 && <div className="text-center text-white/30 py-10">Drag items here or click to add from library</div>}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </GlassCard>
                </div>

                {/* Media Library Sidepanel */}
                <GlassCard className="w-80 flex flex-col gap-4 p-4 overflow-hidden">
                    <h3 className="font-semibold text-white/70">Media Library</h3>
                    <div className="overflow-y-auto grid grid-cols-2 gap-2 pr-2 custom-scrollbar">
                        {mediaLibrary.map(media => (
                            <div
                                key={media.id}
                                onClick={() => addToPlaylist(media)}
                                className="aspect-square bg-white/5 rounded-lg overflow-hidden cursor-pointer hover:ring-2 ring-blue-500 transition-all relative group"
                            >
                                {media.type === 'video'
                                    ? <video src={media.url} className="w-full h-full object-cover" />
                                    : <img src={media.url} className="w-full h-full object-cover" />
                                }
                                <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Plus className="text-white" />
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Playlists</h2>
                <LiquidButton onClick={() => setShowCreate(true)}><Plus size={20} /> New Playlist</LiquidButton>
            </div>

            {showCreate && (
                <form onSubmit={handleCreate} className="flex gap-2 animate-fade-in">
                    <GlassInput
                        placeholder="Playlist Name"
                        value={newPlaylistName}
                        onChange={e => setNewPlaylistName(e.target.value)}
                        autoFocus
                    />
                    <LiquidButton type="submit">Create</LiquidButton>
                    <LiquidButton variant="secondary" onClick={() => setShowCreate(false)}>Cancel</LiquidButton>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {playlists.map(playlist => (
                    <GlassCard key={playlist.id} className="group relative min-h-[150px] flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-bold">{playlist.name}</h3>
                            <p className="text-white/50">{Array.isArray(playlist.items) ? playlist.items.length : 0} items</p>
                        </div>

                        <div className="flex gap-2 mt-4 opacity-50 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => startEdit(playlist)}
                                className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-colors flex-1 flex justify-center"
                            >
                                <Edit size={18} />
                            </button>
                            <button
                                onClick={async () => {
                                    if (confirm('Delete?')) {
                                        await playlistService.deletePlaylist(playlist.id)
                                        loadPlaylists()
                                    }
                                }}
                                className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    )
}

const SortableItem = ({ id, item, onRemove, index }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
    const style = { transform: CSS.Transform.toString(transform), transition }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white/5 p-3 rounded-lg flex items-center gap-4 group hover:bg-white/10 transition-colors"
        >
            <div {...attributes} {...listeners} className="cursor-grab hover:text-white/80 text-white/30">
                <GripVertical size={20} />
            </div>

            <div className="w-12 h-12 bg-black/40 rounded overflow-hidden flex-shrink-0">
                {item.type === 'video'
                    ? <video src={item.url} className="w-full h-full object-cover" />
                    : <img src={item.url} className="w-full h-full object-cover" />
                }
            </div>

            <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-sm">{item.title}</p>
                <p className="text-xs text-white/40">{item.duration}s</p>
            </div>

            <button onClick={onRemove} className="text-white/20 hover:text-red-400 transition-colors">
                <X size={18} />
            </button>
        </div>
    )
}

export default PlaylistsView

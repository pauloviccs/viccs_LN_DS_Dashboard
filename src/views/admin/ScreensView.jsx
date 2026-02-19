import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '../../components/ui/GlassCard'
import LiquidButton from '../../components/ui/LiquidButton'
import GlassInput from '../../components/ui/GlassInput'
import {
    Monitor,
    Plus,
    Trash2,
    Link as LinkIcon,
    RefreshCw,
    Smartphone,
    LayoutGrid,
    List,
    X,
    Check
} from 'lucide-react'
import { screenService } from '../../services/screenService'
import { playlistService } from '../../services/playlistService'
import { supabase } from '../../lib/supabase'

// --- Sub-components (Visuals) ---

const ViewToggle = ({ mode, setMode }) => (
    <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
        <button
            onClick={() => setMode('grid')}
            className={`p-2 rounded-lg transition-all ${mode === 'grid' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-white/50 hover:text-white'
                }`}
            title="Grid View"
        >
            <LayoutGrid className="w-4 h-4" />
        </button>
        <button
            onClick={() => setMode('list')}
            className={`p-2 rounded-lg transition-all ${mode === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-white/50 hover:text-white'
                }`}
            title="List View"
        >
            <List className="w-4 h-4" />
        </button>
    </div>
);

const StatusBadge = ({ status }) => {
    const isOnline = status === 'online';
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${isOnline
            ? 'bg-green-500/20 text-green-400 border-green-500/30 shadow-[0_0_10px_rgba(74,222,128,0.2)]'
            : 'bg-red-500/20 text-red-400 border-red-500/30'
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            {isOnline ? 'ONLINE' : 'OFFLINE'}
        </span>
    );
};

const ScreensView = () => {
    const [screens, setScreens] = useState([])
    const [playlists, setPlaylists] = useState([])
    const [showPair, setShowPair] = useState(false)
    const [newScreenName, setNewScreenName] = useState('')
    const [pairingCode, setPairingCode] = useState('')
    const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadData()

        // Realtime Subscription
        const subscription = supabase
            .channel('public:screens')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'screens' }, (payload) => {
                // Optimization: Ignore updates where ONLY 'last_ping' changed
                if (payload.eventType === 'UPDATE' && payload.old && payload.new) {
                    const keys = Object.keys(payload.new);
                    const changes = keys.filter(key => payload.new[key] !== payload.old[key]);

                    // If the ONLY change is 'last_ping', ignore it to prevent UI jitter
                    if (changes.length === 1 && changes[0] === 'last_ping') {
                        return;
                    }
                }
                // Refresh data on significant changes
                loadData()
            })
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const loadData = async () => {
        // setLoading(true) // Optional: avoid full spinner on background updates
        try {
            const [sData, pData] = await Promise.all([
                screenService.listScreens(),
                playlistService.listPlaylists()
            ])
            setScreens(sData)
            setPlaylists(pData)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handlePair = async (e) => {
        e.preventDefault()
        if (!newScreenName || !pairingCode) return

        try {
            await screenService.pairScreen(newScreenName, pairingCode)
            setNewScreenName('')
            setPairingCode('')
            setShowPair(false)
            loadData() // Refresh immediately
        } catch (error) {
            alert('Error pairing screen: ' + error.message)
        }
    }

    const handleAssignPlaylist = async (screenId, playlistId) => {
        const normalized = playlistId || null
        try {
            // Optimistic Update
            setScreens(screens.map(s => s.id === screenId ? { ...s, playlist_id: normalized } : s))
            await screenService.assignPlaylist(screenId, normalized)
            loadData() // Verify
        } catch (error) {
            console.error(error)
            loadData() // Revert on error
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja remover esta tela?')) return;
        try {
            await screenService.deleteScreen(id)
            loadData()
        } catch (error) {
            alert('Erro ao deletar: ' + error.message);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                        Screens Management
                    </h2>
                    <p className="text-white/40 text-sm mt-1">Manage your connected displays and content</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <ViewToggle mode={viewMode} setMode={setViewMode} />
                    <LiquidButton onClick={() => setShowPair(true)} className="flex-1 md:flex-none justify-center">
                        <Plus size={20} /> <span className="ml-2">Pair Screen</span>
                    </LiquidButton>
                </div>
            </div>

            {/* Pairing Modal Overlay */}
            <AnimatePresence>
                {showPair && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md"
                        >
                            <GlassCard className="border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                                        <Smartphone size={24} className="text-blue-400" />
                                        Pair New Device
                                    </h3>
                                    <button
                                        onClick={() => setShowPair(false)}
                                        className="text-white/40 hover:text-white transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handlePair} className="space-y-6">
                                    <div>
                                        <label className="text-xs font-bold text-blue-300/80 tracking-widest block mb-2 uppercase">
                                            Screen Name
                                        </label>
                                        <GlassInput
                                            placeholder="e.g. Lobby TV"
                                            value={newScreenName}
                                            onChange={e => setNewScreenName(e.target.value)}
                                            required
                                            className="text-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-blue-300/80 tracking-widest block mb-2 uppercase">
                                            Pairing Code
                                        </label>
                                        <GlassInput
                                            placeholder="X99-B2A"
                                            value={pairingCode}
                                            onChange={e => setPairingCode(e.target.value.toUpperCase())}
                                            required
                                            className="font-mono text-center text-2xl tracking-[0.2em] uppercase py-4 border-blue-500/30 focus:border-blue-400"
                                            maxLength={6}
                                        />
                                        <p className="text-xs text-white/30 text-center mt-2">
                                            Enter the 6-character code displayed on the TV
                                        </p>
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <LiquidButton type="button" variant="secondary" onClick={() => setShowPair(false)} className="flex-1 justify-center">
                                            Cancel
                                        </LiquidButton>
                                        <LiquidButton type="submit" className="flex-1 justify-center bg-blue-600 hover:bg-blue-500">
                                            Confirm Connection
                                        </LiquidButton>
                                    </div>
                                </form>
                            </GlassCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content Area */}
            <motion.div layout className="min-h-[200px]">
                {screens.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-white/30 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                        <Monitor size={64} className="mb-6 opacity-20" />
                        <h3 className="text-xl font-bold text-white/50 mb-2">No screens paired</h3>
                        <p className="text-sm max-w-xs text-center">
                            Download the Player App on your TV and enter the code here to get started.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* GRID VIEW */}
                        {viewMode === 'grid' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                <AnimatePresence>
                                    {screens.map((screen, index) => (
                                        <motion.div
                                            key={screen.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <GlassCard className="h-full flex flex-col hover:border-blue-500/30 transition-colors group">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="p-3 rounded-xl bg-white/5 text-blue-400">
                                                        <Monitor size={24} />
                                                    </div>
                                                    <StatusBadge status={screen.status} />
                                                </div>

                                                <h3 className="font-bold text-lg text-white mb-1 truncate" title={screen.name}>
                                                    {screen.name}
                                                </h3>
                                                <div className="text-xs font-mono text-white/40 mb-6 flex items-center gap-2 h-5">
                                                    {screen.pairing_code ? (
                                                        <>
                                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                                            {screen.pairing_code}
                                                        </>
                                                    ) : (
                                                        <span className="text-white/20 flex items-center gap-1">
                                                            <Check size={12} /> Paired
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="mt-auto pt-4 border-t border-white/5 space-y-3">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5 block">
                                                            Playlist
                                                        </label>
                                                        <div className="relative">
                                                            <select
                                                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50 appearance-none hover:bg-white/5 transition-colors cursor-pointer"
                                                                value={screen.playlist_id || ''}
                                                                onChange={(e) => handleAssignPlaylist(screen.id, e.target.value)}
                                                            >
                                                                <option value="">No Playlist Assigned</option>
                                                                {playlists.map(p => (
                                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                                ))}
                                                            </select>
                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                                                                <List size={14} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end">
                                                        <button
                                                            onClick={() => handleDelete(screen.id)}
                                                            className="text-xs text-white/30 hover:text-red-400 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-red-500/10"
                                                        >
                                                            <Trash2 size={14} /> Unpair Device
                                                        </button>
                                                    </div>
                                                </div>
                                            </GlassCard>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* LIST VIEW */}
                        {viewMode === 'list' && (
                            <div className="space-y-2">
                                <AnimatePresence>
                                    {screens.map((screen, index) => (
                                        <motion.div
                                            key={screen.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <GlassCard className="flex items-center gap-4 py-3 hover:bg-white/[0.02] transition-colors group">
                                                <div className="p-2.5 rounded-xl bg-white/5 text-blue-400/80">
                                                    <Monitor size={20} />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="font-bold text-white truncate">{screen.name}</h3>
                                                        <StatusBadge status={screen.status} />
                                                    </div>
                                                    <p className="text-xs font-mono text-white/40 mt-0.5">
                                                        {screen.pairing_code ? `CODE: ${screen.pairing_code}` : 'DEVICE PAIRED'}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <select
                                                        className="bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500/50 hover:bg-white/5 transition-colors cursor-pointer w-40"
                                                        value={screen.playlist_id || ''}
                                                        onChange={(e) => handleAssignPlaylist(screen.id, e.target.value)}
                                                    >
                                                        <option value="">No Playlist</option>
                                                        {playlists.map(p => (
                                                            <option key={p.id} value={p.id}>{p.name}</option>
                                                        ))}
                                                    </select>

                                                    <button
                                                        onClick={() => handleDelete(screen.id)}
                                                        className="p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                        title="Unpair"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </GlassCard>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </>
                )}
            </motion.div>
        </div>
    )
}

export default ScreensView


import { useState, useEffect } from 'react'
import GlassCard from '../../components/ui/GlassCard'
import { Monitor, RefreshCw, Grid, List as ListIcon, Clock, Film, MessageSquare, Info, WifiOff, Wifi } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import useStore from '../../stores/useStore'
import { motion, AnimatePresence } from 'framer-motion'

const MyScreensView = () => {
    const { user } = useStore()
    const [screens, setScreens] = useState([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
    const [selectedScreen, setSelectedScreen] = useState(null)

    useEffect(() => {
        if (user) {
            loadScreens()

            // Realtime subscription
            const subscription = supabase
                .channel('my-screens-list')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'screens',
                    filter: `assigned_to=eq.${user.id}`
                }, () => {
                    loadScreens()
                })
                .subscribe()

            return () => {
                subscription.unsubscribe()
            }
        }
    }, [user])

    const loadScreens = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('screens')
            .select('*, playlists(name)')
            .eq('assigned_to', user.id)
            .order('created_at', { ascending: false })

        if (!error) setScreens(data || [])
        setLoading(false)
    }

    return (
        <div className="space-y-6 animate-fade-in relative min-h-[calc(100vh-140px)]">
            {/* Header / Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">My Screens</h2>
                    <p className="text-white/40 text-sm">Manage and monitor your connected displays.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white/5 p-1 rounded-lg border border-white/10 flex">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                        >
                            <ListIcon size={18} />
                        </button>
                    </div>
                    <button
                        onClick={loadScreens}
                        className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <RefreshCw className="w-8 h-8 text-white/20 animate-spin" />
                </div>
            ) : screens.length === 0 ? (
                <GlassCard className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <Monitor className="w-8 h-8 text-white/20" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">No Screens Found</h3>
                    <p className="text-white/40 max-w-sm">
                        You don't have any screens assigned to your account yet.
                        Please contact support to pair a new device.
                    </p>
                </GlassCard>
            ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-3'}>
                    {screens.map(screen => (
                        <ScreenCard
                            key={screen.id}
                            screen={screen}
                            viewMode={viewMode}
                            onClick={() => setSelectedScreen(screen)}
                        />
                    ))}
                </div>
            )}

            {/* Screen Detail Modal */}
            <AnimatePresence>
                {selectedScreen && (
                    <ScreenDetailModal
                        screen={selectedScreen}
                        onClose={() => setSelectedScreen(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

const ScreenCard = ({ screen, viewMode, onClick }) => {
    const isOnline = screen.status === 'online';

    if (viewMode === 'list') {
        return (
            <GlassCard onClick={onClick} className="p-4 flex items-center gap-4 hover:bg-white/5 cursor-pointer transition-colors group">
                <div className={`p-2.5 rounded-lg ${isOnline ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    <Monitor size={20} />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white truncate">{screen.name}</h4>
                    <p className="text-xs text-white/40 truncate font-mono mt-0.5">{screen.pairing_code}</p>
                </div>
                <div className="hidden md:flex items-center gap-6 text-sm text-white/40">
                    <span className="flex items-center gap-2">
                        <Film size={14} />
                        {screen.playlists?.name || 'No Content'}
                    </span>
                    <span className="flex items-center gap-2">
                        <Clock size={14} />
                        {screen.last_seen ? new Date(screen.last_seen).toLocaleTimeString() : '--:--'}
                    </span>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${isOnline ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    {isOnline ? 'ONLINE' : 'OFFLINE'}
                </div>
            </GlassCard>
        )
    }

    return (
        <GlassCard onClick={onClick} className="relative group hover:border-lumen-accent/50 transition-all cursor-pointer overflow-hidden p-0">
            <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl border ${isOnline ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        {isOnline ? <Wifi size={24} /> : <WifiOff size={24} />}
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${isOnline ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-white/5 text-white/40 border-white/10'}`}>
                        {screen.status}
                    </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-1 truncate">{screen.name}</h3>
                <p className="text-white/40 text-xs font-mono mb-4">{screen.pairing_code}</p>

                <div className="space-y-2 pt-4 border-t border-white/5">
                    <div className="flex justify-between text-sm">
                        <span className="text-white/40 flex items-center gap-2"><Film size={14} /> Playlist</span>
                        <span className="text-white font-medium truncate max-w-[120px]">{screen.playlists?.name || 'None'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-white/40 flex items-center gap-2"><Clock size={14} /> Last Seen</span>
                        <span className="text-white/60">{screen.last_seen ? new Date(screen.last_seen).toLocaleTimeString() : 'Never'}</span>
                    </div>
                </div>
            </div>

            {/* Hover Actions Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-6">
                <button className="w-full py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-white font-medium text-sm flex items-center justify-center gap-2 transition-all">
                    <Info size={16} /> View Details
                </button>
            </div>
        </GlassCard>
    )
}

const ScreenDetailModal = ({ screen, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        <GlassCard className="w-full max-w-lg relative overflow-hidden">
            {/* Header bg */}
            <div className={`absolute top-0 left-0 right-0 h-32 ${screen.status === 'online' ? 'bg-gradient-to-b from-green-500/20' : 'bg-gradient-to-b from-red-500/20'} to-transparent`} />

            <div className="relative p-6 px-8 pt-10">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="flex flex-col items-center text-center mb-8">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 border-4 border-[#0a0a0a] shadow-xl ${screen.status === 'online' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        <Monitor size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">{screen.name}</h2>
                    <p className="text-white/40 font-mono mt-1 text-sm bg-white/5 px-3 py-1 rounded-full">{screen.pairing_code}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <span className="text-xs text-white/40 uppercase tracking-wider block mb-1">Status</span>
                        <div className={`text-lg font-bold flex items-center gap-2 ${screen.status === 'online' ? 'text-green-400' : 'text-red-400'}`}>
                            {screen.status === 'online' ? <Wifi size={18} /> : <WifiOff size={18} />}
                            {screen.status.toUpperCase()}
                        </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <span className="text-xs text-white/40 uppercase tracking-wider block mb-1">Last Update</span>
                        <div className="text-lg font-bold text-white">
                            {screen.last_seen ? new Date(screen.last_seen).toLocaleTimeString() : 'N/A'}
                        </div>
                    </div>
                    <div className="col-span-2 bg-white/5 rounded-xl p-4 border border-white/5 flex items-center justify-between">
                        <div>
                            <span className="text-xs text-white/40 uppercase tracking-wider block mb-1">Playing Content</span>
                            <div className="text-lg font-bold text-white flex items-center gap-2">
                                <Film size={18} className="text-lumen-accent" />
                                {screen.playlists?.name || 'No Playlist Assigned'}
                            </div>
                        </div>
                    </div>
                </div>

                <button className="w-full py-3 rounded-xl bg-lumen-accent text-white font-bold hover:bg-lumen-accent/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-lumen-accent/20">
                    <MessageSquare size={18} />
                    Contact Support for this Screen
                </button>
            </div>
        </GlassCard>
    </div>
)

export default MyScreensView

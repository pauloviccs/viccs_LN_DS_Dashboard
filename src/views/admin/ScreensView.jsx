import { useState, useEffect } from 'react'
import GlassCard from '../../components/ui/GlassCard'
import LiquidButton from '../../components/ui/LiquidButton'
import GlassInput from '../../components/ui/GlassInput'
import { Monitor, Plus, Trash2, Link as LinkIcon, RefreshCw, Smartphone } from 'lucide-react'
import { screenService } from '../../services/screenService'
import { playlistService } from '../../services/playlistService'

const ScreensView = () => {
    const [screens, setScreens] = useState([])
    const [playlists, setPlaylists] = useState([])
    const [showPair, setShowPair] = useState(false)
    const [newScreenName, setNewScreenName] = useState('')
    const [pairingCode, setPairingCode] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        const [sData, pData] = await Promise.all([
            screenService.listScreens(),
            playlistService.listPlaylists()
        ])
        setScreens(sData)
        setPlaylists(pData)
    }

    const handlePair = async (e) => {
        e.preventDefault()
        if (!newScreenName || !pairingCode) return

        try {
            await screenService.pairScreen(newScreenName, pairingCode)
            setNewScreenName('')
            setPairingCode('')
            setShowPair(false)
            loadData()
        } catch (error) {
            alert('Error pairing screen: ' + error.message)
        }
    }

    const handleAssignPlaylist = async (screenId, playlistId) => {
        try {
            await screenService.assignPlaylist(screenId, playlistId)
            loadData()
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Screens Management</h2>
                <LiquidButton onClick={() => setShowPair(true)}>
                    <Plus size={20} /> Pair Screen
                </LiquidButton>
            </div>

            {showPair && (
                <GlassCard className="mb-6 animate-fade-in border-blue-500/30">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Smartphone size={20} className="text-blue-400" /> Pair New Device
                    </h3>
                    <form onSubmit={handlePair} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="text-xs text-white/50 mb-1 block">Screen Name</label>
                            <GlassInput
                                placeholder="e.g. Lobby TV"
                                value={newScreenName}
                                onChange={e => setNewScreenName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <label className="text-xs text-white/50 mb-1 block">Pairing Code (Displayed on TV)</label>
                            <GlassInput
                                placeholder="e.g. X7K-9P2"
                                value={pairingCode}
                                onChange={e => setPairingCode(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex gap-2">
                            <LiquidButton type="submit">Connect</LiquidButton>
                            <LiquidButton type="button" variant="secondary" onClick={() => setShowPair(false)}>Cancel</LiquidButton>
                        </div>
                    </form>
                </GlassCard>
            )}

            <div className="grid grid-cols-1 gap-4">
                {screens.map(screen => (
                    <GlassCard key={screen.id} className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 min-h-[100px]">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${screen.status === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                <Monitor size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{screen.name}</h3>
                                <div className="flex items-center gap-2 text-sm text-white/50">
                                    <span className={`w-2 h-2 rounded-full ${screen.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                                    {screen.status === 'online' ? 'Online' : 'Offline'} • Last seen: {screen.last_seen ? new Date(screen.last_seen).toLocaleTimeString() : 'Never'}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="flex-1 md:flex-initial">
                                <label className="text-xs text-white/30 block mb-1">Active Playlist</label>
                                <select
                                    className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none w-full md:w-48"
                                    value={screen.playlist_id || ''}
                                    onChange={(e) => handleAssignPlaylist(screen.id, e.target.value)}
                                >
                                    <option value="">No Playlist</option>
                                    {playlists.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={async () => {
                                    if (confirm('Unpair and delete this screen?')) {
                                        await screenService.deleteScreen(screen.id)
                                        loadData()
                                    }
                                }}
                                className="p-3 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-lg transition-colors"
                                title="Unpair Screen"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </GlassCard>
                ))}

                {screens.length === 0 && (
                    <div className="text-center py-12 text-white/30 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                        <Monitor size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No screens paired yet.</p>
                        <p className="text-sm">Enter the code displayed on your TV player App to connect.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ScreensView

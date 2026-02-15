import { useState, useEffect } from 'react'
import GlassCard from '../../components/ui/GlassCard'
import { Monitor, RefreshCw } from 'lucide-react'
import { screenService } from '../../services/screenService'
import { supabase } from '../../lib/supabase'

const MyScreensView = () => {
    const [screens, setScreens] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadScreens()
    }, [])

    const loadScreens = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()

        // Clients only see screens assigned to them
        const { data, error } = await supabase
            .from('screens')
            .select('*, playlists(name)')
            .eq('assigned_to', user.id)
            .order('created_at', { ascending: false })

        if (!error) setScreens(data)
        setLoading(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">My Screens</h2>
                <button onClick={loadScreens} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {screens.map(screen => (
                    <GlassCard key={screen.id} className="relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${screen.status === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                <Monitor size={24} />
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${screen.status === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/40'}`}>
                                {screen.status}
                            </span>
                        </div>

                        <h3 className="text-xl font-bold mb-1">{screen.name}</h3>
                        <p className="text-white/50 text-sm mb-4">
                            Playing: <span className="text-white font-medium">{screen.playlists?.name || 'Nothing'}</span>
                        </p>

                        <div className="pt-4 border-t border-white/5 flex justify-between text-xs text-white/30">
                            <span>ID: {screen.pairing_code}</span>
                            <span>Last seen: {screen.last_seen ? new Date(screen.last_seen).toLocaleTimeString() : '-'}</span>
                        </div>
                    </GlassCard>
                ))}

                {!loading && screens.length === 0 && (
                    <div className="col-span-full text-center py-12 text-white/30">
                        No screens assigned to your account. Contact administrator.
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyScreensView

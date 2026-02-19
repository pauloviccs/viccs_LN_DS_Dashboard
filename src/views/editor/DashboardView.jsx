import { motion } from 'framer-motion'
import { Activity, HardDrive, List, Monitor, Plus } from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import useStore from '../../stores/useStore'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const EditorDashboard = () => {
    const { user } = useStore()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        activeScreens: 0,
        totalScreens: 0,
        activePercentage: 0,
        storageUsed: 0,
        storagePercentage: 0,
        totalPlaylists: 0,
        totalDevices: 0
    })
    const [recentScreens, setRecentScreens] = useState([])

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true)

                // 1. Fetch Screens (for Active, Total, Recent)
                const { data: screens, error: screensError } = await supabase
                    .from('screens')
                    .select('*')
                    .order('last_seen', { ascending: false })

                if (screensError) throw screensError

                const totalScreens = screens.length
                const activeScreens = screens.filter(s => s.status === 'online').length
                const activePercentage = totalScreens > 0 ? Math.round((activeScreens / totalScreens) * 100) : 0

                // 2. Fetch Media (for Storage)
                const { data: mediaFiles, error: mediaError } = await supabase
                    .from('media')
                    .select('size')

                if (mediaError) throw mediaError

                const totalBytes = mediaFiles.reduce((acc, file) => acc + (file.size || 0), 0)
                const storageUsedGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(1)
                const maxStorageGB = 5 // Mock limit for now
                const storagePercentage = Math.min(Math.round((storageUsedGB / maxStorageGB) * 100), 100)

                // 3. Fetch Playlists (Count)
                const { count: playlistsCount, error: playlistsError } = await supabase
                    .from('playlists')
                    .select('*', { count: 'exact', head: true })

                if (playlistsError) throw playlistsError

                setStats({
                    activeScreens,
                    totalScreens,
                    activePercentage,
                    storageUsed: storageUsedGB,
                    storagePercentage,
                    totalPlaylists: playlistsCount || 0,
                    totalDevices: totalScreens // Assuming devices = screens for now
                })

                setRecentScreens(screens.slice(0, 5))

            } catch (error) {
                console.error('Error fetching editor dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    return (
        <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Visão Geral</h1>
                    <p className="text-white/40 text-sm">Status em tempo real da rede</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 rounded-lg bg-lumen-accent hover:bg-lumen-accent/90 text-white text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-lumen-accent/20">
                        <Plus size={16} />
                        Nova Playlist
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Telas Ativas"
                    value={loading ? '-' : stats.activeScreens}
                    subtext={`${loading ? '-' : stats.activePercentage}% Online`}
                    icon={Monitor}
                    accentColor="text-green-400"
                    progress={loading ? 0 : stats.activePercentage}
                    progressColor="bg-green-500"
                />
                <StatCard
                    title="Armazenamento"
                    value={loading ? '-' : `${stats.storageUsed} GB`}
                    subtext={`${loading ? '-' : stats.storagePercentage}% Utilizado`}
                    icon={HardDrive}
                    accentColor="text-purple-400"
                    progress={loading ? 0 : stats.storagePercentage}
                    progressColor="bg-purple-500"
                />
                <StatCard
                    title="Playlists"
                    value={loading ? '-' : stats.totalPlaylists}
                    subtext="Prontas para uso"
                    icon={List}
                    accentColor="text-yellow-400"
                    progress={60} // Fixed progress for now or calculate based on target
                    progressColor="bg-yellow-500"
                />
                <StatCard
                    title="Dispositivos Totais"
                    value={loading ? '-' : stats.totalDevices}
                    subtext="Cadastrados na rede"
                    icon={Activity}
                    accentColor="text-blue-400"
                    progress={100}
                    progressColor="bg-blue-500"
                />
            </div>

            {/* Main Chart Section */}
            <GlassCard className="p-6 h-[400px] relative overflow-hidden group">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Activity className="text-lumen-accent" size={20} />
                            Atividade da Rede
                        </h3>
                        <p className="text-white/30 text-xs mt-1">Status de players e requisições nas últimas 24h</p>
                    </div>
                    <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
                        {['24h', '7d', '30d'].map((period) => (
                            <button
                                key={period}
                                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${period === '24h' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mock Chart Area */}
                <div className="w-full h-[300px] flex items-end justify-between gap-1 px-2 pb-2 opacity-50">
                    {[...Array(40)].map((_, i) => (
                        <div
                            key={i}
                            className="w-full bg-lumen-accent/20 rounded-t-sm hover:bg-lumen-accent/50 transition-all cursor-crosshair"
                            style={{ height: `${Math.random() * 80 + 10}%` }}
                        />
                    ))}
                </div>
            </GlassCard>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Screens */}
                <GlassCard className="lg:col-span-2 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">Telas Recentes</h3>
                        <button className="text-xs text-lumen-accent hover:text-white transition-colors">Ver todas</button>
                    </div>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-white/30 text-center py-4">Carregando telas...</div>
                        ) : recentScreens.length === 0 ? (
                            <div className="text-white/30 text-center py-4">Nenhuma tela encontrada.</div>
                        ) : (
                            recentScreens.map((screen) => (
                                <div key={screen.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group cursor-pointer border border-transparent hover:border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2 h-2 rounded-full ${screen.status === 'online' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
                                        <div>
                                            <h4 className="font-bold text-white text-sm">{screen.name}</h4>
                                            <p className="text-white/30 text-xs">Código: {screen.pairing_code}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white/60 text-xs">Atualizado: <span className="text-white">{new Date(screen.last_seen || screen.created_at).toLocaleTimeString()}</span></p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </GlassCard>

                {/* System Health */}
                <GlassCard className="p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/5" />
                            <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-lumen-accent" strokeDasharray="440" strokeDashoffset="44" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-white">100%</span>
                            <span className="text-xs text-white/40 uppercase tracking-widest">Saúde</span>
                        </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Sistema Operacional</h3>
                    <p className="text-white/40 text-xs max-w-[200px]">
                        Todos os serviços rodando normalmente.
                    </p>
                    <button className="mt-6 w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white transition-all uppercase tracking-wider">
                        Ver Logs
                    </button>
                </GlassCard>
            </div>
        </div>
    )
}

const StatCard = ({ title, value, subtext, icon: Icon, accentColor, progress, progressColor }) => (
    <GlassCard className="p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h2 className="text-3xl font-display font-bold text-white">{value}</h2>
                    {title === 'Telas Ativas' && <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded">ON</span>}
                </div>
            </div>
            <div className={`p-3 rounded-xl bg-white/5 border border-white/5 ${accentColor}`}>
                <Icon size={24} />
            </div>
        </div>

        <div className="w-full bg-white/10 h-1 rounded-full mb-2 overflow-hidden">
            <div className={`h-full ${progressColor} rounded-full`} style={{ width: `${progress}%` }} />
        </div>

        <p className="text-xs text-white/50">{subtext}</p>
    </GlassCard>
)

export default EditorDashboard

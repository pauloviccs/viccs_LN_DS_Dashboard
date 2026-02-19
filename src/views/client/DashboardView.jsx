import { useState, useEffect } from 'react'
import GlassCard from '../../components/ui/GlassCard'
import { Activity, Monitor, Clock, Info } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import useStore from '../../stores/useStore'

const DashboardView = () => {
    const { user } = useStore()
    const [stats, setStats] = useState({
        total: 0,
        online: 0,
        uptime: '0%',
        offline: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        const fetchStats = async () => {
            try {
                const { data, error } = await supabase
                    .from('screens')
                    .select('status')
                    .eq('assigned_to', user.id)

                if (error) throw error

                const total = data.length
                const online = data.filter(s => s.status === 'online').length
                const offline = total - online
                const uptime = total > 0 ? Math.round((online / total) * 100) : 0

                setStats({ total, online, offline, uptime: `${uptime}%` })
            } catch (error) {
                console.error('Error fetching dashboard stats:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()

        // Realtime subscription for live updates
        const subscription = supabase
            .channel('dashboard-metrics')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'screens',
                filter: `assigned_to=eq.${user.id}`
            }, () => {
                fetchStats()
            })
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [user])

    return (
        <div className="space-y-8 animate-fade-in relative">
            {/* Greeting Section Removed (Handled in Layout) */}
            <div className="flex justify-end gap-4">
                {/* UUID Display (Blurred) */}
                <div className="group relative bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3 transition-all hover:bg-white/10">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest">User UUID</span>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-white/50 blur-[4px] group-hover:blur-none transition-all duration-300 select-all cursor-pointer">
                                {user?.id}
                            </span>
                        </div>
                    </div>
                </div>
                <StatCard
                    title="Active Now"
                    value={loading ? '-' : stats.online}
                    icon={Activity}
                    color="text-green-400"
                    bg="bg-green-500/10 border-green-500/20"
                />
                <StatCard
                    title="Network Health"
                    value={loading ? '-' : stats.uptime}
                    icon={Clock}
                    color="text-purple-400"
                    bg="bg-purple-500/10 border-purple-500/20"
                />
            </div>

            {/* Welcome / Info Card */}
            <GlassCard className="p-10 text-center min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden group hover:border-lumen-accent/30 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-lumen-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                <h3 className="text-2xl font-bold mb-3 text-white relative z-10">Welcome to Lumia Client</h3>
                <p className="text-white/50 max-w-lg mx-auto relative z-10 leading-relaxed">
                    Monitor your digital signage screens in real-time. Changes made by administrators will be reflected automatically on your displays.
                </p>

                <div className="mt-8 flex gap-4 relative z-10">
                    <button className="px-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-colors">
                        View Documentation
                    </button>
                    <button className="px-6 py-2 rounded-lg bg-lumen-accent/20 hover:bg-lumen-accent/30 text-lumen-accent border border-lumen-accent/20 text-sm font-medium transition-colors">
                        Contact Support
                    </button>
                </div>
            </GlassCard>
        </div >
    )
}

const StatCard = ({ title, value, icon: Icon, color, bg }) => (
    <GlassCard className="flex items-center justify-between p-6 group hover:scale-[1.02] transition-transform duration-300">
        <div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">{title}</p>
            <h2 className="text-4xl font-display font-bold text-white">{value}</h2>
        </div>
        <div className={`p-4 rounded-2xl border ${bg} ${color} shadow-lg backdrop-blur-md group-hover:shadow-glow-sm transition-all`}>
            <Icon size={32} />
        </div>
    </GlassCard>
)

export default DashboardView

import { useState, useEffect } from 'react'
import GlassCard from '../../components/ui/GlassCard'
import { Activity, Monitor, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const DashboardView = () => {
    const [stats, setStats] = useState({ total: 0, online: 0, uptime: '0%' })

    useEffect(() => {
        async function loadStats() {
            const { data: { user } } = await supabase.auth.getUser()
            const { data } = await supabase
                .from('screens')
                .select('status')
                .eq('assigned_to', user.id)

            const total = data?.length || 0
            const online = data?.filter(s => s.status === 'online').length || 0

            setStats({
                total,
                online,
                uptime: total > 0 ? Math.round((online / total) * 100) + '%' : '0%'
            })
        }
        loadStats()
    }, [])

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="My Screens" value={stats.total} icon={Monitor} color="text-blue-400" />
                <StatCard title="Active Now" value={stats.online} icon={Activity} color="text-green-400" />
                <StatCard title="Network Health" value={stats.uptime} icon={Clock} color="text-purple-400" />
            </div>

            <GlassCard className="p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
                <h3 className="text-xl font-bold mb-2">Welcome to Lumia Client</h3>
                <p className="text-white/50 max-w-md mx-auto">
                    Monitor your digital signage screens in real-time. Changes made by administrators will be reflected automatically on your displays.
                </p>
            </GlassCard>
        </div>
    )
}

const StatCard = ({ title, value, icon: Icon, color }) => (
    <GlassCard className="flex items-center justify-between p-6">
        <div>
            <p className="text-white/50 text-sm font-medium uppercase tracking-wider">{title}</p>
            <h2 className="text-4xl font-bold mt-2">{value}</h2>
        </div>
        <div className={`p-4 rounded-2xl bg-white/5 border border-white/5 ${color} shadow-lg backdrop-blur-md`}>
            <Icon size={32} />
        </div>
    </GlassCard>
)

export default DashboardView

import GlassCard from '../../components/ui/GlassCard'
import { Activity, HardDrive, Wifi } from 'lucide-react'

const DashboardView = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Active Screens" value="12" icon={Wifi} color="text-green-400" />
            <StatCard title="Storage Used" value="45 GB" icon={HardDrive} color="text-blue-400" />
            <StatCard title="Online Status" value="98%" icon={Activity} color="text-purple-400" />

            <GlassCard className="col-span-1 lg:col-span-2 min-h-[300px]">
                <h3 className="text-lg font-semibold mb-4">Network Activity</h3>
                <div className="flex items-center justify-center h-full text-white/20">
                    Chart Placeholder
                </div>
            </GlassCard>

            <GlassCard className="min-h-[300px]">
                <h3 className="text-lg font-semibold mb-4">Recent Alerts</h3>
                <div className="space-y-4">
                    <Alert msg="Screen Lobby-1 went offline" time="2m ago" />
                    <Alert msg="Playlist sync failed (Screen 3)" time="15m ago" />
                </div>
            </GlassCard>
        </div>
    )
}

const StatCard = ({ title, value, icon: Icon, color }) => (
    <GlassCard className="flex items-center justify-between">
        <div>
            <p className="text-white/50 text-sm">{title}</p>
            <h2 className="text-3xl font-bold mt-1">{value}</h2>
        </div>
        <div className={`p-3 rounded-full bg-white/5 border border-white/10 ${color}`}>
            <Icon size={24} />
        </div>
    </GlassCard>
)

const Alert = ({ msg, time }) => (
    <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
        <span className="text-sm font-medium">{msg}</span>
        <span className="text-xs text-white/30">{time}</span>
    </div>
)

export default DashboardView

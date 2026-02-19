import { useEffect, useState } from 'react'
import GlassCard from '../../components/ui/GlassCard'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { Activity, HardDrive, Wifi, ListVideo, Monitor, Clock, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
)

const DashboardView = () => {
    // --- State ---
    const [stats, setStats] = useState({
        activeScreens: 0,
        totalScreens: 0,
        screensPercent: 0,
        activePlaylists: 0,
        storageUsed: "0.0", // GB
        storagePercent: 0
    })

    // Recent Activity (Contextual Data)
    const [recentScreens, setRecentScreens] = useState([])
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    })

    // --- Effects ---
    useEffect(() => {
        fetchDashboardData()

        // Refresh every 30s
        const interval = setInterval(fetchDashboardData, 30000)
        return () => clearInterval(interval)
    }, [])

    const fetchDashboardData = async () => {
        try {
            // 1. Screens Data
            const { data: screens } = await supabase.from('screens').select('*')

            const total = screens?.length || 0
            const active = screens?.filter(s => s.status === 'online').length || 0
            const percent = total > 0 ? Math.round((active / total) * 100) : 0

            // Get recent screens
            const recent = [...(screens || [])]
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 3)
            setRecentScreens(recent)

            // 2. Playlists Data
            const { count: playlistCount } = await supabase
                .from('playlists')
                .select('*', { count: 'exact', head: true })

            // 3. Storage Data (Media Table)
            const { data: mediaFiles } = await supabase.from('media').select('size')
            const totalBytes = mediaFiles?.reduce((acc, curr) => acc + (curr.size || 0), 0) || 0
            const usedGb = (totalBytes / (1024 * 1024 * 1024)).toFixed(2)
            const storageLimit = 5 // GB Free Tier Assumption
            const storagePercent = Math.min(Math.round((usedGb / storageLimit) * 100), 100)

            setStats({
                activeScreens: active,
                totalScreens: total,
                screensPercent: percent,
                activePlaylists: playlistCount || 0,
                storageUsed: usedGb,
                storagePercent: storagePercent
            })

            // 4. Simulate Chart Data (Since we don't have historical metrics table yet)
            generateChartData(active)

        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        }
    }

    const generateChartData = (currentActive) => {
        // Create random history for demo feel
        const labels = []
        const dataPoints = []
        const now = new Date()

        for (let i = 6; i >= 0; i--) {
            const t = new Date(now.getTime() - (i * 1800000)) // 30 min intervals
            labels.push(t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
            // Random fluctuation around current active
            const val = Math.max(0, currentActive + Math.floor(Math.random() * 3) - 1)
            dataPoints.push(val)
        }

        setChartData({
            labels,
            datasets: [
                {
                    label: 'Telas Online',
                    data: dataPoints,
                    borderColor: '#4ade80',
                    backgroundColor: 'rgba(74, 222, 128, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }
            ]
        })
    }

    // Chart Options
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#ccc',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: 'rgba(255, 255, 255, 0.5)' }
            },
            x: {
                grid: { display: false },
                ticks: { color: 'rgba(255, 255, 255, 0.5)' }
            }
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Telas Ativas"
                    value={stats.activeScreens}
                    subValue={`${stats.screensPercent}% Online`}
                    icon={Wifi}
                    color="text-green-400"
                    barColor="bg-green-400"
                    percent={stats.screensPercent}
                />
                <StatCard
                    title="Armazenamento"
                    value={`${stats.storageUsed} GB`}
                    subValue={`${stats.storagePercent}% de 5GB`}
                    icon={HardDrive}
                    color="text-blue-400"
                    barColor="bg-blue-400"
                    percent={stats.storagePercent}
                />
                <StatCard
                    title="Playlists"
                    value={stats.activePlaylists}
                    subValue="Prontas para uso"
                    icon={ListVideo}
                    color="text-purple-400"
                    barColor="bg-purple-400"
                    percent={100}
                />
                <StatCard
                    title="Total Dispositivos"
                    value={stats.totalScreens}
                    subValue="Cadastrados"
                    icon={Monitor}
                    color="text-yellow-400"
                    barColor="bg-yellow-400"
                    percent={100}
                />
            </div>

            {/* Main Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <GlassCard className="lg:col-span-2 min-h-[350px] p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Activity className="text-blue-400" size={20} />
                                Atividade da Rede
                            </h3>
                            <p className="text-sm text-white/40">Monitoramento em tempo real (Mocked)</p>
                        </div>
                    </div>
                    <div className="h-[250px] w-full">
                        <Line options={options} data={chartData} />
                    </div>
                </GlassCard>

                {/* Recent Screens List */}
                <GlassCard className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">Recentes</h3>
                        <Users size={18} className="text-white/40" />
                    </div>
                    <div className="space-y-4">
                        {recentScreens.map(screen => (
                            <div key={screen.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${screen.status === 'online' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-red-400'}`} />
                                    <div>
                                        <p className="text-sm font-bold text-white">{screen.name}</p>
                                        <p className="text-xs text-white/40 font-mono">{screen.pairing_code}</p>
                                    </div>
                                </div>
                                <Clock size={14} className="text-white/20" />
                            </div>
                        ))}
                        {recentScreens.length === 0 && (
                            <p className="text-center text-white/30 text-sm py-4">Nenhuma tela recente.</p>
                        )}
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}

const StatCard = ({ title, value, subValue, icon: Icon, color, percent, barColor }) => (
    <GlassCard className="p-6 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
            <Icon size={48} />
        </div>
        <p className="text-sm font-medium text-white/50 uppercase tracking-wider">{title}</p>
        <div className="mt-2">
            <h2 className="text-3xl font-bold text-white">{value}</h2>
            <p className={`text-xs ${color} mt-1 font-medium opacity-80`}>
                {subValue}
            </p>
        </div>
        <div className="mt-4 w-full bg-white/10 h-1 rounded-full overflow-hidden">
            <div
                className={`h-full transition-all duration-1000 ${barColor}`}
                style={{ width: `${percent}%` }}
            />
        </div>
    </GlassCard>
)

export default DashboardView

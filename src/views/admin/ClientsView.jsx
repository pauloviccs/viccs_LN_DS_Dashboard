import { useState, useEffect } from 'react'
import GlassCard from '../../components/ui/GlassCard'
import { Users, Mail, Shield, Search } from 'lucide-react'
import GlassInput from '../../components/ui/GlassInput'
import { supabase } from '../../lib/supabase'

const ClientsView = () => {
    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        loadClients()
    }, [])

    const loadClients = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })

        if (!error) setClients(data)
        setLoading(false)
    }

    const filteredClients = clients.filter(c =>
        c.email?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Client Management</h2>
                <div className="w-64">
                    <GlassInput
                        icon={Search}
                        placeholder="Search clients..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="py-2 text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredClients.map(client => (
                    <GlassCard key={client.id} className="flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold">
                                    {client.email?.[0].toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold truncate max-w-[150px]">{client.email?.split('@')[0]}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded border ${client.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-white/5 text-white/50 border-white/10'}`}>
                                        {client.role}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-white/60">
                            <div className="flex items-center gap-2">
                                <Mail size={14} />
                                <span className="truncate">{client.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield size={14} />
                                <span>ID: {client.id.slice(0, 8)}...</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex gap-2">
                            <button className="flex-1 py-1.5 text-sm bg-white/5 hover:bg-white/10 rounded transition-colors text-white/70">
                                Details
                            </button>
                            {client.role !== 'admin' && (
                                <button className="flex-1 py-1.5 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors">
                                    Block
                                </button>
                            )}
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    )
}

export default ClientsView

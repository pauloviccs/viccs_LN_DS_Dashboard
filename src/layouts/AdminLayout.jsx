import { Outlet, useNavigate, NavLink, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut, LayoutDashboard, Monitor, Users, FolderOpen, Settings, ListVideo, Home } from 'lucide-react'
import FluidBackground from '../components/ui/FluidBackground'
import useStore from '../stores/useStore'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'

const AdminLayout = () => {
    const navigate = useNavigate()
    const { user, setUser, setRole } = useStore()
    const [profile, setProfile] = useState(null)

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return
            const { data } = await supabase
                .from('profiles')
                .select('username, avatar_url')
                .eq('id', user.id)
                .single()
            setProfile(data)
        }
        if (user) fetchProfile()
    }, [user])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setRole(null)
        // Clear remember me preference on manual logout
        localStorage.removeItem('lumia_remember_me')
        navigate('/login')
    }

    const getUserDisplayName = () => {
        if (profile?.username) return profile.username
        if (user?.email) return user.email.split('@')[0]
        return 'User'
    }

    const getUserAvatar = () => {
        return profile?.avatar_url || user?.user_metadata?.avatar_url || null
    }

    return (
        <div className="flex min-h-screen text-white overflow-hidden bg-black/90">
            <FluidBackground />

            {/* Sidebar Glass */}
            <motion.aside
                initial={{ x: -100 }}
                animate={{ x: 0 }}
                className="w-20 lg:w-64 glass border-r border-white/10 flex flex-col p-4 z-20 m-4 rounded-3xl"
            >
                <div className="flex items-center gap-3 p-2 mb-8">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-primary to-purple-500" />
                    <span className="font-bold text-xl hidden lg:block tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Lumia<span className="text-white/40 text-xs ml-1 font-normal">Admin</span>
                    </span>
                </div>

                <nav className="flex-1 space-y-2">
                    <NavItem icon={LayoutDashboard} label="Overview" to="/admin" />
                    <NavItem icon={FolderOpen} label="Media Library" to="/admin/media" />
                    <NavItem icon={ListVideo} label="Playlists" to="/admin/playlists" />
                    <NavItem icon={Monitor} label="Screens" to="/admin/screens" />
                    <NavItem icon={Users} label="Clients" to="/admin/clients" />
                    <NavItem icon={Settings} label="Settings" to="/admin/settings" />
                </nav>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-white/60 hover:text-red-400 transition-colors mt-auto"
                >
                    <LogOut size={20} />
                    <span className="hidden lg:block">Logout</span>
                </button>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 p-4 lg:p-8 overflow-y-auto relative z-10">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Painel de Controle</h1>
                        <p className="text-white/50">Gerencie toda a sua rede de sinalização digital</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-white/10 text-white/70 hover:text-white transition-all text-sm font-medium"
                            title="Back to Website"
                        >
                            <Home size={18} />
                            <span className="hidden md:inline">Home</span>
                        </Link>

                        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                            <div className="text-right hidden md:block">
                                <div className="text-sm font-bold text-white">{getUserDisplayName()}</div>
                                <div className="text-xs text-white/50">Administrator</div>
                            </div>
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center shadow-lg">
                                {getUserAvatar() ? (
                                    <img src={getUserAvatar()} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-sm font-bold text-white/60">
                                        {getUserDisplayName()[0].toUpperCase()}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <Outlet />
            </main>
        </div>
    )
}

const NavItem = ({ icon: Icon, label, to }) => (
    <NavLink
        to={to}
        end={to === '/admin'} // Only exact match for root stats
        className={({ isActive }) => `flex items-center gap-3 w-full p-3 rounded-xl transition-all ${isActive ? 'bg-white/10 text-white border border-white/20 shadow-lg backdrop-blur-md' : 'hover:bg-white/5 text-white/60 hover:text-white'}`}
    >
        <Icon size={20} />
        <span className="hidden lg:block font-medium">{label}</span>
    </NavLink>
)

export default AdminLayout

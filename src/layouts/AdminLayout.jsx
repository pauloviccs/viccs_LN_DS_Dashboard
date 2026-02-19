import { Outlet, useNavigate, NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut, LayoutDashboard, Monitor, Users, FolderOpen, Settings, ListVideo } from 'lucide-react'
import FluidBackground from '../components/ui/FluidBackground'
import useStore from '../stores/useStore'
import { supabase } from '../lib/supabase'

const AdminLayout = () => {
    const navigate = useNavigate()
    const { user, setUser, setRole } = useStore()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setRole(null)
        // Clear remember me preference on manual logout
        localStorage.removeItem('lumia_remember_me')
        navigate('/login')
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
                        <h1 className="text-3xl font-bold">Admin Console</h1>
                        <p className="text-white/50">Manage your entire signage network</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20" />
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

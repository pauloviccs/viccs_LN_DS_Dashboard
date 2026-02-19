import { Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut, LayoutDashboard, Monitor, User } from 'lucide-react'
import FluidBackground from '../components/ui/FluidBackground'
import GlassCard from '../components/ui/GlassCard'
import useStore from '../stores/useStore'
import { supabase } from '../lib/supabase'

const ClientLayout = () => {
    const navigate = useNavigate()
    const { user, setUser, setRole } = useStore()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setRole(null)
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
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500" />
                    <span className="font-bold text-xl hidden lg:block tracking-tight">Lumia</span>
                </div>

                <nav className="flex-1 space-y-2">
                    <NavItem icon={LayoutDashboard} label="Dashboard" to="/client" />
                    <NavItem icon={Monitor} label="My Screens" to="/client/screens" />
                    <NavItem icon={User} label="Profile" to="/client/profile" />
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
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="text-white/50">Welcome back, {user?.email?.split('@')[0]}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20" />
                </header>

                <Outlet />
            </main>
        </div>
    )
}

import { Link, useLocation } from 'react-router-dom'

const NavItem = ({ icon: Icon, label, to }) => {
    const location = useLocation()
    // For root path, exact match. For others, startsWith.
    const active = to === '/client'
        ? location.pathname === '/client'
        : location.pathname.startsWith(to)

    return (
        <Link
            to={to}
            className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${active ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'hover:bg-white/5 text-white/60 hover:text-white'}`}
        >
            <Icon size={20} />
            <span className="hidden lg:block">{label}</span>
        </Link>
    )
}

export default ClientLayout

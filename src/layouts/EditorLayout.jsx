import { Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut, LayoutDashboard, Film, List } from 'lucide-react'
import FluidBackground from '../components/ui/FluidBackground'
import useStore from '../stores/useStore'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const EditorLayout = () => {
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
        fetchProfile()
    }, [user])

    return (
        <div className="flex min-h-screen text-white overflow-hidden bg-[#0a0a0a]">
            <FluidBackground />

            {/* Top Navigation Bar for Editor (Horizontal) */}
            <div className="fixed top-0 left-0 right-0 h-16 glass z-30 border-b border-white/10 flex items-center justify-between px-6">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white">
                            E
                        </div>
                        <span className="font-bold text-xl tracking-tight">Lumia Editor</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-1">
                        <NavItem icon={LayoutDashboard} label="Overview" to="/editor" />
                        <NavItem icon={Film} label="Media" to="/editor/media" />
                        <NavItem icon={List} label="Playlists" to="/editor/playlists" />
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-white/10">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px]">
                                    {user?.email?.[0].toUpperCase()}
                                </div>
                            )}
                        </div>
                        <span className="text-sm font-medium text-white/80">{profile?.username || 'Editor'}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 hover:bg-red-500/20 text-white/50 hover:text-red-400 rounded-lg transition-colors"
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 pt-20 px-6 pb-6 overflow-y-auto relative z-10">
                <Outlet />
            </main>
        </div>
    )
}

const NavItem = ({ icon: Icon, label, to }) => {
    const location = useLocation()
    const active = to === '/editor'
        ? location.pathname === '/editor'
        : location.pathname.startsWith(to)

    return (
        <Link
            to={to}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${active ? 'bg-white/10 text-white border border-white/10' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
        >
            <Icon size={16} />
            <span>{label}</span>
        </Link>
    )
}

export default EditorLayout

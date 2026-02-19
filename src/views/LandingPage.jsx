import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import HeroSequence from '../components/landing/HeroSequence'
import FluidBackground from '../components/ui/FluidBackground'
import LiquidButton from '../components/ui/LiquidButton'
import GlassCard from '../components/ui/GlassCard'
import { Check, LogOut, LayoutDashboard, User } from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../hooks/useAuth'
import useStore from '../stores/useStore'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'

const Navbar = () => {
    const { user, role, loading } = useAuth()
    const { setUser, setRole } = useStore()
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
        localStorage.removeItem('lumia_remember_me')
        setProfile(null)
    }

    const getDashboardPath = () => {
        if (role === 'admin') return '/admin'
        if (role === 'editor') return '/editor'
        return '/client'
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
    <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 flex justify-between items-center px-8 py-4 rounded-2xl glass-navbar"
    >
        <div className="text-xl font-luxury font-bold text-white animate-pulse tracking-widest">
            LUMIA NETWORK
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-white/70">
            {['About Us', 'Features', 'Pricing'].map((item) => (
                <a
                    key={item}
                    href={`#${item.toLowerCase().replace(' ', '')}`}
                    className="hover:text-white transition-colors hover:scale-105 transform duration-200"
                >
                    {item}
                </a>
            ))}
        </div>
        <div className="flex gap-4 items-center">
            {loading ? (
                <div className="px-6 py-2 text-sm text-white/50 animate-pulse">Loading...</div>
            ) : user ? (
                <div className="flex items-center gap-3">
                    <Link to={getDashboardPath()}>
                        <LiquidButton className="px-4 py-2 text-sm flex items-center gap-2">
                            <LayoutDashboard size={16} />
                            Dashboard
                        </LiquidButton>
                    </Link>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass-panel border border-white/10">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                            {getUserAvatar() ? (
                                <img src={getUserAvatar()} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xs font-bold text-white/60">
                                    {getUserDisplayName()[0].toUpperCase()}
                                </span>
                            )}
                        </div>
                        <span className="text-sm text-white/80 font-medium hidden md:block">
                            {getUserDisplayName()}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                            title="Logout"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            ) : (
                <Link to="/login">
                    <LiquidButton className="px-6 py-2 text-sm">Login / Sign Up</LiquidButton>
                </Link>
            )}
        </div>
    </motion.nav>
    )
}

const Section = ({ id, title, children, className }) => (
    <section id={id} className={`min-h-screen py-24 px-8 flex flex-col justify-center ${className}`}>
        <div className="max-w-6xl mx-auto w-full">
            <div className="text-reveal-mask mb-12">
                <motion.h2
                    initial={{ y: "100%" }}
                    whileInView={{ y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // "Power4.out" feel
                    className="text-4xl md:text-6xl font-luxury font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 leading-tight"
                >
                    {title}
                </motion.h2>
            </div>
            {children}
        </div>
    </section>
)

const LandingPage = () => {
    return (
        <div className="bg-black min-h-screen text-white">
            <FluidBackground className="fixed inset-0 z-0 opacity-30" />
            <Navbar />

            {/* Scroll Controlled Hero */}
            <HeroSequence />

            <div className="relative z-10 bg-black/80 backdrop-blur-3xl">
                <Section id="about" title="Redefining Screens">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <p className="text-xl text-white/70 leading-relaxed">
                            Lumia - Digital Signage Solutions isn't just a CMS. It's an intelligent operating system for your physical spaces.
                            We've stripped away the complexity of digital signage and replaced it with a fluid,
                            intuitive experience that feels like magic.
                        </p>
                        <div className="aspect-video bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 group-hover:opacity-100 opacity-50 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center text-white/20 font-bold text-4xl">Lumia OS</div>
                        </div>
                    </div>
                </Section>

                <Section id="pricing" title="Simple Pricing">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: 'Starter', price: '$0', features: ['1 Screen', 'Basic Media', 'Community Support'] },
                            { name: 'Pro', price: '$29', features: ['10 Screens', '4K Video', 'Priority Support', 'Smart Playlists'], highlight: true },
                            { name: 'Enterprise', price: 'Custom', features: ['Unlimited Screens', 'SLA', 'API Access', 'White Label'] }
                        ].map((plan, i) => (
                            <GlassCard
                                key={plan.name}
                                className={clsx(
                                    "flex flex-col",
                                    plan.highlight && "border-blue-500/30 bg-blue-500/5 shadow-[0_0_50px_rgba(59,130,246,0.1)]"
                                )}
                                transition={{ delay: i * 0.1 }}
                            >
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <div className="text-4xl font-bold mb-6">{plan.price}<span className="text-sm font-normal text-white/40">/mo</span></div>
                                <ul className="space-y-4 mb-8 flex-grow">
                                    {plan.features.map(f => (
                                        <li key={f} className="flex gap-3 text-sm text-white/70">
                                            <Check size={16} className="text-blue-400" /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <LiquidButton className="w-full justify-center">Get Started</LiquidButton>
                            </GlassCard>
                        ))}
                    </div>
                </Section>

                <footer className="py-12 text-center text-white/20 text-sm border-t border-white/5">
                    © 2026 Lumia Digital Signage Solutions. All rights reserved.
                </footer>
            </div>
        </div>
    )
}

export default LandingPage

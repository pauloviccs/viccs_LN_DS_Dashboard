import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import GlassInput from '../../components/ui/GlassInput'
import LiquidButton from '../../components/ui/LiquidButton'
import FluidBackground from '../../components/ui/FluidBackground'
import useStore from '../../stores/useStore'
import { supabase } from '../../lib/supabase'

const LoginView = () => {
    const [isLogin, setIsLogin] = useState(true)
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { setUser, setRole } = useStore()

    const handleAuth = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (isLogin) {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
                // Role check will be handled by useAuth or subsequent query
            } else {
                const { data, error } = await supabase.auth.signUp({ email, password })
                if (error) throw error
                alert("Check your email for the confirmation link!")
            }
        } catch (error) {
            console.error("Auth error:", error)
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <FluidBackground />

            <GlassCard className="w-full max-w-md relative z-10 overflow-hidden">
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-white mb-2"
                    >
                        {isLogin ? 'Welcome Back' : 'Join Lumia'}
                    </motion.h1>
                    <p className="text-white/50 text-sm">
                        {isLogin ? 'Enter your credentials to access the workspace.' : 'Create your digital signage account today.'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleAuth} className="space-y-6">
                    <div className="space-y-4">
                        <GlassInput
                            icon={Mail}
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <GlassInput
                            icon={Lock}
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <LiquidButton
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                {isLogin ? 'Sign In' : 'Create Account'}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </LiquidButton>
                </form>

                {/* Footer Toggle */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-white/40 hover:text-white text-sm transition-colors"
                    >
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                </div>
            </GlassCard>
        </div>
    )
}

export default LoginView

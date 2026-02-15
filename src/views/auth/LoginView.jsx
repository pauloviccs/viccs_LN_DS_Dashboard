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

            let message = error.message
            if (message.includes("Invalid login credentials")) {
                message = "Invalid email or password. If you just signed up, please verify your email."
            } else if (message.includes("Email not confirmed")) {
                message = "Please confirm your email address before signing in."
            }

            alert(message)
        } finally {
            setLoading(false)
        }
    }

    const handleSocialLogin = async (provider) => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: `${window.location.origin}/admin` // Adjust based on role logic if needed
                }
            })
            if (error) throw error
        } catch (error) {
            console.error("Social auth error:", error)
            alert(error.message)
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

                <div className="mt-6 space-y-3">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-transparent px-2 text-white/40 glass-panel border-0">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleSocialLogin('google')}
                            className="flex items-center justify-center px-4 py-2 border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-white/80 text-sm gap-2 glass-panel"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Google
                        </button>
                        <button
                            onClick={() => handleSocialLogin('discord')}
                            className="flex items-center justify-center px-4 py-2 border border-white/10 rounded-xl hover:bg-[#5865F2]/20 hover:border-[#5865F2]/50 transition-colors text-white/80 text-sm gap-2 glass-panel"
                        >
                            <svg className="w-5 h-5 fill-[#5865F2]" viewBox="0 0 24 24">
                                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.7725-.6083 1.1588a18.0694 18.0694 0 00-6.2086 0 13.91 13.91 0 00-.616-1.1588.0771.0771 0 00-.0785-.0371 19.7363 19.7363 0 00-4.8852 1.5152.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.0991.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.5382-9.674-2.3168-13.6599a.0736.0736 0 00-.032-.0277zM9.919 15.6552c-1.328 0-2.4206-1.221-2.4206-2.7302 0-1.5092 1.0718-2.7302 2.4206-2.7302 1.3533 0 2.4418 1.221 2.4206 2.7302 0 1.5092-1.0667 2.7302-2.4206 2.7302zm5.7278 0c-1.328 0-2.4206-1.221-2.4206-2.7302 0-1.5092 1.0718-2.7302 2.4206-2.7302 1.3533 0 2.4418 1.221 2.4206 2.7302 0 1.5092-1.0667 2.7302-2.4206 2.7302z" />
                            </svg>
                            Discord
                        </button>
                    </div>
                </div>

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

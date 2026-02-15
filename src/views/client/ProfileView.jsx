import GlassCard from '../../components/ui/GlassCard'
import LiquidButton from '../../components/ui/LiquidButton'
import GlassInput from '../../components/ui/GlassInput'
import { User, Mail, Lock } from 'lucide-react'
import useStore from '../../stores/useStore'

const ProfileView = () => {
    const { user, role } = useStore()

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <GlassCard>
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-2xl font-bold">
                        {user?.email?.[0].toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{user?.email?.split('@')[0]}</h2>
                        <div className="flex gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded text-xs bg-white/10 border border-white/10 uppercase tracking-wide">
                                {role} Account
                            </span>
                            <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400 border border-green-500/20">
                                Active
                            </span>
                        </div>
                    </div>
                </div>

                <form className="space-y-4">
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-white/40 mb-2">Account Email</label>
                        <GlassInput icon={Mail} value={user?.email} disabled className="opacity-50" />
                    </div>

                    <div className="pt-4 border-t border-white/10">
                        <h3 className="text-lg font-bold mb-4">Change Password</h3>
                        <div className="space-y-4">
                            <GlassInput icon={Lock} type="password" placeholder="Current Password" />
                            <GlassInput icon={Lock} type="password" placeholder="New Password" />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <LiquidButton>Update Profile</LiquidButton>
                    </div>
                </form>
            </GlassCard>
        </div>
    )
}

export default ProfileView

import GlassCard from '../../components/ui/GlassCard'
import LiquidButton from '../../components/ui/LiquidButton'
import { Settings, Bell, Lock, Globe } from 'lucide-react'
import { useState } from 'react'
import ProfileSettingsModal from '../../components/admin/ProfileSettingsModal'

const SettingsView = () => {
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

    return (
        <div className="max-w-4xl space-y-8">
            <ProfileSettingsModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />

            <div>
                <h2 className="text-2xl font-bold mb-4">Configurações do Sistema</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SettingSection
                        icon={Globe}
                        title="General"
                        description="Platform name, domain settings, and SEO configuration."
                        onClick={() => setIsProfileModalOpen(true)}
                    />
                    <SettingSection icon={Lock} title="Security" description="Password policies, 2FA enforcement, and session timeouts." />
                    <SettingSection icon={Bell} title="Notifications" description="Email alerts, push notifications, and system logs." />
                    <SettingSection icon={Settings} title="Integrations" description="API keys, webhooks, and third-party services." />
                </div>
            </div>
        </div>
    )
}

const SettingSection = ({ icon: Icon, title, description, onClick }) => (
    <GlassCard
        className="p-6 cursor-pointer hover:bg-white/10 transition-colors group"
        onClick={onClick}
    >
        <div className="flex items-start gap-4">
            <div className="p-3 bg-white/5 rounded-xl group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                <Icon size={24} />
            </div>
            <div>
                <h4 className="font-bold text-lg mb-1">{title}</h4>
                <p className="text-sm text-white/50">{description}</p>
            </div>
        </div>
    </GlassCard>
)

export default SettingsView

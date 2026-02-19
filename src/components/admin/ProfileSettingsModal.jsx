import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Eye, EyeOff, Copy, Check, Save, Loader2, User, Lock, Fingerprint } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import useStore from '../../stores/useStore'
import GlassCard from '../ui/GlassCard'
import LiquidButton from '../ui/LiquidButton'
import clsx from 'clsx'

const ProfileSettingsModal = ({ isOpen, onClose }) => {
    const { user, setUser } = useStore()
    const [activeTab, setActiveTab] = useState('profile')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState(null)

    // Profile State
    const [username, setUsername] = useState('')
    const [avatarUrl, setAvatarUrl] = useState(null)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef(null)

    // Security State
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    // Advanced State
    const [showUuid, setShowUuid] = useState(false)
    const [copiedUuid, setCopiedUuid] = useState(false)

    useEffect(() => {
        if (isOpen && user) {
            fetchProfile()
        }
    }, [isOpen, user])

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('username, avatar_url')
                .eq('id', user.id)
                .single()

            if (error && error.code !== 'PGRST116') throw error

            if (data) {
                setUsername(data.username || '')
                setAvatarUrl(data.avatar_url)
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
        }
    }

    const handleAvatarUpload = async (event) => {
        try {
            setUploading(true)
            const file = event.target.files[0]
            if (!file) return

            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}-${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            // Update Profile
            const { error: updateError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    avatar_url: publicUrl,
                    updated_at: new Date()
                })

            if (updateError) throw updateError

            setAvatarUrl(publicUrl)
            showMessage('Avatar updated successfully', 'success')

            // Refresh user metadata in store if needed
            setUser({ ...user, user_metadata: { ...user.user_metadata, avatar_url: publicUrl } })

        } catch (error) {
            showMessage(error.message, 'error')
        } finally {
            setUploading(false)
        }
    }

    const handleUpdateProfile = async () => {
        try {
            setLoading(true)
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    username,
                    updated_at: new Date()
                })

            if (error) throw error
            showMessage('Profile updated successfully', 'success')
        } catch (error) {
            showMessage(error.message, 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdatePassword = async () => {
        if (password !== confirmPassword) {
            showMessage("Passwords don't match", 'error')
            return
        }
        if (password.length < 6) {
            showMessage("Password must be at least 6 characters", 'error')
            return
        }

        try {
            setLoading(true)
            const { error } = await supabase.auth.updateUser({ password })
            if (error) throw error
            showMessage('Password updated successfully', 'success')
            setPassword('')
            setConfirmPassword('')
        } catch (error) {
            showMessage(error.message, 'error')
        } finally {
            setLoading(false)
        }
    }

    const copyUuid = () => {
        navigator.clipboard.writeText(user?.id)
        setCopiedUuid(true)
        setTimeout(() => setCopiedUuid(false), 2000)
    }

    const showMessage = (msg, type = 'success') => {
        setMessage({ text: msg, type })
        setTimeout(() => setMessage(null), 3000)
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative w-full max-w-2xl bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gray-900/50">
                            <div>
                                <h2 className="text-xl font-bold text-white">General Settings</h2>
                                <p className="text-sm text-white/50">Manage your account and profile</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <X size={20} className="text-white/70" />
                            </button>
                        </div>

                        <div className="flex flex-1 overflow-hidden">
                            {/* Sidebar Tabs */}
                            <div className="w-48 bg-black/20 border-r border-white/5 p-4 space-y-2 hidden md:block">
                                <TabButton
                                    active={activeTab === 'profile'}
                                    onClick={() => setActiveTab('profile')}
                                    icon={User}
                                    label="Profile"
                                />
                                <TabButton
                                    active={activeTab === 'security'}
                                    onClick={() => setActiveTab('security')}
                                    icon={Lock}
                                    label="Security"
                                />
                                <TabButton
                                    active={activeTab === 'advanced'}
                                    onClick={() => setActiveTab('advanced')}
                                    icon={Fingerprint}
                                    label="Advanced"
                                />
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-6 overflow-y-auto">
                                {message && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={clsx(
                                            "p-3 rounded-lg mb-6 text-sm flex items-center gap-2",
                                            message.type === 'success' ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                                        )}
                                    >
                                        {message.type === 'success' ? <Check size={16} /> : <X size={16} />}
                                        {message.text}
                                    </motion.div>
                                )}

                                {activeTab === 'profile' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="flex items-center gap-6">
                                            <div className="relative group">
                                                <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                                                    {avatarUrl ? (
                                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={40} className="text-white/20" />
                                                    )}
                                                    {uploading && (
                                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                            <Loader2 className="animate-spin text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
                                                >
                                                    <Upload size={14} className="text-white" />
                                                </button>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleAvatarUpload}
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">Profile Picture</h3>
                                                <p className="text-sm text-white/50">Upload a new avatar (max 2MB)</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-white/70">Username</label>
                                                <input
                                                    type="text"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-colors text-white"
                                                    placeholder="Enter user name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-white/70">Email</label>
                                                <input
                                                    type="email"
                                                    value={user?.email || ''}
                                                    disabled
                                                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white/50 cursor-not-allowed"
                                                />
                                                <p className="text-xs text-white/30">Email cannot be changed directly.</p>
                                            </div>
                                            <div className="pt-4">
                                                <LiquidButton onClick={handleUpdateProfile} disabled={loading} className="px-6">
                                                    {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                                                    Save Changes
                                                </LiquidButton>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="space-y-4">
                                            <h3 className="font-bold text-lg">Change Password</h3>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-white/70">New Password</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-blue-500/50 transition-colors text-white"
                                                        placeholder="••••••••"
                                                    />
                                                    <button
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                                                    >
                                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-white/70">Confirm Password</label>
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-colors text-white"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                            <div className="pt-4">
                                                <LiquidButton onClick={handleUpdatePassword} disabled={loading} className="px-6">
                                                    {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                                                    Update Password
                                                </LiquidButton>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'advanced' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="space-y-4">
                                            <h3 className="font-bold text-lg">System Identification</h3>
                                            <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                                                <p className="text-sm text-yellow-200/80 mb-4">
                                                    This is your unique User ID (UUID). It is used for system logging and support requests.
                                                    Do not share this unless requested by support.
                                                </p>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 font-mono text-sm text-white/80 relative overflow-hidden group">
                                                        <span className={clsx(showUuid ? "" : "blur-sm select-none transition-all duration-300")}>
                                                            {user?.id}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => setShowUuid(!showUuid)}
                                                        className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                                                        title={showUuid ? "Hide UUID" : "Show UUID"}
                                                    >
                                                        {showUuid ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                    <button
                                                        onClick={copyUuid}
                                                        className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                                                        title="Copy UUID"
                                                    >
                                                        {copiedUuid ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

const TabButton = ({ active, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className={clsx(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium",
            active
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "text-white/60 hover:bg-white/5 hover:text-white"
        )}
    >
        <Icon size={18} />
        {label}
    </button>
)

export default ProfileSettingsModal

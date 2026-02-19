import { useState, useRef, useCallback } from 'react'
import GlassCard from '../../components/ui/GlassCard'
import LiquidButton from '../../components/ui/LiquidButton'
import GlassInput from '../../components/ui/GlassInput'
import { User, Mail, Lock, Camera, Eye, EyeOff, Copy, Check, Phone } from 'lucide-react'
import useStore from '../../stores/useStore'
import { supabase } from '../../lib/supabase'
import Cropper from 'react-easy-crop'
import { getCroppedImg } from '../../lib/cropImage'
import { AnimatePresence, motion } from 'framer-motion'

const ProfileView = () => {
    const { user, role, setUser } = useStore()
    const [loading, setLoading] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || null)

    // UUID Visibility
    const [showUuid, setShowUuid] = useState(false)
    const [copied, setCopied] = useState(false)

    // Form Stats
    const [phone, setPhone] = useState(user?.user_metadata?.phone || '')
    const [passwordData, setPasswordData] = useState({ current: '', new: '' })

    // Cropper State
    const [imageSrc, setImageSrc] = useState(null)
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
    const fileInputRef = useRef(null)

    // --- UUID Logic ---
    const handleCopyUuid = () => {
        navigator.clipboard.writeText(user?.id)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // --- Avatar Logic ---
    const onFileChange = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            const reader = new FileReader()
            reader.addEventListener('load', () => setImageSrc(reader.result))
            reader.readAsDataURL(file)
        }
    }

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleSaveAvatar = async () => {
        if (!imageSrc || !croppedAreaPixels) return

        try {
            setLoading(true)
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
            const fileName = `${user.id}/${Date.now()}.jpg`

            // Upload 300x300 Blob
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, croppedImageBlob, { upsert: true })

            if (uploadError) throw uploadError

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName)

            // Update Profile
            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            })

            if (updateError) throw updateError

            // Sync with local store/DB trigger
            await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id)

            setAvatarUrl(publicUrl)
            setImageSrc(null) // Close Modal
            alert('Avatar updated successfully!')
        } catch (error) {
            console.error(error)
            alert('Error updating avatar: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    // --- Profile Update Logic ---
    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Update Phone in Profiles Table
            if (phone !== user?.user_metadata?.phone) {
                const { error } = await supabase
                    .from('profiles')
                    .update({ phone: phone })
                    .eq('id', user.id)

                if (error) throw error

                // Also update auth metadata for sync
                await supabase.auth.updateUser({ data: { phone } })
            }

            // Change Password
            if (passwordData.new) {
                if (!passwordData.current) return alert('Current password required to set a new one.')

                // Re-auth to verify current password (mock check or real signIn)
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: user.email,
                    password: passwordData.current
                })

                if (signInError) throw new Error('Incorrect current password')

                const { error: pwdError } = await supabase.auth.updateUser({
                    password: passwordData.new
                })

                if (pwdError) throw pwdError
                alert('Password changed successfully!')
            }

            alert('Profile updated!')
        } catch (error) {
            alert('Error: ' + error.message)
        } finally {
            setLoading(false)
            setPasswordData({ current: '', new: '' })
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <GlassCard className="p-8">
                {/* Header / Avatar */}
                <div className="flex flex-col md:flex-row items-center gap-8 mb-10 border-b border-white/5 pb-8">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/5 bg-gradient-to-tr from-blue-500/20 to-purple-500/20">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white/20">
                                    {user?.email?.[0].toUpperCase()}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full cursor-pointer"
                        >
                            <Camera className="text-white w-8 h-8" />
                        </button>
                        <input
                            type="file"
                            hidden
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={onFileChange}
                        />
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <h2 className="text-3xl font-bold text-white mb-2">{user?.email?.split('@')[0]}</h2>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-lumen-accent/20 text-lumen-accent border border-lumen-accent/20 pointer-events-none">
                                {role} Account
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20 pointer-events-none">
                                Active Status
                            </span>
                        </div>

                        {/* UUID Section */}
                        <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3 w-full md:w-fit">
                            <span className="text-xs font-bold text-white/30 uppercase tracking-wider pl-1">UUID</span>
                            <div className="h-4 w-[1px] bg-white/10" />
                            <code className={`font-mono text-sm text-white/60 transition-all ${showUuid ? '' : 'blur-[6px] select-none'}`}>
                                {user?.id}
                            </code>
                            <div className="flex gap-1 ml-2">
                                <button onClick={() => setShowUuid(!showUuid)} className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors">
                                    {showUuid ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                                <button onClick={handleCopyUuid} className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors relative">
                                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleUpdateProfile} className="space-y-8">
                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <User className="text-lumen-accent" size={20} />
                            Contact Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <GlassInput
                                label="Email Address"
                                icon={Mail}
                                value={user?.email}
                                disabled
                                className="opacity-50 cursor-not-allowed"
                            />
                            <GlassInput
                                label="WhatsApp / Phone"
                                icon={Phone}
                                placeholder="+55 (11) 99999-9999"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Security */}
                    <div className="pt-6 border-t border-white/5">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Lock className="text-lumen-accent" size={20} />
                            Security Settings
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <GlassInput
                                icon={Lock}
                                type="password"
                                placeholder="Current Password"
                                value={passwordData.current}
                                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                            />
                            <GlassInput
                                icon={Lock}
                                type="password"
                                placeholder="New Password"
                                value={passwordData.new}
                                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                            />
                        </div>
                        <p className="text-xs text-white/30 mt-2 ml-1">
                            * Enter current password is required to set a new one.
                        </p>
                    </div>

                    <div className="flex justify-end pt-4">
                        <LiquidButton className="px-8" disabled={loading}>
                            {loading ? 'Saving...' : 'Update Profile'}
                        </LiquidButton>
                    </div>
                </form>
            </GlassCard>

            {/* Cropper Modal */}
            <AnimatePresence>
                {imageSrc && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
                    >
                        <div className="w-full max-w-lg bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
                            <div className="h-[400px] relative bg-black">
                                <Cropper
                                    image={imageSrc}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={setZoom}
                                    cropShape="round"
                                    showGrid={false}
                                />
                            </div>
                            <div className="p-6 bg-[#1a1a1a]">
                                <div className="mb-6">
                                    <label className="text-xs uppercase font-bold text-white/40 tracking-wider mb-2 block">Zoom</label>
                                    <input
                                        type="range"
                                        value={zoom}
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        aria-labelledby="Zoom"
                                        onChange={(e) => setZoom(e.target.value)}
                                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-lumen-accent"
                                    />
                                </div>
                                <div className="flex justify-between gap-4">
                                    <button
                                        onClick={() => setImageSrc(null)}
                                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveAvatar}
                                        className="flex-1 py-3 bg-lumen-accent hover:bg-lumen-accent/90 text-white rounded-xl font-bold shadow-lg shadow-lumen-accent/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading ? <span className="animate-spin">⏳</span> : <Check size={18} />}
                                        Save Avatar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ProfileView

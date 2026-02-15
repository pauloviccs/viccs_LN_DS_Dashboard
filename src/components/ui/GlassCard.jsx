import { motion } from 'framer-motion'
import clsx from 'clsx'

const GlassCard = ({ children, className, hoverEffect = true, ...props }) => {
    return (
        <motion.div
            className={clsx(
                "glass-panel rounded-3xl p-8 relative overflow-hidden",
                hoverEffect && "cursor-pointer",
                className
            )}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={hoverEffect ? {
                y: -5,
                scale: 1.02,
                boxShadow: "0 20px 40px rgba(0,0,0,0.4), inset 0 0 40px rgba(255,255,255,0.1)"
            } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            {...props}
        >
            {/* Ambient Gradient Blob */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    )
}

export default GlassCard

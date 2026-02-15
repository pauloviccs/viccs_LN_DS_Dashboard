import { motion } from "framer-motion";
import clsx from "clsx";

const GlassCard = ({ children, className, hoverEffect = true, ...props }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={hoverEffect ? { scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.08)" } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={clsx(
                "glass rounded-2xl p-6 backdrop-blur-xl border border-white/10 shadow-xl",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;

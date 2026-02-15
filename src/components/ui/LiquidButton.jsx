import { motion } from "framer-motion";
import clsx from "clsx";

const LiquidButton = ({ children, onClick, className, variant = "primary", ...props }) => {
    const variants = {
        primary: "bg-blue-600/80 hover:bg-blue-500/90 text-white",
        secondary: "bg-white/10 hover:bg-white/20 text-white border border-white/10",
        danger: "bg-red-500/80 hover:bg-red-400/90 text-white",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            onClick={onClick}
            className={clsx(
                "px-6 py-3 rounded-xl font-semibold backdrop-blur-md shadow-lg transition-colors flex items-center justify-center gap-2",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default LiquidButton;

import clsx from "clsx";

const GlassInput = ({ icon: Icon, className, ...props }) => {
    return (
        <div className="relative group">
            {Icon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-blue-400 transition-colors">
                    <Icon size={20} />
                </div>
            )}
            <input
                className={clsx(
                    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none text-white placeholder:text-white/30 focus:border-blue-500/50 focus:bg-white/10 transition-all",
                    Icon && "pl-12",
                    className
                )}
                {...props}
            />
        </div>
    );
};

export default GlassInput;

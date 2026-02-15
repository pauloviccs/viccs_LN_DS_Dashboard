import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import HeroSequence from '../components/landing/HeroSequence'
import FluidBackground from '../components/ui/FluidBackground'
import LiquidButton from '../components/ui/LiquidButton'
import { ArrowRight, Check } from 'lucide-react'

const Navbar = () => (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-6 backdrop-blur-md bg-black/10 border-b border-white/5">
        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Lumia
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-white/70">
            <a href="#about" className="hover:text-white transition-colors">About Us</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>
        <div className="flex gap-4">
            <Link to="/login">
                <LiquidButton className="px-6 py-2 text-sm">Login / Sign Up</LiquidButton>
            </Link>
        </div>
    </nav>
)

const Section = ({ id, title, children, className }) => (
    <section id={id} className={`min-h-screen py-24 px-8 flex flex-col justify-center ${className}`}>
        <div className="max-w-6xl mx-auto w-full">
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-bold mb-12 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40"
            >
                {title}
            </motion.h2>
            {children}
        </div>
    </section>
)

const LandingPage = () => {
    return (
        <div className="bg-black min-h-screen text-white overflow-x-hidden">
            <FluidBackground className="fixed inset-0 z-0 opacity-30" />
            <Navbar />

            {/* Scroll Controlled Hero */}
            <HeroSequence />

            <div className="relative z-10 bg-black/80 backdrop-blur-3xl">
                <Section id="about" title="Redefining Screens">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <p className="text-xl text-white/70 leading-relaxed">
                            Lumia isn't just a CMS. It's an intelligent operating system for your physical spaces.
                            We've stripped away the complexity of digital signage and replaced it with a fluid,
                            intuitive experience that feels like magic.
                        </p>
                        <div className="aspect-video bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 group-hover:opacity-100 opacity-50 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center text-white/20 font-bold text-4xl">Lumia OS</div>
                        </div>
                    </div>
                </Section>

                <Section id="pricing" title="Simple Pricing">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: 'Starter', price: '$0', features: ['1 Screen', 'Basic Media', 'Community Support'] },
                            { name: 'Pro', price: '$29', features: ['10 Screens', '4K Video', 'Priority Support', 'Smart Playlists'] },
                            { name: 'Enterprise', price: 'Custom', features: ['Unlimited Screens', 'SLA', 'API Access', 'White Label'] }
                        ].map((plan, i) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors relative overflow-hidden"
                            >
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <div className="text-4xl font-bold mb-6">{plan.price}<span className="text-sm font-normal text-white/40">/mo</span></div>
                                <ul className="space-y-4 mb-8">
                                    {plan.features.map(f => (
                                        <li key={f} className="flex gap-3 text-sm text-white/70">
                                            <Check size={16} className="text-blue-400" /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <LiquidButton className="w-full justify-center">Get Started</LiquidButton>
                            </motion.div>
                        ))}
                    </div>
                </Section>

                <footer className="py-12 text-center text-white/20 text-sm border-t border-white/5">
                    © 2026 Lumia Digital Signage. All rights reserved.
                </footer>
            </div>
        </div>
    )
}

export default LandingPage

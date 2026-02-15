import { useRef, useEffect, useState } from 'react'
import { useScroll, useTransform, motion, useSpring } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const frameCount = 80
const images = []

// Preload images path
for (let i = 0; i < frameCount; i++) {
    const src = `/hero/heroanimation/horizontal/0_${i.toString().padStart(3, '0')}.jpg`
    images.push(src)
}

const HeroSequence = () => {
    const containerRef = useRef(null)
    const canvasRef = useRef(null)
    const [imagesLoaded, setImagesLoaded] = useState(false)
    const [loadProgress, setLoadProgress] = useState(0)
    const imageObjects = useRef([])

    // Scroll Progress: 0 to 1 across the 400vh container
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    })

    // Smooth scroll for animation to prevent jitter
    const smoothProgress = useSpring(scrollYProgress, { mass: 0.1, stiffness: 100, damping: 20 })

    // Map scroll to frame index
    const frameIndex = useTransform(smoothProgress, [0, 1], [0, frameCount - 1])

    // Text Effects - "Fly through"
    // Text appears at start, stays until 20%, then flies 'into' camera by 50%
    const textScale = useTransform(smoothProgress, [0, 0.4, 0.6], [1, 1, 10])
    const textOpacity = useTransform(smoothProgress, [0, 0.4, 0.5], [1, 1, 0])
    const textBlur = useTransform(smoothProgress, [0.4, 0.6], [0, 20])
    const blurFilter = useTransform(textBlur, (v) => `blur(${v}px)`)

    // Scroll Indicator Opacity - Moved to top level to avoid conditional hook call
    const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0])

    useEffect(() => {
        let loadedCount = 0
        const totalImages = images.length

        const loadImages = async () => {
            const promises = images.map((src) => {
                return new Promise((resolve, reject) => {
                    const img = new Image()
                    img.src = src
                    img.onload = () => {
                        loadedCount++
                        setLoadProgress(Math.round((loadedCount / totalImages) * 100))
                        resolve(img)
                    }
                    img.onerror = (e) => {
                        console.error("Failed to load image", src, e)
                        // Resolve anyway to avoid breaking the Promise.all
                        resolve(null)
                    }
                })
            })

            try {
                imageObjects.current = await Promise.all(promises)
                setImagesLoaded(true)
            } catch (err) {
                console.error("Failed to load frames sequence", err)
            }
        }

        loadImages()
    }, [])

    useEffect(() => {
        if (!imagesLoaded || !canvasRef.current) return

        const canvas = canvasRef.current
        const context = canvas.getContext('2d', { alpha: false }) // Optimize for no alpha

        const render = (index) => {
            const img = imageObjects.current[Math.round(index)]
            if (img) {
                const hRatio = canvas.width / img.width
                const vRatio = canvas.height / img.height
                const ratio = Math.max(hRatio, vRatio)
                const centerShift_x = (canvas.width - img.width * ratio) / 2
                const centerShift_y = (canvas.height - img.height * ratio) / 2

                context.clearRect(0, 0, canvas.width, canvas.height)
                context.drawImage(img, 0, 0, img.width, img.height,
                    centerShift_x, centerShift_y, img.width * ratio, img.height * ratio)
            }
        }

        const unsubscribe = frameIndex.on("change", (latest) => {
            requestAnimationFrame(() => render(latest))
        })

        // Initial render
        render(0)

        const handleResize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            render(frameIndex.get())
        }
        window.addEventListener('resize', handleResize)
        handleResize()

        return () => {
            unsubscribe()
            window.removeEventListener('resize', handleResize)
        }
    }, [imagesLoaded, frameIndex])

    return (
        <div ref={containerRef} className="h-[300vh] relative">
            {/* Loading Overlay */}
            {!imagesLoaded && (
                <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
                    <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
                        Lumia Network
                    </div>
                    <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-300 ease-out"
                            style={{ width: `${loadProgress}%` }}
                        />
                    </div>
                    <p className="text-white/30 text-xs mt-2 font-mono">Loading Experience... {loadProgress}%</p>
                </div>
            )}

            <div className="sticky top-0 h-screen w-full overflow-hidden">
                <canvas ref={canvasRef} className="w-full h-full object-cover block" />

                {/* Overlay Content with "Jesko Jets" style Fly-Through effect */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none perspective-[1000px]">
                    <motion.div
                        className="text-center origin-center will-change-transform"
                        style={{
                            scale: textScale,
                            opacity: textOpacity,
                            filter: blurFilter,
                            visibility: imagesLoaded ? 'visible' : 'hidden'
                        }}
                    >
                        <h1 className="text-6xl md:text-9xl font-bold text-white mb-4 tracking-tighter leading-none">
                            Lumia
                        </h1>
                        <p className="text-xl md:text-3xl text-white/80 font-light tracking-widest uppercase">
                            Digital Signage Solutions
                        </p>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                {imagesLoaded && (
                    <motion.div
                        style={{ opacity: scrollIndicatorOpacity }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                    >
                        <span className="text-white/50 text-sm uppercase tracking-widest text-[10px]">Scroll to explore</span>
                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <ChevronDown className="text-white/50 w-6 h-6" />
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default HeroSequence

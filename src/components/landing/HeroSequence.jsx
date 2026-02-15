import { useEffect, useRef, useState } from 'react'
import { useScroll, useTransform, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const FRAME_COUNT = 80
const IMAGES_BASE_PATH = '/hero/heroanimation/horizontal/0_'

const HeroSequence = () => {
    const containerRef = useRef(null)
    const canvasRef = useRef(null)
    const [images, setImages] = useState([])
    const [loaded, setLoaded] = useState(false)
    const [loadProgress, setLoadProgress] = useState(0)

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    })

    const frameIndex = useTransform(scrollYProgress, [0, 1], [0, FRAME_COUNT - 1])
    const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
    const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -50])
    const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0])

    useEffect(() => {
        const loadedImages = new Array(FRAME_COUNT)
        let loadedCount = 0

        // Load first frame immediately
        const firstImg = new Image()
        firstImg.src = `${IMAGES_BASE_PATH}000.jpg`
        firstImg.onload = () => {
            loadedImages[0] = firstImg
            setImages([...loadedImages])
        }

        // Load remaining frames
        for (let i = 0; i < FRAME_COUNT; i++) {
            const paddedIndex = i.toString().padStart(3, '0')
            const img = new Image()
            img.src = `${IMAGES_BASE_PATH}${paddedIndex}.jpg`

            img.onload = () => {
                loadedImages[i] = img
                loadedCount++
                setLoadProgress(Math.round((loadedCount / FRAME_COUNT) * 100))

                if (loadedCount === FRAME_COUNT) {
                    setImages([...loadedImages])
                    setLoaded(true)
                }
            }
            img.onerror = () => {
                console.warn(`Failed to load frame ${i}`)
                loadedCount++
                if (loadedCount === FRAME_COUNT) {
                    setImages([...loadedImages])
                    setLoaded(true)
                }
            }
        }
    }, [])

    useEffect(() => {
        if (!canvasRef.current || images.length === 0) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d', { alpha: false })
        if (!ctx) return

        const render = (index) => {
            // Fallback to first frame if current not fully loaded yet, or specific frame
            const img = images[Math.round(index)] || images[0]
            if (!img) return

            const canvasRatio = canvas.width / canvas.height
            const imgRatio = img.width / img.height

            let drawWidth, drawHeight, offsetX, offsetY

            if (imgRatio > canvasRatio) {
                drawHeight = canvas.height
                drawWidth = img.width * (canvas.height / img.height)
                offsetX = (canvas.width - drawWidth) / 2
                offsetY = 0
            } else {
                drawWidth = canvas.width
                drawHeight = img.height * (canvas.width / img.width)
                offsetX = 0
                offsetY = (canvas.height - drawHeight) / 2
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
        }

        const unsubscribe = frameIndex.on("change", (latest) => {
            requestAnimationFrame(() => render(latest))
        })

        const handleResize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            render(frameIndex.get())
        }

        window.addEventListener('resize', handleResize)
        handleResize()

        // Initial render try
        render(frameIndex.get())

        return () => {
            unsubscribe()
            window.removeEventListener('resize', handleResize)
        }
    }, [loaded, images, frameIndex])

    return (
        <section ref={containerRef} className="h-[300vh] relative">
            <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">

                {/* Canvas Background */}
                <div className="absolute inset-0 z-0">
                    {!loaded && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10 gap-4">
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
                    <canvas ref={canvasRef} className="block w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40" />
                </div>

                {/* Content Overlay */}
                <motion.div
                    style={{ opacity: contentOpacity, y: contentY }}
                    className="relative z-10 h-full flex flex-col items-center justify-center pointer-events-none"
                >
                    <div className="text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-6xl md:text-9xl font-bold text-white mb-4 tracking-tighter leading-none"
                        >
                            Lumia
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-xl md:text-3xl text-white/80 font-light tracking-widest uppercase"
                        >
                            Digital Signage Solutions
                        </motion.p>
                    </div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    style={{ opacity: scrollIndicatorOpacity }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
                >
                    <span className="text-white/50 text-sm uppercase tracking-widest text-[10px]">Scroll to explore</span>
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <ChevronDown className="text-white/50 w-6 h-6" />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}

export default HeroSequence

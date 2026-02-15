import { useRef, useEffect, useState } from 'react'
import { useScroll, useTransform, motion } from 'framer-motion'

const frameCount = 80
const images = []

// Preload images
for (let i = 0; i < frameCount; i++) {
    const src = `/hero/heroanimation/horizontal/0_${i.toString().padStart(3, '0')}.jpg`
    images.push(src)
}

const HeroSequence = () => {
    const containerRef = useRef(null)
    const canvasRef = useRef(null)
    const [imagesLoaded, setImagesLoaded] = useState(false)
    const imageObjects = useRef([])

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    })

    // Map scroll progress (0 to 1) to frame index (0 to 79)
    const frameIndex = useTransform(scrollYProgress, [0, 1], [0, frameCount - 1])

    useEffect(() => {
        let loadedCount = 0

        // Load all images for performance
        const loadImages = async () => {
            const promises = images.map((src) => {
                return new Promise((resolve, reject) => {
                    const img = new Image()
                    img.src = src
                    img.onload = () => resolve(img)
                    img.onerror = reject
                })
            })

            try {
                imageObjects.current = await Promise.all(promises)
                setImagesLoaded(true)
            } catch (err) {
                console.error("Failed to load frames", err)
            }
        }

        loadImages()
    }, [])

    useEffect(() => {
        if (!imagesLoaded || !canvasRef.current) return

        const canvas = canvasRef.current
        const context = canvas.getContext('2d')

        // Render function
        const render = (index) => {
            const img = imageObjects.current[Math.round(index)]
            if (img) {
                // Draw image "cover" style
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

        // Subscribe to scroll changes to re-render canvas
        const unsubscribe = frameIndex.on("change", (latest) => {
            requestAnimationFrame(() => render(latest))
        })

        // Initial render
        render(0)

        // Resize handler
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
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                <canvas ref={canvasRef} className="w-full h-full object-cover block" />

                {/* Overlay Content */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                    >
                        <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 tracking-tighter">
                            Lumia
                        </h1>
                        <p className="text-xl md:text-2xl text-white/80 font-light">
                            The Future of Digital Signage
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default HeroSequence

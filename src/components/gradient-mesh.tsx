'use client'

import { useEffect, useRef } from 'react'

export function GradientMesh() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        resizeCanvas()
        window.addEventListener('resize', resizeCanvas)

        // Gradient orbs
        const orbs = [
            { x: 0.2, y: 0.3, size: 600, color: '#667eea', speed: 0.001 },
            { x: 0.8, y: 0.7, size: 500, color: '#764ba2', speed: 0.0015 },
            { x: 0.5, y: 0.5, size: 700, color: '#f093fb', speed: 0.0008 },
            { x: 0.7, y: 0.2, size: 550, color: '#4facfe', speed: 0.0012 },
        ]

        let animationId: number
        let time = 0

        const animate = () => {
            time += 1

            // Clear with dark gradient base
            const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
            bgGradient.addColorStop(0, '#0f172a')
            bgGradient.addColorStop(0.3, '#1e1b4b')
            bgGradient.addColorStop(0.6, '#312e81')
            bgGradient.addColorStop(1, '#1e293b')
            ctx.fillStyle = bgGradient
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Draw animated orbs
            orbs.forEach((orb, i) => {
                const x = canvas.width * orb.x + Math.sin(time * orb.speed + i) * 100
                const y = canvas.height * orb.y + Math.cos(time * orb.speed + i) * 100

                const gradient = ctx.createRadialGradient(x, y, 0, x, y, orb.size)
                gradient.addColorStop(0, orb.color + '40')
                gradient.addColorStop(0.5, orb.color + '20')
                gradient.addColorStop(1, orb.color + '00')

                ctx.fillStyle = gradient
                ctx.fillRect(0, 0, canvas.width, canvas.height)
            })

            animationId = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            window.removeEventListener('resize', resizeCanvas)
            cancelAnimationFrame(animationId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10 opacity-40"
            style={{ pointerEvents: 'none' }}
        />
    )
}

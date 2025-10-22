"use client"

import { useCallback, useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
  type: "dot" | "line" | "triangle"
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })

  const createParticle = useCallback((width: number, height: number): Particle => {
    const colors = ["rgba(59, 130, 246, 0.6)", "rgba(34, 211, 238, 0.6)", "rgba(147, 197, 253, 0.4)"]
    const types: ("dot" | "line" | "triangle")[] = ["dot", "line", "triangle"]

    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      type: types[Math.floor(Math.random() * types.length)],
    }
  }, [])

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.save()
    ctx.globalAlpha = particle.opacity
    ctx.fillStyle = particle.color
    ctx.strokeStyle = particle.color
    ctx.lineWidth = 1

    switch (particle.type) {
      case "dot":
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
        break
      case "line":
        ctx.beginPath()
        ctx.moveTo(particle.x - particle.size, particle.y)
        ctx.lineTo(particle.x + particle.size, particle.y)
        ctx.stroke()
        break
      case "triangle":
        ctx.beginPath()
        ctx.moveTo(particle.x, particle.y - particle.size)
        ctx.lineTo(particle.x - particle.size, particle.y + particle.size)
        ctx.lineTo(particle.x + particle.size, particle.y + particle.size)
        ctx.closePath()
        ctx.fill()
        break
    }
    ctx.restore()
  }, [])

  const drawConnections = useCallback((ctx: CanvasRenderingContext2D, particles: Particle[]) => {
    ctx.strokeStyle = "rgba(59, 130, 246, 0.1)"
    ctx.lineWidth = 0.5

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 100) {
          ctx.globalAlpha = ((100 - distance) / 100) * 0.2
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.stroke()
        }
      }
    }
  }, [])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { width, height } = canvas

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Update and draw particles
    particlesRef.current.forEach((particle, index) => {
      // Update position
      particle.x += particle.vx
      particle.y += particle.vy

      // Mouse interaction
      const dx = mouseRef.current.x - particle.x
      const dy = mouseRef.current.y - particle.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 100) {
        const force = (100 - distance) / 100
        particle.vx += dx * force * 0.0001
        particle.vy += dy * force * 0.0001
      }

      // Boundary collision
      if (particle.x < 0 || particle.x > width) particle.vx *= -1
      if (particle.y < 0 || particle.y > height) particle.vy *= -1

      // Keep particles in bounds
      particle.x = Math.max(0, Math.min(width, particle.x))
      particle.y = Math.max(0, Math.min(height, particle.y))

      // Fade effect
      particle.opacity += (Math.random() - 0.5) * 0.01
      particle.opacity = Math.max(0.1, Math.min(0.7, particle.opacity))

      drawParticle(ctx, particle)
    })

    // Draw connections
    drawConnections(ctx, particlesRef.current)

    animationRef.current = requestAnimationFrame(animate)
  }, [drawParticle, drawConnections])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }, [])

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Recreate particles for new dimensions
    particlesRef.current = Array.from({ length: 80 }, () => createParticle(canvas.width, canvas.height))
  }, [createParticle])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Initial setup
    handleResize()

    // Event listeners
    window.addEventListener("resize", handleResize)
    window.addEventListener("mousemove", handleMouseMove)

    // Start animation
    animate()

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animate, handleResize, handleMouseMove])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }} />
}
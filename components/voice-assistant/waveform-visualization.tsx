'use client'

import { useEffect, useRef } from 'react'

export default function WaveformVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let time = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const centerY = canvas.height / 2
      const frequency = 8
      const amplitude = 15
      const speed = 0.05

      ctx.strokeStyle = '#06b6d4'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.globalAlpha = 0.8

      // Draw main waveform
      ctx.beginPath()
      for (let x = 0; x < canvas.width; x++) {
        const y =
          centerY +
          Math.sin((x * frequency) / 100 + time) * amplitude +
          (Math.random() - 0.5) * 3
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()

      // Draw secondary waveform (echo effect)
      ctx.strokeStyle = '#0ea5e9'
      ctx.globalAlpha = 0.4
      ctx.beginPath()
      for (let x = 0; x < canvas.width; x++) {
        const y =
          centerY +
          Math.sin((x * frequency) / 100 + time + 1) * (amplitude * 0.6) +
          (Math.random() - 0.5) * 2
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()

      time += speed
      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <div className="flex justify-center mb-6">
      <canvas
        ref={canvasRef}
        width={300}
        height={60}
        className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-lg border border-cyan-500/20"
      />
    </div>
  )
}

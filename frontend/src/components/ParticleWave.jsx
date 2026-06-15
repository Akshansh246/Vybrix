import { useEffect, useRef } from 'react'

export default function ParticleWave() {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const targetMouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    let width = 0
    let height = 0
    let points = []
    let time = 0

    // Particle settings
    let cols = 55
    let rows = 45
    const gap = 45 // Distance between points in grid
    const focalLength = 400 // Camera perspective focal length
    const cameraDepth = 420 // Depth offset to push particles in front of camera

    // Handle viewport resize and calculate grid sizes
    const handleResize = () => {
      const parent = canvas.parentElement
      width = parent ? parent.clientWidth : window.innerWidth
      height = parent ? parent.clientHeight : window.innerHeight

      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)

      // Adjust particle count based on screen width
      if (width < 640) {
        // Mobile
        cols = 28
        rows = 24
      } else if (width < 1024) {
        // Tablet
        cols = 40
        rows = 35
      } else {
        // Desktop
        cols = 58
        rows = 48
      }

      initGrid()
    }

    // Initialize the grid points in 3D space
    const initGrid = () => {
      points = []
      const gridWidth = (cols - 1) * gap
      const gridDepth = (rows - 1) * gap

      const startX = -gridWidth / 2
      const startZ = 0 // from camera outwards

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          points.push({
            // grid position (constant relative)
            gridX: startX + c * gap,
            gridZ: startZ + r * gap,
            // 3D coordinate placeholder
            x: 0,
            y: 0,
            z: 0,
            // Projection coordinate placeholder
            screenX: 0,
            screenY: 0,
            scale: 0,
            alpha: 0
          })
        }
      }
    }

    // Mouse parallax tracking
    const handleMouseMove = (e) => {
      // Normalize mouse coordinates from -1 to 1
      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = (e.clientY / window.innerHeight - 0.5) * 2
      targetMouseRef.current = { x, y }
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    // Initialize dimensions and grid
    handleResize()

    // Main animation loop
    const animate = () => {
      time += 0.009 // Wave movement speed (more vigorous flow)

      // Smoothly interpolate mouse coordinates for parallax
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.05
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.05

      // Clear with background color matching the new dark theme
      ctx.fillStyle = '#050505'
      ctx.fillRect(0, 0, width, height)

      const centerX = width / 2
      // Center the wave vertically; shift down slightly for aesthetic depth
      const centerY = height * 0.55

      // Parallax rotation angles based on mouse
      const angleY = mouseRef.current.x * 0.12 // Rotate left-right
      const angleX = -mouseRef.current.y * 0.08 + 0.35 // Rotate up-down (base tilt 0.35rad)

      const cosX = Math.cos(angleX)
      const sinX = Math.sin(angleX)
      const cosY = Math.cos(angleY)
      const sinY = Math.sin(angleY)

      const gridWidth = (cols - 1) * gap
      const gridDepth = (rows - 1) * gap

      // Calculate 3D coordinates, waves and projection
      for (let i = 0; i < points.length; i++) {
        const p = points[i]

        // 1. Calculate wave elevation (y)
        // Increased frequency multipliers for more waves / crests (wavyy)
        const waveX = p.gridX * 0.007
        const waveZ = p.gridZ * 0.005
        
        // Ocean wave simulation formula:
        // Main flow + secondary fine ripples + depth distortion (increased amplitudes for vigorous look)
        const heightVal = 
          Math.sin(waveX + time * 1.2) * Math.cos(waveZ + time * 0.8) * 58 +
          Math.sin(waveX * 2.5 - time * 1.6) * Math.cos(waveZ * 2.2 + time * 1.2) * 18 +
          Math.sin((p.gridX - p.gridZ) * 0.0015 + time * 0.6) * 18

        // Let's damp the waves in the very far background to avoid aliasing
        const zRatio = p.gridZ / gridDepth
        const dampFactor = 1 - zRatio * 0.25
        const currentY = heightVal * dampFactor

        // 2. Apply 3D Rotations (Mouse Parallax + Perspective Tilt)
        // Position relative to pivot point (middle of the grid)
        const relX = p.gridX
        const relZ = p.gridZ - gridDepth / 2

        // Rotate Y (yaw)
        const x1 = relX * cosY + relZ * sinY
        const z1 = -relX * sinY + relZ * cosY

        // Rotate X (pitch)
        const y2 = currentY * cosX - z1 * sinX
        const z2 = currentY * sinX + z1 * cosX

        // Add camera offsets
        const finalX = x1
        const finalY = y2
        const finalZ = z2 + cameraDepth

        // 3. Perspective Projection
        if (finalZ > 20) {
          const scale = focalLength / finalZ
          p.screenX = centerX + finalX * scale
          // Shift vertically with mouse offset
          p.screenY = centerY + finalY * scale + mouseRef.current.y * 15
          
          // Particle size scales with distance
          p.scale = scale

          // Opacity fades with depth to create atmospheric density/fog
          // Also fade out very close to camera or side edges to prevent hard clipping
          const maxDepth = cameraDepth + gridDepth / 2
          let alpha = 1 - (finalZ / maxDepth)
          alpha = Math.max(0, Math.min(1, alpha))

          // Apply quadratic fading for smoother depth blend
          p.alpha = alpha * alpha * 0.85
        } else {
          p.scale = 0
          p.alpha = 0
        }
      }

      // Sort particles by depth (Z) back-to-front so closer particles are rendered on top
      const sortedPoints = [...points].sort((a, b) => b.scale - a.scale)

      // Draw particles
      for (let i = 0; i < sortedPoints.length; i++) {
        const p = sortedPoints[i]
        if (p.scale <= 0 || p.alpha <= 0) continue

        // Draw crisp round dot
        ctx.beginPath()
        // Particle size: 2.2px to 4px based on projection scale
        const size = Math.max(1, Math.min(4, p.scale * 3.5))
        ctx.arc(p.screenX, p.screenY, size, 0, Math.PI * 2)

        // Premium crisp white glow and opacity
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  )
}

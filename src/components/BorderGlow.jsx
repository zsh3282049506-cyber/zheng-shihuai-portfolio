import { useCallback, useEffect, useRef } from 'react'
import './BorderGlow.css'

const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%']
const GRADIENT_KEYS = [
  '--gradient-one',
  '--gradient-two',
  '--gradient-three',
  '--gradient-four',
  '--gradient-five',
  '--gradient-six',
  '--gradient-seven',
]
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1]

const parseHSL = (value) => {
  const match = value.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/)
  if (!match) return { h: 40, s: 80, l: 80 }
  return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) }
}

const buildGlowVars = (glowColor, intensity) => {
  const { h, s, l } = parseHSL(glowColor)
  const opacities = [100, 60, 50, 40, 30, 20, 10]
  const keys = ['', '-60', '-50', '-40', '-30', '-20', '-10']
  return opacities.reduce((variables, opacity, index) => {
    variables[`--glow-color${keys[index]}`] = `hsl(${h}deg ${s}% ${l}% / ${Math.min(opacity * intensity, 100)}%)`
    return variables
  }, {})
}

const buildGradientVars = (colors) => {
  const variables = {}
  for (let index = 0; index < GRADIENT_KEYS.length; index += 1) {
    const color = colors[Math.min(COLOR_MAP[index], colors.length - 1)]
    variables[GRADIENT_KEYS[index]] = `radial-gradient(at ${GRADIENT_POSITIONS[index]}, ${color} 0px, transparent 50%)`
  }
  variables['--gradient-base'] = `linear-gradient(${colors[0]} 0 100%)`
  return variables
}

const easeOutCubic = (value) => 1 - (1 - value) ** 3
const easeInCubic = (value) => value ** 3

function BorderGlow({
  children,
  className = '',
  edgeSensitivity = 30,
  glowColor = '40 80 80',
  backgroundColor = '#120F17',
  borderRadius = 28,
  glowRadius = 40,
  glowIntensity = 1,
  coneSpread = 25,
  animated = false,
  colors = ['#c084fc', '#f472b6', '#38bdf8'],
  fillOpacity = 0.5,
}) {
  const cardRef = useRef(null)
  const animationFramesRef = useRef([])
  const timersRef = useRef([])

  const getEdgeProximity = useCallback((element, x, y) => {
    const { width, height } = element.getBoundingClientRect()
    const centerX = width / 2
    const centerY = height / 2
    const deltaX = x - centerX
    const deltaY = y - centerY
    const xFactor = deltaX === 0 ? Infinity : centerX / Math.abs(deltaX)
    const yFactor = deltaY === 0 ? Infinity : centerY / Math.abs(deltaY)
    return Math.min(Math.max(1 / Math.min(xFactor, yFactor), 0), 1)
  }, [])

  const getCursorAngle = useCallback((element, x, y) => {
    const { width, height } = element.getBoundingClientRect()
    const deltaX = x - width / 2
    const deltaY = y - height / 2
    if (deltaX === 0 && deltaY === 0) return 0
    const degrees = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90
    return degrees < 0 ? degrees + 360 : degrees
  }, [])

  const handlePointerMove = useCallback((event) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const edge = getEdgeProximity(card, x, y)
    const angle = getCursorAngle(card, x, y)
    const proximity = edge * 100
    card.style.setProperty('--edge-proximity', proximity.toFixed(3))
    card.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`)
    card.classList.toggle('edge-active', proximity >= edgeSensitivity)
  }, [edgeSensitivity, getCursorAngle, getEdgeProximity])

  const handlePointerLeave = useCallback(() => {
    const card = cardRef.current
    if (!card) return
    card.style.setProperty('--edge-proximity', '0')
    card.classList.remove('edge-active')
  }, [])

  useEffect(() => {
    if (!animated || !cardRef.current) return undefined
    const card = cardRef.current
    const angleStart = 110
    const angleEnd = 465
    card.classList.add('sweep-active')
    card.style.setProperty('--cursor-angle', `${angleStart}deg`)

    const animate = ({ start = 0, end = 100, duration, delay = 0, ease, update, complete }) => {
      const timer = window.setTimeout(() => {
        const startTime = performance.now()
        const tick = (time) => {
          const progress = Math.min((time - startTime) / duration, 1)
          update(start + (end - start) * ease(progress))
          if (progress < 1) {
            animationFramesRef.current.push(window.requestAnimationFrame(tick))
          } else {
            complete?.()
          }
        }
        animationFramesRef.current.push(window.requestAnimationFrame(tick))
      }, delay)
      timersRef.current.push(timer)
    }

    animate({
      duration: 500,
      ease: easeOutCubic,
      update: (value) => card.style.setProperty('--edge-proximity', value),
    })
    animate({
      duration: 1500,
      end: 50,
      ease: easeInCubic,
      update: (value) => card.style.setProperty('--cursor-angle', `${(angleEnd - angleStart) * (value / 100) + angleStart}deg`),
    })
    animate({
      start: 50,
      end: 100,
      duration: 2250,
      delay: 1500,
      ease: easeOutCubic,
      update: (value) => card.style.setProperty('--cursor-angle', `${(angleEnd - angleStart) * (value / 100) + angleStart}deg`),
    })
    animate({
      start: 100,
      end: 0,
      duration: 1500,
      delay: 2500,
      ease: easeInCubic,
      update: (value) => card.style.setProperty('--edge-proximity', value),
      complete: () => card.classList.remove('sweep-active'),
    })

    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer))
      animationFramesRef.current.forEach((frame) => window.cancelAnimationFrame(frame))
      card.classList.remove('sweep-active')
    }
  }, [animated])

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`border-glow-card ${className}`}
      style={{
        '--card-bg': backgroundColor,
        '--edge-sensitivity': edgeSensitivity,
        '--border-radius': `${borderRadius}px`,
        '--glow-padding': `${glowRadius}px`,
        '--cone-spread': coneSpread,
        '--fill-opacity': fillOpacity,
        ...buildGlowVars(glowColor, glowIntensity),
        ...buildGradientVars(colors),
      }}
    >
      <span className="edge-light" />
      <div className="border-glow-inner">{children}</div>
    </div>
  )
}

export default BorderGlow

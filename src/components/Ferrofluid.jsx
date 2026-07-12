import { useEffect, useRef } from 'react'
import { Mesh, Program, Renderer, Triangle } from 'ogl'
import './Ferrofluid.css'

const MAX_COLORS = 8

const hexToRGB = (hex) => {
  const color = hex.replace('#', '').padEnd(6, '0')
  return [
    parseInt(color.slice(0, 2), 16) / 255,
    parseInt(color.slice(2, 4), 16) / 255,
    parseInt(color.slice(4, 6), 16) / 255,
  ]
}

const prepColors = (input) => {
  const base = (input?.length ? input : ['#4F46E5', '#06B6D4', '#E0F2FE']).slice(0, MAX_COLORS)
  const colors = []
  for (let index = 0; index < MAX_COLORS; index += 1) {
    colors.push(hexToRGB(base[Math.min(index, base.length - 1)]))
  }
  return { colors, count: base.length }
}

const flowVec = (direction) => {
  switch (direction) {
    case 'up':
      return [0, 1]
    case 'left':
      return [-1, 0]
    case 'right':
      return [1, 0]
    default:
      return [0, -1]
  }
}

const vertex = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragment = `
precision highp float;

uniform vec3 iResolution;
uniform vec2 iMouse;
uniform float iTime;

uniform vec3 uColor0;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;
uniform vec3 uColor5;
uniform vec3 uColor6;
uniform vec3 uColor7;
uniform int uColorCount;

uniform vec2 uFlow;
uniform float uSpeed;
uniform float uScale;
uniform float uTurbulence;
uniform float uFluidity;
uniform float uRimWidth;
uniform float uSharpness;
uniform float uShimmer;
uniform float uGlow;
uniform float uOpacity;
uniform float uMouseEnabled;
uniform float uMouseStrength;
uniform float uMouseRadius;

varying vec2 vUv;

#define PI 3.14159265

vec3 palette(float h) {
  int count = uColorCount;
  if (count < 1) count = 1;
  int idx = int(floor(clamp(h, 0.0, 0.999999) * float(count)));
  if (idx <= 0) return uColor0;
  if (idx == 1) return uColor1;
  if (idx == 2) return uColor2;
  if (idx == 3) return uColor3;
  if (idx == 4) return uColor4;
  if (idx == 5) return uColor5;
  if (idx == 6) return uColor6;
  return uColor7;
}

float hash(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.zyx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float smin(float a, float b, float k) {
  float r = exp2(-a / k) + exp2(-b / k);
  return -k * log2(r);
}

float sinlerp(float a, float b, float w) {
  return mix(a, b, (sin(w * PI - PI / 2.0) + 1.0) / 2.0);
}

float vn(vec2 p, float s, float seed) {
  vec2 cellp = floor(p / s);
  vec2 relp = mod(p, s);
  float g1 = hash(vec3(cellp, seed));
  float g2 = hash(vec3(cellp.x + 1.0, cellp.y, seed));
  float g3 = hash(vec3(cellp.x + 1.0, cellp.y + 1.0, seed));
  float g4 = hash(vec3(cellp.x, cellp.y + 1.0, seed));
  float bx = sinlerp(g1, g2, relp.x / s);
  float tx = sinlerp(g4, g3, relp.x / s);
  return sinlerp(bx, tx, relp.y / s);
}

float dbn(vec2 p, float s, float seed) {
  float o = s / 2.0;
  float n0 = vn(p, s, seed);
  float n1 = vn(p + vec2(o, o), s, seed + 0.1);
  float n2 = vn(p + vec2(-o, o), s, seed + 0.2);
  float n3 = vn(p + vec2(o, -o), s, seed + 0.3);
  float n4 = vn(p + vec2(-o, -o), s, seed + 0.4);
  return (2.0 * n0 + 1.5 * n1 + 1.25 * n2 + 1.125 * n3 + n4) / 7.0;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  float ref = 700.0 / max(uScale, 0.05);
  vec2 p = fragCoord / iResolution.y * ref;
  float spd = 200.0 * uSpeed;
  float t = iTime;
  vec2 dir = uFlow;
  vec2 perp = vec2(-dir.y, dir.x);

  float distort1 = vn(p + perp * (t * spd), 60.0, 10.0) * 50.0 * uTurbulence;
  float distort2 = vn(p - perp * (t * spd), 120.0, 15.0) * 100.0 * uTurbulence;
  float peaks = dbn(p + distort1 + dir * (t * spd * 0.5), 40.0, 1.0);
  float peaks2 = dbn(p + distort2 - dir * (t * spd * 0.5), 40.0, 0.0);
  float mapeaks = smin(peaks, peaks2, max(uFluidity, 0.001));

  float mouseGlow = 0.0;
  if (uMouseEnabled > 0.5) {
    vec2 mousePoint = iMouse / iResolution.y * ref;
    float mouseDistance = length(p - mousePoint) / ref;
    float radius = max(uMouseRadius, 0.02);
    mouseGlow = exp(-mouseDistance * mouseDistance / (radius * radius)) * uMouseStrength;
  }

  float band = (uRimWidth - abs((mapeaks - 0.4) * 2.0)) * 5.0;
  float light = clamp(band - vn(p + dir * (t * spd * 0.5), 60.0, 12.0) * uShimmer, 0.0, 1.0);
  light = pow(light, uSharpness) * uGlow;
  light *= clamp(1.0 - mouseGlow, 0.0, 1.0);

  float heightMix = clamp(0.5 + (peaks - peaks2) * 0.8, 0.0, 1.0);
  vec3 outputColor = palette(heightMix) * light;
  float alpha = clamp(max(outputColor.r, max(outputColor.g, outputColor.b)), 0.0, 1.0);
  fragColor = vec4(outputColor, alpha * uOpacity);
}

void main() {
  vec4 color;
  mainImage(color, vUv * iResolution.xy);
  gl_FragColor = color;
}
`

function Ferrofluid({
  className = '',
  dpr,
  frameRate = 24,
  renderScale = 0.72,
  paused = false,
  colors = ['#ffffff', '#ffffff', '#ffffff'],
  backgroundColor = '#03010A',
  speed = 0.5,
  scale = 1.6,
  turbulence = 1,
  fluidity = 0.1,
  rimWidth = 0.2,
  sharpness = 2.5,
  shimmer = 1.5,
  glow = 2,
  flowDirection = 'down',
  opacity = 1,
  mouseInteraction = true,
  mouseStrength = 1,
  mouseRadius = 0.35,
  mouseDampening = 0.15,
  mixBlendMode,
}) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const renderer = new Renderer({
      dpr: dpr ?? Math.min(window.devicePixelRatio || 1, 1.5),
      alpha: true,
      antialias: false,
    })
    const gl = renderer.gl
    const canvas = gl.canvas
    gl.clearColor(0, 0, 0, 0)
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    container.appendChild(canvas)

    const prepared = prepColors(colors)
    const uniforms = {
      iResolution: { value: [gl.drawingBufferWidth, gl.drawingBufferHeight, 1] },
      iMouse: { value: [0, 0] },
      iTime: { value: 2 },
      uColor0: { value: prepared.colors[0] },
      uColor1: { value: prepared.colors[1] },
      uColor2: { value: prepared.colors[2] },
      uColor3: { value: prepared.colors[3] },
      uColor4: { value: prepared.colors[4] },
      uColor5: { value: prepared.colors[5] },
      uColor6: { value: prepared.colors[6] },
      uColor7: { value: prepared.colors[7] },
      uColorCount: { value: prepared.count },
      uFlow: { value: flowVec(flowDirection) },
      uSpeed: { value: speed },
      uScale: { value: scale },
      uTurbulence: { value: turbulence },
      uFluidity: { value: fluidity },
      uRimWidth: { value: rimWidth },
      uSharpness: { value: sharpness },
      uShimmer: { value: shimmer },
      uGlow: { value: glow },
      uOpacity: { value: opacity },
      uMouseEnabled: { value: mouseInteraction ? 1 : 0 },
      uMouseStrength: { value: mouseStrength },
      uMouseRadius: { value: mouseRadius },
    }

    const program = new Program(gl, { vertex, fragment, uniforms })
    const geometry = new Triangle(gl)
    const mesh = new Mesh(gl, { geometry, program })
    let animationFrame = 0
    let lastTime = 0
    let lastRenderTime = 0
    let visible = false
    let pageVisible = !document.hidden
    const mouseTarget = [0, 0]

    const render = () => renderer.render({ scene: mesh })
    const canRender = () => visible && pageVisible && !paused
    const resize = () => {
      const rect = container.getBoundingClientRect()
      const scaledWidth = Math.max(Math.round(rect.width * renderScale), 1)
      const scaledHeight = Math.max(Math.round(rect.height * renderScale), 1)
      renderer.setSize(scaledWidth, scaledHeight)
      uniforms.iResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight, 1]
      render()
    }

    const onPointerMove = (event) => {
      const rect = canvas.getBoundingClientRect()
      const scaleX = gl.drawingBufferWidth / Math.max(rect.width, 1)
      const scaleY = gl.drawingBufferHeight / Math.max(rect.height, 1)
      mouseTarget[0] = (event.clientX - rect.left) * scaleX
      mouseTarget[1] = (rect.height - (event.clientY - rect.top)) * scaleY
      if (mouseDampening <= 0) uniforms.iMouse.value = [...mouseTarget]
    }

    const loop = (time) => {
      if (!canRender()) {
        animationFrame = 0
        return
      }
      const frameInterval = 1000 / Math.max(frameRate, 1)
      if (time - lastRenderTime >= frameInterval) {
        uniforms.iTime.value = time * 0.001
        if (mouseDampening > 0) {
          if (!lastTime) lastTime = time
          const delta = (time - lastTime) / 1000
          lastTime = time
          const factor = Math.min(1, 1 - Math.exp(-delta / Math.max(0.0001, mouseDampening)))
          uniforms.iMouse.value[0] += (mouseTarget[0] - uniforms.iMouse.value[0]) * factor
          uniforms.iMouse.value[1] += (mouseTarget[1] - uniforms.iMouse.value[1]) * factor
        }
        render()
        lastRenderTime = time
      }
      animationFrame = window.requestAnimationFrame(loop)
    }

    const start = () => {
      if (!animationFrame && canRender()) {
        lastTime = 0
        lastRenderTime = 0
        animationFrame = window.requestAnimationFrame(loop)
      }
    }

    const stop = () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
      animationFrame = 0
      lastTime = 0
    }

    const resizeObserver = new ResizeObserver(resize)
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start()
      else stop()
    })
    const onPageVisibilityChange = () => {
      pageVisible = !document.hidden
      if (pageVisible) start()
      else stop()
    }

    resizeObserver.observe(container)
    visibilityObserver.observe(container)
    if (mouseInteraction) canvas.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('visibilitychange', onPageVisibilityChange)
    resize()

    return () => {
      stop()
      if (mouseInteraction) canvas.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('visibilitychange', onPageVisibilityChange)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      if (canvas.parentElement === container) container.removeChild(canvas)
      program.remove?.()
      geometry.remove?.()
      mesh.remove?.()
      renderer.destroy?.()
    }
  }, [
    colors,
    dpr,
    frameRate,
    flowDirection,
    fluidity,
    glow,
    mouseDampening,
    mouseInteraction,
    mouseRadius,
    mouseStrength,
    opacity,
    paused,
    rimWidth,
    renderScale,
    scale,
    sharpness,
    shimmer,
    speed,
    turbulence,
  ])

  return (
    <div
      ref={containerRef}
      className={`ferrofluid-container ${className}`}
      style={{ backgroundColor, ...(mixBlendMode ? { mixBlendMode } : {}) }}
    />
  )
}

export default Ferrofluid

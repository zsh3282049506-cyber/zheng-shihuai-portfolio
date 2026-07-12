import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import './PillNav.css'

function PillNav({ items, activeHref, className = '', baseColor = '#d9ff43', pillColor = '#161b1e', pillTextColor = '#f2f3ef', hoveredPillTextColor = '#101309' }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const circleRefs = useRef([])
  const timelineRefs = useRef([])
  const activeTweenRefs = useRef([])

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return

        const pill = circle.parentElement
        const { width, height } = pill.getBoundingClientRect()
        const radius = ((width * width) / 4 + height * height) / (2 * height)
        const diameter = Math.ceil(2 * radius) + 2
        const offset = Math.ceil(radius - Math.sqrt(Math.max(0, radius * radius - (width * width) / 4))) + 1
        const originY = diameter - offset
        const label = pill.querySelector('.pill-nav__label')
        const hoverLabel = pill.querySelector('.pill-nav__label--hover')

        gsap.set(circle, {
          width: diameter,
          height: diameter,
          bottom: -offset,
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        })
        gsap.set(label, { y: 0 })
        gsap.set(hoverLabel, { y: height + 12, opacity: 0 })

        timelineRefs.current[index]?.kill()
        timelineRefs.current[index] = gsap.timeline({ paused: true })
          .to(circle, { scale: 1.2, duration: 1.1, ease: 'power3.out', overwrite: 'auto' }, 0)
          .to(label, { y: -(height + 8), duration: 1.1, ease: 'power3.out', overwrite: 'auto' }, 0)
          .to(hoverLabel, { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out', overwrite: 'auto' }, 0)
      })
    }

    layout()
    window.addEventListener('resize', layout)
    document.fonts?.ready.then(layout).catch(() => {})

    return () => {
      window.removeEventListener('resize', layout)
      timelineRefs.current.forEach((timeline) => timeline?.kill())
      activeTweenRefs.current.forEach((tween) => tween?.kill())
    }
  }, [items])

  const playHover = (index, direction) => {
    const timeline = timelineRefs.current[index]
    if (!timeline) return
    activeTweenRefs.current[index]?.kill()
    activeTweenRefs.current[index] = timeline.tweenTo(direction ? timeline.duration() : 0, {
      duration: direction ? 0.32 : 0.22,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  }

  const closeMenu = () => setMenuOpen(false)
  const cssVars = {
    '--pill-nav-base': baseColor,
    '--pill-nav-surface': pillColor,
    '--pill-nav-text': pillTextColor,
    '--pill-nav-hover-text': hoveredPillTextColor,
  }

  return (
    <div className={`pill-nav-container ${className}`} style={cssVars}>
      <nav className="pill-nav" aria-label="主导航">
        <a className="pill-nav__logo" href="#top" aria-label="返回首页">
          <span>ZS</span>
        </a>

        <ul className="pill-nav__list">
          {items.map((item, index) => (
            <li key={item.href}>
              <a
                className={`pill-nav__item ${activeHref === item.href ? 'is-active' : ''}`}
                href={item.href}
                aria-label={item.label}
                onMouseEnter={() => playHover(index, true)}
                onMouseLeave={() => playHover(index, false)}
              >
                <span className="pill-nav__circle" aria-hidden="true" ref={(element) => { circleRefs.current[index] = element }} />
                <span className="pill-nav__label-stack">
                  <span className="pill-nav__label">{item.label}</span>
                  <span className="pill-nav__label pill-nav__label--hover" aria-hidden="true">{item.label}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        <button
          className="pill-nav__menu-button"
          type="button"
          aria-label={menuOpen ? '关闭导航' : '打开导航'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span />
          <span />
        </button>
      </nav>

      <div className={`pill-nav__mobile-menu ${menuOpen ? 'is-open' : ''}`}>
        {items.map((item) => (
          <a key={item.href} href={item.href} className={activeHref === item.href ? 'is-active' : ''} onClick={closeMenu}>
            {item.label}
          </a>
        ))}
      </div>
    </div>
  )
}

export default PillNav

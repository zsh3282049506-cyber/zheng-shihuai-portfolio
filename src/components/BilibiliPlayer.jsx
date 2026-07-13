import { useEffect, useRef, useState } from 'react'

function BilibiliPlayer({ className = '', src, title, duration }) {
  const containerRef = useRef(null)
  const [activated, setActivated] = useState(false)
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setActivated(true)
      observer.disconnect()
    }, { rootMargin: '120px 0px', threshold: 0.15 })

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!activated || !duration) return undefined

    const timer = window.setInterval(() => {
      setCycle((current) => current + 1)
    }, (duration + 5) * 1000)

    return () => window.clearInterval(timer)
  }, [activated, duration])

  return (
    <div
      ref={containerRef}
      className={`bilibili-player ${className}`.trim()}
      data-cycle={cycle}
    >
      {activated && (
        <iframe
          key={cycle}
          src={`${src}&cycle=${cycle}`}
          title={title}
          loading="eager"
          scrolling="no"
          frameBorder="0"
          allow="autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="no-referrer"
          allowFullScreen
        />
      )}
    </div>
  )
}

export default BilibiliPlayer

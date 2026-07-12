import { useEffect, useRef, useState } from 'react'

function DeferredVideo({ className = '', src, label }) {
  const videoRef = useRef(null)
  const visibleRef = useRef(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting
      if (entry.isIntersecting) {
        setLoaded(true)
      } else {
        video.pause()
      }
    }, { rootMargin: '480px 0px', threshold: 0.01 })

    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  return (
    <video
      ref={videoRef}
      className={className}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={label}
      onCanPlay={(event) => {
        if (visibleRef.current) event.currentTarget.play().catch(() => {})
      }}
    >
      {loaded && <source src={src} type="video/mp4" />}
    </video>
  )
}

export default DeferredVideo

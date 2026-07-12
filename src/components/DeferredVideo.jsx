import { useEffect, useRef, useState } from 'react'

let activeVideo = null

function DeferredVideo({ className = '', src, label, poster, eager = false, ariaHidden = false }) {
  const videoRef = useRef(null)
  const visibleRef = useRef(false)
  const [loaded, setLoaded] = useState(eager)
  const [requiresInteraction, setRequiresInteraction] = useState(false)

  const playVideo = () => {
    const video = videoRef.current
    if (!video || !visibleRef.current) return

    if (activeVideo && activeVideo !== video) activeVideo.pause()
    const playResult = video.play()
    if (!playResult) return

    playResult
      .then(() => {
        activeVideo = video
        setRequiresInteraction(false)
      })
      .catch(() => setRequiresInteraction(true))
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    video.setAttribute('webkit-playsinline', 'true')
    video.setAttribute('x5-playsinline', 'true')

    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting
      if (entry.isIntersecting) {
        setLoaded(true)
        if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) playVideo()
      } else {
        video.pause()
        if (activeVideo === video) activeVideo = null
      }
    }, { threshold: 0.2 })

    observer.observe(video)
    return () => {
      observer.disconnect()
      if (activeVideo === video) activeVideo = null
    }
  }, [])

  return (
    <video
      ref={videoRef}
      className={className}
      autoPlay
      muted
      loop
      playsInline
      preload={eager ? 'auto' : 'metadata'}
      poster={poster}
      aria-label={label}
      aria-hidden={ariaHidden || undefined}
      controls={requiresInteraction}
      onClick={playVideo}
      onCanPlay={(event) => {
        if (visibleRef.current) playVideo()
      }}
      onError={() => setRequiresInteraction(true)}
    >
      {loaded && <source src={src} type="video/mp4" />}
    </video>
  )
}

export default DeferredVideo

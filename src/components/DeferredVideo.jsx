import { useEffect, useRef, useState } from 'react'

let activeVideo = null

function DeferredVideo({ className = '', src, label, poster, eager = false, ariaHidden = false }) {
  const videoRef = useRef(null)
  const visibleRef = useRef(false)
  const [loaded, setLoaded] = useState(eager)

  const playVideo = () => {
    const video = videoRef.current
    if (!video || !visibleRef.current) return

    video.defaultMuted = true
    video.muted = true
    video.volume = 0
    if (activeVideo && activeVideo !== video) activeVideo.pause()
    const playResult = video.play()
    if (!playResult) return

    playResult
      .then(() => { activeVideo = video })
      .catch(() => {})
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    video.defaultMuted = true
    video.muted = true
    video.volume = 0
    video.setAttribute('muted', '')
    video.setAttribute('playsinline', 'true')
    video.setAttribute('webkit-playsinline', 'true')
    video.setAttribute('x5-playsinline', 'true')
    video.setAttribute('x5-video-player-type', 'h5-page')
    video.setAttribute('x5-video-orientation', 'portrait')

    let retryTimers = []
    const clearRetries = () => {
      retryTimers.forEach((timer) => window.clearTimeout(timer))
      retryTimers = []
    }
    const requestPlayback = () => {
      if (!visibleRef.current) return
      setLoaded(true)
      clearRetries()
      retryTimers = [0, 300, 1000, 2500].map((delay) => window.setTimeout(playVideo, delay))
    }

    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting
      if (entry.isIntersecting) {
        requestPlayback()
      } else {
        clearRetries()
        video.pause()
        if (activeVideo === video) activeVideo = null
      }
    }, { threshold: 0.2 })

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') requestPlayback()
    }
    const handleBridgeReady = () => requestPlayback()

    observer.observe(video)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('WeixinJSBridgeReady', handleBridgeReady)
    document.addEventListener('YixinJSBridgeReady', handleBridgeReady)
    window.addEventListener('pageshow', handleBridgeReady)

    if (window.WeixinJSBridge) requestPlayback()

    return () => {
      clearRetries()
      observer.disconnect()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('WeixinJSBridgeReady', handleBridgeReady)
      document.removeEventListener('YixinJSBridgeReady', handleBridgeReady)
      window.removeEventListener('pageshow', handleBridgeReady)
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
      controls={false}
      disablePictureInPicture
      tabIndex={-1}
      onLoadedMetadata={playVideo}
      onCanPlay={playVideo}
      onEnded={playVideo}
    >
      {loaded && <source src={src} type="video/mp4" />}
    </video>
  )
}

export default DeferredVideo

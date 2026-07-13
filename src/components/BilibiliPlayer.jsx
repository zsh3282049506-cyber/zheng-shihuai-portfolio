function BilibiliPlayer({ className = '', src, title }) {
  return (
    <div className={`bilibili-player ${className}`.trim()}>
      <iframe
        src={src}
        title={title}
        loading="lazy"
        scrolling="no"
        frameBorder="0"
        allow="autoplay; picture-in-picture"
        referrerPolicy="no-referrer"
        allowFullScreen
      />
    </div>
  )
}

export default BilibiliPlayer

import { useEffect, useRef } from 'react'

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4'

const SENSITIVITY = 0.8

export default function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const targetTime = useRef(0)
  const seeking = useRef(false)
  const prevX = useRef<number | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const seek = () => {
      if (seeking.current) return
      if (Math.abs(video.currentTime - targetTime.current) < 0.001) return
      seeking.current = true
      video.currentTime = targetTime.current
    }

    const onSeeked = () => {
      seeking.current = false
      // The pointer may have moved while the last seek was in flight.
      if (Math.abs(video.currentTime - targetTime.current) > 0.001) seek()
    }

    const onMouseMove = (e: MouseEvent) => {
      const duration = video.duration
      if (!duration || Number.isNaN(duration)) return

      if (prevX.current === null) {
        prevX.current = e.clientX
        return
      }

      const delta = e.clientX - prevX.current
      prevX.current = e.clientX

      const next = targetTime.current + (delta / window.innerWidth) * SENSITIVITY * duration
      targetTime.current = Math.min(Math.max(next, 0), duration)
      seek()
    }

    window.addEventListener('mousemove', onMouseMove)
    video.addEventListener('seeked', onSeeked)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      video.removeEventListener('seeked', onSeeked)
    }
  }, [])

  return (
    <video
      ref={videoRef}
      src={VIDEO_SRC}
      muted
      playsInline
      preload="auto"
      className="fixed inset-0 z-0 h-full w-full object-cover"
      style={{ objectPosition: '70% center' }}
    />
  )
}

import { useRef, type ReactNode } from 'react'

export type Slide = { label: string; icon: ReactNode; content: ReactNode }

type Props = { slides: Slide[]; index: number; onChange: (index: number) => void }

/**
 * The laptop display's pages: a row of full-screen slides showing `index`,
 * with a macOS-style Dock to jump between them. Swiping sideways turns the
 * page too.
 */
export default function ScreenSlides({ slides, index, onChange }: Props) {
  const touch = useRef<{ x: number; y: number } | null>(null)

  return (
    <div
      className="slides relative h-full"
      onTouchStart={(e) => {
        // Swipes starting in a window or the contact form are for scrolling and typing.
        const inside = (e.target as Element).closest('[role=dialog], form')
        touch.current = inside ? null : { x: e.touches[0].clientX, y: e.touches[0].clientY }
      }}
      onTouchEnd={(e) => {
        if (!touch.current) return
        const dx = e.changedTouches[0].clientX - touch.current.x
        const dy = e.changedTouches[0].clientY - touch.current.y
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) onChange(index + (dx < 0 ? 1 : -1))
      }}
    >
      <div
        className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ transform: `translateX(${-index * 100}%)` }}
      >
        {slides.map(({ label, content }, i) => (
          <section
            key={label}
            aria-label={label}
            inert={i !== index}
            // Bottom padding keeps content centred above the Dock.
            className="relative flex h-full w-full shrink-0 flex-col items-center justify-center gap-6 bg-[radial-gradient(ellipse_at_center,#202023,#101012)] pb-24 @max-3xl:px-5 @max-3xl:pb-0"
          >
            {content}
          </section>
        ))}
      </div>

      <nav aria-label="Slides" className="dock">
        {slides.map(({ label, icon }, i) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            aria-current={i === index}
            onClick={() => onChange(i)}
            className="dock-item"
          >
            <span aria-hidden className="dock-label">
              {label}
            </span>
            <span className="block size-[72px] overflow-hidden rounded-[22%] shadow-[0_6px_16px_rgb(0_0_0/0.4)]">
              {icon}
            </span>
            <span aria-hidden className={`dock-dot ${i === index ? '' : 'opacity-0'}`} />
          </button>
        ))}
      </nav>
    </div>
  )
}

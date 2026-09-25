import { useRef, useState, type CSSProperties } from 'react'
import BackgroundVideo from './components/BackgroundVideo'
import Laptop, { type LaptopHandle } from './components/Laptop'
import ScatterHeadline, { type Part } from './components/ScatterHeadline'
import ScreenSlides from './components/ScreenSlides'
import { useScrollProgress } from './hooks/useScrollProgress'

const SCENE_1: Part[] = [
  { text: 'I’m', muted: true },
  { text: 'Ibadatt' },
  { text: 'a', muted: true },
  { text: 'Software Developer/DevOps engineer' },
]

const SCENE_2: Part[] = [{ text: 'And…also a', muted: true }, { text: 'Systems Administrator' }]

// Placeholder slides for the laptop's display until there's real content.
const SLIDES = ['Slide one', 'Slide two', 'Slide three']

// Progress runs 0 → 4: scene 1 (0) → scene 2 (1) → scene 3, where the laptop
// rises in folded (2), opens (3), then zooms in on its display (4), where the
// slides and their arrows fade in. Letters take 0.3 to fly, so scene 1 leaves
// over 0–0.55, scene 2 arrives over 0.45–1 and leaves over 1–1.55.
const END = 4
const SCENE_1_EXIT: [number, number] = [0, 0.25]
const SCENE_2_ENTER: [number, number] = [0.45, 0.7]
const SCENE_2_EXIT: [number, number] = [1, 1.25]
const SCENE_3 = 1 // progress at which the laptop starts rising in
const ARROWS_ENTER: [number, number] = [3.4, 4]

export default function App() {
  const stage = useRef<HTMLElement>(null)
  const laptop = useRef<LaptopHandle>(null)
  const [zoomed, setZoomed] = useState(false)
  const [slide, setSlide] = useState(0)
  useScrollProgress(stage, END, (p) => {
    laptop.current?.setProgress(p - SCENE_3)
    setZoomed(p > (ARROWS_ENTER[0] + ARROWS_ENTER[1]) / 2)
  })

  return (
    <main ref={stage} className="relative h-full" style={{ '--p': 0 } as CSSProperties}>
      <BackgroundVideo />
      <Laptop ref={laptop}>
        <ScreenSlides slides={SLIDES} index={slide} />
      </Laptop>

      <div className="pointer-events-none relative grid h-full place-items-center px-4 sm:px-10">
        <ScatterHeadline
          as="h1"
          parts={SCENE_1}
          exit={SCENE_1_EXIT}
          className="col-start-1 row-start-1"
        />
        <ScatterHeadline
          as="h2"
          parts={SCENE_2}
          enter={SCENE_2_ENTER}
          exit={SCENE_2_EXIT}
          className="col-start-1 row-start-1"
        />
      </div>

      <div
        className="slide-arrows pointer-events-none absolute inset-0"
        style={{ '--in': ARROWS_ENTER[0], '--dur': ARROWS_ENTER[1] - ARROWS_ENTER[0] } as CSSProperties}
        inert={!zoomed}
      >
        <button
          type="button"
          aria-label="Previous slide"
          disabled={slide === 0}
          onClick={() => setSlide(slide - 1)}
          className="slide-arrow slide-arrow-prev"
        >
          <Chevron />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          disabled={slide === SLIDES.length - 1}
          onClick={() => setSlide(slide + 1)}
          className="slide-arrow slide-arrow-next"
        >
          <Chevron className="-scale-x-100" />
        </button>
      </div>

      <div className="scroll-hint pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-3 text-[11px] font-medium tracking-[0.35em] text-white/55 uppercase">
        Scroll
        <span className="scroll-hint-line h-10 w-px bg-white/50" />
      </div>
    </main>
  )
}

function Chevron({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={`size-6 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 5.5 8 12l6.5 6.5" />
    </svg>
  )
}

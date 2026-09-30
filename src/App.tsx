import { useEffect, useRef, useState, type CSSProperties } from 'react'
import Dust, { type DustHandle, type Snap } from './components/Dust'
import Headline, { type Part } from './components/Headline'
import Laptop, { type LaptopHandle } from './components/Laptop'
import ScreenSlides from './components/ScreenSlides'
import { SLIDES } from './components/Slides'
import { useScrollProgress } from './hooks/useScrollProgress'

// Poster type for the words that matter, a quiet italic serif for the ones in
// between. Each run's box is trimmed to its capitals, so the gaps between
// them are the space you see. Sizes are in --u (see the headlines' box): a
// share of the width, or of the height on short, wide windows.
const TRIM = '[text-box:trim-both_cap_alphabetic]'
const POSTER = `font-display uppercase ${TRIM}`
const ASIDE = `font-serif italic text-cream/55 text-[length:max(1.5rem,calc(var(--u)*3.6))] ${TRIM}`

// Headlines are flex rows: a basis-full run takes a line to itself. Scene 1
// hangs off the left edge of the name, scene 2 off the right. On phones the
// role can't fit on one line beside "a", so it wraps in the space after it.
const SCENE_1: Part[] = [
  { text: 'I’m', className: `basis-full ${ASIDE}` },
  { text: 'Ibadatt', className: `misprint basis-full ${POSTER} text-[length:max(4.5rem,calc(var(--u)*23))]` },
  { text: 'a', className: `pr-[0.3em] sm:ml-auto ${ASIDE}` },
  {
    text: 'Software Developer/DevOps engineer',
    className: `text-balance max-sm:grow max-sm:basis-0 sm:text-right ${POSTER} text-[length:max(1.5rem,calc(var(--u)*3.5))] leading-[1.15]`,
  },
]

const SCENE_2: Part[] = [
  { text: 'And…also a', className: `basis-full text-right ${ASIDE}` },
  {
    text: 'Systems Administrator',
    className: `basis-full text-right ${POSTER} text-[length:max(3rem,calc(var(--u)*11))] leading-[1.02]`,
  },
]

// Scene 3's words, either side of the laptop (see .backdrop in index.css).
const BACKDROP: Part[] = [
  { text: 'Look', className: `backdrop-look ${TRIM}` },
  { text: 'inside', className: `backdrop-inside ${TRIM}` },
]

// Progress runs 0 → 4: scene 1 (0) → scene 2 (1) → scene 3, where the laptop
// rises in folded (2), opens (3), then zooms in on its display (4), where the
// slides and their arrows fade in. Headlines turn to dust and back (Dust) one
// at a time: scene 1 goes over 0–0.5, scene 2 forms over 0.5–0.95 and goes
// over 1–1.4, and "Look inside" forms as the laptop opens (folded and tilted
// at us, it's wider than open) and goes as the camera starts moving in.
const END = 4
const SCENE_1_EXIT: [number, number] = [0, 0.5]
const SCENE_2_ENTER: [number, number] = [0.5, 0.95]
const SCENE_2_EXIT: [number, number] = [1, 1.4]
const BACKDROP_ENTER: [number, number] = [2.3, 2.75]
const BACKDROP_EXIT: [number, number] = [3, 3.25]
const SCENE_3 = 1 // progress at which the laptop starts rising in
const ARROWS_ENTER: [number, number] = [3.4, 4]

// The journey rail's stops: where each sits in the progress above.
const STOPS = [
  { label: 'Intro', at: 0 },
  { label: 'Also', at: 1 },
  { label: 'The MacBook', at: 3 },
  { label: 'Explore', at: 4 },
]

export default function App() {
  const stage = useRef<HTMLElement>(null)
  const laptop = useRef<LaptopHandle>(null)
  const dust = useRef<DustHandle>(null)
  const scene1 = useRef<HTMLHeadingElement & HTMLParagraphElement>(null)
  const scene2 = useRef<HTMLHeadingElement & HTMLParagraphElement>(null)
  const backdrop = useRef<HTMLHeadingElement & HTMLParagraphElement>(null)
  const snaps: Snap[] = [
    { target: scene1, exit: SCENE_1_EXIT },
    { target: scene2, enter: SCENE_2_ENTER, exit: SCENE_2_EXIT },
    { target: backdrop, enter: BACKDROP_ENTER, exit: BACKDROP_EXIT },
  ]
  const [zoomed, setZoomed] = useState(false)
  const [slide, setSlide] = useState(0)
  const goTo = useScrollProgress(stage, END, (p) => {
    laptop.current?.setProgress(p - SCENE_3)
    dust.current?.setProgress(p)
    setZoomed(p > (ARROWS_ENTER[0] + ARROWS_ENTER[1]) / 2)
  })
  const showSlide = (i: number) => setSlide(Math.min(SLIDES.length - 1, Math.max(0, i)))

  // ← and → turn the laptop's slides once it's zoomed in (not while typing).
  useEffect(() => {
    if (!zoomed) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof Element && e.target.closest('input, textarea')) return
      const step = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0
      if (step) setSlide((i) => Math.min(SLIDES.length - 1, Math.max(0, i + step)))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [zoomed])

  return (
    <main ref={stage} className="relative h-full" style={{ '--p': 0 } as CSSProperties}>
      <Dust ref={dust} snaps={snaps} />

      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <Headline ref={backdrop} as="p" parts={BACKDROP} className="backdrop font-display text-signal uppercase" />
      </div>

      <Laptop ref={laptop}>
        <ScreenSlides slides={SLIDES} index={slide} onChange={showSlide} />
      </Laptop>

      <header className="masthead pointer-events-none absolute inset-x-0 top-0 flex justify-between px-4 pt-5 font-mono text-[11px] tracking-[0.2em] text-cream/60 uppercase sm:px-8 sm:pt-7">
        <span>Ibadatt Aulakh</span>
        <span>Portfolio ©2026</span>
      </header>

      {/* Clear of the masthead above and the scroll hint below. Each headline
          is as wide as its widest word, so the lines around it align to it. */}
      <div className="pointer-events-none relative grid h-full place-items-center px-4 pt-16 pb-28 text-cream [--u:min(1vw,1.6vh)] sm:px-10">
        <Headline
          ref={scene1}
          as="h1"
          parts={SCENE_1}
          className="col-start-1 row-start-1 flex w-min flex-wrap items-baseline gap-y-[calc(var(--u)*2.2)] font-normal"
        />
        <Headline
          ref={scene2}
          as="h2"
          parts={SCENE_2}
          className="col-start-1 row-start-1 flex w-min flex-wrap justify-end gap-y-[calc(var(--u)*2.2)] font-normal"
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
          onClick={() => showSlide(slide - 1)}
          className="slide-arrow slide-arrow-prev"
        >
          <Chevron />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          disabled={slide === SLIDES.length - 1}
          onClick={() => showSlide(slide + 1)}
          className="slide-arrow slide-arrow-next"
        >
          <Chevron className="-scale-x-100" />
        </button>
      </div>

      {/* Where you are in the story (there's no scrollbar), and a way to jump. */}
      <nav aria-label="Sections" className="rail">
        {STOPS.map(({ label, at }) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            onClick={() => goTo(at)}
            className="rail-stop"
            style={{ '--at': at } as CSSProperties}
          >
            <span aria-hidden className="rail-label">
              {label}
            </span>
          </button>
        ))}
      </nav>

      <div className="scroll-hint pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-3 font-mono text-[11px] tracking-[0.35em] text-cream/55 uppercase">
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

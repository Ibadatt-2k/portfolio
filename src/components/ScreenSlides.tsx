type Props = { slides: string[]; index: number }

/** A row of full-screen slides for the laptop's display, showing `index`. */
export default function ScreenSlides({ slides, index }: Props) {
  return (
    <div
      className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{ transform: `translateX(${-index * 100}%)` }}
    >
      {slides.map((title, i) => (
        <section
          key={title}
          inert={i !== index}
          className="flex h-full w-full shrink-0 flex-col items-center justify-center gap-6 bg-[radial-gradient(ellipse_at_center,#202023,#101012)]"
        >
          <span className="text-2xl font-medium tracking-[0.3em] text-white/40">
            {String(i + 1).padStart(2, '0')}
          </span>
          <h3 className="text-8xl font-extrabold tracking-[-0.04em]">{title}</h3>
          <p className="text-2xl text-white/50">Content coming soon</p>
        </section>
      ))}
    </div>
  )
}

import { useLayoutEffect, useRef, type ReactNode } from 'react'

type Props = {
  title: string
  /** The app icon the window grows out of and shrinks back into. */
  from: HTMLElement
  onClose: () => void
  /** Sizing, e.g. a Tailwind width class. */
  className: string
  children: ReactNode
}

/** A macOS-style app window, centred in the nearest positioned ancestor. */
export default function MacWindow({ title, from, onClose, className, children }: Props) {
  const win = useRef<HTMLDivElement>(null)

  // Scale between the icon's size and full size, anchored on the icon, the way
  // a Mac window zooms out of its app (and back in when it's closed).
  const zoom = (opening: boolean) => {
    const el = win.current!
    const [x, y] = offsetWithin(from, el.offsetParent!)
    el.style.transformOrigin = `${x + from.offsetWidth / 2 - el.offsetLeft}px ${y + from.offsetHeight / 2 - el.offsetTop}px`
    const small = { transform: `scale(${from.offsetWidth / el.offsetWidth})`, opacity: 0 }
    const full = { transform: 'scale(1)', opacity: 1 }
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    return el.animate(opening ? [small, full] : [full, small], {
      duration: reduced ? 0 : opening ? 380 : 260,
      easing: opening ? 'cubic-bezier(0.2, 0.8, 0.2, 1)' : 'cubic-bezier(0.4, 0, 1, 1)',
      fill: 'forwards',
    })
  }

  useLayoutEffect(() => {
    zoom(true)
  }, [])

  const close = () => {
    zoom(false).onfinish = onClose
  }

  return (
    <>
      {/* Keeps clicks off whatever's behind the window while it's open. */}
      <div aria-hidden className="absolute inset-0" />
      <div
        ref={win}
        role="dialog"
        aria-label={title}
        // Scrolling inside a window scrolls its content, not the page.
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className={`absolute overflow-hidden rounded-[20px] border border-white/10 bg-[#1e1e20] shadow-[0_40px_90px_rgb(0_0_0/0.6)] @max-3xl:rounded-2xl ${className}`}
      >
        <div className="relative flex h-14 items-center border-b border-white/8 bg-[#2a2a2d] px-5 @max-3xl:h-11 @max-3xl:px-3.5">
          <div className="group flex gap-3 @max-3xl:gap-2">
            <TrafficLight label="Close" color="bg-[#ff5f57]" onClick={close}>
              <path d="M3.5 3.5l5 5M8.5 3.5l-5 5" />
            </TrafficLight>
            <TrafficLight label="Minimize" color="bg-[#febc2e]" onClick={close}>
              <path d="M2.5 6h7" />
            </TrafficLight>
            <TrafficLight color="bg-[#28c840]">
              <path d="M6 2.5v7M2.5 6h7" />
            </TrafficLight>
          </div>
          <p className="absolute inset-x-0 text-center text-xl font-semibold text-white/70 @max-3xl:text-sm">
            {title}
          </p>
        </div>
        {children}
      </div>
    </>
  )
}

/** One of the red/yellow/green buttons; its symbol shows while hovering the group. */
function TrafficLight({
  label,
  color,
  onClick,
  children,
}: {
  label?: string
  color: string
  onClick?: () => void
  children: ReactNode
}) {
  const symbol = (
    <svg
      viewBox="0 0 12 12"
      aria-hidden
      className="size-3.5 opacity-0 group-hover:opacity-100 @max-3xl:size-2.5"
      fill="none"
      stroke="rgb(0 0 0 / 0.6)"
      strokeWidth={1.6}
      strokeLinecap="round"
    >
      {children}
    </svg>
  )
  const className = `relative z-10 grid size-5 place-items-center rounded-full @max-3xl:size-3.5 ${color}`
  return onClick ? (
    <button type="button" aria-label={label} onClick={onClick} className={`${className} cursor-pointer`}>
      {symbol}
    </button>
  ) : (
    <span aria-hidden className={className}>
      {symbol}
    </span>
  )
}

// `el`'s layout position (ignoring transforms) within the ancestor `root`.
function offsetWithin(el: HTMLElement, root: Element) {
  let [x, y] = [0, 0]
  for (let node: Element | null = el; node && node !== root; node = (node as HTMLElement).offsetParent) {
    x += (node as HTMLElement).offsetLeft
    y += (node as HTMLElement).offsetTop
  }
  return [x, y]
}

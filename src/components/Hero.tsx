import { useEffect, useState } from 'react'
import { useTypewriter } from '../hooks/useTypewriter'

const TYPED_TEXT =
  'Glad you stopped in. Good taste tends to find us. Now, what are we building?'

const PILLS = ['Pitch us an idea', 'Come work here', 'Send a brief hello', 'See how we operate']

const EMAIL = 'hello@mainframe.co'

const pillBase =
  'inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-[0.3em] text-[13px] mx-[0.2em] mb-[0.4em] sm:px-5 sm:text-[15px] transition-colors duration-200'

function CopyIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
    >
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
      <path d="M8.2 1.5H2.7A1.2 1.2 0 0 0 1.5 2.7v5.5" />
    </svg>
  )
}

export default function Hero() {
  const { displayed, done } = useTypewriter(TYPED_TEXT)
  const [showActions, setShowActions] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowActions(true), 400)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="relative z-1 flex h-screen flex-col justify-end overflow-hidden px-5 pb-12 sm:px-8 md:justify-center md:px-10 md:pb-0">
      <div className="relative z-10 max-w-xl">
        <div
          className="pointer-events-none mb-5 select-none sm:mb-6"
          style={{
            fontSize: 'clamp(18px, 4vw, 26px)',
            lineHeight: 1.3,
            fontWeight: 400,
            color: '#000',
            filter: 'blur(4px)',
          }}
        >
          Hey there, meet A.R.I.A,
          <br />
          Mainframe&apos;s Adaptive Response Interface Agent
        </div>

        <p
          className="mb-5 text-black sm:mb-6"
          style={{
            fontSize: 'clamp(18px, 4vw, 26px)',
            lineHeight: 1.35,
            fontWeight: 400,
            minHeight: '54px',
          }}
        >
          {displayed}
          {!done && (
            <span className="cursor-blink ml-[2px] inline-block h-[1.1em] w-[2px] bg-black align-middle" />
          )}
        </p>

        <div
          className="flex flex-wrap gap-y-1"
          style={{
            opacity: showActions ? 1 : 0,
            transform: showActions ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
          }}
        >
          {PILLS.map((label) => (
            <button
              key={label}
              type="button"
              className={`${pillBase} border border-black/10 bg-white text-black hover:bg-black hover:text-white`}
            >
              {label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(EMAIL)}
            className={`${pillBase} gap-2 border border-white bg-transparent text-white hover:bg-white hover:text-black sm:gap-3`}
          >
            <span>
              Reach us: <span className="underline underline-offset-1">{EMAIL}</span>
            </span>
            <CopyIcon />
          </button>
        </div>
      </div>
    </section>
  )
}

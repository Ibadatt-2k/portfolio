import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { GrainGradient } from '@paper-design/shaders-react'
import { APPS, type App } from './ExperienceApps'
import MacWindow from './MacWindow'
import type { Slide } from './ScreenSlides'
import { asset } from '../asset'

// What's shown on the laptop's display, one component per slide. Sizes are
// for the 1280px-wide page laid onto the display, which is shown scaled down;
// the @max-3xl: variants lay out for the narrow full-screen panel phones get
// instead (see Laptop), which is shown at its true size.

// Where the "Let's talk" form on the back of the profile photo is sent.
const FORMSPREE = 'https://formspree.io/f/xeoonkeb'

// The pages' type, as in the intro: poster headlines, mono labels, and
// paper-white buttons that turn orange. (The windows, Dock and notification
// are the laptop's own, so they keep its system font.)
const TITLE = 'font-display text-[8.5rem] leading-[0.9] text-balance uppercase @max-3xl:text-6xl'
const LABEL = 'font-mono text-xl tracking-[0.2em] text-cream/50 uppercase @max-3xl:text-[11px]'
const BUTTON =
  'cursor-pointer rounded-lg bg-cream font-mono tracking-[0.12em] text-ink uppercase transition hover:bg-signal focus-visible:bg-signal focus-visible:outline-none active:scale-[0.97]'

function Profile() {
  const [flipped, setFlipped] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle')
  const [sentNotice, setSentNotice] = useState(false)
  const message = useRef<HTMLTextAreaElement>(null)

  const flip = (toForm: boolean) => {
    setFlipped(toForm)
    // Ready to write once the card has turned.
    if (toForm) setTimeout(() => message.current?.focus({ preventScroll: true }), 700)
  }

  // Sent in the background, so the visitor never leaves the page: on success
  // the card flips back to the photo and a notification says it's sent.
  const send = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setStatus('sending')
    try {
      const response = await fetch(FORMSPREE, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      })
      // Formspree says why it refused, e.g. reCAPTCHA switched on for the form.
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.error)
      form.reset()
      setStatus('idle')
      flip(false)
      setSentNotice(true)
    } catch (error) {
      console.error('Formspree:', error)
      setStatus('error')
    }
  }

  return (
    <div className="flex items-center @max-3xl:flex-col">
      {sentNotice && (
        // A slip of the postcard's paper, postmarked and signed, that slides
        // in and then away on its own.
        <div
          role="status"
          onAnimationEnd={() => setSentNotice(false)}
          className="notify paper absolute top-12 right-12 flex w-[560px] items-center gap-7 rounded-[12px] py-7 pr-10 pl-7 text-left text-ink shadow-[0_24px_60px_rgb(0_0_0/0.5)] @max-3xl:top-3 @max-3xl:right-3 @max-3xl:left-3 @max-3xl:w-auto @max-3xl:gap-3.5 @max-3xl:rounded-lg @max-3xl:p-3.5"
        >
          <Postmark ringOnly className="w-[104px] shrink-0 -rotate-12 @max-3xl:w-14" />
          <div>
            <p className="font-mono text-base tracking-[0.3em] text-ink/50 uppercase @max-3xl:text-[10px]">Posted</p>
            <p className="mt-2 font-serif text-[2rem] leading-tight @max-3xl:mt-1 @max-3xl:text-lg">
              Thanks for writing. I’ll get back to you soon.
            </p>
            <p className="mt-1.5 font-serif text-2xl text-ink/60 italic @max-3xl:mt-0.5 @max-3xl:text-base">Ibadatt</p>
          </div>
        </div>
      )}
      <div className="relative [perspective:2400px]">
        <div
          aria-hidden
          className={`absolute -inset-16 rounded-full bg-[radial-gradient(closest-side,rgb(255_255_255/0.13),transparent)] transition-opacity duration-500 ${flipped ? 'opacity-0' : ''}`}
        />
        {/* The coin: spins over and grows into a card, a postcard on its back. */}
        <div
          className={`relative transition-[width,height,transform] duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] [transform-style:preserve-3d] ${flipped ? 'h-[580px] w-[900px] [transform:rotateY(180deg)] @max-3xl:h-[540px] @max-3xl:w-[min(340px,100cqw-32px)]' : 'size-[332px] hover:[transform:rotateY(18deg)] @max-3xl:size-[212px]'}`}
        >
          <button
            type="button"
            inert={flipped}
            onClick={() => flip(true)}
            aria-label="Flip my photo to send me a message"
            className="absolute inset-0 m-auto size-fit cursor-pointer rounded-full bg-[conic-gradient(from_200deg,#f5f5f7,#6e6e73,#d2d2d7,#6e6e73,#f5f5f7)] p-1.5 shadow-[0_24px_60px_rgb(0_0_0/0.55)] [backface-visibility:hidden]"
          >
            {/* A silver ring with a thin gap before the photo. */}
            <img
              src={asset('profile.webp')}
              alt="Ibadatt"
              className="size-80 rounded-full border-[6px] border-[#1c1c1e] object-cover @max-3xl:size-50 @max-3xl:border-4"
            />
          </button>
          {/* The back of the photo is a postcard: a note on the left, written
              on ruled lines, and on the right a stamp (the photo again), who
              it's to, and who it's from. */}
          <form
            inert={!flipped}
            onSubmit={send}
            aria-label="Send me a message"
            className="paper absolute inset-0 grid grid-cols-[1.15fr_1fr] grid-rows-[auto_1fr] rounded-[14px] px-12 pt-8 pb-10 text-left text-ink shadow-[0_40px_90px_rgb(0_0_0/0.6)] [backface-visibility:hidden] [transform:rotateY(180deg)] @max-3xl:grid-cols-1 @max-3xl:grid-rows-[auto_1fr_auto] @max-3xl:rounded-[10px] @max-3xl:px-5 @max-3xl:pt-4 @max-3xl:pb-5"
          >
            <input type="hidden" name="_subject" value="New message from your portfolio" />
            <p aria-hidden className="col-span-full text-center font-mono text-lg tracking-[0.6em] text-ink/50 @max-3xl:text-[10px]">
              POST CARD
            </p>

            <div className="mt-6 flex flex-col border-r-2 border-ink/20 pr-10 @max-3xl:mt-3 @max-3xl:border-r-0 @max-3xl:border-b @max-3xl:pr-0 @max-3xl:pb-4">
              <label htmlFor="contact-message" className="font-serif text-[2.6rem] leading-none italic @max-3xl:text-2xl">
                Dear Ibadatt,
              </label>
              <textarea
                ref={message}
                id="contact-message"
                name="message"
                required
                maxLength={500}
                placeholder="Say hi…"
                className="ruled mt-3 min-h-0 flex-1 resize-none bg-transparent font-serif text-[2rem] italic outline-none placeholder:text-ink/35 @max-3xl:mt-2 @max-3xl:text-lg @max-3xl:[--rule:1px]"
              />
            </div>

            <div className="mt-6 flex min-h-0 flex-col pl-10 @max-3xl:mt-3 @max-3xl:pl-0">
              <div className="flex items-start justify-end gap-5 @max-3xl:absolute @max-3xl:top-3 @max-3xl:right-4">
                <Postmark className="mt-4 w-[196px] @max-3xl:hidden" />
                <Stamp />
              </div>
              <p className="mt-auto font-mono text-base tracking-[0.3em] text-ink/50 uppercase @max-3xl:text-[10px]">To</p>
              <p className="mt-1 border-b-2 border-ink/20 font-serif text-[1.9rem] leading-[1.5] italic @max-3xl:border-b @max-3xl:text-lg">Ibadatt Aulakh</p>
              <p className="border-b-2 border-ink/20 font-serif text-[1.9rem] leading-[1.5] italic @max-3xl:border-b @max-3xl:text-lg">ibadatt.dev</p>
              <label
                htmlFor="contact-email"
                className="mt-5 font-mono text-base tracking-[0.3em] text-ink/50 uppercase @max-3xl:mt-3 @max-3xl:text-[10px]"
              >
                From
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                placeholder="your email"
                className="mt-1 border-b-2 border-ink/20 bg-transparent font-serif text-[1.9rem] leading-[1.5] italic outline-none placeholder:text-ink/35 autofill:shadow-[inset_0_0_0_100px_var(--color-cream)] focus:border-ink @max-3xl:border-b @max-3xl:text-lg"
              />
              <div className="mt-7 flex items-center justify-between gap-4 @max-3xl:mt-4">
                <button
                  type="button"
                  onClick={() => flip(false)}
                  className="flex cursor-pointer items-center gap-2.5 font-mono text-base tracking-[0.2em] text-ink/55 uppercase transition-colors hover:text-ink @max-3xl:gap-1.5 @max-3xl:text-[10px]"
                >
                  <svg viewBox="0 0 24 24" aria-hidden className="size-5 @max-3xl:size-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6L3.5 8.5" />
                    <path d="M3.5 3.5v5h5" />
                  </svg>
                  Turn over
                </button>
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="cursor-pointer rounded-md bg-ink px-10 py-4 font-mono text-lg tracking-[0.25em] text-cream uppercase transition hover:bg-[#2b2724] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink active:scale-[0.97] disabled:cursor-default disabled:opacity-60 @max-3xl:px-5 @max-3xl:py-2.5 @max-3xl:text-[11px]"
                >
                  {status === 'sending' ? 'Sending…' : 'Send'}
                </button>
              </div>
              {status === 'error' && (
                <p role="alert" className="mt-3 text-right font-mono text-sm tracking-wide text-ink/70 @max-3xl:text-[10px]">
                  Couldn’t send that. Please try again.
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
      {/* Speech bubble, its tail pointing back at the photo; folds away while
          the form is showing so the card sits centred. */}
      <div
        className={`overflow-hidden pl-3 transition-[max-width,opacity,margin] duration-500 ${flipped ? 'ml-0 max-w-0 opacity-0 @max-3xl:hidden' : 'ml-11 max-w-[720px] @max-3xl:mt-7 @max-3xl:ml-0 @max-3xl:pt-3 @max-3xl:pl-0'}`}
      >
        <p className="relative rounded-[2rem] bg-cream px-10 py-5 font-serif text-7xl text-ink italic whitespace-nowrap @max-3xl:rounded-2xl @max-3xl:px-6 @max-3xl:py-2.5 @max-3xl:text-4xl">
          <span
            aria-hidden
            className="absolute top-1/2 -left-3 size-8 -translate-y-1/2 rotate-45 rounded-sm bg-cream @max-3xl:top-0 @max-3xl:left-1/2 @max-3xl:size-5 @max-3xl:-translate-x-1/2"
          />
          Yup, that’s me!
        </p>
      </div>
    </div>
  )
}

/** The postcard's stamp: the profile photo in black and white, perforated. */
function Stamp() {
  return (
    <span aria-hidden className="drop-shadow-[0_2px_2px_rgb(0_0_0/0.18)]">
      <span className="stamp block w-[110px] @max-3xl:w-[50px] @max-3xl:[--tile:5px]">
        <img src={asset('profile.webp')} alt="" className="aspect-[4/5] w-full object-cover grayscale contrast-[1.15]" />
        <span className="block pt-1.5 text-center font-mono text-[11px] tracking-[0.25em] text-ink/70 @max-3xl:hidden">
          IBADATT
        </span>
      </span>
    </span>
  )
}

/**
 * A postmark: the site's name around today's date, with wavy lines beside it
 * (or just the ring).
 */
function Postmark({ ringOnly = false, className = '' }: { ringOnly?: boolean; className?: string }) {
  const ring = useId()
  const [day, month, year] = new Date()
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase()
    .split(' ')
  return (
    <svg viewBox={ringOnly ? '0 0 120 120' : '0 0 196 120'} aria-hidden className={`text-ink/45 ${className}`} fill="none" stroke="currentColor">
      <path id={ring} d="M60 60m-43 0a43 43 0 1 1 86 0a43 43 0 1 1-86 0" stroke="none" />
      <circle cx="60" cy="60" r="55" strokeWidth="2.5" />
      <circle cx="60" cy="60" r="32" strokeWidth="1.5" />
      <text fill="currentColor" stroke="none" fontFamily="JetBrains Mono, monospace" fontSize="10.5" letterSpacing="2.4">
        <textPath href={`#${ring}`}>IBADATT.DEV · IBADATT.DEV · </textPath>
      </text>
      <text x="60" y="58" textAnchor="middle" fill="currentColor" stroke="none" fontFamily="JetBrains Mono, monospace" fontSize="13">
        {day} {month}
      </text>
      <text x="60" y="74" textAnchor="middle" fill="currentColor" stroke="none" fontFamily="JetBrains Mono, monospace" fontSize="11">
        {year}
      </text>
      {!ringOnly &&
        [36, 52, 68, 84].map((y) => <path key={y} d={`M124 ${y}q9-7 18 0t18 0t18 0t18 0`} strokeWidth="2.5" />)}
    </svg>
  )
}

function WhatIDo() {
  const [showApps, setShowApps] = useState(false)
  const [opened, setOpened] = useState<{ app: App; icon: HTMLElement } | null>(null)

  return (
    <>
      {/* Fades away when Experience is clicked, leaving just the app icons. */}
      <div
        className={`flex flex-col items-center gap-12 @max-3xl:gap-7 transition-[opacity,visibility] duration-300 ${showApps ? 'invisible opacity-0' : ''}`}
      >
        <h3 className={`${TITLE} @max-3xl:text-center`}>This is what I do</h3>
        {/* Both labels share one grid cell, so the button keeps its size as
            "Experience" swaps for "Click me" on hover. */}
        <button
          type="button"
          aria-expanded={showApps}
          aria-controls="experience-apps"
          onClick={() => setShowApps(true)}
          className={`group grid ${BUTTON} px-14 py-6 text-3xl @max-3xl:px-8 @max-3xl:py-3.5 @max-3xl:text-base`}
        >
          <span className="col-start-1 row-start-1 transition-opacity group-hover:opacity-0 group-focus-visible:opacity-0">
            Experience
          </span>
          <span
            aria-hidden
            className="col-start-1 row-start-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            Click me
          </span>
        </button>
      </div>
      {showApps && (
        <>
          {/* Like Launchpad, clicking anywhere around the icons also closes
              them (the Back button below is the way for keyboards). */}
          <div aria-hidden onClick={() => setShowApps(false)} className="absolute inset-0" />
          {/* Absolutely placed, so it pops up centred where the text was. */}
          <div id="experience-apps" className="absolute flex gap-12 @max-3xl:gap-8">
            {APPS.map((app, i) => (
              <button
                key={app.name}
                type="button"
                onClick={(e) => setOpened({ app, icon: e.currentTarget })}
                className="app-pop cursor-pointer rounded-[22%] transition-[scale] active:scale-95"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <img
                  src={app.icon}
                  alt={app.name}
                  className="size-36 rounded-[22%] shadow-[0_18px_40px_rgb(0_0_0/0.55)] @max-3xl:size-24"
                />
              </button>
            ))}
          </div>
          {/* Hidden while an app's window is open (it has its own close). */}
          <button
            type="button"
            onClick={() => setShowApps(false)}
            className={`app-pop absolute right-12 bottom-12 flex cursor-pointer items-center gap-4 rounded-lg border border-cream/30 px-10 py-5 font-mono text-2xl tracking-[0.12em] uppercase transition hover:bg-cream hover:text-ink focus-visible:bg-cream focus-visible:text-ink focus-visible:outline-none active:scale-[0.97] @max-3xl:right-4 @max-3xl:bottom-4 @max-3xl:gap-2 @max-3xl:px-5 @max-3xl:py-2.5 @max-3xl:text-sm ${opened ? 'invisible' : ''}`}
            style={{ animationDelay: '180ms' }}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden
              className="size-8 @max-3xl:size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
            Back
          </button>
          {opened && (
            <MacWindow
              title={opened.app.name}
              from={opened.icon}
              onClose={() => setOpened(null)}
              className={opened.app.window.className}
            >
              {opened.app.window.content}
            </MacWindow>
          )}
        </>
      )}
    </>
  )
}

const REP_NATION = {
  coaches: ['Build & assign workout plans', 'Chat with clients', 'Get paid through Stripe'],
  clients: ['Follow their plan', 'Log workouts', 'Chat with their coach'],
  stack: ['Flutter', 'Firestore', 'Firebase Auth', 'Cloud Functions', 'FCM', 'Stripe'],
}

function RepNation() {
  return (
    <div className="flex w-[1040px] flex-col items-center text-center @max-3xl:w-full">
      <p className={LABEL}>Founder</p>
      <h3 className={`mt-4 ${TITLE} @max-3xl:mt-2`}>Rep Nation</h3>
      <p className="mt-4 font-serif text-[2.75rem] leading-tight text-cream/75 @max-3xl:mt-3 @max-3xl:text-xl">
        An iOS app for fitness freaks that brings coaches and their clients together.
      </p>
      {/* Two ruled columns, like a printed spec sheet. */}
      <div className="mt-10 grid w-full grid-cols-2 border-y border-cream/15 text-left @max-3xl:mt-6 @max-3xl:grid-cols-1">
        {(['coaches', 'clients'] as const).map((who) => (
          <div
            key={who}
            className="px-10 py-7 first:border-r first:border-cream/15 @max-3xl:px-1 @max-3xl:py-4 @max-3xl:first:border-r-0 @max-3xl:first:border-b"
          >
            <p className={LABEL}>For {who}</p>
            <ol className="mt-4 flex flex-col gap-2 font-serif text-[2.1rem] @max-3xl:mt-2 @max-3xl:gap-1 @max-3xl:text-lg">
              {REP_NATION[who].map((item, i) => (
                <li key={item} className="flex items-baseline gap-5 @max-3xl:gap-3">
                  <span aria-hidden className="font-mono text-xl text-signal @max-3xl:text-[11px]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
      <ul
        aria-label="Built with"
        className="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-1 font-mono text-xl text-cream/55 @max-3xl:mt-4 @max-3xl:gap-x-2 @max-3xl:text-[11px]"
      >
        {REP_NATION.stack.map((tool) => (
          <li key={tool} className="after:ml-4 after:text-cream/25 after:content-['/'] last:after:content-none @max-3xl:after:ml-2">
            {tool}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Education() {
  return (
    <div className="flex flex-col items-center">
      <h3 className={TITLE}>Education</h3>
      <div className="mt-14 flex items-center gap-10 border-y border-cream/15 py-8 pr-6 @max-3xl:mt-8 @max-3xl:flex-col @max-3xl:gap-4 @max-3xl:py-6 @max-3xl:pr-0 @max-3xl:text-center">
        <img src={asset('ufv.webp')} alt="UFV logo" className="size-36 shrink-0 rounded-[22%] @max-3xl:size-20" />
        <div>
          <p className="font-serif text-5xl @max-3xl:text-2xl">University of the Fraser Valley</p>
          <p className="mt-2 font-serif text-3xl text-cream/70 italic @max-3xl:mt-1 @max-3xl:text-lg">Bachelor’s degree, Computer Information Systems</p>
          <p className={`mt-4 ${LABEL} @max-3xl:mt-2`}>Fall 2021 – Winter 2025</p>
        </div>
      </div>
    </div>
  )
}

const RESUME = asset('Ibadatt_Aulakh_Resume.pdf')

// Profiles to connect on, with their logos (from Simple Icons).
const LINKS = [
  {
    name: 'GitHub',
    href: 'https://github.com/Ibadatt-2k',
    logo: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/ibadatt-aulakh/',
    logo: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
]

function DownloadIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" />
    </svg>
  )
}

function Resume() {
  return (
    <div className="flex items-center gap-20 @max-3xl:flex-col @max-3xl:gap-10">
      {/* The résumé's first page; clicking it downloads the PDF too. */}
      <a
        href={RESUME}
        download
        aria-label="Download my résumé (PDF)"
        className="relative block w-[300px] shrink-0 -rotate-3 @max-3xl:w-[150px] transition-transform duration-300 hover:scale-[1.03] hover:rotate-0"
      >
        <img
          src={asset('resume-preview.webp')}
          alt=""
          className="w-full rounded-xl shadow-[0_30px_70px_rgb(0_0_0/0.6)]"
        />
        <span className="absolute -right-6 -bottom-6 grid size-20 place-items-center rounded-full bg-signal text-ink shadow-[0_12px_30px_rgb(0_0_0/0.45)] @max-3xl:-right-4 @max-3xl:-bottom-4 @max-3xl:size-12">
          <DownloadIcon className="size-9 @max-3xl:size-6" />
        </span>
      </a>
      <div className="text-left @max-3xl:flex @max-3xl:flex-col @max-3xl:items-center @max-3xl:text-center">
        <h3 className={TITLE}>Résumé</h3>
        <p className="mt-3 font-mono text-xl text-cream/50 @max-3xl:mt-2 @max-3xl:text-[11px]">Ibadatt_Aulakh_Resume.pdf</p>
        <a
          href={RESUME}
          download
          className={`mt-9 inline-flex items-center gap-4 ${BUTTON} px-10 py-5 text-2xl @max-3xl:mt-5 @max-3xl:gap-2.5 @max-3xl:px-6 @max-3xl:py-3 @max-3xl:text-sm`}
        >
          <DownloadIcon className="size-8 @max-3xl:size-5" />
          Download PDF
        </a>
        <p className={`mt-14 ${LABEL} @max-3xl:mt-7`}>Connect</p>
        <div className="mt-4 flex gap-5 @max-3xl:mt-3 @max-3xl:gap-3">
          {LINKS.map(({ name, href, logo }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={name}
              className="grid size-20 place-items-center rounded-lg border border-cream/20 transition hover:bg-cream hover:text-ink active:scale-95 @max-3xl:size-12"
            >
              <svg viewBox="0 0 24 24" aria-hidden className="size-9 @max-3xl:size-6" fill="currentColor">
                <path d={logo} />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

// Reel-1's shader gradient, in the site's colours and grainy like print.
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

function ComingSoon() {
  return (
    <>
      <GrainGradient
        className="absolute inset-0"
        colorBack="#0c0b0a"
        colors={['#ff5b1f', '#7a2408', '#3b2a1f']}
        shape="corners"
        softness={0.7}
        intensity={0.2}
        noise={0.4}
        speed={reducedMotion() ? 0 : 0.4}
      />
      <div className="relative flex flex-col items-center text-center">
        <h3 className={TITLE}>Something big</h3>
        <p className="font-serif text-8xl text-cream/80 italic @max-3xl:text-4xl">is coming soon.</p>
        <div aria-hidden className="mt-14 h-1.5 w-[420px] overflow-hidden rounded-full bg-cream/15 @max-3xl:mt-8 @max-3xl:h-1 @max-3xl:w-[200px]">
          <span className="loading-bar block h-full w-1/3 rounded-full bg-cream/80" />
        </div>
      </div>
    </>
  )
}

/**
 * A Dock icon: a line drawing on a graphite tile, the same for every slide
 * (like macOS's dark icons), so the Dock reads as one set.
 */
function Glyph({ children }: { children: ReactNode }) {
  return (
    <span className="grid size-full place-items-center rounded-[22%] bg-[linear-gradient(#35312c,#191715)] shadow-[inset_0_0_0_1.5px_rgb(239_233_223/0.12)]">
      <svg
        viewBox="0 0 24 24"
        className="size-[54%]"
        fill="none"
        stroke="var(--color-cream)"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </span>
  )
}

// The laptop display's slides, in order, with their Dock icons.
export const SLIDES: Slide[] = [
  {
    label: 'About me',
    icon: (
      <Glyph>
        <circle cx="12" cy="8.5" r="3.75" />
        <path d="M4.5 20.5c.9-3.9 3.8-6 7.5-6s6.6 2.1 7.5 6" />
      </Glyph>
    ),
    content: <Profile />,
  },
  {
    label: 'Experience',
    icon: (
      <Glyph>
        <rect x="3" y="7" width="18" height="13" rx="2.5" />
        <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12.5h18" />
      </Glyph>
    ),
    content: <WhatIDo />,
  },
  {
    label: 'Rep Nation',
    icon: (
      <Glyph>
        <path d="M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11" />
      </Glyph>
    ),
    content: <RepNation />,
  },
  {
    label: 'Education',
    icon: (
      <Glyph>
        <path d="M2.5 9.5 12 5l9.5 4.5L12 14z" />
        <path d="M6.5 11.8v4.4c0 1.4 2.5 2.8 5.5 2.8s5.5-1.4 5.5-2.8v-4.4M21.5 9.5v5" />
      </Glyph>
    ),
    content: <Education />,
  },
  {
    label: 'Résumé',
    icon: (
      <Glyph>
        <path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 6 20V4a.5.5 0 0 1 .5-.5z" />
        <path d="M14 3.5V8h4M9 12h6M9 15h6M9 18h3.5" />
      </Glyph>
    ),
    content: <Resume />,
  },
  {
    label: 'Coming soon',
    icon: (
      // A voice's waveform: what's coming is a voice assistant.
      <Glyph>
        <path d="M4 10v4M8 6.5v11M12 3.5v17M16 7.5v9M20 10.5v3" />
      </Glyph>
    ),
    content: <ComingSoon />,
  },
]

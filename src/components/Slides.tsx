import { useRef, useState, type FormEvent, type ReactNode } from 'react'
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

function Profile() {
  const [flipped, setFlipped] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle')
  const [sentNotice, setSentNotice] = useState(false)
  const email = useRef<HTMLInputElement>(null)

  const flip = (toForm: boolean) => {
    setFlipped(toForm)
    // Ready to type once the card has turned.
    if (toForm) setTimeout(() => email.current?.focus({ preventScroll: true }), 700)
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
        // A macOS-style notification that slides in, then away on its own.
        <div
          role="status"
          onAnimationEnd={() => setSentNotice(false)}
          className="notify absolute top-12 right-12 flex w-[520px] items-center gap-6 rounded-[28px] border border-white/10 bg-[#2c2c2f]/90 p-6 text-left shadow-[0_24px_60px_rgb(0_0_0/0.5)] backdrop-blur-xl @max-3xl:top-3 @max-3xl:right-3 @max-3xl:left-3 @max-3xl:w-auto @max-3xl:gap-3 @max-3xl:rounded-2xl @max-3xl:p-3"
        >
          <img src={asset('profile.webp')} alt="" className="size-16 shrink-0 rounded-full object-cover @max-3xl:size-10" />
          <div>
            <p className="text-2xl font-semibold @max-3xl:text-base">Message sent</p>
            <p className="mt-1 text-xl text-white/60 @max-3xl:text-sm">Thanks! I’ll get back to you soon.</p>
          </div>
        </div>
      )}
      <div className="relative [perspective:2400px]">
        <div
          aria-hidden
          className={`absolute -inset-16 rounded-full bg-[radial-gradient(closest-side,rgb(255_255_255/0.13),transparent)] transition-opacity duration-500 ${flipped ? 'opacity-0' : ''}`}
        />
        {/* The coin: spins over and grows into a card, the form on its back. */}
        <div
          className={`relative transition-[width,height,transform] duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] [transform-style:preserve-3d] ${flipped ? 'h-[700px] w-[640px] [transform:rotateY(180deg)] @max-3xl:h-[470px] @max-3xl:w-[min(340px,100cqw-40px)]' : 'size-[332px] hover:[transform:rotateY(18deg)] @max-3xl:size-[212px]'}`}
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
          <form
            inert={!flipped}
            onSubmit={send}
            className="absolute inset-0 flex flex-col rounded-[40px] border border-white/10 bg-[#1e1e20] p-12 text-left shadow-[0_40px_90px_rgb(0_0_0/0.6)] [backface-visibility:hidden] [transform:rotateY(180deg)] @max-3xl:rounded-[28px] @max-3xl:p-6"
          >
            <button
              type="button"
              onClick={() => flip(false)}
              aria-label="Flip back to my photo"
              className="absolute top-9 right-9 grid size-14 cursor-pointer place-items-center rounded-full bg-white/8 text-white/70 transition-colors hover:bg-white/15 hover:text-white @max-3xl:top-4 @max-3xl:right-4 @max-3xl:size-10"
            >
              <svg viewBox="0 0 24 24" aria-hidden className="size-7 @max-3xl:size-5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <p className="text-5xl font-extrabold tracking-[-0.03em] @max-3xl:text-3xl">Let’s talk</p>
            <p className="mt-3 text-2xl text-white/55 @max-3xl:mt-1.5 @max-3xl:text-sm">Leave your email and a short message.</p>
            <input type="hidden" name="_subject" value="New message from your portfolio" />
            <label htmlFor="contact-email" className="mt-10 text-xl font-medium text-white/60 @max-3xl:mt-5 @max-3xl:text-sm">
              Email
            </label>
            <input
              ref={email}
              id="contact-email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="mt-3 h-16 rounded-2xl border border-white/12 bg-white/6 px-6 text-2xl outline-none placeholder:text-white/30 focus:border-white/40 @max-3xl:mt-1.5 @max-3xl:h-11 @max-3xl:rounded-xl @max-3xl:px-4 @max-3xl:text-base"
            />
            <label htmlFor="contact-message" className="mt-7 text-xl font-medium text-white/60 @max-3xl:mt-3.5 @max-3xl:text-sm">
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              required
              maxLength={500}
              rows={4}
              placeholder="Say hi…"
              className="mt-3 resize-none rounded-2xl border border-white/12 bg-white/6 px-6 py-5 text-2xl leading-snug outline-none placeholder:text-white/30 focus:border-white/40 @max-3xl:mt-1.5 @max-3xl:rounded-xl @max-3xl:px-4 @max-3xl:py-3 @max-3xl:text-base"
            />
            <button
              type="submit"
              disabled={status === 'sending'}
              className="mt-auto h-16 cursor-pointer rounded-full bg-white text-2xl font-semibold text-black transition active:scale-[0.97] disabled:cursor-default disabled:opacity-60 @max-3xl:h-11 @max-3xl:text-base"
            >
              {status === 'sending' ? 'Sending…' : 'Send'}
            </button>
            {status === 'error' && (
              <p role="alert" className="mt-4 text-center text-xl text-[#ff7a70] @max-3xl:mt-2 @max-3xl:text-sm">
                Couldn’t send that. Please try again.
              </p>
            )}
          </form>
        </div>
      </div>
      {/* Speech bubble, its tail pointing back at the photo; folds away while
          the form is showing so the card sits centred. */}
      <div
        className={`overflow-hidden pl-3 transition-[max-width,opacity,margin] duration-500 ${flipped ? 'ml-0 max-w-0 opacity-0 @max-3xl:hidden' : 'ml-11 max-w-[720px] @max-3xl:mt-7 @max-3xl:ml-0 @max-3xl:pt-3 @max-3xl:pl-0'}`}
      >
        <p className="relative rounded-[2rem] bg-[#38383c] px-10 py-6 text-6xl font-extrabold tracking-[-0.03em] whitespace-nowrap @max-3xl:rounded-2xl @max-3xl:px-6 @max-3xl:py-3 @max-3xl:text-3xl">
          <span
            aria-hidden
            className="absolute top-1/2 -left-3 size-8 -translate-y-1/2 rotate-45 rounded-sm bg-[#38383c] @max-3xl:top-0 @max-3xl:left-1/2 @max-3xl:size-5 @max-3xl:-translate-x-1/2"
          />
          Yup, that’s me!
        </p>
      </div>
    </div>
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
        <h3 className="text-8xl font-extrabold tracking-[-0.04em] @max-3xl:text-center @max-3xl:text-5xl">This is what I do</h3>
        {/* Both labels share one grid cell, so the button keeps its size as
            "Experience" swaps for "Click me" on hover. */}
        <button
          type="button"
          aria-expanded={showApps}
          aria-controls="experience-apps"
          onClick={() => setShowApps(true)}
          className="group grid cursor-pointer rounded-full border-2 border-white/25 bg-white/10 px-14 py-6 text-4xl font-semibold transition hover:bg-white active:scale-[0.97] hover:text-black focus-visible:bg-white focus-visible:text-black focus-visible:outline-none @max-3xl:px-9 @max-3xl:py-3.5 @max-3xl:text-xl"
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
            className={`app-pop absolute right-12 bottom-12 flex cursor-pointer items-center gap-4 rounded-full border-2 border-white/25 bg-white/10 px-10 py-5 text-3xl font-semibold transition hover:bg-white active:scale-[0.97] hover:text-black focus-visible:bg-white focus-visible:text-black focus-visible:outline-none @max-3xl:right-4 @max-3xl:bottom-4 @max-3xl:gap-2 @max-3xl:px-5 @max-3xl:py-2.5 @max-3xl:text-base ${opened ? 'invisible' : ''}`}
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
    <div className="flex w-[1000px] flex-col items-center text-center @max-3xl:w-full">
      <p className="text-2xl font-medium tracking-[0.3em] text-white/45 uppercase @max-3xl:text-xs">Founder</p>
      <h3 className="mt-3 text-8xl font-extrabold tracking-[-0.04em] @max-3xl:mt-2 @max-3xl:text-5xl">Rep Nation</h3>
      <p className="mt-5 text-4xl leading-snug text-white/70 @max-3xl:mt-3 @max-3xl:text-lg">
        An iOS app for fitness freaks that brings coaches and their clients together.
      </p>
      <div className="mt-12 grid w-full grid-cols-2 gap-6 text-left @max-3xl:mt-6 @max-3xl:grid-cols-1 @max-3xl:gap-3">
        {(['coaches', 'clients'] as const).map((who) => (
          <div key={who} className="rounded-3xl border border-white/10 bg-white/6 px-9 py-7 @max-3xl:rounded-2xl @max-3xl:px-5 @max-3xl:py-4">
            <p className="text-xl font-medium tracking-[0.2em] text-white/45 uppercase @max-3xl:text-[11px]">For {who}</p>
            <ul className="mt-4 flex flex-col gap-3 text-3xl @max-3xl:mt-2 @max-3xl:gap-1 @max-3xl:text-base">
              {REP_NATION[who].map((item) => (
                <li key={item} className="flex items-center gap-4 @max-3xl:gap-2.5">
                  <span aria-hidden className="size-2.5 shrink-0 rounded-full bg-white/50 @max-3xl:size-1.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <ul aria-label="Built with" className="mt-10 flex flex-wrap justify-center gap-3 @max-3xl:mt-5 @max-3xl:gap-1.5">
        {REP_NATION.stack.map((tool) => (
          <li key={tool} className="rounded-full border border-white/12 bg-white/6 px-5 py-2 text-xl text-white/80 @max-3xl:px-3 @max-3xl:py-1 @max-3xl:text-xs">
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
      <h3 className="text-8xl font-extrabold tracking-[-0.04em] @max-3xl:text-5xl">Education</h3>
      <div className="mt-14 flex items-center gap-10 rounded-3xl border border-white/10 bg-white/6 py-8 pr-14 pl-8 @max-3xl:mt-8 @max-3xl:flex-col @max-3xl:gap-4 @max-3xl:p-6 @max-3xl:text-center">
        <img src={asset('ufv.webp')} alt="UFV logo" className="size-36 shrink-0 rounded-[22%] @max-3xl:size-20" />
        <div>
          <p className="text-4xl font-bold @max-3xl:text-xl">University of the Fraser Valley</p>
          <p className="mt-2 text-3xl text-white/75 @max-3xl:mt-1 @max-3xl:text-base">Bachelor’s degree, Computer Information Systems</p>
          <p className="mt-4 text-2xl tracking-wide text-white/45 @max-3xl:mt-2 @max-3xl:text-sm">Fall 2021 – Winter 2025</p>
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
        <span className="absolute -right-6 -bottom-6 grid size-20 place-items-center rounded-full bg-white text-black shadow-[0_12px_30px_rgb(0_0_0/0.45)] @max-3xl:-right-4 @max-3xl:-bottom-4 @max-3xl:size-12">
          <DownloadIcon className="size-9 @max-3xl:size-6" />
        </span>
      </a>
      <div className="text-left @max-3xl:flex @max-3xl:flex-col @max-3xl:items-center @max-3xl:text-center">
        <h3 className="text-8xl font-extrabold tracking-[-0.04em] @max-3xl:text-5xl">Résumé</h3>
        <p className="mt-3 text-2xl text-white/50 @max-3xl:mt-2 @max-3xl:text-sm">Ibadatt_Aulakh_Resume.pdf</p>
        <a
          href={RESUME}
          download
          className="mt-9 inline-flex items-center gap-4 rounded-full bg-white px-10 py-5 text-3xl font-semibold text-black transition hover:opacity-85 active:scale-[0.97] @max-3xl:mt-5 @max-3xl:gap-2.5 @max-3xl:px-6 @max-3xl:py-3 @max-3xl:text-lg"
        >
          <DownloadIcon className="size-8 @max-3xl:size-5" />
          Download PDF
        </a>
        <p className="mt-14 text-xl font-medium tracking-[0.2em] text-white/45 uppercase @max-3xl:mt-7 @max-3xl:text-xs">Connect</p>
        <div className="mt-4 flex gap-5 @max-3xl:mt-3 @max-3xl:gap-3">
          {LINKS.map(({ name, href, logo }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={name}
              className="grid size-20 place-items-center rounded-full border border-white/12 bg-white/8 transition hover:bg-white hover:text-black active:scale-95 @max-3xl:size-12"
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

function ComingSoon() {
  return (
    <div className="flex flex-col items-center text-center">
      <h3 className="shimmer text-8xl font-extrabold tracking-[-0.04em] @max-3xl:text-5xl">Something big</h3>
      <p className="text-8xl font-extrabold tracking-[-0.04em] text-white/35 @max-3xl:text-4xl">is coming soon.</p>
      <div aria-hidden className="mt-14 h-2 w-[420px] overflow-hidden rounded-full bg-white/10 @max-3xl:mt-8 @max-3xl:h-1.5 @max-3xl:w-[200px]">
        <span className="loading-bar block h-full w-1/3 rounded-full bg-white/70" />
      </div>
    </div>
  )
}

/** An app-icon tile for the Dock: a line drawing on a coloured background. */
function Glyph({ bg, ink = 'white', children }: { bg: string; ink?: string; children: ReactNode }) {
  return (
    <span className="grid size-full place-items-center" style={{ background: bg }}>
      <svg
        viewBox="0 0 24 24"
        className="size-[58%]"
        fill="none"
        stroke={ink}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </span>
  )
}

const photo = (src: string) => <img src={src} alt="" className="size-full object-cover" />

// The laptop display's slides, in order, with their Dock icons.
export const SLIDES: Slide[] = [
  { label: 'About me', icon: photo(asset('profile.webp')), content: <Profile /> },
  {
    label: 'Experience',
    icon: (
      <Glyph bg="linear-gradient(#5aa9ff, #1f6fe5)">
        <rect x="3" y="7" width="18" height="13" rx="2.5" />
        <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12.5h18" />
      </Glyph>
    ),
    content: <WhatIDo />,
  },
  {
    label: 'Rep Nation',
    icon: (
      <Glyph bg="linear-gradient(#ffa24c, #ff4d5a)">
        <path d="M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11" />
      </Glyph>
    ),
    content: <RepNation />,
  },
  { label: 'Education', icon: photo(asset('ufv.webp')), content: <Education /> },
  {
    label: 'Résumé',
    icon: (
      <Glyph bg="linear-gradient(#ffffff, #dcdce0)" ink="#3a3a3c">
        <path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 6 20V4a.5.5 0 0 1 .5-.5z" />
        <path d="M14 3.5V8h4M9 12h6M9 15h6M9 18h3.5" />
      </Glyph>
    ),
    content: <Resume />,
  },
  {
    label: 'Coming soon',
    icon: (
      <Glyph bg="linear-gradient(#b36bff, #5b5bf6)">
        <path d="M11 3.5l1.9 5.1 5.1 1.9-5.1 1.9-1.9 5.1-1.9-5.1L4 10.5l5.1-1.9z" />
        <path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
      </Glyph>
    ),
    content: <ComingSoon />,
  },
]

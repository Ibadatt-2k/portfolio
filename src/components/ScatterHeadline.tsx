import { Fragment, useMemo, type CSSProperties } from 'react'

export type Part = { text: string; muted?: boolean }

type Props = {
  as: 'h1' | 'h2'
  parts: Part[]
  /**
   * Progress windows in which letters rise from below into place (enter) and
   * scatter up and away (exit); each letter picks a random start inside them.
   * Without enter the headline starts in place; without exit it stays.
   */
  enter?: [number, number]
  exit?: [number, number]
  className?: string
}

// Furthest a letter travels: ±x vw sideways, y vh vertically, ±r degrees of spin.
const SPREAD = {
  in: { x: 20, y: [40, 90], r: 120 },
  out: { x: 30, y: [70, 140], r: 240 },
}

const between = (min: number, max: number) => min + Math.random() * (max - min)

export default function ScatterHeadline({ as: Tag, parts, enter, exit, className = '' }: Props) {
  const words = useMemo(() => {
    const { in: si, out: so } = SPREAD
    return parts.flatMap(({ text, muted }) =>
      text.split(' ').flatMap((word) =>
        // Allow a line break after "/" in long compounds like "Developer/DevOps".
        word.split(/(?<=\/)/).map((piece) => ({
          muted,
          joined: piece.endsWith('/'),
          letters: [...piece].map((char) => ({
            char,
            style: {
              '--in': enter ? between(...enter) : -1, // -1: already in place
              '--xi': between(-si.x, si.x),
              '--yi': between(si.y[0], si.y[1]),
              '--ri': between(-si.r, si.r),
              '--out': exit ? between(...exit) : 1e3, // 1e3: never leaves
              '--xo': between(-so.x, so.x),
              '--yo': between(so.y[0], so.y[1]),
              '--ro': between(-so.r, so.r),
            } as CSSProperties,
          })),
        })),
      ),
    )
  }, [parts, enter, exit])

  return (
    <Tag
      className={`text-center text-[length:clamp(2.75rem,8.5vw,10rem)] leading-[0.95] font-extrabold tracking-[-0.04em] text-balance [word-spacing:0.1em] ${className}`}
    >
      <span className="sr-only">{parts.map((p) => p.text).join(' ')}</span>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span
            aria-hidden
            className={`inline-block whitespace-nowrap ${word.muted ? 'text-white/55' : ''}`}
          >
            {word.letters.map((letter, j) => (
              <span key={j} className="letter" style={letter.style}>
                {letter.char}
              </span>
            ))}
          </span>
          {i < words.length - 1 && (word.joined ? <wbr /> : ' ')}
        </Fragment>
      ))}
    </Tag>
  )
}

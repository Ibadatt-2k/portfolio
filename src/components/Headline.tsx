import { Fragment, type Ref } from 'react'

/** A run of words styled together (its own font, size, colour or line). */
export type Part = { text: string; className?: string }

type Props = {
  as: 'h1' | 'h2' | 'p'
  parts: Part[]
  className?: string
  ref?: Ref<HTMLHeadingElement & HTMLParagraphElement>
}

/**
 * A headline set a letter per span, so each letter can hop under the mouse
 * and Dust can picture them all to turn to dust. Screen readers get the
 * plain text.
 */
export default function Headline({ as: Tag, parts, className = '', ref }: Props) {
  return (
    <Tag ref={ref} className={className}>
      <span className="sr-only">{parts.map((p) => p.text).join(' ')}</span>
      {parts.map(({ text, className }, i) => (
        <Fragment key={i}>
          <span aria-hidden className={className}>
            {text.split(' ').map((word, j, words) => (
              <Fragment key={j}>
                {/* A line may break after "/" in long compounds like "Developer/DevOps". */}
                {word.split(/(?<=\/)/).map((piece, k, pieces) => (
                  <Fragment key={k}>
                    <span className="inline-block whitespace-nowrap">
                      {[...piece].map((char, l) => (
                        <span key={l} className="letter">
                          {char}
                        </span>
                      ))}
                    </span>
                    {k < pieces.length - 1 && <wbr />}
                  </Fragment>
                ))}
                {j < words.length - 1 && ' '}
              </Fragment>
            ))}
          </span>
          {i < parts.length - 1 && ' '}
        </Fragment>
      ))}
    </Tag>
  )
}

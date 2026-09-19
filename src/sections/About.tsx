import { useRef } from 'react';
import { useScroll } from 'framer-motion';
import WordsPullUpMultiStyle from '../components/WordsPullUpMultiStyle';
import AnimatedLetter from '../components/AnimatedLetter';

const BODY_TEXT =
  'Over the last seven years, I have worked with Parallax, a Berlin-based production house that crafts cinema, series, and Noir Studio in Paris. Together, we have created work that has earned international acclaim at several major festivals.';

export default function About() {
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: bodyRef, offset: ['start 0.8', 'end 0.2'] });
  const chars = BODY_TEXT.split('');

  return (
    <section className="bg-black px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-6xl rounded-2xl bg-[#101010] px-6 py-16 text-center sm:px-10 md:rounded-[2rem] md:py-24">
        <p className="mb-6 text-[10px] text-primary sm:text-xs md:mb-8">Visual arts</p>

        <WordsPullUpMultiStyle
          segments={[
            { text: 'I am Marcus Chen,', className: 'font-normal' },
            { text: 'a self-taught director.', className: 'italic font-serif' },
            {
              text: 'I have skills in color grading, visual effects, and narrative design.',
              className: 'font-normal',
            },
          ]}
          className="mx-auto max-w-3xl text-3xl leading-[0.95] sm:text-4xl sm:leading-[0.9] md:text-5xl lg:text-6xl xl:text-7xl"
          style={{ color: '#E1E0CC' }}
        />

        <p
          ref={bodyRef}
          className="mx-auto mt-10 max-w-2xl text-xs text-[#DEDBC8] sm:text-sm md:mt-14 md:text-base"
        >
          {chars.map((char, i) => {
            const charProgress = i / chars.length;
            return (
              <AnimatedLetter
                key={i}
                char={char}
                progress={scrollYProgress}
                range={[charProgress - 0.1, charProgress + 0.05]}
              />
            );
          })}
        </p>
      </div>
    </section>
  );
}

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import WordsPullUpMultiStyle from '../components/WordsPullUpMultiStyle';

const CARD_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4';

interface FeatureCard {
  number: string;
  title: string;
  icon: string;
  items: string[];
}

const FEATURE_CARDS: FeatureCard[] = [
  {
    number: '01',
    title: 'Project Storyboard.',
    icon: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171918_4a5edc79-d78f-4637-ac8b-53c43c220606.png&w=1280&q=85',
    items: [
      'Plan every shot with drag-and-drop frames.',
      'Attach mood boards and references to each scene.',
      'Share annotated boards with your whole crew.',
      'Export presentation-ready decks in one click.',
    ],
  },
  {
    number: '02',
    title: 'Smart Critiques.',
    icon: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171741_ed9845ab-f5b2-4018-8ce7-07cc01823522.png&w=1280&q=85',
    items: [
      'AI analysis of composition, color and pacing.',
      'Creative notes that read like a mentor’s feedback.',
      'Integrations with the tools you already use.',
    ],
  },
  {
    number: '03',
    title: 'Immersion Capsule.',
    icon: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171809_f56666dc-c099-4778-ad82-9ad4f209567b.png&w=1280&q=85',
    items: [
      'Silence notifications while you’re in the flow.',
      'Ambient soundscapes tuned for deep focus.',
      'Schedule syncing that protects your creative hours.',
    ],
  },
];

const cardClassName = 'relative flex min-h-[360px] overflow-hidden rounded-2xl lg:min-h-0';

export default function Features() {
  const gridRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(gridRef, { once: true, margin: '-100px' });

  const cardMotion = (index: number) => ({
    initial: { opacity: 0, scale: 0.95 },
    animate: isInView ? { opacity: 1, scale: 1 } : {},
    transition: { duration: 0.8, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] },
  });

  return (
    <section className="relative min-h-screen overflow-hidden bg-black px-4 py-16 sm:px-6 md:py-24">
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.15]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col items-center text-center md:mb-16">
          <WordsPullUpMultiStyle
            segments={[{ text: 'Studio-grade workflows for visionary creators.' }]}
            className="text-xl font-normal sm:text-2xl md:text-3xl lg:text-4xl"
            style={{ color: '#E1E0CC' }}
          />
          <WordsPullUpMultiStyle
            segments={[{ text: 'Built for pure vision. Powered by art.', className: 'text-gray-500' }]}
            className="text-xl font-normal sm:text-2xl md:text-3xl lg:text-4xl"
          />
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-1 gap-3 sm:gap-2 md:grid-cols-2 md:gap-1 lg:h-[480px] lg:grid-cols-4"
        >
          <motion.div className={cardClassName} {...cardMotion(0)}>
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={CARD_VIDEO}
              autoPlay
              loop
              muted
              playsInline
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
            <p className="relative mt-auto p-5 text-lg sm:p-6 sm:text-xl" style={{ color: '#E1E0CC' }}>
              Your creative canvas.
            </p>
          </motion.div>

          {FEATURE_CARDS.map((card, i) => (
            <motion.div
              key={card.number}
              className={`${cardClassName} flex-col bg-[#212121] p-5 sm:p-6`}
              {...cardMotion(i + 1)}
            >
              <img src={card.icon} alt="" className="h-10 w-10 rounded-lg object-cover sm:h-12 sm:w-12" />

              <div className="mt-8 flex items-baseline justify-between gap-4">
                <h3 className="text-lg sm:text-xl" style={{ color: '#E1E0CC' }}>
                  {card.title}
                </h3>
                <span className="text-xs text-gray-500 sm:text-sm">{card.number}</span>
              </div>

              <ul className="mt-5 flex flex-col gap-3">
                {card.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-gray-400 sm:text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>

              <a
                href="#"
                className="mt-auto inline-flex items-center gap-1.5 self-start pt-8 text-sm text-primary transition-opacity hover:opacity-70"
              >
                Learn more
                <ArrowRight className="h-4 w-4 -rotate-45" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

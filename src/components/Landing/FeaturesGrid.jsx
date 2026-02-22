// ──────────────────────────────────────────
// FeaturesGrid — smooth SVG stroke-draw icons + silky card flip
// ──────────────────────────────────────────
import { memo, useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ScrollReveal from './ScrollReveal';

/* ── Inline SVG icon paths ── */
const iconPaths = {
  Brain: (
    <>
      <path d="M12 2a4 4 0 0 0-4 4v1a4 4 0 0 0-4 4 4 4 0 0 0 2.5 3.7A4 4 0 0 0 9 18h1" />
      <path d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1 4 4 4 4 0 0 1-2.5 3.7A4 4 0 0 1 15 18h-1" />
      <path d="M12 2v16" />
      <path d="M8 10h8" />
      <path d="M9 14h6" />
    </>
  ),
  Layers: (
    <>
      <path d="M12 2 2 7l10 5 10-5-10-5Z" />
      <path d="m2 17 10 5 10-5" />
      <path d="m2 12 10 5 10-5" />
    </>
  ),
  Database: (
    <>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14a9 3 0 0 0 18 0V5" />
      <path d="M3 12a9 3 0 0 0 18 0" />
    </>
  ),
  RefreshCw: (
    <>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </>
  ),
};

const features = [
  {
    iconKey: 'Brain',
    title: 'Smart RAG',
    desc: 'Self-correcting retrieval that grades, rewrites, and retries up to 6 times — adapting its strategy until it finds the right answer.',
    checklist: ['Auto-grades chunk relevance', 'Query rewriting engine', 'Up to 6 retry cycles'],
    accent: 'from-mustard-500/20 to-mustard-500/5',
    strokeColor: '#D6C85C',
  },
  {
    iconKey: 'Layers',
    title: 'Multi-Namespace',
    desc: 'Three curated knowledge bases covering BS/ADP programs, MS/PhD research, and university rules & regulations.',
    checklist: ['BS & ADP programs', 'MS & PhD research', 'Rules & regulations'],
    accent: 'from-olive-400/20 to-olive-400/5',
    strokeColor: '#9CA356',
  },
  {
    iconKey: 'Database',
    title: 'Conversation Memory',
    desc: 'Redis-powered session memory retains context across your conversation — no need to repeat yourself.',
    checklist: ['Redis-powered sessions', 'Cross-turn context', 'Auto session expiry'],
    accent: 'from-blue-500/20 to-blue-500/5',
    strokeColor: '#60A5FA',
  },
  {
    iconKey: 'RefreshCw',
    title: 'Accurate Answers',
    desc: 'Every retrieved chunk is graded for relevance and reranked for precision — only the best information reaches you.',
    checklist: ['Relevance grading', 'Cross-encoder reranking', 'Citation-backed output'],
    accent: 'from-purple-500/20 to-purple-500/5',
    strokeColor: '#A78BFA',
  },
];

/* ── Stroke-draw SVG icon ── */
function StrokeDrawIcon({ iconKey, color, isVisible }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`w-5 h-5 stroke-draw-icon ${isVisible ? 'is-visible' : ''}`}
      style={{ '--path-length': 200, stroke: color }}
      aria-hidden="true"
    >
      {iconPaths[iconKey]}
    </svg>
  );
}

/* ── Feature card with smooth flip ── */
function FeatureCard({ f, index }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <ScrollReveal index={index} className="h-full">
      <div
        ref={ref}
        className="h-full"
        style={{ perspective: '1000px' }}
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
        onFocus={() => setIsFlipped(true)}
        onBlur={() => setIsFlipped(false)}
        tabIndex={0}
        role="button"
        aria-label={`${f.title} — hover to see details`}
      >
        <motion.div
          className="relative h-full"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18, mass: 0.6 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* ── Front ── */}
          <div
            className="relative w-full h-full min-h-[320px] group p-6 sm:p-7 rounded-2xl
                       border border-white/[0.06] bg-white/[0.015]
                       backdrop-blur-sm flex flex-col"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <motion.div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5
                          bg-gradient-to-br ${f.accent} border border-white/[0.06]`}
              whileHover={{ scale: 1.1, transition: { type: 'spring', stiffness: 300 } }}
            >
              <StrokeDrawIcon iconKey={f.iconKey} color={f.strokeColor} isVisible={isVisible} />
            </motion.div>

            <h3 className="font-display text-lg font-semibold uppercase text-cream tracking-wide mb-2">
              {f.title}
            </h3>
            <p className="text-sm text-ash leading-relaxed">
              {f.desc}
            </p>

            <div className="mt-auto pt-6 text-2xs text-mist/30">
              Hover for details →
            </div>
          </div>

          {/* ── Back (checklist) ── */}
          <div
            className="absolute inset-0 p-6 sm:p-7 rounded-2xl
                       border border-mustard-500/20 bg-navy-800/95
                       backdrop-blur-sm flex flex-col justify-center"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <h3 className="font-display text-lg font-semibold uppercase text-mustard-400 tracking-wide mb-5">
              {f.title}
            </h3>
            <ul className="space-y-3.5">
              {f.checklist.map((item, i) => (
                <motion.li
                  key={i}
                  className="flex items-center gap-3 text-sm text-cream"
                  initial={{ opacity: 0, x: -10 }}
                  animate={isFlipped ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                  transition={{ delay: 0.15 + i * 0.08, type: 'spring', stiffness: 150 }}
                >
                  <svg viewBox="0 0 16 16" className="w-4 h-4 shrink-0" style={{ color: f.strokeColor }}>
                    <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M5 8l2 2 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </ScrollReveal>
  );
}

function FeaturesGrid() {
  return (
    <section id="features" className="relative py-28 sm:py-36">
      <div className="absolute inset-0 bg-navy-950" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px]
                   rounded-full blur-[160px] opacity-60"
        style={{ background: 'radial-gradient(circle, rgba(200,185,74,0.04) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8">
        <ScrollReveal className="text-center mb-16">
          <span className="text-2xs font-medium text-mustard-600 tracking-[0.25em] uppercase block mb-3">
            Capabilities
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase text-cream tracking-tight mb-4">
            Intelligent by Design
          </h2>
          <p className="text-base text-ash max-w-2xl mx-auto leading-relaxed">
            Every component of our pipeline is engineered for accuracy,
            speed, and reliability — from retrieval to generation.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <FeatureCard key={f.title} f={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(FeaturesGrid);

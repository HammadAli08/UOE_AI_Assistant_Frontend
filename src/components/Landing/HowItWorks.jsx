// ──────────────────────────────────────────
// HowItWorks — smooth connected SVG path + spring pop-in
// ──────────────────────────────────────────
import { memo, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const steps = [
  {
    num: '01',
    title: 'Ask a Question',
    desc: 'Type your academic query — admissions, courses, fees, regulations. Our AI enhances your question for optimal retrieval.',
    iconPath: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  },
  {
    num: '02',
    title: 'AI Retrieves & Grades',
    desc: 'The RAG pipeline searches curated university documents, grades each chunk for relevance, and self-corrects if results are weak.',
    iconPath: 'M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM21 21l-4.35-4.35',
  },
  {
    num: '03',
    title: 'Get Accurate Answer',
    desc: 'Top-ranked passages are synthesized into a clear, cited response — grounded in official university documentation.',
    iconPath: 'M12 3l1.5 4.5H18l-3.5 2.5L16 14.5 12 11.5 8 14.5l1.5-4.5L6 7.5h4.5z',
  },
];

/* ── Connected SVG path that draws on scroll ── */
function ConnectorPath({ scrollProgress }) {
  const rawLength = useTransform(scrollProgress, [0.1, 0.6], [0, 1]);
  const pathLength = useSpring(rawLength, { stiffness: 40, damping: 15, mass: 0.8 });

  return (
    <svg
      className="hidden md:block absolute top-0 left-0 w-full h-full pointer-events-none"
      viewBox="0 0 1000 120"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ zIndex: 0 }}
    >
      <defs>
        <linearGradient id="connector-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(200,185,74,0.6)" />
          <stop offset="50%" stopColor="rgba(200,185,74,0.3)" />
          <stop offset="100%" stopColor="rgba(200,185,74,0.6)" />
        </linearGradient>
      </defs>
      {/* Background track */}
      <path
        d="M 80 60 C 250 60 250 60 500 60 C 750 60 750 60 920 60"
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="2"
      />
      {/* Animated overlay */}
      <motion.path
        d="M 80 60 C 250 60 250 60 500 60 C 750 60 750 60 920 60"
        fill="none"
        stroke="url(#connector-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ pathLength }}
      />
      {/* Step dots — spring-animated */}
      {[80, 500, 920].map((cx, i) => (
        <motion.circle
          key={i}
          cx={cx}
          cy="60"
          r="6"
          fill="#070B14"
          stroke="#C8B94A"
          strokeWidth="2"
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 12,
            delay: 0.2 + i * 0.25,
          }}
        />
      ))}
    </svg>
  );
}

/* ── Step card with smooth spring ── */
function StepCard({ step, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        type: 'spring',
        stiffness: 80,
        damping: 16,
        mass: 0.7,
        delay: index * 0.15,
      }}
      whileHover={{
        y: -8,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      }}
      className="relative group"
    >
      <div
        className="relative p-7 sm:p-8 rounded-2xl border border-white/[0.06] bg-white/[0.015]
                   backdrop-blur-sm hover:border-mustard-500/20 hover:bg-white/[0.03]
                   transition-[border-color,background-color] duration-700 h-full"
      >
        {/* Step number + icon */}
        <div className="flex items-center gap-4 mb-5">
          <span className="text-3xl font-display font-bold text-mustard-500/30">{step.num}</span>
          <motion.div
            className="w-11 h-11 rounded-xl flex items-center justify-center
                       bg-gradient-to-br from-mustard-500/15 to-mustard-500/5
                       border border-white/[0.06]"
            whileHover={{ scale: 1.1, rotate: 5, transition: { type: 'spring', stiffness: 300 } }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path
                d={step.iconPath}
                fill="none"
                stroke="#C8B94A"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </div>

        {/* Content */}
        <h3 className="font-display text-lg font-semibold uppercase text-cream tracking-wide mb-2">
          {step.title}
        </h3>
        <p className="text-sm text-ash leading-relaxed">
          {step.desc}
        </p>
      </div>
    </motion.div>
  );
}

function HowItWorks() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  return (
    <section id="how-it-works" ref={sectionRef} className="relative py-28 sm:py-36 overflow-hidden">
      <div className="absolute inset-0 bg-navy-950" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900/20 via-transparent to-navy-900/20" />

      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 80, damping: 18 }}
          className="text-center mb-20"
        >
          <span className="text-2xs font-medium text-mustard-600 tracking-[0.25em] uppercase block mb-3">
            Process
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase text-cream tracking-tight mb-4">
            How It Works
          </h2>
          <p className="text-base text-ash max-w-xl mx-auto leading-relaxed">
            Three simple steps from question to answer — powered by cutting-edge AI.
          </p>
        </motion.div>

        <div className="relative">
          <ConnectorPath scrollProgress={scrollYProgress} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative z-10">
            {steps.map((step, i) => (
              <StepCard key={step.num} step={step} index={i} />
            ))}
          </div>
        </div>

        <div aria-live="polite" className="sr-only">
          Three step process: 1. Ask a Question, 2. AI Retrieves and Grades, 3. Get Accurate Answer.
        </div>
      </div>
    </section>
  );
}

export default memo(HowItWorks);

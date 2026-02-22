// ──────────────────────────────────────────
// KnowledgeBases — silky glass cards with depth + micro-tooltips
// ──────────────────────────────────────────
import { memo } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useChatStore from '@/store/useChatStore';
import { NAMESPACES, SUGGESTIONS } from '@/constants';
import ScrollReveal from './ScrollReveal';

const nsDescriptions = {
  'bs-adp': 'Comprehensive information about Bachelor of Science and Associate Degree programs — admissions, fee structures, course outlines, and program durations.',
  'ms-phd': 'Everything about postgraduate research programs — MS/MPhil eligibility, PhD requirements, credit hours, and research guidelines.',
  'rules': 'Official university policies — attendance rules, grading systems, examination procedures, and discipline guidelines.',
};

function KnowledgeCard({ ns, index }) {
  const navigate = useNavigate();
  const setNamespace = useChatStore((s) => s.setNamespace);

  const handleExplore = () => {
    setNamespace(ns.id);
    navigate('/chat');
  };

  const tooltipQuery = (SUGGESTIONS[ns.id] || [])[0] || '';

  // Spring-smoothed hover lift
  const y = useMotionValue(0);
  const springY = useSpring(y, { stiffness: 200, damping: 25 });

  // Dynamic shadow tied to lift
  const shadow = useTransform(
    springY,
    [0, -10],
    [
      '0 4px 20px rgba(0,0,0,0.2)',
      '0 24px 60px -12px rgba(0,0,0,0.4), 0 0 30px rgba(200,185,74,0.06)',
    ]
  );

  return (
    <ScrollReveal index={index}>
      <motion.div
        className="group relative h-full"
        onHoverStart={() => y.set(-10)}
        onHoverEnd={() => y.set(0)}
        style={{ y: springY }}
      >
        {/* Glass depth layer */}
        <motion.div
          className="glass-depth h-full"
          style={{ boxShadow: shadow }}
        >
          <div
            className="relative h-full p-7 rounded-2xl
                       border border-white/[0.06] bg-white/[0.015] backdrop-blur-sm
                       group-hover:border-mustard-500/15
                       transition-[border-color] duration-700 flex flex-col overflow-hidden"
          >
            {/* Micro-tooltip */}
            <div className="micro-tooltip max-w-[250px] whitespace-normal text-center">
              💡 Try: &ldquo;{tooltipQuery.slice(0, 50)}…&rdquo;
            </div>

            {/* Icon & title */}
            <motion.div
              className="flex items-center gap-4 mb-4"
              whileHover={{ x: 3, transition: { type: 'spring', stiffness: 200 } }}
            >
              <motion.span
                className="text-3xl"
                whileHover={{ scale: 1.2, rotate: 10, transition: { type: 'spring', stiffness: 300 } }}
              >
                {ns.icon}
              </motion.span>
              <h3 className="font-display text-lg font-semibold uppercase text-cream tracking-wide">
                {ns.label}
              </h3>
            </motion.div>

            {/* Description */}
            <p className="text-sm text-ash leading-relaxed mb-5 transition-transform duration-700 ease-out group-hover:-translate-y-1">
              {nsDescriptions[ns.id]}
            </p>

            {/* Sample questions */}
            <div className="flex-1 mb-6 transition-transform duration-700 ease-out group-hover:-translate-y-1.5">
              <p className="text-2xs text-mist uppercase tracking-[0.2em] mb-3">Popular Questions</p>
              <ul className="space-y-2">
                {(SUGGESTIONS[ns.id] || []).slice(0, 3).map((q) => (
                  <li key={q} className="text-xs text-ash/70 leading-relaxed pl-3 border-l border-white/[0.06]
                                         group-hover:border-mustard-500/20 transition-[border-color] duration-500">
                    {q}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <motion.button
              onClick={handleExplore}
              className="group/btn inline-flex items-center gap-2 text-sm font-medium text-mustard-500
                         hover:text-mustard-400 transition-colors duration-300
                         focus-visible:outline-2 focus-visible:outline-mustard-400"
              whileHover={{ x: 4, transition: { type: 'spring', stiffness: 300, damping: 15 } }}
            >
              <span>Explore {ns.label.split(' ')[0]}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </ScrollReveal>
  );
}

function KnowledgeBases() {
  return (
    <section id="knowledge-bases" className="relative py-28 sm:py-36">
      <div className="absolute inset-0 bg-navy-950" />
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px]
                   rounded-full blur-[160px] opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(140,147,64,0.06) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8">
        <ScrollReveal className="text-center mb-16">
          <span className="text-2xs font-medium text-mustard-600 tracking-[0.25em] uppercase block mb-3">
            Knowledge Bases
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase text-cream tracking-tight mb-4">
            Choose Your Domain
          </h2>
          <p className="text-base text-ash max-w-xl mx-auto leading-relaxed">
            Select a knowledge base to get focused, accurate answers from curated university documents.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {NAMESPACES.map((ns, i) => (
            <KnowledgeCard key={ns.id} ns={ns} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(KnowledgeBases);

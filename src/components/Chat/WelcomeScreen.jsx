// ──────────────────────────────────────────
// WelcomeScreen — dark cinematic welcome with suggestions
// ──────────────────────────────────────────
import { memo, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import useChatStore from '@/store/useChatStore';
import { SUGGESTIONS, NAMESPACES } from '@/constants';

function SuggestionCard({ q, i, onSuggestionClick }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay: i * 0.08 }}
      onMouseMove={handleMouseMove}
      onClick={() => onSuggestionClick(q)}
      className="group relative text-left px-5 py-4 rounded-xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-sm text-sm text-ash leading-relaxed transition-colors overflow-hidden"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              180px circle at ${mouseX}px ${mouseY}px,
              rgba(200, 185, 74, 0.12),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative z-10 flex items-center group-hover:text-cream">
        <span className="inline-block w-0 group-hover:w-2 h-px bg-mustard-500/60 mr-0 group-hover:mr-2 transition-all duration-300 align-middle" />
        {q}
      </div>
    </motion.button>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function WelcomeScreen({ onSuggestionClick }) {
  const namespace = useChatStore((s) => s.namespace);
  const suggestions = SUGGESTIONS[namespace] || SUGGESTIONS['bs-adp'];
  const currentNs = NAMESPACES.find((n) => n.id === namespace);
  const greeting = useMemo(() => getGreeting(), []);

  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
      transition={{ duration: 0.4 }}
      className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative w-full h-full"
    >
      {/* Subtle ambient glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[420px] h-[260px]
                   rounded-full blur-[100px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(200,185,74,0.05) 0%, transparent 70%)' }}
      />

      {/* Floating logo */}
      <div className="relative w-24 h-24 rounded-2xl flex items-center justify-center mb-9 animate-float">
        <img src="/unnamed.jpg" alt="University of Education" className="w-full h-full object-cover rounded-2xl drop-shadow-[0_0_24px_rgba(200,185,74,0.1)]" />
        <div className="absolute inset-0 rounded-2xl bg-mustard-500/[0.04] blur-xl" />
      </div>

      {/* Time-based greeting */}
      <p className="text-sm text-mist/80 tracking-[0.2em] uppercase mb-3 animate-slide-up">
        {greeting}
      </p>

      {/* Headline */}
      <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight
                      text-cream text-center mb-4">
        HOW CAN I <span className="text-mustard-500">HELP?</span>
      </h2>

      {/* Namespace badge */}
      {currentNs && (
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                         border border-white/[0.06] bg-white/[0.02]
                         text-xs font-medium text-ash mb-12">
          {currentNs.icon} {currentNs.label}
        </span>
      )}

      {/* Suggestion cards */}
      <div className="w-full max-w-2xl">
        <p className="flex items-center gap-2 text-xs font-medium text-mist mb-5 justify-center uppercase tracking-[0.18em]">
          <Sparkles className="w-3.5 h-3.5 text-mustard-500/50" />
          Suggested Questions
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestions.map((q, i) => (
            <SuggestionCard key={i} q={q} i={i} onSuggestionClick={onSuggestionClick} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default memo(WelcomeScreen);

// ──────────────────────────────────────────
// SmartBadge — dark cinematic Smart RAG pipeline state
// ──────────────────────────────────────────
import { memo, useState, useRef, useEffect } from 'react';
import { Brain, ChevronDown, ChevronUp, RotateCw, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { SMART_RAG_STATES } from '@/constants';

function getState(smartInfo) {
  if (!smartInfo) return null;

  if (smartInfo.used_fallback) return SMART_RAG_STATES.FALLBACK;
  if (smartInfo.best_effort) return SMART_RAG_STATES.BEST_EFFORT;
  if (smartInfo.query_rewrites && smartInfo.query_rewrites.length > 0) return SMART_RAG_STATES.RETRY;
  return SMART_RAG_STATES.PASS;
}

const STATE_STYLES = {
  green: 'bg-green-500/10 text-green-400 border-green-500/20',
  amber: 'bg-mustard-500/10 text-mustard-400 border-mustard-500/20',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  red: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const STATE_ICONS = {
  green: CheckCircle,
  amber: RotateCw,
  blue: Info,
  red: AlertTriangle,
};

function SmartBadge({ smartInfo }) {
  const [expanded, setExpanded] = useState(false);
  const wrapperRef = useRef(null);
  const state = getState(smartInfo);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setExpanded(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!state) return null;

  const Icon = STATE_ICONS[state.color];

  return (
    <div className="relative inline-block" ref={wrapperRef}>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setExpanded(!expanded)}
        className={clsx(
          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-medium',
          'border transition-all duration-300',
          STATE_STYLES[state.color]
        )}
      >
        <Icon className="w-3 h-3" />
        <Brain className="w-3 h-3" />
        {state.label}
        {expanded ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronUp className="w-2.5 h-2.5" />}
      </motion.button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-3 rounded-xl 
                       bg-navy-800/95 backdrop-blur-md border border-white/[0.08] shadow-elevated
                       text-2xs space-y-1.5 z-[100] origin-[50%_100%] font-sans"
          >
            {/* Small arrow pointing down to the badge */}
            <div
              className="absolute -bottom-[5px] left-1/2 -translate-x-1/2
                         w-2.5 h-2.5 bg-navy-800/95 border-r border-b border-white/[0.08]
                         rotate-45 rounded-br-sm"
            />

            <p className="text-mist italic leading-relaxed relative z-10">{state.desc}</p>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-ash pt-2 border-t border-white/[0.06] mt-2 relative z-10">
              <span>Retrievals:</span>
              <span className="font-semibold text-cream text-right">{smartInfo.total_retrievals ?? '—'}</span>

              <span>Chunks graded:</span>
              <span className="font-semibold text-cream text-right">{smartInfo.total_chunks_graded ?? '—'}</span>

              <span>Relevant chunks:</span>
              <span className="font-semibold text-cream text-right">{smartInfo.final_relevant_chunks ?? '—'}</span>
            </div>

            {smartInfo.query_rewrites && smartInfo.query_rewrites.length > 0 && (
              <div className="pt-2 border-t border-white/[0.06] mt-2">
                <p className="font-medium text-ash mb-1">Rewrites:</p>
                <ol className="list-decimal pl-4 space-y-0.5 text-mist">
                  {smartInfo.query_rewrites.map((rw, i) => (
                    <li key={i} className="break-words">{rw}</li>
                  ))}
                </ol>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(SmartBadge);

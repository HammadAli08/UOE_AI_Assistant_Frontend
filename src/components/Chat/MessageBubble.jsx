// ──────────────────────────────────────────
// MessageBubble — dark cinematic message bubble with feedback
// ──────────────────────────────────────────
import { memo, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { User, Copy, Check, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';
import clsx from 'clsBadge from '@/componentsx';
import Smart/SmartRAG/SmartBadge';
import useChatStore from '@/store/useChatStore';
import { submitFeedback } from '@/utils/api';
import useChat from '@/hooks/useChat';

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackBurst, setFeedbackBurst] = useState(null); // 'up' | 'down' | null
  const [retrying, setRetrying] = useState(false);
  const hasSmartInfo = message.smartInfo != null;

  // Detect if this is an error message
  const isErrorMessage = !isUser && message.content.includes('Sorry, I encountered an error');

  const feedback = useChatStore((s) => s.feedbackMap[message.id]);
  const setFeedback = useChatStore((s) => s.setFeedback);
  const lastUserQuery = useChatStore((s) => s.lastUserQuery);
  const { send } = useChat();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  // Handle retry - resend the last user query
  const handleRetry = useCallback(async () => {
    if (retrying || !lastUserQuery) return;
    setRetrying(true);
    try {
      await send(lastUserQuery);
    } finally {
      setRetrying(false);
    }
  }, [retrying, lastUserQuery, send]);

  const handleFeedback = useCallback(async (type) => {
    if (feedbackLoading) return;

    // Toggle logic: click same = remove vote; click different = switch vote
    const newFeedback = feedback === type ? null : type;
    const score = newFeedback === 'up' ? 1 : 0; // API score (only used if not null)

    setFeedbackLoading(true);

    // Trigger burst only on positive/negative action (not removal)
    if (newFeedback) {
      setFeedbackBurst(type);
      setTimeout(() => setFeedbackBurst(null), 700); // Clear after animation
    }

    try {
      // Optimistic update
      setFeedback(message.id, newFeedback);

      if (message.runId && newFeedback) {
        await submitFeedback({ runId: message.runId, score });
      }
    } catch (err) {
      console.warn('Feedback submission failed:', err.message);
    } finally {
      setFeedbackLoading(false);
    }
  }, [feedback, feedbackLoading, message.id, message.runId, setFeedback]);

  // Generate 6 particles for the burst effect
  const renderParticles = (type) => {
    if (feedbackBurst !== type) return null;
    const colorClass = type === 'up' ? 'bg-emerald-400' : 'bg-rose-400';
    return Array.from({ length: 8 }).map((_, i) => {
      const angle = (i * 45 * Math.PI) / 180;
      const tx = Math.cos(angle) * 24; // Distance
      const ty = Math.sin(angle) * 24;
      return (
        <span
          key={i}
          className={clsx('particle', colorClass)}
          style={{ '--tx': `${tx}px`, '--ty': `${ty}px` }}
        />
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 15 : -15, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 25 }}
      className={clsx(
        'flex gap-2 px-2 sm:px-6 py-3',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {/* Avatar — assistant */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden
                        border border-mustard-500/20 mt-0.5">
          <img src="/unnamed.jpg" alt="UOE" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Bubble */}
      <div
        className={clsx(
          'max-w-[80vw] sm:max-w-[75%] lg:max-w-[60%] rounded-2xl relative transition-all duration-500',
          isUser
            ? 'bg-mustard-500/[0.12] border border-mustard-500/20 text-cream px-4 py-3 rounded-br-md'
            : 'bg-white/[0.025] border border-white/[0.06] px-4 py-3 rounded-bl-md',
          // Color bleed effect
          !isUser && feedback === 'up' && 'message-bubble-up',
          !isUser && feedback === 'down' && 'message-bubble-down'
        )}
      >
        {/* Content */}
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="message-content text-sm text-cream/85">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Bottom bar — assistant only */}
        {!isUser && (
          <div className="flex items-center gap-2.5 mt-3 pt-2.5 border-t border-white/[0.05]">
            {/* Smart RAG badge */}
            {hasSmartInfo && <SmartBadge smartInfo={message.smartInfo} />}

            {/* Retry button for error messages */}
            {isErrorMessage && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleRetry}
                disabled={retrying}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300',
                  retrying
                    ? 'bg-mustard-500/20 text-mustard-400/50 cursor-not-allowed'
                    : 'bg-mustard-500/15 text-mustard-400 hover:bg-mustard-500/25 hover:scale-105'
                )}
              >
                <RefreshCw className={clsx('w-3.5 h-3.5', retrying && 'animate-spin')} />
                <span>{retrying ? 'Retrying...' : 'Retry'}</span>
              </motion.button>
            )}

            <div className="flex-1" />

            {/* ── Feedback buttons (Staggered Reveal) ── */}
            <div className="flex items-center gap-1 stagger-in" style={{ animationDelay: '200ms' }}>
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => handleFeedback('up')}
                disabled={feedbackLoading}
                className={clsx(
                  'feedback-btn group relative p-1.5 rounded-lg transition-all duration-300',
                  feedback === 'up'
                    ? 'bg-emerald-500/15 text-emerald-400 feedback-active'
                    : 'text-mist/50 hover:text-emerald-400 hover:bg-emerald-500/[0.08]',
                  feedbackLoading && 'opacity-50 cursor-not-allowed',
                )}
              >
                <ThumbsUp
                  className={clsx(
                    'w-3.5 h-3.5 transition-transform duration-300',
                    feedback === 'up' && 'feedback-pop',
                  )}
                  fill={feedback === 'up' ? 'currentColor' : 'none'}
                  strokeWidth={feedback === 'up' ? 0 : 2}
                />
                {/* Particles */}
                {renderParticles('up')}

                {/* Ripple ring on active */}
                {feedback === 'up' && (
                  <span className="absolute inset-0 rounded-lg animate-feedback-ring
                                   border border-emerald-400/40" />
                )}
                {/* Tooltip */}
                <span className="micro-tooltip">
                  Helpful
                </span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => handleFeedback('down')}
                disabled={feedbackLoading}
                className={clsx(
                  'feedback-btn group relative p-1.5 rounded-lg transition-all duration-300',
                  feedback === 'down'
                    ? 'bg-rose-500/15 text-rose-400 feedback-active'
                    : 'text-mist/50 hover:text-rose-400 hover:bg-rose-500/[0.08]',
                  feedbackLoading && 'opacity-50 cursor-not-allowed',
                )}
              >
                <ThumbsDown
                  className={clsx(
                    'w-3.5 h-3.5 transition-transform duration-300',
                    feedback === 'down' && 'feedback-pop',
                  )}
                  fill={feedback === 'down' ? 'currentColor' : 'none'}
                  strokeWidth={feedback === 'down' ? 0 : 2}
                />
                {/* Particles */}
                {renderParticles('down')}

                {/* Ripple ring on active */}
                {feedback === 'down' && (
                  <span className="absolute inset-0 rounded-lg animate-feedback-ring
                                   border border-rose-400/40" />
                )}
                {/* Tooltip */}
                <span className="micro-tooltip">
                  Not helpful
                </span>
              </motion.button>
            </div>

            {/* Divider between feedback and copy */}
            <div className="w-px h-3 bg-white/[0.08]" />

            {/* Copy button */}
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleCopy}
              className={clsx(
                'group relative p-1.5 rounded-lg transition-all duration-300 stagger-in',
                copied
                  ? 'bg-mustard-500/15 text-mustard-400'
                  : 'text-mist/50 hover:text-cream hover:bg-white/[0.04]'
              )}
              style={{ animationDelay: '250ms' }}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 animate-feedback-pop" />
              ) : (
                <Copy className="w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110" />
              )}
              {/* Tooltip */}
              <span className="micro-tooltip">
                {copied ? 'Copied!' : 'Copy'}
              </span>
            </motion.button>

            {/* Timestamp */}
            <span className="text-2xs text-mist/60">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}

      </div>

      {/* Avatar — user */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08]
                        flex items-center justify-center mt-0.5">
          <User className="w-4 h-4 text-ash" />
        </div>
      )}
    </motion.div>
  );
}

export default memo(MessageBubble);

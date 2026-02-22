// ──────────────────────────────────────────
// MessageBubble — unified message bubble (streaming + final)
// Same DOM node throughout. No remount. No layout shift.
// ──────────────────────────────────────────
import { memo, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { User, Copy, Check, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import SmartBadge from '@/components/SmartRAG/SmartBadge';
import useChatStore from '@/store/useChatStore';
import { submitFeedback } from '@/utils/api';

function MessageBubble({ message, isStreaming = false, streamingContent = '' }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackBurst, setFeedbackBurst] = useState(null); // 'up' | 'down' | null
  const hasSmartInfo = message.smartInfo != null;

  // Choose the right content: streaming text when live, message.content when final
  const displayContent = isStreaming ? streamingContent : message.content;

  // Detect if this is an error message
  const isErrorMessage = !isUser && !isStreaming && message.content.includes('Sorry, I encountered an error');

  const feedback = useChatStore((s) => s.feedbackMap[message.id]);
  const setFeedback = useChatStore((s) => s.setFeedback);
  const lastUserQuery = useChatStore((s) => s.lastUserQuery);
  const setDraftInput = useChatStore((s) => s.setDraftInput);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  // Handle retry — populate the chat input with the last query
  const handleRetry = useCallback(() => {
    if (!lastUserQuery) return;
    setDraftInput(lastUserQuery);
  }, [lastUserQuery, setDraftInput]);

  const handleFeedback = useCallback(async (type) => {
    if (feedbackLoading) return;

    // Toggle logic: click same = remove vote; click different = switch vote
    const newFeedback = feedback === type ? null : type;
    const score = newFeedback === 'up' ? 1 : 0;

    setFeedbackLoading(true);

    // Trigger burst only on positive/negative action (not removal)
    if (newFeedback) {
      setFeedbackBurst(type);
      setTimeout(() => setFeedbackBurst(null), 700);
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

  // Generate 8 particles for the burst effect
  const renderParticles = (type) => {
    if (feedbackBurst !== type) return null;
    const colorClass = type === 'up' ? 'bg-emerald-400' : 'bg-rose-400';
    return Array.from({ length: 8 }).map((_, i) => {
      const angle = (i * 45 * Math.PI) / 180;
      const tx = Math.cos(angle) * 24;
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
    <div
      className={clsx(
        'flex gap-2 px-2 sm:px-6 py-3',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {/* Avatar — assistant */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden mt-0.5 border border-mustard-500/20">
          <img src="/unnamed.jpg" alt="UOE" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Bubble */}
      <div
        className={clsx(
          'max-w-[80vw] sm:max-w-[75%] lg:max-w-[60%] rounded-2xl relative',
          isUser
            ? 'bg-mustard-500/[0.12] border border-mustard-500/20 text-cream px-4 py-3 rounded-br-md'
            : 'bg-white/[0.025] border border-white/[0.06] px-4 py-3 rounded-bl-md',
          !isUser && feedback === 'up' && 'message-bubble-up',
          !isUser && feedback === 'down' && 'message-bubble-down'
        )}
      >
        {/* Content */}
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{displayContent}</p>
        ) : (
          <div className="message-content text-sm text-cream/85">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {displayContent}
            </ReactMarkdown>
          </div>
        )}

        {/* Bottom bar — assistant only, always rendered (stable height) */}
        {!isUser && (
          <div className="flex items-center gap-2.5 mt-3 pt-2.5 border-t border-white/[0.05] min-h-[32px]">
            {/* Smart RAG badge */}
            {hasSmartInfo && !isStreaming && <SmartBadge smartInfo={message.smartInfo} />}

            {/* Retry button for error messages */}
            {isErrorMessage && (
              <button
                onClick={handleRetry}
                disabled={!lastUserQuery}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
                  'bg-mustard-500/15 text-mustard-400 hover:bg-mustard-500/25'
                )}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            )}

            <div className="flex-1" />

            {/* Feedback buttons - hidden during streaming */}
            {!isStreaming && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleFeedback('up')}
                  disabled={feedbackLoading}
                  className={clsx(
                    'p-1.5 rounded-lg transition-all',
                    feedback === 'up'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'text-mist/50 hover:text-emerald-400 hover:bg-emerald-500/[0.08]',
                    feedbackLoading && 'opacity-50'
                  )}
                >
                  <ThumbsUp className="w-3.5 h-3.5" fill={feedback === 'up' ? 'currentColor' : 'none'} />
                </button>

                <button
                  onClick={() => handleFeedback('down')}
                  disabled={feedbackLoading}
                  className={clsx(
                    'p-1.5 rounded-lg transition-all',
                    feedback === 'down'
                      ? 'bg-rose-500/15 text-rose-400'
                      : 'text-mist/50 hover:text-rose-400 hover:bg-rose-500/[0.08]',
                    feedbackLoading && 'opacity-50'
                  )}
                >
                  <ThumbsDown className="w-3.5 h-3.5" fill={feedback === 'down' ? 'currentColor' : 'none'} />
                </button>
              </div>
            )}

            {/* Copy button - hidden during streaming */}
            {!isStreaming && (
              <button
                onClick={handleCopy}
                className={clsx(
                  'p-1.5 rounded-lg transition-all',
                  copied
                    ? 'text-mustard-400'
                    : 'text-mist/50 hover:text-cream'
                )}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}

            {/* Timestamp - hidden during streaming */}
            {!isStreaming && (
              <span className="text-2xs text-mist/60">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
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

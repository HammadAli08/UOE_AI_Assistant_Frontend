// ──────────────────────────────────────────
// ChatContainer — scrollable message list
// Fixed: unified bubble (no StreamingBubble remount),
//        proper near-bottom scroll guard,
//        rAF-based smooth scroll.
// ──────────────────────────────────────────
import { useEffect, useRef, useCallback, memo } from 'react';
import useChatStore from '@/store/useChatStore';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import WelcomeScreen from './WelcomeScreen';
import { AnimatePresence, motion } from 'framer-motion';

// Sentinel message object used as the streaming placeholder.
// Same object identity across renders keeps React reconciliation stable.
const STREAMING_SENTINEL = {
  id: '__streaming__',
  role: 'assistant',
  content: '',
  timestamp: new Date().toISOString(),
};

function ChatContainer({ onSuggestionClick }) {
  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const streamingContent = useChatStore((s) => s.streamingContent);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const isNearBottomRef = useRef(true);

  // ── Persistent scroll listener — tracks if user is near bottom ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      const { scrollHeight, scrollTop, clientHeight } = container;
      isNearBottomRef.current = scrollHeight - scrollTop <= clientHeight + 120;
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  // ── Auto-scroll (guarded) — only if user was already near bottom ──
  const scrollToBottom = useCallback((force = false) => {
    if (!force && !isNearBottomRef.current) return;
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: force ? 'auto' : 'smooth',
      });
    });
  }, []);

  // Scroll when new messages arrive
  useEffect(() => {
    scrollToBottom(false);
  }, [messages.length, scrollToBottom]);

  // Scroll as streaming content grows (throttled via rAF)
  useEffect(() => {
    if (isStreaming && streamingContent) {
      scrollToBottom(false);
    }
  }, [streamingContent, isStreaming, scrollToBottom]);

  return (
    <div
      ref={containerRef}
      className="flex-1 min-h-0 overflow-y-auto"
      style={{
        WebkitOverflowScrolling: 'touch',
        contain: 'layout style',
      }}
    >
      <div className="max-w-4xl mx-auto px-2 sm:px-4 pt-4 pb-2">
        <AnimatePresence>
          {messages.length === 0 && !isStreaming ? (
            <WelcomeScreen key="welcome" onSuggestionClick={onSuggestionClick} />
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {/* Streaming message — SAME component, same DOM node */}
              {isStreaming && streamingContent && (
                <MessageBubble
                  key={STREAMING_SENTINEL.id}
                  message={STREAMING_SENTINEL}
                  isStreaming
                  streamingContent={streamingContent}
                />
              )}

              {/* Typing indicator (before any text arrives) */}
              {isStreaming && !streamingContent && <TypingIndicator />}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} style={{ height: '1px' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default memo(ChatContainer);

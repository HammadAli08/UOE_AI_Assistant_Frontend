// ──────────────────────────────────────────
// ChatContainer — scrollable message list
// ──────────────────────────────────────────
import { useEffect, useRef, useCallback, memo } from 'react';
import useChatStore from '@/store/useChatStore';
import MessageBubble from './MessageBubble';
import StreamingBubble from './StreamingBubble';
import TypingIndicator from './TypingIndicator';
import WelcomeScreen from './WelcomeScreen';
import { AnimatePresence, motion } from 'framer-motion';


function ChatContainer({ onSuggestionClick }) {
  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const streamingContent = useChatStore((s) => s.streamingContent);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const wasAtBottomRef = useRef(true);

  const scrollToBottom = useCallback((force = false) => {
    if (force || wasAtBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({
        behavior: force ? 'auto' : 'smooth',
      });
    }
  }, []);

  // Track if user is at bottom before new content
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
    wasAtBottomRef.current = isAtBottom;
  }, [messages.length]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollToBottom(false);
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [messages, scrollToBottom]);

  return (
    <div
      ref={containerRef}
      className="flex-1 min-h-0 overflow-y-auto"
      style={{
        WebkitOverflowScrolling: 'touch',
        contain: 'layout style'
      }}
    >
      <div className="max-w-4xl mx-auto px-2 sm:px-4 pt-4 pb-2">
        <AnimatePresence mode="wait">
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

              {/* Streaming content */}
              {isStreaming && streamingContent && (
                <StreamingBubble content={streamingContent} />
              )}

              {/* Typing indicator */}
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

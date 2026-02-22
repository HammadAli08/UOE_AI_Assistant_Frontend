// ──────────────────────────────────────────
// ChatContainer — scrollable message list
// ──────────────────────────────────────────
import { useEffect, useRef, memo } from 'react';
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
  const bottomRef = useRef(null);

  const scrollToBottom = () => {
    const messagesEl = document.getElementById('messages');
    if (messagesEl) {
      messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
    }
  };

  // Auto-scroll to bottom on new messages or streaming content
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, isStreaming]);

  // Keyboard-aware scroll for mobile
  useEffect(() => {
    if (window.visualViewport) {
      const handleResize = () => {
        setTimeout(scrollToBottom, 120);
      };
      window.visualViewport.addEventListener('resize', handleResize);
      return () => window.visualViewport.removeEventListener('resize', handleResize);
    }
  }, []);

  return (
    <div className="flex-1 min-h-0 flex flex-col relative w-full h-full overflow-hidden">
      <AnimatePresence mode="wait">
        {messages.length === 0 && !isStreaming ? (
          <WelcomeScreen key="welcome" onSuggestionClick={onSuggestionClick} />
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex-1 flex flex-col w-full h-full min-h-0"
          >
            {/* Scrollable message area */}
            <div id="messages" className="flex-1 overflow-y-auto px-2 sm:px-4 pb-4 pt-4 space-y-3 overflow-anchor-none">
              <div className="max-w-4xl mx-auto">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}

                {/* Streaming content */}
                {isStreaming && streamingContent && (
                  <StreamingBubble content={streamingContent} />
                )}

                {/* Typing indicator — streaming started but no content yet */}
                {isStreaming && !streamingContent && <TypingIndicator />}

                <div className="h-4" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom gradient fade — overlay, doesn't affect layout */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-navy-950/80 to-transparent pointer-events-none z-10" />
    </div>
  );
}

export default memo(ChatContainer);

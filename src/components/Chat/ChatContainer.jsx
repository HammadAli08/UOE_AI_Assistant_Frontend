// ──────────────────────────────────────────
// ChatContainer — simplest possible stable layout
// ──────────────────────────────────────────
import { useEffect, useRef, memo } from 'react';
import { AnimatePresence } from 'framer-motion';
import useChatStore from '@/store/useChatStore';
import MessageBubble from './MessageBubble';
import WelcomeScreen from './WelcomeScreen';
import ThinkingAnimation from './ThinkingAnimation';

function ChatContainer({ onSuggestionClick }) {
  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const streamingContent = useChatStore((s) => s.streamingContent);
  const isThinking = useChatStore((s) => s.isThinking);
  const thinkingMode = useChatStore((s) => s.thinkingMode);
  const endRef = useRef(null);

  // Scroll to bottom when messages change or thinking/streaming starts
  useEffect(() => {
    if (messages.length > 0 || isThinking || isStreaming) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isThinking, isStreaming]);

  // Check if should show welcome
  const hasMessages = messages.length > 0;

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4">
        {hasMessages ? (
          <div className="space-y-3">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {/* Thinking animation — plays before streaming */}
            <AnimatePresence mode="wait">
              {isThinking && (
                <ThinkingAnimation mode={thinkingMode} />
              )}
            </AnimatePresence>

            {/* Streaming message - same component, no mount/unmount */}
            {isStreaming && streamingContent && (
              <MessageBubble
                message={{
                  id: 'streaming',
                  role: 'assistant',
                  content: streamingContent,
                }}
                isStreaming
                streamingContent={streamingContent}
              />
            )}
          </div>
        ) : (
          <WelcomeScreen onSuggestionClick={onSuggestionClick} />
        )}

        <div ref={endRef} />
      </div>
    </div>
  );
}

export default memo(ChatContainer);

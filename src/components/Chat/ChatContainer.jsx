// ──────────────────────────────────────────
// ChatContainer — scrollable message list
// Fixed: unified bubble, no conditional wrappers, stable layout
// ──────────────────────────────────────────
import { useEffect, useRef, useCallback, memo } from 'react';
import useChatStore from '@/store/useChatStore';
import MessageBubble from './MessageBubble';
import WelcomeScreen from './WelcomeScreen';

function ChatContainer({ onSuggestionClick }) {
  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const streamingContent = useChatStore((s) => s.streamingContent);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // Stable scroll function
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, []);

  // Only scroll on new message (not during streaming)
  useEffect(() => {
    if (!isStreaming) {
      scrollToBottom();
    }
  }, [messages.length, scrollToBottom, isStreaming]);

  // Show welcome screen only when truly empty
  const showWelcome = messages.length === 0 && !isStreaming;

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-y-auto"
      style={{
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4">
        {showWelcome ? (
          <WelcomeScreen onSuggestionClick={onSuggestionClick} />
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {/* Streaming indicator */}
            {isStreaming && (
              <MessageBubble
                message={{
                  id: 'streaming',
                  role: 'assistant',
                  content: streamingContent || '',
                  timestamp: new Date().toISOString(),
                }}
                isStreaming
                streamingContent={streamingContent}
              />
            )}
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} style={{ height: '1px' }} />
      </div>
    </div>
  );
}

export default memo(ChatContainer);

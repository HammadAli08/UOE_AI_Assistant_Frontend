// ──────────────────────────────────────────
// App — root component
// ──────────────────────────────────────────
import { useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import useChatStore from '@/store/useChatStore';
import useChat from '@/hooks/useChat';
import useHealthCheck from '@/hooks/useHealthCheck';
import HeroPage from '@/components/Landing/HeroPage';
import ChatContainer from '@/components/Chat/ChatContainer';
import ChatInput from '@/components/Input/ChatInput';

function ChatPage() {
  const navigate = useNavigate();
  const { send, stop, isStreaming } = useChat();

  const handleSuggestionClick = useCallback((query) => { send(query); }, [send]);

  return (
    <div className="h-[100dvh] flex flex-col bg-navy-950">
      {/* Header - fixed position */}
      <header className="h-14 px-4 flex items-center justify-between bg-navy-950/90 backdrop-blur border-b border-white/[0.06] flex-shrink-0">
        <button onClick={() => navigate('/')} className="flex items-center gap-3">
          <img src="/unnamed.jpg" alt="UOE" className="w-8 h-8 rounded-lg object-cover" />
          <div>
            <h1 className="text-sm font-semibold uppercase tracking-widest text-cream">UOE AI</h1>
            <p className="text-[10px] text-mist">Academic Assistant</p>
          </div>
        </button>
        <button onClick={() => useChatStore.getState().newChat()} className="px-4 py-1.5 rounded-full border border-white/10 text-xs text-ash">
          New Chat
        </button>
      </header>

      {/* Chat - fills remaining space */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ChatContainer onSuggestionClick={handleSuggestionClick} />
      </div>

      {/* Input - fixed at bottom */}
      <div className="flex-shrink-0">
        <ChatInput onSend={send} onStop={stop} isStreaming={isStreaming} />
      </div>
    </div>
  );
}

export default function App() {
  useHealthCheck(30000);
  return (
    <Routes>
      <Route path="/" element={<HeroPage />} />
      <Route path="/chat" element={<ChatPage />} />
    </Routes>
  );
}

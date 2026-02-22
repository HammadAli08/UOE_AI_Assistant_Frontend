// ──────────────────────────────────────────
// App — root component with routing
// ──────────────────────────────────────────
import { useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import useChatStore from '@/store/useChatStore';
import useChat from '@/hooks/useChat';
import useHealthCheck from '@/hooks/useHealthCheck';
import HeroPage from '@/components/Landing/HeroPage';
import ChatContainer from '@/components/Chat/ChatContainer';
import ChatInput from '@/components/Input/ChatInput';

/* ── Chat page ── */
function ChatPage() {
  const navigate = useNavigate();
  const { send, stop, isStreaming } = useChat();

  const handleSuggestionClick = useCallback(
    (query) => { send(query); },
    [send]
  );

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-navy-950">
      {/* Background */}
      <div className="fixed inset-0 bg-navy-950 -z-10" />
      <div className="fixed inset-0 bg-noise animate-bg-noise opacity-30 -z-10 pointer-events-none" />
      <div className="fixed top-0 right-0 w-[600px] h-[500px] rounded-full bg-mustard-500/5 blur-[150px] -z-10 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[400px] rounded-full bg-blue-500/5 blur-[150px] -z-10 pointer-events-none" />

      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 h-14 px-4 sm:px-8 flex items-center justify-between bg-navy-950/80 backdrop-blur-md border-b border-white/[0.06] z-50">
        <button onClick={() => navigate('/')} className="flex items-center gap-3">
          <img src="/unnamed.jpg" alt="UOE" className="w-8 h-8 rounded-lg object-cover" />
          <div>
            <h1 className="text-sm font-semibold uppercase tracking-widest text-cream">UOE AI</h1>
            <p className="text-[10px] text-mist">Academic Assistant</p>
          </div>
        </button>
        <button
          onClick={() => useChatStore.getState().newChat()}
          className="px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] text-xs text-ash hover:text-cream"
        >
          New Chat
        </button>
      </header>

      {/* Content area */}
      <div className="flex-1 flex flex-col min-h-0 pt-14">
        {/* Chat - fills available space */}
        <div className="flex-1 min-h-0">
          <ChatContainer onSuggestionClick={handleSuggestionClick} />
        </div>

        {/* Input - fixed height */}
        <ChatInput onSend={send} onStop={stop} isStreaming={isStreaming} />
      </div>
    </div>
  );
}

/* ── App root ── */
export default function App() {
  useHealthCheck(30000);
  return (
    <Routes>
      <Route path="/" element={<HeroPage />} />
      <Route path="/chat" element={<ChatPage />} />
    </Routes>
  );
}

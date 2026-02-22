// ──────────────────────────────────────────
// Zustand store — global chat state
// ──────────────────────────────────────────
import { create } from 'zustand';
import { DEFAULT_NAMESPACE, MAX_TURNS } from '@/constants';

const useChatStore = create((set, get) => ({
  // ── Messages ──
  messages: [],        // [{ id, role:'user'|'assistant', content, timestamp, sources?, smartInfo?, enhancedQuery? }]
  isStreaming: false,
  streamingContent: '',
  streamingMessageId: null,  // Track the current streaming message ID

  // ── Session ──
  sessionId: null,
  turnCount: 0,

  // ── Namespace ──
  namespace: DEFAULT_NAMESPACE,

  // ── Pipeline Settings ──
  settings: {
    enhanceQuery: true,
    enableSmart: false,
    topKRetrieve: 5,
  },

  // ── UI State ──
  showChat: false,
  apiOnline: null,      // null = unknown, true/false
  lastUserQuery: '',    // tracks the last user query for retry
  draftInput: '',       // pre-fill the chat input (e.g. on retry)
  feedbackMap: {},      // { [messageId]: 'up' | 'down' }

  // ── Actions ──

  addUserMessage: (content) => {
    const msg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    set((s) => ({
      messages: [...s.messages, msg],
      turnCount: s.turnCount + 1,
      lastUserQuery: content,
    }));
    return msg;
  },

  addAssistantMessage: (content, meta = {}) => {
    const msg = {
      id: `asst-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      sources: meta.sources || [],
      smartInfo: meta.smartInfo || null,
      enhancedQuery: meta.enhancedQuery || null,
      runId: meta.runId || null,
    };
    set((s) => ({ messages: [...s.messages, msg] }));
    return msg;
  },

  // Create message at start of streaming - this is the key fix
  startStreaming: () => {
    const msg = {
      id: `asst-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      sources: [],
      smartInfo: null,
      enhancedQuery: null,
      runId: null,
    };
    set((s) => ({
      messages: [...s.messages, msg],
      isStreaming: true,
      streamingContent: '',
      streamingMessageId: msg.id,
    }));
    return msg;
  },

  // Append token to existing streaming message (update in place)
  appendStreamToken: (token) =>
    set((s) => ({
      streamingContent: s.streamingContent + token,
      messages: s.messages.map((m) =>
        m.id === s.streamingMessageId
          ? { ...m, content: m.content + token }
          : m
      ),
    })),

  // Finalize streaming message (don't replace, just update metadata)
  finishStreaming: (meta = {}) => {
    const { streamingMessageId } = get();
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === streamingMessageId
          ? {
              ...m,
              content: s.streamingContent || m.content,
              sources: meta.sources || [],
              smartInfo: meta.smartInfo || null,
              enhancedQuery: meta.enhancedQuery || null,
              runId: meta.runId || null,
            }
          : m
      ),
      isStreaming: false,
      streamingContent: '',
      streamingMessageId: null,
    }));
  },

  cancelStreaming: () => set((s) => ({
    isStreaming: false,
    streamingContent: '',
    streamingMessageId: null,
    // Remove the incomplete streaming message
    messages: s.messages.filter((m) => m.id !== s.streamingMessageId),
  })),

  setSessionId: (id) => set({ sessionId: id }),

  setNamespace: (ns) => set({
    namespace: ns,
    messages: [],
    sessionId: null,
    turnCount: 0,
  }),

  updateSettings: (patch) =>
    set((s) => ({ settings: { ...s.settings, ...patch } })),

  enterChat: () => set({ showChat: true }),

  setApiOnline: (v) => set({ apiOnline: v }),

  setFeedback: (messageId, value) =>
    set((s) => ({
      feedbackMap: { ...s.feedbackMap, [messageId]: value },
    })),

  setDraftInput: (text) => set({ draftInput: text }),
  clearDraftInput: () => set({ draftInput: '' }),

  newChat: () => set({
    messages: [],
    sessionId: null,
    turnCount: 0,
    isStreaming: false,
    streamingContent: '',
    streamingMessageId: null,
  }),

  isMaxTurns: () => get().turnCount >= MAX_TURNS,
}));

export default useChatStore;

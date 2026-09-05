import { useState, useCallback, useEffect, useRef } from 'react';
import { Menu, Settings, ShieldCheck, Sparkles, Trash2, FileText, Download, ArrowUpRight } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import Composer from './components/Composer';
import SettingsPanel from './components/SettingsPanel';
import PrivacyPanel from './components/PrivacyPanel';
import { streamChat } from './lib/adapters';
import { loadConversations, saveConversations, generateId, generateTitle, loadSettings } from './lib/store';
import { getModel } from './lib/models';
import type { Conversation, Message } from './types';

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modelId, setModelId] = useState('fable');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const abortRef = useRef<(() => void) | null>(null);

  // Initialize
  useEffect(() => {
    const list = loadConversations();
    setConversations(list);
    if (list.length > 0) setActiveId(list[0].id);
    const s = loadSettings();
    if (s.theme === 'dark' || (s.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const activeConv = conversations.find((c) => c.id === activeId) || null;
  const activeMessages = activeConv ? activeConv.messages : [];

  const save = useCallback((list: Conversation[]) => {
    setConversations(list);
    saveConversations(list);
  }, []);

  const createNew = useCallback(() => {
    const id = generateId();
    const c: Conversation = {
      id,
      title: 'New conversation',
      messages: [],
      modelId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const list = [c, ...conversations];
    save(list);
    setActiveId(id);
    setSidebarOpen(false);
  }, [conversations, modelId, save]);

  const selectConversation = useCallback((id: string | null) => {
    if (id === null) return createNew();
    setActiveId(id);
    const c = conversations.find((x) => x.id === id);
    if (c) setModelId(c.modelId || 'fable');
  }, [conversations, createNew]);

  const rename = useCallback((id: string, title: string) => {
    const list = conversations.map((c) => c.id === id ? { ...c, title, updatedAt: Date.now() } : c);
    save(list);
  }, [conversations, save]);

  const archive = useCallback((id: string) => {
    const list = conversations.map((c) => c.id === id ? { ...c, archived: true, updatedAt: Date.now() } : c);
    save(list);
  }, [conversations, save]);

  const deleteConv = useCallback((id: string) => {
    const list = conversations.filter((c) => c.id !== id);
    save(list);
    if (activeId === id) { setActiveId(list[0]?.id || null); }
  }, [conversations, save, activeId]);

  const handleSend = useCallback(async (text: string) => {
    if (!activeId) { createNew(); }
    // We'll create/update after a tick since createNew updates activeId asynchronously
    setTimeout(() => {
      const currentId = activeId || conversations[conversations.length - 1]?.id;
      if (!currentId) return;
      const userMsg: Message = { id: generateId(), role: 'user', content: text, createdAt: Date.now() };
      let list = conversations.map((c) => c.id === currentId ? { ...c, messages: [...c.messages, userMsg], updatedAt: Date.now() } : c);
      if (list.find((c) => c.id === currentId)?.messages.length === 1) {
        list = list.map((c) => c.id === currentId ? { ...c, title: generateTitle([...c.messages, userMsg]) } : c);
      }
      save(list);
      setIsLoading(true);
      startStream(currentId, list, userMsg);
    }, 0);
  }, [activeId, conversations, save, createNew]);

  const startStream = useCallback((convId: string, currentList: Conversation[], userMsg: Message) => {
    let accumulated = '';
    let buffer = '';
    const controller = { abort: false };
    abortRef.current = () => { controller.abort = true; };

    // Find the conversation in state at time of call
    const model = getModel(modelId);

    streamChat({ model: modelId, messages: [...(currentList.find((c) => c.id === convId)?.messages || [])] }, (chunk) => {
      if (controller.abort) return;
      if (chunk.error) {
        accumulated += chunk.error;
      } else if (chunk.content) {
        buffer += chunk.content;
        // Flush to UI periodically (simulated by immediate append for simplicity)
        // In real streaming we'd append chunks; here we accumulate and flush every word
        accumulated += chunk.content;
      }
      const updatedMsg: Message = {
        id: 'stream-' + convId,
        role: 'assistant',
        content: accumulated,
        model: modelId,
        createdAt: Date.now(),
      };
      const list = currentList.map((c) => {
        if (c.id !== convId) return c;
        const existing = c.messages.find((m) => m.id === 'stream-' + convId);
        const msgs = existing ? c.messages.map((m) => m.id === 'stream-' + convId ? updatedMsg : m) : [...c.messages, updatedMsg];
        return { ...c, messages: msgs, updatedAt: Date.now(), modelId: modelId || c.modelId };
      });
      save(list);
    }).then(async () => {
      if (controller.abort) return;
      // Finalize by replacing stream id with real id and cleaning
      const finalList = currentList.map((c) => {
        if (c.id !== convId) return c;
        const msgs = c.messages.map((m) => m.id === 'stream-' + convId ? { ...m, id: generateId(), content: m.content } : m);
        return { ...c, messages: msgs, updatedAt: Date.now() };
      });
      save(finalList);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });

    // Since mock stream is synchronous-ish, this works; for real SSE we'd use event source.
  }, [modelId, save]);

  // Regenerate
  const regenerate = useCallback(() => {
    const c = activeConv;
    if (!c) return;
    const lastUser = [...c.messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;
    const filtered = c.messages.filter((m) => !(m.role === 'assistant' && m.id === 'stream-' + c.id));
    // Remove last assistant if any
    const trimmed = filtered.length > 0 && filtered[filtered.length - 1].role === 'assistant' ? filtered.slice(0, -1) : filtered;
    const list = conversations.map((x) => x.id === c.id ? { ...x, messages: trimmed, updatedAt: Date.now() } : x);
    save(list);
    setIsLoading(true);
    // Start new stream with trimmed messages
    const userMsg = trimmed.find((m) => m.role === 'user');
    if (userMsg) {
      // Reconstruct for stream
      setTimeout(() => {
        const currentList = list;
        const updatedUserMsg: Message = { id: generateId(), role: 'user', content: userMsg.content, createdAt: Date.now() };
        const withUser = currentList.map((x) => x.id === c.id ? { ...x, messages: [...trimmed, updatedUserMsg], updatedAt: Date.now() } : x);
        save(withUser);
        startStream(c.id, withUser, updatedUserMsg);
      }, 0);
    }
  }, [activeConv, conversations, save, startStream]);

  // Stop generation
  const stopGeneration = useCallback(() => {
    abortRef.current?.();
    setIsLoading(false);
  }, []);

  const modelName = getModel(modelId)?.name || 'Unknown';

  const handleFeedback = useCallback(() => {}, []);

  // Theme sync on settings change via event
  useEffect(() => {
    const onOpen = () => setSettingsOpen(true);
    window.addEventListener('open-settings', onOpen);
    return () => window.removeEventListener('open-settings', onOpen);
  }, []);

  // Key nav for sidebar toggle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSidebarOpen(false); setSettingsOpen(false); setPrivacyOpen(false); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') { e.preventDefault(); setSidebarOpen((s) => !s); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-ink-950 text-ink-900 dark:text-ink-50 font-sans selection:bg-amber-200`}>
      <Sidebar
        activeId={activeId}
        onSelect={selectConversation}
        onNew={createNew}
        onRename={rename}
        onArchive={archive}
        onDelete={deleteConv}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/70 dark:bg-ink-950/70 backdrop-blur-xl border-b border-ink-200 dark:border-ink-800 px-4 md:px-6 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 rounded-xl hover:bg-ink-100 dark:hover:bg-ink-800 transition md:hidden" aria-label="Open sidebar"><Menu size={20} /></button>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-xl md:text-2xl leading-none text-ink-900 dark:text-ink-50 truncate">Lumen Chat</h1>
            <div className="text-[11px] text-ink-400 truncate">{activeConv ? activeConv.title : 'New chat'}</div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPrivacyOpen(true)} className="p-2 rounded-xl hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-500 transition" aria-label="Privacy info" title="Privacy"><ShieldCheck size={18} /></button>
            <button onClick={() => setSettingsOpen(true)} className="p-2 rounded-xl hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-500 transition" aria-label="Settings" title="Settings"><Settings size={18} /></button>
          </div>
        </header>

        <ChatArea
          messages={activeMessages}
          modelName={modelName}
          isLoading={isLoading}
          onCopy={() => {}}
          onRegenerate={regenerate}
          onStop={stopGeneration}
          onFeedback={handleFeedback}
        />

        <Composer
          modelId={modelId}
          onSelectModel={setModelId}
          onSend={handleSend}
          isLoading={isLoading}
        />
      </div>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <PrivacyPanel open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </div>
  );
}

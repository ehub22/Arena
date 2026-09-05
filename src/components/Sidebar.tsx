import { useState, useEffect, useRef } from 'react';
import { Search, Menu, X, Plus, Archive, Trash2, MessageSquare } from 'lucide-react';
import { loadConversations, saveConversations, generateTitle } from '../lib/store';
import type { Conversation } from '../types';

interface Props {
  activeId: string | null;
  onSelect: (id: string | null) => void;
  onNew: () => void;
  onRename: (id: string, title: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ activeId, onSelect, onNew, onRename, onArchive, onDelete, open, onClose }: Props) {
  const [list, setList] = useState<Conversation[]>([]);
  const [q, setQ] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setList(loadConversations()); }, []);
  useEffect(() => { if (editingId && inputRef.current) inputRef.current.focus(); }, [editingId]);

  const refresh = () => setList(loadConversations());

  const filtered = list
    .filter((c) => !c.archived)
    .filter((c) => c.title.toLowerCase().includes(q.toLowerCase()) || c.messages.some((m) => m.content.toLowerCase().includes(q.toLowerCase())));

  const archived = list.filter((c) => c.archived);

  const handleRename = (id: string) => {
    const c = list.find((x) => x.id === id);
    if (!c) return;
    const newTitle = editValue.trim() || generateTitle(c.messages);
    const updated = list.map((x) => (x.id === id ? { ...x, title: newTitle, updatedAt: Date.now() } : x));
    saveConversations(updated);
    setList(updated);
    setEditingId(null);
    setEditValue('');
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && <div onClick={onClose} className="fixed inset-0 z-40 bg-ink-950/30 backdrop-blur-sm md:hidden" />}
      <aside
        aria-label="Conversation sidebar"
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-[16rem] md:w-[18rem] lg:w-[20rem] bg-white/80 dark:bg-ink-950/80 backdrop-blur-xl border-r border-ink-200 dark:border-ink-800 shadow-xl md:shadow-none flex flex-col transition-transform duration-300 ease-out ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="flex items-center justify-between px-4 pt-5 pb-3">
          <button onClick={onNew} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-ink-900 text-white text-sm font-medium hover:bg-ink-800 transition shadow-lg shadow-ink-900/10 active:scale-[0.98]" aria-label="New chat">
            <Plus size={16} strokeWidth={2.5} /> New Chat
          </button>
          <button onClick={onClose} className="md:hidden p-2 rounded-xl hover:bg-ink-100 dark:hover:bg-ink-800 transition" aria-label="Close sidebar"><X size={18} /></button>
        </div>

        <div className="px-3 pb-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search chats"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-ink-50 dark:bg-ink-900 border border-transparent focus:border-amber-300 focus:ring-2 focus:ring-amber-100/40 outline-none transition placeholder:text-ink-400"
              aria-label="Search conversations"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1" aria-label="Conversations">
          {filtered.length === 0 && !q && (
            <div className="text-xs text-ink-400 px-2 py-6 text-center">No active chats. Start a new one.</div>
          )}
          {filtered.map((c) => (
            <div key={c.id} className={`group relative rounded-xl transition ${activeId === c.id ? 'bg-amber-50 dark:bg-ink-900 border border-amber-200/60 dark:border-ink-700' : 'hover:bg-ink-50 dark:hover:bg-ink-900/60 border border-transparent'}`}>
              <button
                onClick={() => { onSelect(c.id); onClose(); refresh(); }}
                className="w-full text-left px-3 py-2.5 rounded-xl truncate text-sm leading-snug text-ink-800 dark:text-ink-100"
                aria-current={activeId === c.id ? 'location' : undefined}
              >
                <span className="font-medium truncate block">{c.title}</span>
                <span className="text-[11px] text-ink-400 truncate block">{c.messages.length} messages</span>
              </button>
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); setEditingId(c.id); setEditValue(c.title); }} className="p-1 rounded-md hover:bg-ink-200 dark:hover:bg-ink-700 text-ink-500" aria-label={`Rename ${c.title}`} title="Rename"><span className="text-xs">✎</span></button>
                <button onClick={(e) => { e.stopPropagation(); onArchive(c.id); refresh(); }} className="p-1 rounded-md hover:bg-ink-200 dark:hover:bg-ink-700 text-ink-500" aria-label={`Archive ${c.title}`} title="Archive"><Archive size={12} /></button>
                <button onClick={(e) => { e.stopPropagation(); if (confirm('Delete this chat?')) { onDelete(c.id); refresh(); } }} className="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500" aria-label={`Delete ${c.title}`} title="Delete"><Trash2 size={12} /></button>
              </div>
              {editingId === c.id && (
                <form onSubmit={(e) => { e.preventDefault(); handleRename(c.id); }} className="absolute inset-0 z-10 bg-white dark:bg-ink-950 rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg">
                  <input ref={inputRef} value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Escape') setEditingId(null); }} className="flex-1 text-sm bg-transparent outline-none" aria-label="Edit title" />
                  <button type="submit" className="text-xs font-medium text-amber-600">Save</button>
                  <button type="button" onClick={() => setEditingId(null)} className="text-xs text-ink-400">Cancel</button>
                </form>
              )}
            </div>
          ))}
          {archived.length > 0 && (
            <div className="pt-2">
              <div className="text-[10px] uppercase tracking-widest text-ink-400 font-semibold px-2 mb-1">Archived</div>
              {archived.map((c) => (
                <button key={c.id} onClick={() => { onSelect(c.id); onClose(); refresh(); }} className="w-full text-left px-3 py-2 rounded-xl text-sm text-ink-500 hover:text-ink-800 dark:hover:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-900/40 truncate flex items-center gap-2">
                  <Archive size={12} /> {c.title}
                </button>
              ))}
            </div>
          )}
        </nav>

        <div className="px-3 py-3 border-t border-ink-200 dark:border-ink-800 text-[11px] text-ink-400 leading-relaxed">
          <p>Chats stored locally by default. <a href="#settings" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('open-settings')); }} className="underline underline-offset-2">Manage settings</a>.</p>
        </div>
      </aside>
    </>
  );
}

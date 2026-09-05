import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, ArrowUp } from 'lucide-react';
import { models, getModel } from '../lib/models';
import type { Message } from '../types';

interface Props {
  modelId: string;
  onSelectModel: (id: string) => void;
  onSend: (text: string) => void;
  isLoading: boolean;
}

export default function Composer({ modelId, onSelectModel, onSend, isLoading }: Props) {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setText('');
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const available = models.filter((m) => m.available);
  const selected = getModel(modelId);

  return (
    <section className="sticky bottom-0 z-30 w-full bg-white/70 dark:bg-ink-950/70 backdrop-blur-2xl pt-4 pb-5 px-4 md:px-8" aria-label="Message composer">
      <div className="max-w-3xl mx-auto">
        {/* Model selector row */}
        <div className="flex items-center gap-2 mb-2">
          <div className="relative">
            <button
              onClick={() => { /* could open picker */ }}
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition ${selected?.available ? 'bg-amber-50 dark:bg-ink-900 border-amber-200 dark:border-ink-700 text-amber-700 dark:text-amber-300' : 'bg-ink-50 dark:bg-ink-900 border-ink-200 dark:border-ink-700 text-ink-500'}`}
              aria-label="Select model"
              aria-haspopup="listbox"
            >
              <span className={`w-2 h-2 rounded-full ${selected?.available ? 'bg-emerald-400 animate-pulse' : 'bg-ink-300'}`} />
              {selected ? selected.name : 'Select model'}
            </button>
            <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-ink-900 rounded-2xl shadow-2xl border border-ink-200 dark:border-ink-800 overflow-hidden z-50" role="listbox" aria-label="Available models">
              {models.map((m) => (
                <button
                  key={m.id}
                  role="option"
                  aria-selected={modelId === m.id}
                  onClick={() => onSelectModel(m.id)}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-ink-50 dark:hover:bg-ink-800 transition ${modelId === m.id ? 'bg-amber-50 dark:bg-ink-800 font-medium text-ink-900 dark:text-ink-50' : 'text-ink-700 dark:text-ink-200'} ${!m.available ? 'opacity-60' : ''}`}
                  disabled={!m.available}
                >
                  <div className="flex items-center justify-between">
                    <span>{m.name}</span>
                    {!m.available && <span className="text-[10px] text-ink-400">Coming soon</span>}
                  </div>
                  <div className="text-xs text-ink-400 mt-0.5 truncate">{m.description}</div>
                </button>
              ))}
            </div>
          </div>
          <span className="text-[11px] text-ink-400">{selected?.available ? 'Online' : 'Unavailable'}</span>
        </div>

        {/* Composer card */}
        <div className={`relative rounded-3xl bg-white dark:bg-ink-900 shadow-xl shadow-ink-900/5 border ${focused ? 'border-amber-300/80 ring-2 ring-amber-100 dark:ring-ink-800/40' : 'border-ink-200 dark:border-ink-800'} transition overflow-hidden`}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={1}
            placeholder="Ask anything..."
            className="w-full px-5 pt-4 pb-3 resize-none bg-transparent outline-none text-ink-900 dark:text-ink-100 placeholder:text-ink-300 dark:placeholder:text-ink-600 text-[0.95rem] leading-relaxed"
            style={{ minHeight: '3.2rem', maxHeight: '14rem' }}
            aria-label="Type your message"
          />
          <div className="flex items-center justify-between px-3 py-2 border-t border-ink-100 dark:border-ink-800/60">
            <div className="flex items-center gap-1">
              <button type="button" className="p-2 rounded-xl hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400 transition" aria-label="Attach file" title="Attach file (coming soon)"><Paperclip size={18} /></button>
              <button type="button" className="p-2 rounded-xl hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400 transition" aria-label="Voice input" title="Voice input (coming soon)"><Mic size={18} /></button>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || isLoading}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition shadow-lg ${!text.trim() || isLoading ? 'bg-ink-200 dark:bg-ink-800 text-ink-400 cursor-not-allowed' : 'bg-ink-900 dark:bg-amber-400 text-white dark:text-ink-950 hover:bg-ink-800 dark:hover:bg-amber-300 active:scale-[0.97]'}`}
              aria-label="Send message"
            >
              Send <ArrowUp size={16} />
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-ink-400 mt-2">AI responses may be inaccurate. Check important information.</p>
      </div>
    </section>
  );
}

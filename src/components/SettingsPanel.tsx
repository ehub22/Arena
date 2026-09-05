import { useState, useEffect } from 'react';
import { X, Moon, Sun, Monitor, Type, ChevronDown, Trash2, Download, Upload, Info, FileJson, FileText, ShieldCheck } from 'lucide-react';
import { loadSettings, saveSettings, clearAllConversations, loadConversations, saveConversations } from '../lib/store';
import type { AppSettings } from '../types';

export default function SettingsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => { setSettings(loadSettings()); }, [open]);

  const apply = (patch: Partial<AppSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
    if (patch.theme) document.documentElement.classList.toggle('dark', patch.theme === 'dark' || (patch.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));
  };

  const handleExport = (format: 'json' | 'md') => {
    const list = loadConversations();
    const blob = new Blob([format === 'json' ? JSON.stringify(list, null, 2) : list.map(c => `---\nTitle: ${c.title}\nModel: ${c.modelId}\nDate: ${new Date(c.createdAt).toISOString()}\n---\n` + c.messages.map(m => `**${m.role}**: ${m.content}`).join('\n\n')).join('\n\n---\n')], { type: format === 'json' ? 'application/json' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `lumen-chats.${format}`; a.click(); URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (Array.isArray(data)) {
          saveConversations(data);
          alert('Imported successfully!');
        }
      } catch { alert('Failed to import — ensure the file is a valid export.'); }
    };
    reader.readAsText(file);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-20 md:pt-24 px-4" role="dialog" aria-modal="true" aria-label="Settings">
      <div onClick={onClose} className="absolute inset-0 bg-ink-950/30 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-white dark:bg-ink-900 rounded-3xl shadow-2xl border border-ink-200 dark:border-ink-800 overflow-hidden animate-fade-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100 dark:border-ink-800">
          <h2 className="font-serif text-2xl text-ink-900 dark:text-ink-50">Settings</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-ink-100 dark:hover:bg-ink-800 transition" aria-label="Close settings"><X size={18} /></button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-7">
          {/* Theme */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-3">Appearance</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'light' as const, label: 'Light', icon: Sun },
                { key: 'dark' as const, label: 'Dark', icon: Moon },
                { key: 'system' as const, label: 'System', icon: Monitor },
              ].map((t) => (
                <button key={t.key} onClick={() => apply({ theme: t.key })} className={`flex flex-col items-center gap-2 px-3 py-3 rounded-2xl border text-sm font-medium transition ${settings.theme === t.key ? 'bg-amber-50 dark:bg-ink-800 border-amber-300 dark:border-amber-300/40 text-ink-900 dark:text-ink-50' : 'bg-ink-50 dark:bg-ink-950 border-ink-200 dark:border-ink-800 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800'}`}>
                  <t.icon size={20} /> <span>{t.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Font / spacing */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-3">Reading</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {(['sm', 'base', 'lg'] as const).map((s) => (
                <button key={s} onClick={() => apply({ fontSize: s })} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${settings.fontSize === s ? 'bg-ink-900 text-white dark:bg-amber-300 dark:text-ink-950' : 'bg-ink-50 dark:bg-ink-950 border-ink-200 dark:border-ink-800 text-ink-600 dark:text-ink-300'}`}>{s}</button>
              ))}
            </div>
            <div className="flex gap-2">
              {(['compact', 'comfortable'] as const).map((s) => (
                <button key={s} onClick={() => apply({ spacing: s })} className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium border transition ${settings.spacing === s ? 'bg-ink-900 text-white dark:bg-amber-300 dark:text-ink-950' : 'bg-ink-50 dark:bg-ink-950 border-ink-200 dark:border-ink-800 text-ink-600 dark:text-ink-300'}`}>{s}</button>
              ))}
            </div>
          </section>

          {/* Toggles */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-2">Preferences</h3>
            <label className="flex items-center justify-between p-3 rounded-2xl bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-ink-800 cursor-pointer">
              <span className="text-sm">Show model names</span>
              <input type="checkbox" checked={settings.showModelNames} onChange={(e) => apply({ showModelNames: e.target.checked })} className="w-5 h-5 accent-amber-500 rounded-md" />
            </label>
            <label className="flex items-center justify-between p-3 rounded-2xl bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-ink-800 cursor-pointer">
              <span className="text-sm">Local chat storage</span>
              <input type="checkbox" checked={settings.localStorageEnabled} onChange={(e) => apply({ localStorageEnabled: e.target.checked })} className="w-5 h-5 accent-amber-500 rounded-md" />
            </label>
          </section>

          {/* Data */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-3">Data</h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button onClick={() => handleExport('json')} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-ink-800 text-sm hover:bg-ink-100 dark:hover:bg-ink-800 transition"><FileJson size={16} /> Export JSON</button>
              <button onClick={() => handleExport('md')} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-ink-800 text-sm hover:bg-ink-100 dark:hover:bg-ink-800 transition"><FileText size={16} /> Export Markdown</button>
            </div>
            <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-ink-800 text-sm cursor-pointer hover:bg-ink-100 dark:hover:bg-ink-800 transition"><Upload size={16} /> Import JSON <input type="file" accept=".json" onChange={handleImport} className="hidden" /></label>
          </section>

          {/* Clear */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-3">Danger</h3>
            {!showClearConfirm ? (
              <button onClick={() => setShowClearConfirm(true)} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 text-sm hover:bg-red-50 dark:hover:bg-red-950/30 transition"><Trash2 size={16} /> Clear all chats</button>
            ) : (
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 space-y-3">
                <p className="text-sm text-red-800 dark:text-red-200">This will permanently delete all local conversations. It cannot be undone.</p>
                <div className="flex gap-2">
                  <button onClick={() => { clearAllConversations(); setShowClearConfirm(false); window.location.reload(); }} className="flex-1 px-3 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition">Confirm clear</button>
                  <button onClick={() => setShowClearConfirm(false)} className="flex-1 px-3 py-2 rounded-xl bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-200 text-sm">Cancel</button>
                </div>
              </div>
            )}
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-2">About</h3>
            <div className="text-xs text-ink-500 dark:text-ink-400 space-y-1">
              <p><strong>Lumen Chat</strong> v1.0.0 — A privacy-first AI chat interface.</p>
              <p>Models configured: Fable (available), GPT-6 (coming soon).</p>
              <p>Storage: <strong>local</strong> by default. Configure backend via <code className="font-mono text-[10px] px-1 py-0.5 rounded bg-ink-200 dark:bg-ink-800">VITE_API_URL</code>.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

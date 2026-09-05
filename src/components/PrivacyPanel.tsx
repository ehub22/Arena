import { ShieldCheck, EyeOff, Server, Lock, Database } from 'lucide-react';

export default function PrivacyPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-label="Privacy" onClick={onClose}>
      <div className="absolute inset-0 bg-ink-950/30 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-xl bg-white dark:bg-ink-900 rounded-3xl shadow-2xl border border-ink-200 dark:border-ink-800 p-8 animate-fade-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-ink-950 flex items-center justify-center"><ShieldCheck size={24} /></div>
          <div>
            <h2 className="font-serif text-3xl text-ink-900 dark:text-ink-50">Your privacy</h2>
            <p className="text-sm text-ink-400">How Lumen Chat handles your data</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          {[
            { icon: EyeOff, title: 'No tracking', desc: 'No cookies, ads, or analytics scripts.' },
            { icon: Lock, title: 'No hard-coded keys', desc: 'API configuration lives only in environment variables.' },
            { icon: Database, title: 'Local by default', desc: 'Conversations stay in your browser unless configured otherwise.' },
            { icon: Server, title: 'Optional backend', desc: 'Connect a backend endpoint when you choose; data never leaves your control by default.' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl bg-ink-50 dark:bg-ink-950 border border-ink-200/60 dark:border-ink-800 p-4">
              <div className="w-8 h-8 rounded-xl bg-white dark:bg-ink-800 text-amber-600 flex items-center justify-center mb-2 shadow-sm"><item.icon size={16} /></div>
              <h3 className="font-semibold text-sm text-ink-900 dark:text-ink-100 mb-1">{item.title}</h3>
              <p className="text-xs text-ink-500 dark:text-ink-300 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-ink-900 text-amber-100 p-5 text-sm leading-relaxed">
          <strong className="text-white">Important:</strong> Lumen Chat minimizes data collection. If you configure a remote AI backend, messages are sent to that endpoint. You can disable storage, export, or clear all data at any time from Settings. This app does not serve advertisements or use tracking pixels.
        </div>
        <div className="flex justify-end mt-5">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-ink-900 dark:bg-amber-400 text-white dark:text-ink-950 text-sm font-semibold hover:brightness-110 transition">Got it</button>
        </div>
      </div>
    </div>
  );
}

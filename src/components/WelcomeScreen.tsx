import { Sparkles, ShieldCheck, Zap, Lock } from 'lucide-react';

export default function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-16 md:py-24 animate-fade-up">
      <div className="relative mb-8">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-amber-300 via-amber-400 to-ink-800 shadow-2xl shadow-amber-900/10 flex items-center justify-center rotate-[-2deg]">
          <Sparkles size={48} className="text-white md:text-64 drop-shadow-md" strokeWidth={1.5} />
        </div>
        <div className="absolute -bottom-3 -right-3 bg-ink-900 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-lg">v1.0</div>
      </div>

      <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-ink-900 dark:text-ink-50 leading-[0.95] tracking-tight mb-4">
        Lumen <span className="italic font-normal text-ink-500 dark:text-ink-300">Chat</span>
      </h1>
      <p className="text-lg md:text-xl text-ink-500 dark:text-ink-300 max-w-md leading-relaxed mb-10">Ask anything. Choose the model that fits your task.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
        {[
          { icon: ShieldCheck, label: 'Private by design', desc: 'Local storage by default' },
          { icon: Zap, label: 'Fast streaming', desc: 'Real-time responses' },
          { icon: Lock, label: 'No tracking', desc: 'No ads or analytics' },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl bg-white dark:bg-ink-900/60 border border-ink-200/60 dark:border-ink-800 p-5 text-left shadow-sm hover:shadow-md transition">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-ink-800 text-amber-600 flex items-center justify-center mb-3"><item.icon size={18} /></div>
            <div className="text-sm font-semibold text-ink-900 dark:text-ink-100 mb-0.5">{item.label}</div>
            <div className="text-xs text-ink-400">{item.desc}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center gap-6 text-xs text-ink-400">
        <span>Fable — Available</span>
        <span className="w-1 h-1 rounded-full bg-ink-300" />
        <span>GPT-6 — Coming soon</span>
      </div>
    </div>
  );
}

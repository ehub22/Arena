import { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import WelcomeScreen from './WelcomeScreen';
import type { Message } from '../types';

interface Props {
  messages: Message[];
  modelName?: string;
  isLoading?: boolean;
  onCopy?: () => void;
  onRegenerate?: () => void;
  onStop?: () => void;
  onFeedback?: (rating: 'up' | 'down') => void;
}

export default function ChatArea({ messages, modelName, isLoading, onCopy, onRegenerate, onStop, onFeedback }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, isLoading]);

  if (messages.length === 0) return <WelcomeScreen />;

  return (
    <main className="flex-1 overflow-y-auto px-4 md:px-8 pt-6 pb-6" aria-label="Chat messages">
      <div className="max-w-3xl mx-auto space-y-8">
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            modelName={modelName}
            isLoading={false}
            onCopy={onCopy}
            onRegenerate={onRegenerate}
            onStop={onStop}
            onFeedback={onFeedback}
          />
        ))}
        {isLoading && (
          <div className="group flex gap-3 md:gap-4 animate-fade-up" aria-label="Assistant is typing">
            <div className="shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-gradient-to-br from-ink-800 to-ink-950 text-amber-100 flex items-center justify-center shadow-md"><span>⋯</span></div>
            <div className="min-w-0 max-w-[92%] md:max-w-[80%]">
              <div className="rounded-3xl px-5 py-4 md:px-6 md:py-5 bg-white dark:bg-ink-900/60 border border-ink-200/60 dark:border-ink-800 rounded-tl-md shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-[11px] font-medium text-ink-400"><span>Lumen Chat</span>{modelName && <span className="px-1.5 py-0.5 rounded-md bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300">{modelName}</span>}</div>
                <div className="flex items-center gap-1.5 text-ink-400">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
              <button onClick={onStop} className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400 text-ink-950 text-[11px] font-semibold shadow hover:bg-amber-300 transition" aria-label="Stop generation"><span className="w-2 h-2 rounded-sm bg-ink-950" /> Stop</button>
            </div>
          </div>
        )}
        <div ref={bottomRef} aria-hidden="true" />
      </div>
    </main>
  );
}

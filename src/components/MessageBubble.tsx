import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import { Check, Copy, ThumbsUp, ThumbsDown, RefreshCw, Square, Sparkles } from 'lucide-react';
import type { Message } from '../types';

interface Props {
  message: Message;
  modelName?: string;
  isLoading?: boolean;
  onCopy?: () => void;
  onRegenerate?: () => void;
  onStop?: () => void;
  onFeedback?: (rating: 'up' | 'down') => void;
}

export default function MessageBubble({ message, modelName, isLoading, onCopy, onRegenerate, onStop, onFeedback }: Props) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      onCopy?.();
    } catch { /* ignore */ }
  }, [message.content, onCopy]);

  const isUser = message.role === 'user';

  return (
    <article
      className={`group relative flex gap-3 md:gap-4 animate-fade-up ${isUser ? 'flex-row-reverse' : ''}`}
      aria-label={`${isUser ? 'You' : 'Assistant'} message`}
    >
      {/* Avatar */}
      <div className={`shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-2xl flex items-center justify-center shadow-md shadow-ink-900/5 ${isUser ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' : 'bg-gradient-to-br from-ink-800 to-ink-950 text-amber-100'}`} aria-hidden="true">
        {isUser ? <span className="text-sm font-serif italic">Y</span> : <Sparkles size={18} strokeWidth={2} />}
      </div>

      <div className={`min-w-0 max-w-[92%] md:max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div className={`rounded-3xl px-5 py-4 md:px-6 md:py-5 shadow-sm ${isUser ? 'bg-ink-900 text-white rounded-tr-md' : 'bg-white dark:bg-ink-900/60 border border-ink-200/60 dark:border-ink-800 rounded-tl-md'}`}>
          {/* Header for assistant */}
          {!isUser && (
            <div className="flex items-center gap-2 mb-2 text-[11px] font-medium text-ink-400 dark:text-ink-400">
              <span>Lumen Chat</span>
              {modelName && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300">{modelName}</span>}
            </div>
          )}

          <div className={`prose-custom ${isUser ? 'text-ink-100' : ''}`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath, remarkRehype]}
              rehypePlugins={[rehypeKatex]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <div className="relative my-3 rounded-xl overflow-hidden bg-ink-950 shadow-lg shadow-ink-900/10">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-ink-800/60 text-[11px] text-ink-300 font-mono">
                        <span>{match[1]}</span>
                        <button onClick={handleCopy} className="flex items-center gap-1 hover:text-amber-300 transition" aria-label="Copy code">{copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied' : 'Copy'}</button>
                      </div>
                      <pre className="p-3 overflow-x-auto text-sm leading-relaxed text-ink-100" {...props}><code className={className}>{children}</code></pre>
                    </div>
                  ) : (
                    <code className={className ? `${className} px-1 py-0.5 rounded-md bg-ink-200 dark:bg-ink-800 text-ink-800 dark:text-amber-100 font-mono text-[0.85em]` : 'px-1 py-0.5 rounded-md bg-ink-200 dark:bg-ink-800 text-ink-800 dark:text-amber-100 font-mono text-[0.85em]'} {...props}>{children}</code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Actions */}
        {!isUser && (
          <div className="flex items-center gap-2 mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
            <button onClick={handleCopy} className="p-1.5 rounded-xl hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-500 transition" aria-label="Copy response" title="Copy"><Copy size={15} /></button>
            <button onClick={onRegenerate} className="p-1.5 rounded-xl hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-500 transition" aria-label="Regenerate" title="Regenerate"><RefreshCw size={15} /></button>
            <button onClick={() => setFeedback('up')} className={`p-1.5 rounded-xl transition ${feedback === 'up' ? 'bg-amber-100 text-amber-600' : 'hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-500'}`} aria-label="Thumbs up" title="Thumbs up"><ThumbsUp size={15} /></button>
            <button onClick={() => setFeedback('down')} className={`p-1.5 rounded-xl transition ${feedback === 'down' ? 'bg-ink-100 text-ink-600' : 'hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-500'}`} aria-label="Thumbs down" title="Thumbs down"><ThumbsDown size={15} /></button>
            {isLoading && (
              <button onClick={onStop} className="ml-auto inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-400 text-ink-950 text-[11px] font-semibold shadow hover:bg-amber-300 transition" aria-label="Stop generation"><Square size={11} fill="currentColor" /> Stop</button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

import type { Message } from '../types';
import { getModel } from './models';

// ============================================================================
// MODEL ADAPTER LAYER
// This is where real provider APIs (OpenAI, Anthropic, etc.) should be called.
// Currently uses mock streaming for demonstration.
// ============================================================================

export interface ChatPayload {
  model: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
}

export interface ChatResponseChunk {
  content?: string;
  done?: boolean;
  error?: string;
}

export async function streamChat(
  payload: ChatPayload,
  onChunk?: (chunk: ChatResponseChunk) => void
): Promise<void> {
  const model = getModel(payload.model);

  if (!model || !model.available) {
    onChunk?.({ error: `Model "${payload.model}" is unavailable or coming soon.` });
    return;
  }

  // TODO: Replace with real backend call.
  // Example for a generic backend endpoint:
  // const resp = await fetch('/api/chat', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload),
  // });
  // if (!resp.ok) throw new Error(await resp.text());
  // if (resp.headers.get('content-type')?.includes('text/event-stream')) {
  //   const reader = resp.body!.getReader();
  //   ...parse SSE...
  // }

  // MOCK STREAMING (for prototype without backend)
  const reply = await generateMockReply(payload);
  const words = reply.split(/(\s+)/);
  for (let i = 0; i < words.length; i++) {
    await new Promise((r) => setTimeout(r, 30));
    const chunk = words[i];
    if (chunk !== undefined) {
      const out: ChatResponseChunk = { content: chunk };
      onChunk?.(out);
    }
  }
  onChunk?.({ done: true });
}

async function generateMockReply(payload: ChatPayload): Promise<string> {
  const userText = payload.messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content)
    .join(' ')
    .toLowerCase();

  if (userText.includes('hello') || userText.includes('hi ')) {
    return "Hello! I'm Lumen, your private AI assistant. Ask anything — I'm here to help with ideas, writing, analysis, and more. How can I assist you today?";
  }
  if (userText.includes('code') || userText.includes('python') || userText.includes('js')) {
    return "Sure! Here's a quick snippet to get you started:\n\n```python\ndef greet(name):\n    return f\"Hello, {name}!\"\n```\n\nYou can expand this with error handling and type hints. Would you like a more complete example?";
  }
  if (userText.includes('table') || userText.includes('compare')) {
    return "Here's a comparison table for quick reference:\n\n| Feature | Fable | GPT-6 |\n|---|---|---|\n| Reasoning | Good | Excellent |\n| Writing | Good | Excellent |\n| Availability | Active | Coming soon |";
  }
  if (userText.includes('markdown') || userText.includes('format')) {
    return "Lumen supports rich formatting: **bold**, *italic*, `code`, lists, links, and even inline math like $E = mc^2$. Try asking for a table or a numbered list!";
  }
  return "That's a great question! In a real deployment, this would connect to a backend model endpoint configured via environment variables. For now, I'm providing a mock reply to demonstrate streaming, formatting, and interaction patterns. Try asking about code, tables, or markdown formatting.";
}

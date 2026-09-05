export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  createdAt: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  modelId: string;
  createdAt: number;
  updatedAt: number;
  archived?: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'sm' | 'base' | 'lg';
  spacing: 'compact' | 'comfortable';
  showModelNames: boolean;
  localStorageEnabled: boolean;
}

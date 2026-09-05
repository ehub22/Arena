import type { Conversation, AppSettings, Message } from '../types';

const STORAGE_KEY = 'lumen_chat_data';
const SETTINGS_KEY = 'lumen_chat_settings';

function getStorage(): { conversations: Conversation[]; settings: AppSettings } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const settingsRaw = localStorage.getItem(SETTINGS_KEY);
    return {
      conversations: raw ? JSON.parse(raw) : [],
      settings: settingsRaw ? JSON.parse(settingsRaw) : defaultSettings(),
    };
  } catch {
    return { conversations: [], settings: defaultSettings() };
  }
}

function defaultSettings(): AppSettings {
  return {
    theme: 'system',
    fontSize: 'base',
    spacing: 'comfortable',
    showModelNames: true,
    localStorageEnabled: true,
  };
}

export function loadConversations(): Conversation[] {
  const s = getStorage();
  if (s.settings.localStorageEnabled) return s.conversations;
  return [];
}

export function saveConversations(list: Conversation[]): void {
  try {
    const s = getStorage();
    if (s.settings.localStorageEnabled) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
  } catch { /* ignore */ }
}

export function loadSettings(): AppSettings {
  return getStorage().settings;
}

export function saveSettings(s: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch { /* ignore */ }
}

export function clearAllConversations(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function generateTitle(messages: Message[]): string {
  const first = messages.find((m) => m.role === 'user');
  if (!first) return 'New conversation';
  const t = first.content.trim();
  return t.length > 40 ? t.slice(0, 40) + '…' : t || 'New conversation';
}

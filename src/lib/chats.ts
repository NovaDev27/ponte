// Histórico de conversas com o Orbi. Fica SÓ no celular (nada vai para o servidor),
// numa chave separada do estado principal para não pesar a cada salvamento.

export type ChatMsg = { role: 'user' | 'assistant'; content: string; ok?: boolean; broke?: boolean };
export type Chat = { id: string; title: string; updatedAt: number; msgs: ChatMsg[] };

export const CHATS_KEY = 'ponte:chats';
export const MAX_CHATS = 30; // as mais antigas saem quando passa disso
const MAX_MSGS = 100; // por conversa, para o arquivo não crescer sem fim
// Teto do histórico inteiro gravado no celular. Uma chave muito grande no AsyncStorage do Android
// falha ao ler, e aí o histórico sumiria: melhor apagar as conversas mais antigas antes.
export const MAX_BYTES = 800_000;

export function newChatId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

// Título = começo da primeira pergunta.
export function chatTitle(msgs: ChatMsg[]): string {
  const first = msgs.find((m) => m.role === 'user')?.content.trim().replace(/\s+/g, ' ') ?? '';
  if (!first) return 'Conversa';
  return first.length > 60 ? `${first.slice(0, 57).trimEnd()}…` : first;
}

// Coloca a conversa no topo (mais recente primeiro) e corta o excesso:
// no máximo `max` conversas e `maxBytes` no total (saem as mais antigas).
// Conversa sem pergunta nenhuma não entra. O título fica o da primeira vez que foi salva.
export function upsertChat(list: Chat[], chat: Chat, max = MAX_CHATS, maxBytes = MAX_BYTES): Chat[] {
  const before = list.find((c) => c.id === chat.id);
  const rest = list.filter((c) => c.id !== chat.id);
  if (!chat.msgs.some((m) => m.role === 'user')) return rest;
  const saved: Chat = { ...chat, title: before?.title || chatTitle(chat.msgs), msgs: chat.msgs.slice(-MAX_MSGS) };
  const out = [saved, ...rest].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, max);
  while (out.length > 1 && JSON.stringify(out).length > maxBytes) out.pop();
  return out;
}

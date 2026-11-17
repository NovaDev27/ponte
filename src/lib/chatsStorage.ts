import AsyncStorage from '@react-native-async-storage/async-storage';
import { CHATS_KEY, type Chat } from './chats';

// Leitura e gravação do histórico do Orbi no celular (a lógica fica em chats.ts).
// null = não deu para ler (erro do armazenamento). Nesse caso NÃO grave por cima,
// senão uma lista quase vazia apagaria as conversas que ainda estão lá.
export async function loadChats(): Promise<Chat[] | null> {
  try {
    const raw = await AsyncStorage.getItem(CHATS_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as Chat[];
    return Array.isArray(list) ? list : [];
  } catch {
    return null;
  }
}

export async function saveChats(list: Chat[]): Promise<void> {
  await AsyncStorage.setItem(CHATS_KEY, JSON.stringify(list)).catch(() => {});
}

export async function clearChats(): Promise<void> {
  await AsyncStorage.removeItem(CHATS_KEY).catch(() => {});
}

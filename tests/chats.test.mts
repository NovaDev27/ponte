// Testes do histórico de conversas do Orbi (lógica pura, sem o celular).
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { chatTitle, upsertChat, type Chat } from '../src/lib/chats.ts';

const chat = (id: string, at: number, q = 'Pergunta'): Chat => ({
  id, title: '', updatedAt: at, msgs: [{ role: 'user', content: q }, { role: 'assistant', content: 'Resposta', ok: true }],
});

describe('histórico do Orbi', () => {
  test('título vem da primeira pergunta e é cortado', () => {
    assert.equal(chatTitle([{ role: 'user', content: '  Qual   o visto? ' }]), 'Qual o visto?');
    const long = 'a'.repeat(80);
    const t = chatTitle([{ role: 'user', content: long }]);
    assert.ok(t.length <= 58 && t.endsWith('…'));
    assert.equal(chatTitle([]), 'Conversa');
  });

  test('conversa atualizada sobe para o topo, sem duplicar', () => {
    let list = upsertChat([], chat('a', 1));
    list = upsertChat(list, chat('b', 2));
    list = upsertChat(list, chat('a', 3, 'Nova pergunta'));
    assert.deepEqual(list.map((c) => c.id), ['a', 'b']);
    assert.equal(list[0].title, 'Pergunta'); // o título é o da primeira vez
  });

  test('guarda no máximo N conversas, apagando as mais antigas', () => {
    let list: Chat[] = [];
    for (let i = 0; i < 5; i++) list = upsertChat(list, chat(`c${i}`, i), 3);
    assert.deepEqual(list.map((c) => c.id), ['c4', 'c3', 'c2']);
  });

  test('conversa sem pergunta não entra (e sai se já estava)', () => {
    const empty: Chat = { id: 'x', title: '', updatedAt: 9, msgs: [] };
    assert.deepEqual(upsertChat([], empty), []);
    assert.deepEqual(upsertChat([chat('x', 1)], empty), []);
  });
});

describe('histórico do Orbi: limites', () => {
  test('título não muda depois de salvo', () => {
    let list = upsertChat([], chat('a', 1, 'Primeira'));
    list = upsertChat(list, { ...chat('a', 2), msgs: [{ role: 'user', content: 'Outra coisa' }] });
    assert.equal(list[0].title, 'Primeira');
  });

  test('corta as conversas mais antigas quando passa do tamanho', () => {
    const big = (id: string, at: number): Chat => ({ id, title: '', updatedAt: at, msgs: [{ role: 'user', content: 'x'.repeat(400) }] });
    let list: Chat[] = [];
    for (let i = 0; i < 5; i++) list = upsertChat(list, big(`c${i}`, i), 30, 1300);
    assert.ok(JSON.stringify(list).length <= 1300);
    assert.equal(list[0].id, 'c4');
    assert.ok(list.length < 5);
  });
});

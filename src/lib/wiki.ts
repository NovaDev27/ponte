import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { PLACES } from '../data/places';

// Foto e resumo de cada lugar, vindos da Wikipédia em português.
// Uma consulta por país (todos os lugares de uma vez), guardada no celular por 30 dias.
export type WikiInfo = { img?: string; text?: string; url: string };

const KEY = 'ponte:lugares:v1:';
const TTL = 30 * 86400000;
const memory = new Map<string, Record<string, WikiInfo>>();

const pageUrl = (title: string) => `https://pt.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;

async function fetchCountry(code: string): Promise<Record<string, WikiInfo>> {
  const titles = (PLACES[code] ?? []).map((p) => p.wiki);
  const out: Record<string, WikiInfo> = {};
  titles.forEach((t) => (out[t] = { url: pageUrl(t) }));
  if (!titles.length) return out;
  const qs = new URLSearchParams({
    action: 'query', titles: titles.join('|'), prop: 'pageimages|extracts', exintro: '1', explaintext: '1', exsentences: '3',
    exlimit: '20', piprop: 'thumbnail', pithumbsize: '800', format: 'json', redirects: '1', formatversion: '2', origin: '*',
  });
  const res = await fetch(`https://pt.wikipedia.org/w/api.php?${qs}`, {
    headers: Platform.OS === 'web' ? {} : { 'Api-User-Agent': 'PonteApp/1.0 (app de intercambio)' },
  });
  if (!res.ok) throw new Error(`wiki ${res.status}`);
  const j = await res.json();
  const q = j.query ?? {};
  // A Wikipédia pode trocar o título (acentos, redirecionamentos): volta para o nosso.
  const back: Record<string, string> = {};
  for (const n of [...(q.normalized ?? []), ...(q.redirects ?? [])]) back[n.to] = back[n.from] ?? n.from;
  for (const page of q.pages ?? []) {
    if (page.missing) continue;
    const ours = back[page.title] ?? page.title;
    if (!out[ours]) continue;
    out[ours] = { img: page.thumbnail?.source, text: page.extract, url: pageUrl(page.title) };
  }
  return out;
}

export function useWiki(code: string) {
  const [entry, setEntry] = useState<{ code: string; data: Record<string, WikiInfo> | null; failed: boolean }>({ code, data: null, failed: false });
  useEffect(() => {
    if (memory.has(code)) return;
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY + code).catch(() => null);
        if (raw) {
          const saved = JSON.parse(raw) as { at: number; data: Record<string, WikiInfo> };
          if (Date.now() - saved.at < TTL) {
            memory.set(code, saved.data);
            if (alive) setEntry({ code, data: saved.data, failed: false });
            return;
          }
        }
        const fresh = await fetchCountry(code);
        memory.set(code, fresh);
        AsyncStorage.setItem(KEY + code, JSON.stringify({ at: Date.now(), data: fresh })).catch(() => {});
        if (alive) setEntry({ code, data: fresh, failed: false });
      } catch {
        if (alive) setEntry({ code, data: null, failed: true }); // sem internet: os cartões ficam com o emoji no lugar da foto
      }
    })();
    return () => {
      alive = false;
    };
  }, [code]);
  const data = memory.get(code) ?? (entry.code === code ? entry.data : null);
  return { data, failed: entry.code === code && entry.failed && !data };
}

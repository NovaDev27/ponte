// Recorta as 16 poses do Orbi mala (folha com 4 linhas × 4 colunas) em PNGs com fundo transparente.
// Uso: node marca/recortar-orbi.mjs [folha] — padrão: marca/mascote-opcoes/orbi-mala-preta.webp
//
// Como funciona:
// 1. Fundo: só o branco ligado à borda da folha some. Os olhos, o coração e o balão são brancos,
//    mas ficam dentro do contorno preto e continuam. A borda clara vira preto semitransparente,
//    para o contorno ficar liso em qualquer fundo.
// 2. Cada pedaço solto (corpo, "?", "zZ", confete) é achado pela forma, não por uma grade fixa:
//    os 16 maiores são os corpos, e cada pedaço pequeno vai para o corpo mais perto.
// 3. Todas as poses saem na MESMA escala, centradas e apoiadas embaixo.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire('C:/dev/avoks-site/package.json');
const { chromium } = require('playwright-core');

const SHEET = path.resolve(process.argv[2] ?? 'C:/dev/ponte/marca/mascote-opcoes/orbi-mala-preta.webp');
const OUT = 'C:/dev/ponte/assets/orbi';
// Ordem da folha, linha por linha.
const NAMES = [
  'parado', 'feliz', 'animado', 'pensando',
  'surpreso', 'triste', 'apaixonado', 'com-sono',
  'viajando', 'olhando-mapa', 'passaporte', 'chegando',
  'indo-embora', 'celebrando', 'pedindo-ajuda', 'acenando',
];
fs.mkdirSync(OUT, { recursive: true });

const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await b.newPage();
const data = `data:image/webp;base64,${fs.readFileSync(SHEET).toString('base64')}`;
const result = await p.evaluate(async ({ data, names }) => {
  const img = new Image();
  img.src = data;
  await img.decode();
  const w = img.width, h = img.height;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, w, h);
  const px = d.data;
  const lum = (i) => 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];

  // 1. Fundo ligado à borda.
  const bg = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  while (stack.length) {
    const k = stack.pop();
    if (bg[k] || lum(k * 4) < 185) continue;
    bg[k] = 1;
    const x = k % w, y = (k / w) | 0;
    if (x > 0) stack.push(k - 1);
    if (x < w - 1) stack.push(k + 1);
    if (y > 0) stack.push(k - w);
    if (y < h - 1) stack.push(k + w);
  }
  for (let k = 0; k < w * h; k++) {
    if (!bg[k]) continue;
    const i = k * 4;
    const a = Math.max(0, Math.min(255, (255 - lum(i)) * 3.2));
    px[i] = 0; px[i + 1] = 0; px[i + 2] = 0; px[i + 3] = a < 12 ? 0 : a;
  }

  // 2. Pedaços soltos (8 vizinhos).
  const label = new Int32Array(w * h).fill(-1);
  const comps = [];
  for (let s0 = 0; s0 < w * h; s0++) {
    if (label[s0] !== -1 || px[s0 * 4 + 3] === 0) continue;
    const id = comps.length;
    const comp = { id, n: 0, minX: w, minY: h, maxX: 0, maxY: 0 };
    const st = [s0];
    label[s0] = id;
    while (st.length) {
      const k = st.pop();
      comp.n++;
      const x = k % w, y = (k / w) | 0;
      if (x < comp.minX) comp.minX = x; if (x > comp.maxX) comp.maxX = x;
      if (y < comp.minY) comp.minY = y; if (y > comp.maxY) comp.maxY = y;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const n = ny * w + nx;
        if (label[n] === -1 && px[n * 4 + 3] > 0) { label[n] = id; st.push(n); }
      }
    }
    comps.push(comp);
  }
  const bodies = [...comps].sort((a, b) => b.n - a.n).slice(0, 16);
  if (bodies.length < 16) return { error: `achei só ${bodies.length} corpos` };
  // Ordena em 4 linhas de 4, da esquerda para a direita.
  const cy = (k) => (k.minY + k.maxY) / 2, cx = (k) => (k.minX + k.maxX) / 2;
  bodies.sort((a, b) => cy(a) - cy(b));
  const ordered = [];
  for (let r = 0; r < 4; r++) ordered.push(...bodies.slice(r * 4, r * 4 + 4).sort((a, b) => cx(a) - cx(b)));
  const owner = new Map(); // id do pedaço -> índice da pose
  ordered.forEach((k, i) => owner.set(k.id, i));
  // Distância entre caixas (0 se encostam).
  const gap = (a, b) => Math.hypot(Math.max(0, a.minX - b.maxX, b.minX - a.maxX), Math.max(0, a.minY - b.maxY, b.minY - a.maxY));
  for (const k of comps) {
    if (owner.has(k.id) || k.n < 6) continue; // poeira some
    let best = -1, bd = Infinity;
    ordered.forEach((bk, i) => { const dd = gap(k, bk); if (dd < bd) { bd = dd; best = i; } });
    if (bd < 90) owner.set(k.id, best);
  }
  // Caixa de cada pose.
  const boxes = ordered.map(() => ({ minX: w, minY: h, maxX: 0, maxY: 0 }));
  for (const k of comps) {
    if (!owner.has(k.id)) continue;
    const bx = boxes[owner.get(k.id)];
    bx.minX = Math.min(bx.minX, k.minX); bx.minY = Math.min(bx.minY, k.minY);
    bx.maxX = Math.max(bx.maxX, k.maxX); bx.maxY = Math.max(bx.maxY, k.maxY);
  }
  // 3. Mesma escala em todas, num quadro retangular (sem sobra em cima), com o CORPO sempre
  //    no centro: assim o Orbi não pula para o lado quando troca de pose (corações e "?" sobram para fora).
  const bodyCx = ordered.map((k) => (k.minX + k.maxX) / 2);
  const half = Math.max(...boxes.map((bx, i) => Math.max(bodyCx[i] - bx.minX, bx.maxX - bodyCx[i]))) + 5;
  const fw = Math.ceil(half * 2);
  const fh = Math.max(...boxes.map((bx) => bx.maxY - bx.minY + 1)) + 10;
  const out = {};
  boxes.forEach((bx, i) => {
    const o = document.createElement('canvas');
    o.width = fw; o.height = fh;
    const og = o.getContext('2d');
    const od = og.createImageData(fw, fh);
    const bw = bx.maxX - bx.minX + 1, bh = bx.maxY - bx.minY + 1;
    const dx = Math.round(fw / 2 - (bodyCx[i] - bx.minX)), dy = fh - bh - 5;
    for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
      const k = (bx.minY + y) * w + (bx.minX + x);
      if (label[k] === -1 || owner.get(label[k]) !== i) continue;
      const si = k * 4, di = ((dy + y) * fw + (dx + x)) * 4;
      od.data[di] = px[si]; od.data[di + 1] = px[si + 1]; od.data[di + 2] = px[si + 2]; od.data[di + 3] = px[si + 3];
    }
    og.putImageData(od, 0, 0);
    out[names[i]] = o.toDataURL('image/png');
  });
  return { fw, fh, out };
}, { data, names: NAMES });

if (result.error) throw new Error(result.error);
for (const [name, url] of Object.entries(result.out)) {
  fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(url.split(',')[1], 'base64'));
}
console.log(`${NAMES.length} poses de ${result.fw}×${result.fh} px em ${OUT} (proporção altura/largura ${(result.fh / result.fw).toFixed(3)})`);
await b.close();

// Converte SVG em PNG (com transparência) usando o Chrome do HyperFrames.
// Uso: node render-svg.mjs <puppeteer-core> <chrome> <saida.png>=<entrada.svg>@<tamanho> ...
import { readFileSync } from 'node:fs';

const [, , puppeteerPath, chrome, ...jobs] = process.argv;
const { default: puppeteer } = await import(new URL(`file:///${puppeteerPath.replace(/\\/g, '/')}/lib/puppeteer/puppeteer-core.js`));
const browser = await puppeteer.launch({ executablePath: chrome, headless: true });
const page = await browser.newPage();
for (const job of jobs) {
  const [outPath, rest] = job.split('=');
  const [svgPath, size] = rest.split('@');
  const px = Number(size);
  const svg = readFileSync(svgPath, 'utf8').replace(/width="\d+" height="\d+"/, `width="${px}" height="${px}"`);
  await page.setViewport({ width: px, height: px, deviceScaleFactor: 1 });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
  await page.screenshot({ path: outPath, omitBackground: true, clip: { x: 0, y: 0, width: px, height: px } });
  console.log('ok', outPath, px);
}
await browser.close();

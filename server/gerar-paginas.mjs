// Gera as páginas públicas (privacidade, termos e exclusão de dados) como HTML estático
// na pasta docs/, para o GitHub Pages. Assim o link da loja abre na hora, sem esperar
// o servidor da Render acordar.
// Uso: node server/gerar-paginas.mjs <e-mail de contato público>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deletionPage, privacyPage, termsPage } from './pages.mjs';

const email = process.argv[2];
if (!email) {
  console.error('Informe o e-mail de contato público: node server/gerar-paginas.mjs contato@exemplo.com');
  process.exit(1);
}

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs');
const PAGES = { privacidade: privacyPage, termos: termsPage, 'excluir-dados': deletionPage };

for (const [slug, render] of Object.entries(PAGES)) {
  // No servidor os links são absolutos ("/privacidade"). No GitHub Pages o site fica
  // em /ponte/, então cada página aponta para a irmã com caminho relativo.
  const html = render(email).replace(/href="\/(privacidade|termos|excluir-dados)"/g, 'href="../$1/"');
  fs.mkdirSync(path.join(root, slug), { recursive: true });
  fs.writeFileSync(path.join(root, slug, 'index.html'), html);
  console.log(`docs/${slug}/index.html`);
}

// Página inicial simples, com os três links.
fs.writeFileSync(
  path.join(root, 'index.html'),
  `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Ponte</title></head>
<body style="font:16px/1.6 system-ui,sans-serif;max-width:720px;margin:0 auto;padding:24px 16px">
<h1>Ponte</h1><p>App de planejamento de intercâmbio.</p>
<ul><li><a href="privacidade/">Política de Privacidade</a></li><li><a href="termos/">Termos de Uso</a></li><li><a href="excluir-dados/">Como excluir seus dados</a></li></ul>
</body></html>`,
);
// Sem isto, o GitHub Pages tenta processar a pasta com Jekyll.
fs.writeFileSync(path.join(root, '.nojekyll'), '');
console.log('docs/index.html');

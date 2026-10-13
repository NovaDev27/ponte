// Deixa o Node achar arquivos .ts importados sem extensão (como o app faz), só para os testes.
import { register } from 'node:module';

register('./resolver-ts.mjs', import.meta.url);

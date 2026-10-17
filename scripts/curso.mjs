// Propone un módulo nuevo a partir de las piezas existentes: node scripts/curso.mjs "tema".
// La lógica vive en src/lib/curso (TypeScript, con dependencias de Vite), así que se ejecuta bajo Vite.
import { fileURLToPath } from 'node:url';
import { runnerImport } from 'vite';

const { module } = await runnerImport(fileURLToPath(new URL('../src/lib/curso/cli.ts', import.meta.url)));
await module.main(process.argv.slice(2));

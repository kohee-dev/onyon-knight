#!/usr/bin/env node
// Genera los PDF (teoría de cada unidad y cada caso) imprimiendo su página con Chromium. Caché por huella de contenido.
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sirv from 'sirv';
import { calcularHuella } from './lib/huella.mjs';
import { describirEntrada, guardarAtomico, versionesGenerador } from './lib/pdf-utiles.mjs';

const args = process.argv.slice(2);
const dist = resolve(args.includes('--dist') ? args[args.indexOf('--dist') + 1] : 'dist');
const base = (process.env.BASE_PATH ?? '/').replace(/\/?$/, '/');
const cache = resolve(process.env.PDF_CACHE ?? '.cache/pdf');
const concurrencia = Number(process.env.PDF_CONCURRENCIA ?? 4);
const TIEMPO_MAXIMO = 60_000;

const inicio = Date.now();
const manifiesto = JSON.parse(readFileSync(join(dist, 'pdf-manifest.json'), 'utf8'));
mkdirSync(cache, { recursive: true });

// Servidor estático de dist/ montado en BASE_PATH.
const estatico = sirv(dist, { dev: true });
const servidor = createServer((req, res) => {
  if (!req.url.startsWith(base)) return void res.writeHead(404).end();
  req.url = '/' + req.url.slice(base.length);
  estatico(req, res, () => res.writeHead(404).end());
});
await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
const origen = `http://127.0.0.1:${servidor.address().port}`;

const leerRecurso = (url) => {
  if (!url.startsWith(base)) return null;
  const ruta = join(dist, decodeURIComponent(url.slice(base.length)));
  return existsSync(ruta) && statSync(ruta).isFile() ? readFileSync(ruta) : null;
};

const navegador = await chromium.launch();
const versiones = versionesGenerador(
  [fileURLToPath(import.meta.url), fileURLToPath(new URL('./lib/huella.mjs', import.meta.url)), fileURLToPath(new URL('./lib/pdf-utiles.mjs', import.meta.url))],
  navegador.version(),
);

let renderizados = 0;
let reutilizados = 0;
const usadas = new Set();
const fallos = [];

async function generar(entrada) {
  const html = readFileSync(join(dist, entrada.ruta.slice(base.length), 'index.html'), 'utf8');
  const huella = calcularHuella(html, leerRecurso, versiones);
  const enCache = join(cache, `${huella}.pdf`);
  const destino = join(dist, entrada.salida);
  usadas.add(`${huella}.pdf`);
  mkdirSync(dirname(destino), { recursive: true });
  if (existsSync(enCache)) {
    copyFileSync(enCache, destino);
    reutilizados++;
    return;
  }
  const pagina = await navegador.newPage();
  try {
    await pagina.goto(origen + entrada.ruta, { waitUntil: 'load', timeout: TIEMPO_MAXIMO });
    await pagina.emulateMedia({ media: 'print', colorScheme: 'light' });
    await pagina.waitForFunction('window.__onyonListo === true', null, { timeout: TIEMPO_MAXIMO });
    const error = await pagina.evaluate('window.__onyonError');
    if (error) throw new Error(`la página informó de un error: ${error}`);
    const opciones = {
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: `<div style="font: 8pt Arial, Helvetica, sans-serif; color: #666; width: 100%; padding: 0 16mm; text-align: right;">${entrada.pie} · página <span class="pageNumber"></span> de <span class="totalPages"></span></div>`,
    };
    await guardarAtomico(enCache, (tmp) => pagina.pdf({ ...opciones, path: tmp }));
    copyFileSync(enCache, destino);
    renderizados++;
  } catch (e) {
    rmSync(enCache, { force: true });
    fallos.push(`${describirEntrada(entrada)}: ${e.message.split('\n')[0]}`);
  } finally {
    await pagina.close();
  }
}

const cola = [...manifiesto];
await Promise.all(
  Array.from({ length: Math.max(1, concurrencia) }, async () => {
    while (cola.length) await generar(cola.shift());
  }),
);
await navegador.close();
servidor.close();

if (fallos.length) {
  console.error(`PDF: ${fallos.length} fallaron:\n  ${fallos.join('\n  ')}`);
  process.exit(1);
}
for (const n of readdirSync(cache)) if (!usadas.has(n)) rmSync(join(cache, n)); // también temporales huérfanos
console.log(`PDF: ${renderizados} renderizados, ${reutilizados} reutilizados, ${((Date.now() - inicio) / 1000).toFixed(1)} s`);

import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { beforeAll, describe, expect, it } from 'vitest';
import { construir, entornoLimpio } from './util';

const entorno = { ONYON_CONTENIDO: resolve('tests/fixtures/valido'), BASE_PATH: '/ok/', SITE_URL: 'https://ej.es' };
let dist = '';
let cache = '';
let primera = '';

const generarPdfs = () =>
  execFileSync('node', ['scripts/pdf.mjs', '--dist', dist], {
    env: entornoLimpio({ ...entorno, PDF_CACHE: cache }),
    encoding: 'utf8',
  });

beforeAll(() => {
  dist = construir(entorno);
  cache = mkdtempSync(join(tmpdir(), 'onyon-cache-'));
  primera = generarPdfs();
}, 300_000);

describe('PDF por unidad', () => {
  it('genera un PDF por unidad con licencias, fecha y sin URLs locales', async () => {
    const ruta = join(dist, 'pdf/aso-ut1.pdf');
    expect(existsSync(ruta)).toBe(true);
    expect(existsSync(join(dist, 'pdf/som-ut3.pdf'))).toBe(true);
    const doc = await getDocument({ data: new Uint8Array(readFileSync(ruta)) }).promise;
    expect(doc.numPages).toBeGreaterThanOrEqual(2);
    let texto = '';
    const uris: string[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const pagina = await doc.getPage(i);
      texto += (await pagina.getTextContent()).items.map((it: any) => it.str).join(' ') + '\n';
      for (const a of await pagina.getAnnotations()) if (a.url) uris.push(a.url);
    }
    expect(texto).toContain('Licencias y fuentes');
    expect(texto).toMatch(/Actualizado el|Sin publicar/);
    expect(texto).toContain('ASO · UT1');
    expect(texto).toContain('Diagrama de estados'); // pie de figura visible al imprimir
    expect(uris.length).toBeGreaterThan(0);
    for (const u of [...uris, texto]) {
      expect(u).not.toContain('127.0.0.1');
      expect(u).not.toContain('localhost');
    }
    expect(primera).toMatch(/PDF: 2 renderizados, 0 reutilizados/);
  });

  it('reutiliza la caché si nada cambia', () => {
    expect(generarPdfs()).toMatch(/PDF: 0 renderizados, 2 reutilizados/);
  });
});

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
    expect(primera).toMatch(/PDF: 5 renderizados, 0 reutilizados/);
  });

  it('reutiliza la caché si nada cambia', () => {
    expect(generarPdfs()).toMatch(/PDF: 0 renderizados, 5 reutilizados/);
  });
});

async function leerPdf(ruta: string): Promise<{ texto: string; uris: string[]; paginas: number }> {
  const doc = await getDocument({ data: new Uint8Array(readFileSync(ruta)) }).promise;
  let texto = '';
  const uris: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const pagina = await doc.getPage(i);
    texto += (await pagina.getTextContent()).items.map((it: any) => it.str).join(' ') + '\n';
    for (const a of await pagina.getAnnotations()) if (a.url) uris.push(a.url);
  }
  return { texto, uris, paginas: doc.numPages };
}

describe('PDF de los casos', () => {
  it('cada caso tiene su PDF con portada, duración, licencias y pie', async () => {
    const { texto, uris } = await leerPdf(join(dist, 'pdf/aso-ut1/caso-ldap.pdf'));
    expect(texto).toContain('Caso LDAP en Elpis');
    expect(texto).toMatch(/caso práctico/i);
    expect(texto).toContain('2 h');
    expect(texto).toContain('Licencias y fuentes');
    expect(texto).toContain('ASO · UT1 · Caso práctico');
    for (const u of [...uris, texto]) expect(u).not.toContain('127.0.0.1');
  });

  it('una unidad sin teoría solo tiene PDFs de casos', () => {
    expect(existsSync(join(dist, 'pdf/aso-ut2/caso-solo.pdf'))).toBe(true);
    expect(existsSync(join(dist, 'pdf/aso-ut2.pdf'))).toBe(false);
  });

  it('el PDF de teoría termina con los casos de la unidad', async () => {
    const { texto, uris } = await leerPdf(join(dist, 'pdf/aso-ut1.pdf'));
    expect(texto).toContain('Casos prácticos de esta unidad');
    expect(uris).toContain('https://ej.es/ok/aso/ut1/casos/caso-ldap/');
    expect(texto).not.toContain('Elpis necesita un directorio'); // el contenido del caso no va en la teoría
  });
});

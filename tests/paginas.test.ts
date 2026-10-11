import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { construir } from './util';

const PIE = '© Alejandro Bartolomé · CC BY-SA 4.0, salvo indicación expresa';
let dist = '';
const leer = (ruta: string) => readFileSync(join(dist, ruta), 'utf8');

beforeAll(() => {
  dist = construir({ ONYON_CONTENIDO: resolve('tests/fixtures/valido'), BASE_PATH: '/ok/', SITE_URL: 'https://ej.es' });
});

describe('páginas', () => {
  it('portada: módulos activos y últimos cambios', () => {
    const h = leer('index.html');
    expect(h).toContain('Administración de sistemas operativos');
    expect(h).toContain('Sistemas operativos monopuesto');
    expect(h).not.toContain('Servicios de red e internet');
    expect(h).toContain('Últimos cambios');
  });

  it('portada: tarjetas por categoría con su icono', () => {
    const h = leer('index.html');
    expect(h).toMatch(/<li class="tarjeta cat-asir"[\s\S]*?<svg[^>]*aria-hidden="true"[\s\S]*?ASIR/);
    expect(h).toMatch(/<li class="tarjeta cat-smr"/);
  });

  it('botón de tema: solo «Modo oscuro» / «Modo claro»', () => {
    const h = leer('index.html');
    expect(h).toContain('class="tema-boton"');
    expect(h).toMatch(/<span class="tema-a-oscuro">Modo oscuro<\/span>/);
    expect(h).toMatch(/<span class="tema-a-claro">Modo claro<\/span>/);
    expect(h).toContain('aria-label="Cambiar a modo oscuro"');
    expect(h).not.toMatch(/Paladín|Caballero/);
    // El tema se aplica antes de pintar: script en línea en <head>.
    expect(h).toMatch(/<head>[\s\S]*data-tema[\s\S]*<\/head>/);
  });

  it('módulo: franja de su categoría', () => {
    expect(leer('aso/index.html')).toMatch(/class="franja-modulo cat-asir"/);
  });

  it('módulo: unidades con fecha y PDF', () => {
    const h = leer('aso/index.html');
    expect(h).toContain('Gestión de procesos');
    expect(h).toMatch(/class="fecha[ "]/);
    expect(h).toContain('href="/ok/pdf/aso-ut1.pdf"');
  });

  it('unidad: piezas en orden, índice y licencias', () => {
    const h = leer('aso/ut1/index.html');
    const i1 = h.indexOf('id="procesos-concepto"');
    const i2 = h.indexOf('id="procesos-estados"');
    expect(i1).toBeGreaterThan(0);
    expect(i2).toBeGreaterThan(i1);
    expect(h).not.toContain('id="procesos-linux"'); // borrador
    expect(h).toContain('href="#procesos-estados"');
    expect(h).toContain('Licencias y fuentes');
    expect(h).toContain('CC BY-SA 4.0');
    expect(h).toContain('Stallings, Operating Systems');
    expect(h).toContain('Usuario «Ehamberg», Wikimedia Commons');
    expect(h).toContain('href="#procesos-concepto"'); // enlace wiki dentro de la unidad
  });

  it('pieza: aparece en', () => {
    const h = leer('apuntes/procesos-concepto/index.html');
    expect(h).toContain('Aparece en');
    expect(h).toContain('href="/ok/aso/ut1/"');
    expect(h).toContain('href="/ok/som/ut3/"');
  });

  it('las piezas sueltas también se publican', () => {
    expect(leer('apuntes/suelta/index.html')).toContain('Pieza suelta');
  });

  it('licencias del sitio', () => {
    const h = leer('licencias/index.html');
    expect(h).toContain('Usuario «Ehamberg», Wikimedia Commons');
    expect(h).toContain('JetBrains Mono');
    expect(h).toContain('SIL Open Font License 1.1');
  });

  it('las imágenes se publican', () => {
    const src = /src="\/ok\/(img\/[0-9a-f]{8}-cpu\.png)"/.exec(leer('aso/ut1/index.html'))![1];
    expect(readFileSync(join(dist, src)).subarray(1, 4).toString()).toBe('PNG');
  });

  it('solo publica las imágenes que usa alguna pieza publicada', () => {
    const publicadas = readdirSync(join(dist, 'img'));
    expect(publicadas.some((n) => n.endsWith('-cpu.png'))).toBe(true);
    expect(publicadas.some((n) => n.includes('huerfana'))).toBe(false);
  });

  it('todas las páginas llevan el pie de licencia', () => {
    for (const r of ['index.html', 'aso/index.html', 'aso/ut1/index.html', 'apuntes/suelta/index.html', 'licencias/index.html']) {
      expect(leer(r)).toContain(PIE);
    }
  });

  it('manifiesto de PDFs', () => {
    const m = JSON.parse(leer('pdf-manifest.json'));
    expect(m).toEqual([
      { modulo: 'aso', unidad: 'ut1', ruta: '/ok/aso/ut1/', salida: 'pdf/aso-ut1.pdf', pie: 'ASO · UT1' },
      { modulo: 'som', unidad: 'ut3', ruta: '/ok/som/ut3/', salida: 'pdf/som-ut3.pdf', pie: 'SOM · UT3' },
    ]);
  });
});

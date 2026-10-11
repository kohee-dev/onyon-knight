import { existsSync, mkdtempSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { describirEntrada, guardarAtomico, versionesGenerador } from '../scripts/lib/pdf-utiles.mjs';
import { calcularHuella } from '../scripts/lib/huella.mjs';

describe('guardarAtomico', () => {
  it('si la escritura falla, no deja ni el archivo final ni el temporal', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'onyon-atomico-'));
    const final = join(dir, 'x.pdf');
    await expect(
      guardarAtomico(final, async (tmp: string) => {
        writeFileSync(tmp, 'a medias');
        throw new Error('corte');
      }),
    ).rejects.toThrow('corte');
    expect(existsSync(final)).toBe(false);
    expect(readdirSync(dir)).toEqual([]);
  });

  it('si va bien, el archivo final aparece completo', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'onyon-atomico-'));
    const final = join(dir, 'x.pdf');
    await guardarAtomico(final, async (tmp: string) => writeFileSync(tmp, 'completo'));
    expect(readdirSync(dir)).toEqual(['x.pdf']);
  });
});

describe('describirEntrada', () => {
  it('nombra el caso', () => {
    expect(describirEntrada({ tipo: 'caso', modulo: 'aso', unidad: 'ut1', caso: 'gatos' })).toBe('caso aso/ut1/gatos');
    expect(describirEntrada({ tipo: 'unidad', modulo: 'aso', unidad: 'ut1' })).toBe('unidad aso/ut1');
  });
});

describe('versionesGenerador', () => {
  it('cambia si cambia cualquiera de los archivos del generador', () => {
    const dir = mkdtempSync(join(tmpdir(), 'onyon-vers-'));
    const a = join(dir, 'pdf.mjs');
    const b = join(dir, 'huella.mjs');
    writeFileSync(a, '1');
    writeFileSync(b, '1');
    const v1 = versionesGenerador([a, b], 'chrome 1');
    writeFileSync(b, '2');
    expect(versionesGenerador([a, b], 'chrome 1')).not.toBe(v1);
  });
});

describe('calcularHuella: recursos marcados', () => {
  it('no tiene en cuenta las secciones marcadas con data-huella="ignorar" (no se imprimen)', () => {
    const html = (img: string) =>
      `<p>Teoría</p><section class="casos" data-huella="ignorar"><h2>Casos</h2><img src="${img}"></section><p>Fin</p>`;
    const leer = (u: string) => Buffer.from(u);
    expect(calcularHuella(html('/ok/img/aaa-portada.png'), leer, 'v')).toBe(calcularHuella(html('/ok/img/bbb-portada.png'), leer, 'v'));
    expect(calcularHuella('<p>Teoría 2</p>', leer, 'v')).not.toBe(calcularHuella('<p>Teoría</p>', leer, 'v'));
  });
});

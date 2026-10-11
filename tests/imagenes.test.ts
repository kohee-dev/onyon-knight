import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { listarImagenes, urlImagen } from '../src/lib/imagenes-url';
import { renderizarPieza } from '../src/lib/markdown';
import { ErrorContenido } from '../src/lib/tipos';
import { contexto, piezaMd } from './util-md';

const rutaPieza = resolve('tests/fixtures/img/pieza.md');

async function render(cuerpo: string) {
  const p = piezaMd('a', cuerpo, { rutaAbs: rutaPieza });
  return renderizarPieza(p, contexto([p]));
}

async function error(cuerpo: string): Promise<string> {
  try {
    await render(cuerpo);
  } catch (e) {
    expect(e).toBeInstanceOf(ErrorContenido);
    return (e as Error).message;
  }
  throw new Error('no lanzó error');
}

const texto = (html: string) => html.replace(/<[^>]+>/g, '');

describe('imágenes', () => {
  it('genera una figura con su crédito', async () => {
    const r = await render('![Procesador](./img/cpu.png)');
    expect(r.html).toMatch(/^<figure class="figura"><img src="\/ok\/img\/[0-9a-f]{8}-cpu\.png" alt="Procesador"/);
    expect(r.html).toContain('<figcaption>');
    const t = texto(r.html);
    expect(t).toContain('Procesador');
    expect(t).toContain('Usuario «Ehamberg», Wikimedia Commons · CC BY-SA 3.0 · Fuente');
    expect(r.html).toContain('href="https://creativecommons.org/licenses/by-sa/3.0/deed.es"');
    expect(r.html).toContain('href="https://commons.wikimedia.org/wiki/File:CPU.png"');
    expect(r.imagenes[0].ficha.autor).toBe('Usuario «Ehamberg», Wikimedia Commons');
    expect(r.imagenes[0].rutaFicha).toBe(resolve('tests/fixtures/img/img/cpu.yml'));
    expect(r.html).not.toContain('<p><figure');
  });

  it('aplica los atributos de tamaño y posición', async () => {
    const r = await render('![Procesador](./img/cpu.png){.mediana .derecha}');
    expect(r.html).toContain('<figure class="figura fig-mediana fig-derecha">');
    expect(r.html).not.toContain('{.mediana');
  });

  it('rechaza clases desconocidas', async () => {
    expect(await error('![P](./img/cpu.png){.gigante}')).toContain('clase de imagen desconocida «gigante»');
  });

  it('exige la ficha indicando la línea y el archivo esperado', async () => {
    const m = await error('Hola\n\n![Sin ficha](./img/sin-ficha.png)');
    expect(m).toContain('a.md:3');
    expect(m).toContain('img/sin-ficha.yml');
  });

  it('exige texto alternativo', async () => {
    expect(await error('![](./img/cpu.png)')).toContain('texto alternativo');
  });

  it('rechaza imágenes remotas', async () => {
    expect(await error('![x](https://ejemplo.org/x.png)')).toContain('imagen remota no permitida');
  });

  it('rechaza imágenes inexistentes', async () => {
    expect(await error('![x](./img/no.png)')).toContain('imagen inexistente');
  });

  it('informa de fichas con YAML inválido', async () => {
    expect(await error('![x](./img/mala.png)')).toContain('mala.yml');
  });

  it('exige que la imagen vaya en su propio párrafo', async () => {
    expect(await error('Texto ![x](./img/cpu.png) más texto')).toContain('propio párrafo');
  });

  it('marca el uso no comercial', async () => {
    expect(texto((await render('![x](./img/nc.png)')).html)).toContain('uso no comercial');
  });

  it('indica las modificaciones', async () => {
    expect(texto((await render('![x](./img/mod.png)')).html)).toContain('Modificada: Traducida al castellano');
  });

  it('acredita las imágenes propias sin fuente', async () => {
    const t = texto((await render('![x](./img/propia.png)')).html);
    expect(t).toContain('Alejandro Bartolomé · CC BY-SA 4.0');
    expect(t).not.toContain('Fuente');
  });
});

describe('urlImagen y listarImagenes', () => {
  it('genera URLs por contenido y nombres seguros', () => {
    const a = urlImagen(resolve('tests/fixtures/img/img/cpu.png'), '/ok/');
    expect(a).toMatch(/^\/ok\/img\/[0-9a-f]{8}-cpu\.png$/);
    expect(urlImagen(resolve('tests/fixtures/img/img/nc.png'), '/ok/')).not.toBe(a.replace('cpu', 'nc'));
  });

  it('lista las imágenes de las carpetas dadas', () => {
    const lista = listarImagenes([resolve('tests/fixtures/img'), resolve('no-existe')]);
    expect(lista.map((r) => r.split('/').at(-1)).sort()).toEqual(['cpu.png', 'mala.png', 'mod.png', 'nc.png', 'propia.png', 'sin-ficha.png']);
  });
});

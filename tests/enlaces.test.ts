import { describe, expect, it } from 'vitest';
import { renderizarPieza } from '../src/lib/markdown';
import { ErrorContenido, type PiezaFuente } from '../src/lib/tipos';
import { contexto, piezaMd } from './util-md';

const b = piezaMd('b', 'Cuerpo de B');

async function render(cuerpo: string, opciones: Parameters<typeof contexto>[1] = {}, otras: PiezaFuente[] = [b]) {
  const a = piezaMd('a', cuerpo);
  const ctx = contexto([a, ...otras], opciones);
  return { html: (await renderizarPieza(a, ctx)).html, ctx };
}

async function error(cuerpo: string, otras: PiezaFuente[] = [b]): Promise<string> {
  try {
    await render(cuerpo, {}, otras);
  } catch (e) {
    expect(e).toBeInstanceOf(ErrorContenido);
    return (e as Error).message;
  }
  throw new Error('no lanzó error');
}

describe('enlaces wiki', () => {
  it('enlaza a la página de la pieza con su título', async () => {
    expect((await render('Ver [[b]].')).html).toContain('<a href="/ok/apuntes/b/">Título de B</a>');
  });

  it('usa el texto alternativo', async () => {
    expect((await render('Ver [[b|el ciclo]].')).html).toContain('>el ciclo</a>');
  });

  it('usa un ancla si la pieza está en la misma unidad', async () => {
    expect((await render('Ver [[b]].', { unidad: ['a', 'b'] })).html).toContain('href="#b"');
  });

  it('usa una URL absoluta si la pieza está fuera de la unidad', async () => {
    expect((await render('Ver [[b]].', { unidad: ['a'] })).html).toContain('href="https://ej.es/ok/apuntes/b/"');
  });

  it('falla con enlaces rotos indicando la línea', async () => {
    const m = await error('Intro\n\nVer [[nada]].');
    expect(m).toContain('a.md:3');
    expect(m).toContain('enlace roto «nada»');
  });

  it('no permite enlazar contenido privado desde contenido público', async () => {
    const privada = piezaMd('secreta', 'x', { privado: true });
    expect(await error('Ver [[secreta]].', [privada])).toContain('enlace a contenido privado «secreta»');
  });

  it('convierte en texto los enlaces a borradores al publicar y avisa', async () => {
    const borrador = piezaMd('c', 'x', { borrador: true, titulo: 'Pieza C' });
    const { html, ctx } = await render('Ver [[c]].', { modo: 'publicacion' }, [borrador]);
    expect(html).toContain('Ver Pieza C.');
    expect(html).not.toContain('<a');
    expect(ctx.catalogo.avisos.join('\n')).toContain('a: enlace a un borrador «c»');
  });

  it('no transforma el código', async () => {
    const { html } = await render('Usa `[[b]]`\n\n```\n[[b]]\n```');
    expect(html).not.toContain('<a');
  });
});

describe('enlaces Markdown normales', () => {
  it('permite http(s), mailto y anclas', async () => {
    const { html } = await render('[a](https://x.es) [b](mailto:a@b.es) [c](#sec)');
    expect(html).toContain('href="https://x.es"');
    expect(html).toContain('href="mailto:a@b.es"');
    expect(html).toContain('href="#sec"');
  });

  it('convierte las rutas absolutas del sitio en URL completas dentro de una unidad', async () => {
    expect((await render('[s](/ok/apuntes/b/)', { unidad: ['a'] })).html).toContain('href="https://ej.es/ok/apuntes/b/"');
  });

  it('rechaza rutas relativas sugiriendo [[id]]', async () => {
    const m = await error('Intro\n\n[x](../b.md)');
    expect(m).toContain('a.md:3');
    expect(m).toContain('[[id]]');
  });

  it('rechaza esquemas no permitidos', async () => {
    expect(await error('[js](javascript:alert(1))')).toContain('enlace no permitido «javascript:alert(1)»');
  });
});

describe('enlaces con teoría y casos de la unidad', () => {
  const c = piezaMd('c', 'Caso C');
  const d = piezaMd('d', 'Caso D');

  it('desde la teoría, un caso de la unidad enlaza a su página', async () => {
    const { html } = await render('Ver [[c]].', { unidad: ['a'], casos: ['c'] }, [c]);
    expect(html).toContain('href="https://ej.es/ok/aso/ut1/casos/c/"');
  });

  it('desde un caso: ancla a sí mismo, teoría de la unidad y otros casos', async () => {
    const pc = piezaMd('c', 'Yo [[c]], teoría [[a]], otro [[d]].');
    const a = piezaMd('a', 'Teoría');
    const ctx = contexto([pc, a, d], { unidad: ['c'], teoria: ['a'], casos: ['c', 'd'] });
    const html = (await renderizarPieza(pc, ctx)).html;
    expect(html).toContain('href="#c"');
    expect(html).toContain('href="https://ej.es/ok/aso/ut1/#a"');
    expect(html).toContain('href="https://ej.es/ok/aso/ut1/casos/d/"');
  });
});

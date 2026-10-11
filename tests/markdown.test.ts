import { describe, expect, it } from 'vitest';
import { renderizarPieza } from '../src/lib/markdown';
import { ErrorContenido } from '../src/lib/tipos';
import { contexto, piezaMd } from './util-md';

async function html(cuerpo: string, unidad?: string[]) {
  const p = piezaMd('a', cuerpo);
  return (await renderizarPieza(p, contexto([p], { unidad }))).html;
}

async function error(cuerpo: string): Promise<string> {
  const p = piezaMd('a', cuerpo);
  try {
    await renderizarPieza(p, contexto([p]));
  } catch (e) {
    expect(e).toBeInstanceOf(ErrorContenido);
    return (e as Error).message;
  }
  throw new Error('no lanzó error');
}

describe('recuadros', () => {
  it('convierte :::ejercicio en un aside con rótulo', async () => {
    const h = await html(':::ejercicio\nHaz X\n:::');
    expect(h).toContain('<aside class="recuadro recuadro-ejercicio">');
    expect(h).toContain('Ejercicio');
    expect(h).toContain('Haz X');
  });

  it('acepta la sintaxis antigua con espacio y espacios finales', async () => {
    expect(await html('::: nota\nUna nota\n:::')).toContain('recuadro-nota');
    expect(await html('::: aviso \nCuidado\n::: ')).toContain('recuadro-aviso');
  });

  it('rechaza recuadros desconocidos indicando la línea', async () => {
    const m = await error('Hola\n\n:::peligro\nX\n:::');
    expect(m).toContain('recuadro desconocido «peligro»');
    expect(m).toContain('a.md:3');
  });

  it('detecta recuadros sin cerrar', async () => {
    const m = await error('Intro\n\n:::nota\nNunca se cierra\n\nMás texto');
    expect(m).toContain('a.md:3');
    expect(m).toContain('sin cerrar');
  });

  it('conserva literal el texto con dos puntos', async () => {
    const h = await html('chown root:root fichero\n\nC:\\Windows\\System32\n\npuerto ldap:389\n\nfe80::1\n\n::nota en línea');
    expect(h).toContain('chown root:root fichero');
    expect(h).toContain('C:\\Windows\\System32');
    expect(h).toContain('puerto ldap:389');
    expect(h).toContain('fe80::1');
    expect(h).toContain('::nota en línea');
  });
});

describe('encabezados', () => {
  it('desplaza los niveles según el contexto', async () => {
    expect(await html('# A\n\n## B')).toMatch(/<h2[^>]*>A<\/h2>[\s\S]*<h3[^>]*>B<\/h3>/);
    expect(await html('# A\n\n## B', ['a'])).toMatch(/<h3[^>]*>A<\/h3>[\s\S]*<h4[^>]*>B<\/h4>/);
    expect(await html('## A\n\n### B')).toMatch(/<h2[^>]*>A<\/h2>[\s\S]*<h3[^>]*>B<\/h3>/);
  });

  it('marca el nivel relativo de cada título (para su estilo)', async () => {
    const h = await html('# A\n\n## B\n\n### C', ['a']);
    expect(h).toMatch(/<h3[^>]*class="titulo-1"[^>]*>A/);
    expect(h).toMatch(/<h4[^>]*class="titulo-2"[^>]*>B/);
    expect(h).toMatch(/<h5[^>]*class="titulo-3"[^>]*>C/);
  });

  it('prefija los ids con el id de la pieza', async () => {
    const p1 = piezaMd('procesos-estados', '# Introducción');
    const p2 = piezaMd('procesos-concepto', '# Introducción');
    const ctx = contexto([p1, p2], { unidad: ['procesos-estados', 'procesos-concepto'] });
    const h1 = (await renderizarPieza(p1, ctx)).html;
    const h2 = (await renderizarPieza(p2, ctx)).html;
    expect(h1).toContain('id="procesos-estados--introduccion"');
    expect(h2).toContain('id="procesos-concepto--introduccion"');
  });
});

describe('bloques de código', () => {
  it('deja mermaid para el cliente', async () => {
    const p = piezaMd('a', '```mermaid\nflowchart LR\n  A --> B\n```');
    const r = await renderizarPieza(p, contexto([p]));
    expect(r.html).toContain('<pre class="mermaid">');
    expect(r.html).toMatch(/<pre class="mermaid">flowchart LR\n  A --(>|&gt;) B<\/pre>/);
    expect(r.tieneMermaid).toBe(true);
  });

  it('resalta bash con shiki', async () => {
    expect(await html('```bash\nps aux\n```')).toContain('class="shiki');
  });

  it('no falla con lenguajes desconocidos', async () => {
    expect(await html('```ldif\ndn: cn=x\n```')).toContain('dn: cn=x');
  });
});

describe('HTML en línea', () => {
  it('es un error con sugerencia', async () => {
    const m = await error('Conecta con ssh <usuario>@host');
    expect(m).toContain('a.md:1');
    expect(m).toContain('HTML');
  });
});

import { recogerErrores } from '../src/lib/tipos';

describe('recogerErrores', () => {
  it('ejecuta todas las tareas y reúne todos los problemas', async () => {
    const fallo = (archivo: string) => async () => {
      throw new ErrorContenido([{ archivo, mensaje: 'mal' }]);
    };
    const err = await recogerErrores([fallo('a.md'), async () => 1, fallo('b.md')]).catch((e) => e);
    expect(err).toBeInstanceOf(ErrorContenido);
    expect(err.problemas.map((p: any) => p.archivo)).toEqual(['a.md', 'b.md']);
  });
  it('devuelve los resultados si no hay errores', async () => {
    expect(await recogerErrores([async () => 1, async () => 2])).toEqual([1, 2]);
  });
});

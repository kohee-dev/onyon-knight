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

  it('con recuadros anidados sin cerrar, nombra los dos y explica cómo anidar', async () => {
    const m = await error('Intro\n\n:::nota\nA\n\n:::ejercicio\nB\n:::');
    expect(m).toContain('a.md:6');
    expect(m).toContain('«ejercicio» sin cerrar, o «nota», que lo contiene');
    expect(m).toContain('::::nota');
  });

  it('convierte :::pregunta en un desplegable cerrado con la pregunta y la respuesta', async () => {
    const h = await html(':::pregunta[¿Qué es un **vdev**?]\nUn grupo de discos.\n:::');
    expect(h).toContain('<details class="recuadro recuadro-ejercicio pregunta">');
    expect(h).toContain('<summary>¿Qué es un <strong>vdev</strong>?</summary>');
    expect(h).toContain('<p>Un grupo de discos.</p>');
    expect(h).not.toContain('open');
    expect(h).not.toContain('recuadro-titulo');
  });

  it('una :::pregunta sin respuesta se muestra como recuadro normal, sin desplegable', async () => {
    const h = await html(':::pregunta[¿Qué es un vdev?]\n:::');
    expect(h).toContain('<aside class="recuadro recuadro-ejercicio">');
    expect(h).toContain('¿Qué es un vdev?');
    expect(h).not.toContain('<details');
    expect(h).not.toContain('Ejercicio');
  });

  it('la respuesta de una :::pregunta admite código y listas', async () => {
    const h = await html(':::pregunta[¿Cómo?]\n- uno\n- dos\n\n```bash\nzpool list\n```\n:::');
    expect(h).toContain('<li>uno</li>');
    expect(h).toContain('<pre');
    expect(h).toContain('zpool');
    expect(h).toContain('<details');
  });

  it('una :::pregunta sin texto de pregunta da error con la línea', async () => {
    const m = await error('Hola\n\n:::pregunta\nRespuesta\n:::');
    expect(m).toContain('a.md:3');
    expect(m).toContain('pregunta');
    expect(m).toContain('texto');
  });

  it('una :::pregunta sin cerrar da error con la línea', async () => {
    const m = await error('Hola\n\n:::pregunta[¿Qué?]\nRespuesta');
    expect(m).toContain('a.md:3');
    expect(m).toContain('sin cerrar');
  });

  it('no transforma :::pregunta dentro de un bloque de código', async () => {
    const h = await html('```text\n:::pregunta[¿Qué?]\nX\n:::\n```');
    expect(h).not.toContain('<details');
  });

  it('no reescribe «::: nota» dentro de un bloque de código', async () => {
    const h = await html('```text\n::: nota\n:::\n```\n\n~~~\n::: aviso\n~~~');
    expect(h).toContain('::: nota');
    expect(h).toContain('::: aviso');
    expect(h).not.toContain('<aside');
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

  it('permite fijar el nivel de los títulos (página de un caso: h2 tras el h1)', async () => {
    const p = piezaMd('a', '# A\n\n## B');
    const ctx = { ...contexto([p], { unidad: ['a'] }), nivelTitulos: 2 as const };
    expect((await renderizarPieza(p, ctx)).html).toMatch(/<h2[^>]*>A<\/h2>[\s\S]*<h3[^>]*>B<\/h3>/);
  });

  it('marca el nivel relativo de cada título (para su estilo)', async () => {
    const h = await html('# A\n\n## B\n\n### C', ['a']);
    expect(h).toMatch(/<h3[^>]*class="titulo-1"[^>]*>A/);
    expect(h).toMatch(/<h4[^>]*class="titulo-2"[^>]*>B/);
    expect(h).toMatch(/<h5[^>]*class="titulo-3"[^>]*>C/);
  });

  it('devuelve los títulos para el índice', async () => {
    const p = piezaMd('p', '# A\n\n## B\n\n### C');
    const r = await renderizarPieza(p, contexto([p]));
    expect(r.titulos).toEqual([
      { id: 'p--a', texto: 'A', nivel: 1 },
      { id: 'p--b', texto: 'B', nivel: 2 },
      { id: 'p--c', texto: 'C', nivel: 3 },
    ]);
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

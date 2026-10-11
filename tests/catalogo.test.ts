import { describe, expect, it } from 'vitest';
import { construirCatalogo } from '../src/lib/catalogo';
import { esquemaModulo, esquemaPieza } from '../src/lib/esquemas';
import { ErrorContenido, type ModuloFuente, type PiezaFuente } from '../src/lib/tipos';

function pieza(id: string, extra: Partial<PiezaFuente> & { borrador?: boolean } = {}): PiezaFuente {
  const { borrador, ...resto } = extra;
  return {
    id,
    archivo: `contenido/piezas/${id}.md`,
    rutaAbs: `/r/contenido/piezas/${id}.md`,
    datos: esquemaPieza.parse({ titulo: `T ${id}`, borrador }),
    cuerpo: '',
    privado: false,
    ...resto,
  };
}

function modulo(id: string, unidades: { id: string; titulo?: string; piezas: string[] }[], extra: Record<string, unknown> = {}, privado = false): ModuloFuente {
  return {
    id,
    archivo: `contenido/modulos/${id}.yml`,
    rutaAbs: `/r/contenido/modulos/${id}.yml`,
    datos: esquemaModulo.parse({
      nombre: id.toUpperCase(),
      codigo: '0000',
      ciclo: 'ASIR',
      curso: 2,
      icono: 'terminal',
      unidades: unidades.map((u) => ({ titulo: u.id.toUpperCase(), ...u })),
      ...extra,
    }),
    privado,
  };
}

function problemas(fn: () => unknown): string {
  try {
    fn();
  } catch (e) {
    expect(e).toBeInstanceOf(ErrorContenido);
    return (e as Error).message;
  }
  throw new Error('no lanzó error');
}

describe('construirCatalogo', () => {
  it('detecta ids de pieza duplicados citando ambos archivos', () => {
    const a = pieza('procesos', { archivo: 'contenido/piezas/a/procesos.md' });
    const b = pieza('procesos', { archivo: 'privado:piezas/b/procesos.md', privado: true });
    const m = problemas(() => construirCatalogo([a, b], [], 'desarrollo'));
    expect(m).toContain('id de pieza duplicado «procesos»');
    expect(m).toContain('contenido/piezas/a/procesos.md');
    expect(m).toContain('privado:piezas/b/procesos.md');
  });

  it.each(['menu', 'casos-practicos', 'casos-de-esta-unidad', 'licencias-y-fuentes'])('reserva el id «%s» para la página', (id) => {
    expect(problemas(() => construirCatalogo([pieza(id)], [], 'desarrollo'))).toContain(`id de pieza reservado «${id}»`);
  });

  it('rechaza ids de pieza que no son slugs', () => {
    expect(problemas(() => construirCatalogo([pieza('Tema 1')], [], 'desarrollo'))).toContain('id de pieza no válido «Tema 1»');
  });

  it('rechaza licencias de pieza fuera del catálogo', () => {
    const p = pieza('a');
    p.datos.licencia = 'CC-XYZ';
    expect(problemas(() => construirCatalogo([p], [], 'desarrollo'))).toContain('licencia desconocida «CC-XYZ»');
  });

  it('detecta piezas inexistentes en un índice', () => {
    const m = problemas(() => construirCatalogo([], [modulo('aso', [{ id: 'ut1', piezas: ['no-existe'] }])], 'desarrollo'));
    expect(m).toContain('aso.yml');
    expect(m).toContain('pieza inexistente «no-existe»');
  });

  it('impide piezas privadas en módulos públicos', () => {
    const p = pieza('x', { privado: true });
    expect(problemas(() => construirCatalogo([p], [modulo('aso', [{ id: 'ut1', piezas: ['x'] }])], 'desarrollo'))).toContain(
      'pieza privada «x» en un módulo público',
    );
  });

  it('permite piezas privadas en módulos privados', () => {
    const p = pieza('x', { privado: true });
    const c = construirCatalogo([p], [modulo('tut', [{ id: 'u1', piezas: ['x'] }], {}, true)], 'desarrollo');
    expect(c.modulos[0].id).toBe('tut');
  });

  it('detecta una pieza repetida en la misma unidad', () => {
    expect(problemas(() => construirCatalogo([pieza('a')], [modulo('aso', [{ id: 'ut1', piezas: ['a', 'a'] }])], 'desarrollo'))).toContain(
      'ut1: pieza repetida «a»',
    );
  });

  it('detecta ids de módulo duplicados (p. ej. público y privado)', () => {
    const m = problemas(() =>
      construirCatalogo([pieza('a')], [modulo('aso', [{ id: 'ut1', piezas: ['a'] }]), modulo('aso', [{ id: 'ut2', piezas: ['a'] }], {}, true)], 'desarrollo'),
    );
    expect(m).toContain('id de módulo duplicado «aso»');
  });

  it('no publica una unidad cuyas piezas son todas borradores, y avisa', () => {
    const c = construirCatalogo(
      [pieza('a'), pieza('b', { borrador: true })],
      [modulo('aso', [{ id: 'ut1', piezas: ['a'] }, { id: 'ut2', piezas: ['b'] }])],
      'publicacion',
    );
    expect(c.modulos[0].datos.unidades.map((u) => u.id)).toEqual(['ut1']);
    expect(c.avisos).toContain('aso/ut2: todas sus piezas son borradores; la unidad no se publica');
  });

  it('detecta unidades duplicadas', () => {
    expect(
      problemas(() =>
        construirCatalogo([pieza('a')], [modulo('aso', [{ id: 'ut1', piezas: ['a'] }, { id: 'ut1', piezas: ['a'] }])], 'desarrollo'),
      ),
    ).toContain('unidad duplicada «ut1»');
  });

  it('valida el formato del id de unidad', () => {
    expect(problemas(() => construirCatalogo([pieza('a')], [modulo('aso', [{ id: 'UT 1', piezas: ['a'] }])], 'desarrollo'))).toContain(
      'id de unidad no válido «UT 1»',
    );
  });

  it('oculta módulos inactivos pero conserva sus piezas', () => {
    const c = construirCatalogo([pieza('a')], [modulo('aso', [{ id: 'ut1', piezas: ['a'] }], { activo: false })], 'publicacion');
    expect(c.modulos).toHaveLength(0);
    expect(c.piezas.has('a')).toBe(true);
  });

  it('en publicación retira los borradores y avisa', () => {
    const c = construirCatalogo(
      [pieza('a'), pieza('procesos-estados', { borrador: true })],
      [modulo('aso', [{ id: 'ut1', piezas: ['a', 'procesos-estados'] }])],
      'publicacion',
    );
    expect(c.piezas.has('procesos-estados')).toBe(false);
    expect(c.todas.has('procesos-estados')).toBe(true);
    expect(c.modulos[0].datos.unidades[0].piezas).toEqual(['a']);
    expect(c.avisos).toContain('aso/ut1: incluye borradores (procesos-estados)');
  });

  it('en desarrollo conserva los borradores', () => {
    const c = construirCatalogo([pieza('b', { borrador: true })], [modulo('aso', [{ id: 'ut1', piezas: ['b'] }])], 'desarrollo');
    expect(c.modulos[0].datos.unidades[0].piezas).toEqual(['b']);
  });

  it('en publicación excluye lo privado', () => {
    const c = construirCatalogo([pieza('x', { privado: true })], [modulo('tut', [{ id: 'u1', piezas: ['x'] }], {}, true)], 'publicacion');
    expect(c.piezas.has('x')).toBe(false);
    expect(c.modulos).toHaveLength(0);
  });

  it('calcula las apariciones N:M', () => {
    const c = construirCatalogo(
      [pieza('procesos-concepto')],
      [modulo('aso', [{ id: 'ut1', piezas: ['procesos-concepto'] }]), modulo('som', [{ id: 'ut3', piezas: ['procesos-concepto'] }])],
      'publicacion',
    );
    expect(c.apariciones.get('procesos-concepto')?.map((a) => `${a.modulo}/${a.unidad}`)).toEqual(['aso/ut1', 'som/ut3']);
  });

  it('informa de piezas huérfanas', () => {
    const c = construirCatalogo([pieza('suelta')], [], 'publicacion');
    expect(c.informe).toContain('pieza sin módulo: suelta');
  });

  it('rechaza ciclos sin categoría', () => {
    expect(problemas(() => construirCatalogo([], [modulo('aso', [], { ciclo: 'XYZ' })], 'desarrollo'))).toContain(
      'ciclo desconocido «XYZ»',
    );
  });

  it('rechaza iconos inexistentes', () => {
    expect(problemas(() => construirCatalogo([], [modulo('aso', [], { icono: 'dragon' })], 'desarrollo'))).toContain(
      'icono desconocido «dragon»',
    );
  });

  it('reúne todos los problemas en un solo error', () => {
    const m = problemas(() =>
      construirCatalogo([pieza('Mal')], [modulo('aso', [{ id: 'ut1', piezas: ['falta'] }])], 'desarrollo'),
    );
    expect(m).toContain('Mal');
    expect(m).toContain('falta');
  });
});

describe('esquema de casos', () => {
  const issues = (d: unknown) => JSON.stringify(esquemaPieza.safeParse(d).error?.issues ?? []);

  it('por defecto una pieza es teoría', () => {
    expect(esquemaPieza.parse({ titulo: 'x' }).tipo).toBe('teoria');
  });
  it('acepta un caso con horas decimales', () => {
    expect(esquemaPieza.safeParse({ titulo: 'x', tipo: 'caso', horas: 1.5 }).success).toBe(true);
  });
  it('rechaza tipos desconocidos indicando los válidos', () => {
    const m = issues({ titulo: 'x', tipo: 'borrador' });
    expect(m).toContain('teoria');
    expect(m).toContain('caso');
  });
  it('exige horas en los casos', () => {
    expect(issues({ titulo: 'x', tipo: 'caso' })).toContain('horas');
  });
  it('rechaza horas no positivas', () => {
    expect(esquemaPieza.safeParse({ titulo: 'x', tipo: 'caso', horas: 0 }).success).toBe(false);
  });
  it.each(['horas', 'portada', 'cabecera'])('prohíbe %s en la teoría', (campo) => {
    const m = issues({ titulo: 'x', [campo]: campo === 'horas' ? 2 : './img/a.png' });
    expect(m).toContain('solo en casos');
    expect(m).toContain(campo);
  });
});

describe('esquemas', () => {
  it('rechaza campos desconocidos en la pieza', () => {
    const r = esquemaPieza.safeParse({ titulo: 'x', borador: true });
    expect(r.success).toBe(false);
    expect(JSON.stringify(r.error?.issues)).toContain('borador');
  });

  it('aplica los valores por defecto', () => {
    expect(esquemaPieza.parse({ titulo: 'x' })).toEqual({ titulo: 'x', tipo: 'teoria', borrador: false, fuentes: [], licencia: 'CC-BY-SA-4.0' });
  });

  it('exige un icono en el módulo', () => {
    const r = esquemaModulo.safeParse({ nombre: 'a', codigo: '1', ciclo: 'SMR', curso: 1, unidades: [] });
    expect(r.success).toBe(false);
    expect(JSON.stringify(r.error?.issues)).toContain('icono');
  });

  it('ya no admite el campo color (lo da la categoría)', () => {
    expect(esquemaModulo.safeParse({ nombre: 'a', codigo: '1', ciclo: 'SMR', curso: 1, icono: 'red', color: '#ffffff', unidades: [] }).success).toBe(false);
  });
});

import { separarCabecera } from '../src/lib/cargador-piezas';

describe('separarCabecera', () => {
  it('separa la cabecera YAML del cuerpo', () => {
    expect(separarCabecera('---\ntitulo: X\n---\n\n# Hola\n')).toEqual({ datos: { titulo: 'X' }, cuerpo: '\n# Hola\n' });
  });
  it('sin cabecera devuelve datos vacíos', () => {
    expect(separarCabecera('# Hola')).toEqual({ datos: {}, cuerpo: '# Hola' });
  });
});

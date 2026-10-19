import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { leerTemas } from '../src/lib/temas';
import { ErrorContenido } from '../src/lib/tipos';

const archivo = (contenido?: string) => {
  const ruta = join(mkdtempSync(join(tmpdir(), 'onyon-temas-')), 'temas.yml');
  if (contenido !== undefined) writeFileSync(ruta, contenido);
  return ruta;
};

function error(fn: () => unknown): string {
  try {
    fn();
  } catch (e) {
    expect(e).toBeInstanceOf(ErrorContenido);
    return (e as Error).message;
  }
  throw new Error('no lanzó error');
}

describe('leerTemas', () => {
  it('lee la lista en orden', () => {
    expect(leerTemas(archivo('- id: redes\n  nombre: Redes\n- id: virtualizacion\n  nombre: Virtualización\n'))).toEqual([
      { id: 'redes', nombre: 'Redes' },
      { id: 'virtualizacion', nombre: 'Virtualización' },
    ]);
  });

  it('archivo ausente es lista vacía', () => {
    expect(leerTemas(archivo())).toEqual([]);
  });

  it('temas.yml vacío es lista vacía', () => {
    expect(leerTemas(archivo(''))).toEqual([]);
    expect(leerTemas(archivo('# nada\n'))).toEqual([]);
  });

  it('rechaza id repetido', () => {
    const m = error(() => leerTemas(archivo('- id: redes\n  nombre: A\n- id: redes\n  nombre: B\n')));
    expect(m).toContain('temas.yml');
    expect(m).toContain('tema repetido «redes»');
  });

  it('rechaza id que no es slug', () => {
    expect(error(() => leerTemas(archivo('- id: Redes\n  nombre: Redes\n')))).toContain('temas.yml');
  });

  it('rechaza campo desconocido', () => {
    expect(error(() => leerTemas(archivo('- id: redes\n  nombre: Redes\n  color: rojo\n')))).toContain('campo desconocido');
  });
});

describe('coste en astro dev', () => {
  // En dev cargarSitio() no se memoiza: cada llamada renderiza todo el sitio y lanza git log.
  // Los componentes que salen en todas las páginas (o una vez por pieza) no pueden usarlo.
  it('la cabecera, el menú y la etiqueta de tema no reconstruyen el sitio', async () => {
    const { readFileSync } = await import('node:fs');
    for (const c of ['Tema', 'DesplegableTemas', 'Menu']) {
      expect(readFileSync(`src/components/${c}.astro`, 'utf8'), c).not.toMatch(/import[^;]*cargarSitio|cargarSitio\(/);
    }
  });
});

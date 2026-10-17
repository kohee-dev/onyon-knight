import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { dificultadFinal, leerBloque, lectorBloques } from '../src/lib/bloques';
import { DIFICULTADES, esquemaPieza } from '../src/lib/esquemas';
import { ErrorContenido } from '../src/lib/tipos';

const carpeta = (contenido?: string) => {
  const dir = mkdtempSync(join(tmpdir(), 'onyon-bloque-'));
  if (contenido !== undefined) writeFileSync(join(dir, 'bloque.yml'), contenido);
  return dir;
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

describe('dificultad en la pieza', () => {
  it('esquemaPieza acepta los tres valores y su ausencia', () => {
    for (const v of DIFICULTADES) expect(esquemaPieza.parse({ titulo: 't', dificultad: v }).dificultad).toBe(v);
    expect(esquemaPieza.parse({ titulo: 't' }).dificultad).toBeUndefined();
  });

  it('esquemaPieza rechaza otro valor', () => {
    const r = esquemaPieza.safeParse({ titulo: 't', dificultad: 'facil' });
    expect(r.success).toBe(false);
    expect(JSON.stringify(r.error?.issues)).toContain('debe ser «basico», «intermedio» o «avanzado»');
  });
});

describe('leerBloque', () => {
  it('devuelve {} si no hay bloque.yml', () => {
    expect(leerBloque(carpeta())).toEqual({});
  });

  it('acepta un bloque.yml vacío', () => {
    expect(leerBloque(carpeta(''))).toEqual({});
    expect(leerBloque(carpeta('# solo comentario\n'))).toEqual({});
  });

  it('lee la dificultad', () => {
    expect(leerBloque(carpeta('dificultad: avanzado\n'))).toEqual({ dificultad: 'avanzado' });
  });

  it('rechaza valor no válido citando el archivo', () => {
    const m = error(() => leerBloque(carpeta('dificultad: facil\n')));
    expect(m).toContain('bloque.yml');
    expect(m).toContain('debe ser «basico»');
  });

  it('rechaza un campo desconocido', () => {
    expect(error(() => leerBloque(carpeta('titulo: X\n')))).toContain('bloque.yml');
  });

  it('rechaza YAML no válido citando el archivo', () => {
    const m = error(() => leerBloque(carpeta('dificultad: [\n')));
    expect(m).toContain('bloque.yml');
    expect(m).toContain('YAML no válido');
  });

  it('lectorBloques lee cada carpeta una vez', () => {
    const dir = carpeta('dificultad: basico\n');
    const leer = lectorBloques();
    expect(leer(dir)).toEqual({ dificultad: 'basico' });
    rmSync(join(dir, 'bloque.yml'));
    expect(leer(dir)).toEqual({ dificultad: 'basico' });
    expect(lectorBloques()(dir)).toEqual({});
  });
});

describe('dificultadFinal', () => {
  it('la de la pieza tiene prioridad sobre la del bloque', () => {
    expect(dificultadFinal('avanzado', carpeta('dificultad: basico\n'), lectorBloques())).toBe('avanzado');
  });

  it('sin la de la pieza, hereda la del bloque', () => {
    expect(dificultadFinal(undefined, carpeta('dificultad: basico\n'), lectorBloques())).toBe('basico');
  });

  it('valida el bloque.yml aunque la pieza tenga la suya', () => {
    expect(error(() => dificultadFinal('avanzado', carpeta('titulo: X\n'), lectorBloques()))).toContain('bloque.yml');
  });
});

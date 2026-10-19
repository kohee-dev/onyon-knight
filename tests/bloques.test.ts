import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolverBloques } from '../src/lib/bloques';
import { esquemaPieza } from '../src/lib/esquemas';
import { ErrorContenido } from '../src/lib/tipos';

/** Raíz temporal con las carpetas de bloque dadas (módulo/bloque) y, si se da, su bloques.yml. */
const raiz = (carpetas: string[], bloques?: string) => {
  const dir = mkdtempSync(join(tmpdir(), 'onyon-bloques-'));
  for (const c of carpetas) mkdirSync(join(dir, 'piezas', c), { recursive: true });
  if (bloques !== undefined) writeFileSync(join(dir, 'bloques.yml'), bloques);
  return dir;
};

const pieza = (id: string, bloque: string) => ({ id, bloque });
const GOBLINS = pieza('aldea-goblins', 'sor/active-directory');

const resolver = (dir: string, piezas: { id: string; bloque: string }[], archivo = 'contenido/bloques.yml') =>
  resolverBloques({ raiz: dir, archivo, piezas });

function error(fn: () => unknown): string {
  try {
    fn();
  } catch (e) {
    expect(e).toBeInstanceOf(ErrorContenido);
    return (e as Error).message;
  }
  throw new Error('no lanzó error');
}

const CENTRAL = `
sor:
  active-directory:
    tema: servicios-directorio
    dificultad: intermedio
    piezas:
      aldea-goblins: avanzado
  introduccion:
    tema: sistemas-operativos
    dificultad: basico
`;
const CARPETAS = ['sor/active-directory', 'sor/introduccion'];

describe('resolverBloques', () => {
  it('una pieza hereda tema y dificultad de su bloque y cita bloques.yml como origen del tema', () => {
    const r = resolver(raiz(CARPETAS, CENTRAL), [pieza('ad-intro', 'sor/active-directory'), GOBLINS]);
    expect(r.get('ad-intro')).toEqual({ tema: 'servicios-directorio', dificultad: 'intermedio', origenTema: 'contenido/bloques.yml' });
  });

  it('la excepción de una pieza gana en dificultad y no cambia el tema', () => {
    const r = resolver(raiz(CARPETAS, CENTRAL), [GOBLINS, pieza('otra', 'sor/active-directory')]);
    expect(r.get('aldea-goblins')).toMatchObject({ tema: 'servicios-directorio', dificultad: 'avanzado' });
    expect(r.get('otra')?.dificultad).toBe('intermedio');
  });

  it('la excepción puede bajar de nivel y valer en un bloque sin dificultad propia', () => {
    const dir = raiz(['a/b'], 'a:\n  b:\n    dificultad: avanzado\n    piezas:\n      p: intermedio\n');
    expect(resolver(dir, [pieza('p', 'a/b')]).get('p')?.dificultad).toBe('intermedio');
    const solo = raiz(['a/b'], 'a:\n  b:\n    piezas:\n      p: basico\n');
    expect(resolver(solo, [pieza('p', 'a/b')]).get('p')).toMatchObject({ dificultad: 'basico', tema: undefined });
  });

  it('sin fichero, vacío o solo comentarios: ninguna pieza tiene datos', () => {
    for (const contenido of [undefined, '', '# solo comentario\n']) {
      const r = resolver(raiz(['a/b'], contenido), [pieza('p', 'a/b')]);
      expect(r.get('p')).toEqual({ tema: undefined, dificultad: undefined, origenTema: undefined });
    }
  });

  it('un bloque sin entrada deja a sus piezas sin datos, sin error', () => {
    const r = resolver(raiz([...CARPETAS, 'sor/nuevo'], CENTRAL), [pieza('n', 'sor/nuevo'), GOBLINS]);
    expect(r.get('n')?.dificultad).toBeUndefined();
    expect(r.get('n')?.tema).toBeUndefined();
  });

  it('una pieza fuera de piezas/<módulo>/<bloque>/ no recibe datos', () => {
    const dir = raiz(CARPETAS, CENTRAL);
    const r = resolver(dir, [pieza('suelta', 'sor'), pieza('honda', 'sor/active-directory/sub'), GOBLINS]);
    expect(r.get('suelta')?.dificultad).toBeUndefined();
    expect(r.get('honda')?.tema).toBeUndefined();
  });

  it('las piezas de la lista cuentan como existentes aunque sean borradores (la lista las incluye todas)', () => {
    const dir = raiz(['a/b'], 'a:\n  b:\n    piezas:\n      borrador: basico\n');
    expect(resolver(dir, [pieza('borrador', 'a/b')]).get('borrador')?.dificultad).toBe('basico');
  });

  it('cita el nombre de fichero recibido (contenido privado)', () => {
    const dir = raiz(['a/b'], 'a:\n  b:\n    dificultad: facil\n');
    const m = error(() => resolver(dir, [pieza('p', 'a/b')], 'privado:bloques.yml'));
    expect(m).toContain('privado:bloques.yml');
    const r = resolver(raiz(['a/b'], 'a:\n  b:\n    tema: redes\n'), [pieza('p', 'a/b')], 'privado:bloques.yml');
    expect(r.get('p')?.origenTema).toBe('privado:bloques.yml');
  });

  describe('errores (todos citan bloques.yml)', () => {
    const p = [pieza('p', 'a/b')];

    it('dificultad no válida en un bloque', () => {
      const m = error(() => resolver(raiz(['a/b'], 'a:\n  b:\n    dificultad: facil\n'), p));
      expect(m).toContain('contenido/bloques.yml');
      expect(m).toContain('debe ser «basico»');
    });

    it('dificultad no válida en una excepción', () => {
      const m = error(() => resolver(raiz(['a/b'], 'a:\n  b:\n    piezas:\n      p: facil\n'), p));
      expect(m).toContain('contenido/bloques.yml');
      expect(m).toContain('debe ser «basico»');
    });

    it('tema que no es un identificador', () => {
      expect(error(() => resolver(raiz(['a/b'], 'a:\n  b:\n    tema: Redes X\n'), p))).toContain('debe ser un identificador de tema');
    });

    it('campo desconocido en un bloque, también «titulo»', () => {
      const m = error(() => resolver(raiz(['a/b'], 'a:\n  b:\n    titulo: X\n'), p));
      expect(m).toContain('contenido/bloques.yml');
      expect(m).toContain('campo desconocido «titulo»');
    });

    it('YAML no válido', () => {
      const m = error(() => resolver(raiz(['a/b'], 'a: [\n'), p));
      expect(m).toContain('contenido/bloques.yml');
      expect(m).toContain('YAML no válido');
    });

    it('entrada cuya carpeta de bloque no existe', () => {
      const m = error(() => resolver(raiz(['a/b'], 'a:\n  b:\n    dificultad: basico\n  c:\n    dificultad: basico\nz:\n  y:\n    tema: redes\n'), p));
      expect(m).toContain('contenido/bloques.yml');
      expect(m).toContain('a/c');
      expect(m).toContain('z/y');
    });

    it('una entrada que apunta a un fichero o a «..» no es una carpeta de bloque', () => {
      const dir = raiz(['a/b']);
      writeFileSync(join(dir, 'piezas', 'a', 'fichero'), '');
      writeFileSync(join(dir, 'bloques.yml'), 'a:\n  fichero:\n    tema: redes\n  "..":\n    tema: redes\n');
      const m = error(() => resolver(dir, p));
      expect(m).toContain('a/fichero');
      expect(m).toContain('a/..');
    });

    it('excepción con una pieza inexistente', () => {
      const m = error(() => resolver(raiz(['a/b'], 'a:\n  b:\n    piezas:\n      fantasma: basico\n'), p));
      expect(m).toContain('contenido/bloques.yml');
      expect(m).toContain('fantasma');
    });

    it('excepción con una pieza de otro bloque', () => {
      const dir = raiz(['a/b', 'a/c'], 'a:\n  b:\n    piezas:\n      q: basico\n');
      const m = error(() => resolver(dir, [pieza('p', 'a/b'), pieza('q', 'a/c')]));
      expect(m).toContain('contenido/bloques.yml');
      expect(m).toContain('q');
    });

    it('reúne todos los problemas en un solo error', () => {
      const m = error(() => resolver(raiz([], 'x:\n  y:\n    dificultad: basico\n    piezas:\n      p: basico\n'), p));
      expect(m).toContain('x/y');
      expect(m).toContain('«p»');
    });
  });
});

describe('cabecera de la pieza', () => {
  it('esquemaPieza rechaza «dificultad» y «tema»: viven en bloques.yml', () => {
    for (const [campo, valor] of [['dificultad', 'basico'], ['tema', 'redes']]) {
      const r = esquemaPieza.safeParse({ titulo: 't', [campo]: valor });
      expect(r.success).toBe(false);
      expect(JSON.stringify(r.error?.issues)).toContain(campo);
    }
    expect(esquemaPieza.safeParse({ titulo: 't' }).success).toBe(true);
  });
});

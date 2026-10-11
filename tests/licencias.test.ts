import { describe, expect, it } from 'vitest';
import { licenciaPorId, validarFicha } from '../src/licencias';
import { ErrorContenido } from '../src/lib/tipos';

const F = 'contenido/piezas/so/img/x.yml';

function mensajeDe(fn: () => unknown): string {
  try {
    fn();
  } catch (e) {
    expect(e).toBeInstanceOf(ErrorContenido);
    return (e as Error).message;
  }
  throw new Error('no lanzó error');
}

describe('validarFicha', () => {
  it('autor propio aplica CC BY-SA 4.0 sin exigir fuente', () => {
    const f = validarFicha({ autor: 'propio' }, F);
    expect(f.propio).toBe(true);
    expect(f.licencia.id).toBe('CC-BY-SA-4.0');
    expect(f.fuente).toBeUndefined();
  });

  it('acepta una ficha completa de terceros', () => {
    const f = validarFicha(
      { autor: 'Ehamberg', fuente: 'https://commons.wikimedia.org/x', licencia: 'CC-BY-SA-3.0' },
      F,
    );
    expect(f.propio).toBe(false);
    expect(f.licencia.nombre).toContain('3.0');
  });

  it('exige fuente si no es propia', () => {
    expect(mensajeDe(() => validarFicha({ autor: 'X', licencia: 'CC-BY-4.0' }, F))).toContain('fuente');
  });

  it('rechaza licencias fuera del catálogo', () => {
    expect(
      mensajeDe(() => validarFicha({ autor: 'X', fuente: 'https://a', licencia: 'CC-BY-99' }, F)),
    ).toContain('licencia desconocida «CC-BY-99»');
  });

  it('rechaza cambios en una licencia ND', () => {
    expect(
      mensajeDe(() =>
        validarFicha({ autor: 'X', fuente: 'https://a', licencia: 'CC-BY-ND-4.0', cambios: 'Recortada' }, F),
      ),
    ).toContain('no permite modificaciones');
  });

  it('exige titular para marcas', () => {
    expect(mensajeDe(() => validarFicha({ autor: 'X', fuente: 'https://a', licencia: 'marca' }, F))).toContain(
      'titular',
    );
  });

  it('rechaza campos desconocidos', () => {
    expect(mensajeDe(() => validarFicha({ autr: 'X', autor: 'propio' }, F))).toContain('autr');
  });

  it('marca las licencias no comerciales', () => {
    const f = validarFicha({ autor: 'X', fuente: 'https://a', licencia: 'CC-BY-NC-4.0' }, F);
    expect(f.licencia.noComercial).toBe(true);
  });

  it('el mensaje de error incluye el archivo', () => {
    expect(mensajeDe(() => validarFicha({}, F))).toContain('img/x.yml');
  });
});

describe('licenciaPorId', () => {
  it('incluye la OpenLDAP Public License 2.8', () => {
    expect(licenciaPorId('OLDAP-2.8')?.url).toBe('https://www.openldap.org/software/release/license.html');
  });

  it('devuelve undefined para ids desconocidos', () => {
    expect(licenciaPorId('nada')).toBeUndefined();
    expect(licenciaPorId('CC0-1.0')?.permiteCambios).toBe(true);
  });
});

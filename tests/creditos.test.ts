import { describe, expect, it } from 'vitest';
import { licenciaPorId, validarFicha } from '../src/licencias';
import { condicionesTexto, creditosDe } from '../src/lib/creditos';
import { esquemaPieza } from '../src/lib/esquemas';
import type { ImagenUsada, PiezaRenderizada } from '../src/lib/markdown';
import type { PiezaFuente } from '../src/lib/tipos';

const img = (rutaAbs: string, autor: string): ImagenUsada => ({
  rutaAbs,
  rutaFicha: rutaAbs.replace('.png', '.yml'),
  url: `/img/${rutaAbs}`,
  alt: 'alt',
  ficha: validarFicha(autor === 'propio' ? { autor } : { autor, fuente: 'https://a', licencia: 'CC-BY-4.0' }, 'f.yml'),
});

function entrada(id: string, datos: Record<string, unknown>, imagenes: ImagenUsada[] = []) {
  const fuente: PiezaFuente = {
    id,
    archivo: `${id}.md`,
    rutaAbs: `/${id}.md`,
    datos: esquemaPieza.parse({ titulo: `T ${id}`, ...datos }),
    cuerpo: '',
    privado: false,
  };
  const render: PiezaRenderizada = { id, html: '', imagenes, tieneMermaid: false };
  return { fuente, render };
}

describe('creditosDe', () => {
  it('une fuentes e imágenes sin duplicados y en orden de aparición', () => {
    const c = creditosDe([
      entrada('a', { fuentes: ['Libro B', 'Libro A'] }, [img('/x.png', 'Ana')]),
      entrada('b', { fuentes: ['Libro A', 'Libro C'] }, [img('/x.png', 'Ana'), img('/y.png', 'Luis')]),
    ]);
    expect(c.bibliografia).toEqual(['Libro B', 'Libro A', 'Libro C']);
    expect(c.recursos.map((r) => r.ficha.autor)).toEqual(['Ana', 'Luis']);
  });

  it('excluye las imágenes propias de los recursos de terceros', () => {
    expect(creditosDe([entrada('a', {}, [img('/p.png', 'propio')])]).recursos).toHaveLength(0);
  });

  it('señala las piezas con otra licencia', () => {
    const c = creditosDe([entrada('a', {}), entrada('b', { licencia: 'CC-BY-4.0' })]);
    expect(c.licenciaTexto.id).toBe('CC-BY-NC-SA-4.0');
    expect(c.piezasConOtraLicencia).toEqual([{ id: 'b', titulo: 'T b', licencia: licenciaPorId('CC-BY-4.0') }]);
  });

  it('si todas las piezas comparten otra licencia, esa es la del texto', () => {
    const c = creditosDe([entrada('a', { licencia: 'CC-BY-NC-SA-4.0' }), entrada('b', { licencia: 'CC-BY-NC-SA-4.0' })]);
    expect(c.licenciaTexto.id).toBe('CC-BY-NC-SA-4.0');
    expect(c.piezasConOtraLicencia).toEqual([]);
  });
});

describe('condicionesTexto', () => {
  it('describe CC BY-SA y CC BY-NC-SA', () => {
    expect(condicionesTexto(licenciaPorId('CC-BY-SA-4.0')!)).toBe('Puedes copiarlo y adaptarlo citando la autoría y compartiendo con la misma licencia.');
    expect(condicionesTexto(licenciaPorId('CC-BY-NC-SA-4.0')!)).toBe(
      'Puedes copiarlo y adaptarlo citando la autoría, sin fines comerciales y compartiendo con la misma licencia.',
    );
  });
});

describe('catálogo', () => {
  it('incluye OFL-1.1 para las tipografías', () => {
    expect(licenciaPorId('OFL-1.1')?.url).toContain('openfontlicense');
  });
});

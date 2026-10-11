import { describe, expect, it } from 'vitest';
import { CATEGORIAS, categoriaDe } from '../src/categorias';
import { ICONOS, svgIcono } from '../src/lib/iconos';

describe('categorías por ciclo', () => {
  it('define Grado Básico, SMR, ASIR y DAM con variantes clara y oscura', () => {
    expect(Object.keys(CATEGORIAS).sort()).toEqual(['ASIR', 'DAM', 'GB', 'SMR']);
    expect(categoriaDe('SMR')).toMatchObject({ clase: 'cat-smr', claro: { fondo: '#d6e4f0' } });
    expect(categoriaDe('ASIR')?.oscuro.fondo).toBe('#38211f');
    expect(categoriaDe('nada')).toBeUndefined();
  });
});

describe('iconos', () => {
  it('incluye los iconos de módulo y el casco del tema', () => {
    for (const n of ['terminal', 'red', 'casco']) expect(ICONOS.has(n)).toBe(true);
  });

  it('los SVG usan currentColor y no llevan cabeceras ni dimensiones fijas', () => {
    for (const n of ICONOS) {
      const s = svgIcono(n);
      expect(s.startsWith('<svg')).toBe(true);
      expect(s).not.toMatch(/<\?xml|<!DOCTYPE|<!--|#000000|#1a1a1a|width="800px"/);
      expect(s).toContain('currentColor');
      expect(s).toContain('aria-hidden="true"');
    }
  });
});

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { construir } from './util';

describe('build del sitio', () => {
  it('genera la portada respetando BASE_PATH', () => {
    const salida = construir({ BASE_PATH: '/prueba/' });
    const html = readFileSync(join(salida, 'index.html'), 'utf8');
    expect(html).toContain('href="/prueba/');
  });
});

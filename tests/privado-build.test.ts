import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { construir } from './util';

function textoDe(dir: string): string {
  return readdirSync(dir)
    .map((n) => join(dir, n))
    .map((r) => (statSync(r).isDirectory() ? textoDe(r) : readFileSync(r, 'latin1')))
    .join('\n');
}

describe('privacidad en el build', () => {
  it('nunca publica contenido privado aunque ONYON_PRIVADO esté definido', () => {
    const salida = construir({
      ONYON_CONTENIDO: resolve('tests/fixtures/valido'),
      ONYON_PRIVADO: resolve('tests/fixtures/privado'),
    });
    const todo = textoDe(salida);
    expect(todo).toContain('PUBLICO-OK-456');
    expect(todo).not.toContain('SECRETO-PRIVADO-123');
  });
});

import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { comprobarRaizPrivada } from '../src/lib/raices';

describe('comprobarRaizPrivada', () => {
  const repo = resolve('.');

  it('rechaza una carpeta privada dentro del repositorio (se subiría a GitHub)', () => {
    expect(() => comprobarRaizPrivada(resolve('privado'), repo, false)).toThrow('ONYON_PRIVADO apunta dentro del repositorio');
  });

  it('acepta una carpeta fuera del repositorio', () => {
    expect(() => comprobarRaizPrivada(resolve('..', 'onyon-privado'), repo, false)).not.toThrow();
  });

  it('una carpeta con un nombre que empieza igual que el repo está fuera', () => {
    expect(() => comprobarRaizPrivada(`${repo}-privado`, repo, false)).not.toThrow();
  });

  it('se puede permitir de forma explícita (fixtures de prueba)', () => {
    expect(() => comprobarRaizPrivada(resolve('tests/fixtures/privado'), repo, true)).not.toThrow();
  });
});

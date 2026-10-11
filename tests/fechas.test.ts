import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { fechasBloques, formatearFecha, leerFechas, parsearGitLog } from '../src/lib/fechas';

describe('parsearGitLog', () => {
  it('devuelve la fecha más reciente de cada archivo', () => {
    const salida =
      '\x002026-10-09T10:00:00+02:00\n\na.md\nb.md\n' +
      '\x002026-10-05T10:00:00+02:00\n\na.md\n' +
      '\x002026-10-01T10:00:00+02:00\n\nc.md\n';
    const m = parsearGitLog(salida);
    expect(m.get('a.md')?.toISOString()).toBe('2026-10-09T08:00:00.000Z');
    expect(m.get('c.md')?.toISOString()).toBe('2026-10-01T08:00:00.000Z');
    expect(m.size).toBe(3);
  });
});

describe('fechasBloques', () => {
  const d = (s: string) => new Date(`2026-10-${s}T12:00:00Z`);
  const v = (ut3: string, orden = false) =>
    orden
      ? `unidades:\n  - piezas: [${ut3}]\n    titulo: T3\n    id: ut3\n  - id: ut1\n    titulo: T1\n    piezas: [a, b]\n`
      : `unidades:\n  - id: ut1\n    titulo: T1\n    piezas: [a, b]\n  - id: ut3\n    titulo: T3\n    piezas: [${ut3}]\n`;

  it('fecha cada unidad por el último cambio de su propio bloque', () => {
    const m = fechasBloques([
      { fecha: d('09'), yaml: v('x, y') },
      { fecha: d('05'), yaml: v('x, y') },
      { fecha: d('01'), yaml: v('x') },
    ]);
    expect(m.get('ut1')).toEqual(d('01'));
    expect(m.get('ut3')).toEqual(d('05'));
  });

  it('ignora el reordenamiento del YAML', () => {
    const m = fechasBloques([
      { fecha: d('09'), yaml: v('x', true) },
      { fecha: d('01'), yaml: v('x') },
    ]);
    expect(m.get('ut1')).toEqual(d('01'));
    expect(m.get('ut3')).toEqual(d('01'));
  });

  it('marca como sin publicar los bloques cambiados sin commitear', () => {
    const m = fechasBloques([
      { fecha: null, yaml: v('x, z') },
      { fecha: d('01'), yaml: v('x') },
    ]);
    expect(m.get('ut1')).toEqual(d('01'));
    expect(m.get('ut3')).toBeNull();
  });
});

describe('formatearFecha', () => {
  it('usa la zona de Madrid', () => {
    expect(formatearFecha(new Date('2026-10-09T22:30:00Z'))).toBe('Actualizado el 10 de octubre de 2026');
  });
  it('indica lo no publicado', () => {
    expect(formatearFecha(null)).toBe('Sin publicar');
  });
});

describe('leerFechas (repositorio real)', () => {
  const git = (dir: string, ...args: string[]) => execFileSync('git', ['-C', dir, ...args], { stdio: 'pipe' });

  it('obtiene fechas de git y detecta lo no commiteado o externo', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'onyon-git-'));
    git(dir, 'init', '-q');
    git(dir, 'config', 'user.email', 't@t');
    git(dir, 'config', 'user.name', 't');
    const commit = (fecha: string, ...archivos: [string, string][]) => {
      for (const [n, c] of archivos) writeFileSync(join(dir, n), c);
      git(dir, 'add', '.');
      execFileSync('git', ['-C', dir, 'commit', '-qm', 'x'], {
        env: { ...process.env, GIT_COMMITTER_DATE: fecha, GIT_AUTHOR_DATE: fecha },
      });
    };
    commit('2026-10-01T10:00:00Z', ['a.md', '1'], ['b.md', '1'], ['m.yml', 'unidades:\n  - {id: ut1, titulo: T, piezas: [a]}\n']);
    commit('2026-10-05T10:00:00Z', ['b.md', '2']);
    writeFileSync(join(dir, 'a.md'), 'modificado');

    const f = await leerFechas(dir);
    expect(f.fechaDe([join(dir, 'b.md')])?.toISOString()).toBe('2026-10-05T10:00:00.000Z');
    expect(f.fechaDe([join(dir, 'a.md')])).toBeNull();
    expect(f.fechaDe([join(dir, 'b.md'), join(dir, 'm.yml')])?.toISOString()).toBe('2026-10-05T10:00:00.000Z');
    expect(f.fechaDe(['/fuera/del/repo.md'])).toBeNull();
    expect(f.fechaUnidad(join(dir, 'm.yml'), 'ut1')?.toISOString()).toBe('2026-10-01T10:00:00.000Z');
  });

  it('funciona con rutas no ASCII y con espacios', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'onyon-git-'));
    git(dir, 'init', '-q');
    git(dir, 'config', 'user.email', 't@t');
    git(dir, 'config', 'user.name', 't');
    mkdirSync(join(dir, 'administración'));
    writeFileSync(join(dir, 'administración', 'diseño.md'), '1');
    writeFileSync(join(dir, 'con espacio.md'), '1');
    writeFileSync(join(dir, 'año.md'), '1');
    git(dir, 'add', '.');
    execFileSync('git', ['-C', dir, 'commit', '-qm', 'x'], {
      env: { ...process.env, GIT_COMMITTER_DATE: '2026-10-02T10:00:00Z', GIT_AUTHOR_DATE: '2026-10-02T10:00:00Z' },
    });
    writeFileSync(join(dir, 'año.md'), 'cambiado');
    const f = await leerFechas(dir);
    expect(f.fechaDe([join(dir, 'administración', 'diseño.md')])?.toISOString()).toBe('2026-10-02T10:00:00.000Z');
    expect(f.fechaDe([join(dir, 'con espacio.md')])?.toISOString()).toBe('2026-10-02T10:00:00.000Z');
    expect(f.fechaDe([join(dir, 'año.md')])).toBeNull();
  });
});

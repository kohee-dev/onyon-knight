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

import { spawn } from 'node:child_process';
import { entornoLimpio } from './util';

/**
 * Arranca un `astro dev` propio (proceso hijo, --ignore-lock) y devuelve la portada.
 * No toca el servidor de desarrollo que el docente pueda tener abierto.
 */
async function portadaDev(extra: Record<string, string>): Promise<string> {
  const env = entornoLimpio({ ONYON_CONTENIDO: resolve('tests/fixtures/valido'), ...extra });
  const hijo = spawn('npx', ['astro', 'dev', '--ignore-lock', '--host', '127.0.0.1', '--port', '4397'], {
    env,
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let registro = '';
  hijo.stdout!.on('data', (d) => (registro += d));
  hijo.stderr!.on('data', (d) => (registro += d));
  try {
    for (let i = 0; i < 180; i++) {
      const html = await fetch('http://127.0.0.1:4397/').then((r) => (r.ok ? r.text() : ''), () => '');
      if (html.includes('Onyon Knight')) return html;
      await new Promise((r) => setTimeout(r, 500));
    }
    throw new Error(`astro dev no respondió en 90 s. Registro:\n${registro.slice(-3000)}`);
  } finally {
    try {
      process.kill(-hijo.pid!, 'SIGTERM'); // todo el grupo: npx y astro
    } catch {
      /* ya terminado */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
}

describe('privacidad tras una sesión de desarrollo', () => {
  it('sin ONYON_PRIVADO, dev y build no conservan nada privado de una sesión anterior', async () => {
    expect(await portadaDev({ ONYON_PRIVADO: resolve('tests/fixtures/privado') })).toContain('SECRETO-PRIVADO-123');
    expect(await portadaDev({})).not.toContain('SECRETO-PRIVADO-123');
    expect(textoDe(construir({ ONYON_CONTENIDO: resolve('tests/fixtures/valido') }))).not.toContain('SECRETO-PRIVADO-123');
  });
});

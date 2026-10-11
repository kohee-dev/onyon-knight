import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Entorno del proceso sin las variables que Vitest/Vite inyectan (BASE_URL, MODE, NODE_ENV…) ni las de agentes
 * de IA (AI_AGENT, CLAUDECODE…), que cambian `astro dev`, ni la configuración del sitio heredada (BASE_PATH,
 * SITE_URL, ONYON_*, PDF_*): cada prueba pasa la suya. Así local y CI se comportan igual.
 */
export function entornoLimpio(extra: Record<string, string> = {}): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (/^(VITEST|VITE_|BASE_URL$|MODE$|DEV$|PROD$|SSR$|NODE_ENV$|TEST$|AI_AGENT|CLAUDE|BASE_PATH$|SITE_URL$|ONYON_|PDF_)/.test(k)) continue;
    env[k] = v;
  }
  return { ...env, ...extra };
}

/** Ejecuta `astro build` en un directorio temporal y devuelve su ruta. */
export function construir(extra: Record<string, string> = {}): string {
  const salida = mkdtempSync(join(tmpdir(), 'onyon-build-'));
  execFileSync('npx', ['astro', 'build', '--outDir', salida], {
    env: entornoLimpio(extra),
    stdio: 'pipe',
  });
  return salida;
}

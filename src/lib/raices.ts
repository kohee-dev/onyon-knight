import { existsSync } from 'node:fs';
import { resolve, sep } from 'node:path';

/** La carpeta privada no puede estar dentro del repositorio: acabaría subida a GitHub. */
export function comprobarRaizPrivada(ruta: string, repo: string, permitir: boolean): void {
  if (permitir) return;
  if (ruta === repo || ruta.startsWith(repo + sep)) {
    throw new Error(`ONYON_PRIVADO apunta dentro del repositorio (${ruta}): muévela fuera, p. ej. a ../onyon-privado`);
  }
}

/** Carpeta de contenido público (ONYON_CONTENIDO permite apuntar a los fixtures de prueba). */
export const raizContenido = resolve(process.env.ONYON_CONTENIDO ?? 'contenido');

/** Carpeta privada: solo en `astro dev` y si existe. */
export const raizPrivada: string | null =
  import.meta.env.DEV && process.env.ONYON_PRIVADO && existsSync(resolve(process.env.ONYON_PRIVADO))
    ? resolve(process.env.ONYON_PRIVADO)
    : null;
// Solo las pruebas, con su fixture privado versionado, lo permiten de forma explícita.
if (raizPrivada) comprobarRaizPrivada(raizPrivada, process.cwd(), process.env.ONYON_PRIVADO_EN_REPO === 'permitir');

export const raicesPiezas = [resolve(raizContenido, 'piezas'), ...(raizPrivada ? [resolve(raizPrivada, 'piezas')] : [])];

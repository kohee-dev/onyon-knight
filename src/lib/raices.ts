import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

/** Carpeta de contenido público (ONYON_CONTENIDO permite apuntar a los fixtures de prueba). */
export const raizContenido = resolve(process.env.ONYON_CONTENIDO ?? 'contenido');

/** Carpeta privada: solo en `astro dev` y si existe. */
export const raizPrivada: string | null =
  import.meta.env.DEV && process.env.ONYON_PRIVADO && existsSync(resolve(process.env.ONYON_PRIVADO))
    ? resolve(process.env.ONYON_PRIVADO)
    : null;

export const raicesPiezas = [resolve(raizContenido, 'piezas'), ...(raizPrivada ? [resolve(raizPrivada, 'piezas')] : [])];

import { createHash } from 'node:crypto';
import { readFileSync, renameSync, rmSync } from 'node:fs';

/**
 * Escribe un archivo de forma atómica: primero en un temporal y, si todo va bien, lo renombra.
 * Una generación interrumpida nunca deja en la caché un PDF a medias.
 * @param {string} rutaFinal
 * @param {(rutaTemporal: string) => Promise<unknown>} escribir
 */
export async function guardarAtomico(rutaFinal, escribir) {
  const tmp = `${rutaFinal}.${process.pid}.tmp`;
  try {
    await escribir(tmp);
    renameSync(tmp, rutaFinal);
  } catch (e) {
    rmSync(tmp, { force: true });
    throw e;
  }
}

/** «unidad aso/ut1» o «caso aso/ut1/gatos», para los mensajes. */
export function describirEntrada(e) {
  return e.tipo === 'caso' ? `caso ${e.modulo}/${e.unidad}/${e.caso}` : `unidad ${e.modulo}/${e.unidad}`;
}

/** Versión del generador: contenido de sus archivos y versión del navegador. */
export function versionesGenerador(archivos, navegador) {
  const h = createHash('sha256');
  for (const a of archivos) h.update(readFileSync(a));
  return `${h.digest('hex')}|${navegador}`;
}

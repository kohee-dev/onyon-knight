import { basename, extname, relative, resolve } from 'node:path';
import { getCollection } from 'astro:content';
import { raizPrivada as privado } from './raices';
import type { ModuloFuente, PiezaFuente } from './tipos';

const raiz = process.cwd();

function rutas(filePath: string | undefined, esPrivado: boolean) {
  const rutaAbs = resolve(raiz, filePath ?? '');
  const archivo = esPrivado && privado ? `privado:${relative(privado, rutaAbs)}` : relative(raiz, rutaAbs);
  return { rutaAbs, archivo, id: basename(rutaAbs, extname(rutaAbs)) };
}

async function coleccion(nombre: string): Promise<any[]> {
  try {
    return await getCollection(nombre as any);
  } catch {
    return [];
  }
}

/** Lee las colecciones de Astro (públicas y, si existen, privadas) como fuentes del catálogo. */
export async function cargarFuentes(): Promise<{ piezas: PiezaFuente[]; modulos: ModuloFuente[] }> {
  const piezas: PiezaFuente[] = [];
  const modulos: ModuloFuente[] = [];
  // Sin carpeta privada activa (siempre en build), las colecciones privadas ni se leen.
  const conPrivado = <T,>(lista: readonly (readonly [string, boolean])[]) => lista.filter(([, p]) => !p || privado);
  for (const [nombre, esPrivado] of conPrivado([['piezas', false], ['piezasPrivadas', true]])) {
    for (const e of await coleccion(nombre)) {
      piezas.push({ ...rutas(e.filePath, esPrivado), datos: e.data, cuerpo: e.body ?? '', privado: esPrivado });
    }
  }
  for (const [nombre, esPrivado] of conPrivado([['modulos', false], ['modulosPrivados', true]])) {
    for (const e of await coleccion(nombre)) {
      modulos.push({ ...rutas(e.filePath, esPrivado), datos: e.data, privado: esPrivado });
    }
  }
  return { piezas, modulos };
}

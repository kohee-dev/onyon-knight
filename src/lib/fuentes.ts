import { basename, extname, relative, resolve } from 'node:path';
import { getCollection } from 'astro:content';
import type { ModuloFuente, PiezaFuente } from './tipos';

const raiz = process.cwd();
const privado = process.env.ONYON_PRIVADO ? resolve(process.env.ONYON_PRIVADO) : null;

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
  for (const [nombre, esPrivado] of [['piezas', false], ['piezasPrivadas', true]] as const) {
    for (const e of await coleccion(nombre)) {
      piezas.push({ ...rutas(e.filePath, esPrivado), datos: e.data, cuerpo: e.body ?? '', privado: esPrivado });
    }
  }
  for (const [nombre, esPrivado] of [['modulos', false], ['modulosPrivados', true]] as const) {
    for (const e of await coleccion(nombre)) {
      modulos.push({ ...rutas(e.filePath, esPrivado), datos: e.data, privado: esPrivado });
    }
  }
  return { piezas, modulos };
}

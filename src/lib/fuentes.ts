import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path';
import { getCollection } from 'astro:content';
import { dificultadFinal, lectorBloques, valorFinal } from './bloques';
import { raizContenido, raizPrivada as privado } from './raices';
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
  const leerBloque = lectorBloques();
  // Sin carpeta privada activa (siempre en build), las colecciones privadas ni se leen.
  const conPrivado = <T,>(lista: readonly (readonly [string, boolean])[]) => lista.filter(([, p]) => !p || privado);
  for (const [nombre, esPrivado] of conPrivado([['piezas', false], ['piezasPrivadas', true]])) {
    const raizPiezas = resolve(esPrivado && privado ? privado : raizContenido, 'piezas');
    for (const e of await coleccion(nombre)) {
      const r = rutas(e.filePath, esPrivado);
      const dir = dirname(r.rutaAbs);
      const bloque = (esPrivado ? 'privado:' : '') + relative(raizPiezas, dir).split(sep).join('/');
      const dificultad = dificultadFinal(e.data.dificultad, dir, leerBloque);
      const tema = valorFinal(e.data.tema, 'tema', dir, leerBloque);
      const rutaBloque = join(dir, 'bloque.yml');
      const archivoBloque = esPrivado && privado ? `privado:${relative(privado, rutaBloque)}` : relative(raiz, rutaBloque);
      const origenTema = e.data.tema ? r.archivo : tema ? archivoBloque : undefined;
      piezas.push({ ...r, datos: e.data, cuerpo: e.body ?? '', privado: esPrivado, bloque, dificultad, tema, origenTema });
    }
  }
  for (const [nombre, esPrivado] of conPrivado([['modulos', false], ['modulosPrivados', true]])) {
    for (const e of await coleccion(nombre)) {
      modulos.push({ ...rutas(e.filePath, esPrivado), datos: e.data, privado: esPrivado });
    }
  }
  return { piezas, modulos };
}

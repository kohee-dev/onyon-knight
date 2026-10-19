import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path';
import { getCollection } from 'astro:content';
import { resolverBloques } from './bloques';
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
  // Sin carpeta privada activa (siempre en build), las colecciones privadas ni se leen.
  const conPrivado = <T,>(lista: readonly (readonly [string, boolean])[]) => lista.filter(([, p]) => !p || privado);
  for (const [nombre, esPrivado] of conPrivado([['piezas', false], ['piezasPrivadas', true]])) {
    const raizContenidoActual = esPrivado && privado ? privado : raizContenido;
    const raizPiezas = resolve(raizContenidoActual, 'piezas');
    const entradas = (await coleccion(nombre)).map((e) => {
      const r = rutas(e.filePath, esPrivado);
      return { e, r, carpeta: relative(raizPiezas, dirname(r.rutaAbs)).split(sep).join('/') };
    });
    const datosBloque = resolverBloques({
      raiz: raizContenidoActual,
      archivo: esPrivado ? 'privado:bloques.yml' : relative(raiz, join(raizContenidoActual, 'bloques.yml')),
      piezas: entradas.map(({ r, carpeta }) => ({ id: r.id, bloque: carpeta })),
    });
    for (const { e, r, carpeta } of entradas) {
      const bloque = (esPrivado ? 'privado:' : '') + carpeta;
      const { dificultad, tema, origenTema } = datosBloque.get(r.id)!;
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

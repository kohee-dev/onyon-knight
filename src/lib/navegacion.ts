import { temasDelSitio } from './temas';
import { CATEGORIAS, categoriaDe } from '../categorias';
import { construirCatalogo } from './catalogo';
import { cargarFuentes } from './fuentes';
import type { Modo } from './tipos';

export interface ModuloNavegacion {
  id: string;
  sigla: string;
  nombre: string;
  /** Clase de la categoría (color del ciclo). */
  clase: string;
  url: string;
}

const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;

async function calcular(): Promise<ModuloNavegacion[]> {
  const modo: Modo = import.meta.env.PROD ? 'publicacion' : 'desarrollo';
  const { piezas, modulos } = await cargarFuentes();
  // Solo el catálogo (sin renderizar): los módulos activos con alguna unidad publicada.
  return construirCatalogo(piezas, modulos, modo, temasDelSitio()).modulos.map((m) => ({
    id: m.id,
    sigla: m.id.toUpperCase(),
    nombre: m.datos.nombre,
    clase: categoriaDe(m.datos.ciclo)?.clase ?? '',
    url: `${base}${m.id}/`,
  }));
}

let memo: Promise<ModuloNavegacion[]> | null = null;

/** Módulos del desplegable de la cabecera y del menú. En build se calcula una vez. */
export function modulosNavegacion(): Promise<ModuloNavegacion[]> {
  if (!import.meta.env.PROD) return calcular();
  return (memo ??= calcular());
}

export interface TemaNavegacion {
  id: string;
  nombre: string;
  url: string;
}

async function calcularTemas(): Promise<TemaNavegacion[]> {
  const modo: Modo = import.meta.env.PROD ? 'publicacion' : 'desarrollo';
  const { piezas, modulos } = await cargarFuentes();
  // Solo el catálogo (sin renderizar): temas con alguna pieza en una unidad publicada.
  const c = construirCatalogo(piezas, modulos, modo, temasDelSitio());
  const usados = new Set([...c.apariciones.keys()].map((id) => c.piezas.get(id)?.tema).filter(Boolean));
  return c.temas.filter((t) => usados.has(t.id)).map((t) => ({ id: t.id, nombre: t.nombre, url: `${base}temas/${t.id}/` }));
}

let memoTemas: Promise<TemaNavegacion[]> | null = null;

/** Temas del desplegable de la cabecera y del menú. En build se calcula una vez. */
export function temasNavegacion(): Promise<TemaNavegacion[]> {
  if (!import.meta.env.PROD) return calcularTemas();
  return (memoTemas ??= calcularTemas());
}

/** Id del módulo de la página actual (primer segmento tras la base), si lo hay. */
export function moduloDeRuta(ruta: string): string | undefined {
  return ruta.startsWith(base) ? ruta.slice(base.length).split('/')[0] || undefined : undefined;
}

export interface SeccionNavegacion {
  /** Cabecera: «ASIR · Administración de Sistemas Informáticos en Red». */
  titulo: string;
  clase: string;
  id: string;
  modulos: ModuloNavegacion[];
}

/** Módulos agrupados por ciclo, en el orden de las categorías; sin secciones vacías. */
export async function seccionesNavegacion(): Promise<SeccionNavegacion[]> {
  const modulos = await modulosNavegacion();
  return Object.values(CATEGORIAS)
    .map((c) => ({
      titulo: `${c.nombre} · ${c.ciclo}`,
      clase: c.clase,
      id: c.id.toLowerCase(),
      modulos: modulos.filter((m) => m.clase === c.clase),
    }))
    .filter((s) => s.modulos.length > 0);
}

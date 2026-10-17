import { construirCatalogo, SLUG } from '../catalogo';
import type { CabeceraModulo } from '../esquemas';
import type { ModuloFuente } from '../tipos';
import { componer } from './compositor';
import { leerCorpus } from './corpus';
import { extraer, type Extraccion } from './extractor';
import { Grafo } from './grafo';
import type { Modelo } from './modelo';
import { recuperar } from './recuperador';

export type { Modelo } from './modelo';

export interface OpcionesGenerar {
  tema: string;
  raizContenido: string;
  modelo: Modelo;
  /** Carpeta (ignorada por git) donde se guarda el grafo. */
  dirCache: string;
}

export const CODIGO_POR_DEFINIR = 'POR-DEFINIR';

export function slug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Módulo con más piezas entre las elegidas; en empate, el primero por id. */
function moduloDeOrigen(modulos: ModuloFuente[], elegidas: Set<string>): ModuloFuente {
  if (modulos.length === 0) throw new Error('no hay módulos de origen de los que deducir ciclo, curso e icono');
  const cuenta = (m: ModuloFuente) => m.datos.unidades.flatMap((u) => u.piezas).filter((p) => elegidas.has(p)).length;
  return [...modulos].sort((a, b) => cuenta(b) - cuenta(a) || a.id.localeCompare(b.id))[0];
}

/** Propone un módulo nuevo (desactivado) que reordena piezas públicas ya existentes. Solo escribe el grafo en `dirCache`. */
export async function generarCurso({ tema, raizContenido, modelo, dirCache }: OpcionesGenerar): Promise<{
  id: string;
  modulo: CabeceraModulo;
  /** Por cada pieza propuesta, las entidades de la vecindad del tema que la justificaron. */
  justificacion: Record<string, string[]>;
}> {
  const id = slug(tema);
  if (!SLUG.test(id)) throw new Error(`el tema «${tema}» no da un identificador válido`);

  const { piezas, modulos } = leerCorpus(raizContenido);
  // Un corpus ya roto (ids duplicados…) se detecta antes de pagar una llamada al modelo.
  construirCatalogo(piezas, modulos, 'desarrollo');
  const publicas = piezas.filter((p) => !p.datos.borrador);

  const extracciones = new Map<string, Extraccion>();
  for (const pieza of publicas) extracciones.set(pieza.id, await extraer(modelo, pieza));
  const grafo = Grafo.desde(extracciones);
  grafo.guardar(dirCache);

  const recuperadas = await recuperar(modelo, grafo, tema);
  if (recuperadas.size === 0) throw new Error(`ninguna pieza del corpus es relevante para «${tema}»`);
  const candidatas = new Map(publicas.filter((p) => recuperadas.has(p.id)).map((p) => [p.id, p]));
  // Se ofrecen en el orden de relevancia del grafo.
  const propuesta = await componer(modelo, tema, [...recuperadas.keys()].map((pid) => candidatas.get(pid)!));

  const elegidas = new Set<string>();
  const idsUnidad = new Set<string>();
  const unidades = propuesta.flatMap((u) => {
    const ids = [...new Set(u.piezas)];
    const desconocidas = ids.filter((p) => !candidatas.has(p));
    if (desconocidas.length) throw new Error(`el modelo cita piezas que no se recuperaron del grafo, no existen o son borradores: ${desconocidas.join(', ')}`);
    if (ids.length === 0) return [];
    ids.forEach((p) => elegidas.add(p));
    const base = slug(u.titulo) || 'unidad';
    let unidadId = base;
    for (let n = 2; idsUnidad.has(unidadId); n++) unidadId = `${base}-${n}`;
    idsUnidad.add(unidadId);
    return [{ id: unidadId, titulo: u.titulo, piezas: ids }];
  });
  if (unidades.length === 0) throw new Error(`ninguna pieza del corpus es relevante para «${tema}»`);

  const origen = moduloDeOrigen(modulos, elegidas);
  const modulo: CabeceraModulo = {
    nombre: tema,
    codigo: CODIGO_POR_DEFINIR,
    ciclo: origen.datos.ciclo,
    curso: origen.datos.curso,
    icono: origen.datos.icono,
    activo: false,
    unidades,
  };

  const generado: ModuloFuente = { id, archivo: `modulos/${id}.yml`, rutaAbs: `${raizContenido}/modulos/${id}.yml`, datos: modulo, privado: false };
  construirCatalogo(piezas, [...modulos, generado], 'desarrollo');
  const justificacion = Object.fromEntries([...elegidas].map((pid) => [pid, recuperadas.get(pid)!]));
  return { id, modulo, justificacion };
}

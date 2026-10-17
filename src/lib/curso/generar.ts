import { z } from 'astro/zod';
import { construirCatalogo, SLUG } from '../catalogo';
import type { CabeceraModulo } from '../esquemas';
import type { ModuloFuente } from '../tipos';
import { leerCorpus } from './corpus';

/** Puerto del modelo de lenguaje: cambiar de proveedor es escribir otro adaptador. */
export interface Modelo {
  completar(instruccion: string, entrada: string): Promise<string>;
}

export interface OpcionesGenerar {
  tema: string;
  raizContenido: string;
  modelo: Modelo;
}

export const CODIGO_POR_DEFINIR = 'POR-DEFINIR';

const INSTRUCCION =
  'Eres un asistente de autoría. Te doy un tema y la lista de piezas disponibles (id, titulo, resumen, tipo). ' +
  'Elige solo las piezas relevantes para el tema y agrúpalas en unidades ordenadas, cada una con un título. ' +
  'Usa únicamente ids de la lista. Responde solo con JSON: {"unidades":[{"titulo":"...","piezas":["id"]}]}.';

const respuesta = z.object({
  unidades: z.array(z.object({ titulo: z.string().min(1), piezas: z.array(z.string()) })),
});

export function slug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function leerRespuesta(texto: string) {
  try {
    return respuesta.parse(JSON.parse(texto));
  } catch {
    throw new Error(`respuesta del modelo no válida (se esperaba JSON con «unidades»): ${texto.slice(0, 200)}`);
  }
}

/** Módulo con más piezas entre las elegidas; en empate, el primero por id. */
function moduloDeOrigen(modulos: ModuloFuente[], elegidas: Set<string>): ModuloFuente {
  if (modulos.length === 0) throw new Error('no hay módulos de origen de los que deducir ciclo, curso e icono');
  const cuenta = (m: ModuloFuente) => m.datos.unidades.flatMap((u) => u.piezas).filter((p) => elegidas.has(p)).length;
  return [...modulos].sort((a, b) => cuenta(b) - cuenta(a) || a.id.localeCompare(b.id))[0];
}

/** Propone un módulo nuevo (desactivado) que reordena piezas públicas ya existentes. No escribe nada. */
export async function generarCurso({ tema, raizContenido, modelo }: OpcionesGenerar): Promise<{ id: string; modulo: CabeceraModulo }> {
  const id = slug(tema);
  if (!SLUG.test(id)) throw new Error(`el tema «${tema}» no da un identificador válido`);

  const { piezas, modulos } = leerCorpus(raizContenido);
  const candidatas = new Map(piezas.filter((p) => !p.datos.borrador).map((p) => [p.id, p]));
  const entrada = JSON.stringify({
    tema,
    piezas: [...candidatas.values()].map((p) => ({ id: p.id, titulo: p.datos.titulo, resumen: p.datos.resumen ?? '', tipo: p.datos.tipo })),
  });
  const propuesta = leerRespuesta(await modelo.completar(INSTRUCCION, entrada));

  const elegidas = new Set<string>();
  const idsUnidad = new Set<string>();
  const unidades = propuesta.unidades.flatMap((u) => {
    const ids = [...new Set(u.piezas)];
    const desconocidas = ids.filter((p) => !candidatas.has(p));
    if (desconocidas.length) throw new Error(`el modelo cita piezas que no existen o son borradores: ${desconocidas.join(', ')}`);
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
  return { id, modulo };
}

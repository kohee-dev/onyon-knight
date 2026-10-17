import { z } from 'astro/zod';
import type { PiezaFuente } from '../tipos';
import { leerJson, type Modelo } from './modelo';

export interface Extraccion {
  entidades: string[];
  relaciones: [string, string][];
}

const INSTRUCCION =
  'Eres un asistente de autoría. Te doy una pieza de contenido (id, titulo, resumen, cuerpo). ' +
  'Extrae los conceptos técnicos que trata (entidades, con nombre corto y canónico) y las relaciones entre ellos. ' +
  'Responde solo con JSON: {"entidades":["..."],"relaciones":[["entidad A","entidad B"]]}.';

const esquema = z.object({
  entidades: z.array(z.string()),
  relaciones: z.array(z.tuple([z.string(), z.string()])).default([]),
});

/** Pide al modelo las entidades y relaciones de una pieza, de forma independiente al resto. */
export async function extraer(modelo: Modelo, pieza: PiezaFuente): Promise<Extraccion> {
  const entrada = JSON.stringify({
    tarea: 'extraer',
    pieza: { id: pieza.id, titulo: pieza.datos.titulo, resumen: pieza.datos.resumen ?? '', cuerpo: pieza.cuerpo },
  });
  return leerJson(await modelo.completar(INSTRUCCION, entrada), esquema, '«entidades» y «relaciones»');
}

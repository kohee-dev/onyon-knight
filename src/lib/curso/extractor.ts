import { createHash } from 'node:crypto';
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

export const esquemaExtraccion = z.object({
  entidades: z.array(z.string()),
  relaciones: z.array(z.tuple([z.string(), z.string()])).default([]),
});

function entradaDe(pieza: PiezaFuente): string {
  return JSON.stringify({
    tarea: 'extraer',
    pieza: { id: pieza.id, titulo: pieza.datos.titulo, resumen: pieza.datos.resumen ?? '', cuerpo: pieza.cuerpo },
  });
}

/** Huella de lo que se le pide al modelo por una pieza (instrucción y entrada): si no cambia, la extracción guardada sigue valiendo. */
export function huella(pieza: PiezaFuente): string {
  return createHash('sha256').update(INSTRUCCION).update('\0').update(entradaDe(pieza)).digest('hex');
}

/** Pide al modelo las entidades y relaciones de una pieza, de forma independiente al resto. */
export async function extraer(modelo: Modelo, pieza: PiezaFuente): Promise<Extraccion> {
  return leerJson(await modelo.completar(INSTRUCCION, entradaDe(pieza)), esquemaExtraccion, '«entidades» y «relaciones»');
}

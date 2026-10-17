import { z } from 'astro/zod';
import type { Grafo } from './grafo';
import { leerJson, type Modelo } from './modelo';

const INSTRUCCION =
  'Eres un asistente de autoría. Te doy un tema y el vocabulario de entidades del corpus. ' +
  'Elige las entidades del vocabulario que mejor representan el tema (las semillas de la búsqueda). ' +
  'Usa solo nombres del vocabulario. Responde solo con JSON: {"entidades":["..."]}.';

const esquema = z.object({ entidades: z.array(z.string()) });

/** Piezas de la vecindad de las entidades semilla del tema, cada una con las entidades que la justifican. */
export async function recuperar(modelo: Modelo, grafo: Grafo, tema: string): Promise<Map<string, string[]>> {
  const entrada = JSON.stringify({ tarea: 'semillas', tema, entidades: grafo.entidades() });
  const { entidades } = leerJson(await modelo.completar(INSTRUCCION, entrada), esquema, '«entidades»');
  return grafo.piezasDe(grafo.vecindad(entidades));
}

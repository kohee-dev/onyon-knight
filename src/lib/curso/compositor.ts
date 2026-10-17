import { z } from 'astro/zod';
import type { PiezaFuente } from '../tipos';
import { leerJson, type Modelo } from './modelo';

export interface UnidadPropuesta {
  titulo: string;
  piezas: string[];
}

const INSTRUCCION =
  'Eres un asistente de autoría. Te doy un tema y las piezas recuperadas para él (id, titulo, resumen, tipo). ' +
  'Agrúpalas en unidades ordenadas, cada una con un título. ' +
  'Usa únicamente ids de la lista. Responde solo con JSON: {"unidades":[{"titulo":"...","piezas":["id"]}]}.';

const esquema = z.object({
  unidades: z.array(z.object({ titulo: z.string().min(1), piezas: z.array(z.string()) })),
});

/** Pide al modelo agrupar las piezas recuperadas en unidades ordenadas con título. */
export async function componer(modelo: Modelo, tema: string, piezas: PiezaFuente[]): Promise<UnidadPropuesta[]> {
  const entrada = JSON.stringify({
    tarea: 'componer',
    tema,
    piezas: piezas.map((p) => ({ id: p.id, titulo: p.datos.titulo, resumen: p.datos.resumen ?? '', tipo: p.datos.tipo })),
  });
  return leerJson(await modelo.completar(INSTRUCCION, entrada), esquema, '«unidades»').unidades;
}

import type { z } from 'astro/zod';

/** Puerto del modelo de lenguaje: cambiar de proveedor es escribir otro adaptador. */
export interface Modelo {
  completar(instruccion: string, entrada: string): Promise<string>;
}

/** Interpreta la respuesta del modelo como JSON del esquema dado; si no cuadra, falla con el texto recibido. */
export function leerJson<T extends z.ZodType>(texto: string, esquema: T, esperado: string): z.output<T> {
  try {
    // Muchos modelos envuelven el JSON en un bloque de código aunque se les pida solo JSON.
    const bloque = /^```(?:json)?\s*([\s\S]*?)\s*```$/i.exec(texto.trim());
    return esquema.parse(JSON.parse(bloque ? bloque[1] : texto));
  } catch {
    throw new Error(`respuesta del modelo no válida (se esperaba JSON con ${esperado}): ${texto.slice(0, 200)}`);
  }
}

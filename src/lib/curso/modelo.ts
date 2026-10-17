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

/** La clave de API del proveedor no está en la variable de entorno esperada. */
export class ClaveAusente extends Error {
  constructor(readonly variable: string) {
    super(`falta la clave de API: define la variable de entorno ${variable} y vuelve a ejecutar el comando`);
  }
}

/** Texto de un rechazo cualquiera: el proveedor puede rechazar con algo que no es un Error. */
function detalle(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;
  try {
    return JSON.stringify(e) ?? String(e);
  } catch {
    return String(e);
  }
}

/** Envuelve el modelo para que sus fallos de transporte lleguen al autor con qué comprobar, sin ocultar la causa. */
export function conErroresClaros(modelo: Modelo): Modelo {
  return {
    async completar(instruccion, entrada) {
      try {
        return await modelo.completar(instruccion, entrada);
      } catch (e) {
        if (e instanceof ClaveAusente) throw e;
        throw new Error(`el proveedor del modelo ha fallado (${detalle(e)}); comprueba la conexión, la cuota y la clave, y vuelve a intentarlo`, { cause: e });
      }
    },
  };
}

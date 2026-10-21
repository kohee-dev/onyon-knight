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

/** Texto de un rechazo cualquiera. Un objeto que no es un Error no se vuelca entero: podría llevar cabeceras o la clave. */
function detalle(e: unknown): string {
  try {
    if (e instanceof Error) return e.message;
    if (typeof e === 'string') return e;
    if (typeof e === 'object' && e !== null) {
      const campos = (['status', 'code', 'statusText', 'message'] as const)
        .map((campo) => (e as Record<string, unknown>)[campo])
        .filter((valor) => typeof valor === 'string' || typeof valor === 'number');
      return campos.length ? campos.join(' ') : 'rechazo sin detalle';
    }
    return String(e);
  } catch {
    // Un getter que lanza o un Proxy hostil no debe tapar el aviso accionable.
    return 'rechazo sin detalle';
  }
}

/** Envuelve el modelo para que sus fallos (de transporte o de otro tipo: no se distinguen) lleguen al autor con qué comprobar, sin ocultar la causa. */
export function conErroresClaros(modelo: Modelo): Modelo {
  return {
    async completar(instruccion, entrada) {
      try {
        return await modelo.completar(instruccion, entrada);
      } catch (e) {
        throw new Error(`el proveedor del modelo ha fallado (${detalle(e)}); comprueba que Ollama está en marcha y el modelo descargado, y vuelve a intentarlo`, { cause: e });
      }
    },
  };
}

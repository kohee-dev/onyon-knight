import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'astro/zod';
import type { PiezaFuente } from '../tipos';
import { esquemaExtraccion, extraer, huella, type Extraccion } from './extractor';
import type { Modelo } from './modelo';

const esquemaIndice = z.object({ piezas: z.record(z.string(), esquemaExtraccion.extend({ huella: z.string() })) });
type Entradas = z.output<typeof esquemaIndice>['piezas'];

/** Lo guardado de una ejecución anterior; un fichero ausente, ilegible o de otra forma vale como un índice vacío. */
function leer(ruta: string): Entradas {
  try {
    return existsSync(ruta) ? esquemaIndice.parse(JSON.parse(readFileSync(ruta, 'utf8'))).piezas : {};
  } catch {
    return {};
  }
}

/**
 * Extracción de todas las piezas llamando al modelo solo por las que cambiaron desde la última vez (huella distinta o nueva).
 * El índice (`indice.json` en `dirCache`) queda con exactamente las piezas dadas: las borradas se olvidan al terminar.
 * Se guarda tras cada extracción nueva, conservando lo aún no revisado, para no volver a pagar nada si una posterior falla.
 */
export async function extraerIncremental(modelo: Modelo, piezas: PiezaFuente[], dirCache: string): Promise<Map<string, Extraccion>> {
  const ruta = join(dirCache, 'indice.json');
  const previo = leer(ruta);
  const entradas: Entradas = { ...previo };
  const extracciones = new Map<string, Extraccion>();
  const guardar = () => {
    mkdirSync(dirCache, { recursive: true });
    // Escritura atómica: un corte a medias no deja un índice truncado que se leería como vacío.
    const temporal = `${ruta}.tmp`;
    writeFileSync(temporal, JSON.stringify({ piezas: entradas }, null, 2) + '\n', 'utf8');
    renameSync(temporal, ruta);
  };
  for (const pieza of piezas) {
    const actual = huella(pieza);
    const guardada = previo[pieza.id];
    const vigente = guardada?.huella === actual;
    const extraccion = vigente ? { entidades: guardada.entidades, relaciones: guardada.relaciones } : await extraer(modelo, pieza);
    entradas[pieza.id] = { huella: actual, ...extraccion };
    extracciones.set(pieza.id, extraccion);
    if (!vigente) guardar();
  }
  for (const id of Object.keys(entradas)) if (!extracciones.has(id)) delete entradas[id];
  guardar();
  return extracciones;
}

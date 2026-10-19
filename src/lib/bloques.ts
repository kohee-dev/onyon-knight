import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { load, YAMLException } from 'js-yaml';
import { problemasZod } from '../licencias';
import { esquemaBloques, type Dificultad } from './esquemas';
import { ErrorContenido, type Problema } from './tipos';

/** Lee un YAML; vacío o solo comentarios → undefined (js-yaml 5 lo rechaza). Errores de sintaxis → ErrorContenido. */
export function cargarYaml(ruta: string, archivo: string): unknown {
  const texto = readFileSync(ruta, 'utf8');
  if (texto.split('\n').every((l) => /^\s*(#.*)?$/.test(l))) return undefined;
  try {
    return load(texto);
  } catch (e) {
    if (!(e instanceof YAMLException)) throw e;
    throw new ErrorContenido([{ archivo, mensaje: `YAML no válido: ${(e as Error).message.split('\n')[0]}` }]);
  }
}

export interface PiezaDeBloque {
  id: string;
  /** Carpeta de la pieza relativa a `piezas/` (`módulo/bloque`), sin prefijo de raíz privada. */
  bloque: string;
}

export interface DatosBloque {
  tema?: string;
  dificultad?: Dificultad;
  /** Fichero, para mensajes, del que sale el tema. */
  origenTema?: string;
}

/**
 * Resuelve el tema y la dificultad de cada pieza de una raíz de contenido con su `bloques.yml`.
 * `piezas` debe incluir todas las de la raíz (también los borradores); `archivo` es el nombre con que se cita el fichero.
 */
export function resolverBloques(opts: { raiz: string; archivo: string; piezas: PiezaDeBloque[] }): Map<string, DatosBloque> {
  const { raiz, archivo, piezas } = opts;
  const ruta = join(raiz, 'bloques.yml');
  const datos = existsSync(ruta) ? cargarYaml(ruta, archivo) : undefined;
  const r = esquemaBloques.safeParse(datos ?? {});
  if (!r.success) throw new ErrorContenido(problemasZod(r.error, archivo));

  const resultado = new Map<string, DatosBloque>();
  const problemas: Problema[] = [];
  const idsPorBloque = new Map<string, Set<string>>();
  for (const p of piezas) {
    if (!idsPorBloque.has(p.bloque)) idsPorBloque.set(p.bloque, new Set());
    idsPorBloque.get(p.bloque)!.add(p.id);
  }
  const ids = new Set(piezas.map((p) => p.id));
  for (const [modulo, bloques] of Object.entries(r.data)) {
    for (const [nombre, b] of Object.entries(bloques)) {
      const carpeta = `${modulo}/${nombre}`;
      if (!existsSync(join(raiz, 'piezas', modulo, nombre))) {
        problemas.push({ archivo, mensaje: `«${carpeta}» no es una carpeta de bloque (piezas/${carpeta}/)` });
      }
      for (const id of Object.keys(b.piezas ?? {})) {
        if (!ids.has(id)) problemas.push({ archivo, mensaje: `«${carpeta}»: la pieza «${id}» no existe` });
        else if (!idsPorBloque.get(carpeta)?.has(id)) problemas.push({ archivo, mensaje: `«${carpeta}»: la pieza «${id}» no está en ese bloque` });
      }
    }
  }
  if (problemas.length) throw new ErrorContenido(problemas);

  for (const p of piezas) {
    const partes = p.bloque.split('/');
    const b = partes.length === 2 ? r.data[partes[0]]?.[partes[1]] : undefined;
    resultado.set(p.id, {
      tema: b?.tema,
      dificultad: b?.piezas?.[p.id] ?? b?.dificultad,
      origenTema: b?.tema ? archivo : undefined,
    });
  }
  return resultado;
}

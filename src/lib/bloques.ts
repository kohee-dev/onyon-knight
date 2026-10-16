import { existsSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { load, YAMLException } from 'js-yaml';
import { problemasZod } from '../licencias';
import { esquemaBloque, type CabeceraBloque, type Dificultad } from './esquemas';
import { ErrorContenido } from './tipos';

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

/** Lee y valida el bloque.yml de una carpeta de piezas; sin archivo (o vacío), {}. */
export function leerBloque(dir: string): CabeceraBloque {
  const ruta = join(dir, 'bloque.yml');
  if (!existsSync(ruta)) return {};
  const archivo = relative(process.cwd(), ruta);
  const datos = cargarYaml(ruta, archivo);
  const r = esquemaBloque.safeParse(datos ?? {});
  if (!r.success) throw new ErrorContenido(problemasZod(r.error, archivo));
  return r.data;
}

/** leerBloque con caché propia: cada carpeta se lee una vez por lector (uno por carga, nunca global). */
export function lectorBloques(): (dir: string) => CabeceraBloque {
  const cache = new Map<string, CabeceraBloque>();
  return (dir) => {
    if (!cache.has(dir)) cache.set(dir, leerBloque(dir));
    return cache.get(dir)!;
  };
}

/** Valor final de un campo: el de la pieza o el de su bloque. El bloque.yml se valida siempre, aunque no se use. */
export function valorFinal<K extends keyof CabeceraBloque>(
  propio: CabeceraBloque[K],
  campo: K,
  dir: string,
  leer: (dir: string) => CabeceraBloque,
): CabeceraBloque[K] {
  const delBloque = leer(dir)[campo];
  return propio ?? delBloque;
}

export function dificultadFinal(propia: Dificultad | undefined, dir: string, leer: (dir: string) => CabeceraBloque): Dificultad | undefined {
  return valorFinal(propia, 'dificultad', dir, leer);
}

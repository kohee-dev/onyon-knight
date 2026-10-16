import { existsSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { problemasZod } from '../licencias';
import { cargarYaml } from './bloques';
import { esquemaTema, type Tema } from './esquemas';
import { raizContenido } from './raices';
import { ErrorContenido } from './tipos';

/** Lista cerrada de temas (contenido/temas.yml); sin archivo o vacío, []. */
export function leerTemas(ruta: string): Tema[] {
  if (!existsSync(ruta)) return [];
  const archivo = relative(process.cwd(), ruta);
  const r = esquemaTema.array().safeParse(cargarYaml(ruta, archivo) ?? []);
  if (!r.success) throw new ErrorContenido(problemasZod(r.error, archivo));
  const vistos = new Set<string>();
  const problemas = r.data.filter((t) => vistos.has(t.id) || !vistos.add(t.id)).map((t) => ({ archivo, mensaje: `tema repetido «${t.id}»` }));
  if (problemas.length) throw new ErrorContenido(problemas);
  return r.data;
}

/** Temas del contenido activo (contenido/temas.yml o el de ONYON_CONTENIDO). */
export const temasDelSitio = (): Tema[] => leerTemas(resolve(raizContenido, 'temas.yml'));

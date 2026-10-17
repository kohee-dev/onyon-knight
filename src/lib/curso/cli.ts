import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { dump } from 'js-yaml';
import { generarCurso, slug, type Modelo } from './generar';

export interface OpcionesCli {
  argumentos: string[];
  raizContenido?: string;
  dirCache?: string;
  modelo?: Modelo;
}

/** El proveedor real aún no está decidido (API de Claude o modelo local): hasta entonces el comando no puede llamar a ninguno. */
function modeloPorDefecto(): Modelo {
  throw new Error('no hay proveedor de modelo configurado todavía');
}

/** Capa fina del comando: valida el argumento, llama a generarCurso y escribe `modulos/<id>.yml` sin sobrescribir. */
export async function ejecutarCurso({ argumentos, raizContenido, dirCache, modelo }: OpcionesCli): Promise<string> {
  if (argumentos.length !== 1 || !argumentos[0].trim()) throw new Error('uso: node scripts/curso.mjs "tema"  (un único tema entre comillas)');
  const raiz = resolve(raizContenido ?? process.env.ONYON_CONTENIDO ?? 'contenido');
  const tema = argumentos[0].trim();

  // Antes de generar, para no gastar una llamada al modelo en algo que no se va a escribir.
  const previo = join(raiz, 'modulos', `${slug(tema)}.yml`);
  if (existsSync(previo)) throw new Error(`el módulo ya existe: ${previo}`);

  const { id, modulo } = await generarCurso({ tema, raizContenido: raiz, dirCache: dirCache ?? resolve('.cache/curso'), modelo: modelo ?? modeloPorDefecto() });
  const destino = join(raiz, 'modulos', `${id}.yml`);
  mkdirSync(dirname(destino), { recursive: true });
  // «wx»: aunque otro proceso lo cree entretanto, nunca se sobrescribe.
  writeFileSync(destino, dump(modulo, { lineWidth: -1 }), { encoding: 'utf8', flag: 'wx' });
  return destino;
}

/** Punto de entrada de scripts/curso.mjs. */
export async function main(argumentos: string[]): Promise<void> {
  try {
    const destino = await ejecutarCurso({ argumentos });
    console.log(`Módulo escrito (desactivado) en ${destino}`);
  } catch (e) {
    console.error(`Error: ${(e as Error).message}`);
    process.exitCode = 1;
  }
}

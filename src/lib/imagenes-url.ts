import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, extname, join } from 'node:path';

export const EXTENSIONES_IMAGEN = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];

export const TIPOS_IMAGEN: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

/** Nombre publicado: huella del contenido + nombre seguro. No depende de la carpeta. */
export function nombrePublicado(rutaAbs: string): string {
  const huella = createHash('sha256').update(readFileSync(rutaAbs)).digest('hex').slice(0, 8);
  const ext = extname(rutaAbs).toLowerCase();
  const nombre = basename(rutaAbs, extname(rutaAbs))
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${huella}-${nombre}${ext}`;
}

export function urlImagen(rutaAbs: string, base: string): string {
  return `${base}img/${nombrePublicado(rutaAbs)}`;
}

export function listarImagenes(raices: string[]): string[] {
  const salida: string[] = [];
  const recorrer = (dir: string) => {
    for (const n of readdirSync(dir)) {
      const r = join(dir, n);
      if (statSync(r).isDirectory()) recorrer(r);
      else if (EXTENSIONES_IMAGEN.includes(extname(n).toLowerCase())) salida.push(r);
    }
  };
  for (const r of raices) if (existsSync(r)) recorrer(r);
  return salida;
}

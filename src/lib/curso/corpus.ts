import { readFileSync } from 'node:fs';
import { basename, extname, join, relative } from 'node:path';
import { load } from 'js-yaml';
import { listarArchivos, separarCabecera } from '../cargador-piezas';
import { esquemaModulo, esquemaPieza } from '../esquemas';
import type { ModuloFuente, PiezaFuente } from '../tipos';

/** Lee las piezas y los módulos de una raíz de contenido pública, validados con los esquemas de la web. */
export function leerCorpus(raiz: string): { piezas: PiezaFuente[]; modulos: ModuloFuente[] } {
  const fuente = (ruta: string) => ({
    id: basename(ruta, extname(ruta)),
    archivo: relative(raiz, ruta).replaceAll('\\', '/'),
    rutaAbs: ruta,
    privado: false,
  });
  const piezas = listarArchivos(join(raiz, 'piezas'), '.md').map((ruta): PiezaFuente => {
    const { datos, cuerpo } = separarCabecera(readFileSync(ruta, 'utf8'));
    return { ...fuente(ruta), datos: esquemaPieza.parse(datos), cuerpo };
  });
  const modulos = listarArchivos(join(raiz, 'modulos'), '.yml').map(
    (ruta): ModuloFuente => ({ ...fuente(ruta), datos: esquemaModulo.parse(load(readFileSync(ruta, 'utf8'))) }),
  );
  return { piezas, modulos };
}

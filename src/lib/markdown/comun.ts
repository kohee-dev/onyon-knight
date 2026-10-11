import type { Node } from 'unist';
import type { VFile } from 'vfile';
import type { ContextoRender, ImagenUsada } from './index';
import type { PiezaFuente, Problema } from '../tipos';

/** Datos que comparten los plugins durante el render de una pieza. */
export interface EstadoRender {
  pieza: PiezaFuente;
  ctx: ContextoRender;
  /** Líneas del archivo que preceden al cuerpo (cabecera), para dar la línea real. */
  desplazamiento: number;
  problemas: Problema[];
  imagenes: ImagenUsada[];
  tieneMermaid: boolean;
}

export function estado(file: VFile): EstadoRender {
  return file.data.onyon as EstadoRender;
}

export function problema(file: VFile, nodo: Node | undefined, mensaje: string): void {
  const e = estado(file);
  const linea = nodo?.position ? nodo.position.start.line + e.desplazamiento : undefined;
  e.problemas.push({ archivo: e.pieza.archivo, linea, mensaje });
}

declare module 'vfile' {
  interface DataMap {
    onyon: EstadoRender;
  }
}

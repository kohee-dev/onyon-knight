import type { PhrasingContent, Root, Text } from 'mdast';
import type { VFile } from 'vfile';
import { SKIP, visit } from 'unist-util-visit';
import { estado } from './comun';

const ENLACE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

/** `[[id]]` y `[[id|texto]]`: ancla si la pieza está en la unidad; si no, su página (absoluta dentro de una unidad, por el PDF). */
export function remarkEnlaces() {
  return (arbol: Root, file: VFile) => {
    const e = estado(file);
    const { ctx, pieza } = e;
    visit(arbol, 'text', (nodo: Text, indice, padre: any) => {
      if (!nodo.value.includes('[[')) return;
      const partes: PhrasingContent[] = [];
      let ultimo = 0;
      for (const m of nodo.value.matchAll(ENLACE)) {
        const [completo, idBruto, texto] = m;
        const id = idBruto.trim();
        const linea = (nodo.position?.start.line ?? 0) + e.desplazamiento + nodo.value.slice(0, m.index).split('\n').length - 1;
        const fallo = (mensaje: string) => e.problemas.push({ archivo: pieza.archivo, linea, mensaje });
        if (m.index > ultimo) partes.push({ type: 'text', value: nodo.value.slice(ultimo, m.index) });
        ultimo = m.index + completo.length;

        const destino = ctx.catalogo.todas.get(id);
        if (!destino) {
          fallo(`enlace roto «${id}»`);
          continue;
        }
        if (destino.privado && !pieza.privado) {
          fallo(`enlace a contenido privado «${id}» desde una pieza pública`);
          continue;
        }
        const etiqueta = texto?.trim() || destino.datos.titulo;
        if (!ctx.catalogo.piezas.has(id)) {
          ctx.catalogo.avisos.push(`${pieza.id}: enlace a un borrador «${id}» (se muestra como texto)`);
          partes.push({ type: 'text', value: etiqueta });
          continue;
        }
        const ruta = `${ctx.base}apuntes/${id}/`;
        const url = ctx.unidad?.piezas.has(id) ? `#${id}` : ctx.unidad ? new URL(ruta, ctx.sitioUrl).href : ruta;
        partes.push({ type: 'link', url, children: [{ type: 'text', value: etiqueta }] });
      }
      if (ultimo === 0) return;
      if (ultimo < nodo.value.length) partes.push({ type: 'text', value: nodo.value.slice(ultimo) });
      padre.children.splice(indice!, 1, ...partes);
      return [SKIP, indice! + partes.length];
    });
  };
}

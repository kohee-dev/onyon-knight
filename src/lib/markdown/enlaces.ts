import type { PhrasingContent, Root, Text } from 'mdast';
import type { VFile } from 'vfile';
import { SKIP, visit } from 'unist-util-visit';
import { estado } from './comun';
import type { ContextoRender } from './index';

const ENLACE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

/** Destino de un enlace a una pieza según la página en que se renderiza (spec de casos §4.3). */
function urlDestino(ctx: ContextoRender, id: string): string {
  const u = ctx.unidad;
  if (!u) return `${ctx.base}apuntes/${id}/`;
  if (u.piezas.has(id)) return `#${id}`;
  const unidad = `${ctx.base}${u.modulo}/${u.id}/`;
  const ruta = u.teoria.has(id) ? `${unidad}#${id}` : u.casos.has(id) ? `${unidad}casos/${id}/` : `${ctx.base}apuntes/${id}/`;
  // Absoluta: el PDF se imprime desde 127.0.0.1.
  return new URL(ruta, ctx.sitioUrl).href;
}

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
        partes.push({ type: 'link', url: urlDestino(ctx, id), children: [{ type: 'text', value: etiqueta }] });
      }
      if (ultimo === 0) return;
      if (ultimo < nodo.value.length) partes.push({ type: 'text', value: nodo.value.slice(ultimo) });
      padre.children.splice(indice!, 1, ...partes);
      return [SKIP, indice! + partes.length];
    });
  };
}

/**
 * Enlaces Markdown normales: solo http(s), mailto y anclas. Las rutas del sitio (/…) se hacen absolutas
 * dentro de una unidad (el PDF se imprime desde 127.0.0.1); las relativas se rechazan en favor de [[id]].
 */
export function remarkEnlacesNormales() {
  return (arbol: Root, file: VFile) => {
    const e = estado(file);
    visit(arbol, (nodo: any) => {
      if (nodo.type !== 'link' && nodo.type !== 'definition') return;
      const url: string = nodo.url;
      const fallo = (mensaje: string) =>
        e.problemas.push({ archivo: e.pieza.archivo, linea: nodo.position ? nodo.position.start.line + e.desplazamiento : undefined, mensaje });
      if (/^(https?:|mailto:|#)/i.test(url)) return;
      if (url.startsWith('/') && !url.startsWith('//')) {
        if (e.ctx.unidad) nodo.url = new URL(url, e.ctx.sitioUrl).href;
        return;
      }
      if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//')) fallo(`enlace no permitido «${url}» (usa http, https o mailto)`);
      else fallo(`enlace relativo «${url}»: para enlazar otra pieza usa [[id]]`);
    });
  };
}

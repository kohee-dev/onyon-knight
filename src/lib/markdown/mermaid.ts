import type { Root } from 'mdast';
import type { VFile } from 'vfile';
import { visit } from 'unist-util-visit';
import { estado } from './comun';

/** Los diagramas se dibujan en el navegador (web y PDF): aquí solo se marcan. */
export function remarkMermaid() {
  return (arbol: Root, file: VFile) => {
    visit(arbol, 'code', (nodo, indice, padre: any) => {
      if (nodo.lang !== 'mermaid') return;
      estado(file).tieneMermaid = true;
      padre.children[indice!] = {
        type: 'diagrama',
        data: { hName: 'pre', hProperties: { className: ['mermaid'] }, hChildren: [{ type: 'text', value: nodo.value }] },
      };
    });
  };
}

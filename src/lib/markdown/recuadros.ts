import type { Root } from 'mdast';
import type { VFile } from 'vfile';
import { visit, SKIP } from 'unist-util-visit';
import { problema } from './comun';

export const RECUADROS: Record<string, string> = {
  ejercicio: 'Ejercicio',
  nota: 'Nota',
  aviso: 'Aviso',
  tip: 'Consejo',
};

/** Acepta la sintaxis heredada de Pandoc (`::: nota`) conservando el número de líneas. */
export function normalizarRecuadros(cuerpo: string): string {
  return cuerpo.replace(/^(\s*):::[ \t]+([a-z]+)[ \t]*$/gm, '$1:::$2');
}

export function remarkRecuadros() {
  return (arbol: Root, file: VFile) => {
    const fuente = String(file.value);
    visit(arbol, (nodo: any, indice, padre: any) => {
      if (nodo.type === 'textDirective' || nodo.type === 'leafDirective') {
        // No usamos directivas de texto ni de hoja: se devuelve el texto original (p. ej. `root:root`).
        const literal = fuente.slice(nodo.position.start.offset, nodo.position.end.offset);
        const reemplazo =
          nodo.type === 'leafDirective'
            ? { type: 'paragraph', children: [{ type: 'text', value: literal }] }
            : { type: 'text', value: literal };
        padre.children[indice!] = reemplazo;
        return SKIP;
      }
      if (nodo.type !== 'containerDirective') return;

      const bloque = fuente.slice(nodo.position.start.offset, nodo.position.end.offset);
      const ultima = bloque.trimEnd().split('\n').at(-1)!.trim();
      if (!/^:{3,}$/.test(ultima) || bloque.trim().split('\n').length < 2) {
        problema(file, nodo, `recuadro «${nodo.name}» sin cerrar (falta una línea «:::»)`);
      }
      const rotulo = RECUADROS[nodo.name];
      if (!rotulo) {
        problema(file, nodo, `recuadro desconocido «${nodo.name}» (permitidos: ${Object.keys(RECUADROS).join(', ')})`);
        return;
      }
      const etiqueta = nodo.children[0]?.data?.directiveLabel ? nodo.children.shift().children : [{ type: 'text', value: rotulo }];
      nodo.data = { hName: 'aside', hProperties: { className: ['recuadro', `recuadro-${nodo.name}`] } };
      nodo.children.unshift({ type: 'paragraph', data: { hProperties: { className: ['recuadro-titulo'] } }, children: etiqueta });
    });
  };
}

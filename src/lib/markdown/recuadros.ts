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

/**
 * Acepta la sintaxis heredada de Pandoc (`::: nota`) conservando el número de líneas.
 * No toca el interior de los bloques de código (``` o ~~~).
 */
export function normalizarRecuadros(cuerpo: string): string {
  let valla: string | null = null;
  return cuerpo
    .split('\n')
    .map((linea) => {
      const m = /^\s*(`{3,}|~{3,})/.exec(linea);
      if (m) {
        if (!valla) valla = m[1][0].repeat(m[1].length);
        else if (m[1].startsWith(valla)) valla = null;
        return linea;
      }
      return valla ? linea : linea.replace(/^(\s*):::[ \t]+([a-z]+)[ \t]*$/, '$1:::$2');
    })
    .join('\n');
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
        // Dentro de otro recuadro es ambiguo cuál quedó sin cerrar: se nombran los dos y cómo anidar.
        const padreRecuadro = padre?.type === 'containerDirective' ? padre.name : null;
        problema(
          file,
          nodo,
          padreRecuadro
            ? `recuadro «${nodo.name}» sin cerrar, o «${padreRecuadro}», que lo contiene (falta una línea «:::»; para anidar, el exterior lleva más «:», p. ej. «::::${padreRecuadro}»)`
            : `recuadro «${nodo.name}» sin cerrar (falta una línea «:::»)`,
        );
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

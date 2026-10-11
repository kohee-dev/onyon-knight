import type { Root } from 'mdast';
import type { VFile } from 'vfile';
import { visit } from 'unist-util-visit';
import { problema } from './comun';

/** El HTML en línea se descartaría en silencio: se convierte en error. */
export function remarkSinHtml() {
  return (arbol: Root, file: VFile) => {
    visit(arbol, 'html', (nodo) => {
      problema(file, nodo, `HTML en línea no permitido («${nodo.value.slice(0, 40)}»); si es texto, escríbelo entre \`comillas invertidas\``);
    });
  };
}

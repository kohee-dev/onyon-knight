import GithubSlugger from 'github-slugger';
import type { Heading, Root } from 'mdast';
import { toString } from 'mdast-util-to-string';
import type { VFile } from 'vfile';
import { visit } from 'unist-util-visit';
import { estado } from './comun';

export function sinDiacriticos(texto: string): string {
  return texto.normalize('NFD').replace(/\p{M}/gu, '');
}

/** Normaliza niveles (el mínimo pasa a h2 suelta / h3 en unidad) y prefija los ids con la pieza. */
export function remarkEncabezados() {
  return (arbol: Root, file: VFile) => {
    const { pieza, ctx, titulos } = estado(file);
    const encabezados: Heading[] = [];
    visit(arbol, 'heading', (h) => void encabezados.push(h));
    if (!encabezados.length) return;
    const minimo = Math.min(...encabezados.map((h) => h.depth));
    const desplazar = (ctx.unidad ? 3 : 2) - minimo;
    const slugger = new GithubSlugger();
    for (const h of encabezados) {
      const relativo = h.depth - minimo + 1;
      const texto = toString(h);
      const id = `${pieza.id}--${slugger.slug(sinDiacriticos(texto))}`;
      h.depth = Math.min(6, h.depth + desplazar) as Heading['depth'];
      h.data = { ...h.data, hProperties: { id, className: [`titulo-${relativo}`] } };
      titulos.push({ id, texto, nivel: relativo });
    }
  };
}

import { existsSync, readFileSync } from 'node:fs';
import rehypeShiki from '@shikijs/rehype';
import rehypeStringify from 'rehype-stringify';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { VFile } from 'vfile';
import { ErrorContenido, type Catalogo, type Ficha, type Modo, type PiezaFuente } from '../tipos';
import type { EstadoRender } from './comun';
import { remarkEncabezados } from './encabezados';
import { remarkEnlaces, remarkEnlacesNormales } from './enlaces';
import { remarkImagenes } from './imagenes';
import { remarkSinHtml } from './html';
import { remarkMermaid } from './mermaid';
import { normalizarRecuadros, remarkRecuadros } from './recuadros';

export interface ContextoRender {
  catalogo: Catalogo;
  modo: Modo;
  base: string;
  sitioUrl: string;
  /** Ausente = página /apuntes/<id>/. */
  unidad?: { modulo: string; id: string; piezas: Set<string> };
}

export interface ImagenUsada {
  rutaAbs: string;
  rutaFicha: string;
  url: string;
  alt: string;
  ficha: Ficha;
}

export interface PiezaRenderizada {
  id: string;
  html: string;
  imagenes: ImagenUsada[];
  tieneMermaid: boolean;
}

const procesador = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkDirective)
  .use(remarkSinHtml)
  .use(remarkRecuadros)
  .use(remarkEncabezados)
  .use(remarkMermaid)
  .use(remarkEnlacesNormales)
  .use(remarkEnlaces)
  .use(remarkImagenes)
  .use(remarkRehype)
  .use(rehypeShiki, {
    themes: { light: 'github-light', dark: 'github-dark' },
    lazy: true,
    fallbackLanguage: 'text',
  })
  .use(rehypeStringify);

/** Líneas del archivo previas al cuerpo (la cabecera), para que los errores indiquen la línea real. */
function desplazamientoDe(p: PiezaFuente): number {
  if (!existsSync(p.rutaAbs)) return 0;
  const texto = readFileSync(p.rutaAbs, 'utf8');
  const i = p.cuerpo ? texto.indexOf(p.cuerpo) : -1;
  return i > 0 ? texto.slice(0, i).split('\n').length - 1 : 0;
}

export async function renderizarPieza(p: PiezaFuente, ctx: ContextoRender): Promise<PiezaRenderizada> {
  const estado: EstadoRender = {
    pieza: p,
    ctx,
    desplazamiento: desplazamientoDe(p),
    problemas: [],
    imagenes: [],
    tieneMermaid: false,
  };
  const file = new VFile({ value: normalizarRecuadros(p.cuerpo), path: p.rutaAbs, data: { onyon: estado } });
  const arbol = procesador.parse(file);
  const hast = await procesador.run(arbol, file);
  if (estado.problemas.length) throw new ErrorContenido(estado.problemas);
  const html = procesador.stringify(hast as any, file);
  return { id: p.id, html: String(html), imagenes: estado.imagenes, tieneMermaid: estado.tieneMermaid };
}

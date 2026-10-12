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
import { remarkImagenes, resolverImagen } from './imagenes';
import { remarkSinHtml } from './html';
import { remarkMermaid } from './mermaid';
import { normalizarRecuadros, remarkRecuadros } from './recuadros';

export interface ContextoRender {
  catalogo: Catalogo;
  modo: Modo;
  base: string;
  sitioUrl: string;
  /** Carpetas de contenido publicables: una imagen fuera de ellas es un error. Sin definir, no se comprueba. */
  raices?: string[];
  /** Nivel HTML del primer título del cuerpo. Por defecto: 3 dentro de una unidad, 2 en una página suelta. */
  nivelTitulos?: 2 | 3;
  /** Ausente = página /apuntes/<id>/. */
  unidad?: {
    modulo: string;
    id: string;
    /** Piezas renderizadas en ESTA página: los enlaces a ellas son anclas. */
    piezas: Set<string>;
    /** Teoría de la unidad: `<unidad>/#id`. */
    teoria: Set<string>;
    /** Casos de la unidad: `<unidad>/casos/<id>/`. */
    casos: Set<string>;
  };
}

export interface ImagenUsada {
  rutaAbs: string;
  rutaFicha: string;
  url: string;
  alt: string;
  ficha: Ficha;
}

export interface Titulo {
  id: string;
  texto: string;
  /** Nivel relativo dentro de la pieza (1 = titulo-1). */
  nivel: number;
}

export interface PiezaRenderizada {
  id: string;
  html: string;
  imagenes: ImagenUsada[];
  tieneMermaid: boolean;
  /** Solo en casos; ausente = imagen genérica. */
  portada?: ImagenUsada;
  cabecera?: ImagenUsada;
  titulos: Titulo[];
}

/** Cada tabla va en un contenedor con desplazamiento propio: nunca sale de la columna ni tapa el índice. */
function rehypeTablas() {
  return (arbol: any) => {
    const recorrer = (nodo: any) => {
      if (!nodo.children) return;
      nodo.children = nodo.children.map((h: any) => {
        recorrer(h);
        return h.type === 'element' && h.tagName === 'table'
          ? { type: 'element', tagName: 'div', properties: { className: ['tabla-desplazable'], tabIndex: 0, role: 'region', ariaLabel: 'Tabla' }, children: [h] }
          : h;
      });
    };
    recorrer(arbol);
  };
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
  .use(rehypeTablas)
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
    titulos: [],
  };
  const file = new VFile({ value: normalizarRecuadros(p.cuerpo), path: p.rutaAbs, data: { onyon: estado } });
  const arbol = procesador.parse(file);
  const hast = await procesador.run(arbol, file);
  const imagenesCaso = p.datos.tipo === 'caso' ? resolverImagenesCaso(p, ctx, estado) : {};
  if (estado.problemas.length) throw new ErrorContenido(estado.problemas);
  const html = procesador.stringify(hast as any, file);
  return { id: p.id, html: String(html), imagenes: estado.imagenes, tieneMermaid: estado.tieneMermaid, ...imagenesCaso, titulos: estado.titulos };
}

/** Portada y cabecera de un caso: validadas como cualquier imagen; si faltan, imagen genérica y aviso. */
function resolverImagenesCaso(p: PiezaFuente, ctx: ContextoRender, estado: EstadoRender): { portada?: ImagenUsada; cabecera?: ImagenUsada } {
  const resultado: { portada?: ImagenUsada; cabecera?: ImagenUsada } = {};
  for (const campo of ['portada', 'cabecera'] as const) {
    const url = p.datos[campo];
    if (!url) {
      const aviso = `caso sin ${campo}: ${p.id}`;
      if (!ctx.catalogo.avisos.includes(aviso)) ctx.catalogo.avisos.push(aviso);
      continue;
    }
    try {
      const imagen = resolverImagen(url, `${campo === 'portada' ? 'Portada' : 'Cabecera'} de «${p.datos.titulo}»`, {
        rutaPieza: p.rutaAbs,
        archivo: p.archivo,
        base: ctx.base,
        raices: ctx.raices,
      });
      resultado[campo] = imagen;
      if (!estado.imagenes.some((i) => i.rutaAbs === imagen.rutaAbs)) estado.imagenes.push(imagen);
    } catch (e) {
      if (!(e instanceof ErrorContenido)) throw e;
      estado.problemas.push(...e.problemas.map((x) => ({ ...x, mensaje: `«${campo}»: ${x.mensaje}` })));
    }
  }
  return resultado;
}

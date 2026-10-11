import { existsSync, readFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { load, YAMLException } from 'js-yaml';
import type { Image, Root } from 'mdast';
import type { VFile } from 'vfile';
import { SKIP, visit } from 'unist-util-visit';
import { validarFicha } from '../../licencias';
import { urlImagen } from '../imagenes-url';
import { ErrorContenido, type Ficha } from '../tipos';
import type { ImagenUsada } from './index';
import { estado, problema } from './comun';

export const CLASES_IMAGEN = ['pequena', 'mediana', 'completa', 'derecha'];
const ATRIBUTOS = /^\{([^}]*)\}/;

const t = (value: string) => ({ type: 'text', value });
const enlace = (href: string, texto: string) => ({
  type: 'element',
  tagName: 'a',
  properties: { href },
  children: [t(texto)],
});

/** Línea de crédito: Autor · Licencia · Fuente [· uso no comercial] [· Modificada: …]. */
export function lineaCredito(f: Ficha): any[] {
  const partes: any[][] = [[t(f.titular ? `${f.autor} (© ${f.titular})` : f.autor)]];
  partes.push([f.licencia.url ? enlace(f.licencia.url, f.licencia.nombre) : t(f.licencia.nombre)]);
  if (f.fuente) partes.push([/^https?:\/\//.test(f.fuente) ? enlace(f.fuente, 'Fuente') : t(`Fuente: ${f.fuente}`)]);
  if (f.licencia.noComercial) partes.push([t('uso no comercial')]);
  if (f.cambios) partes.push([t(`Modificada: ${f.cambios}`)]);
  return partes.flatMap((p, i) => (i ? [t(' · '), ...p] : p));
}

function leerFicha(rutaFicha: string, archivoMensaje: string): Ficha {
  let datos: unknown;
  try {
    datos = load(readFileSync(rutaFicha, 'utf8'));
  } catch (e) {
    if (!(e instanceof YAMLException)) throw e;
    throw new ErrorContenido([{ archivo: archivoMensaje, mensaje: `YAML no válido: ${(e as Error).message.split('\n')[0]}` }]);
  }
  return validarFicha(datos, archivoMensaje);
}

/**
 * Valida y resuelve una imagen local de una pieza: no remota, existente y con ficha válida.
 * Lo usan las imágenes del texto y la portada/cabecera de los casos. Lanza ErrorContenido (sin línea).
 */
export function resolverImagen(url: string, alt: string, ctx: { rutaPieza: string; archivo: string; base: string }): ImagenUsada {
  const fallo = (mensaje: string): never => {
    throw new ErrorContenido([{ archivo: ctx.archivo, mensaje }]);
  };
  if (/^[a-z]+:\/\//i.test(url) || url.startsWith('//')) fallo(`imagen remota no permitida «${url}»: descárgala junto a la pieza con su ficha`);
  const rutaAbs = resolve(dirname(ctx.rutaPieza), decodeURI(url));
  if (!existsSync(rutaAbs)) fallo(`imagen inexistente «${url}»`);
  const rutaFicha = join(dirname(rutaAbs), `${url.split('/').at(-1)!.slice(0, -extname(rutaAbs).length || undefined)}.yml`);
  const relFicha = url.replace(/\.[^.\/]+$/, '.yml');
  if (!existsSync(rutaFicha)) fallo(`falta la ficha de licencia «${relFicha}» junto a la imagen`);
  const ficha = leerFicha(rutaFicha, `${ctx.archivo} → ${relFicha}`);
  return { rutaAbs, rutaFicha, url: urlImagen(rutaAbs, ctx.base), alt, ficha };
}

export function remarkImagenes() {
  return (arbol: Root, file: VFile) => {
    const e = estado(file);
    visit(arbol, 'paragraph', (parrafo: any, indice, padre: any) => {
      const hijos: any[] = parrafo.children;
      if (!hijos.some((h) => h.type === 'image')) return;

      // Párrafo de imágenes: solo imágenes, sus atributos {…} y espacios.
      const figuras: any[] = [];
      for (let i = 0; i < hijos.length; i++) {
        const h = hijos[i];
        if (h.type === 'text' && !h.value.trim()) continue;
        if (h.type !== 'image') {
          problema(file, h, 'la imagen debe ir en su propio párrafo, sin texto alrededor');
          return SKIP;
        }
        let clases: string[] = [];
        const siguiente = hijos[i + 1];
        const attr = siguiente?.type === 'text' ? ATRIBUTOS.exec(siguiente.value) : null;
        if (attr) {
          clases = attr[1].trim().split(/\s+/).filter(Boolean).map((c) => c.replace(/^\./, ''));
          for (const c of clases) if (!CLASES_IMAGEN.includes(c)) problema(file, siguiente, `clase de imagen desconocida «${c}» (permitidas: ${CLASES_IMAGEN.join(', ')})`);
          siguiente.value = siguiente.value.slice(attr[0].length);
        }
        const figura = figuraDe(h, clases, file);
        if (figura) figuras.push(figura);
      }
      padre.children.splice(indice!, 1, ...figuras);
      return [SKIP, indice! + figuras.length];
    });

    function figuraDe(img: Image, clases: string[], file: VFile): any | null {
      if (!img.alt?.trim()) {
        problema(file, img, 'falta el texto alternativo de la imagen ![texto](…)');
        return null;
      }
      let usada: ImagenUsada;
      try {
        usada = resolverImagen(img.url, img.alt, { rutaPieza: e.pieza.rutaAbs, archivo: e.pieza.archivo, base: e.ctx.base });
      } catch (err) {
        if (!(err instanceof ErrorContenido)) throw err;
        e.problemas.push(...err.problemas.map((p) => ({ ...p, linea: img.position ? img.position.start.line + e.desplazamiento : undefined })));
        return null;
      }
      e.imagenes.push(usada);
      const url = usada.url;
      const ficha = usada.ficha;
      return {
        type: 'figura',
        data: {
          hName: 'figure',
          hProperties: { className: ['figura', ...clases.map((c) => `fig-${c}`)] },
          hChildren: [
            { type: 'element', tagName: 'img', properties: { src: url, alt: img.alt, loading: 'lazy' }, children: [] },
            {
              type: 'element',
              tagName: 'figcaption',
              properties: {},
              children: [
                { type: 'element', tagName: 'span', properties: { className: ['figura-pie'] }, children: [t(img.alt)] },
                { type: 'element', tagName: 'span', properties: { className: ['credito'] }, children: lineaCredito(ficha) },
              ],
            },
          ],
        },
      };
    }
  };
}

import { resolve } from 'node:path';
import { defineCollection } from 'astro:content';
import type { Loader } from 'astro/loaders';
import { glob } from 'astro/loaders';
import { piezasMarkdown } from './lib/cargador-piezas';
import { esquemaModulo, esquemaPieza } from './lib/esquemas';
// El contenido privado solo se carga en `astro dev`; `astro build` nunca lo publica (ver raices.ts).
import { raizContenido as contenido, raizPrivada as privado } from './lib/raices';

// Las piezas se cargan como datos: Astro no procesa su Markdown (ni sus imágenes); lo hace src/lib/markdown.
const piezasEn = (base: string) => defineCollection({ loader: piezasMarkdown(base), schema: esquemaPieza });
const modulosEn = (base: string) =>
  defineCollection({ loader: glob({ pattern: '*.yml', base }), schema: esquemaModulo });

/** Sin carpeta privada, las colecciones privadas existen pero se vacían: así no sobrevive nada de una sesión anterior. */
const vacia: Loader = { name: 'onyon-vacia', load: async ({ store }) => store.clear() };

export const collections = {
  piezas: piezasEn(resolve(contenido, 'piezas')),
  modulos: modulosEn(resolve(contenido, 'modulos')),
  piezasPrivadas: privado ? piezasEn(resolve(privado, 'piezas')) : defineCollection({ loader: vacia, schema: esquemaPieza }),
  modulosPrivados: privado ? modulosEn(resolve(privado, 'modulos')) : defineCollection({ loader: vacia, schema: esquemaModulo }),
};

import { resolve } from 'node:path';
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { piezasMarkdown } from './lib/cargador-piezas';
import { esquemaModulo, esquemaPieza } from './lib/esquemas';
// El contenido privado solo se carga en `astro dev`; `astro build` nunca lo publica (ver raices.ts).
import { raizContenido as contenido, raizPrivada as privado } from './lib/raices';

// Las piezas se cargan como datos: Astro no procesa su Markdown (ni sus imágenes); lo hace src/lib/markdown.
const piezasEn = (base: string) => defineCollection({ loader: piezasMarkdown(base), schema: esquemaPieza });
const modulosEn = (base: string) =>
  defineCollection({ loader: glob({ pattern: '*.yml', base }), schema: esquemaModulo });

export const collections = {
  piezas: piezasEn(resolve(contenido, 'piezas')),
  modulos: modulosEn(resolve(contenido, 'modulos')),
  ...(privado
    ? {
        piezasPrivadas: piezasEn(resolve(privado, 'piezas')),
        modulosPrivados: modulosEn(resolve(privado, 'modulos')),
      }
    : {}),
};

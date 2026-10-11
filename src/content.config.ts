import { resolve } from 'node:path';
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { esquemaModulo, esquemaPieza } from './lib/esquemas';
// El contenido privado solo se carga en `astro dev`; `astro build` nunca lo publica (ver raices.ts).
import { raizContenido as contenido, raizPrivada as privado } from './lib/raices';

const piezasEn = (base: string) =>
  defineCollection({ loader: glob({ pattern: '**/*.md', base }), schema: esquemaPieza });
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

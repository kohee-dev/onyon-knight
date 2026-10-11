import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { esquemaModulo, esquemaPieza } from './lib/esquemas';

const contenido = resolve(process.env.ONYON_CONTENIDO ?? 'contenido');
// El contenido privado solo se carga en `astro dev`; `astro build` nunca lo publica.
const privado = import.meta.env.DEV && process.env.ONYON_PRIVADO ? resolve(process.env.ONYON_PRIVADO) : null;

const piezasEn = (base: string) =>
  defineCollection({ loader: glob({ pattern: '**/*.md', base }), schema: esquemaPieza });
const modulosEn = (base: string) =>
  defineCollection({ loader: glob({ pattern: '*.yml', base }), schema: esquemaModulo });

export const collections = {
  piezas: piezasEn(resolve(contenido, 'piezas')),
  modulos: modulosEn(resolve(contenido, 'modulos')),
  ...(privado && existsSync(privado)
    ? {
        piezasPrivadas: piezasEn(resolve(privado, 'piezas')),
        modulosPrivados: modulosEn(resolve(privado, 'modulos')),
      }
    : {}),
};

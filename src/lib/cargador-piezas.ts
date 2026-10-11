import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Loader } from 'astro/loaders';
import { load } from 'js-yaml';

const CABECERA = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

function listarMarkdown(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((n) => {
    const r = join(dir, n);
    return statSync(r).isDirectory() ? listarMarkdown(r) : n.endsWith('.md') ? [r] : [];
  });
}

/** Separa la cabecera YAML del cuerpo. Exportado para las pruebas. */
export function separarCabecera(texto: string): { datos: unknown; cuerpo: string } {
  const m = CABECERA.exec(texto);
  if (!m) return { datos: {}, cuerpo: texto };
  return { datos: load(m[1]) ?? {}, cuerpo: texto.slice(m[0].length) };
}

/**
 * Carga las piezas como datos (cabecera validada + cuerpo sin procesar). No usa el Markdown de Astro:
 * las piezas se renderizan con src/lib/markdown según el contexto de cada unidad.
 */
export function piezasMarkdown(base: string): Loader {
  return {
    name: 'onyon-piezas',
    async load({ store, parseData, config, watcher, logger }) {
      const raiz = fileURLToPath(config.root);
      const cargar = async () => {
        store.clear();
        for (const ruta of listarMarkdown(base)) {
          const filePath = relative(raiz, ruta);
          const texto = readFileSync(ruta, 'utf8');
          let separado;
          try {
            separado = separarCabecera(texto);
          } catch (e) {
            throw new Error(`${filePath}: cabecera YAML no válida: ${(e as Error).message.split('\n')[0]}`);
          }
          const data = await parseData({ id: filePath, data: separado.datos as Record<string, unknown>, filePath });
          store.set({ id: filePath, data, body: separado.cuerpo, filePath, digest: texto });
        }
      };
      await cargar();
      if (watcher) {
        watcher.add(base);
        const recargar = async (ruta: string) => {
          if (!ruta.startsWith(base) || !ruta.endsWith('.md')) return;
          logger.info(`recargando piezas (${relative(raiz, ruta)})`);
          await cargar();
        };
        watcher.on('change', recargar);
        watcher.on('add', recargar);
        watcher.on('unlink', recargar);
      }
    },
  };
}

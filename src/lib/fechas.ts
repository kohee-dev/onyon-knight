import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { relative } from 'node:path';
import { load } from 'js-yaml';

/** Salida de `git log --format=%x00%cI --name-only` → ruta relativa → fecha más reciente. */
export function parsearGitLog(salida: string): Map<string, Date> {
  const fechas = new Map<string, Date>();
  for (const bloque of salida.split('\0')) {
    const [cabecera, ...archivos] = bloque.split('\n');
    if (!cabecera.trim()) continue;
    const fecha = new Date(cabecera.trim());
    for (const a of archivos) if (a.trim() && !fechas.has(a.trim())) fechas.set(a.trim(), fecha);
  }
  return fechas;
}

function bloques(yaml: string): Map<string, string> {
  const datos = load(yaml) as { unidades?: { id: string; titulo: string; piezas: string[] }[] } | null;
  return new Map((datos?.unidades ?? []).map((u) => [u.id, JSON.stringify([u.titulo, u.piezas])]));
}

/**
 * Fecha de cada bloque de unidad: la del commit más reciente en que su título o su lista de piezas cambió.
 * `versiones` va de la más reciente a la más antigua; `fecha: null` = cambios sin commitear.
 */
export function fechasBloques(versiones: { fecha: Date | null; yaml: string }[]): Map<string, Date | null> {
  const resultado = new Map<string, Date | null>();
  const anterior = new Map<string, string>();
  for (const v of [...versiones].reverse()) {
    for (const [id, valor] of bloques(v.yaml)) {
      if (anterior.get(id) !== valor) resultado.set(id, v.fecha);
      anterior.set(id, valor);
    }
  }
  return resultado;
}

const formato = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Madrid' });

export function formatearFecha(d: Date | null): string {
  return d ? `Actualizado el ${formato.format(d)}` : 'Sin publicar';
}

export interface IndiceFechas {
  /** La más reciente de las rutas; `null` si alguna no está commiteada, tiene cambios o está fuera del repo. */
  fechaDe(rutasAbs: string[]): Date | null;
  fechaUnidad(rutaModuloAbs: string, unidad: string): Date | null;
  avisos: string[];
}

export async function leerFechas(raizRepo: string): Promise<IndiceFechas> {
  const git = (...args: string[]) =>
    execFileSync('git', ['-C', raizRepo, '-c', 'core.quotePath=false', ...args], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });

  let fechas = new Map<string, Date>();
  const sucios = new Set<string>();
  const avisos: string[] = [];
  try {
    fechas = parsearGitLog(git('log', '--format=%x00%cI', '--name-only'));
    // -z: rutas sin comillas ni escapes (no ASCII, espacios). En renombrados, la ruta de origen va en la entrada siguiente.
    const entradas = git('status', '--porcelain=v1', '-z', '--untracked-files=all').split('\0');
    for (let i = 0; i < entradas.length; i++) {
      const e = entradas[i];
      if (!e) continue;
      sucios.add(e.slice(3));
      if (e[0] === 'R' || e[0] === 'C') sucios.add(entradas[++i]);
    }
  } catch {
    avisos.push('git no está disponible o no hay historial: todas las fechas se muestran como «Sin publicar»');
  }

  const fechaRel = (rutaAbs: string): Date | null => {
    const rel = relative(raizRepo, rutaAbs);
    if (rel.startsWith('..') || sucios.has(rel)) return null;
    return fechas.get(rel) ?? null;
  };

  const cacheBloques = new Map<string, Map<string, Date | null>>();
  const bloquesDe = (rutaModuloAbs: string) => {
    let m = cacheBloques.get(rutaModuloAbs);
    if (m) return m;
    const rel = relative(raizRepo, rutaModuloAbs);
    const versiones: { fecha: Date | null; yaml: string }[] = [];
    if (!rel.startsWith('..')) {
      try {
        if (sucios.has(rel)) versiones.push({ fecha: null, yaml: readFileSync(rutaModuloAbs, 'utf8') });
        for (const l of git('log', '--format=%H%x00%cI', '--', rel).split('\n').filter(Boolean)) {
          const [hash, fecha] = l.split('\0');
          versiones.push({ fecha: new Date(fecha), yaml: git('show', `${hash}:${rel}`) });
        }
      } catch {
        /* sin historial: se queda vacío */
      }
    }
    m = fechasBloques(versiones);
    cacheBloques.set(rutaModuloAbs, m);
    return m;
  };

  return {
    avisos,
    fechaDe(rutasAbs) {
      let max: Date | null = null;
      for (const r of rutasAbs) {
        const f = fechaRel(r);
        if (!f) return null;
        if (!max || f > max) max = f;
      }
      return max;
    },
    fechaUnidad(rutaModuloAbs, unidad) {
      return bloquesDe(rutaModuloAbs).get(unidad) ?? null;
    },
  };
}

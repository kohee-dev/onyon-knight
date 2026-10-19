import type { CasoSitio, PiezaEnUnidad, Sitio, UnidadSitio } from './sitio';
import type { ModuloFuente, Tema } from './tipos';

export interface GrupoTema {
  modulo: ModuloFuente;
  teoria: { pieza: PiezaEnUnidad; unidad: UnidadSitio; url: string }[];
  casos: CasoSitio[];
}

/** Piezas de un tema agrupadas por módulo, en el orden del sitio (módulos, unidades, piezas). */
export function gruposDeTema(sitio: Sitio, idTema: string): GrupoTema[] {
  const grupos: GrupoTema[] = [];
  for (const unidad of sitio.unidades) {
    const teoria = unidad.teoria.filter((p) => p.fuente.tema === idTema).map((pieza) => ({ pieza, unidad, url: `${unidad.url}#${pieza.fuente.id}` }));
    const casos = unidad.casos.filter((c) => c.pieza.fuente.tema === idTema);
    if (!teoria.length && !casos.length) continue;
    let grupo = grupos.at(-1);
    if (grupo?.modulo.id !== unidad.modulo.id) grupos.push((grupo = { modulo: unidad.modulo, teoria: [], casos: [] }));
    grupo.teoria.push(...teoria);
    grupo.casos.push(...casos);
  }
  return grupos;
}

/** Temas con piezas publicadas, en el orden de temas.yml; n cuenta piezas distintas. */
export function temasConPiezas(sitio: Sitio): { tema: Tema; n: number }[] {
  const ids = new Map<string, Set<string>>();
  for (const u of sitio.unidades) {
    for (const f of [...u.teoria.map((p) => p.fuente), ...u.casos.map((c) => c.pieza.fuente)]) {
      if (f.tema) ids.set(f.tema, (ids.get(f.tema) ?? new Set()).add(f.id));
    }
  }
  return sitio.catalogo.temas.map((tema) => ({ tema, n: ids.get(tema.id)?.size ?? 0 })).filter((t) => t.n > 0);
}

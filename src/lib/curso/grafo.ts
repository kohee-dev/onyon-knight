import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Extraccion } from './extractor';

interface Nodo {
  nombre: string;
  piezas: string[];
  vecinos: string[];
}

/** Grafo de entidades: nodos por clave normalizada, aristas no dirigidas, y las piezas donde aparece cada entidad. */
export class Grafo {
  private nodos = new Map<string, Nodo>();

  /** Clave con la que se identifica una entidad sin importar mayúsculas, tildes o espacios. */
  static clave(nombre: string): string {
    return nombre.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  static desde(extracciones: Map<string, Extraccion>): Grafo {
    const grafo = new Grafo();
    for (const [pieza, { entidades, relaciones }] of extracciones) {
      for (const nombre of [...entidades, ...relaciones.flat()]) grafo.nodo(nombre)?.piezas.push(pieza);
      for (const [a, b] of relaciones) grafo.unir(a, b);
    }
    for (const n of grafo.nodos.values()) n.piezas = [...new Set(n.piezas)];
    return grafo;
  }

  private nodo(nombre: string): Nodo | undefined {
    const clave = Grafo.clave(nombre);
    if (!clave) return undefined;
    let n = this.nodos.get(clave);
    if (!n) this.nodos.set(clave, (n = { nombre: nombre.trim(), piezas: [], vecinos: [] }));
    return n;
  }

  private unir(a: string, b: string) {
    const ka = Grafo.clave(a);
    const kb = Grafo.clave(b);
    if (!ka || !kb || ka === kb) return;
    const [na, nb] = [this.nodo(a)!, this.nodo(b)!];
    if (!na.vecinos.includes(kb)) na.vecinos.push(kb);
    if (!nb.vecinos.includes(ka)) nb.vecinos.push(ka);
  }

  /** Nombres de todas las entidades, para ofrecérselos al modelo como vocabulario de semillas. */
  entidades(): string[] {
    return [...this.nodos.values()].map((n) => n.nombre);
  }

  /** Claves de las semillas que existen en el grafo, ampliadas a sus vecinos directos. */
  vecindad(semillas: string[]): Set<string> {
    const claves = new Set<string>();
    for (const s of semillas) {
      const k = Grafo.clave(s);
      const n = this.nodos.get(k);
      if (!n) continue;
      claves.add(k);
      n.vecinos.forEach((v) => claves.add(v));
    }
    return claves;
  }

  /** Piezas con al menos una entidad de la vecindad, con las entidades compartidas; más entidades primero, luego por id. */
  piezasDe(claves: Set<string>): Map<string, string[]> {
    const porPieza = new Map<string, string[]>();
    for (const clave of claves) {
      const n = this.nodos.get(clave)!;
      for (const p of n.piezas) porPieza.set(p, [...(porPieza.get(p) ?? []), n.nombre]);
    }
    const orden = [...porPieza].sort(([ia, ea], [ib, eb]) => eb.length - ea.length || ia.localeCompare(ib));
    return new Map(orden.map(([id, nombres]) => [id, nombres.sort((a, b) => a.localeCompare(b))]));
  }

  /** JSON legible para abrirlo y entender el índice. */
  guardar(dirCache: string): void {
    mkdirSync(dirCache, { recursive: true });
    const entidades = Object.fromEntries([...this.nodos].map(([clave, n]) => [clave, n]));
    writeFileSync(join(dirCache, 'grafo.json'), JSON.stringify({ entidades }, null, 2) + '\n', 'utf8');
  }
}

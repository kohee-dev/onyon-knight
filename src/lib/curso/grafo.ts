import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Extraccion } from './extractor';

/** Por cada pieza (id), las entidades que la justificaron. */
export type Justificacion = Record<string, string[]>;

interface Nodo {
  nombre: string;
  piezas: string[];
  vecinos: string[];
}

/** Grafo de entidades: nodos por clave normalizada, aristas no dirigidas, y las piezas donde aparece cada entidad. */
export class Grafo {
  private nodos = new Map<string, Nodo>();

  /** Clave con la que se identifica una entidad sin importar mayúsculas, tildes o espacios, pero sin fundir símbolos con significado (C, C++, C#). */
  static clave(nombre: string): string {
    return nombre
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      // Un punto que no precede a una letra o cifra (final de frase o de sigla) o que sigue a otro punto no forma parte del nombre.
      .replace(/\.(?![\p{L}\p{N}])|(?<=\.)\./gu, ' ')
      // Las siglas con puntos (S.O., e.g.) valen lo mismo que sin ellos.
      .replace(/(?<![\p{L}\p{N}])(\p{L})\.(?=\p{L}(?![\p{L}\p{N}]))/gu, '$1')
      // +, # y el punto interno distinguen C, C++, C#, Node.js: se conservan tal cual, sin sustituirlos por palabras.
      .replace(/[^\p{L}\p{N}+#.]+/gu, ' ')
      .trim();
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
    // Sin letras ni cifras (p. ej. «#» suelto) no es un concepto: enlazaría piezas sin relación.
    if (!/[\p{L}\p{N}]/u.test(clave)) return undefined;
    let n = this.nodos.get(clave);
    if (!n) this.nodos.set(clave, (n = { nombre: nombre.trim(), piezas: [], vecinos: [] }));
    return n;
  }

  private unir(a: string, b: string) {
    const ka = Grafo.clave(a);
    const kb = Grafo.clave(b);
    const [na, nb] = [this.nodo(a), this.nodo(b)];
    if (!na || !nb || ka === kb) return;
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

export interface Problema {
  archivo: string;
  linea?: number;
  mensaje: string;
}

/** Error de contenido: reúne todos los problemas detectados; nunca se oculta contenido en silencio. */
export class ErrorContenido extends Error {
  constructor(public problemas: Problema[]) {
    super(
      'Errores de contenido:\n' +
        problemas.map((p) => `  ${p.archivo}${p.linea ? `:${p.linea}` : ''} — ${p.mensaje}`).join('\n'),
    );
    this.name = 'ErrorContenido';
  }
}

export interface Licencia {
  id: string;
  nombre: string;
  url?: string;
  permiteCambios: boolean;
  noComercial: boolean;
  requiereTitular: boolean;
}

export interface Ficha {
  autor: string;
  propio: boolean;
  fuente?: string;
  licencia: Licencia;
  cambios?: string;
  titular?: string;
}

import type { CabeceraModulo, CabeceraPieza, Dificultad, Tema } from './esquemas';
export type { CabeceraModulo, CabeceraPieza, Dificultad, Tema };

export type Modo = 'desarrollo' | 'publicacion';

export interface PiezaFuente {
  id: string;
  /** Ruta para mensajes: relativa al repo, o `privado:<ruta>`. */
  archivo: string;
  rutaAbs: string;
  datos: CabeceraPieza;
  cuerpo: string;
  privado: boolean;
  /** Carpeta de la pieza relativa a la raíz de piezas (`privado:` delante si es privada). */
  bloque: string;
  /** Dificultad final: la excepción de la pieza o, si no tiene, la de su bloque en bloques.yml. */
  dificultad?: Dificultad;
  /** Tema final (id de temas.yml): el de su bloque en bloques.yml. */
  tema?: string;
  /** Archivo, para mensajes, del que sale el tema: bloques.yml. */
  origenTema?: string;
}

export interface ModuloFuente {
  id: string;
  archivo: string;
  rutaAbs: string;
  datos: CabeceraModulo;
  privado: boolean;
}

export interface Aparicion {
  modulo: string;
  unidad: string;
  tituloModulo: string;
  tituloUnidad: string;
}

export interface Catalogo {
  /** Lista cerrada de temas (contenido/temas.yml), en su orden. */
  temas: Tema[];
  /** Piezas publicables en el modo dado. */
  piezas: Map<string, PiezaFuente>;
  /** Todas las piezas cargadas (incluye borradores), para enlaces y avisos. */
  todas: Map<string, PiezaFuente>;
  /** Módulos activos; en publicación, sus unidades ya no contienen borradores. */
  modulos: ModuloFuente[];
  apariciones: Map<string, Aparicion[]>;
  avisos: string[];
  informe: string[];
}

/** Ejecuta todas las tareas; si alguna lanza ErrorContenido, reúne todos sus problemas en uno solo. */
export async function recogerErrores<T>(tareas: (() => Promise<T>)[]): Promise<T[]> {
  const resultados: T[] = [];
  const problemas: Problema[] = [];
  for (const tarea of tareas) {
    try {
      resultados.push(await tarea());
    } catch (e) {
      if (!(e instanceof ErrorContenido)) throw e;
      problemas.push(...e.problemas);
    }
  }
  if (problemas.length) throw new ErrorContenido(problemas);
  return resultados;
}

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

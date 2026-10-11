import { construirCatalogo } from '../src/lib/catalogo';
import { esquemaPieza } from '../src/lib/esquemas';
import type { ContextoRender } from '../src/lib/markdown';
import type { Modo, PiezaFuente } from '../src/lib/tipos';

export function piezaMd(id: string, cuerpo: string, extra: Partial<PiezaFuente> & { titulo?: string; borrador?: boolean } = {}): PiezaFuente {
  const { titulo, borrador, ...resto } = extra;
  return {
    id,
    archivo: `contenido/piezas/${id}.md`,
    rutaAbs: `/no-existe/${id}.md`,
    datos: esquemaPieza.parse({ titulo: titulo ?? `Título de ${id.toUpperCase()}`, borrador }),
    cuerpo,
    privado: false,
    ...resto,
  };
}

export function contexto(piezas: PiezaFuente[], opciones: { modo?: Modo; unidad?: string[] } = {}): ContextoRender {
  const modo = opciones.modo ?? 'desarrollo';
  return {
    catalogo: construirCatalogo(piezas, [], modo),
    modo,
    base: '/ok/',
    sitioUrl: 'https://ej.es',
    unidad: opciones.unidad ? { modulo: 'aso', id: 'ut1', piezas: new Set(opciones.unidad) } : undefined,
  };
}

import { construirCatalogo } from '../src/lib/catalogo';
import { esquemaPieza } from '../src/lib/esquemas';
import type { ContextoRender } from '../src/lib/markdown';
import type { Modo, PiezaFuente } from '../src/lib/tipos';

export function piezaMd(
  id: string,
  cuerpo: string,
  extra: Partial<PiezaFuente> & { titulo?: string; borrador?: boolean; campos?: Record<string, unknown> } = {},
): PiezaFuente {
  const { titulo, borrador, campos, ...resto } = extra;
  return {
    id,
    archivo: `contenido/piezas/${id}.md`,
    rutaAbs: `/no-existe/${id}.md`,
    datos: esquemaPieza.parse({ titulo: titulo ?? `Título de ${id.toUpperCase()}`, borrador, ...campos }),
    cuerpo,
    privado: false,
    ...resto,
  };
}

export function contexto(
  piezas: PiezaFuente[],
  opciones: { modo?: Modo; unidad?: string[]; teoria?: string[]; casos?: string[] } = {},
): ContextoRender {
  const modo = opciones.modo ?? 'desarrollo';
  return {
    catalogo: construirCatalogo(piezas, [], modo),
    modo,
    base: '/ok/',
    sitioUrl: 'https://ej.es',
    unidad: opciones.unidad
      ? {
          modulo: 'aso',
          id: 'ut1',
          piezas: new Set(opciones.unidad),
          teoria: new Set(opciones.teoria ?? opciones.unidad),
          casos: new Set(opciones.casos ?? []),
        }
      : undefined,
  };
}

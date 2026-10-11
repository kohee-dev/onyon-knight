import { LICENCIA_PROPIA, licenciaPorId } from '../licencias';
import type { PiezaRenderizada } from './markdown';
import type { Ficha, Licencia, PiezaFuente } from './tipos';

export interface Creditos {
  licenciaTexto: Licencia;
  piezasConOtraLicencia: { id: string; titulo: string; licencia: Licencia }[];
  /** Unión de las fuentes, en orden de aparición y sin duplicados. */
  bibliografia: string[];
  /** Recursos de terceros (no propios), sin duplicados por ruta. */
  recursos: { url: string; alt: string; ficha: Ficha }[];
}

/** Créditos de un conjunto de piezas. Lo usan la web, el PDF y el futuro generador de PPTX. */
export function creditosDe(piezas: { fuente: PiezaFuente; render: PiezaRenderizada }[]): Creditos {
  const bibliografia = new Set<string>();
  const recursos = new Map<string, Creditos['recursos'][number]>();
  const piezasConOtraLicencia: Creditos['piezasConOtraLicencia'] = [];
  for (const { fuente, render } of piezas) {
    for (const f of fuente.datos.fuentes) bibliografia.add(f);
    for (const i of render.imagenes) {
      if (!i.ficha.propio && !recursos.has(i.rutaAbs)) recursos.set(i.rutaAbs, { url: i.url, alt: i.alt, ficha: i.ficha });
    }
    if (fuente.datos.licencia !== LICENCIA_PROPIA) {
      piezasConOtraLicencia.push({ id: fuente.id, titulo: fuente.datos.titulo, licencia: licenciaPorId(fuente.datos.licencia)! });
    }
  }
  return {
    licenciaTexto: licenciaPorId(LICENCIA_PROPIA)!,
    piezasConOtraLicencia,
    bibliografia: [...bibliografia],
    recursos: [...recursos.values()],
  };
}

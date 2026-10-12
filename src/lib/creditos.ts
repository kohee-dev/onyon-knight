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
  // Si todas las piezas comparten licencia, esa es la del texto; si no, la propia con excepciones.
  const ids = new Set(piezas.map((p) => p.fuente.datos.licencia));
  const idTexto = ids.size === 1 ? [...ids][0] : LICENCIA_PROPIA;
  const piezasConOtraLicencia: Creditos['piezasConOtraLicencia'] = [];
  for (const { fuente, render } of piezas) {
    for (const f of fuente.datos.fuentes) bibliografia.add(f);
    for (const i of render.imagenes) {
      if (!i.ficha.propio && !recursos.has(i.rutaAbs)) recursos.set(i.rutaAbs, { url: i.url, alt: i.alt, ficha: i.ficha });
    }
    if (fuente.datos.licencia !== idTexto) {
      piezasConOtraLicencia.push({ id: fuente.id, titulo: fuente.datos.titulo, licencia: licenciaPorId(fuente.datos.licencia)! });
    }
  }
  return {
    licenciaTexto: licenciaPorId(idTexto)!,
    piezasConOtraLicencia,
    bibliografia: [...bibliografia],
    recursos: [...recursos.values()],
  };
}

/** Añade a unos créditos imágenes sueltas (p. ej. las portadas de las tarjetas), sin atribuir el texto de sus piezas. */
export function conImagenes(c: Creditos, imagenes: { rutaAbs: string; url: string; alt: string; ficha: Ficha }[]): Creditos {
  const vistas = new Set(c.recursos.map((r) => r.url));
  const recursos = [...c.recursos];
  for (const i of imagenes) {
    if (i.ficha.propio || vistas.has(i.url)) continue;
    vistas.add(i.url);
    recursos.push({ url: i.url, alt: i.alt, ficha: i.ficha });
  }
  return { ...c, recursos };
}

/** Frase con lo que permite la licencia del texto (CC BY, BY-SA, BY-NC, BY-NC-SA…). */
export function condicionesTexto(l: Licencia): string {
  const partes = ['citando la autoría'];
  if (l.noComercial) partes.push('sin fines comerciales');
  if (/-SA-/.test(l.id)) partes.push('compartiendo con la misma licencia');
  const ultima = partes.pop()!;
  const condiciones = partes.length ? `${partes.join(', ')} y ${ultima}` : ultima;
  return `Puedes ${l.permiteCambios ? 'copiarlo y adaptarlo' : 'copiarlo sin modificarlo'} ${condiciones}.`;
}

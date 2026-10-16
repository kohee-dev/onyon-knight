import { categoriaDe } from '../categorias';
import { licenciaPorId } from '../licencias';
import { ICONOS } from './iconos';
import { ErrorContenido, type Aparicion, type Catalogo, type Modo, type ModuloFuente, type PiezaFuente, type Problema, type Tema } from './tipos';

import { SLUG } from './esquemas';
export { SLUG };

/** Ids que usa la propia página; una pieza con uno de ellos duplicaría ids y rompería anclas y aria-controls. */
export const IDS_RESERVADOS = ['menu', 'lista-modulos', 'casos-practicos', 'casos-de-esta-unidad', 'licencias-y-fuentes'];

export function construirCatalogo(piezas: PiezaFuente[], modulos: ModuloFuente[], modo: Modo, temas: Tema[] = []): Catalogo {
  const problemas: Problema[] = [];
  const publicacion = modo === 'publicacion';

  const todas = new Map<string, PiezaFuente>();
  for (const p of piezas) {
    if (!SLUG.test(p.id)) {
      problemas.push({ archivo: p.archivo, mensaje: `id de pieza no válido «${p.id}»: usa minúsculas, números y guiones` });
    }
    if (IDS_RESERVADOS.includes(p.id)) {
      problemas.push({ archivo: p.archivo, mensaje: `id de pieza reservado «${p.id}»: renombra el archivo` });
    }
    if (!licenciaPorId(p.datos.licencia)) {
      problemas.push({ archivo: p.archivo, mensaje: `licencia desconocida «${p.datos.licencia}»` });
    }
    const previa = todas.get(p.id);
    if (previa) {
      problemas.push({ archivo: p.archivo, mensaje: `id de pieza duplicado «${p.id}» (también en ${previa.archivo})` });
    } else {
      todas.set(p.id, p);
    }
  }

  const publicable = (p: PiezaFuente) => !publicacion || (!p.privado && !p.datos.borrador);
  const visibles = new Map([...todas].filter(([, p]) => publicable(p)));

  const avisos: string[] = [];
  const resultado: ModuloFuente[] = [];
  const referenciadas = new Set<string>();

  const idsModulo = new Map<string, string>();
  for (const m of modulos) {
    const previo = idsModulo.get(m.id);
    if (previo) problemas.push({ archivo: m.archivo, mensaje: `id de módulo duplicado «${m.id}» (también en ${previo})` });
    else idsModulo.set(m.id, m.archivo);
    if (!categoriaDe(m.datos.ciclo))
      problemas.push({ archivo: m.archivo, mensaje: `ciclo desconocido «${m.datos.ciclo}» (categorías: GB, SMR, ASIR, DAM)` });
    if (!ICONOS.has(m.datos.icono))
      problemas.push({ archivo: m.archivo, mensaje: `icono desconocido «${m.datos.icono}» (disponibles: ${[...ICONOS].join(', ')})` });
    const ids = new Set<string>();
    for (const u of m.datos.unidades) {
      if (!SLUG.test(u.id)) problemas.push({ archivo: m.archivo, mensaje: `id de unidad no válido «${u.id}»` });
      if (ids.has(u.id)) problemas.push({ archivo: m.archivo, mensaje: `unidad duplicada «${u.id}»` });
      ids.add(u.id);
      const vistas = new Set<string>();
      for (const id of u.piezas) {
        if (vistas.has(id)) problemas.push({ archivo: m.archivo, mensaje: `${u.id}: pieza repetida «${id}»` });
        vistas.add(id);
        referenciadas.add(id);
        const p = todas.get(id);
        if (!p) problemas.push({ archivo: m.archivo, mensaje: `${u.id}: pieza inexistente «${id}»` });
        else if (p.privado && !m.privado)
          problemas.push({ archivo: m.archivo, mensaje: `${u.id}: pieza privada «${id}» en un módulo público` });
      }
    }
    if (!m.datos.activo || (publicacion && m.privado)) continue;

    const unidades = m.datos.unidades.flatMap((u) => {
      const borradores = u.piezas.filter((id) => todas.get(id)?.datos.borrador);
      if (!publicacion || borradores.length === 0) return [u];
      if (borradores.length === u.piezas.length) {
        avisos.push(`${m.id}/${u.id}: todas sus piezas son borradores; la unidad no se publica`);
        return [];
      }
      avisos.push(`${m.id}/${u.id}: incluye borradores (${borradores.join(', ')})`);
      return [{ ...u, piezas: u.piezas.filter((id) => !borradores.includes(id)) }];
    });
    if (publicacion && unidades.length === 0) {
      avisos.push(`${m.id}: no tiene unidades publicadas; el módulo no se publica`);
      continue;
    }
    resultado.push({ ...m, datos: { ...m.datos, unidades } });
  }

  const idsTemas = new Set(temas.map((t) => t.id));
  for (const p of todas.values()) {
    if (p.tema && !idsTemas.has(p.tema)) problemas.push({ archivo: p.origenTema ?? p.archivo, mensaje: `tema desconocido «${p.tema}» (no está en temas.yml)` });
  }

  if (problemas.length) throw new ErrorContenido(problemas);

  const sinTema = new Map<string, number>();
  for (const p of visibles.values()) if (!p.tema) sinTema.set(p.bloque, (sinTema.get(p.bloque) ?? 0) + 1);
  for (const [bloque, n] of sinTema) avisos.push(`bloque sin tema: ${bloque} (${n} ${n === 1 ? 'pieza' : 'piezas'} sin el suyo)`);

  const sinDificultad = new Map<string, number>();
  for (const p of visibles.values()) if (!p.dificultad) sinDificultad.set(p.bloque, (sinDificultad.get(p.bloque) ?? 0) + 1);
  for (const [bloque, n] of sinDificultad) {
    avisos.push(`bloque sin dificultad: ${bloque} (${n} ${n === 1 ? 'pieza' : 'piezas'} sin la suya)`);
  }

  const apariciones = new Map<string, Aparicion[]>();
  for (const m of resultado) {
    for (const u of m.datos.unidades) {
      for (const id of u.piezas) {
        const lista = apariciones.get(id) ?? [];
        lista.push({ modulo: m.id, unidad: u.id, tituloModulo: m.datos.nombre, tituloUnidad: u.titulo });
        apariciones.set(id, lista);
      }
    }
  }

  const informe = [...visibles.values()]
    .filter((p) => !p.privado && !referenciadas.has(p.id))
    .map((p) => `pieza sin módulo: ${p.id}`);

  return { piezas: visibles, todas, modulos: resultado, apariciones, avisos, informe, temas };
}

import { licenciaPorId } from '../licencias';
import { ErrorContenido, type Aparicion, type Catalogo, type Modo, type ModuloFuente, type PiezaFuente, type Problema } from './tipos';

export const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function construirCatalogo(piezas: PiezaFuente[], modulos: ModuloFuente[], modo: Modo): Catalogo {
  const problemas: Problema[] = [];
  const publicacion = modo === 'publicacion';

  const todas = new Map<string, PiezaFuente>();
  for (const p of piezas) {
    if (!SLUG.test(p.id)) {
      problemas.push({ archivo: p.archivo, mensaje: `id de pieza no válido «${p.id}»: usa minúsculas, números y guiones` });
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

  for (const m of modulos) {
    const ids = new Set<string>();
    for (const u of m.datos.unidades) {
      if (!SLUG.test(u.id)) problemas.push({ archivo: m.archivo, mensaje: `id de unidad no válido «${u.id}»` });
      if (ids.has(u.id)) problemas.push({ archivo: m.archivo, mensaje: `unidad duplicada «${u.id}»` });
      ids.add(u.id);
      for (const id of u.piezas) {
        referenciadas.add(id);
        const p = todas.get(id);
        if (!p) problemas.push({ archivo: m.archivo, mensaje: `${u.id}: pieza inexistente «${id}»` });
        else if (p.privado && !m.privado)
          problemas.push({ archivo: m.archivo, mensaje: `${u.id}: pieza privada «${id}» en un módulo público` });
      }
    }
    if (!m.datos.activo || (publicacion && m.privado)) continue;

    const unidades = m.datos.unidades.map((u) => {
      const borradores = u.piezas.filter((id) => todas.get(id)?.datos.borrador);
      if (!publicacion || borradores.length === 0) return u;
      avisos.push(`${m.id}/${u.id}: incluye borradores (${borradores.join(', ')})`);
      return { ...u, piezas: u.piezas.filter((id) => !borradores.includes(id)) };
    });
    resultado.push({ ...m, datos: { ...m.datos, unidades } });
  }

  if (problemas.length) throw new ErrorContenido(problemas);

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

  return { piezas: visibles, todas, modulos: resultado, apariciones, avisos, informe };
}

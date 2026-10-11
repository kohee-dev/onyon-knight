import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { load } from 'js-yaml';
import { construirCatalogo } from './catalogo';
import { creditosDe, type Creditos } from './creditos';
import { leerFechas, type IndiceFechas } from './fechas';
import { cargarFuentes } from './fuentes';
import { renderizarPieza, type ContextoRender, type PiezaRenderizada } from './markdown';
import { raizContenido } from './raices';
import type { Catalogo, Modo, ModuloFuente, PiezaFuente } from './tipos';

export interface PiezaEnUnidad {
  fuente: PiezaFuente;
  render: PiezaRenderizada;
  fecha: Date | null;
}

export interface UnidadSitio {
  modulo: ModuloFuente;
  id: string;
  titulo: string;
  piezas: PiezaEnUnidad[];
  fecha: Date | null;
  creditos: Creditos;
  url: string;
  urlPdf: string;
  salidaPdf: string;
  pie: string;
}

export interface CreditoSitio {
  nombre: string;
  autor: string;
  url: string;
  licencia: string;
}

export interface Sitio {
  catalogo: Catalogo;
  modo: Modo;
  base: string;
  sitioUrl: string;
  unidades: UnidadSitio[];
  /** Render suelto (página /apuntes/<id>/) de cada pieza publicable. */
  sueltas: Map<string, PiezaEnUnidad>;
  ultimosCambios: { titulo: string; contexto: string; url: string; fecha: Date }[];
  creditosSitio: CreditoSitio[];
}

const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
const sitioUrl = import.meta.env.SITE ?? 'http://localhost:4321';

function fechaPieza(f: IndiceFechas, p: PiezaFuente, r: PiezaRenderizada): Date | null {
  return f.fechaDe([p.rutaAbs, ...r.imagenes.flatMap((i) => [i.rutaAbs, i.rutaFicha])]);
}

const masReciente = (fechas: (Date | null)[]): Date | null =>
  fechas.some((f) => !f) ? null : (fechas as Date[]).reduce((a, b) => (b > a ? b : a));

async function construirSitio(): Promise<Sitio> {
  const modo: Modo = import.meta.env.PROD ? 'publicacion' : 'desarrollo';
  const { piezas, modulos } = await cargarFuentes();
  const catalogo = construirCatalogo(piezas, modulos, modo);
  const fechas = await leerFechas(process.cwd());
  const ctxBase: Omit<ContextoRender, 'unidad'> = { catalogo, modo, base, sitioUrl };

  const sueltas = new Map<string, PiezaEnUnidad>();
  for (const p of catalogo.piezas.values()) {
    const render = await renderizarPieza(p, ctxBase);
    sueltas.set(p.id, { fuente: p, render, fecha: fechaPieza(fechas, p, render) });
  }

  const unidades: UnidadSitio[] = [];
  for (const m of catalogo.modulos) {
    for (const u of m.datos.unidades) {
      const ctx: ContextoRender = { ...ctxBase, unidad: { modulo: m.id, id: u.id, piezas: new Set(u.piezas) } };
      const lista: PiezaEnUnidad[] = [];
      for (const id of u.piezas) {
        const fuente = catalogo.piezas.get(id)!;
        const render = await renderizarPieza(fuente, ctx);
        lista.push({ fuente, render, fecha: fechaPieza(fechas, fuente, render) });
      }
      unidades.push({
        modulo: m,
        id: u.id,
        titulo: u.titulo,
        piezas: lista,
        fecha: masReciente([fechas.fechaUnidad(m.rutaAbs, u.id), ...lista.map((p) => p.fecha)]),
        creditos: creditosDe(lista),
        url: `${base}${m.id}/${u.id}/`,
        urlPdf: `${base}pdf/${m.id}-${u.id}.pdf`,
        salidaPdf: `pdf/${m.id}-${u.id}.pdf`,
        pie: `${m.id.toUpperCase()} · ${u.id.toUpperCase()}`,
      });
    }
  }

  const ultimosCambios = [
    ...unidades.map((u) => ({ titulo: u.titulo, contexto: `${u.modulo.datos.nombre} · unidad`, url: u.url, fecha: u.fecha })),
    ...[...sueltas.values()].map((p) => ({ titulo: p.fuente.datos.titulo, contexto: 'apunte', url: `${base}apuntes/${p.fuente.id}/`, fecha: p.fecha })),
  ]
    .filter((c): c is typeof c & { fecha: Date } => c.fecha !== null)
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
    .slice(0, 20);

  // Los créditos del sitio son del sitio, no del contenido: si la carpeta de contenido no los trae, se usan los del repo.
  const propios = resolve(raizContenido, 'creditos-sitio.yml');
  const rutaCreditos = existsSync(propios) ? propios : resolve('contenido/creditos-sitio.yml');
  const creditosSitio = (load(readFileSync(rutaCreditos, 'utf8')) as CreditoSitio[]) ?? [];

  for (const a of new Set([...fechas.avisos, ...catalogo.avisos])) console.warn(`⚠️  ${a}`);
  for (const i of catalogo.informe) console.info(`ℹ️  ${i}`);

  return { catalogo, modo, base, sitioUrl: sitioUrl.replace(/\/$/, '') + '/', unidades, sueltas, ultimosCambios, creditosSitio };
}

let memo: Promise<Sitio> | null = null;

/** Punto único de datos para las páginas. En build se calcula una vez; en dev, en cada petición (refleja ediciones). */
export function cargarSitio(): Promise<Sitio> {
  if (!import.meta.env.PROD) return construirSitio();
  return (memo ??= construirSitio());
}

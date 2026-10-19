import { existsSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { load } from 'js-yaml';
import { construirCatalogo } from './catalogo';
import { temasDelSitio } from './temas';
import { conImagenes, creditosDe, type Creditos } from './creditos';
import { leerFechas, type IndiceFechas } from './fechas';
import { cargarFuentes } from './fuentes';
import { renderizarPieza, type ContextoRender, type PiezaRenderizada } from './markdown';
import { listarImagenes } from './imagenes-url';
import { raicesPiezas, raizContenido } from './raices';
import { recogerErrores, type Catalogo, type Modo, type ModuloFuente, type PiezaFuente } from './tipos';

export interface PiezaEnUnidad {
  fuente: PiezaFuente;
  render: PiezaRenderizada;
  fecha: Date | null;
}

export interface CasoSitio {
  pieza: PiezaEnUnidad;
  url: string;
  urlPdf: string;
  salidaPdf: string;
  pie: string;
  creditos: Creditos;
}

export interface UnidadSitio {
  modulo: ModuloFuente;
  id: string;
  titulo: string;
  teoria: PiezaEnUnidad[];
  casos: CasoSitio[];
  fecha: Date | null;
  /** Teoría más las portadas de las tarjetas. */
  creditos: Creditos;
  url: string;
  /** null si la unidad no tiene teoría (no hay PDF de unidad). */
  urlPdf: string | null;
  salidaPdf: string | null;
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
  /** Rutas absolutas de las imágenes que usan las piezas publicadas: las únicas que se publican. */
  imagenes: string[];
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
  const catalogo = construirCatalogo(piezas, modulos, modo, temasDelSitio());
  const fechas = await leerFechas(process.cwd());
  const ctxBase: Omit<ContextoRender, 'unidad'> = { catalogo, modo, base, sitioUrl, raices: raicesPiezas };

  // Se renderiza todo antes de fallar, para mostrar todos los errores de una vez.
  const sueltas = new Map<string, PiezaEnUnidad>();
  await recogerErrores(
    [...catalogo.piezas.values()].map((p) => async () => {
      const render = await renderizarPieza(p, ctxBase);
      sueltas.set(p.id, { fuente: p, render, fecha: fechaPieza(fechas, p, render) });
    }),
  );

  const unidades: UnidadSitio[] = [];
  const primeraUrlCaso = new Map<string, string>();
  for (const m of catalogo.modulos) {
    for (const u of m.datos.unidades) {
      const idsTeoria = u.piezas.filter((id) => catalogo.piezas.get(id)!.datos.tipo === 'teoria');
      const idsCasos = u.piezas.filter((id) => catalogo.piezas.get(id)!.datos.tipo === 'caso');
      const urlUnidad = `${base}${m.id}/${u.id}/`;
      const pie = `${m.id.toUpperCase()} · ${u.id.toUpperCase()}`;
      const contextoDe = (enPagina: string[]): ContextoRender => ({
        ...ctxBase,
        unidad: { modulo: m.id, id: u.id, piezas: new Set(enPagina), teoria: new Set(idsTeoria), casos: new Set(idsCasos) },
      });
      const renderizar = async (id: string, ctx: ContextoRender): Promise<PiezaEnUnidad> => {
        const fuente = catalogo.piezas.get(id)!;
        const render = await renderizarPieza(fuente, ctx);
        return { fuente, render, fecha: fechaPieza(fechas, fuente, render) };
      };

      const ctxTeoria = contextoDe(idsTeoria);
      const teoria: PiezaEnUnidad[] = [];
      for (const id of idsTeoria) teoria.push(await renderizar(id, ctxTeoria));

      const casos: CasoSitio[] = [];
      for (const id of idsCasos) {
        // En la página del caso el título es el h1: el cuerpo empieza en h2.
        const pieza = await renderizar(id, { ...contextoDe([id]), nivelTitulos: 2 });
        const url = `${urlUnidad}casos/${id}/`;
        if (!primeraUrlCaso.has(id)) primeraUrlCaso.set(id, url);
        casos.push({
          pieza,
          url,
          urlPdf: `${base}pdf/${m.id}-${u.id}/${id}.pdf`,
          salidaPdf: `pdf/${m.id}-${u.id}/${id}.pdf`,
          pie: `${pie} · Caso práctico`,
          creditos: creditosDe([pieza]),
        });
      }

      const conTeoria = teoria.length > 0;
      unidades.push({
        modulo: m,
        id: u.id,
        titulo: u.titulo,
        teoria,
        casos,
        fecha: masReciente([fechas.fechaUnidad(m.rutaAbs, u.id), ...teoria.map((p) => p.fecha), ...casos.map((c) => c.pieza.fecha)]),
        // Créditos de la unidad: la teoría más las imágenes de portada de sus tarjetas (no el texto de los casos).
        creditos: conImagenes(creditosDe(teoria), casos.flatMap((c) => (c.pieza.render.portada ? [c.pieza.render.portada] : []))),
        url: urlUnidad,
        urlPdf: conTeoria ? `${base}pdf/${m.id}-${u.id}.pdf` : null,
        salidaPdf: conTeoria ? `pdf/${m.id}-${u.id}.pdf` : null,
        pie,
      });
    }
  }

  const ultimosCambios = [
    ...unidades.map((u) => ({ titulo: u.titulo, contexto: `${u.modulo.datos.nombre} · unidad`, url: u.url, fecha: u.fecha })),
    ...[...sueltas.values()].map((p) => ({
      titulo: p.fuente.datos.titulo,
      contexto: p.fuente.datos.tipo === 'caso' ? 'caso práctico' : 'apunte',
      url: primeraUrlCaso.get(p.fuente.id) ?? `${base}apuntes/${p.fuente.id}/`,
      fecha: p.fecha,
    })),
  ]
    .filter((c): c is typeof c & { fecha: Date } => c.fecha !== null)
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
    .slice(0, 20);

  // Los créditos del sitio son del sitio, no del contenido: si la carpeta de contenido no los trae, se usan los del repo.
  const propios = resolve(raizContenido, 'creditos-sitio.yml');
  const rutaCreditos = existsSync(propios) ? propios : resolve('contenido/creditos-sitio.yml');
  const creditosSitio = (load(readFileSync(rutaCreditos, 'utf8')) as CreditoSitio[]) ?? [];

  const imagenes = [...new Set([...sueltas.values()].flatMap((p) => p.render.imagenes.map((i) => i.rutaAbs)))];
  const sinUso = listarImagenes(raicesPiezas).filter((r) => !imagenes.includes(r));

  for (const a of new Set([...fechas.avisos, ...catalogo.avisos])) console.warn(`⚠️  ${a}`);
  for (const i of catalogo.informe) console.info(`ℹ️  ${i}`);
  for (const r of sinUso) console.info(`ℹ️  imagen sin usar (no se publica): ${relative(process.cwd(), r)}`);

  return { catalogo, modo, base, sitioUrl: sitioUrl.replace(/\/$/, '') + '/', unidades, sueltas, ultimosCambios, imagenes, creditosSitio };
}

let memo: Promise<Sitio> | null = null;

/** Punto único de datos para las páginas. En build se calcula una vez; en dev, en cada petición (refleja ediciones). */
export function cargarSitio(): Promise<Sitio> {
  if (!import.meta.env.PROD) return construirSitio();
  return (memo ??= construirSitio());
}

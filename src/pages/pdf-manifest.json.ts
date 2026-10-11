import type { APIRoute } from 'astro';
import { cargarSitio } from '../lib/sitio';

/** Lista de PDFs que debe generar scripts/pdf.mjs. */
export const GET: APIRoute = async () => {
  const sitio = await cargarSitio();
  const manifiesto = sitio.unidades.flatMap((u) => [
    ...(u.salidaPdf ? [{ tipo: 'unidad', modulo: u.modulo.id, unidad: u.id, ruta: u.url, salida: u.salidaPdf, pie: u.pie }] : []),
    ...u.casos.map((c) => ({
      tipo: 'caso',
      modulo: u.modulo.id,
      unidad: u.id,
      caso: c.pieza.fuente.id,
      ruta: c.url,
      salida: c.salidaPdf,
      pie: c.pie,
    })),
  ]);
  return new Response(JSON.stringify(manifiesto, null, 2), { headers: { 'Content-Type': 'application/json' } });
};

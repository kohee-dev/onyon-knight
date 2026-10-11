import type { APIRoute } from 'astro';
import { cargarSitio } from '../lib/sitio';

/** Lista de PDFs que debe generar scripts/pdf.mjs. */
export const GET: APIRoute = async () => {
  const sitio = await cargarSitio();
  const manifiesto = sitio.unidades.map((u) => ({
    modulo: u.modulo.id,
    unidad: u.id,
    ruta: u.url,
    salida: u.salidaPdf,
    pie: u.pie,
  }));
  return new Response(JSON.stringify(manifiesto, null, 2), { headers: { 'Content-Type': 'application/json' } });
};

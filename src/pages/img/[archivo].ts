import { readFileSync } from 'node:fs';
import { extname } from 'node:path';
import type { APIRoute, GetStaticPaths } from 'astro';
import { nombrePublicado, TIPOS_IMAGEN } from '../../lib/imagenes-url';
import { cargarSitio } from '../../lib/sitio';

// Solo se publican las imágenes que usa alguna pieza publicada (y que, por tanto, tienen su ficha validada).
export const getStaticPaths: GetStaticPaths = async () => {
  const sitio = await cargarSitio();
  return sitio.imagenes.map((rutaAbs) => ({ params: { archivo: nombrePublicado(rutaAbs) }, props: { rutaAbs } }));
};

export const GET: APIRoute = ({ props }) =>
  new Response(readFileSync(props.rutaAbs), {
    headers: { 'Content-Type': TIPOS_IMAGEN[extname(props.rutaAbs).toLowerCase()] ?? 'application/octet-stream' },
  });

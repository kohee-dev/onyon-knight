import { readFileSync } from 'node:fs';
import { extname } from 'node:path';
import type { APIRoute, GetStaticPaths } from 'astro';
import { listarImagenes, nombrePublicado, TIPOS_IMAGEN } from '../../lib/imagenes-url';
import { raicesPiezas } from '../../lib/raices';

export const getStaticPaths: GetStaticPaths = () =>
  listarImagenes(raicesPiezas).map((rutaAbs) => ({ params: { archivo: nombrePublicado(rutaAbs) }, props: { rutaAbs } }));

export const GET: APIRoute = ({ props }) =>
  new Response(readFileSync(props.rutaAbs), {
    headers: { 'Content-Type': TIPOS_IMAGEN[extname(props.rutaAbs).toLowerCase()] ?? 'application/octet-stream' },
  });

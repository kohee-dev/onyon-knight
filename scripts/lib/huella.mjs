import { createHash } from 'node:crypto';

const sha = (dato) => createHash('sha256').update(dato).digest('hex');
const esLocal = (url) => !/^(?:[a-z]+:|\/\/|#)/i.test(url) && url.trim() !== '';

/** Recursos que la página carga: atributos src y href de <link>. Los <a href> son navegación, no contenido. */
function referenciasHtml(html) {
  const src = [...html.matchAll(/\ssrc="([^"]+)"/g)].map((m) => m[1]);
  const enlaces = [...html.matchAll(/<link\b[^>]*\shref="([^"]+)"/g)].map((m) => m[1]);
  return [...src, ...enlaces].filter(esLocal);
}

function referenciasCss(css, desde) {
  return [...css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)]
    .map((m) => m[1])
    .filter((u) => esLocal(u) && !u.startsWith('data:'))
    .map((u) => new URL(u, `http://x${desde}`).pathname);
}

/**
 * Huella de una página para la caché de PDFs: su HTML, el contenido de cada recurso local que referencia
 * (y, dentro de los CSS, sus url()), y las versiones del generador y del navegador.
 * @param {string} html
 * @param {(url: string) => Buffer | null} leerRecurso  ruta publicada (con BASE_PATH) → bytes
 * @param {string} versiones
 */
export function calcularHuella(html, leerRecurso, versiones) {
  // Lo que no se imprime (p. ej. las tarjetas de los casos) no debe regenerar el PDF.
  html = html.replace(/<(\w+)\b[^>]*\bdata-huella="ignorar"[^>]*>[\s\S]*?<\/\1>/g, '');
  const vistos = new Map();
  const pendientes = referenciasHtml(html).map((u) => u.split('#')[0].split('?')[0]);
  while (pendientes.length) {
    const url = pendientes.pop();
    if (vistos.has(url)) continue;
    const datos = leerRecurso(url);
    vistos.set(url, datos ? sha(datos) : 'ausente');
    if (datos && url.endsWith('.css')) pendientes.push(...referenciasCss(datos.toString('utf8'), url));
  }
  const recursos = [...vistos].sort(([a], [b]) => a.localeCompare(b)).map(([u, h]) => `${u}=${h}`);
  return sha([versiones, sha(html), ...recursos].join('\n'));
}

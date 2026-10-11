import { describe, expect, it } from 'vitest';
import { calcularHuella } from '../scripts/lib/huella.mjs';

const archivos: Record<string, string> = {
  '/ok/_astro/estilo.css': 'body{} @font-face{src:url(/ok/_astro/inter.woff2)}',
  '/ok/_astro/inter.woff2': 'FUENTE',
  '/ok/img/abc-cpu.png': 'PNG',
  '/ok/_astro/app.js': 'console.log(1)',
  '/ok/otro.css': 'no referenciado',
};
const html = `<link rel="stylesheet" href="/ok/_astro/estilo.css"><script type="module" src="/ok/_astro/app.js"></script>
<img src="/ok/img/abc-cpu.png"><a href="https://fuera.es/x">x</a><a href="#ancla">a</a>`;

const lector = (fs: Record<string, string>) => (url: string) => (url in fs ? Buffer.from(fs[url]) : null);

describe('calcularHuella', () => {
  it('es estable con las mismas entradas', () => {
    expect(calcularHuella(html, lector(archivos), 'v1')).toBe(calcularHuella(html, lector({ ...archivos }), 'v1'));
  });

  it('cambia si cambia un CSS referenciado', () => {
    const otro = { ...archivos, '/ok/_astro/estilo.css': archivos['/ok/_astro/estilo.css'] + ' ' };
    expect(calcularHuella(html, lector(otro), 'v1')).not.toBe(calcularHuella(html, lector(archivos), 'v1'));
  });

  it('cambia si cambia una tipografía referenciada desde el CSS', () => {
    const otro = { ...archivos, '/ok/_astro/inter.woff2': 'FUENTE2' };
    expect(calcularHuella(html, lector(otro), 'v1')).not.toBe(calcularHuella(html, lector(archivos), 'v1'));
  });

  it('cambia si cambia una imagen', () => {
    const otro = { ...archivos, '/ok/img/abc-cpu.png': 'PNG2' };
    expect(calcularHuella(html, lector(otro), 'v1')).not.toBe(calcularHuella(html, lector(archivos), 'v1'));
  });

  it('no cambia por archivos no referenciados', () => {
    const otro = { ...archivos, '/ok/otro.css': 'cambiado' };
    expect(calcularHuella(html, lector(otro), 'v1')).toBe(calcularHuella(html, lector(archivos), 'v1'));
  });

  it('no depende de los destinos de los enlaces <a> (p. ej. su propio PDF)', () => {
    const conEnlace = html + '<a class="boton" href="/ok/pdf/aso-ut1.pdf" download>PDF</a>';
    const otro = { ...archivos, '/ok/pdf/aso-ut1.pdf': 'PDF generado' };
    expect(calcularHuella(conEnlace, lector(otro), 'v1')).toBe(calcularHuella(conEnlace, lector(archivos), 'v1'));
  });

  it('cambia si cambian las versiones', () => {
    expect(calcularHuella(html, lector(archivos), 'v2')).not.toBe(calcularHuella(html, lector(archivos), 'v1'));
  });
});

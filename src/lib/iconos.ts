// Iconos de línea de los módulos (Feather Icons, MIT) y casco genérico de los casos (SVG Repo, CC0). Ver contenido/creditos-sitio.yml.
const archivos = import.meta.glob('../iconos/*.svg', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

const porNombre = new Map(
  Object.entries(archivos).map(([ruta, svg]) => [ruta.split('/').at(-1)!.replace(/\.svg$/, ''), svg.trim()]),
);

export const ICONOS: ReadonlySet<string> = new Set(porNombre.keys());

/** Marcado SVG del icono (usa currentColor; decorativo). */
export function svgIcono(nombre: string): string {
  const svg = porNombre.get(nombre);
  if (!svg) throw new Error(`icono desconocido «${nombre}»`);
  return svg;
}

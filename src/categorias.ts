/** Color de cada categoría (ciclo formativo). Solo identifica: tarjeta, chip, franja del módulo y portada del PDF. */
export interface Categoria {
  id: string;
  nombre: string;
  clase: string;
  claro: { fondo: string; texto: string };
  oscuro: { fondo: string; texto: string };
}

const cat = (id: string, nombre: string, claro: [string, string], oscuro: [string, string]): Categoria => ({
  id,
  nombre,
  clase: `cat-${id.toLowerCase()}`,
  claro: { fondo: claro[0], texto: claro[1] },
  oscuro: { fondo: oscuro[0], texto: oscuro[1] },
});

export const CATEGORIAS: Record<string, Categoria> = {
  GB: cat('GB', 'Grado Básico', ['#d8ecd9', '#2d5a34'], ['#172a20', '#d8ecd9']),
  SMR: cat('SMR', 'SMR', ['#d6e4f0', '#2b4a68'], ['#1e2340', '#d6e4f0']),
  ASIR: cat('ASIR', 'ASIR', ['#f7e1d7', '#7a3f22'], ['#38211f', '#f7e1d7']),
  DAM: cat('DAM', 'DAM', ['#e6e0f3', '#4b3b78'], ['#2a2140', '#e6e0f3']),
};

export function categoriaDe(ciclo: string): Categoria | undefined {
  return Object.hasOwn(CATEGORIAS, ciclo) ? CATEGORIAS[ciclo] : undefined;
}

const horas = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 });

/** Duración de un caso: «6 h», «1,5 h». */
export function formatearHoras(h: number): string {
  return `${horas.format(h)} h`;
}

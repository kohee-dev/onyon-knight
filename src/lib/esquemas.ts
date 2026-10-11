import { z } from 'astro/zod';
import { LICENCIA_PROPIA } from '../licencias';

export const esquemaPieza = z.strictObject({
  titulo: z.string().min(1),
  resumen: z.string().optional(),
  borrador: z.boolean().default(false),
  fuentes: z.array(z.string().min(1)).default([]),
  licencia: z.string().default(LICENCIA_PROPIA),
});

export const esquemaUnidad = z.strictObject({
  id: z.string(),
  titulo: z.string().min(1),
  piezas: z.array(z.string()).min(1),
});

export const esquemaModulo = z.strictObject({
  nombre: z.string().min(1),
  codigo: z.string().min(1),
  ciclo: z.string().min(1),
  curso: z.number().int().positive(),
  /** Nombre de un icono de src/iconos (obligatorio: un módulo sin icono no está listo). */
  icono: z.string().min(1),
  activo: z.boolean().default(true),
  unidades: z.array(esquemaUnidad),
});

export type CabeceraPieza = z.output<typeof esquemaPieza>;
export type CabeceraModulo = z.output<typeof esquemaModulo>;
export type CabeceraUnidad = z.output<typeof esquemaUnidad>;

import { z } from 'astro/zod';
import { LICENCIA_PROPIA } from '../licencias';

export const DIFICULTADES = ['basico', 'intermedio', 'avanzado'] as const;
export type Dificultad = (typeof DIFICULTADES)[number];
const dificultad = z.enum(DIFICULTADES, { error: 'debe ser «basico», «intermedio» o «avanzado»' }).optional();

export const esquemaPieza = z
  .strictObject({
    titulo: z.string().min(1),
    /** teoria: material de estudio (puede tener ejercicios); caso: ejercicio de principio a fin. */
    tipo: z.enum(['teoria', 'caso'], { error: 'debe ser «teoria» o «caso»' }).default('teoria'),
    resumen: z.string().optional(),
    borrador: z.boolean().default(false),
    fuentes: z.array(z.string().min(1)).default([]),
    licencia: z.string().default(LICENCIA_PROPIA),
    /** Sustituye la dificultad del bloque (bloque.yml de su carpeta). */
    dificultad,
    /** Solo en casos: duración estimada, imagen de la tarjeta y banner de la página. */
    horas: z.number().positive().optional(),
    portada: z.string().min(1).optional(),
    cabecera: z.string().min(1).optional(),
  })
  .superRefine((d, ctx) => {
    if (d.tipo === 'caso' && d.horas === undefined) {
      ctx.addIssue({ code: 'custom', path: ['horas'], message: 'un caso debe indicar sus «horas»' });
    }
    if (d.tipo === 'teoria') {
      for (const campo of ['horas', 'portada', 'cabecera'] as const) {
        if (d[campo] !== undefined) {
          ctx.addIssue({ code: 'custom', path: [campo], message: `«${campo}» va solo en casos (tipo: caso)` });
        }
      }
    }
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

/** bloque.yml: datos comunes a las piezas de una carpeta. */
export const esquemaBloque = z.strictObject({ dificultad });

export type CabeceraPieza = z.output<typeof esquemaPieza>;
export type CabeceraBloque = z.output<typeof esquemaBloque>;
export type CabeceraModulo = z.output<typeof esquemaModulo>;
export type CabeceraUnidad = z.output<typeof esquemaUnidad>;

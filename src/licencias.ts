import { z } from 'astro/zod';
import { ErrorContenido, type Ficha, type Licencia, type Problema } from './lib/tipos';

function cc(id: string, nombre: string, ruta: string, extra: Partial<Licencia> = {}): Licencia {
  return {
    id,
    nombre,
    url: `https://creativecommons.org/${ruta}`,
    permiteCambios: true,
    noComercial: false,
    requiereTitular: false,
    ...extra,
  };
}

/** Catálogo cerrado. Ampliarlo = añadir una entrada aquí. */
export const LICENCIAS: Record<string, Licencia> = Object.fromEntries(
  [
    cc('CC0-1.0', 'CC0 1.0 (dominio público)', 'publicdomain/zero/1.0/deed.es'),
    {
      id: 'dominio-publico',
      nombre: 'Dominio público',
      permiteCambios: true,
      noComercial: false,
      requiereTitular: false,
    },
    cc('CC-BY-4.0', 'CC BY 4.0', 'licenses/by/4.0/deed.es'),
    cc('CC-BY-SA-4.0', 'CC BY-SA 4.0', 'licenses/by-sa/4.0/deed.es'),
    cc('CC-BY-SA-3.0', 'CC BY-SA 3.0', 'licenses/by-sa/3.0/deed.es'),
    cc('CC-BY-NC-4.0', 'CC BY-NC 4.0', 'licenses/by-nc/4.0/deed.es', { noComercial: true }),
    cc('CC-BY-NC-SA-4.0', 'CC BY-NC-SA 4.0', 'licenses/by-nc-sa/4.0/deed.es', { noComercial: true }),
    cc('CC-BY-ND-4.0', 'CC BY-ND 4.0', 'licenses/by-nd/4.0/deed.es', { permiteCambios: false }),
    {
      id: 'MIT',
      nombre: 'MIT',
      url: 'https://opensource.org/license/mit',
      permiteCambios: true,
      noComercial: false,
      requiereTitular: false,
    },
    {
      id: 'Apache-2.0',
      nombre: 'Apache 2.0',
      url: 'https://www.apache.org/licenses/LICENSE-2.0',
      permiteCambios: true,
      noComercial: false,
      requiereTitular: false,
    },
    {
      id: 'OLDAP-2.8',
      nombre: 'OpenLDAP Public License 2.8',
      url: 'https://www.openldap.org/software/release/license.html',
      permiteCambios: true,
      noComercial: false,
      requiereTitular: false,
    },
    {
      id: 'OFL-1.1',
      nombre: 'SIL Open Font License 1.1',
      url: 'https://openfontlicense.org/open-font-license-official-text/',
      permiteCambios: true,
      noComercial: false,
      requiereTitular: false,
    },
    {
      id: 'marca',
      nombre: 'Marca registrada (uso identificativo)',
      permiteCambios: false,
      noComercial: false,
      requiereTitular: true,
    },
  ].map((l) => [l.id, l]),
);

export const LICENCIA_PROPIA = 'CC-BY-SA-4.0';

export function licenciaPorId(id: string): Licencia | undefined {
  return Object.hasOwn(LICENCIAS, id) ? LICENCIAS[id] : undefined;
}

const esquemaFicha = z.strictObject({
  autor: z.string().min(1),
  fuente: z.string().min(1).optional(),
  licencia: z.string().optional(),
  cambios: z.string().min(1).optional(),
  titular: z.string().min(1).optional(),
});

/** Problemas de un resultado de Zod, con la ruta del campo en el mensaje. */
export function problemasZod(error: z.ZodError, archivo: string): Problema[] {
  return error.issues.map((i) => {
    const campos = i.code === 'unrecognized_keys' ? i.keys.join(', ') : i.path.join('.');
    const mensaje =
      i.code === 'unrecognized_keys'
        ? `campo desconocido «${campos}»`
        : `campo «${campos || '(raíz)'}»: ${i.message}`;
    return { archivo, mensaje };
  });
}

export function validarFicha(datos: unknown, archivo: string): Ficha {
  const r = esquemaFicha.safeParse(datos ?? {});
  if (!r.success) throw new ErrorContenido(problemasZod(r.error, archivo));
  const d = r.data;
  const propio = d.autor === 'propio';
  const problemas: Problema[] = [];
  const idLicencia = d.licencia ?? (propio ? LICENCIA_PROPIA : undefined);
  const licencia = idLicencia ? licenciaPorId(idLicencia) : undefined;

  if (!idLicencia) problemas.push({ archivo, mensaje: 'falta el campo «licencia»' });
  else if (!licencia) problemas.push({ archivo, mensaje: `licencia desconocida «${idLicencia}»` });
  if (!propio && !d.fuente) problemas.push({ archivo, mensaje: 'falta el campo «fuente»' });
  if (d.fuente && /^https?:/i.test(d.fuente) && !URL.canParse(d.fuente))
    problemas.push({ archivo, mensaje: `«fuente» no es una URL válida: «${d.fuente}»` });
  if (licencia && d.cambios && !licencia.permiteCambios)
    problemas.push({ archivo, mensaje: `la licencia ${licencia.nombre} no permite modificaciones («cambios»)` });
  if (licencia?.requiereTitular && !d.titular)
    problemas.push({ archivo, mensaje: `la licencia ${licencia.nombre} exige el campo «titular»` });
  if (problemas.length) throw new ErrorContenido(problemas);

  return {
    autor: propio ? 'Alejandro Bartolomé' : d.autor,
    propio,
    fuente: d.fuente,
    licencia: licencia!,
    cambios: d.cambios,
    titular: d.titular,
  };
}

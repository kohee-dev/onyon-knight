import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { load } from 'js-yaml';
import { afterEach, describe, expect, it } from 'vitest';
import { generarCurso, type Modelo } from '../src/lib/curso/generar';
import { ejecutarCurso, formatearJustificacion } from '../src/lib/curso/cli';
import { esquemaModulo } from '../src/lib/esquemas';

const FIXTURES = resolve('tests/fixtures/curso/contenido');

interface Extraccion { entidades: string[]; relaciones?: string[][] }
interface Guion {
  extraccion?: Record<string, Extraccion>;
  semillas?: unknown;
}

/**
 * Modelo falso con las tres tareas de GraphRAG: extraer entidades de una pieza, elegir semillas para el tema
 * y componer unidades. Por defecto todas las piezas comparten la entidad «Seguridad» y esa es la semilla.
 */
function falso(propuesta: unknown, guion: Guion = {}) {
  const extraidas: string[] = [];
  const compuestas: string[] = [];
  let llamadas = 0;
  const contador = { get llamadas() { return llamadas; } };
  const modelo: Modelo = {
    async completar(_instruccion, entrada) {
      llamadas++;
      const datos = JSON.parse(entrada) as { tarea: string; pieza?: { id: string }; piezas?: { id: string }[] };
      if (datos.tarea === 'extraer') {
        const id = datos.pieza!.id;
        extraidas.push(id);
        return JSON.stringify(guion.extraccion ? guion.extraccion[id] : { entidades: ['Seguridad'] });
      }
      if (datos.tarea === 'semillas') return JSON.stringify({ entidades: guion.semillas ?? ['Seguridad'] });
      compuestas.push(...datos.piezas!.map((p) => p.id));
      return typeof propuesta === 'string' ? propuesta : JSON.stringify(propuesta);
    },
  };
  return { modelo, extraidas, compuestas, contador };
}

/** Grafo de fixtures: los títulos no dicen nada del tema, las entidades sí. */
const grafoRedes: Guion = {
  extraccion: {
    firewall: { entidades: ['Cortafuegos', 'Reglas'], relaciones: [['Cortafuegos', 'Reglas']] },
    vpn: { entidades: ['VPN', 'Túnel'], relaciones: [['VPN', 'Túnel'], ['VPN', 'Cortafuegos']] },
    ssh: { entidades: ['SSH', 'Túnel'], relaciones: [['SSH', 'Túnel']] },
    usuarios: { entidades: ['Usuarios', 'Permisos'], relaciones: [['Usuarios', 'Permisos']] },
  },
  semillas: ['cortafuegos'],
};

const propuestaBuena = {
  unidades: [
    { titulo: 'Seguridad del perímetro', piezas: ['firewall', 'vpn', 'vpn'] },
    { titulo: 'Acceso remoto', piezas: ['ssh'] },
  ],
};

const temporales: string[] = [];
afterEach(() => {
  for (const d of temporales.splice(0)) rmSync(d, { recursive: true, force: true });
});

function cache() {
  const dir = mkdtempSync(join(tmpdir(), 'onyon-cache-'));
  temporales.push(dir);
  return dir;
}

function copia() {
  const dir = mkdtempSync(join(tmpdir(), 'onyon-curso-'));
  temporales.push(dir);
  cpSync(FIXTURES, dir, { recursive: true });
  return dir;
}

describe('generarCurso', () => {
  it('produce un módulo que supera esquemaModulo (generarCurso ya lo valida con construirCatalogo)', async () => {
    const { modelo } = falso(propuestaBuena);
    const { id, modulo } = await generarCurso({ tema: 'Seguridad en redes para ASIR', raizContenido: FIXTURES, dirCache: cache(), modelo });
    expect(id).toBe('seguridad-en-redes-para-asir');
    expect(() => esquemaModulo.parse(modulo)).not.toThrow();
    expect(modulo.unidades.map((u) => [u.id, u.piezas])).toEqual([['seguridad-del-perimetro', ['firewall', 'vpn']], ['acceso-remoto', ['ssh']]]);
  });

  it('nace desactivado, con ids de unidad slug únicos y sin piezas repetidas en una unidad', async () => {
    const { modelo } = falso({ unidades: [{ titulo: 'Núcleo', piezas: ['vpn', 'vpn'] }, { titulo: 'Núcleo', piezas: ['ssh'] }] });
    const { modulo } = await generarCurso({ tema: 'Tema', raizContenido: FIXTURES, dirCache: cache(), modelo });
    expect(modulo.activo).toBe(false);
    expect(modulo.unidades.map((u) => u.id)).toEqual(['nucleo', 'nucleo-2']);
    expect(modulo.unidades[0].piezas).toEqual(['vpn']);
  });

  it('los títulos de unidad se recortan', async () => {
    const { modelo } = falso({ unidades: [{ titulo: '  Núcleo  ', piezas: ['vpn'] }] });
    const { modulo } = await generarCurso({ tema: 'Tema', raizContenido: FIXTURES, dirCache: cache(), modelo });
    expect(modulo.unidades[0].titulo).toBe('Núcleo');
  });

  it('el nombre del módulo se recorta', async () => {
    const { modelo } = falso(propuestaBuena);
    const { id, modulo } = await generarCurso({ tema: '  VPN  ', raizContenido: FIXTURES, dirCache: cache(), modelo });
    expect([id, modulo.nombre]).toEqual(['vpn', 'VPN']);
  });

  it.each([['en blanco', '   '], ['solo caracteres invisibles', '​⁠']])('un título de unidad %s se rechaza', async (_caso, titulo) => {
    const { modelo } = falso({ unidades: [{ titulo, piezas: ['vpn'] }] });
    await expect(generarCurso({ tema: 'Tema', raizContenido: FIXTURES, dirCache: cache(), modelo })).rejects.toThrow(/título/i);
  });

  it('no ofrece al modelo los borradores', async () => {
    const { modelo, extraidas, compuestas } = falso(propuestaBuena);
    await generarCurso({ tema: 'Tema', raizContenido: FIXTURES, modelo, dirCache: cache() });
    expect(extraidas.sort()).toEqual(['firewall', 'ssh', 'usuarios', 'vpn']);
    expect(compuestas.sort()).toEqual(['firewall', 'ssh', 'usuarios', 'vpn']);
  });

  it('rechaza una pieza que el modelo cita pero no existe, o que es un borrador', async () => {
    for (const id of ['inventada', 'ids-borrador']) {
      const { modelo } = falso({ unidades: [{ titulo: 'X', piezas: [id] }] });
      await expect(generarCurso({ tema: 'Tema', raizContenido: FIXTURES, dirCache: cache(), modelo })).rejects.toThrow(id);
    }
  });

  it('acepta la respuesta del modelo envuelta en un bloque ```json', async () => {
    const envuelta = ['```json', JSON.stringify(propuestaBuena), '```'].join('\n');
    const { modulo } = await generarCurso({ tema: 'Tema', raizContenido: FIXTURES, dirCache: cache(), modelo: falso(envuelta).modelo });
    expect(modulo.unidades).toHaveLength(2);
  });

  it('acepta el bloque ```json aunque la valla vaya pegada al JSON', async () => {
    const { modulo } = await generarCurso({ tema: 'Tema', raizContenido: FIXTURES, dirCache: cache(), modelo: falso('```json' + JSON.stringify(propuestaBuena) + '```').modelo });
    expect(modulo.unidades).toHaveLength(2);
  });

  it('falla con una respuesta mal formada, sin propuesta o con un proveedor caído', async () => {
    await expect(generarCurso({ tema: 'T', raizContenido: FIXTURES, dirCache: cache(), modelo: falso('no es json').modelo })).rejects.toThrow(/respuesta/i);
    await expect(generarCurso({ tema: 'T', raizContenido: FIXTURES, dirCache: cache(), modelo: falso({ unidades: [] }).modelo })).rejects.toThrow(/ninguna pieza/i);
    const caido: Modelo = { completar: () => Promise.reject(new Error('503')) };
    await expect(generarCurso({ tema: 'T', raizContenido: FIXTURES, dirCache: cache(), modelo: caido })).rejects.toThrow(/503/);
  });

  it('un proveedor caído da un mensaje que dice qué comprobar y conserva la causa', async () => {
    const original = new Error('503');
    const caido: Modelo = { completar: () => Promise.reject(original) };
    const rechazo = generarCurso({ tema: 'T', raizContenido: FIXTURES, dirCache: cache(), modelo: caido });
    await expect(rechazo).rejects.toThrow(/proveedor.*503.*(comprueba|reintenta|vuelve)/is);
    await expect(rechazo).rejects.toMatchObject({ cause: original });
  });

  it('un rechazo que no es un Error no vuelca sus cabeceras ni su clave en el mensaje', async () => {
    const caido: Modelo = { completar: () => Promise.reject({ status: 401, headers: { authorization: 'Bearer sk-SECRETO' } }) };
    const rechazo = generarCurso({ tema: 'T', raizContenido: FIXTURES, dirCache: cache(), modelo: caido });
    await expect(rechazo).rejects.toThrow(/401/);
    await expect(rechazo).rejects.not.toThrow(/SECRETO/);
  });

  it('un rechazo imposible de describir (prototipo nulo y circular) sigue dando el mensaje accionable', async () => {
    const raro = Object.create(null);
    raro.self = raro;
    const caido: Modelo = { completar: () => Promise.reject(raro) };
    await expect(generarCurso({ tema: 'T', raizContenido: FIXTURES, dirCache: cache(), modelo: caido })).rejects.toThrow(/ha fallado.*vuelve a intentarlo/);
  });

  it.each([['texto', 'cuota agotada', /ha fallado \(cuota agotada\)/], ['objeto', { status: 429 }, /ha fallado \(.*429/], ['undefined', undefined, /ha fallado.*vuelve a intentarlo/]])('un proveedor que rechaza con %s (no un Error) también da el mensaje accionable', async (_caso, rechazo, mensaje) => {
    const caido: Modelo = { completar: () => Promise.reject(rechazo) };
    await expect(generarCurso({ tema: 'T', raizContenido: FIXTURES, dirCache: cache(), modelo: caido })).rejects.toThrow(mensaje);
  });

  it('un rechazo cuyo campo lanza al leerlo (getter) sigue dando el mensaje accionable', async () => {
    const caido: Modelo = { completar: () => Promise.reject({ get status(): number { throw new Error('boom'); } }) };
    await expect(generarCurso({ tema: 'T', raizContenido: FIXTURES, dirCache: cache(), modelo: caido })).rejects.toThrow(/ha fallado.*vuelve a intentarlo/);
  });

  it('las piezas propuestas salen de la vecindad del grafo y la justificación lista las entidades', async () => {
    const { modelo, compuestas } = falso({ unidades: [{ titulo: 'Perímetro', piezas: ['firewall', 'vpn'] }] }, grafoRedes);
    const { justificacion } = await generarCurso({ tema: 'Cortafuegos', raizContenido: FIXTURES, dirCache: cache(), modelo });
    // ssh y usuarios no comparten entidades con la vecindad de «Cortafuegos»: ni se ofrecen al compositor.
    expect(compuestas.sort()).toEqual(['firewall', 'vpn']);
    expect(justificacion).toEqual({ firewall: ['Cortafuegos', 'Reglas'], vpn: ['Cortafuegos', 'VPN'] });
  });

  it('una pieza recuperada solo por título, sin entidades en la vecindad, no se admite', async () => {
    const { modelo } = falso({ unidades: [{ titulo: 'U', piezas: ['firewall', 'ssh'] }] }, grafoRedes);
    await expect(generarCurso({ tema: 'Cortafuegos', raizContenido: FIXTURES, dirCache: cache(), modelo })).rejects.toThrow(/ssh/);
  });

  it('guarda el grafo como JSON legible en la carpeta de caché', async () => {
    const dirCache = cache();
    await generarCurso({ tema: 'Cortafuegos', raizContenido: FIXTURES, dirCache, modelo: falso({ unidades: [{ titulo: 'U', piezas: ['firewall'] }] }, grafoRedes).modelo });
    const texto = readFileSync(join(dirCache, 'grafo.json'), 'utf8');
    expect(texto.split('\n').length).toBeGreaterThan(5);
    expect(texto).toContain('Cortafuegos');
    expect(texto).not.toContain('ids-borrador');
  });

  describe('indexado incremental', () => {
    const propuestaFirewall = { unidades: [{ titulo: 'Perímetro', piezas: ['firewall', 'vpn'] }] };
    const generar = (raizContenido: string, dirCache: string, modelo: Modelo, tema = 'Cortafuegos') =>
      generarCurso({ tema, raizContenido, dirCache, modelo });

    it('una segunda ejecución sin cambios no llama al modelo de extracción', async () => {
      const dirCache = cache();
      await generar(FIXTURES, dirCache, falso(propuestaFirewall, grafoRedes).modelo);
      const segunda = falso(propuestaFirewall, grafoRedes);
      const { justificacion } = await generar(FIXTURES, dirCache, segunda.modelo);
      expect(segunda.extraidas).toEqual([]);
      expect(justificacion).toEqual({ firewall: ['Cortafuegos', 'Reglas'], vpn: ['Cortafuegos', 'VPN'] });
    });

    it('una pieza modificada se reextrae y las demás no', async () => {
      const raiz = copia();
      const dirCache = cache();
      await generar(raiz, dirCache, falso(propuestaFirewall, grafoRedes).modelo);
      const ruta = join(raiz, 'piezas/redes/vpn.md');
      writeFileSync(ruta, readFileSync(ruta, 'utf8') + '\nUn párrafo nuevo.\n');
      const segunda = falso(propuestaFirewall, grafoRedes);
      await generar(raiz, dirCache, segunda.modelo);
      expect(segunda.extraidas).toEqual(['vpn']);
      const tercera = falso(propuestaFirewall, grafoRedes);
      await generar(raiz, dirCache, tercera.modelo);
      expect(tercera.extraidas).toEqual([]);
    });

    it('una pieza borrada y luego restaurada se vuelve a extraer: el índice la olvidó', async () => {
      const raiz = copia();
      const dirCache = cache();
      const ruta = join(raiz, 'piezas/sistemas/ssh.md');
      const texto = readFileSync(ruta, 'utf8');
      await generar(raiz, dirCache, falso(propuestaFirewall, grafoRedes).modelo);
      const beta = join(raiz, 'modulos/beta.yml');
      rmSync(ruta);
      writeFileSync(beta, readFileSync(beta, 'utf8').replace('[ssh, usuarios]', '[usuarios]'));
      await generar(raiz, dirCache, falso(propuestaFirewall, grafoRedes).modelo);
      writeFileSync(ruta, texto);
      const tercera = falso(propuestaFirewall, grafoRedes);
      await generar(raiz, dirCache, tercera.modelo);
      expect(tercera.extraidas).toEqual(['ssh']);
    });

    it('si la extracción falla a medias, la siguiente ejecución no repite las piezas ya extraídas', async () => {
      const dirCache = cache();
      const buena = falso(propuestaFirewall, grafoRedes).modelo;
      let n = 0;
      const cae: Modelo = { completar: (i, e) => (++n === 3 ? Promise.reject(new Error('sin red')) : buena.completar(i, e)) };
      await expect(generar(FIXTURES, dirCache, cae)).rejects.toThrow(/sin red/);
      const segunda = falso(propuestaFirewall, grafoRedes);
      await generar(FIXTURES, dirCache, segunda.modelo);
      expect(segunda.extraidas).toHaveLength(2);
    });

    it('si una ejecución cae tras reextraer una pieza, las piezas sin cambios que aún no alcanzó siguen en el índice', async () => {
      const raiz = copia();
      const dirCache = cache();
      await generar(raiz, dirCache, falso(propuestaFirewall, grafoRedes).modelo);
      for (const ruta of ['piezas/redes/firewall.md', 'piezas/redes/vpn.md']) {
        writeFileSync(join(raiz, ruta), readFileSync(join(raiz, ruta), 'utf8') + '\nCambio.\n');
      }
      const buena = falso(propuestaFirewall, grafoRedes).modelo;
      let n = 0;
      const cae: Modelo = { completar: (i, e) => (++n === 2 ? Promise.reject(new Error('sin red')) : buena.completar(i, e)) };
      await expect(generar(raiz, dirCache, cae)).rejects.toThrow(/sin red/);
      const tercera = falso(propuestaFirewall, grafoRedes);
      await generar(raiz, dirCache, tercera.modelo);
      expect(tercera.extraidas).toEqual(['vpn']);
    });

    it('un índice con JSON válido pero de otra forma se ignora y se reconstruye', async () => {
      const dirCache = cache();
      await generar(FIXTURES, dirCache, falso(propuestaFirewall, grafoRedes).modelo);
      const ruta = join(dirCache, 'indice.json');
      const indice = JSON.parse(readFileSync(ruta, 'utf8'));
      delete indice.piezas.firewall.entidades;
      writeFileSync(ruta, JSON.stringify(indice));
      const segunda = falso(propuestaFirewall, grafoRedes);
      const { justificacion } = await generar(FIXTURES, dirCache, segunda.modelo);
      expect(segunda.extraidas.sort()).toEqual(['firewall', 'ssh', 'usuarios', 'vpn']);
      expect(justificacion.firewall).toEqual(['Cortafuegos', 'Reglas']);
    });

    it('cambiar solo el título o el resumen de una pieza la reextrae', async () => {
      const raiz = copia();
      const dirCache = cache();
      await generar(raiz, dirCache, falso(propuestaFirewall, grafoRedes).modelo);
      const ruta = join(raiz, 'piezas/redes/firewall.md');
      writeFileSync(ruta, readFileSync(ruta, 'utf8').replace('Filtrado de tráfico con reglas', 'Otro resumen'));
      const segunda = falso(propuestaFirewall, grafoRedes);
      await generar(raiz, dirCache, segunda.modelo);
      expect(segunda.extraidas).toEqual(['firewall']);
    });

    it('un índice guardado ilegible se ignora y se reconstruye', async () => {
      const dirCache = cache();
      writeFileSync(join(dirCache, 'indice.json'), '{ no es json');
      const { modelo, extraidas } = falso(propuestaFirewall, grafoRedes);
      await generar(FIXTURES, dirCache, modelo);
      expect(extraidas.sort()).toEqual(['firewall', 'ssh', 'usuarios', 'vpn']);
    });

    it('una pieza borrada deja de aparecer en el grafo y en las propuestas', async () => {
      const raiz = copia();
      const dirCache = cache();
      await generar(raiz, dirCache, falso(propuestaFirewall, grafoRedes).modelo);
      rmSync(join(raiz, 'piezas/redes/firewall.md'));
      const alfa = join(raiz, 'modulos/alfa.yml');
      writeFileSync(alfa, readFileSync(alfa, 'utf8').replace('[firewall, vpn]', '[vpn]'));
      const segunda = falso({ unidades: [{ titulo: 'Perímetro', piezas: ['vpn'] }] }, grafoRedes);
      const { justificacion } = await generar(raiz, dirCache, segunda.modelo);
      expect(segunda.extraidas).toEqual([]);
      expect(segunda.compuestas).toEqual(['vpn']);
      expect(Object.keys(justificacion)).toEqual(['vpn']);
      expect(readFileSync(join(dirCache, 'grafo.json'), 'utf8')).not.toContain('Reglas');
    });
  });

  it('semillas que no están en el grafo no recuperan nada: error explícito', async () => {
    const { modelo } = falso(propuestaBuena, { ...grafoRedes, semillas: ['astronomía'] });
    await expect(generarCurso({ tema: 'Astronomía', raizContenido: FIXTURES, dirCache: cache(), modelo })).rejects.toThrow(/ninguna pieza/i);
  });

  it('una extracción mal formada falla con un mensaje claro', async () => {
    const modelo: Modelo = { completar: async () => 'basura' };
    await expect(generarCurso({ tema: 'T', raizContenido: FIXTURES, dirCache: cache(), modelo })).rejects.toThrow(/respuesta/i);
  });

  it('entidades que solo difieren en símbolos (C, C++, C#) no se fusionan', async () => {
    const guion: Guion = {
      extraccion: { firewall: { entidades: ['C'] }, vpn: { entidades: ['C#'] }, ssh: { entidades: ['C++'] }, usuarios: { entidades: ['Otra'] } },
      semillas: ['C#'],
    };
    const { modelo, compuestas } = falso({ unidades: [{ titulo: 'U', piezas: ['vpn'] }] }, guion);
    const { justificacion } = await generarCurso({ tema: 'Tema', raizContenido: FIXTURES, dirCache: cache(), modelo });
    expect(compuestas).toEqual(['vpn']);
    expect(justificacion).toEqual({ vpn: ['C#'] });
  });

  it('un punto final no separa una entidad de su variante sin punto (Linux. = Linux)', async () => {
    const guion: Guion = {
      extraccion: { firewall: { entidades: ['Linux.'] }, vpn: { entidades: ['Linux'] }, ssh: { entidades: ['S.O.'] }, usuarios: { entidades: ['Otra'] } },
      semillas: ['Linux'],
    };
    const { modelo, compuestas } = falso({ unidades: [{ titulo: 'U', piezas: ['firewall', 'vpn'] }] }, guion);
    await generarCurso({ tema: 'Tema', raizContenido: FIXTURES, dirCache: cache(), modelo });
    expect(compuestas.sort()).toEqual(['firewall', 'vpn']);
  });

  it('un punto interno distingue Node.js de NodeJS, y un símbolo no se confunde con su nombre (C. ≠ «C dot»)', async () => {
    const guion: Guion = {
      extraccion: { firewall: { entidades: ['Node.js'] }, vpn: { entidades: ['NodeJS'] }, ssh: { entidades: ['C dot'] }, usuarios: { entidades: ['C.'] } },
      semillas: ['Node.js', 'C dot'],
    };
    const { modelo, compuestas } = falso({ unidades: [{ titulo: 'U', piezas: ['firewall', 'ssh'] }] }, guion);
    await generarCurso({ tema: 'Tema', raizContenido: FIXTURES, dirCache: cache(), modelo });
    expect(compuestas.sort()).toEqual(['firewall', 'ssh']);
  });

  it('las siglas con puntos se unen a su forma sin puntos (S.O. = SO) y los puntos repetidos no dejan restos (a..b = a b)', async () => {
    const guion: Guion = {
      extraccion: { firewall: { entidades: ['S.O.'] }, vpn: { entidades: ['SO'] }, ssh: { entidades: ['Alfa..Beta'] }, usuarios: { entidades: ['Alfa Beta'] } },
      semillas: ['SO', 'Alfa Beta'],
    };
    const { modelo, compuestas } = falso({ unidades: [{ titulo: 'U', piezas: ['firewall', 'vpn', 'ssh', 'usuarios'] }] }, guion);
    await generarCurso({ tema: 'Tema', raizContenido: FIXTURES, dirCache: cache(), modelo });
    expect(compuestas.sort()).toEqual(['firewall', 'ssh', 'usuarios', 'vpn']);
    expect(compuestas.length).toBe(4);
  });

  it('una entidad hecha solo de símbolos («#») no crea un nodo que enlace piezas', async () => {
    const guion: Guion = {
      extraccion: { firewall: { entidades: ['#'] }, vpn: { entidades: ['#'] }, ssh: { entidades: ['Otra'] }, usuarios: { entidades: ['Otra'] } },
      semillas: ['#'],
    };
    const { modelo } = falso({ unidades: [{ titulo: 'U', piezas: ['firewall', 'vpn'] }] }, guion);
    await expect(generarCurso({ tema: 'Tema', raizContenido: FIXTURES, dirCache: cache(), modelo })).rejects.toThrow(/ninguna pieza/i);
  });

  it('deduce ciclo, curso e icono del módulo con más piezas recuperadas, no solo elegidas', async () => {
    // Se recuperan las cuatro piezas (empate alfa/beta → alfa), aunque el compositor use solo las de beta.
    const { modulo } = await generarCurso({ tema: 'T', raizContenido: FIXTURES, dirCache: cache(), modelo: falso({ unidades: [{ titulo: 'U', piezas: ['ssh', 'usuarios'] }] }, { semillas: ['Seguridad'] }).modelo });
    expect(modulo).toMatchObject({ ciclo: 'ASIR', curso: 2, icono: 'globo' });
  });

  it('hereda ciclo, curso e icono del módulo con más piezas recuperadas', async () => {
    // Solo la pieza «fuera» queda sin la entidad semilla, así que no se recupera.
    const sin = (fuera: string): Guion => ({
      extraccion: Object.fromEntries(['firewall', 'vpn', 'ssh', 'usuarios'].map((id) => [id, { entidades: [id === fuera ? 'Otra' : 'Seguridad'] }])),
    });
    const todas = { unidades: [{ titulo: 'U', piezas: ['ssh'] }] };
    const smr = await generarCurso({ tema: 'T', raizContenido: FIXTURES, dirCache: cache(), modelo: falso(todas, sin('firewall')).modelo });
    expect(smr.modulo).toMatchObject({ ciclo: 'SMR', curso: 1, icono: 'terminal' });
    const asir = await generarCurso({ tema: 'T', raizContenido: FIXTURES, dirCache: cache(), modelo: falso(todas, sin('usuarios')).modelo });
    expect(asir.modulo).toMatchObject({ ciclo: 'ASIR', curso: 2, icono: 'globo' });
  });

  it('en empate de módulos de origen elige el primero por id', async () => {
    const { modulo } = await generarCurso({ tema: 'T', raizContenido: FIXTURES, dirCache: cache(), modelo: falso({ unidades: [{ titulo: 'U', piezas: ['ssh', 'firewall'] }] }).modelo });
    expect(modulo).toMatchObject({ ciclo: 'ASIR', codigo: 'POR-DEFINIR' });
  });

  it('un tema sin caracteres válidos falla antes de llamar al modelo', async () => {
    const { modelo, contador } = falso(propuestaBuena);
    await expect(generarCurso({ tema: '???', raizContenido: FIXTURES, dirCache: cache(), modelo })).rejects.toThrow(/identificador/);
    expect(contador.llamadas).toBe(0);
  });

  it('un corpus con ids de pieza duplicados falla antes de llamar al modelo', async () => {
    const raiz = copia();
    mkdirSync(join(raiz, 'piezas', 'otra'));
    cpSync(join(raiz, 'piezas', 'redes', 'vpn.md'), join(raiz, 'piezas', 'otra', 'vpn.md'));
    const { modelo, contador } = falso(propuestaBuena);
    await expect(generarCurso({ tema: 'Tema', raizContenido: raiz, dirCache: cache(), modelo })).rejects.toThrow(/duplicado/);
    expect(contador.llamadas).toBe(0);
  });
});

describe('ejecutarCurso (comando)', () => {
  it('escribe contenido/modulos/<id>.yml desactivado', async () => {
    const raiz = copia();
    const { modelo } = falso(propuestaBuena);
    await ejecutarCurso({ argumentos: ['Seguridad en redes'], raizContenido: raiz, dirCache: cache(), modelo });
    const ruta = join(raiz, 'modulos', 'seguridad-en-redes.yml');
    const escrito = load(readFileSync(ruta, 'utf8')) as { activo: boolean };
    expect(escrito.activo).toBe(false);
  });

  it('devuelve, por pieza escrita, las entidades que la justificaron', async () => {
    const raiz = copia();
    const { modelo } = falso({ unidades: [{ titulo: 'Perímetro', piezas: ['firewall', 'vpn'] }] }, grafoRedes);
    const { destino, justificacion } = await ejecutarCurso({ argumentos: ['Cortafuegos'], raizContenido: raiz, dirCache: cache(), modelo });
    expect(destino).toBe(join(raiz, 'modulos', 'cortafuegos.yml'));
    expect(justificacion).toEqual({ firewall: ['Cortafuegos', 'Reglas'], vpn: ['Cortafuegos', 'VPN'] });
  });

  it('si el destino ya existe, falla y no lo toca', async () => {
    const raiz = copia();
    const ruta = join(raiz, 'modulos', 'tema.yml');
    writeFileSync(ruta, 'previo');
    const { modelo } = falso(propuestaBuena);
    await expect(ejecutarCurso({ argumentos: ['Tema'], raizContenido: raiz, dirCache: cache(), modelo })).rejects.toThrow(/ya existe/);
    expect(readFileSync(ruta, 'utf8')).toBe('previo');
  });

  it('si la generación falla, no escribe nada', async () => {
    const raiz = copia();
    const { modelo } = falso('basura');
    await expect(ejecutarCurso({ argumentos: ['Tema'], raizContenido: raiz, dirCache: cache(), modelo })).rejects.toThrow();
    expect(existsSync(join(raiz, 'modulos', 'tema.yml'))).toBe(false);
  });

  it('con el proveedor caído no escribe nada', async () => {
    const error = new Error('503');
    const raiz = copia();
    const modelo: Modelo = { completar: () => Promise.reject(error) };
    await expect(ejecutarCurso({ argumentos: ['Tema'], raizContenido: raiz, dirCache: cache(), modelo })).rejects.toThrow();
    expect(existsSync(join(raiz, 'modulos', 'tema.yml'))).toBe(false);
  });

  it.each([[[]], [['a', 'b']], [['  ']]])('exige exactamente un tema (%j)', async (argumentos) => {
    const { modelo } = falso(propuestaBuena);
    await expect(ejecutarCurso({ argumentos, raizContenido: FIXTURES, dirCache: cache(), modelo })).rejects.toThrow(/tema/);
  });
});

describe('formatearJustificacion', () => {
  it('una línea por pieza con sus entidades', () => {
    expect(formatearJustificacion({ firewall: ['Cortafuegos', 'Reglas'], vpn: ['VPN'] })).toEqual(['  firewall: Cortafuegos, Reglas', '  vpn: VPN']);
  });
});

describe('scripts/curso.mjs', () => {
  it('se ejecuta bajo Vite y sin argumentos sale con el mensaje de uso', () => {
    const r = spawnSync(process.execPath, ['scripts/curso.mjs'], { encoding: 'utf8' });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('uso: node scripts/curso.mjs');
  });
});

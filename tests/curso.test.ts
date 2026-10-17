import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { load } from 'js-yaml';
import { afterEach, describe, expect, it } from 'vitest';
import { generarCurso, type Modelo } from '../src/lib/curso/generar';
import { ejecutarCurso } from '../src/lib/curso/cli';
import { esquemaModulo } from '../src/lib/esquemas';

const FIXTURES = resolve('tests/fixtures/curso/contenido');

/** Modelo falso: responde con la propuesta dada y apunta qué piezas se le ofrecieron. */
function falso(propuesta: unknown) {
  const ofrecidas: string[] = [];
  let llamadas = 0;
  const contador = { get llamadas() { return llamadas; } };
  const modelo: Modelo = {
    async completar(_instruccion, entrada) {
      llamadas++;
      const { piezas } = JSON.parse(entrada) as { piezas: { id: string }[] };
      ofrecidas.push(...piezas.map((p) => p.id));
      return typeof propuesta === 'string' ? propuesta : JSON.stringify(propuesta);
    },
  };
  return { modelo, ofrecidas, contador };
}

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

function copia() {
  const dir = mkdtempSync(join(tmpdir(), 'onyon-curso-'));
  temporales.push(dir);
  cpSync(FIXTURES, dir, { recursive: true });
  return dir;
}

describe('generarCurso', () => {
  it('produce un módulo que supera esquemaModulo (generarCurso ya lo valida con construirCatalogo)', async () => {
    const { modelo } = falso(propuestaBuena);
    const { id, modulo } = await generarCurso({ tema: 'Seguridad en redes para ASIR', raizContenido: FIXTURES, modelo });
    expect(id).toBe('seguridad-en-redes-para-asir');
    expect(() => esquemaModulo.parse(modulo)).not.toThrow();
    expect(modulo.unidades.map((u) => [u.id, u.piezas])).toEqual([['seguridad-del-perimetro', ['firewall', 'vpn']], ['acceso-remoto', ['ssh']]]);
  });

  it('nace desactivado, con ids de unidad slug únicos y sin piezas repetidas en una unidad', async () => {
    const { modelo } = falso({ unidades: [{ titulo: 'Núcleo', piezas: ['vpn', 'vpn'] }, { titulo: 'Núcleo', piezas: ['ssh'] }] });
    const { modulo } = await generarCurso({ tema: 'Tema', raizContenido: FIXTURES, modelo });
    expect(modulo.activo).toBe(false);
    expect(modulo.unidades.map((u) => u.id)).toEqual(['nucleo', 'nucleo-2']);
    expect(modulo.unidades[0].piezas).toEqual(['vpn']);
  });

  it('no ofrece al modelo los borradores', async () => {
    const { modelo, ofrecidas } = falso(propuestaBuena);
    await generarCurso({ tema: 'Tema', raizContenido: FIXTURES, modelo });
    expect(ofrecidas.sort()).toEqual(['firewall', 'ssh', 'usuarios', 'vpn']);
  });

  it('rechaza una pieza que el modelo cita pero no existe, o que es un borrador', async () => {
    for (const id of ['inventada', 'ids-borrador']) {
      const { modelo } = falso({ unidades: [{ titulo: 'X', piezas: [id] }] });
      await expect(generarCurso({ tema: 'Tema', raizContenido: FIXTURES, modelo })).rejects.toThrow(id);
    }
  });

  it('falla con una respuesta mal formada, sin propuesta o con un proveedor caído', async () => {
    await expect(generarCurso({ tema: 'T', raizContenido: FIXTURES, modelo: falso('no es json').modelo })).rejects.toThrow(/respuesta/i);
    await expect(generarCurso({ tema: 'T', raizContenido: FIXTURES, modelo: falso({ unidades: [] }).modelo })).rejects.toThrow(/ninguna pieza/i);
    const caido: Modelo = { completar: () => Promise.reject(new Error('503')) };
    await expect(generarCurso({ tema: 'T', raizContenido: FIXTURES, modelo: caido })).rejects.toThrow(/503/);
  });

  it('hereda ciclo, curso e icono del módulo con más piezas elegidas', async () => {
    const smr = await generarCurso({ tema: 'T', raizContenido: FIXTURES, modelo: falso({ unidades: [{ titulo: 'U', piezas: ['ssh', 'usuarios', 'vpn'] }] }).modelo });
    expect(smr.modulo).toMatchObject({ ciclo: 'SMR', curso: 1, icono: 'terminal' });
    const asir = await generarCurso({ tema: 'T', raizContenido: FIXTURES, modelo: falso({ unidades: [{ titulo: 'U', piezas: ['firewall', 'vpn', 'ssh'] }] }).modelo });
    expect(asir.modulo).toMatchObject({ ciclo: 'ASIR', curso: 2, icono: 'globo' });
  });

  it('en empate de módulos de origen elige el primero por id', async () => {
    const { modulo } = await generarCurso({ tema: 'T', raizContenido: FIXTURES, modelo: falso({ unidades: [{ titulo: 'U', piezas: ['ssh', 'firewall'] }] }).modelo });
    expect(modulo).toMatchObject({ ciclo: 'ASIR', codigo: 'POR-DEFINIR' });
  });

  it('un tema sin caracteres válidos falla antes de llamar al modelo', async () => {
    const { modelo, contador } = falso(propuestaBuena);
    await expect(generarCurso({ tema: '???', raizContenido: FIXTURES, modelo })).rejects.toThrow(/identificador/);
    expect(contador.llamadas).toBe(0);
  });

  it('un corpus con ids de pieza duplicados falla antes de llamar al modelo', async () => {
    const raiz = copia();
    mkdirSync(join(raiz, 'piezas', 'otra'));
    cpSync(join(raiz, 'piezas', 'redes', 'vpn.md'), join(raiz, 'piezas', 'otra', 'vpn.md'));
    const { modelo, contador } = falso(propuestaBuena);
    await expect(generarCurso({ tema: 'Tema', raizContenido: raiz, modelo })).rejects.toThrow(/duplicado/);
    expect(contador.llamadas).toBe(0);
  });
});

describe('ejecutarCurso (comando)', () => {

  it('escribe contenido/modulos/<id>.yml desactivado', async () => {
    const raiz = copia();
    const { modelo } = falso(propuestaBuena);
    await ejecutarCurso({ argumentos: ['Seguridad en redes'], raizContenido: raiz, modelo });
    const ruta = join(raiz, 'modulos', 'seguridad-en-redes.yml');
    const escrito = load(readFileSync(ruta, 'utf8')) as { activo: boolean };
    expect(escrito.activo).toBe(false);
  });

  it('si el destino ya existe, falla y no lo toca', async () => {
    const raiz = copia();
    const ruta = join(raiz, 'modulos', 'tema.yml');
    writeFileSync(ruta, 'previo');
    const { modelo } = falso(propuestaBuena);
    await expect(ejecutarCurso({ argumentos: ['Tema'], raizContenido: raiz, modelo })).rejects.toThrow(/ya existe/);
    expect(readFileSync(ruta, 'utf8')).toBe('previo');
  });

  it('si la generación falla, no escribe nada', async () => {
    const raiz = copia();
    const { modelo } = falso('basura');
    await expect(ejecutarCurso({ argumentos: ['Tema'], raizContenido: raiz, modelo })).rejects.toThrow();
    expect(existsSync(join(raiz, 'modulos', 'tema.yml'))).toBe(false);
  });

  it.each([[[]], [['a', 'b']], [['  ']]])('exige exactamente un tema (%j)', async (argumentos) => {
    const { modelo } = falso(propuestaBuena);
    await expect(ejecutarCurso({ argumentos, raizContenido: FIXTURES, modelo })).rejects.toThrow(/tema/);
  });

  it('sin proveedor de modelo configurado lo dice claramente', async () => {
    await expect(ejecutarCurso({ argumentos: ['Tema'], raizContenido: copia() })).rejects.toThrow(/proveedor/);
  });
});

describe('scripts/curso.mjs', () => {
  it('se ejecuta bajo Vite y sin argumentos sale con el mensaje de uso', () => {
    const r = spawnSync(process.execPath, ['scripts/curso.mjs'], { encoding: 'utf8' });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('uso: node scripts/curso.mjs');
  });
});

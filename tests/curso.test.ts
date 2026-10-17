import { cpSync, existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { load } from 'js-yaml';
import { describe, expect, it } from 'vitest';
import { construirCatalogo } from '../src/lib/catalogo';
import { generarCurso, type Modelo } from '../src/lib/curso/generar';
import { ejecutarCurso } from '../src/lib/curso/cli';
import { esquemaModulo } from '../src/lib/esquemas';
import { leerCorpus } from '../src/lib/curso/corpus';

const FIXTURES = resolve('tests/fixtures/curso/contenido');

/** Modelo falso: responde con la propuesta dada y apunta qué piezas se le ofrecieron. */
function falso(propuesta: unknown) {
  const ofrecidas: string[] = [];
  const modelo: Modelo = {
    async completar(_instruccion, entrada) {
      const { piezas } = JSON.parse(entrada) as { piezas: { id: string }[] };
      ofrecidas.push(...piezas.map((p) => p.id));
      return typeof propuesta === 'string' ? propuesta : JSON.stringify(propuesta);
    },
  };
  return { modelo, ofrecidas };
}

const propuestaBuena = {
  unidades: [
    { titulo: 'Seguridad del perímetro', piezas: ['firewall', 'vpn', 'vpn'] },
    { titulo: 'Acceso remoto', piezas: ['ssh'] },
  ],
};

describe('generarCurso', () => {
  it('produce un módulo que supera esquemaModulo y construirCatalogo en modo desarrollo', async () => {
    const { modelo } = falso(propuestaBuena);
    const { id, modulo } = await generarCurso({ tema: 'Seguridad en redes para ASIR', raizContenido: FIXTURES, modelo });
    expect(id).toBe('seguridad-en-redes-para-asir');
    expect(() => esquemaModulo.parse(modulo)).not.toThrow();
    const { piezas, modulos } = leerCorpus(FIXTURES);
    const generado = { id, archivo: `${id}.yml`, rutaAbs: `/x/${id}.yml`, datos: modulo, privado: false };
    expect(() => construirCatalogo(piezas, [...modulos, generado], 'desarrollo')).not.toThrow();
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
});

describe('ejecutarCurso (comando)', () => {
  function copia() {
    const dir = mkdtempSync(join(tmpdir(), 'onyon-curso-'));
    cpSync(FIXTURES, dir, { recursive: true });
    return dir;
  }

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

  it('exige exactamente un tema', async () => {
    const { modelo } = falso(propuestaBuena);
    await expect(ejecutarCurso({ argumentos: [], raizContenido: FIXTURES, modelo })).rejects.toThrow(/tema/);
    await expect(ejecutarCurso({ argumentos: ['a', 'b'], raizContenido: FIXTURES, modelo })).rejects.toThrow(/tema/);
  });
});

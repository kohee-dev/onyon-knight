import { describe, expect, it } from 'vitest';
import { crearModeloOllama, modeloDesdeEntorno } from '../src/lib/curso/ollama';

type Llamada = { url: string; init: RequestInit };

function fetchFalso(cuerpo: unknown, estado = 200) {
  const llamadas: Llamada[] = [];
  const fetch = (async (url: string, init: RequestInit) => {
    llamadas.push({ url, init });
    return new Response(JSON.stringify(cuerpo), { status: estado });
  }) as unknown as typeof globalThis.fetch;
  return { fetch, llamadas };
}

describe('adaptador de Ollama', () => {
  it('envía instrucción y entrada a /api/chat en modo JSON y devuelve el contenido', async () => {
    const { fetch, llamadas } = fetchFalso({ message: { content: '{"ok":true}' } });
    const modelo = crearModeloOllama({ host: 'http://localhost:11434', modelo: 'llama3.1', plazoMs: 1000, fetch });
    expect(await modelo.completar('Instrucción', 'Entrada')).toBe('{"ok":true}');
    expect(llamadas[0].url).toBe('http://localhost:11434/api/chat');
    const cuerpo = JSON.parse(llamadas[0].init.body as string);
    expect(cuerpo).toMatchObject({ model: 'llama3.1', stream: false, format: 'json' });
    expect(cuerpo.messages).toEqual([{ role: 'system', content: 'Instrucción' }, { role: 'user', content: 'Entrada' }]);
  });

  it('un error HTTP lo nombra con su estado', async () => {
    const { fetch } = fetchFalso({ error: 'model not found' }, 404);
    const modelo = crearModeloOllama({ host: 'http://localhost:11434', modelo: 'x', plazoMs: 1000, fetch });
    await expect(modelo.completar('i', 'e')).rejects.toThrow(/404.*model not found/);
  });

  it('una respuesta sin contenido falla', async () => {
    const { fetch } = fetchFalso({});
    const modelo = crearModeloOllama({ host: 'http://localhost:11434', modelo: 'x', plazoMs: 1000, fetch });
    await expect(modelo.completar('i', 'e')).rejects.toThrow(/sin contenido/);
  });

  it('un servidor que no responde a tiempo aborta con el plazo', async () => {
    const fetch = ((_: string, init: RequestInit) =>
      new Promise((_res, rej) => init.signal!.addEventListener('abort', () => rej(init.signal!.reason)))) as unknown as typeof globalThis.fetch;
    const modelo = crearModeloOllama({ host: 'http://localhost:11434', modelo: 'x', plazoMs: 20, fetch });
    await expect(modelo.completar('i', 'e')).rejects.toThrow(/plazo/i);
  });

  it('el host sin esquema o con barra final se normaliza y las credenciales no se filtran en la URL', async () => {
    const { fetch, llamadas } = fetchFalso({ message: { content: 'a' } });
    await crearModeloOllama({ host: 'maquina:11434/', modelo: 'x', plazoMs: 1000, fetch }).completar('i', 'e');
    expect(llamadas[0].url).toBe('http://maquina:11434/api/chat');
    await crearModeloOllama({ host: 'http://usuario:secreto@h:1', modelo: 'x', plazoMs: 1000, fetch }).completar('i', 'e');
    expect(llamadas[1].url).toBe('http://h:1/api/chat');
    expect((llamadas[1].init.headers as Record<string, string>).Authorization).toBe(`Basic ${Buffer.from('usuario:secreto').toString('base64')}`);
  });

  it('acepta IPv6 sin esquema y envía las opciones que evitan el recorte y los bucles', async () => {
    const { fetch, llamadas } = fetchFalso({ message: { content: 'a' } });
    await crearModeloOllama({ host: '[::1]:11434', modelo: 'x', plazoMs: 1000, fetch }).completar('i', 'e');
    expect(llamadas[0].url).toBe('http://[::1]:11434/api/chat');
    expect(JSON.parse(llamadas[0].init.body as string).options).toEqual({ num_ctx: 16384, num_predict: 4096, temperature: 0.3, repeat_penalty: 1.2 });
  });

  it('un host inválido nombra OLLAMA_HOST y un fallo de conexión nombra el host y la causa', async () => {
    expect(() => crearModeloOllama({ host: 'http://', modelo: 'x', plazoMs: 1, fetch: fetchFalso({}).fetch })).toThrow(/OLLAMA_HOST/);
    const caido = (async () => { throw new TypeError('fetch failed', { cause: new Error('ECONNREFUSED') }); }) as unknown as typeof globalThis.fetch;
    await expect(crearModeloOllama({ host: 'h:1', modelo: 'x', plazoMs: 1000, fetch: caido }).completar('i', 'e')).rejects.toThrow(/http:\/\/h:1.*ECONNREFUSED/);
  });

  it('lee host, modelo y plazo del entorno con valores por defecto', () => {
    expect(modeloDesdeEntorno({}, fetchFalso({}).fetch)).toBeDefined();
    expect(() => modeloDesdeEntorno({ OLLAMA_TIMEOUT_MS: 'abc' })).toThrow(/OLLAMA_TIMEOUT_MS/);
  });
});

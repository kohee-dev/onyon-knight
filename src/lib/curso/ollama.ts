import type { Modelo } from './modelo';

export interface OpcionesOllama {
  host: string;
  modelo: string;
  plazoMs: number;
  fetch?: typeof globalThis.fetch;
}

const PLAZO_POR_DEFECTO_MS = 10 * 60 * 1000;

/** Acepta `maquina:11434` o `[::1]:11434` sin esquema; las credenciales del host pasan a autenticación básica. */
function normalizarHost(host: string): { base: string; autorizacion?: string } {
  const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(host) ? host : `http://${host}`);
  const autorizacion = url.username
    ? `Basic ${Buffer.from(`${decodeURIComponent(url.username)}:${decodeURIComponent(url.password)}`).toString('base64')}`
    : undefined;
  return { base: `${url.protocol}//${url.host}${url.pathname.replace(/\/+$/, '')}`, autorizacion };
}

/** Adaptador del puerto `Modelo` sobre un Ollama local (`/api/chat`, sin clave). */
export function crearModeloOllama({ host, modelo, plazoMs, fetch: llamar = globalThis.fetch }: OpcionesOllama): Modelo {
  const { base, autorizacion } = normalizarHost(host);
  return {
    async completar(instruccion, entrada) {
      const respuesta = await llamar(`${base}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(autorizacion ? { Authorization: autorizacion } : {}) },
        // Un servidor que acepta la conexión y calla dejaría el comando colgado.
        signal: AbortSignal.timeout(plazoMs),
        body: JSON.stringify({
          model: modelo,
          stream: false,
          format: 'json',
          // Ollama recorta el prompt a 4096 tokens por defecto; los modelos pequeños en modo JSON caen en bucles sin tope ni penalización.
          options: { num_ctx: 16384, num_predict: 4096, temperature: 0.3, repeat_penalty: 1.2 },
          messages: [
            { role: 'system', content: instruccion },
            { role: 'user', content: entrada },
          ],
        }),
      }).catch((e: unknown) => {
        if (e instanceof Error && e.name === 'TimeoutError') throw new Error(`Ollama no respondió dentro del plazo de ${plazoMs} ms (OLLAMA_TIMEOUT_MS)`);
        throw e;
      });
      const cuerpo = (await respuesta.json().catch(() => ({}))) as { message?: { content?: unknown }; error?: unknown };
      if (!respuesta.ok) throw new Error(`Ollama respondió ${respuesta.status}${typeof cuerpo.error === 'string' ? `: ${cuerpo.error}` : ''}`);
      const contenido = cuerpo.message?.content;
      if (typeof contenido !== 'string' || !contenido) throw new Error('Ollama devolvió una respuesta sin contenido');
      return contenido;
    },
  };
}

/** `OLLAMA_HOST`, `OLLAMA_MODEL` y `OLLAMA_TIMEOUT_MS` con sus valores por defecto. */
export function modeloDesdeEntorno(entorno: Record<string, string | undefined> = process.env, fetch?: typeof globalThis.fetch): Modelo {
  const bruto = entorno.OLLAMA_TIMEOUT_MS;
  const plazoMs = bruto === undefined || bruto === '' ? PLAZO_POR_DEFECTO_MS : Number(bruto);
  if (!Number.isFinite(plazoMs) || plazoMs <= 0) throw new Error(`OLLAMA_TIMEOUT_MS debe ser un número de milisegundos positivo, no «${bruto}»`);
  return crearModeloOllama({ host: entorno.OLLAMA_HOST || 'http://localhost:11434', modelo: entorno.OLLAMA_MODEL || 'llama3.1', plazoMs, fetch });
}

import { createServer, type Server } from 'node:http';
import { resolve } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright';
import sirv from 'sirv';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { construir } from './util';

// Comportamiento real del menú y la cabecera en Chromium, sobre el sitio construido.
let servidor: Server;
let navegador: Browser;
let origen = '';

beforeAll(async () => {
  const dist = construir({ ONYON_CONTENIDO: resolve('tests/fixtures/valido'), BASE_PATH: '/ok/', SITE_URL: 'https://ej.es' });
  const estatico = sirv(dist, { dev: true });
  servidor = createServer((req, res) => {
    if (!req.url!.startsWith('/ok/')) return void res.writeHead(404).end();
    req.url = req.url!.slice(3);
    estatico(req, res, () => void res.writeHead(404).end());
  });
  await new Promise<void>((r) => servidor.listen(0, '127.0.0.1', () => r()));
  origen = `http://127.0.0.1:${(servidor.address() as any).port}`;
  navegador = await chromium.launch();
}, 300_000);

afterAll(async () => {
  await navegador?.close();
  servidor?.close();
});

async function abrir(ruta: string, ancho: number): Promise<Page> {
  const pagina = await navegador.newPage({ viewport: { width: ancho, height: 800 } });
  await pagina.goto(origen + ruta);
  await pagina.waitForFunction('window.__onyonListo === true');
  return pagina;
}

const estado = (p: Page) =>
  p.evaluate(() => {
    const menu = document.getElementById('menu')!;
    return {
      abierto: menu.classList.contains('menu-abierto'),
      rol: menu.getAttribute('role'),
      modal: menu.getAttribute('aria-modal'),
      expandido: document.querySelector('.menu-boton')!.getAttribute('aria-expanded'),
      focoDentro: menu.contains(document.activeElement),
      focoEnBoton: document.activeElement?.classList.contains('menu-boton') ?? false,
      inertes: ['header.cabecera', 'footer.pie', 'section.pieza'].map((s) => (document.querySelector(s) as any)?.inert ?? null),
    };
  });

describe('menú en móvil', () => {
  it('se abre como diálogo modal, retiene el foco y se cierra con Esc', async () => {
    const p = await abrir('/ok/aso/ut1/', 375);
    expect(await p.isVisible('.menu-boton')).toBe(true);
    expect(await p.isVisible('header.cabecera .tema-boton')).toBe(false);
    await p.click('.menu-boton');
    let e = await estado(p);
    expect(e).toMatchObject({ abierto: true, rol: 'dialog', modal: 'true', expandido: 'true', focoDentro: true });
    expect(e.inertes).toEqual([true, true, true]);
    expect(await p.isVisible('#menu .tema-boton')).toBe(true);
    for (let i = 0; i < 25; i++) await p.keyboard.press('Tab');
    expect((await estado(p)).focoDentro).toBe(true);
    for (let i = 0; i < 25; i++) await p.keyboard.press('Shift+Tab');
    expect((await estado(p)).focoDentro).toBe(true);
    await p.keyboard.press('Escape');
    e = await estado(p);
    expect(e).toMatchObject({ abierto: false, rol: null, expandido: 'false', focoEnBoton: true });
    expect(e.inertes).toEqual([false, false, false]);
    await p.close();
  });

  it('se cierra solo al ensanchar la ventana', async () => {
    const p = await abrir('/ok/aso/ut1/', 375);
    await p.click('.menu-boton');
    await p.setViewportSize({ width: 1440, height: 800 });
    await p.waitForFunction(() => !document.getElementById('menu')!.classList.contains('menu-abierto'));
    const e = await estado(p);
    expect(e.inertes).toEqual([false, false, false]);
    expect(await p.isVisible('.menu-indice')).toBe(true); // índice lateral
    expect(await p.isVisible('.menu-boton')).toBe(false);
    expect(await p.isVisible('header.cabecera .tema-boton')).toBe(true);
    await p.close();
  });

  it('existe en páginas sin índice y solo contiene el modo', async () => {
    const p = await abrir('/ok/', 375);
    await p.click('.menu-boton');
    expect(await p.isVisible('#menu .tema-boton')).toBe(true);
    expect(await p.locator('#menu .menu-indice').count()).toBe(0);
    await p.close();
  });
});

describe('índice lateral', () => {
  it.each([1280, 1366, 1440])('a %i px deja al menos 1,5 rem entre el texto y el índice', async (ancho) => {
    const p = await abrir('/ok/aso/ut1/', ancho);
    const hueco = await p.evaluate(() => {
      const main = document.querySelector('main')!;
      const relleno = parseFloat(getComputedStyle(main).paddingRight);
      const finTexto = main.getBoundingClientRect().right - relleno;
      const inicioIndice = document.getElementById('menu')!.getBoundingClientRect().left;
      return (inicioIndice - finTexto) / parseFloat(getComputedStyle(document.documentElement).fontSize);
    });
    expect(hueco).toBeGreaterThanOrEqual(1.5);
    await p.close();
  });
});

describe('desplegable de módulos', () => {
  it('se abre, se cierra con Esc y con un clic fuera, y devuelve el foco', async () => {
    const p = await abrir('/ok/aso/ut1/', 1440);
    const abierto = () => p.evaluate(() => document.querySelector('.modulos-boton')!.getAttribute('aria-expanded'));
    expect(await p.isVisible('#lista-modulos')).toBe(false);
    await p.click('.modulos-boton');
    expect(await abierto()).toBe('true');
    expect(await p.isVisible('#lista-modulos a[href="/ok/som/"]')).toBe(true);
    await p.keyboard.press('Escape');
    expect(await abierto()).toBe('false');
    expect(await p.evaluate(() => document.activeElement?.classList.contains('modulos-boton'))).toBe(true);
    await p.click('.modulos-boton');
    await p.mouse.click(700, 600);
    expect(await abierto()).toBe('false');
    expect(await p.isVisible('#lista-modulos')).toBe(false);
    await p.close();
  });

  it('en una pantalla baja no se sale de la ventana y se puede desplazar', async () => {
    const p = await abrir('/ok/aso/ut1/', 1440);
    await p.setViewportSize({ width: 1440, height: 200 });
    await p.click('.modulos-boton');
    const caja = await p.evaluate(() => {
      const l = document.getElementById('lista-modulos')!;
      return { abajo: l.getBoundingClientRect().bottom, alto: innerHeight, desborda: l.scrollHeight > l.clientHeight, scroll: getComputedStyle(l).overflowY };
    });
    expect(caja.abajo).toBeLessThanOrEqual(caja.alto);
    expect(caja.desborda).toBe(true);
    expect(caja.scroll).toBe('auto');
    await p.close();
  });

  it('en móvil, los módulos están dentro del menú', async () => {
    const p = await abrir('/ok/aso/ut1/', 375);
    expect(await p.isVisible('.modulos-boton')).toBe(false);
    await p.click('.menu-boton');
    expect(await p.isVisible('#menu .menu-modulos a[href="/ok/som/"]')).toBe(true);
    await p.close();
  });
});

describe('diagramas', () => {
  const diagrama = (p: Page) =>
    p.evaluate(() => {
      const pre = document.querySelector('pre.mermaid')!;
      return { fondo: getComputedStyle(pre).backgroundColor, claro: /#ECECFF/i.test(pre.querySelector('svg')?.innerHTML ?? '') };
    });

  it('usan el fondo de la página y se redibujan al cambiar de tema', async () => {
    const p = await navegador.newPage({ viewport: { width: 1440, height: 800 } });
    await p.addInitScript(() => localStorage.setItem('onyon-tema', 'oscuro'));
    await p.goto(origen + '/ok/aso/ut1/');
    await p.waitForFunction('window.__onyonListo === true');
    expect(await diagrama(p)).toEqual({ fondo: 'rgba(0, 0, 0, 0)', claro: false });
    await p.click('.cabecera .tema-boton');
    await p.waitForFunction(() => /#ECECFF/i.test(document.querySelector('pre.mermaid svg')?.innerHTML ?? ''));
    expect((await diagrama(p)).claro).toBe(true);
    await p.close();
  });
});

describe('copiar código', () => {
  it('copia el bloque entero, se pone verde y lo anuncia; Mermaid no lleva botón', async () => {
    const contexto = await navegador.newContext({ viewport: { width: 1440, height: 800 }, permissions: ['clipboard-read', 'clipboard-write'] });
    const p = await contexto.newPage();
    await p.goto(origen + '/ok/aso/ut1/');
    await p.waitForFunction('window.__onyonListo === true');
    expect(await p.locator('pre.mermaid .copiar-codigo, pre.mermaid + .copiar-codigo').count()).toBe(0);
    const boton = p.locator('.codigo .copiar-codigo').first();
    expect(await boton.getAttribute('aria-label')).toBe('Copiar código');
    await boton.click();
    expect(await p.evaluate(() => navigator.clipboard.readText())).toBe('ps aux | grep sshd');
    expect(await boton.getAttribute('class')).toContain('copiado');
    expect(await p.locator('.codigo .copiar-aviso').first().textContent()).toBe('Copiado');
    await p.waitForFunction(() => !document.querySelector('.copiar-codigo.copiado'), null, { timeout: 4000 });
    await contexto.close();
  });
});

describe('tablas anchas', () => {
  it.each([1280, 1440])('a %i px ninguna tabla sale de la columna', async (ancho) => {
    const p = await abrir('/ok/aso/ut1/', ancho);
    const exceso = await p.evaluate(() => {
      const main = document.querySelector('main')!;
      const fin = main.getBoundingClientRect().right - parseFloat(getComputedStyle(main).paddingRight);
      return Math.max(...[...document.querySelectorAll('.contenido table, .tabla-desplazable')].map((t) => t.getBoundingClientRect().right - fin));
    });
    expect(exceso).toBeLessThanOrEqual(1);
    await p.close();
  });
});

describe('móvil sin desplazamiento horizontal', () => {
  it.each(['/ok/aso/ut1/', '/ok/aso/ut1/casos/caso-ldap/', '/ok/'])('%s a 375 px', async (ruta) => {
    const p = await abrir(ruta, 375);
    expect(await p.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
    await p.close();
  });
});

describe('«Atrás» y el índice', () => {
  it.each([1440, 375])('a %i px, después de usar el índice, «Atrás» vuelve a la página anterior', async (ancho) => {
    const p = await navegador.newPage({ viewport: { width: ancho, height: 800 } });
    await p.goto(origen + '/ok/');
    await p.goto(origen + '/ok/aso/ut1/');
    await p.waitForFunction('window.__onyonListo === true');
    for (const id of ['procesos-estados', 'procesos-concepto', 'licencias-y-fuentes']) {
      if (ancho < 1280) await p.click('.menu-boton');
      await p.click(`#menu .menu-indice a[href="#${id}"]`);
      await p.waitForFunction((h) => location.hash === h, `#${id}`);
    }
    await p.goBack();
    await p.waitForURL(origen + '/ok/');
    expect(new URL(p.url()).pathname).toBe('/ok/');
    await p.close();
  });
});

describe('cabecera', () => {
  it('queda fija y la barra de progreso avanza al bajar', async () => {
    const p = await abrir('/ok/aso/ut1/', 1440);
    const progreso = () => p.evaluate(() => getComputedStyle(document.querySelector('.progreso')!).getPropertyValue('--progreso').trim());
    expect(Number(await progreso())).toBe(0);
    await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await p.waitForFunction(() => Number(getComputedStyle(document.querySelector('.progreso')!).getPropertyValue('--progreso')) > 0.95);
    const arriba = await p.evaluate(() => document.querySelector('header.cabecera')!.getBoundingClientRect().top);
    expect(arriba).toBe(0);
    await p.close();
  });
});

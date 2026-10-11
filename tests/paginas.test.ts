import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { construir } from './util';

const PIE = '© Alejandro Bartolomé · CC BY-SA 4.0, salvo indicación expresa';
let dist = '';
const leer = (ruta: string) => readFileSync(join(dist, ruta), 'utf8');

beforeAll(() => {
  dist = construir({ ONYON_CONTENIDO: resolve('tests/fixtures/valido'), BASE_PATH: '/ok/', SITE_URL: 'https://ej.es' });
});

describe('páginas', () => {
  it('portada: módulos activos y últimos cambios', () => {
    const h = leer('index.html');
    expect(h).toContain('Administración de sistemas operativos');
    expect(h).toContain('Sistemas operativos monopuesto');
    expect(h).not.toContain('Servicios de red e internet');
    expect(h).toContain('Últimos cambios');
  });

  it('portada: tarjetas por categoría con su icono', () => {
    const h = leer('index.html');
    expect(h).toMatch(/<li class="tarjeta cat-asir"[\s\S]*?<svg[^>]*aria-hidden="true"[\s\S]*?ASIR/);
    expect(h).toMatch(/<li class="tarjeta cat-smr"/);
  });

  it('botón de tema: solo «Modo oscuro» / «Modo claro»', () => {
    const h = leer('index.html');
    expect(h).toContain('class="tema-boton"');
    expect(h).toMatch(/<span class="tema-a-oscuro">Modo oscuro<\/span>/);
    expect(h).toMatch(/<span class="tema-a-claro">Modo claro<\/span>/);
    expect(h).toContain('aria-label="Cambiar a modo oscuro"');
    expect(h).not.toMatch(/Paladín|Caballero/);
    // El tema se aplica antes de pintar: script en línea en <head>.
    expect(h).toMatch(/<head>[\s\S]*data-tema[\s\S]*<\/head>/);
  });

  it('módulo: franja de su categoría', () => {
    expect(leer('aso/index.html')).toMatch(/class="franja-modulo cat-asir"/);
  });

  it('módulo: unidades con fecha y PDF', () => {
    const h = leer('aso/index.html');
    expect(h).toContain('Gestión de procesos');
    expect(h).toMatch(/class="fecha[ "]/);
    expect(h).toContain('href="/ok/pdf/aso-ut1.pdf"');
  });

  it('unidad: piezas en orden, índice y licencias', () => {
    const h = leer('aso/ut1/index.html');
    const i1 = h.indexOf('id="procesos-concepto"');
    const i2 = h.indexOf('id="procesos-estados"');
    expect(i1).toBeGreaterThan(0);
    expect(i2).toBeGreaterThan(i1);
    expect(h).not.toContain('id="procesos-linux"'); // borrador
    expect(h).toContain('href="#procesos-estados"');
    expect(h).toContain('Licencias y fuentes');
    expect(h).toContain('CC BY-SA 4.0');
    expect(h).toContain('Stallings, Operating Systems');
    expect(h).toContain('Usuario «Ehamberg», Wikimedia Commons');
    expect(h).toContain('href="#procesos-concepto"'); // enlace wiki dentro de la unidad
  });

  describe('teoría y casos', () => {
    const tarjetas = (h: string) => h.slice(h.indexOf('class="casos"'));

    it('la unidad muestra la teoría y las tarjetas de casos en orden', () => {
      const h = leer('aso/ut1/index.html');
      expect(h).not.toContain('id="caso-ldap"'); // el caso no se renderiza como teoría
      const t = tarjetas(h);
      expect(t).toContain('Casos prácticos');
      expect(t.indexOf('/ok/aso/ut1/casos/caso-ldap/')).toBeGreaterThan(0);
      expect(t.indexOf('/ok/aso/ut1/casos/caso-sin-imagenes/')).toBeGreaterThan(t.indexOf('/ok/aso/ut1/casos/caso-ldap/'));
      expect(t).toContain('2 h');
      expect(t).toContain('1,5 h');
      expect(t).toContain('Directorio para Elpis');
      expect(t).toMatch(/class="fecha/);
      expect(t).toMatch(/<img[^>]*-portada\.png/);
      expect(t).toMatch(/imagen-generica[^"]*cat-asir/);
      expect(h).not.toContain('caso-borrador');
    });

    it('la unidad enlaza su PDF de teoría y lista los casos para imprimir', () => {
      const h = leer('aso/ut1/index.html');
      expect(h).toMatch(/href="\/ok\/pdf\/aso-ut1\.pdf"[^>]*>PDF de teoría/);
      const imp = h.slice(h.indexOf('class="solo-impresion'));
      expect(imp).toContain('Casos prácticos de esta unidad');
      expect(imp).toContain('https://ej.es/ok/aso/ut1/casos/caso-ldap/');
      expect(imp).toContain('https://ej.es/ok/pdf/aso-ut1/caso-ldap.pdf');
    });

    it('el índice impreso enlaza la lista de casos que sí se imprime', () => {
      const h = leer('aso/ut1/index.html');
      expect(h).toMatch(/<li class="[^"]*solo-impresion[^"]*"><a href="#casos-de-esta-unidad"/);
      expect(h).toMatch(/<li class="[^"]*solo-pantalla[^"]*"><a href="#casos-practicos"/);
      expect(h).toContain('id="casos-de-esta-unidad"');
    });

    it('los créditos de la unidad no atribuyen la licencia del texto de un caso', () => {
      const h = leer('aso/ut1/index.html');
      const lic = h.slice(h.indexOf('id="licencias-y-fuentes"'), h.indexOf('id="casos-de-esta-unidad"'));
      expect(lic).not.toMatch(/<li>«Caso LDAP en Elpis»:/); // la licencia del texto del caso no va en la unidad
      expect(lic).toContain('Autora portada'); // la portada sí se acredita
      expect(leer('aso/ut1/casos/caso-ldap/index.html')).toMatch(/<li>«Caso LDAP en Elpis»: <a[^>]*>CC BY 4\.0/);
    });

    it('una unidad solo con casos no tiene PDF de teoría ni botón de índice', () => {
      const h = leer('aso/ut2/index.html');
      expect(h).not.toContain('PDF de teoría');
      expect(h).not.toContain('indice-boton');
      expect(h).toContain('/ok/aso/ut2/casos/caso-solo/');
    });

    it('página del caso: banner, datos, PDF, licencias e índice', () => {
      const h = leer('aso/ut1/casos/caso-ldap/index.html');
      expect(h).toMatch(/class="banner[^"]*"[\s\S]*?-cabecera\.png/);
      expect(h).toContain('Caso práctico');
      expect(h).toContain('2 h');
      expect(h).toMatch(/href="\/ok\/pdf\/aso-ut1\/caso-ldap\.pdf"[^>]*>PDF del caso/);
      expect(h).toContain('Autora portada');
      expect(h).toContain('Autora cabecera');
      expect(h).toContain('href="/ok/aso/"');
      expect(h).toContain('href="/ok/aso/ut1/"');
      expect(h).toContain('href="#caso-ldap--tareas"'); // segundo nivel en el índice del caso
      expect(h).toContain('href="https://ej.es/ok/aso/ut1/#procesos-concepto"'); // enlace a la teoría
    });

    it('apuntes de un caso: banner, duración y genérica según su primer módulo', () => {
      expect(leer('apuntes/caso-ldap/index.html')).toMatch(/class="banner[\s\S]*?2 h/);
      expect(leer('apuntes/caso-sin-imagenes/index.html')).toMatch(/imagen-generica[^"]*cat-asir/);
    });

    it('índice de la unidad y botón accesible oculto sin JavaScript', () => {
      const h = leer('aso/ut1/index.html');
      const nav = h.slice(h.indexOf('<nav class="indice" id="indice"'));
      expect(nav).toContain('href="#procesos-concepto"');
      expect(nav).toContain('href="#procesos-concepto--que-es-un-proceso"');
      expect(h).toMatch(/<button class="indice-boton"[^>]*hidden[^>]*>/);
      expect(h).toMatch(/<button class="indice-boton"[^>]*aria-expanded="false"/);
      expect(h).toMatch(/<button class="indice-boton"[^>]*aria-controls="indice"/);
    });
  });

  it('pieza: aparece en', () => {
    const h = leer('apuntes/procesos-concepto/index.html');
    expect(h).toContain('Aparece en');
    expect(h).toContain('href="/ok/aso/ut1/"');
    expect(h).toContain('href="/ok/som/ut3/"');
  });

  it('las piezas sueltas también se publican', () => {
    expect(leer('apuntes/suelta/index.html')).toContain('Pieza suelta');
  });

  it('licencias del sitio', () => {
    const h = leer('licencias/index.html');
    expect(h).toContain('Usuario «Ehamberg», Wikimedia Commons');
    expect(h).toContain('JetBrains Mono');
    expect(h).toContain('SIL Open Font License 1.1');
  });

  it('las imágenes se publican', () => {
    const src = /src="\/ok\/(img\/[0-9a-f]{8}-cpu\.png)"/.exec(leer('aso/ut1/index.html'))![1];
    expect(readFileSync(join(dist, src)).subarray(1, 4).toString()).toBe('PNG');
  });

  it('solo publica las imágenes que usa alguna pieza publicada', () => {
    const publicadas = readdirSync(join(dist, 'img'));
    expect(publicadas.some((n) => n.endsWith('-cpu.png'))).toBe(true);
    expect(publicadas.some((n) => n.includes('huerfana'))).toBe(false);
  });

  it('todas las páginas llevan el pie de licencia', () => {
    for (const r of ['index.html', 'aso/index.html', 'aso/ut1/index.html', 'apuntes/suelta/index.html', 'licencias/index.html']) {
      expect(leer(r)).toContain(PIE);
    }
  });

  it('manifiesto de PDFs: unidades con teoría y casos publicados', () => {
    const m = JSON.parse(leer('pdf-manifest.json'));
    expect(m).toEqual([
      { tipo: 'unidad', modulo: 'aso', unidad: 'ut1', ruta: '/ok/aso/ut1/', salida: 'pdf/aso-ut1.pdf', pie: 'ASO · UT1' },
      { tipo: 'caso', modulo: 'aso', unidad: 'ut1', caso: 'caso-ldap', ruta: '/ok/aso/ut1/casos/caso-ldap/', salida: 'pdf/aso-ut1/caso-ldap.pdf', pie: 'ASO · UT1 · Caso práctico' },
      { tipo: 'caso', modulo: 'aso', unidad: 'ut1', caso: 'caso-sin-imagenes', ruta: '/ok/aso/ut1/casos/caso-sin-imagenes/', salida: 'pdf/aso-ut1/caso-sin-imagenes.pdf', pie: 'ASO · UT1 · Caso práctico' },
      { tipo: 'caso', modulo: 'aso', unidad: 'ut2', caso: 'caso-solo', ruta: '/ok/aso/ut2/casos/caso-solo/', salida: 'pdf/aso-ut2/caso-solo.pdf', pie: 'ASO · UT2 · Caso práctico' },
      { tipo: 'unidad', modulo: 'som', unidad: 'ut3', ruta: '/ok/som/ut3/', salida: 'pdf/som-ut3.pdf', pie: 'SOM · UT3' },
    ]);
  });
});

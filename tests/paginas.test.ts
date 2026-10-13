import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { construir } from './util';

// Pie de licencia de Creative Commons (enlaces y nombre exactos).
const PIE =
  '<a href="https://ej.es/ok/">Onyon Knight</a> © 2026 de <a href="https://github.com/kohee-dev">Alejandro Bartolomé Fernández</a> está bajo licencia <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a>';
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
    expect(h).toContain('CC BY-NC-SA 4.0');
    expect(h).toContain('Stallings, Operating Systems');
    expect(h).toContain('Usuario «Ehamberg», Wikimedia Commons');
    expect(h).toContain('href="#procesos-concepto"'); // enlace wiki dentro de la unidad
  });

  describe('cabecera, menú y pie', () => {
    const paginas = ['index.html', 'aso/index.html', 'aso/ut1/index.html', 'aso/ut1/casos/caso-ldap/index.html', 'apuntes/suelta/index.html', 'licencias/index.html'];

    it.each(paginas)('%s: menú, botón de menú y botón de modo en cabecera y menú', (r) => {
      const h = leer(r);
      expect(h).toMatch(/<button class="menu-boton"[^>]*aria-controls="menu"[^>]*aria-label="Abrir el menú"/);
      const cabecera = h.slice(h.indexOf('<header class="cabecera"'), h.indexOf('</header>'));
      expect(cabecera).toContain('class="tema-boton"');
      expect(cabecera).not.toContain('Licencias');
      const menu = h.slice(h.indexOf('id="menu"'));
      expect(menu.slice(0, menu.indexOf('</nav>'))).toContain('class="tema-boton"');
    });

    it.each(paginas)('%s: «Licencias y fuentes» en el pie', (r) => {
      const h = leer(r);
      const pie = h.slice(h.indexOf('<footer class="pie"'));
      expect(pie).toContain('href="/ok/licencias/"');
      expect(pie).toContain('Licencias y fuentes');
    });

    it('desplegable de módulos con los módulos publicados', () => {
      const h = leer('aso/ut1/index.html');
      const cab = h.slice(h.indexOf('<header class="cabecera"'), h.indexOf('</header>'));
      expect(cab).toMatch(/<button class="modulos-boton"[^>]*aria-expanded="false"[^>]*aria-controls="lista-modulos"[^>]*hidden/);
      const lista = cab.slice(cab.indexOf('id="lista-modulos"'));
      expect(lista).toContain('href="/ok/aso/"');
      expect(lista).toContain('href="/ok/som/"');
      expect(lista).not.toContain('/ok/sri/'); // inactivo
      expect(lista).not.toContain('/ok/rds/'); // solo borradores
      expect(lista).toMatch(/<a[^>]*href="\/ok\/aso\/"[^>]*aria-current="page"/);
      // Secciones por ciclo, en orden GB → SMR → ASIR → DAM, cada lista ligada a su cabecera.
      const smr = lista.indexOf('SMR · Sistemas Microinformáticos y Redes');
      const asir = lista.indexOf('ASIR · Administración de Sistemas Informáticos en Red');
      expect(smr).toBeGreaterThan(0);
      expect(lista.indexOf('href="/ok/som/"')).toBeGreaterThan(smr);
      expect(asir).toBeGreaterThan(lista.indexOf('href="/ok/som/"'));
      expect(lista.indexOf('href="/ok/aso/"')).toBeGreaterThan(asir);
      expect(lista).not.toContain('Grado Básico ·'); // sin módulos publicados (rds solo tiene borradores)
      expect(lista).toMatch(/<p class="modulos-seccion cat-asir" id="cab-asir">[\s\S]*?<ul aria-labelledby="cab-asir">/);
      expect(lista).not.toMatch(/<a[^>]*href="\/ok\/som\/"[^>]*aria-current/);
      const menu = h.slice(h.indexOf('id="menu"'), h.indexOf('</nav>', h.indexOf('id="menu"')));
      expect(menu).toContain('class="menu-modulos"');
      expect(menu).toContain('href="/ok/som/"');
      expect(menu).toContain('id="menu-cab-asir"'); // ids distintos de los de la cabecera
    });

    it('un módulo sin unidades publicadas no aparece ni se publica', () => {
      expect(leer('index.html')).not.toContain('Redes solo en borrador');
      expect(existsSync(join(dist, 'rds/index.html'))).toBe(false);
    });

    it('las tablas van en un contenedor desplazable y accesible', () => {
      expect(leer('aso/ut1/index.html')).toMatch(/<div class="tabla-desplazable" tabindex="0" role="region" aria-label="Tabla"><table>/);
    });

    it.each([
      ['aso/ut1/index.html', true],
      ['aso/ut1/casos/caso-ldap/index.html', true],
      ['apuntes/suelta/index.html', true],
      ['index.html', false],
      ['aso/index.html', false],
      ['licencias/index.html', false],
    ])('barra de progreso en %s: %s', (r, si) => {
      expect(leer(r).includes('class="progreso"')).toBe(si);
    });

    it('las tarjetas no repiten el título en la imagen', () => {
      const t = leer('aso/ut1/index.html').split('class="casos"')[1];
      expect(t).toMatch(/<img class="imagen-caso[^"]*"[^>]*\balt(="")?[\s>]/); // `alt` vacío (Astro lo escribe sin valor)
      expect(t).not.toMatch(/<img class="imagen-caso[^"]*"[^>]*alt="[^"]/);
      expect(t).toMatch(/class="imagen-generica[^"]*"[^>]*aria-hidden="true"/);
      expect(t).not.toMatch(/class="imagen-generica[^"]*"[^>]*role="img"/);
    });

    it('la página del caso no salta de h1 a h3', () => {
      expect(leer('aso/ut1/casos/caso-ldap/index.html')).toMatch(/<h2 id="caso-ldap--escenario"/);
    });
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
      // El caso es su única pieza: su licencia es la del texto de la página.
      expect(leer('aso/ut1/casos/caso-ldap/index.html')).toMatch(/Texto: © Alejandro Bartolomé Fernández, bajo licencia <a[^>]*>CC BY 4\.0<\/a>/);
    });

    it('una unidad solo con casos no tiene PDF de teoría ni botón de índice', () => {
      const h = leer('aso/ut2/index.html');
      expect(h).not.toContain('PDF de teoría');
      expect(h).not.toMatch(/class="menu-indice"/);
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
      const nav = h.slice(h.indexOf('id="menu"'));
      expect(nav).toContain('href="#procesos-concepto"');
      expect(nav).toContain('href="#procesos-concepto--que-es-un-proceso"');
      expect(h).toMatch(/<button class="menu-boton"[^>]*hidden[^>]*>/);
      expect(h).toMatch(/<button class="menu-boton"[^>]*aria-expanded="false"/);
      expect(h).toMatch(/<button class="menu-boton"[^>]*aria-controls="menu"/);
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

  it('el logo lleva la ilustración del caballero, decorativa y acreditada', () => {
    const h = leer('index.html');
    expect(h).toMatch(/<a class="marca" href="\/ok\/"><img class="marca-imagen" src="\/ok\/img\/caballero-96\.webp" srcset="\/ok\/img\/caballero-192\.webp 2x" alt="" width="122" height="96"[^>]*><span>Onyon Knight<\/span><\/a>/);
    expect(existsSync(join(dist, 'img', 'caballero-96.webp'))).toBe(true);
    expect(existsSync(join(dist, 'img', 'caballero-192.webp'))).toBe(true);
    expect(leer('licencias/index.html')).toContain('Caballero junto a la hoguera');
  });

  it('los iconos de la licencia se sirven desde el propio sitio', () => {
    const h = leer('index.html');
    for (const i of ['cc', 'by', 'nc', 'sa']) {
      expect(h).toContain(`src="/ok/cc/${i}.svg"`);
      expect(existsSync(join(dist, 'cc', `${i}.svg`))).toBe(true);
    }
    expect(h).not.toContain('mirrors.creativecommons.org');
    expect(leer('licencias/index.html')).toContain('Iconos de licencia Creative Commons');
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

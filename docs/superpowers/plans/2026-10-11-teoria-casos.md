# Teoría y casos prácticos — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Separar en cada unidad la teoría (página con índice lateral o panel) de los casos prácticos (tarjetas con portada, página con banner y PDF propio), con imagen genérica mientras falten las imágenes.

**Architecture:**
- Un caso es una pieza con `tipo: caso` en su cabecera, con `horas`, `portada` y `cabecera`.
- `renderizarPieza` valida sus imágenes, igual que las del texto, y devuelve los títulos para el índice.
- `cargarSitio` reparte cada unidad en `teoria` y `casos`.
- Las páginas, el manifiesto de PDFs y el índice se construyen sobre ese reparto. `scripts/pdf.mjs` no cambia de lógica.

**Tech Stack:** el del núcleo (Astro 7.3.8, unified, Vitest 5, Playwright 1.64). No se añaden dependencias.

**Spec:** `docs/superpowers/specs/2026-10-11-teoria-casos-design.md` (amplía `…/2026-10-11-web-docente-nucleo-design.md`)

## Global Constraints

- Textos de la interfaz, literales:
  - «Caso práctico», «Casos prácticos», «PDF de teoría», «PDF del caso», «Índice»;
  - «Casos prácticos de esta unidad» (página final del PDF de teoría);
  - duración como «6 h» / «1,5 h» (`Intl.NumberFormat('es-ES')`).
- Rutas:
  - caso: `${base}<m>/<u>/casos/<id>/`;
  - PDF de teoría: `${base}pdf/<m>-<u>.pdf`;
  - PDF del caso: `${base}pdf/<m>-<u>/<id>.pdf`.
- Proporciones: portada 16:9, cabecera 16:5 (`aspect-ratio` + `object-fit: cover`).
- Pie del PDF del caso: «<M> · <U> · Caso práctico · página X de Y».
- Avisos, literales y sin duplicados: `caso sin portada: <id>` y `caso sin cabecera: <id>`.
- El índice es lateral fijo desde `min-width: 1280px`. Por debajo, un botón «Índice» en la cabecera abre un panel; sin JS, el botón queda `hidden` y el índice se ve como bloque.
- Todos los cambios de cabecera son estrictos, como en el núcleo: un campo indebido es un error con archivo y campo.

## Review Focus

1. **Caso en borrador:** al publicar no tiene tarjeta, página, PDF ni entrada en el manifiesto, y su portada no se publica. → Prueba en la Task 4.
2. **Unidad solo con casos:** sin botón ni PDF de teoría, sin entrada `unidad` en el manifiesto y sin botón «Índice». → Pruebas en las Tasks 4 y 6.
3. **La misma imagen como portada y dentro del texto:** aparece una sola vez en los créditos y se publica una sola vez. → Prueba en la Task 2.
4. **Enlaces desde la página de un caso:**
   - a sí mismo → ancla;
   - a la teoría de su unidad → `…/<m>/<u>/#<id>`;
   - a otro caso de la unidad → su página.

   → Pruebas en la Task 3.
5. **Sin JavaScript:** el botón «Índice» lleva `hidden` en el HTML y el índice está en el documento como `<nav>` normal. → Prueba en la Task 6.

---

## Estructura de archivos

```
src/lib/esquemas.ts                 + tipo, horas, portada, cabecera (y sus reglas)
src/lib/markdown/imagenes.ts        extrae resolverImagen() reutilizable
src/lib/markdown/index.ts           PiezaRenderizada + portada, cabecera, titulos
src/lib/markdown/encabezados.ts     recoge titulos para el índice
src/lib/markdown/enlaces.ts         resolución con teoria/casos de la unidad
src/lib/sitio.ts                    UnidadSitio.teoria / .casos; CasoSitio
src/components/ImagenCaso.astro     imagen real o genérica (categoría + icono)
src/components/TarjetaCaso.astro
src/components/Indice.astro         índice lateral / panel + botón
src/pages/[modulo]/[unidad]/index.astro            teoría + tarjetas + página final del PDF
src/pages/[modulo]/[unidad]/casos/[caso]/index.astro
src/pages/apuntes/[pieza].astro     banner y duración en casos
src/pages/pdf-manifest.json.ts      entradas unidad y caso
src/layouts/Base.astro              slot para el botón «Índice» en la cabecera
src/styles/global.css · print.css
tests/fixtures/valido/…             casos de prueba (con y sin imágenes, borrador, unidad solo con casos)
contenido/piezas/aso/…              migración de los 5 casos
```

---

### Task 1: Cabecera de caso en el esquema

**Files:**
- Modify: `src/lib/esquemas.ts`
- Test: `tests/catalogo.test.ts` (bloque `esquemas`)

**Interfaces:**
- Produces: `CabeceraPieza` gana `tipo: 'teoria' | 'caso'` (por defecto `'teoria'`), `horas?: number`, `portada?: string` y `cabecera?: string`.

- [ ] **Step 1: Pruebas que fallan**, con `esquemaPieza.safeParse`:
  - `{ titulo: 'x' }` → `tipo === 'teoria'`.
  - `{ titulo: 'x', tipo: 'caso', horas: 1.5 }` → válido.
  - `tipo: 'borrador'` → falla, con un mensaje que contiene `teoria` y `caso`.
  - `tipo: 'caso'` sin `horas` → falla, con un problema en `horas`.
  - `horas: 0` → falla.
  - `{ titulo: 'x', horas: 2 }` (teoría) → falla, con un mensaje que contiene `solo en casos`. Lo mismo con `portada` y con `cabecera`.
- [ ] **Step 2:** `npx vitest run tests/catalogo.test.ts` → FAIL.
- [ ] **Step 3:** Implementa en `esquemaPieza`:
  - `tipo: z.enum(['teoria','caso']).default('teoria')`;
  - `horas: z.number().positive().optional()`;
  - `portada` y `cabecera`: `z.string().min(1).optional()`;
  - un `superRefine` para las reglas cruzadas (horas obligatoria en el caso; los tres campos, prohibidos en la teoría), con el `path` del campo.
- [ ] **Step 4:** Ejecuta → PASS. `npm test` también pasa, porque los fixtures existentes son teoría.
- [ ] **Step 5:** Commit: `feat: tipo, horas, portada y cabecera en la cabecera de la pieza`.

### Task 2: Imágenes de portada y cabecera en el render

**Files:**
- Modify: `src/lib/markdown/imagenes.ts`, `src/lib/markdown/index.ts`
- Test: `tests/imagenes.test.ts`. Fixtures: en `tests/fixtures/img/img/`, `portada.png` y `cabecera.png` con su ficha, y `sin-ficha.png`, que ya existe.

**Interfaces:**
- Consumes: `validarFicha` y `urlImagen` (núcleo).
- Produces:
  ```ts
  // imagenes.ts
  export function resolverImagen(url: string, alt: string, ctx: { rutaPieza: string; archivo: string; base: string }): ImagenUsada  // lanza ErrorContenido (remota, inexistente, sin ficha, ficha inválida)
  // index.ts
  export interface PiezaRenderizada { id; html; imagenes; tieneMermaid; portada?: ImagenUsada; cabecera?: ImagenUsada; titulos: Titulo[] }
  ```
  `titulos` se rellena en la Task 5. Por ahora es `[]`.

- [ ] **Step 1: Pruebas que fallan**, con una pieza `tipo: caso` cuya `rutaAbs` es `tests/fixtures/img/pieza.md`:
  - `portada: ./img/portada.png` → `r.portada.url` termina en `-portada.png`, `r.portada.ficha.autor` es correcto y `r.imagenes` incluye la portada.
  - `cabecera: ./img/no.png` → error con `a.md`, el campo `cabecera` y `imagen inexistente`.
  - `portada: ./img/sin-ficha.png` → error que nombra `sin-ficha.yml`.
  - `portada: https://x/y.png` → error `imagen remota no permitida`.
  - Caso sin `portada` → `r.portada === undefined` y `ctx.catalogo.avisos` contiene `caso sin portada: a`. Renderizar dos veces no duplica el aviso.
  - La misma imagen como portada y como `![x](./img/portada.png)` en el cuerpo → `creditosDe([…]).recursos` tiene una sola entrada (Review Focus 3).
- [ ] **Step 2:** Ejecuta → FAIL.
- [ ] **Step 3:** Extrae de `figuraDe` la lógica de validación a `resolverImagen`, para que `figuraDe` la use. `renderizarPieza`, si `tipo === 'caso'`, resuelve `portada` y `cabecera`:
  - los errores se reúnen con los del cuerpo, con la línea de la cabecera;
  - si falta alguna, añade el aviso a `ctx.catalogo.avisos` solo si no está ya.
- [ ] **Step 4:** Ejecuta `npm test` → PASS.
- [ ] **Step 5:** Commit: `feat: portada y cabecera de los casos con ficha obligatoria`.

### Task 3: Enlaces con teoría y casos de la unidad

**Files:**
- Modify: `src/lib/markdown/index.ts` (`ContextoRender`), `src/lib/markdown/enlaces.ts`, `src/lib/sitio.ts` (construcción de contextos)
- Test: `tests/enlaces.test.ts`; actualiza `tests/util-md.ts`

**Interfaces:**
- Produces:
  ```ts
  unidad?: {
    modulo: string; id: string
    piezas: Set<string>   // renderizadas en ESTA página → ancla #id
    teoria: Set<string>   // teoría de la unidad → `${sitio}${base}<m>/<u>/#id`
    casos: Set<string>    // casos de la unidad → `${sitio}${base}<m>/<u>/casos/<id>/`
  }
  ```
  `contexto(piezas, { unidad, teoria, casos })` en `util-md.ts`. Por defecto, `teoria` = `unidad` y `casos` = vacío.

- [ ] **Step 1: Pruebas que fallan** (Review Focus 4):
  - En la página de la unidad (`piezas = teoria = {a}`, `casos = {c}`), `[[c]]` → `href="https://ej.es/ok/aso/ut1/casos/c/"`.
  - En la página del caso (`piezas = {c}`, `teoria = {a}`, `casos = {c, d}`):
    - `[[c]]` → `#c`;
    - `[[a]]` → `https://ej.es/ok/aso/ut1/#a`;
    - `[[d]]` → `https://ej.es/ok/aso/ut1/casos/d/`.
  - Las pruebas existentes siguen pasando.
- [ ] **Step 2:** Ejecuta → FAIL.
- [ ] **Step 3:** Implementa la resolución en ese orden de prioridad (`piezas`, `teoria`, `casos`; si no, `/apuntes/`). En `sitio.ts`, la unidad se renderiza con `piezas = teoria`.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit: `feat: enlaces wiki a la teoría y a los casos de la unidad`.

### Task 4: Reparto de teoría y casos en el sitio y el manifiesto

**Files:**
- Modify: `src/lib/sitio.ts`, `src/pages/pdf-manifest.json.ts`, `src/pages/[modulo]/index.astro` y `src/pages/[modulo]/[unidad]/index.astro` (solo para que compilen con los campos nuevos: `teoria` en lugar de `piezas`)
- Fixtures (`tests/fixtures/valido/`):
  - caso `caso-ldap`: `horas: 2`, con portada y cabecera, en ASO UT1;
  - caso `caso-sin-imagenes`: `horas: 1.5`, en ASO UT1;
  - caso `caso-borrador`, en borrador, en ASO UT1;
  - unidad `ut2` de ASO **solo** con el caso `caso-solo`.
- Test: `tests/paginas.test.ts` (manifiesto)

**Interfaces:**
- Produces:
  ```ts
  export interface CasoSitio { pieza: PiezaEnUnidad; url: string; urlPdf: string; salidaPdf: string; pie: string; creditos: Creditos }
  export interface UnidadSitio { modulo; id; titulo; teoria: PiezaEnUnidad[]; casos: CasoSitio[]; fecha; creditos /* teoría + portadas */; url; urlPdf: string | null; salidaPdf: string | null; pie }
  ```
  Manifiesto:
  ```
  [{ tipo: 'unidad'|'caso', modulo, unidad, caso?: string, ruta, salida, pie }]
  ```
  - `pie` de la unidad: `ASO · UT1`.
  - `pie` del caso: `ASO · UT1 · Caso práctico`.
  - `salida` del caso: `pdf/aso-ut1/caso-ldap.pdf`.

- [ ] **Step 1: Prueba que falla:** el manifiesto del fixture es exactamente la lista esperada:
  - unidades `aso/ut1` y `som/ut3`, **pero no `aso/ut2`**;
  - casos `aso/ut1/caso-ldap`, `aso/ut1/caso-sin-imagenes` y `aso/ut2/caso-solo`, **pero no `caso-borrador`**;
  - cada entrada con su ruta y su salida (Review Focus 1 y 2).
- [ ] **Step 2:** Ejecuta → FAIL.
- [ ] **Step 3:** Implementa el reparto en `construirSitio`:
  - cada caso de la unidad se renderiza en su propio contexto (Task 3);
  - `urlPdf` y `salidaPdf` son `null` si `teoria` está vacía;
  - `creditos` de la unidad = `creditosDe(teoria + portadas de los casos)`;
  - la fecha de la unidad incluye la de los casos;
  - `ultimosCambios` lleva al caso a la URL de su primera unidad.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit: `feat: unidades con teoría y casos; manifiesto de PDFs de casos`.

### Task 5: Títulos para el índice

**Files:**
- Modify: `src/lib/markdown/encabezados.ts`, `src/lib/markdown/index.ts`
- Test: `tests/markdown.test.ts`

**Interfaces:**
- Produces: `export interface Titulo { id: string; texto: string; nivel: number }` (`nivel` = el relativo, 1 = `titulo-1`). `PiezaRenderizada.titulos`.

- [ ] **Step 1: Prueba que falla:** `# A\n\n## B\n\n### C` en la pieza `p` → `titulos` = `[{ id: 'p--a', texto: 'A', nivel: 1 }, { id: 'p--b', texto: 'B', nivel: 2 }, { id: 'p--c', texto: 'C', nivel: 3 }]`.
- [ ] **Step 2:** Ejecuta → FAIL. **Step 3:** El plugin de encabezados añade cada título a `estado(file).titulos`. **Step 4:** PASS.
- [ ] **Step 5:** Commit: `feat: títulos de cada pieza para el índice`.

### Task 6: Páginas, tarjetas, imagen genérica e índice

**Files:**
- Create: `src/components/ImagenCaso.astro`, `TarjetaCaso.astro` e `Indice.astro`; `src/pages/[modulo]/[unidad]/casos/[caso]/index.astro`
- Modify:
  - `src/pages/[modulo]/[unidad]/index.astro`, `src/pages/apuntes/[pieza].astro` y `src/pages/[modulo]/index.astro` (sin botón de PDF si `urlPdf` es `null`);
  - `src/layouts/Base.astro`, que gana un slot `cabecera-extra` en la `nav`, antes del botón de modo;
  - `src/styles/global.css` y `src/styles/print.css`.
- Test: `tests/paginas.test.ts`

**Interfaces:**
- Consumes: `UnidadSitio`/`CasoSitio` (Task 4), `Titulo` (Task 5), `categoriaDe` y `svgIcono` (existentes).
- `ImagenCaso` props: `{ imagen?: ImagenUsada; modulo: ModuloFuente; proporcion: 'portada' | 'cabecera' }`.
  - Con imagen: `<img>`.
  - Sin imagen: `<div class="imagen-generica cat-<x>" role="img" aria-label="<título del caso>">` con el SVG del icono del módulo, sobre `var(--cat-fondo)`.
- `Indice` props: `{ entradas: { id: string; texto: string; nivel: number }[] }`. Renderiza:
  - `<nav class="indice" id="indice">`;
  - el botón `<button class="indice-boton" hidden aria-expanded="false" aria-controls="indice">` en el slot `cabecera-extra`.

- [ ] **Step 1: Pruebas que fallan** (build del fixture):
  - **Unidad `aso/ut1/`:**
    - tiene las secciones de teoría y una sección «Casos prácticos» con tarjetas `caso-ldap` y `caso-sin-imagenes`, en el orden del índice;
    - cada tarjeta enlaza a `/ok/aso/ut1/casos/<id>/`, muestra «2 h» / «1,5 h», lleva un `<time` o «Sin publicar» y, si lo tiene, el `resumen` (el fixture `caso-ldap` tiene `resumen: Directorio para Elpis`);
    - la de `caso-ldap` lleva `<img` con `-portada.png`; la de `caso-sin-imagenes` lleva `class="imagen-generica cat-asir"`;
    - no aparece `caso-borrador`;
    - el botón `PDF de teoría` apunta a `/ok/pdf/aso-ut1.pdf`;
    - en la versión impresa (`.solo-impresion`) está el bloque «Casos prácticos de esta unidad», con las URL absolutas de cada caso y de su PDF.
  - **Unidad `aso/ut2/`:** no tiene `PDF de teoría` ni `indice-boton` (Review Focus 2).
  - **Página `aso/ut1/casos/caso-ldap/`:** banner con `-cabecera.png`, «Caso práctico», «2 h», `PDF del caso` → `/ok/pdf/aso-ut1/caso-ldap.pdf`, *Licencias y fuentes* con el autor de la portada y de la cabecera, y migas hacia `/ok/aso/` y `/ok/aso/ut1/`.
  - **Página `apuntes/caso-ldap/`:** banner y duración. La imagen genérica de `apuntes/caso-sin-imagenes/` usa la categoría del módulo de su primera aparición (`cat-asir`).
  - **Índice de la página del caso:** incluye los títulos `titulo-1` y `titulo-2` del caso; en la unidad solo `titulo-1`.
  - **Índice:**
    - la unidad tiene `<nav class="indice" id="indice">` con enlaces a `#procesos-concepto` y a sus `titulo-1`;
    - el botón tiene `hidden`, `aria-expanded="false"` y `aria-controls="indice"` (Review Focus 5).
- [ ] **Step 2:** Ejecuta → FAIL.
- [ ] **Step 3: Implementa** las páginas y los componentes de la spec §4. Lo que el implementador decide aquí:
  - **Scrollspy:** `IntersectionObserver` sobre los `id` del índice, con `rootMargin: '0px 0px -70% 0px'`; la entrada activa lleva la clase `activa`.
  - **Panel** (por debajo de 1280 px): el script quita `hidden` al botón. Al pulsarlo, el `nav` pasa a `.indice-abierto` (fijo a la derecha, ancho `min(20rem, 85vw)`, con una capa que cierra al tocarla), el foco va al primer enlace y `aria-expanded` cambia. `Esc`, el botón de cerrar o un clic en un enlace lo cierran y devuelven el foco al botón.
  - **Lateral** (desde 1280 px): `position: fixed; right: max(1rem, calc((100vw - 72ch) / 2 - 15rem)); width: 13rem`, con `border-left: 1px solid var(--oro)` y la entrada activa en `var(--acento)`.
  - **Impresión:** el botón y el panel se ocultan con `display: none`; `.solo-impresion` solo se ve al imprimir.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5: Comprobación visual** en `npm run dev` con `ONYON_CONTENIDO=tests/fixtures/valido`:
  - tarjetas y página del caso, en los dos modos, incluida la imagen genérica;
  - escritorio a 1440 px, con el índice lateral y su resaltado al desplazarse;
  - móvil a 375 px: panel que abre y cierra, cierre con `Esc` y sin desplazamiento horizontal.
- [ ] **Step 6:** Commit: `feat: tarjetas de casos, página del caso e índice lateral`.

### Task 7: PDFs de los casos

**Files:**
- Modify: `src/pages/[modulo]/[unidad]/casos/[caso]/index.astro` (portada impresa), `src/styles/print.css`
- Test: `tests/pdf.test.ts`

- [ ] **Step 1: Pruebas que fallan:**
  - Existe `dist/pdf/aso-ut1/caso-ldap.pdf`. Su texto contiene el título del caso, «Caso práctico», «2 h», «Licencias y fuentes» y «ASO · UT1 · Caso práctico», y no contiene `127.0.0.1`.
  - Existe `dist/pdf/aso-ut2/caso-solo.pdf`; **no** existe `dist/pdf/aso-ut2.pdf`.
  - El texto de `aso-ut1.pdf` contiene «Casos prácticos de esta unidad» y la URL `https://ej.es/ok/aso/ut1/casos/caso-ldap/`.
  - Ajusta las cuentas de la prueba de caché, que pasan a ser 5 PDFs: 2 unidades y 3 casos. La segunda ejecución da `0 renderizados, 5 reutilizados`.
- [ ] **Step 2:** Ejecuta → FAIL.
- [ ] **Step 3:** Implementa la portada impresa del caso (spec §5.2):
  - imagen de cabecera arriba;
  - módulo, unidad, chip, título, duración, fecha y licencia;
  - franja `var(--cat-fondo)`.

  `pdf.mjs` no cambia si el manifiesto ya trae `salida` con subcarpeta: comprueba que crea el directorio (`mkdirSync(dirname(destino), { recursive: true })` ya existe).
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5: Comprobación visual:** abre `aso-ut1/caso-ldap.pdf` (portada y primera página) y la última página de `aso-ut1.pdf`.
- [ ] **Step 6:** Commit: `feat: PDF propio de cada caso`.

### Task 8: Migración de los casos y publicación

**Files:**
- Modify: las cabeceras de `contenido/piezas/aso/linux/opera-jidoor.md`, `aso/servicios-directorio/caso-servicios-directorio.md`, `aso/servicios-directorio/gatos-elpis.md`, `aso/procesos/procesos-sala-maquinas.md` y `aso/procesos/procesos-espectro.md`

- [ ] **Step 1:** Añade `tipo: caso` y las `horas` de la spec §7: 8, 2, 6, 4 y 9. En `caso-servicios-directorio.md`, sustituye `tipo: "borrador"` por `tipo: caso`.
- [ ] **Step 2:** `npm run build`:
  - termina sin errores;
  - los avisos son exactamente `caso sin portada`/`caso sin cabecera` de los 3 casos publicados, y los borradores ya conocidos;
  - en el resumen de PDFs, cada caso publicado tiene su PDF.
- [ ] **Step 3: Comprobación visual** con el contenido real: ASO UT1 (teoría con índice y tarjetas de Caso práctico y Gatos de Elpis) y la página de La Ópera de Jidoor (ASO UT0, solo con un caso).
- [ ] **Step 4:** `npm test`. Commit: `content: marca los casos prácticos de ASO`. Push y comprueba el despliegue en verde y las URL de un caso y de su PDF.

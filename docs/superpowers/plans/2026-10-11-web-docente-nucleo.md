# Onyon Knight · Núcleo de la web docente — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Web docente estática en Astro, con apuntes en piezas combinables, índices de módulo, fechas de git, licencias obligatorias y un PDF por unidad con caché por huella, publicando ASO y SOR en GitHub Pages antes del 2026-10-13.

**Architecture:**
- **Carga y validación.** Las content collections de Astro cargan y validan las cabeceras (Zod estricto).
- **Lógica de contenido.** Vive en funciones puras de `src/lib/`, que se prueban sin Astro: catálogo N:M, licencias, fechas y créditos.
- **Render del Markdown.** Las piezas se renderizan con un pipeline `unified` propio (`src/lib/markdown/`), que recibe el *contexto* de render (unidad o pieza suelta). Así los enlaces wiki se resuelven como ancla o como URL, y los errores incluyen la línea.
- **PDFs.** `scripts/pdf.mjs` imprime cada página de unidad con Playwright, con caché por huella del HTML y de sus recursos.

**Tech Stack:**
- Node ≥ 22.12 (local: 26) y Astro 7.3.8.
- Pipeline Markdown: unified 11, remark-parse 11, remark-gfm 4, remark-directive 4, remark-rehype 11, rehype-stringify 10, @shikijs/rehype 4, github-slugger 2 y js-yaml 5.
- Mermaid 12 (en el cliente).
- PDF: Playwright 1.64 y sirv 3.
- Pruebas: Vitest 5 y pdfjs-dist 6 (para leer los PDFs en las pruebas).
- Tipografías: @fontsource-variable/inter y @fontsource/jetbrains-mono.

**Spec:** `docs/superpowers/specs/2026-10-11-web-docente-nucleo-design.md`

## Global Constraints

- Idioma de la interfaz, los mensajes de error y los identificadores de dominio: **castellano** (`pieza`, `modulo`, `unidad`, `ficha`…).
- Licencia propia por defecto: `CC-BY-SA-4.0`. Pie de todas las páginas, literal: «© Alejandro Bartolomé · CC BY-SA 4.0, salvo indicación expresa».
- Id de pieza = nombre de archivo sin `.md`; id de módulo = nombre de archivo sin `.yml`; ids de unidad en formato slug (`^[a-z0-9]+(-[a-z0-9]+)*$`).
- Las cabeceras son **estrictas**: un campo desconocido es un error.
- Variables de entorno:
  - `ONYON_PRIVADO`: ruta de la carpeta privada. Solo se lee en `astro dev`; **`astro build` nunca carga contenido privado**, aunque la variable esté definida.
  - `BASE_PATH`: por defecto `/`; en Pages, `/<repo>/`, siempre con barra final.
  - `SITE_URL`: por defecto `http://localhost:4321`.
- Los errores de contenido detienen `astro dev` y `astro build`, y siempre indican `archivo` (ruta relativa al repo, o `privado:<ruta>`) y, cuando se conoce, la `línea`.
- URL del PDF: `${BASE_PATH}pdf/<modulo>-<unidad>.pdf`. Caché: `.cache/pdf/<huella>.pdf`. Tiempo máximo por página: 60 s. Concurrencia por defecto: 4.
- Formato de fecha visible: «Actualizado el 9 de octubre de 2026» (`Intl`, `es-ES`, zona `Europe/Madrid`), dentro de `<time datetime="ISO">`. Sin fecha: «Sin publicar».
- Clases de imagen permitidas: `pequena`, `mediana`, `completa`, `derecha`. Recuadros permitidos: `ejercicio`, `nota`, `aviso`, `tip`.

## Review Focus

1. **Texto con dos puntos en la prosa** (`chown root:root`, `C:\Windows`, `ldap:389`, `fe80::1`). `remark-directive` los interpreta como directivas de texto u hoja. Deben aparecer **literalmente**. → Prueba en la Task 4.
2. **Recuadros con la sintaxis antigua `::: nota`** (con espacio, o con espacio al final, como en el contenido real). Deben reconocerse igual que `:::nota`. Un `:::` sin cerrar debe dar error con la línea, no tragarse el resto del apunte. → Prueba en la Task 4.
3. **Enlaces del PDF.** El PDF se imprime desde `127.0.0.1`, pero no debe contener ninguna URL de `localhost` ni de `127.0.0.1`: los enlaces fuera de la unidad son absolutos con `SITE_URL`. → Prueba en las Tasks 5 y 10.
4. **`astro build` local con `ONYON_PRIVADO` definido.** No debe incluir nada privado en `dist/`. → Prueba en la Task 3.
5. **La misma pieza dos veces en una página** (aparece en dos unidades, o se enlaza a sí misma). Los ids HTML de los encabezados no deben colisionar entre piezas de una misma unidad. → Prueba en la Task 4.

---

## Estructura de archivos

```
astro.config.mjs                 site/base desde el entorno; sin integraciones extra
package.json                     scripts: dev, build (astro build && node scripts/pdf.mjs), test
vitest.config.ts
src/content.config.ts            colecciones piezas, modulos (+ piezasPrivadas, modulosPrivados solo en dev)
src/licencias.ts                 catálogo cerrado de licencias + validarFicha
src/lib/tipos.ts                 tipos compartidos y ErrorContenido
src/lib/esquemas.ts              esquemas Zod de las cabeceras (los usa content.config y las pruebas)
src/lib/catalogo.ts              construirCatalogo: N:M, privacidad, borradores, huérfanas
src/lib/fechas.ts                git → fechas por archivo y por bloque de unidad; formatearFecha
src/lib/creditos.ts              créditos de un conjunto de piezas renderizadas
src/lib/markdown/index.ts        renderizarPieza(pieza, ctx)
src/lib/markdown/recuadros.ts    directivas ::: + restauración de texto literal
src/lib/markdown/encabezados.ts  normalización de niveles + ids con prefijo
src/lib/markdown/enlaces.ts      [[id]] / [[id|texto]]
src/lib/markdown/imagenes.ts     figuras, atributos {.clase}, fichas
src/lib/markdown/mermaid.ts      ```mermaid → <pre class="mermaid">
src/lib/imagenes-url.ts          urlImagen(rutaAbs) y listado de imágenes del contenido
src/lib/sitio.ts                 cargarSitio(): punto único que usan las páginas (memoizado)
src/pages/…                      index, [modulo]/index, [modulo]/[unidad]/index, apuntes/[pieza], licencias, img/[archivo].ts, pdf-manifest.json.ts
src/layouts/Base.astro           cabecera, pie con la licencia, señal __onyonListo
src/components/…                 Fecha, Recursos (tabla de licencias), Distintivo
src/styles/global.css · print.css
scripts/pdf.mjs                  orquestador de PDFs
scripts/lib/huella.mjs           calcularHuella (pura)
contenido/…                      piezas/, modulos/, creditos-sitio.yml
tests/…                          *.test.ts y fixtures/
.github/workflows/deploy.yml
```

---

### Task 1: Esqueleto del proyecto

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`, `src/layouts/Base.astro`, `src/pages/index.astro`, `tests/humo.test.ts`, `README.md`

**Interfaces:**
- Produces:
  - scripts `npm run dev`, `npm run build`, `npm test`;
  - `Base.astro` con props `{ titulo: string; color?: string }` y un slot;
  - `import.meta.env.BASE_URL` como prefijo de todas las rutas.

- [ ] **Step 1:** `npm create astro@latest` con la plantilla mínima, en TypeScript estricto, sobre el directorio actual (conserva `docs/`). Fija `astro@7.3.8` e instala `vitest@5`.
- [ ] **Step 2:** En `astro.config.mjs`: `site: process.env.SITE_URL ?? 'http://localhost:4321'`, `base: process.env.BASE_PATH ?? '/'`, `trailingSlash: 'always'` y `build.format: 'directory'`.
- [ ] **Step 3:** `.gitignore` con `node_modules/`, `dist/`, `.astro/`, `.cache/` y `.env`.
- [ ] **Step 4: Prueba que falla.** `tests/humo.test.ts` lanza `astro build` (con `execa` o `child_process`, `BASE_PATH=/prueba/`) y comprueba que existe `dist/index.html` y que contiene `href="/prueba/`.
- [ ] **Step 5:** Escribe `Base.astro`: `<html lang="es">`, la cabecera con el enlace a `BASE_URL` y el pie con el texto literal de la licencia (Global Constraints). Haz que `index.astro` lo use.
- [ ] **Step 6:** `npm test` → PASS.
- [ ] **Step 7:** El README explica cómo arrancar (`npm run dev`), dónde se escribe el contenido y para qué sirve `ONYON_PRIVADO`. Commit: `chore: esqueleto Astro + Vitest`.

### Task 2: Catálogo de licencias y validación de fichas

**Files:**
- Create: `src/licencias.ts`, `src/lib/tipos.ts`
- Test: `tests/licencias.test.ts`

**Interfaces:**
- Produces (`src/lib/tipos.ts`):
  ```ts
  export interface Problema { archivo: string; linea?: number; mensaje: string }
  export class ErrorContenido extends Error { constructor(public problemas: Problema[]) } // message = una línea por problema: "archivo:linea — mensaje"
  export interface Licencia { id: string; nombre: string; url?: string; permiteCambios: boolean; noComercial: boolean; requiereTitular: boolean }
  export interface Ficha { autor: string; propio: boolean; fuente?: string; licencia: Licencia; cambios?: string; titular?: string }
  ```
- Produces (`src/licencias.ts`): `LICENCIAS: Record<string, Licencia>`, `licenciaPorId(id: string): Licencia | undefined`, `validarFicha(datos: unknown, archivo: string): Ficha` (lanza `ErrorContenido`).

- [ ] **Step 1: Pruebas que fallan** (`tests/licencias.test.ts`):
  - `autor: propio` → `licencia.id === 'CC-BY-SA-4.0'`, `propio === true` y no exige `fuente`;
  - una ficha completa con `CC-BY-SA-3.0` es válida;
  - sin `fuente` (y sin `propio`) → error cuyo mensaje contiene `fuente`;
  - `licencia: CC-BY-99` → error que contiene `licencia desconocida «CC-BY-99»`;
  - `CC-BY-ND-4.0` con `cambios` → error que contiene `no permite modificaciones`;
  - `marca` sin `titular` → error que contiene `titular`;
  - un campo desconocido (`autr`) → error que contiene `autr`;
  - `CC-BY-NC-4.0` → `licencia.noComercial === true`;
  - el `message` de `ErrorContenido` incluye `img/x.yml`.
- [ ] **Step 2:** `npx vitest run tests/licencias.test.ts` → FAIL (módulo inexistente).
- [ ] **Step 3:** Implementa el catálogo con los ids de la spec §6.2 (`CC0-1.0`, `dominio-publico`, `CC-BY-4.0`, `CC-BY-SA-4.0`, `CC-BY-SA-3.0`, `CC-BY-NC-4.0`, `CC-BY-NC-SA-4.0`, `CC-BY-ND-4.0`, `MIT`, `Apache-2.0`, `marca`), con la URL oficial de cada licencia. Solo `CC-BY-ND-4.0` tiene `permiteCambios: false`. Valida con un esquema Zod estricto de `astro/zod` y reúne en un solo `ErrorContenido` todos los problemas de la ficha.
- [ ] **Step 4:** Ejecuta las pruebas → PASS.
- [ ] **Step 5:** Commit: `feat: catálogo de licencias y validación de fichas`.

### Task 3: Colecciones, esquemas y catálogo N:M

**Files:**
- Create: `src/lib/esquemas.ts`, `src/lib/catalogo.ts`, `src/content.config.ts`, `tests/fixtures/valido/…` (2 módulos, 4 piezas, 1 privada y 1 borrador)
- Test: `tests/catalogo.test.ts`, `tests/privado-build.test.ts`

**Interfaces:**
- Consumes: `ErrorContenido` y `licenciaPorId` (Task 2).
- Produces:
  ```ts
  // esquemas.ts
  export const esquemaPieza   // z.object({ titulo, resumen?, borrador=false, fuentes=[], licencia='CC-BY-SA-4.0' }).strict()
  export const esquemaModulo  // z.object({ nombre, codigo: string, ciclo, curso: number, color?: /^#[0-9a-f]{6}$/i, activo=true, unidades: [{ id, titulo, piezas: string[] }] }).strict()
  // tipos.ts (añadir)
  export type Modo = 'desarrollo' | 'publicacion'
  export interface PiezaFuente { id: string; archivo: string; rutaAbs: string; datos: CabeceraPieza; cuerpo: string; privado: boolean }
  export interface ModuloFuente { id: string; archivo: string; rutaAbs: string; datos: CabeceraModulo; privado: boolean }
  export interface Aparicion { modulo: string; unidad: string; tituloModulo: string; tituloUnidad: string }
  export interface Catalogo {
    piezas: Map<string, PiezaFuente>        // publicables en el modo dado
    todas: Map<string, PiezaFuente>         // todas las cargadas (incluye borradores), para enlaces y avisos
    modulos: ModuloFuente[]                  // activos; cada unidad.piezas ya sin borradores en modo publicacion
    apariciones: Map<string, Aparicion[]>
    avisos: string[]; informe: string[]      // borradores en unidades; piezas huérfanas
  }
  // catalogo.ts
  export function construirCatalogo(piezas: PiezaFuente[], modulos: ModuloFuente[], modo: Modo): Catalogo  // lanza ErrorContenido con TODOS los problemas
  ```
- `content.config.ts` define `piezas` (glob `**/*.md`, base `contenido/piezas`) y `modulos` (glob `*.yml`, base `contenido/modulos`). **Solo si** `import.meta.env.DEV` (o `process.env.NODE_ENV !== 'production'`) y `ONYON_PRIVADO` existe en disco, define también `piezasPrivadas` y `modulosPrivados`. `generateId` usa la ruta relativa (evita colisiones dentro de Astro); el id de dominio (basename) lo calcula `construirCatalogo`.

- [ ] **Step 1: Pruebas que fallan** (`tests/catalogo.test.ts`, sobre datos construidos en la prueba):
  - Dos piezas con el mismo basename en carpetas distintas (o una pública y otra privada) → error `id de pieza duplicado «procesos»` que cita ambos archivos.
  - Un módulo que referencia `no-existe` → error con `aso.yml` y `pieza inexistente «no-existe»`.
  - Un módulo público que referencia una pieza privada, en modo `desarrollo` → error `pieza privada «x» en un módulo público`.
  - Dos unidades con el mismo id en un módulo → error.
  - Un id de unidad `UT 1` → error de formato.
  - `activo: false` → el módulo no aparece en `modulos`, pero sus piezas siguen en `piezas`.
  - Un borrador en modo `publicacion`:
    - no está en `piezas`;
    - se elimina de `unidad.piezas`;
    - `avisos` contiene `aso/ut1: incluye borradores (procesos-estados)`.
  - Un borrador en modo `desarrollo` se conserva.
  - `apariciones.get('procesos-concepto')` lista ASO·UT1 y SOM·UT3.
  - Una pieza pública que no está en ningún módulo → `informe` contiene su id.
  - Varios problemas a la vez → un único `ErrorContenido` con todos.
- [ ] **Step 2:** Ejecuta → FAIL.
- [ ] **Step 3:** Implementa `esquemas.ts`, `construirCatalogo` y `content.config.ts`.
- [ ] **Step 4: Prueba de esquema.** En `tests/catalogo.test.ts`, `esquemaPieza.safeParse({ titulo: 'x', borador: true })` debe fallar con un problema en `borador`.
- [ ] **Step 5: Prueba de privacidad del build** (`tests/privado-build.test.ts`, Review Focus 4):
  - lanza `astro build` sobre `tests/fixtures/valido` con `ONYON_PRIVADO` apuntando a `tests/fixtures/privado`;
  - comprueba que ningún archivo de `dist/` contiene la cadena centinela `SECRETO-PRIVADO-123`, que está en una pieza privada del fixture.

  Para que el build use el fixture, `contenido/` se toma de `ONYON_CONTENIDO` (por defecto `contenido`). Añade esa variable a `content.config.ts`.
- [ ] **Step 6:** Ejecuta las pruebas → PASS.
- [ ] **Step 7:** Commit: `feat: colecciones y catálogo N:M con privacidad y borradores`.

### Task 4: Pipeline Markdown (recuadros, encabezados, Mermaid y código)

**Files:**
- Create: `src/lib/markdown/index.ts`, `recuadros.ts`, `encabezados.ts`, `mermaid.ts`
- Test: `tests/markdown.test.ts`

**Interfaces:**
- Consumes: `PiezaFuente`, `Catalogo` y `Modo` (Task 3).
- Produces:
  ```ts
  export interface ContextoRender {
    catalogo: Catalogo; modo: Modo; base: string; sitioUrl: string
    unidad?: { modulo: string; id: string; piezas: Set<string> }   // ausente = página /apuntes/<id>/
  }
  export interface ImagenUsada { rutaAbs: string; rutaFicha: string; url: string; alt: string; ficha: Ficha }
  export interface PiezaRenderizada { id: string; html: string; imagenes: ImagenUsada[]; tieneMermaid: boolean }
  export async function renderizarPieza(p: PiezaFuente, ctx: ContextoRender): Promise<PiezaRenderizada>  // lanza ErrorContenido
  ```

- [ ] **Step 1: Pruebas que fallan:**
  - `:::ejercicio\nHaz X\n:::` → `<aside class="recuadro recuadro-ejercicio">` con el rótulo «Ejercicio».
  - `::: nota` y `::: aviso ` (espacio final) → recuadros equivalentes (Review Focus 2).
  - `:::peligro` → error con la línea y `recuadro desconocido «peligro»`.
  - Un `:::nota` sin cerrar → error con la línea de apertura (Review Focus 2).
  - Los párrafos `chown root:root fichero`, `C:\Windows\System32`, `puerto ldap:389` y `fe80::1` aparecen literalmente en el HTML (Review Focus 1).
  - Cuerpo con `# A` y `## B`:
    - sin unidad → `<h2>` y `<h3>`;
    - con unidad → `<h3>` y `<h4>`;
    - con un cuerpo cuyo nivel mínimo es `##` el resultado es el mismo (normalización).
  - Los ids de los encabezados llevan el prefijo de la pieza: `procesos-estados--a`. Dos piezas con un `# Introducción` producen ids distintos (Review Focus 5).
  - Un bloque `mermaid` → `<pre class="mermaid">` con el texto escapado, sin resaltar, y `tieneMermaid === true`.
  - Un bloque `bash` → HTML resaltado por Shiki (`class="shiki`).
- [ ] **Step 2:** Ejecuta → FAIL.
- [ ] **Step 3:** Implementa la cadena: `remark-parse` → `remark-gfm` → `remark-directive` → recuadros → encabezados → mermaid → `remark-rehype` → `@shikijs/rehype` (temas `github-light`/`github-dark`) → `rehype-stringify`.
  - **Recuadros.** Antes de analizar, reescribe línea a línea `^(\s*):::\s+([a-z]+)\s*$` → `$1:::$2`, conservando el número de líneas. Después de analizar, convierte de nuevo cada `textDirective` y `leafDirective` en su texto fuente original, cortando `file.value` con `position` (no lo reconstruyas).
  - **Directivas sin cerrar.** Detéctalas comprobando que el `end` de un `containerDirective` coincide con el final del documento sin que haya una línea `:::` de cierre.
  - **Encabezados.** Calcula el nivel mínimo del cuerpo y desplázalo a 2 (pieza suelta) o 3 (unidad). Genera los ids con `github-slugger` y el prefijo `<id>--`.
- [ ] **Step 4:** Ejecuta → PASS.
- [ ] **Step 5:** Commit: `feat: pipeline Markdown con recuadros, encabezados, mermaid y shiki`.

### Task 5: Enlaces wiki

**Files:**
- Create: `src/lib/markdown/enlaces.ts` (se registra en `index.ts` antes de `remark-rehype`)
- Test: `tests/enlaces.test.ts`

**Interfaces:**
- Consumes: `ContextoRender` (Task 4).

- [ ] **Step 1: Pruebas que fallan**, con `base: '/ok/'` y `sitioUrl: 'https://ej.es'`:
  - `[[b]]` sin unidad → `<a href="/ok/apuntes/b/">Título de B</a>`.
  - `[[b|el ciclo]]` → el texto del enlace es «el ciclo».
  - Con unidad que contiene `b` → `href="#b"`.
  - Con unidad que no contiene `b` → `href="https://ej.es/ok/apuntes/b/"`, absoluta (Review Focus 3).
  - `[[nada]]` → error con archivo, línea y `enlace roto «nada»`.
  - Un enlace a una pieza privada desde una pieza pública (modo `desarrollo`) → error `enlace a contenido privado`.
  - Un enlace a un borrador en modo `publicacion` → texto plano, más un aviso en `ctx.catalogo.avisos`.
  - `[[b]]` dentro de `` `código` `` o de un bloque de código → no se transforma.
- [ ] **Step 2:** Ejecuta → FAIL.
- [ ] **Step 3:** Implementa el plugin, que recorre solo los nodos `text` con `/\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g` y divide cada nodo en texto y enlaces. Para distinguir «borrador» de «inexistente», usa `catalogo.todas`.
- [ ] **Step 4:** Ejecuta → PASS.
- [ ] **Step 5:** Commit: `feat: enlaces wiki entre piezas`.

### Task 6: Imágenes, atributos y fichas

**Files:**
- Create: `src/lib/markdown/imagenes.ts`, `src/lib/imagenes-url.ts`, `src/pages/img/[archivo].ts`
- Test: `tests/imagenes.test.ts` (fixtures: `tests/fixtures/img/` con un PNG de 1×1, su `.yml` y un PNG sin ficha)

**Interfaces:**
- Consumes: `validarFicha` (Task 2); `ImagenUsada` y `ContextoRender` (Task 4).
- Produces:
  - `urlImagen(rutaAbs: string, base: string): string` → `${base}img/<sha256(contenido) 8 hex>-<basename>`;
  - `listarImagenes(raices: string[]): string[]`, para las extensiones `png jpg jpeg gif svg webp`;
  - el endpoint `img/[archivo].ts`: `getStaticPaths` sobre `listarImagenes`, que devuelve los bytes con su `Content-Type`.

- [ ] **Step 1: Pruebas que fallan:**
  - `![CPU](./img/cpu.png)` →
    - `<figure>` con un `<img src="/ok/img/xxxxxxxx-cpu.png" alt="CPU">`;
    - un `<figcaption>` con «CPU» y la línea de crédito *Autor · Licencia (enlace) · Fuente (enlace)*;
    - `imagenes[0].ficha.autor` correcto.
  - `{.mediana .derecha}` justo detrás de la imagen → `class="fig-mediana fig-derecha"`, y el texto `{…}` desaparece.
  - `{.gigante}` → error `clase de imagen desconocida «gigante»`.
  - Imagen sin ficha → error con la línea, que nombra el `.yml` esperado.
  - Texto alternativo vacío → error.
  - `![x](https://…)` → error `imagen remota no permitida`.
  - Archivo inexistente → error.
  - Ficha `CC-BY-NC-4.0` → el crédito contiene «uso no comercial».
  - Ficha con `cambios` → el crédito contiene «Modificada: …».
  - `autor: propio` → el crédito dice «Alejandro Bartolomé · CC BY-SA 4.0», sin fuente.
  - Una imagen sola en su párrafo no queda envuelta en `<p>`.
- [ ] **Step 2:** Ejecuta → FAIL.
- [ ] **Step 3:** Implementa: resuelve la ruta respecto a `dirname(p.rutaAbs)`, lee el `.yml` hermano (mismo nombre base) con `js-yaml`, valida la ficha y reemplaza el nodo por HTML de figura (`hast`).
- [ ] **Step 4:** Ejecuta → PASS.
- [ ] **Step 5:** Commit: `feat: imágenes con ficha de licencia obligatoria`.

### Task 7: Fechas desde git

**Files:**
- Create: `src/lib/fechas.ts`
- Test: `tests/fechas.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export function parsearGitLog(salida: string): Map<string, Date>   // salida de: git log --format=%x00%cI --name-only ; ruta relativa → fecha más reciente
  export function fechasBloques(versiones: { fecha: Date; yaml: string }[]): Map<string, Date>  // versiones de la más reciente a la más antigua; clave = id de unidad
  export interface IndiceFechas { fechaDe(rutasAbs: string[]): Date | null; fechaUnidad(rutaModuloAbs: string, unidad: string): Date | null }
  export async function leerFechas(raizRepo: string): Promise<IndiceFechas>
  export function formatearFecha(d: Date | null): string   // "Actualizado el 9 de octubre de 2026" | "Sin publicar"
  ```

- [ ] **Step 1: Pruebas que fallan** (puras, con cadenas de ejemplo):
  - `parsearGitLog` con tres commits que tocan `a.md` dos veces → la fecha más reciente.
  - `fechasBloques` con tres versiones: en la intermedia cambian las piezas de `ut3`, y `ut1` no cambia desde la primera → `ut1` = fecha de la versión más antigua y `ut3` = fecha de la intermedia (spec §5.2). Reordenar el YAML sin cambiar los valores no cambia ninguna fecha.
  - `formatearFecha(new Date('2026-10-09T22:30:00Z'))` → «Actualizado el 10 de octubre de 2026» (por la zona de Madrid).
  - `formatearFecha(null)` → «Sin publicar».
- [ ] **Step 2: Prueba de integración** (repo temporal con `git init` en un directorio temporal):
  - `fechaDe([a, b])` = la más reciente de las dos;
  - un archivo modificado sin commitear → `null`;
  - un archivo fuera del repo (privado) → `null`.
- [ ] **Step 3:** Ejecuta → FAIL.
- [ ] **Step 4:** Implementa:
  - `leerFechas` ejecuta **una vez** `git log` sobre todo el árbol y una vez `git status --porcelain`;
  - `fechaUnidad` obtiene las versiones del módulo con `git log --format=%H%x00%cI -- <ruta>` y `git show <H>:<ruta>`, y las memoiza por ruta;
  - si `git` no está disponible, todas las fechas son `null` y se emite un aviso.
- [ ] **Step 5:** Ejecuta → PASS.
- [ ] **Step 6:** Commit: `feat: fechas de última modificación desde git`.

### Task 8: Créditos y bibliografía

**Files:**
- Create: `src/lib/creditos.ts`, `contenido/creditos-sitio.yml`
- Test: `tests/creditos.test.ts`

**Interfaces:**
- Consumes: `PiezaRenderizada`, `PiezaFuente` y `licenciaPorId`.
- Produces:
  ```ts
  export interface Creditos {
    licenciaTexto: Licencia
    piezasConOtraLicencia: { id: string; titulo: string; licencia: Licencia }[]
    bibliografia: string[]           // unión de fuentes, orden de aparición, sin duplicados
    recursos: { url: string; alt: string; ficha: Ficha }[]   // terceros (propio=false), sin duplicados por rutaAbs
  }
  export function creditosDe(piezas: { fuente: PiezaFuente; render: PiezaRenderizada }[]): Creditos
  ```

- [ ] **Step 1: Pruebas que fallan:**
  - Dos piezas que comparten una fuente y una imagen → una sola entrada de cada.
  - Las imágenes `propio` no aparecen en `recursos`.
  - Una pieza con `licencia: CC-BY-4.0` → aparece en `piezasConOtraLicencia`.
  - El orden de `bibliografia` es el de aparición.
- [ ] **Step 2:** Ejecuta → FAIL.
- [ ] **Step 3:** Implementa `creditosDe`. Crea `creditos-sitio.yml` con Astro (MIT), Inter y JetBrains Mono (OFL-1.1), Mermaid (MIT) y Shiki (MIT), cada uno con su URL. Añade `OFL-1.1` al catálogo de la Task 2, con su prueba.
- [ ] **Step 4:** Ejecuta → PASS.
- [ ] **Step 5:** Commit: `feat: créditos y bibliografía por conjunto de piezas`.

### Task 9: Páginas web y estilos

**Files:**
- Create: `src/lib/sitio.ts`; `src/pages/index.astro`, `[modulo]/index.astro`, `[modulo]/[unidad]/index.astro`, `apuntes/[pieza].astro`, `licencias.astro` y `pdf-manifest.json.ts`; `src/components/Fecha.astro`, `Recursos.astro` y `Distintivo.astro`; `src/styles/global.css`
- Modify: `src/layouts/Base.astro`
- Test: `tests/paginas.test.ts` (build sobre `tests/fixtures/valido`)

**Interfaces:**
- Consumes: todo lo anterior.
- Produces:
  ```ts
  // sitio.ts
  export interface UnidadSitio { modulo: ModuloFuente; id: string; titulo: string; piezas: { fuente: PiezaFuente; render: PiezaRenderizada; fecha: Date | null }[]; fecha: Date | null; creditos: Creditos; urlPdf: string }
  export interface Sitio { catalogo: Catalogo; modo: Modo; unidades: UnidadSitio[]; piezaSuelta(id: string): Promise<{ render: PiezaRenderizada; fecha: Date | null }>; ultimosCambios: { titulo: string; url: string; fecha: Date }[] }
  export function cargarSitio(): Promise<Sitio>   // memoizado; imprime avisos e informe una sola vez
  ```
  `pdf-manifest.json` → `[{ modulo, unidad, ruta: "/<base>/aso/ut1/", salida: "pdf/aso-ut1.pdf", pie: "ASO · UT1" }]`.

- [ ] **Step 1: Pruebas que fallan** (HTML de `dist/` tras el build del fixture):
  - `/` lista los módulos activos, no el inactivo, y muestra «Últimos cambios» ordenados por fecha (como máximo 20).
  - `/aso/` muestra cada unidad con un `<time>` y un enlace a `pdf/aso-ut1.pdf`.
  - `/aso/ut1/` contiene:
    - las piezas en el orden del índice, cada una con `id="<pieza>"`;
    - un índice con anclas;
    - la sección «Licencias y fuentes», con la licencia del texto, la bibliografía y la tabla de recursos.
  - `/apuntes/procesos-concepto/` contiene «Aparece en» con enlaces a ASO · UT1 y SOM · UT3.
  - `/licencias/` lista todos los recursos de terceros y los créditos del sitio.
  - Todas las páginas tienen el pie literal de la licencia.
  - `pdf-manifest.json` tiene una entrada por unidad activa.
- [ ] **Step 2:** Ejecuta → FAIL.
- [ ] **Step 3:** Implementa las páginas sobre `cargarSitio()`, con `set:html` para el HTML renderizado.
  - Fecha de pieza = `fechaDe([rutaAbs del .md, …imagenes.rutaAbs, …imagenes.rutaFicha])`.
  - Fecha de unidad = la más reciente entre `fechaUnidad(modulo.rutaAbs, unidad)` y las fechas de sus piezas. Es `null` si alguna de ellas es `null`.
  - El color del módulo va en la variable CSS `--color-modulo`.
  - En modo `desarrollo`, `Distintivo` muestra «Privado» o «Borrador».
- [ ] **Step 4:** Implementa los estilos en `global.css`:
  - una columna de lectura (unos 70 caracteres) y las tipografías de @fontsource;
  - recuadros con color e icono (SVG en línea) por tipo;
  - clases `fig-*`;
  - tema oscuro con `prefers-color-scheme`.
- [ ] **Step 5:** Ejecuta → PASS. Comprobación visual: abre `npm run dev` en el navegador integrado y revisa una unidad del fixture en escritorio y en móvil (375 px, sin scroll horizontal).
- [ ] **Step 6:** Commit: `feat: páginas web, layout y estilos`.

### Task 10: Impresión y PDFs con caché

**Files:**
- Create: `src/styles/print.css`, `scripts/lib/huella.mjs`, `scripts/pdf.mjs`
- Modify: `src/layouts/Base.astro` (señal de listo y Mermaid en el cliente), `src/pages/[modulo]/[unidad]/index.astro` (portada, solo visible al imprimir), `package.json` (`build` = `astro build && node scripts/pdf.mjs`)
- Test: `tests/huella.test.ts`, `tests/pdf.test.ts`

**Interfaces:**
- Consumes: `pdf-manifest.json` (Task 9).
- Produces: `calcularHuella(html: string, leerRecurso: (url: string) => Buffer | null, versiones: string): string` (sha256 hex). Los recursos son los `src`, `href` y `url()` locales del HTML y de los CSS que referencia.

- [ ] **Step 1: Pruebas de huella que fallan:**
  - El mismo HTML y los mismos recursos → la misma huella.
  - Cambiar un byte de un CSS referenciado → otra huella.
  - Cambiar un archivo **no** referenciado → la misma huella.
  - Cambiar `versiones` → otra huella.
- [ ] **Step 2:** Ejecuta → FAIL. Implementa `huella.mjs` → PASS.
- [ ] **Step 3:** En `Base.astro`, un script cliente:
  - espera a `document.fonts.ready` y a que carguen todas las `img`;
  - si hay `.mermaid`, importa `mermaid` dinámicamente, ejecuta `mermaid.run()` y fuerza el tema claro al imprimir;
  - al final, asigna `window.__onyonListo = true`.
- [ ] **Step 4:** `print.css` (spec §8.2):
  - `@page { size: A4; margin: 18mm 16mm 20mm }`;
  - la portada (módulo, unidad, fecha y licencia), el índice y cada `.pieza` empiezan en página nueva (`break-before: page`);
  - `break-inside: avoid` en figuras, recuadros y `pre`;
  - se ocultan `nav` y los botones;
  - colores claros forzados.
- [ ] **Step 5:** Implementa `pdf.mjs`:
  1. Sirve `dist/` con `sirv`, montado en `BASE_PATH`, en `127.0.0.1` y un puerto libre.
  2. Calcula la huella de cada entrada del manifiesto. `versiones` = hash de `scripts/pdf.mjs` más `browser.version()`.
  3. Si la huella está en caché, copia el PDF. Si no:
     - `page.goto`, `emulateMedia({ media: 'print' })`;
     - `waitForFunction('window.__onyonListo === true', { timeout: 60000 })`;
     - `page.pdf({ format: 'A4', printBackground: true, displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate })`, con el pie «<pie> · página <span class="pageNumber"></span> de <span class="totalPages"></span>».
  4. Usa una cola de concurrencia `PDF_CONCURRENCIA` (por defecto, 4).
  5. Elimina las huellas no usadas.
  6. Imprime `PDF: N renderizados, M reutilizados, T s`.
  7. Si cualquier unidad falla, termina con código 1 y nombra la unidad.
- [ ] **Step 6: Prueba de humo que falla** (`tests/pdf.test.ts`, sobre el fixture):
  - `npm run build` produce `dist/pdf/aso-ut1.pdf`;
  - con `pdfjs-dist`, el PDF tiene ≥ 2 páginas y su texto contiene «Licencias y fuentes» y «Actualizado el» (o «Sin publicar»);
  - el texto y las URIs de las anotaciones no contienen `127.0.0.1` ni `localhost` (Review Focus 3);
  - una segunda ejecución de `node scripts/pdf.mjs` imprime `0 renderizados`.
- [ ] **Step 7:** Ejecuta → PASS. Comprobación visual: abre el PDF de una unidad del fixture y comprueba la portada, los saltos de página, los recuadros y el pie de página.
- [ ] **Step 8:** Commit: `feat: PDF por unidad con Chromium y caché por huella`.

### Task 11: Despliegue en GitHub Pages

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `README.md`

- [ ] **Step 1: Punto de control humano.** Pregunta al docente el nombre del repositorio público nuevo (sugerencia: `onyon-knight`) y **confirma antes de crearlo** (`gh repo create kohee-dev/<nombre> --public --source . --push`). Después, el docente activa Pages con *Settings → Pages → Source: GitHub Actions*.
- [ ] **Step 2:** Workflow (en `push` a `main` y `workflow_dispatch`):
  1. `actions/checkout@v4` con `fetch-depth: 0`.
  2. `actions/setup-node@v4` (`node-version: 24`, `cache: npm`) y `npm ci`.
  3. `actions/cache` para `~/.cache/ms-playwright`, con clave en la versión de Playwright del lockfile, y después `npx playwright install --with-deps chromium`.
  4. `actions/cache` para `.cache/pdf`, con clave `pdf-${{ github.sha }}` y `restore-keys: pdf-`.
  5. `npm test`.
  6. `npm run build` con `BASE_PATH=/<nombre>/` y `SITE_URL=https://kohee-dev.github.io`.
  7. `actions/upload-pages-artifact@v3` (`path: dist`) y `actions/deploy-pages@v4`, con `permissions: pages: write, id-token: write`.
- [ ] **Step 3:** El README documenta el despliegue y cómo migrar más adelante a otro destino (cambiar `BASE_PATH`, `SITE_URL` y el último paso por `rsync`).
- [ ] **Step 4:** Push. Verifica que el workflow termina en verde (`gh run watch`) y que la URL publicada carga la portada (aún sin contenido real).
- [ ] **Step 5:** Commit: `ci: despliegue en GitHub Pages`.

### Task 12: Migración de ASO y SOR y publicación

**Files:**
- Create: `contenido/piezas/aso/**`, `contenido/piezas/sor/**`, `contenido/modulos/aso.yml`, `contenido/modulos/sor.yml`
- Origen (solo lectura): `~/Documents/Proyectos/Personal Projects/OnyonKnight/contenido/{aso,sor}`

- [ ] **Step 1:** Escribe un script **desechable** en el scratchpad (no en el repo) que, para cada `.md` de `aso/` y `sor/`:
  - toma `titulo` del front-matter antiguo y descarta el resto de campos;
  - quita un `#` inicial cuyo texto coincide con el título;
  - reescribe las rutas de imagen a `./img/<archivo>`;
  - escribe `contenido/piezas/<modulo>/<carpeta>/<id>.md`, con el id en minúsculas, sin acentos y con guiones, derivado del `slug` antiguo;
  - copia las imágenes;
  - genera una propuesta de `aso.yml` y `sor.yml` agrupando por `tema` y ordenando por `orden` (`codigo`, `ciclo` y `curso` salen de `Clases/KB/README.md`: ASO 0374 ASIR 2.º, SOR 0224 SMR 2.º).

  Los archivos `_*.md` **no se procesan**.
- [ ] **Step 2: Punto de control humano.**
  - Muestra al docente la estructura propuesta de unidades de ASO y SOR (unidad → piezas) para que la confirme o la corrija.
  - Pregúntale cómo clasificar `_Gatos.md` y `_Expediente 02 - Las llaves del almacen.md`: **privado** (→ `ONYON_PRIVADO`), **borrador** (→ `borrador: true`) o **antiguo** (no se migra).
- [ ] **Step 3:** `npm run build`. Corrige los errores que dé (sintaxis de Pandoc no admitida, recuadros…) en las piezas, nunca relajando las validaciones. Crea las fichas de las 2 imágenes de ASO **pidiendo al docente** el autor, la fuente y la licencia de cada una. Si son suyas, `autor: propio`.
- [ ] **Step 4:** Comprobación visual en `npm run dev`: cada unidad de ASO y SOR, el diagrama Mermaid de SOR, un PDF de cada módulo y el apartado de licencias. Muestra al docente una unidad y su PDF.
- [ ] **Step 5:** Commit: `content: migra ASO y SOR`. Push. Verifica el despliegue en verde y que las URLs `…/aso/`, `…/sor/` y `…/pdf/aso-<unidad>.pdf` responden.

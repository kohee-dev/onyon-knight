# Onyon Knight · Núcleo de la web docente — Diseño

- **Fecha:** 2026-10-11
- **Estado:** aprobada (2026-10-11)
- **Subproyecto:** 1 de 2 (núcleo). El subproyecto 2 (generación de PPTX por tema) tendrá su propia spec.
- **Sustituye a:** `~/Documents/Proyectos/Personal Projects/OnyonKnight` (queda archivado como referencia).

## 1. Propósito

Web docente pública y minimalista para impartir clase en FP, que:

1. Sirve los apuntes en la web (proyectables en clase).
2. Genera un PDF por unidad, con el mismo aspecto que la web, para el alumnado.
3. Organiza todos los apuntes del docente, incluidos los privados, en un único sistema.
4. Pone en primer plano el **contenido** y su **fecha de última modificación**.
5. Hace explícitas las **licencias y fuentes** de todo recurso, por ser un proyecto público.

### Lecciones del proyecto anterior (requisitos derivados)

| Problema anterior | Requisito |
|---|---|
| Build lento; el incremental no ayudaba al reestructurar una asignatura | Reorganizar no regenera PDFs cuyo contenido final no cambió |
| No se podían desactivar módulos | Un campo `activo` por módulo |
| Sin fecha de última modificación | Fecha automática a partir de git |
| Sin enlaces entre apuntes | Enlaces wiki entre piezas, validados |
| Un campo de cabecera erróneo ocultaba el apunte en silencio | Cualquier error de cabecera detiene el build con un mensaje claro |
| Relación módulo → apuntes 1:N | Relación N:M: un apunte se reutiliza en varios módulos |
| Insertar imágenes era difícil | Markdown estándar más una ficha de licencia junto a la imagen |
| El diseño visual era positivo | Mantener un aspecto llamativo (recuadros, color por módulo) |

## 2. Decisiones tomadas

| Tema | Decisión |
|---|---|
| Framework | Astro, con content collections y esquemas validados (Zod) |
| Relación módulo/apunte | El **módulo decide**: índice YAML con unidades → lista ordenada de piezas |
| Granularidad | **Piezas** pequeñas y combinables; las variantes sencilla/ampliada salen de qué piezas incluye cada índice |
| PDF | Uno por unidad, impreso con Chromium (Playwright) desde la propia página web, con caché por huella de contenido |
| Licencia propia | CC BY-SA 4.0 |
| Licencias de imágenes | Ficha `.yml` junto a cada imagen; obligatoria |
| Visibilidad | Módulo `activo`, pieza `borrador` y contenido privado fuera del repo |
| Repositorio | Público; los apuntes privados viven en una carpeta aparte, fuera del repo |
| Hosting | GitHub Pages ahora; Raspberry Pi más adelante (solo cambia el paso de despliegue) |
| Alcance inicial | Publicar **ASO y SOR** en dos días (antes del 2026-10-13) |

## 3. Estructura

```
Onyon Knight/                    (repo público)
├── contenido/
│   ├── piezas/                  apuntes; las subcarpetas son libres y solo sirven para ordenar
│   │   └── <carpeta>/
│   │       ├── <id>.md
│   │       └── img/
│   │           ├── <imagen>.png
│   │           └── <imagen>.yml ficha de licencia (mismo nombre base)
│   ├── modulos/<id>.yml         índices de módulo
│   └── creditos-sitio.yml       créditos de Astro, tipografías y librerías
├── src/
│   ├── content.config.ts        colecciones y esquemas
│   ├── licencias.ts             catálogo cerrado de licencias
│   ├── lib/                     lógica pura y probada (fechas, enlaces, fichas, huellas)
│   ├── plugins/                 plugins remark/rehype (enlaces wiki, recuadros, figuras)
│   ├── components/ layouts/ pages/ styles/
├── scripts/pdf.mjs              generación de PDFs con caché
├── tests/                       Vitest + proyecto de contenido de prueba
└── .github/workflows/deploy.yml

../onyon-privado/                (fuera del repo; misma estructura: piezas/, modulos/)
```

## 4. Modelo de contenido

### 4.1 Pieza (`contenido/piezas/**/<id>.md`)

- **Id = nombre del archivo** sin extensión, nunca la ruta. Mover una pieza de carpeta no cambia su id ni su URL.
- Un id duplicado (también entre la carpeta pública y la privada) es un **error**.
- Cabecera:

| Campo | Obligatorio | Por defecto | Uso |
|---|---|---|---|
| `titulo` | sí | — | Título de la pieza |
| `resumen` | no | — | Entradilla y descripción meta |
| `borrador` | no | `false` | No se publica; en local se ve marcado |
| `fuentes` | no | `[]` | Bibliografía del texto (lista de cadenas) |
| `licencia` | no | `CC-BY-SA-4.0` | Id del catálogo de licencias (§6.2) |

Cualquier campo desconocido es un error (esquema estricto), para detectar erratas como `borador`.

### 4.2 Módulo (`contenido/modulos/<id>.yml`)

```yaml
nombre: Administración de sistemas operativos
codigo: "0374"
ciclo: ASIR
curso: 2
color: "#2f6f9f"        # opcional
activo: true
unidades:
  - id: ut1
    titulo: Gestión de procesos
    piezas: [procesos-concepto, procesos-estados, procesos-linux]
```

- Id del módulo = nombre del archivo.
- `unidades[].id`: único dentro del módulo, en formato slug.
- `unidades[].piezas`: referencias a ids de pieza; una pieza inexistente es un **error**.
- La misma pieza puede aparecer en varias unidades y módulos.
- `activo: false` → el módulo no genera páginas ni PDFs. Sus piezas siguen publicándose en `/apuntes/<id>/`, así que desactivar un módulo nunca rompe enlaces.

### 4.3 Privacidad por ubicación

- Una pieza o un módulo es privado **porque está en la carpeta privada**; no existe un campo `privado`.
- La ruta privada se indica con la variable `ONYON_PRIVADO` (p. ej. `../onyon-privado`). Si no está definida o no existe, solo se carga el contenido público. En CI no se define nunca.
- En local, el contenido privado se muestra con un distintivo «Privado».
- Si un módulo público referencia una pieza privada, o una pieza pública la enlaza, es un **error**, tanto en local como en CI. En CI aparece como «pieza inexistente».
- Los módulos privados pueden referenciar piezas públicas y privadas.

### 4.4 Borradores

- Una pieza con `borrador: true` no se publica en producción. Las unidades que la incluyen se publican sin ella y el build emite un **aviso** con la lista de unidades incompletas.
- Un enlace wiki a un borrador desde contenido publicado se representa como texto plano y genera un aviso.

## 5. Páginas y comportamiento

### 5.1 Rutas

| Ruta | Contenido |
|---|---|
| `/` | Módulos activos y una lista de últimos cambios: las 20 piezas y unidades más recientes, ordenadas por fecha |
| `/<modulo>/` | Unidades del módulo con su fecha y su enlace al PDF |
| `/<modulo>/<unidad>/` | Unidad completa: índice, piezas en orden (cada una con su ancla `#<id-pieza>` y su fecha) y el apartado *Licencias y fuentes*. Es la fuente del PDF |
| `/apuntes/<pieza>/` | Pieza individual, con «Aparece en: …» (módulos y unidades activos que la incluyen) |
| `/licencias/` | Licencia del sitio, todos los recursos de terceros y los créditos del sitio |
| `/pdf/<modulo>-<unidad>.pdf` | PDF de la unidad; URL estable |

Todas las rutas respetan la ruta base configurable (`BASE_PATH`, p. ej. `/onyon-knight/`).

### 5.2 Fechas de última modificación

- **Pieza:** la fecha del commit más reciente entre su `.md`, sus imágenes y sus fichas.
- **Unidad:** la más reciente entre la fecha de sus piezas y la **fecha de su propio bloque** en el índice. La fecha del bloque se calcula así: se recorren los commits del archivo del módulo (`git log -- contenido/modulos/<id>.yml`), se analiza el YAML de cada versión y se toma el commit más reciente en el que el bloque de esa unidad (`titulo` + `piezas`, comparados por valor) difiere del de la versión anterior, o en el que el bloque aparece por primera vez. Así, reordenar la UT3 no cambia la fecha de la UT1.
- Si un archivo no tiene commits o tiene cambios sin commitear, se muestra «sin publicar» en local. En CI esto no ocurre.
- Formato visible: «Actualizado el 9 de octubre de 2026». Se añade `<time datetime="…">`.
- CI usa `fetch-depth: 0`. Para que el build no se ralentice, las fechas se obtienen con una sola invocación de `git log` sobre todo el árbol.

### 5.3 Enlaces entre piezas

- Sintaxis: `[[id]]` y `[[id|texto]]`. Sin texto, se usa el `titulo` de la pieza destino.
- Resolución:
  - Si el destino está en la **misma unidad** que se renderiza → ancla `#<id>`, que también funciona dentro del PDF.
  - En cualquier otro caso → `/apuntes/<id>/`. En el PDF es la URL absoluta del sitio.
- Un destino inexistente, o privado desde contenido público, es un **error** con archivo y línea.

## 6. Imágenes, licencias y fuentes

### 6.1 Imágenes

- Sintaxis Markdown estándar: `![texto alternativo](./img/x.png)`.
- Atributos opcionales: `{.pequena}`, `{.mediana}`, `{.completa}` y `{.derecha}`, combinables. Se ven igual en web y PDF.
- Se renderiza como `<figure>`, con el texto alternativo como pie y la línea de crédito debajo.
- El texto alternativo vacío es un **error**.
- Una imagen remota (`http(s)://`) es un **error**.
- Una imagen sin ficha `.yml` hermana es un **error**.
- Optimización con el pipeline de imágenes de Astro.

### 6.2 Ficha de licencia (`<imagen>.yml`)

```yaml
autor: Usuario «Ehamberg», Wikimedia Commons
fuente: https://commons.wikimedia.org/wiki/File:…
licencia: CC-BY-SA-3.0
cambios: Traducida al castellano     # obligatorio si se ha modificado
titular: Microsoft Corporation       # obligatorio solo para licencia «marca»
```

- `autor: propio` → licencia CC BY-SA 4.0, sin `fuente` obligatoria.
- En los demás casos, `autor`, `fuente` y `licencia` son obligatorios.
- **Catálogo cerrado** (`src/licencias.ts`). Cada entrada tiene id, nombre, URL y reglas (`permiteCambios`, `noComercial`, `requiereTitular`). Ids iniciales:
  - `CC0-1.0` y `dominio-publico`
  - `CC-BY-4.0`, `CC-BY-SA-4.0`, `CC-BY-SA-3.0`, `CC-BY-NC-4.0`, `CC-BY-NC-SA-4.0` y `CC-BY-ND-4.0`
  - `MIT` y `Apache-2.0`
  - `marca`, para logotipos de terceros, que exige `titular`
- Reglas del build:
  - Una licencia fuera del catálogo es un **error**.
  - `cambios` con una licencia que no permite cambios (ND) es un **error**.
  - Las licencias NC se publican, pero su crédito lleva la marca «uso no comercial».
- Ampliar el catálogo es añadir una entrada en `src/licencias.ts`.

### 6.3 Dónde se muestran

1. **Bajo cada imagen:** *Autor · Licencia (enlace) · Fuente (enlace)* y, si aplica, «Modificada: …».
2. **Al final de cada unidad, en la web y en el PDF**, el apartado *Licencias y fuentes*:
   - la licencia del texto, con las piezas que tienen una licencia distinta;
   - la bibliografía, unión de los `fuentes` de sus piezas, sin duplicados;
   - una tabla de recursos de terceros: imagen, autor, licencia, fuente y cambios.
3. **`/licencias/`:** lo mismo para todo el sitio, más `contenido/creditos-sitio.yml`.
4. **Pie de todas las páginas:** «© Alejandro Bartolomé · CC BY-SA 4.0, salvo indicación expresa».

Toda esta información se obtiene con una única función reutilizable (`src/lib/creditos.ts`) que, dada una lista de piezas, devuelve sus créditos. La usarán la web, el PDF y el futuro generador de PPTX.

## 7. Aspecto visual

- Minimalista y centrado en el texto, pero llamativo para el alumnado.
- Recuadros mediante directivas Markdown (`::: ejercicio`, `::: nota`, `::: aviso`, `::: tip`), cada uno con un color y un icono propios. Un tipo desconocido es un **error**.
- `color` opcional por módulo, aplicado a la cabecera y a la portada del PDF.
- Diagramas Mermaid (bloques ```` ```mermaid ````) dibujados **en el navegador**: sin coste en el build y válidos para el PDF, que también se imprime desde un navegador.
- Se admiten tema claro y oscuro en la web. El PDF se imprime siempre en tema claro.

## 8. PDFs

### 8.1 Pipeline

`npm run build` = `astro build` + `node scripts/pdf.mjs`.

1. Sirve `dist/` con un servidor estático local, respetando `BASE_PATH`.
2. Para cada unidad de un módulo activo, calcula la **huella**: SHA-256 de
   - el HTML de la unidad;
   - el contenido de cada recurso local que referencia (CSS, JS, imágenes, tipografías);
   - la versión de `scripts/pdf.mjs` y la de Chromium.
3. Si `.cache/pdf/<huella>.pdf` existe, lo copia a `dist/pdf/<modulo>-<unidad>.pdf`. Si no, lo renderiza:
   - `page.goto` → `emulateMedia({ media: 'print' })`;
   - espera a la señal `window.__onyonListo === true`, que la página activa cuando terminan las tipografías, las imágenes y Mermaid;
   - `page.pdf({ format: 'A4', printBackground: true, displayHeaderFooter: true })`, con el pie «<MÓDULO> · <UNIDAD> · página X de Y».
4. Concurrencia configurable (por defecto, 4 páginas a la vez).
5. Al terminar, elimina de `.cache/pdf/` las huellas no usadas en este build.
6. Imprime un resumen con los PDFs renderizados, los reutilizados y el tiempo total.

### 8.2 CSS de impresión

En la misma hoja de estilos que la web, bajo `@media print`:
- portada con módulo, unidad, fecha de última modificación y licencia;
- índice;
- cada pieza empieza en una página nueva;
- las figuras, los recuadros y los bloques de código no se parten (`break-inside: avoid`);
- se ocultan la navegación y los botones;
- los enlaces siguen siendo clicables.

### 8.3 Fallos

- Un error de render o un tiempo de espera agotado (por defecto, 60 s por página) **detiene el build** e indica la unidad.
- En `astro dev` no se generan PDFs; la vista previa de impresión del navegador muestra el mismo resultado.

## 9. Errores, avisos e informes

| Situación | Nivel |
|---|---|
| Cabecera de pieza o índice inválido (campo que falta, desconocido o con tipo incorrecto) | Error (archivo y campo) |
| El índice referencia una pieza inexistente, o privada desde un módulo público | Error |
| Enlace wiki roto, o a contenido privado desde contenido público | Error (archivo y línea) |
| Imagen sin ficha, sin texto alternativo, remota o con licencia incoherente | Error |
| Id de pieza o de unidad duplicado | Error |
| Recuadro de tipo desconocido | Error |
| Falla el render de un PDF | Error |
| Unidad publicada con piezas en borrador | Aviso |
| Enlace a un borrador desde contenido publicado | Aviso |
| Pieza pública que no aparece en ningún módulo | Informe |

Los errores detienen tanto `astro dev` (con el overlay de error) como `astro build`.

## 10. Pruebas

- **Unitarias (Vitest)** sobre `src/lib/` y `src/plugins/`: esquemas, resolución de enlaces wiki, validación de fichas y reglas de licencia, cálculo de fechas, generación de créditos y cálculo de huellas.
- **Integración:** proyecto de contenido de prueba en `tests/fixtures/`, con un caso válido y un caso inválido por cada error de §9. Se comprueba que cada caso falla con el mensaje esperado.
- **Prueba de humo del PDF:** genera una unidad de prueba y verifica que el PDF existe, tiene al menos dos páginas y contiene los textos «Licencias y fuentes» y la fecha. Una segunda ejecución sin cambios debe reutilizarlo de la caché (0 renderizados).

## 11. Despliegue

GitHub Actions, en cada push a `main`:

1. `actions/checkout` con `fetch-depth: 0`.
2. Node LTS, `npm ci`.
3. Caché de los navegadores de Playwright y de `.cache/pdf/`.
4. `npm test` y después `npm run build` con `BASE_PATH=/onyon-knight/`.
5. `actions/upload-pages-artifact` + `actions/deploy-pages`.

El paso a un dominio propio o a la Raspberry Pi (rsync y Cloudflare Tunnel) solo cambia `BASE_PATH` y el paso 5.

## 12. Migración y alcance inicial

- **Objetivo para el 2026-10-13:** ASO y SOR publicados con todo lo descrito en §3-§11.
- Origen: `Personal Projects/OnyonKnight/contenido/aso` (14 archivos, unas 4.700 líneas, 2 imágenes) y `contenido/sor` (4 archivos, unas 2.800 líneas, 1 diagrama Mermaid).
- **Estrategia para cumplir el plazo:** cada archivo antiguo pasa a ser **una pieza** con la cabecera nueva. Más adelante se dividirá en piezas pequeñas, sin urgencia: el modelo N:M permite hacerlo sin romper URLs de módulo ni PDFs.
- Las conversiones son:
  - el front-matter antiguo pasa a la cabecera nueva y el índice del módulo se construye a partir de `tema` y `orden`;
  - los recuadros `::: nota/aviso/tip/ejercicio` ya son compatibles;
  - las rutas de imágenes se reescriben a `./img/`.
- Cada imagen migrada necesita su ficha, que se crea a mano; el build lista las que faltan.
- Los archivos que empiezan por `_` (los que ignoraba el build antiguo) **no tienen un destino automático**: el docente clasifica cada uno como
  - **privado** → carpeta privada;
  - **borrador** → pieza pública con `borrador: true`;
  - **antiguo** → no se migra y queda solo en el proyecto archivado.

  En ASO y SOR son dos: `aso/UD2…/_Gatos.md` y `aso/UD2…/_Expediente 02 - Las llaves del almacen.md`. La clasificación se decide durante la migración.
- Se puede usar un script auxiliar de migración. Es desechable y no forma parte del producto.

## 13. Fuera de alcance (este subproyecto)

- Generación de PPTX y modo presentación (subproyecto 2). El núcleo solo garantiza que el contenido sea reutilizable: recuadros y figuras como nodos del árbol Markdown, y créditos accesibles desde `src/lib/creditos.ts`.
- Migración de los módulos que no son ASO ni SOR (ISO, SRI, PSP, SOM, Python, Montaje, Redes).
- Hosting en la Raspberry Pi.
- Búsqueda, publicación programada por fecha y mapeo a RA/CE.

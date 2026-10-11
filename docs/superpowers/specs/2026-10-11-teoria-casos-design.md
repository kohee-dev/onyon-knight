# Onyon Knight · Teoría y casos prácticos — Diseño

- **Fecha:** 2026-10-11
- **Estado:** aprobada (2026-10-11)
- **Amplía:** `docs/superpowers/specs/2026-10-11-web-docente-nucleo-design.md` (núcleo). Todo lo que este documento no cambia sigue como allí.

## 1. Propósito

Separar en cada unidad la **teoría** de los **casos prácticos**. Las dos se definen así:

- **Teoría:** contenido para estudiar. Puede incluir ejercicios y entregas (recuadros `:::ejercicio`).
- **Caso práctico:** un ejercicio de principio a fin.

En la presentación:

- La teoría se lee seguida en la página de la unidad, con un **índice lateral** para moverse por ella.
- Los casos se presentan como **tarjetas** dentro de la unidad (título, duración, portada) y tienen **página propia**, con una imagen de cabecera, y **PDF propio**.

## 2. Decisiones tomadas

| Tema | Decisión |
|---|---|
| Dónde se declara el tipo | En la cabecera de la pieza: `tipo: teoria \| caso` (por defecto `teoria`) |
| Índice del módulo | Sin cambios: teoría y casos van juntos en `piezas:`; el orden de la lista es el de la teoría y el de las tarjetas |
| Portada / cabecera | `portada` = imagen de la tarjeta; `cabecera` = banner de la página del caso |
| Imágenes de los casos | Obligatorias, pero mientras falten se usa una imagen genérica propia y el build avisa |
| PDF | Un PDF de teoría por unidad (`/pdf/<m>-<u>.pdf`) y un PDF por caso y unidad (`/pdf/<m>-<u>/<id>.pdf`) |
| Índice | Lateral fijo desde 1280 px; por debajo, un botón de hamburguesa en la cabecera abre un panel |

## 3. Modelo de contenido

### 3.1 Cabecera de la pieza (campos nuevos)

| Campo | Tipo | Obligatorio | Uso |
|---|---|---|---|
| `tipo` | `teoria` \| `caso` | no (por defecto `teoria`) | Tipo de pieza |
| `horas` | número > 0 (admite decimales) | sí en los casos; **prohibido** en la teoría | Duración estimada |
| `portada` | ruta relativa a una imagen | no (si falta: genérica + aviso); **prohibido** en la teoría | Imagen de la tarjeta |
| `cabecera` | ruta relativa a una imagen | no (si falta: genérica + aviso); **prohibido** en la teoría | Banner de la página del caso |

El resto de campos (`titulo`, `resumen`, `borrador`, `fuentes`, `licencia`) no cambia. En un caso, `resumen` se muestra en la tarjeta.

Ejemplo:

```yaml
titulo: "Gatos: los gatos de Elpis"
tipo: caso
horas: 6
portada: ./img/gatos-portada.jpg
cabecera: ./img/gatos-cabecera.jpg
resumen: Elpis necesita un directorio para sus cuatro sedes.
```

### 3.2 Imágenes de portada y cabecera

- Siguen las mismas reglas que las imágenes del texto (spec del núcleo §6):
  - ruta local y relativa a la pieza;
  - ficha `.yml` hermana obligatoria y validada con el catálogo de licencias;
  - prohibidas las remotas;
  - si el archivo no existe, error con el archivo y el campo.
- **Créditos:** entran en *Licencias y fuentes* (de la unidad, si es la portada de una tarjeta suya, y del caso) y en `/licencias/`.
- **Fechas:** sus archivos y sus fichas cuentan para la fecha de la pieza (§5.2 del núcleo).
- **Publicación:** se publican por el endpoint de imágenes, como el resto de imágenes usadas (§6.1 del núcleo).

### 3.3 Imagen genérica

- Si a un caso le falta `portada` o `cabecera`, se usa una ilustración SVG generada en el build: el fondo con el color de la categoría del módulo (claro u oscuro según el modo) y el icono del módulo centrado.
  - Proporciones: 16:9 para la portada y 16:5 para la cabecera.
  - El módulo de referencia es el de la unidad que se está mostrando. En `/apuntes/<id>/`, el de la primera aparición del caso.
- Es contenido propio: no necesita ficha ni aparece en *Recursos de terceros*.
- El build emite un aviso por campo que falta, sin duplicados: `caso sin portada: <id>` y `caso sin cabecera: <id>`.

### 3.4 Validación

| Situación | Nivel |
|---|---|
| `tipo` distinto de `teoria` o `caso` | Error (indica los valores válidos) |
| Caso sin `horas`, o con `horas` ≤ 0 | Error |
| `horas`, `portada` o `cabecera` en una pieza de teoría | Error |
| `portada` o `cabecera` inexistente, remota, sin ficha o con licencia incoherente | Error (archivo y campo) |
| Caso sin `portada` o sin `cabecera` | Aviso |

## 4. Páginas y rutas

### 4.1 Página de unidad (`/<modulo>/<unidad>/`)

En este orden:

1. Cabecera (como ahora), con la fecha y el botón **«PDF de teoría»**. Si la unidad no tiene teoría, no hay botón.
2. Las piezas de **teoría**, en el orden del índice.
3. La sección **«Casos prácticos»**, si la unidad tiene casos: una rejilla de tarjetas, en el orden del índice. Cada tarjeta lleva:
   - la portada (16:9, recortada para encajar);
   - el chip «Caso práctico», el título, la duración («6 h», «1,5 h») y la fecha;
   - el `resumen`, si existe;
   - un enlace a la página del caso en esa unidad.
4. *Licencias y fuentes*: las de la teoría más las portadas de las tarjetas.

La fecha de la unidad sigue siendo la más reciente de todas sus piezas, casos incluidos, y de su bloque en el índice.

### 4.2 Página del caso (`/<modulo>/<unidad>/casos/<id>/`)

- Existe una por cada unidad (activa) que contiene el caso.
- Contenido, en este orden:
  1. migas (Inicio › Módulo › Unidad);
  2. **banner** con la imagen de cabecera (16:5, recortada para encajar, a todo el ancho del texto);
  3. título, chip «Caso práctico», duración y fecha;
  4. botón «PDF del caso»;
  5. índice;
  6. el contenido;
  7. *Licencias y fuentes* del caso, incluidas la portada y la cabecera.
- `/apuntes/<id>/` sigue existiendo para todas las piezas. En los casos muestra también el banner y la duración.

### 4.3 Enlaces `[[id]]`

- En la página de una unidad solo se renderiza la teoría. Por tanto, el «conjunto de piezas de la unidad» que usa la resolución de enlaces (§5.3 del núcleo) es solo la **teoría** de la unidad.
- Enlaces a un caso:
  - si está en la misma unidad, van a su página en esa unidad, `…/<modulo>/<unidad>/casos/<id>/`;
  - si no, van a `/apuntes/<id>/`.
- Dentro de la página de un caso, el «conjunto de la unidad» es el propio caso, así que los enlaces a sí mismo son anclas.
- Los enlaces a la teoría de la unidad van a `/<modulo>/<unidad>/#<id>`.
- Como hasta ahora, los enlaces que no son anclas son absolutos dentro de una unidad, por el PDF.

### 4.4 Índice

- **Páginas con índice:** la de unidad (si tiene teoría) y la de cada caso.
- **Entradas:**
  - en la unidad, cada pieza de teoría con sus títulos `titulo-1`, sangrados;
  - en el caso, los títulos `titulo-1` y `titulo-2`.
- **Desde 1280 px de ancho:**
  - el índice está **fijo a la derecha** del texto, con su propio desplazamiento si es largo;
  - lleva una línea vertical dorada y la sección actual resaltada en acero (`IntersectionObserver`);
  - al pulsar una entrada, la página se desplaza a esa sección.
- **Por debajo de 1280 px:**
  - en la cabecera aparece un **botón «Índice»** con icono de hamburguesa, junto al botón de modo, y solo en las páginas con índice;
  - abre un **panel lateral** desde la derecha con el mismo índice y la misma sección resaltada;
  - el panel se cierra al elegir una entrada, con `Esc`, con su botón de cerrar o tocando fuera;
  - accesibilidad: `aria-expanded` y `aria-controls` en el botón, el foco pasa al panel al abrirlo y vuelve al botón al cerrarlo.
- **Sin JavaScript:** el botón no aparece y el índice se muestra como bloque al principio del contenido.
- **Al imprimir:** no aparecen ni el botón ni el panel. El índice impreso del PDF de la unidad sigue como ahora.

## 5. PDFs

### 5.1 PDF de teoría de la unidad (`/pdf/<modulo>-<unidad>.pdf`)

- Contiene solo la teoría, con la misma portada, índice y *Licencias y fuentes* (de la teoría) que ahora.
- Termina con una página **«Casos prácticos de esta unidad»**: cada caso con su título, su duración y los enlaces absolutos a su página y a su PDF.
- Si la unidad no tiene teoría, **no se genera** y no aparece su botón.

### 5.2 PDF del caso (`/pdf/<modulo>-<unidad>/<id>.pdf`)

La subcarpeta por unidad evita choques: `aso-ut1-gatos.pdf` podría ser a la vez el caso `gatos` de la UT1 y la unidad `ut1-gatos`.


- **Portada propia:**
  - la imagen de cabecera (o la genérica) arriba;
  - el módulo y la unidad;
  - el chip «Caso práctico», el título, la duración, la fecha y la licencia;
  - a la izquierda, la franja de color de la categoría.
- Después, el contenido del caso y sus *Licencias y fuentes*.
- Pie de página: «<MÓDULO> · <UNIDAD> · Caso práctico · página X de Y».
- Se genera uno por cada unidad (activa) que contiene el caso.

### 5.3 Generación

- `pdf-manifest.json` lista unidades (las que tienen teoría) y casos.
- Cada entrada: `{ tipo: 'unidad' | 'caso', modulo, unidad, caso?, ruta, salida, pie }`.
- `scripts/pdf.mjs` no cambia de lógica: misma huella, caché, concurrencia y fallo.

## 6. Pruebas

- **Esquema:**
  - los valores de `tipo`;
  - `horas` obligatoria y positiva en los casos;
  - `horas`, `portada` y `cabecera` prohibidas en la teoría.
- **Render:**
  - la portada y la cabecera se validan con su ficha (sin ficha, remota o inexistente da error);
  - entran en los créditos y cuentan para la fecha;
  - si faltan, se usa la imagen genérica y se emiten los avisos.
- **Páginas** (build del fixture, ampliado con un caso con imágenes y otro sin ellas):
  - la unidad muestra la teoría y las tarjetas en el orden del índice;
  - la tarjeta tiene portada, duración y enlace;
  - existe `/<m>/<u>/casos/<id>/` con su banner y su índice;
  - un `[[caso]]` desde la teoría apunta a la página del caso;
  - el botón «Índice» tiene `aria-expanded`;
  - una unidad solo con casos no tiene botón de PDF de teoría.
- **PDF:**
  - el PDF del caso existe y contiene el título, la duración y «Licencias y fuentes»;
  - el PDF de la unidad termina con «Casos prácticos de esta unidad»;
  - una unidad sin teoría no genera PDF de unidad;
  - una segunda ejecución reutiliza todos los PDFs.
- **Comprobación visual:**
  - tarjetas, página del caso e imagen genérica, en los dos modos;
  - índice lateral en escritorio y panel en móvil (375 px, sin desplazamiento horizontal);
  - un PDF de caso.

## 7. Migración

Se marcan como `tipo: caso`, con las `horas` de la web anterior, los casos que allí eran «caso práctico»:

| Pieza | `horas` | Estado |
|---|---|---|
| `opera-jidoor` (La Ópera de Jidoor) | 8 | publicado |
| `caso-servicios-directorio` | 2 | publicado (el `tipo: "borrador"` local del docente pasa a `tipo: caso`) |
| `gatos-elpis` (Gatos: los gatos de Elpis) | 6 | publicado |
| `procesos-sala-maquinas` (Sala de máquinas) | 4 | sigue en borrador |
| `procesos-espectro` (El Espectro de la Máquina) | 9 | sigue en borrador |

- «De la consola al escritorio» (SOR UT0) sigue siendo teoría: tiene una entrega, pero es material de estudio, no un ejercicio de principio a fin.
- Ningún caso tiene aún imágenes: todos usan la genérica, con su aviso, hasta que el docente añada portada y cabecera con su ficha.

## 8. Fuera de alcance

- La página «Sobre mí» y el blog.
- Los PPTX (subproyecto 2).
- Imágenes reales de los casos: las aporta el docente.

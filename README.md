# Onyon Knight

Este proyecto busca **crear, compartir y mantener apuntes docentes** de Formación Profesional de Informática: Grado Básico, SMR, ASIR y DAM.

Los apuntes se leen en <https://kohee-dev.github.io/onyon-knight/>, y cada unidad y cada caso práctico se pueden descargar en PDF.

## Crear

Los apuntes se escriben en piezas pequeñas que se combinan entre sí. Un mismo tema puede formar parte de varios módulos sin copiarlo. Así, cada explicación se escribe una sola vez y se mejora en un solo sitio.

Hay dos tipos de contenido:

- **Teoría**: el material de estudio, que puede incluir ejercicios y entregas.
- **Casos prácticos**: ejercicios completos de principio a fin, casi siempre dentro de una historia (una ópera en apuros, un puerto con barcos que no encuentran amarre, una tienda de aventureros…) para que lo aprendido tenga sentido.

## Compartir

Todo el material es abierto. Cualquiera puede leerlo, imprimirlo, usarlo en clase y adaptarlo, sin fines comerciales y siempre que respete su licencia.

Por eso cada recurso dice de dónde viene:

- Cada imagen lleva su ficha con el autor, la licencia y la fuente. Si una imagen no tiene esa información, no se publica.
- Los apuntes adaptados de otros docentes citan su origen y conservan la licencia original.
- Cada página y cada PDF terminan con su apartado de licencias y fuentes.

## Mantener

Un apunte no se termina nunca: cambian las versiones, aparecen erratas y se encuentran formas mejores de explicar las cosas. Cada página muestra la fecha de su última modificación, para que quien la lea sepa si está al día.

Si encuentras un error o tienes una sugerencia, abre una [incidencia](https://github.com/kohee-dev/onyon-knight/issues).

## Usar el proyecto

Con una copia del repositorio puedes ver los apuntes en tu equipo, escribir los tuyos y publicar tu propia versión de la web.

### Requisitos

- [Git](https://git-scm.com/).
- [Node.js](https://nodejs.org/) 22.12 o posterior, que incluye `npm`.

### Instalar

```bash
git clone https://github.com/kohee-dev/onyon-knight.git
cd onyon-knight
npm ci
```

Clona el repositorio completo, sin `--depth`: la fecha de última modificación de cada página se obtiene del historial de git.

### Ver la web mientras escribes

```bash
npm run dev
```

La web se abre en <http://localhost:4321> y se actualiza sola al guardar un archivo. Si una pieza tiene un error (un campo que falta, un enlace a una pieza que no existe, una imagen sin ficha), el error indica el archivo y el motivo.

### Escribir apuntes

El contenido está en `contenido/`:

| Ruta | Qué contiene |
| --- | --- |
| `contenido/piezas/<módulo>/<tema>/<id>.md` | Cada pieza, en Markdown. El nombre del archivo es su identificador y no puede repetirse en todo el proyecto. |
| `contenido/modulos/<módulo>.yml` | Cada módulo: su nombre, código, ciclo, curso, icono y unidades. Cada unidad enumera sus piezas por identificador. |
| `contenido/creditos-sitio.yml` | Las herramientas y recursos con los que está hecha la web. |

Una pieza empieza con una cabecera YAML:

```markdown
---
titulo: "Contenedores con Docker"
licencia: CC-BY-NC-SA-4.0
tipo: caso        # teoria (por defecto) o caso
horas: 3          # obligatorio en los casos
dificultad: intermedio  # basico, intermedio o avanzado (opcional)
resumen: Una frase sobre lo que se hace.
fuentes:
  - "Autor. Título. https://…"
---
```

Otros campos: `borrador: true` (la pieza se ve en `npm run dev`, pero no se publica) y, solo en los casos, `portada` y `cabecera` con la ruta de una imagen.

**Dificultad.** Cada carpeta de piezas es un *bloque*. Un archivo `bloque.yml` en ella fija la dificultad de todas sus piezas:

```yaml
dificultad: intermedio
```

Una pieza que indique `dificultad` en su cabecera sustituye la del bloque. Si no hay ni una ni otra, no se muestra el indicador, y al generar la web aparece el aviso `bloque sin dificultad: <carpeta> (N piezas sin la suya)`.

Para que una pieza aparezca en la web, añade su identificador a las `piezas` de una unidad en el `.yml` del módulo. Una misma pieza puede estar en varios módulos.

Dentro del texto se usa:

- **Recuadros**: `:::nota[Título]`, `:::aviso[…]`, `:::tip[…]` y `:::ejercicio[…]`, cerrados con `:::`.
- **Enlaces a otras piezas**: `[[id]]` o `[[id|texto del enlace]]`. Los enlaces relativos a archivos no se admiten.
- **Diagramas**: bloques de código `mermaid`.
- **Imágenes**: solo locales, junto a la pieza (por ejemplo, en `img/`). Cada imagen necesita al lado una ficha con el mismo nombre y extensión `.yml`, con `autor`, `fuente` y `licencia`. Sin ficha, la web no se genera.

### Apuntes privados

Para trabajar con material que no quieres publicar, guárdalo en una carpeta **fuera** del repositorio, con la misma estructura (`piezas/…`), e indícala al arrancar:

```bash
ONYON_PRIVADO=../onyon-privado npm run dev
```

Esas piezas solo se ven con `npm run dev`; nunca entran en la web generada.

### Comprobar y generar la web

```bash
npm test
npx playwright install chromium
npm run build
npm run preview
```

`npm test` ejecuta las pruebas. `npm run build` genera la web en `dist/` y después los PDF, que se imprimen con Chromium: por eso hace falta instalarlo una vez con Playwright. `npm run preview` sirve el resultado para revisarlo antes de publicarlo.

### Publicar tu versión

El repositorio incluye un flujo de GitHub Actions ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) que, en cada `push` a `main`, ejecuta las pruebas, genera la web y la publica en GitHub Pages. Para usarlo en tu copia:

1. Haz un *fork* del repositorio en GitHub.
2. En *Settings → Pages*, elige *GitHub Actions* como origen (*Source*).
3. Sube tus cambios a `main`. La web queda en `https://<tu-usuario>.github.io/<nombre-del-repositorio>/`.

Recuerda respetar la licencia de los apuntes: puedes adaptarlos, pero sin fines comerciales, citando su origen y con la misma licencia.

## Licencia

- **Apuntes** (`contenido/`): [Onyon Knight](https://kohee-dev.github.io/onyon-knight/) © 2026 de [Alejandro Bartolomé Fernández](https://github.com/kohee-dev) está bajo licencia [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/), salvo que la ficha de una imagen indique otra licencia.
- **Código de la web** (todo lo demás): [MIT](LICENSE).

Los detalles están en [LICENSE](LICENSE) y en la página [Licencias y fuentes](https://kohee-dev.github.io/onyon-knight/licencias/).

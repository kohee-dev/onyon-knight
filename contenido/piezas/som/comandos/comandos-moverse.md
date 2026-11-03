---
titulo: "Comandos 1: moverse por el sistema"
tipo: teoria
---

# Comandos 1: moverse por el sistema

Una **terminal** es una ventana donde escribes órdenes y el sistema las ejecuta. Lo primero que necesitas saber es dónde estás y cómo ir a otra carpeta. Esta pieza es la base de todas las demás de la serie.

## Lo mínimo para empezar

Cuando abres la terminal ves una línea que termina en `$`, el **prompt**. Todo lo que escribes va detrás y se ejecuta al pulsar Intro.

| Orden | Qué hace |
|---|---|
| `pwd` | escribe la carpeta en la que estás (su **ruta completa**) |
| `ls` | lista lo que hay en la carpeta actual |
| `ls carpeta` | lista lo que hay en esa carpeta, sin entrar en ella |
| `ls -a` | lista también los ficheros **ocultos**, los que empiezan por punto |
| `ls -l` | lista con una línea por fichero y más datos |
| `cd carpeta` | entra en esa carpeta |
| `cd ..` | sube a la carpeta de arriba |
| `cd` o `cd ~` | va a tu carpeta personal |
| `cd -` | vuelve a la carpeta donde estabas antes |
| `clear` | limpia la pantalla |

Algunas ideas que se repiten en todo Linux:

- Las carpetas forman un **árbol** que empieza en `/` (la raíz). Tu carpeta personal es algo como `/home/alex`, y se puede escribir también como `~`.
- Una ruta que empieza por `/` es **absoluta**: vale desde cualquier sitio. Una ruta que no empieza por `/` es **relativa**: se cuenta desde la carpeta en la que estás.
- `.` es la carpeta actual y `..` es la de arriba, así que `../musica` significa «sube y entra en `musica`».
- Linux **distingue mayúsculas de minúsculas**: `Documentos` y `documentos` son nombres distintos.
- Con la tecla **Tab** el sistema completa el nombre que estás escribiendo, y con la flecha **arriba** recuperas la orden anterior. Úsalas siempre.
- Casi todas las órdenes tienen una ayuda: `orden --help` la escribe en pantalla y `man orden` abre el manual (se sale con `q`).

Los ejercicios usan esta carpeta personal de ejemplo, la de el usuario `alex`:

```text
/home/alex
├── descargas
│   └── foto.png
├── documentos
│   ├── cartas
│   │   ├── carta1.txt
│   │   └── carta2.txt
│   ├── .borrador
│   └── notas.txt
└── musica
```

## Ejercicios

### 1. Bajar por las carpetas

Estás en `/home/alex`. Lee estas órdenes:

```bash
cd documentos
cd cartas
pwd
```

:::pregunta[¿Qué escribe `pwd`?]
```text
/home/alex/documentos/cartas
```

Cada `cd` entra en una carpeta que está dentro de la actual, y `pwd` escribe la ruta completa de donde has terminado.
:::

### 2. Subir

Sigues en `/home/alex/documentos/cartas`. Lee estas órdenes:

```bash
cd ..
cd ..
pwd
```

:::pregunta[¿Qué escribe `pwd`?]
```text
/home/alex
```

Cada `cd ..` sube un nivel: primero a `documentos` y después a `alex`.
:::

### 3. Una ruta que no existe

Estás en `/home/alex`. Lee esta orden:

```bash
cd /documentos
```

:::pregunta[¿Qué ocurre? ¿Cuál es la ruta correcta?]
Falla con un mensaje parecido a `No existe el archivo o el directorio` (el idioma depende del sistema) y te quedas donde estabas.

La barra del principio hace la ruta **absoluta**: busca `documentos` dentro de la raíz `/`, y allí no está. Desde `/home/alex` bastaba `cd documentos`, o `cd /home/alex/documentos` con la ruta absoluta.
:::

### 4. Volver a casa

Estás en `/home/alex/documentos/cartas`. Lee estas órdenes:

```bash
cd ~
pwd
cd documentos
cd
pwd
```

:::pregunta[¿Qué escribe cada `pwd`?]
```text
/home/alex
/home/alex
```

`~` es tu carpeta personal, así que `cd ~` te lleva a casa desde cualquier sitio. `cd` sin nada detrás hace lo mismo.
:::

### 5. Volver atrás

Lee estas órdenes:

```bash
cd /tmp
cd /home/alex/musica
cd -
pwd
```

:::pregunta[¿Qué escriben `cd -` y `pwd`?]
```text
/tmp
/tmp
```

`cd -` vuelve a la carpeta anterior, y escribe su ruta para que sepas dónde has caído. Es muy cómodo para ir y venir entre dos carpetas lejanas.
:::

### 6. Mirar sin entrar

Estás en `/home/alex`. Lee estas órdenes:

```bash
ls documentos
ls -a documentos
```

:::pregunta[¿Qué escribe cada una?]
La primera escribe `cartas  notas.txt`. La segunda escribe además `.`, `..` y `.borrador`, de modo que salen cinco entradas.

`ls` esconde lo que empieza por punto. `-a` (de *all*) lo enseña, y con ello aparecen `.` y `..`, que existen en todas las carpetas. En pantalla saldrán en columnas, y el orden puede variar un poco según el idioma del sistema.
:::

### 7. Tres caminos a la misma carpeta

Estás en `/home/alex/descargas` y quieres ir a `/home/alex/documentos/cartas`.

:::pregunta[Escribe tres órdenes `cd` distintas que lleguen a ella]
```bash
cd /home/alex/documentos/cartas
cd ../documentos/cartas
cd ~/documentos/cartas
```

La primera es absoluta. La segunda es relativa: sube a `alex` y baja por `documentos`. La tercera usa `~` como atajo de `/home/alex`.
:::

### 8. Un error de mayúsculas

Estás en `/home/alex` y escribes:

```bash
cd Documentos
```

:::pregunta[¿Por qué falla? ¿Qué tecla evita este error?]
Falla porque la carpeta se llama `documentos`, con minúscula, y Linux distingue mayúsculas de minúsculas.

Si escribes `cd doc` y pulsas **Tab**, el sistema completa el nombre real de la carpeta, y si no existe no completa nada, que ya es una pista.
:::

## Hazlo tú

Ahora a la terminal. Guarda este script como `preparar-1.sh` y ejecútalo con `bash preparar-1.sh`. Crea una carpeta `practica` en tu carpeta personal, con esta forma:

```text
practica
├── almacen
│   ├── pasillo1
│   ├── pasillo2   (con ficheros dentro)
│   └── pasillo3
└── oficina
    ├── contabilidad
    │   ├── 2024
    │   └── 2025
    ├── recursos-humanos
    └── sala-juntas
```

```bash
rm -rf ~/practica
mkdir -p ~/practica/oficina/contabilidad/2024 ~/practica/oficina/contabilidad/2025 \
         ~/practica/oficina/recursos-humanos ~/practica/oficina/sala-juntas \
         ~/practica/almacen/pasillo1 ~/practica/almacen/pasillo2 ~/practica/almacen/pasillo3
touch ~/practica/almacen/pasillo2/{a.txt,b.txt,.oculto1,.oculto2,.oculto3}
echo "Carpeta ~/practica preparada"
```

### 9. A la contabilidad de 2025

Desde tu carpeta personal, llega a la carpeta `2025` de contabilidad con una sola orden `cd`, y comprueba con `pwd` dónde estás.

:::pregunta[Escribe la orden y lo que escribe `pwd`]
```bash
cd practica/oficina/contabilidad/2025
pwd
```

La salida es la ruta completa, que empieza por tu carpeta personal, por ejemplo `/home/alex/practica/oficina/contabilidad/2025`.
:::

### 10. Al pasillo 3

Sin salir de la terminal y **sin escribir ninguna ruta absoluta**, ve desde donde estás hasta `pasillo3` del almacén. Demuestra dónde has acabado.

:::pregunta[Escribe la orden y cómo lo demuestras]
```bash
cd ../../../almacen/pasillo3
pwd
```

Hay que subir tres niveles (`2025`, `contabilidad` y `oficina`) hasta `practica`, y bajar por `almacen`. Vale cualquier otra ruta relativa que llegue; por ejemplo `cd ~/practica/almacen/pasillo3`, que usa `~` pero no es absoluta.
:::

### 11. Contar sin entrar

Sin entrar en ninguna carpeta, averigua cuántas carpetas hay dentro de `oficina` y cuántos ficheros ocultos tiene `pasillo2`. Después vuelve a tu carpeta personal con una orden y demuestra que estás en ella.

:::pregunta[Escribe las órdenes y las respuestas]
`oficina` tiene **3** carpetas (`contabilidad`, `recursos-humanos` y `sala-juntas`) y `pasillo2` tiene **3** ficheros ocultos (`.oculto1`, `.oculto2` y `.oculto3`).

```bash
ls ~/practica/oficina
ls -a ~/practica/almacen/pasillo2
cd
pwd
```

El segundo `ls` enseña también `.` y `..`, que no son ficheros ocultos de verdad: hay que descontarlos.
:::

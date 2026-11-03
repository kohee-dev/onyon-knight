---
titulo: "Comandos 2: leer ficheros"
tipo: teoria
---

# Comandos 2: leer ficheros

En Linux casi todo es un fichero de texto: la configuración, los registros, las listas. Saber leerlos desde la terminal es la mitad del trabajo de un administrador, y lo primero que se hace en cualquier reto online.

## Lo mínimo para empezar

| Orden | Qué hace |
|---|---|
| `cat fichero` | escribe todo el contenido del fichero |
| `cat f1 f2` | escribe uno detrás de otro (de ahí su nombre: *concatenar*) |
| `less fichero` | muestra el fichero página a página |
| `head -n 3 fichero` | escribe las 3 primeras líneas |
| `tail -n 3 fichero` | escribe las 3 últimas líneas |
| `wc -l fichero` | cuenta las líneas (`-w` palabras, `-c` bytes) |
| `file fichero` | dice de qué **tipo** es: texto, carpeta, imagen... |
| `ls -l` | lista con una línea por fichero, con su tamaño en bytes |
| `ls -lh` | igual, con el tamaño legible (`4,0K`, `1,2M`) |

Para moverte dentro de `less`: **espacio** avanza una página, **b** retrocede, `/palabra` busca una palabra (con **n** saltas a la siguiente coincidencia) y **q** sale.

Dos casos que dan problemas y que aparecen mucho en los retos:

- **Nombres con espacios.** La terminal separa las palabras por espacios, así que `cat mi lista.txt` busca dos ficheros. Hay que proteger el nombre con comillas (`cat "mi lista.txt"`) o con una barra invertida (`cat mi\ lista.txt`). El tabulador lo hace solo.
- **Nombres que empiezan por guion.** `cat -viaje.txt` interpreta `-viaje.txt` como opciones. Se evita con una ruta (`cat ./-viaje.txt`) o con `--`, que significa «aquí se acaban las opciones» (`cat -- -viaje.txt`).

Antes de hacer `cat` de un fichero que no conoces, mira de qué tipo es con `file`: si es binario, `cat` llena la pantalla de símbolos raros. Si te ocurre, escribe `reset` y Intro.

Los ejercicios usan estos ficheros, que están juntos en una carpeta:

```text
# compra.txt
pan
leche
huevos
queso
fruta
```

```text
# notas.txt
alta
media
baja
```

También hay una carpeta `documentos`, un fichero llamado `mi lista.txt` que contiene `uno`, y otro llamado `-viaje.txt` que contiene `viaje`.

## Ejercicios

### 1. Leer un fichero

Lee esta orden:

```bash
cat compra.txt
```

:::pregunta[¿Qué escribe?]
```text
pan
leche
huevos
queso
fruta
```

`cat` escribe el fichero entero, línea a línea.
:::

### 2. El principio y el final

Lee estas dos órdenes:

```bash
head -n 2 compra.txt
tail -n 2 compra.txt
```

:::pregunta[¿Qué escribe cada una?]
```text
pan
leche
queso
fruta
```

`head` se queda con las dos primeras líneas y `tail` con las dos últimas.
:::

### 3. Contar

Lee estas tres órdenes:

```bash
wc -l compra.txt
wc -w compra.txt
wc -c compra.txt
```

:::pregunta[¿Qué escribe cada una?]
```text
5 compra.txt
5 compra.txt
29 compra.txt
```

Hay 5 líneas y 5 palabras (una por línea). Los bytes son 29: las 24 letras de las cinco palabras más los 5 saltos de línea, que también ocupan un byte cada uno.
:::

### 4. Dos ficheros seguidos

Lee esta orden:

```bash
cat compra.txt notas.txt
```

:::pregunta[¿Qué escribe?]
```text
pan
leche
huevos
queso
fruta
alta
media
baja
```

`cat` escribe `compra.txt` entero y a continuación `notas.txt`, sin separación entre ellos.
:::

### 5. ¿Qué tipo de fichero es?

Lee estas dos órdenes:

```bash
file compra.txt
file documentos
```

:::pregunta[¿Qué escribe cada una?]
```text
compra.txt: ASCII text
documentos: directory
```

`file` no mira la extensión del nombre, mira el contenido. Una carpeta (*directory*) es también un tipo de fichero. Si el texto lleva tildes dirá `UTF-8 text` en vez de `ASCII text`.
:::

### 6. Un nombre con espacios

Lee esta orden:

```bash
cat mi lista.txt
```

:::pregunta[¿Qué ocurre? Escribe dos formas correctas de leer el fichero]
Da dos errores, uno por `mi` y otro por `lista.txt`, con el mensaje de que no existen: la terminal ha entendido dos ficheros distintos.

```bash
cat "mi lista.txt"
cat mi\ lista.txt
```

Las dos escriben `uno`. Con Tab después de `cat mi` el sistema completa el nombre y pone la barra invertida solo.
:::

### 7. Un nombre que empieza por guion

Lee esta orden:

```bash
cat -viaje.txt
```

:::pregunta[¿Qué ocurre? Escribe dos formas correctas de leer el fichero]
Falla con un mensaje que dice que `i` no es una opción válida: `cat` ha leído `-viaje.txt` como las opciones `-v`, `-i`, `-a`... y no como un nombre.

```bash
cat ./-viaje.txt
cat -- -viaje.txt
```

Las dos escriben `viaje`. Con `./` el nombre ya no empieza por guion, y con `--` le dices a `cat` que lo que viene detrás no son opciones.
:::

### 8. Leer una línea de `ls -l`

Esta es una línea de la salida de `ls -l`:

```text
-rw-r--r-- 1 alex alex 29 mar  3 10:15 compra.txt
```

:::pregunta[¿Cuántos bytes pesa el fichero y cómo se llama? ¿Quién es su dueño?]
Pesa **29 bytes** y se llama `compra.txt`. Su dueño es `alex` (el primer nombre; el segundo es el grupo).

La línea se lee así: tipo y permisos, número de enlaces, dueño, grupo, tamaño en bytes, fecha y hora de la última modificación y nombre. Los permisos se explican en la pieza 4.
:::

### 9. Salir de `less`

Abres un fichero largo con `less registro.txt` y quieres buscar la palabra `error` y salir después.

:::pregunta[¿Qué teclas usas?]
Escribes `/error` y pulsas Intro para buscar, **n** para pasar a la siguiente coincidencia y **q** para salir.

`less` no se cierra con Intro ni con Ctrl+C: la tecla de salida es **q**.
:::

## Hazlo tú

Guarda este script como `preparar-2.sh` y ejecútalo con `bash preparar-2.sh`. Crea una carpeta `buzon` dentro de `practica` (y `practica` si no existía) con cartas, un registro largo y una carpeta de paquetes.

```bash
rm -rf ~/practica/buzon
mkdir -p ~/practica/buzon/paquetes
cd ~/practica/buzon
echo "ROBLE-4821" > ./-
echo "OLMO-1357" > "mis cartas.txt"
echo "PINO-9034" > .escondido
echo "HAYA-2468" > ./-viaje.txt
{
    echo "CLAVE-INICIO: ABETO-1010"
    for n in $(seq 2 99); do echo "relleno $n"; done
    echo "CLAVE-FINAL: CEDRO-7712"
} > registro.txt
cd paquetes
printf '\000\001\002\003' > p1
printf '\200\000\377' > p2
echo "SAUCE-5566" > p3
printf '\000\001\377' > p4
echo "Carpeta ~/practica/buzon preparada"
```

En la carpeta `buzon` hay varias **claves** con forma `PALABRA-0000`. Las vas a encontrar todas.

### 10. Cuatro ficheros incómodos

En `buzon` hay un fichero que se llama `-`, otro con espacios (`mis cartas.txt`), otro cuyo nombre empieza por guion (`-viaje.txt`) y otro oculto. Lee la clave de cada uno.

:::pregunta[Escribe las cuatro órdenes y las cuatro claves]
```bash
cd ~/practica/buzon
cat ./-
cat "mis cartas.txt"
cat ./-viaje.txt
cat .escondido
```

Las claves son `ROBLE-4821`, `OLMO-1357`, `HAYA-2468` y `PINO-9034`. Para el fichero oculto hace falta saber que existe: se ve con `ls -a`. Para el que se llama solo `-`, `cat -` no sirve (esperaría que escribieras algo); hay que darle una ruta.
:::

### 11. El registro largo

El fichero `registro.txt` tiene muchas líneas. Averigua cuántas tiene, y escribe la clave de su primera línea y la de la última, sin abrirlo entero.

:::pregunta[Escribe las órdenes y las respuestas]
```bash
wc -l registro.txt
head -n 1 registro.txt
tail -n 1 registro.txt
```

Tiene **100** líneas. La primera dice `CLAVE-INICIO: ABETO-1010` y la última `CLAVE-FINAL: CEDRO-7712`.
:::

### 12. El único fichero de texto

La carpeta `paquetes` contiene cuatro ficheros llamados `p1`, `p2`, `p3` y `p4`. Solo uno es de texto: los demás son datos binarios, y hacer `cat` de ellos llena la pantalla de símbolos. Averigua cuál es el de texto **sin leer ninguno** y escribe su clave.

:::pregunta[Escribe las órdenes y la clave]
```bash
cd ~/practica/buzon/paquetes
file p1 p2 p3 p4
cat p3
```

`file` dice `data` para `p1`, `p2` y `p4`, y `ASCII text` para `p3`. La clave es `SAUCE-5566`.
:::

### 13. Todo lo que hay

Sin salir de tu carpeta personal, escribe cuántas entradas tiene la carpeta `buzon` contando las ocultas, pero sin contar `.` ni `..`.

:::pregunta[Escribe la orden y el número]
```bash
ls -A ~/practica/buzon
```

Salen **6** entradas: `-`, `-viaje.txt`, `.escondido`, `mis cartas.txt`, `paquetes` y `registro.txt`. La opción `-A` (mayúscula) enseña los ocultos pero **no** `.` ni `..`.
:::

---
titulo: "Comandos 11: procesos y entorno"
tipo: teoria
---

# Comandos 11: procesos y entorno

Todo programa que está funcionando es un **proceso**, y cada proceso se ejecuta con un **entorno**: un conjunto de variables que dicen quién eres, dónde está tu carpeta y dónde buscar los programas. Saber ver, parar y lanzar procesos, y entender cómo se hereda el entorno, es lo que separa a quien usa la terminal de quien la controla.

## Lo mínimo para empezar

| Orden | Qué hace |
|---|---|
| `ps` | escribe los procesos de tu terminal |
| `ps aux` | escribe **todos** los procesos del sistema |
| `top` | muestra los procesos en vivo, ordenados por uso (se sale con `q`) |
| `pgrep texto` | escribe el PID de los procesos cuya orden contiene el texto |
| `kill PID` | pide a un proceso que termine |
| `kill -9 PID` | lo mata a la fuerza, cuando no obedece |
| `orden &` | lanza la orden en **segundo plano** y te devuelve la terminal |
| `jobs` | lista lo que has lanzado en segundo plano desde esta terminal |
| `echo $VARIABLE` | escribe el valor de una variable |
| `export VARIABLE=valor` | crea una variable que verán los programas que lances |
| `env` | escribe todas las variables del entorno |
| `which orden` | dice dónde está el programa que se ejecuta con ese nombre |

Qué debes saber:

- Cada proceso tiene un **PID** (su número) y un **PPID** (el PID de su padre, el que lo lanzó). Cuando cierras la terminal, los procesos que lanzaste desde ella suelen cerrarse con ella.
- Una variable que asignas sin más (`x=1`) solo vive en tu terminal. Los programas que lances **no la ven**. Con `export` sí.
- Algunas variables importantes: `$USER` es tu usuario, `$HOME` tu carpeta personal y `$PATH` la lista de carpetas, separadas por `:`, donde el sistema busca los programas cuando escribes un nombre sin ruta.
- Esa es la razón de que `ls` funcione desde cualquier carpeta pero tu script `hola.sh` solo funcione como `./hola.sh`: la carpeta actual **no está** en `$PATH`.
- Toda orden termina con un **código de salida**: `0` es que fue bien y cualquier otro número, que algo falló. Se consulta con `echo $?`, justo después de la orden.
- Para tareas que se repiten solas, el sistema usa `cron`. Cada línea de una tabla de cron tiene cinco campos de tiempo (minuto, hora, día del mes, mes y día de la semana) seguidos de la orden. Un `*` significa «cualquiera».

## Ejercicios

### 1. Variables del sistema

Eres el usuario `alex`. Lee esta orden:

```bash
echo $USER $HOME
```

:::pregunta[¿Qué escribe?]
```text
alex /home/alex
```

`$USER` y `$HOME` son variables que el sistema crea al abrir tu sesión.
:::

### 2. Heredar una variable

Lee estas órdenes:

```bash
x=1
bash -c 'echo "[$x]"'
export x=1
bash -c 'echo "[$x]"'
```

:::pregunta[¿Qué escribe cada `bash -c`?]
```text
[]
[1]
```

`bash -c '...'` lanza un programa nuevo. Con `x=1` la variable solo existe en la terminal que la creó, y el programa nuevo no la ve. Con `export`, sí. Por eso las variables que un script necesita hay que exportarlas.
:::

### 3. Dónde está un programa

Lee esta orden:

```bash
which ls
```

:::pregunta[¿Qué escribe, más o menos? ¿Qué variable consulta el sistema para encontrarlo?]
Una ruta que acaba en `/ls`, por ejemplo `/usr/bin/ls`.

El sistema recorre las carpetas de `$PATH`, una detrás de otra, y se queda con el primer programa que se llame `ls`.
:::

### 4. Segundo plano

Lee estas órdenes:

```bash
sleep 100 &
jobs
kill %1
jobs
```

:::pregunta[¿Qué escribe cada una?]
`sleep 100 &` escribe algo como `[1] 4821`: el número de trabajo (1) y el PID del proceso. `jobs` escribe:

```text
[1]+  Running                 sleep 100 &
```

`kill %1` termina el trabajo número 1. El último `jobs` lo muestra como `Terminated` una sola vez y después ya no sale.

`sleep 100` espera cien segundos sin hacer nada. Con `&` no te bloquea la terminal. Sin `&`, tendrías que esperar o pulsar Ctrl+C.
:::

### 5. Leer una salida de `ps`

Esta es la salida de `ps -o pid,ppid,comm` en una terminal:

```text
  PID  PPID COMMAND
 1200  1100 bash
 1450  1200 sleep
 1460  1200 ps
```

:::pregunta[¿Qué PID tiene `bash`? ¿Quién lanzó `sleep`? ¿Qué pasaría con `sleep` si cerraras `bash`?]
`bash` tiene PID **1200**. `sleep` lo lanzó `bash` (su PPID es 1200). Si cierras `bash`, `sleep` se queda sin padre y, normalmente, termina con él.

`ps` se lista a sí mismo porque en ese momento también es un proceso de la terminal.
:::

### 6. Un proceso que no obedece

Has ejecutado `kill 1450` y el proceso sigue funcionando.

:::pregunta[¿Qué haces?]
```bash
kill -9 1450
```

`kill` a secas pide al proceso que termine y el proceso puede ignorarlo. `-9` no se puede ignorar: el sistema lo mata sin dar tiempo a nada. Úsalo solo como último recurso, porque el proceso no puede guardar lo que estaba haciendo.
:::

### 7. Códigos de salida

Lee estas órdenes:

```bash
ls > /dev/null
echo $?
ls /nada 2> /dev/null
echo $?
```

:::pregunta[¿Qué escribe cada `echo $?`?]
```text
0
2
```

Primero `ls` funciona, y el código es 0. Después `ls` falla porque `/nada` no existe, y el código es 2. Fíjate en que `echo $?` va **justo después**: cualquier otra orden intermedia cambiaría el valor.
:::

### 8. Leer una línea de cron

Esta es una tabla de cron:

```text
30 2 * * 1 /home/alex/copia.sh
*/15 * * * * /home/alex/vigila.sh
0 8 1 * * /home/alex/informe.sh
```

:::pregunta[¿Cuándo se ejecuta cada una?]
La primera, **cada lunes a las 02:30** (el último campo es el día de la semana, y 1 es el lunes). La segunda, **cada 15 minutos** (`*/15` en el campo de minutos). La tercera, **el día 1 de cada mes a las 08:00**.
:::

### 9. Un script que no se encuentra

Tienes un script `hola.sh` en tu carpeta y funciona con `./hola.sh`, pero al escribir solo `hola.sh` el sistema dice que no encuentra la orden.

:::pregunta[¿Por qué? ¿Cómo lo arreglas para poder escribir solo `hola.sh` desde cualquier sitio?]
Porque la carpeta actual no está en `$PATH`: con `./` das la ruta, y sin ella el sistema solo mira en las carpetas de la variable.

Hay que dejar el script ejecutable y añadir su carpeta a `$PATH`:

```bash
chmod +x hola.sh
export PATH=$PATH:~/carpeta-del-script
```

Esto dura mientras la terminal esté abierta.
:::

## Hazlo tú

Guarda este script como `preparar-11.sh` y ejecútalo con `bash preparar-11.sh`. Crea en `practica` una carpeta `vigilante` con un script que no termina nunca (`vigia.sh`), otro que usa una variable (`saludo.sh`), una carpeta de herramientas y una tabla de cron de ejemplo.

```bash
pkill -f vigia.sh
rm -rf ~/practica/vigilante
mkdir -p ~/practica/vigilante/herramientas
cd ~/practica/vigilante
printf '#!/bin/bash\nwhile true; do\n    sleep 1\ndone\n' > vigia.sh
printf '#!/bin/bash\necho "Hola $NOMBRE"\n' > saludo.sh
printf '#!/bin/bash\necho "Soy la herramienta hola"\n' > herramientas/hola
printf '# minuto hora dia mes dia-semana orden\n30 2 * * 1 /home/alex/copia.sh\n*/15 * * * * /home/alex/vigila.sh\n0 8 1 * * /home/alex/informe.sh\n' > crontab-ejemplo.txt
echo "Carpeta ~/practica/vigilante preparada"
```

### 10. Un vigilante en segundo plano

Lanza `vigia.sh` con `bash vigia.sh` de forma que siga funcionando **sin bloquearte la terminal**, y demuestra que está en marcha.

:::pregunta[Escribe las órdenes y cómo lo demuestras]
```bash
cd ~/practica/vigilante
bash vigia.sh &
jobs
pgrep -f vigia.sh
```

`jobs` lo lista como `Running` y `pgrep` escribe su PID.
:::

### 11. Pararlo

Detén el vigilante y demuestra que ya no está.

:::pregunta[Escribe las órdenes y cómo lo demuestras]
```bash
kill $(pgrep -f vigia.sh)
pgrep -f vigia.sh
```

El segundo `pgrep` ya no escribe nada. También valía `kill %1`, que usa el número de trabajo en vez del PID.
:::

### 12. El saludo que sale vacío

Ejecuta `bash saludo.sh`. Escribe `Hola` y nada más. Consigue que el saludo diga `Hola Alex`, **sin editar el script**.

:::pregunta[Escribe las órdenes y la salida]
```bash
export NOMBRE=Alex
bash saludo.sh
```

Sale `Hola Alex`. El script lee la variable `NOMBRE`, y solo la ve si la has exportado. Con `NOMBRE=Alex bash saludo.sh` también funcionaría, porque da la variable solo a esa orden.
:::

### 13. Una herramienta por su nombre

En la carpeta `herramientas` hay un script `hola`. Consigue ejecutarlo escribiendo solo `hola`, desde cualquier carpeta.

:::pregunta[Escribe las órdenes y la salida]
```bash
chmod +x ~/practica/vigilante/herramientas/hola
export PATH=$PATH:~/practica/vigilante/herramientas
cd /tmp
hola
```

Sale `Soy la herramienta hola`. Hacen falta las dos cosas: el permiso de ejecución y que la carpeta esté en `$PATH`.
:::

### 14. Cuándo se ejecuta

En `crontab-ejemplo.txt` hay tres tareas programadas. Averigua cuál se ejecuta más a menudo y cuántas veces al día lo hace.

:::pregunta[Escribe la orden y la respuesta]
```bash
cat ~/practica/vigilante/crontab-ejemplo.txt
```

La que se ejecuta más a menudo es `vigila.sh`, con `*/15` en los minutos: cada 15 minutos, o sea **96 veces al día** (4 por hora, 24 horas).
:::

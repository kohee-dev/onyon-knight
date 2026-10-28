---
titulo: "Bash 8: robustez del script"
tipo: teoria
---

# Bash 8: robustez del script

Un script que funciona cuando todo sale bien no basta: tiene que comprobar quién lo ejecuta, qué le pasan y si lo que necesita existe, y avisar cuando algo falla. En este bloque los scripts también ejecutan otros comandos y usan su resultado.

## Lo mínimo para empezar

```bash
#!/bin/bash
fecha=$(date +%F)
if grep -q "root" /etc/passwd; then
  echo "Hay un usuario root el $fecha"
fi
```

- `$(orden)` ejecuta la orden y **se sustituye por lo que escribe**. Así se guarda en una variable: `mayus=$(echo hola | tr a-z A-Z)`.
- Una orden puede usarse directamente como condición de `if`: es cierta si termina con código `0`. `grep -q` no escribe nada, solo termina con `0` si encuentra el texto y con `1` si no. `if ! orden` la niega.
- `id -u` escribe el número de usuario de quien ejecuta (`0` es `root`) y `whoami` su nombre. Si el script se lanza con `sudo`, quien lo ejecuta es `root`.
- Condiciones sobre ficheros: `-e` existe, `-f` existe y es un fichero normal, `-d` es una carpeta, `-r` se puede leer. `[ ! -r "$1" ]` es «no se puede leer». Un fichero que no existe tampoco se puede leer.
- `echo "mensaje" >&2` envía el mensaje a la **salida de errores**. Así no se mezcla con la salida normal y se puede descartar con `2>`.
- `source fichero` ejecuta el fichero **dentro del propio script**, por lo que sus variables siguen disponibles después. Es la forma de cargar un fichero de configuración. Con `bash fichero` se ejecuta aparte y sus variables se pierden al terminar. `$?`, `exit` y `$#` se usan como en el bloque anterior.

## Ejercicios

### 1. Guardar la salida de una orden

Lee este script:

```bash
#!/bin/bash
hoy=$(echo lunes)
mayus=$(echo hola | tr a-z A-Z)
echo "$hoy $mayus"
```

:::pregunta[¿Qué escribe en pantalla?]
```text
lunes HOLA
```

Cada `$(...)` se sustituye por lo que escribe la orden de dentro. `tr a-z A-Z` cambia las minúsculas por mayúsculas.
:::

### 2. Una orden como condición

Lee este script:

```bash
#!/bin/bash
printf 'ana\nluis\n' > nombres.txt
if grep -q luis nombres.txt; then
  echo "luis está"
else
  echo "luis no está"
fi
if grep -q pepe nombres.txt; then
  echo "pepe está"
else
  echo "pepe no está"
fi
```

:::pregunta[¿Qué escribe en pantalla?]
```text
luis está
pepe no está
```

`grep -q` termina con `0` si encuentra el texto y con `1` si no, y `if` solo mira ese código. `if` ejecuta la orden que tiene detrás y mira su código de salida; `[ ]` es solo una de esas órdenes (la que compara), así que aquí no hace falta.
:::

### 3. ¿Quién ejecuta?

Lee este script, `quien.sh`:

```bash
#!/bin/bash
if [ "$(id -u)" -eq 0 ]; then
  echo "Eres root"
else
  echo "No eres root"
fi
```

Se ejecuta primero con `bash quien.sh` como un usuario normal y después con `sudo bash quien.sh`.

:::pregunta[¿Qué escribe cada vez?]
```text
No eres root
Eres root
```

`id -u` escribe `0` solo para `root`. Con `sudo` el script se ejecuta como `root`, aunque lo lance un usuario normal.
:::

### 4. `source` frente a `bash`

El fichero `config.sh` contiene una sola línea:

```bash
nombre="Ana"
```

Lee estas órdenes, ejecutadas en la terminal en este orden:

```bash
bash config.sh
echo "Hola, $nombre"
source config.sh
echo "Hola, $nombre"
```

:::pregunta[¿Qué escriben los dos `echo`?]
```text
Hola, 
Hola, Ana
```

`bash config.sh` ejecuta el fichero en otro proceso y la variable `nombre` desaparece al terminar. `source config.sh` lo ejecuta en la terminal actual y la variable se queda definida.
:::

### 5. Un script roto: no ejecutar como root

Este script debería negarse a funcionar si lo ejecuta `root`, avisando por la salida de errores, y saludar al usuario en caso contrario. Tiene dos fallos:

```bash
#!/bin/bash
usuario=whoami
if [ "$usuario" = "root" ]; then
  echo "No ejecutes este script como root"
  exit 1
fi
echo "Hola, $usuario"
```

:::pregunta[Escribe la versión corregida]
```bash
#!/bin/bash
usuario=$(whoami)
if [ "$usuario" = "root" ]; then
  echo "No ejecutes este script como root" >&2
  exit 1
fi
echo "Hola, $usuario"
```

Los fallos: sin `$( )`, `usuario` valdría la palabra `whoami` y no el nombre de quien ejecuta, y el aviso debe ir a la salida de errores con `>&2`. Si `root` ejecuta el script con `2> /dev/null` detrás, ya no se ve nada, porque el aviso se descarta.
:::

### 6. Un script roto: cargar la configuración

El fichero `config.sh` define `servidor="srv1"`. Este script debería avisar y terminar con error solo si `config.sh` **no** se puede leer, y si se puede, cargarlo y escribir el servidor. Tiene un fallo:

```bash
#!/bin/bash
if [ -r config.sh ]; then
  echo "Falta config.sh" >&2
  exit 1
fi
source config.sh
echo "Servidor: $servidor"
```

:::pregunta[Escribe la versión corregida]
```bash
#!/bin/bash
if [ ! -r config.sh ]; then
  echo "Falta config.sh" >&2
  exit 1
fi
source config.sh
echo "Servidor: $servidor"
```

Falta el `!`: sin él, el script termina con error justo cuando `config.sh` existe. Con el `!` escribe `Servidor: srv1`.
:::

### 7. Rellena los huecos: leer un fichero

Completa los huecos `_____` para que el script termine con error y avise por la salida de errores si el fichero que recibe no se puede leer:

```bash
#!/bin/bash
if [ ! _____ "$1" ]; then
  echo "No puedo leer $1" _____
  exit 1
fi
cat "$1"
```

:::pregunta[Escribe el script completo]
```bash
#!/bin/bash
if [ ! -r "$1" ]; then
  echo "No puedo leer $1" >&2
  exit 1
fi
cat "$1"
```

`-r` comprueba que se puede leer y `>&2` manda el mensaje a la salida de errores. Si el fichero no existe, `-r` también es falso.
:::

### 8. Rellena el hueco: cargar variables

El fichero `config.sh` define `servidor="srv1"` y `puerto=8080`. Completa el hueco `_____` para que el script escriba el servidor y el puerto:

```bash
#!/bin/bash
_____ config.sh
echo "Conectando a $servidor:$puerto"
```

:::pregunta[Escribe el script completo]
```bash
#!/bin/bash
source config.sh
echo "Conectando a $servidor:$puerto"
```

Escribe `Conectando a srv1:8080`. También sirve `. config.sh` (un punto y un espacio), que es lo mismo que `source`.
:::

### 9. Escríbelo tú: buscar un texto en un fichero

Escribe un script `buscar.sh` que reciba un fichero y un texto y escriba `Encontrado` si el texto aparece en el fichero y `No encontrado` si no. Debe terminar con error:

- con código 1 y un aviso de uso por la salida de errores si no recibe exactamente dos argumentos;
- con código 2 y un aviso por la salida de errores si el fichero no se puede leer.

:::pregunta[Una solución posible]
```bash
#!/bin/bash
if [ $# -ne 2 ]; then
  echo "Uso: $0 fichero texto" >&2
  exit 1
fi
if [ ! -r "$1" ]; then
  echo "No puedo leer $1" >&2
  exit 2
fi
if grep -q "$2" "$1"; then
  echo "Encontrado"
else
  echo "No encontrado"
fi
```

Cada comprobación va antes de usar el fichero. Con códigos de salida distintos se puede saber desde fuera qué ha fallado.
:::

### 10. Escríbelo tú: preparar una carpeta

El fichero `config.sh` define la variable `carpeta`, por ejemplo `carpeta="/tmp/trabajo"`. Escribe un script que:

- termine con código 1 y un aviso por la salida de errores si no lo ejecuta `root`;
- cargue `config.sh`;
- cree la carpeta con `mkdir -p` y escriba `Creada: ` seguido de la ruta.

:::pregunta[Una solución posible]
```bash
#!/bin/bash
if [ "$(id -u)" -ne 0 ]; then
  echo "Ejecuta este script con sudo" >&2
  exit 1
fi
source config.sh
mkdir -p "$carpeta"
echo "Creada: $carpeta"
```

La comprobación del usuario va la primera, antes de hacer ningún cambio. `mkdir -p` no da error si la carpeta ya existe.
:::

### 11. Escríbelo tú: ¿existe el usuario?

Escribe un script que reciba un nombre de usuario y diga si existe en `/etc/passwd`. Debe escribir `Existe` o `No existe`, y terminar con código 1 y un aviso de uso por la salida de errores si no recibe exactamente un argumento.

:::pregunta[Una solución posible]
```bash
#!/bin/bash
if [ $# -ne 1 ]; then
  echo "Uso: $0 usuario" >&2
  exit 1
fi
if grep -q "^$1:" /etc/passwd; then
  echo "Existe"
else
  echo "No existe"
fi
```

Cada línea de `/etc/passwd` empieza por el nombre de usuario y `:`. El `^` obliga a que el texto esté **al principio** de la línea, así `ana` no coincide con `mariana`.
:::

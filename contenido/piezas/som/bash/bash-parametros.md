---
titulo: "Bash 4: parámetros del script"
tipo: teoria
---

# Bash 4: parámetros del script

Un script puede recibir datos al ejecutarlo, igual que `ls -l /tmp` recibe `-l` y `/tmp`. Esos datos se llaman **parámetros** o **argumentos**.

## Lo mínimo para empezar

```bash
bash saludo.sh Ana Luis
```

Dentro de `saludo.sh`, bash los reparte en variables especiales:

| Variable | Contiene |
|---|---|
| `$0` | el nombre del script, tal como lo has escrito al lanzarlo |
| `$1`, `$2`, … | el primer argumento, el segundo, etc. |
| `$#` | cuántos argumentos se han pasado |
| `$@` | todos los argumentos |

- Si un argumento lleva espacios, se escribe entre comillas al lanzar el script: `bash saludo.sh "Ana Pérez"` tiene un solo argumento.
- Un argumento que no se ha pasado vale vacío.
- Todos los ejercicios de este bloque se pueden lanzar con `bash script.sh …` o con `./script.sh …` (en este caso `$0` vale `./script.sh`).

## Ejercicios

### 1. Los argumentos en orden

Este script se llama `datos.sh` y se lanza así:

```bash
bash datos.sh Ana Luis Marta
```

```bash
#!/bin/bash
echo "Script: $0"
echo "Primero: $1"
echo "Segundo: $2"
echo "Total: $#"
```

:::pregunta[¿Qué escribe en pantalla?]
```text
Script: datos.sh
Primero: Ana
Segundo: Luis
Total: 3
```

`$3` (Marta) no se usa, pero cuenta en `$#`.
:::

### 2. Comillas y argumentos que faltan

El mismo script `datos.sh`, ahora con este contenido:

```bash
#!/bin/bash
echo "Nombre: $1"
echo "Edad: $2"
echo "Total: $#"
echo "[$3]"
```

Se lanza con:

```bash
bash datos.sh "Ana Pérez" 30
```

:::pregunta[¿Qué escribe en pantalla?]
```text
Nombre: Ana Pérez
Edad: 30
Total: 2
[]
```

Las comillas hacen que «Ana Pérez» sea un solo argumento. `$3` no existe, así que vale vacío.
:::

### 3. Un script roto

Este script, lanzado con `bash roto.sh Ana`, debería escribir `Hola, Ana` y `El script se llama roto.sh`, pero tiene tres fallos:

```bash
#!/bin/bash
nombre = $1
echo "Hola, nombre"
echo "El script se llama $1"
```

:::pregunta[Escribe la versión corregida]
```bash
#!/bin/bash
nombre=$1
echo "Hola, $nombre"
echo "El script se llama $0"
```

Los fallos: espacios alrededor del `=`, falta el `$` delante de `nombre` en el `echo` y el nombre del script es `$0`, no `$1`.
:::

### 4. Rellena los huecos

Completa los huecos `_____` para que el script copie el fichero que se le pase como primer argumento al nombre que se le pase como segundo. Se lanza con `bash copia.sh informe.txt copia.txt`.

```bash
#!/bin/bash
origen=_____
destino=_____
cp "$origen" "$destino"
echo "Copiado $origen en $destino"
```

:::pregunta[Escribe el script completo]
```bash
#!/bin/bash
origen=$1
destino=$2
cp "$origen" "$destino"
echo "Copiado $origen en $destino"
```

Al lanzarlo con `bash copia.sh informe.txt copia.txt` escribe `Copiado informe.txt en copia.txt`.
:::

### 5. Escríbelo tú: la presentación

Escribe un script que reciba un nombre y una ciudad como argumentos y escriba una frase con ellos y con el número de argumentos recibidos. Por ejemplo, con `bash presenta.sh Ana Sevilla`:

```text
Ana vive en Sevilla (2 argumentos)
```

:::pregunta[Una solución posible]
```bash
#!/bin/bash
echo "$1 vive en $2 ($# argumentos)"
```
:::

### 6. Escríbelo tú: crear una carpeta

Escribe un script que cree una carpeta con el nombre que reciba como primer argumento y después muestre sus datos con `ls -ld`.

:::pregunta[Una solución posible]
```bash
#!/bin/bash
mkdir "$1"
ls -ld "$1"
```

Las comillas en `"$1"` permiten nombres con espacios, como `bash carpeta.sh "Mis fotos"`.
:::

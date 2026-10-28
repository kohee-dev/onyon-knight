---
titulo: "Bash 11: ficheros y CSV"
tipo: teoria
---

# Bash 11: ficheros y CSV

Un **CSV** es un fichero de texto donde cada línea es un registro y los campos se separan con una coma. Con lo que ya sabes (bucles, `if`, filtros y redirecciones) puedes leerlos y procesarlos desde un script.

## Lo mínimo para empezar

Todos los ejercicios de este bloque usan este fichero, `alumnos.csv`:

```text
nombre,curso,nota
Ana,1,8
Luis,2,5
Marta,1,9
Pablo,2,4
Sara,1,7
```

La primera línea es la **cabecera**: nombra los campos y no es un registro más.

Para leer un fichero línea a línea y separar sus campos:

```bash
while IFS=, read -r nombre curso nota; do
  echo "$nombre tiene un $nota"
done < alumnos.csv
```

- `done < alumnos.csv` hace que el bucle lea del fichero.
- `IFS=,` indica que el separador de campos es la coma. `read -r` reparte cada línea en las variables `nombre`, `curso` y `nota`.
- Para saltarte la cabecera, puedes usar `tail -n +2 fichero` (escribe desde la línea 2), o dentro del bucle un `if` con `continue`.
- `cut -d, -f1 alumnos.csv` saca solo el primer campo.
- `sort -t, -k3 -n` ordena por el campo 3 (`-k3`) tomando la coma como separador (`-t,`), como números (`-n`).
- `[ -f fichero ]` comprueba que un fichero existe.
- Un contador dentro de un bucle `while … done < fichero` funciona; si la lectura se hace con un pipe (`orden | while …`), las variables cambiadas dentro del bucle se pierden al terminar.

## Ejercicios

### 1. Cortar un campo

Lee esta orden:

```bash
cut -d, -f1 alumnos.csv | head -n 3
```

:::pregunta[¿Qué escribe en pantalla?]
```text
nombre
Ana
Luis
```

`cut` saca el primer campo de todas las líneas, cabecera incluida, y `head -n 3` se queda con las tres primeras.
:::

### 2. Leer línea a línea

Lee este script:

```bash
#!/bin/bash
while IFS=, read -r nombre curso nota; do
  echo "$nombre: $nota"
done < alumnos.csv
```

:::pregunta[¿Qué escribe en pantalla?]
```text
nombre: nota
Ana: 8
Luis: 5
Marta: 9
Pablo: 4
Sara: 7
```

La cabecera también es una línea: se lee como un registro más y por eso sale `nombre: nota`.
:::

### 3. Un script roto

Este script debería escribir los nombres de los alumnos, sin la cabecera, solo si `alumnos.csv` existe. Tiene tres fallos:

```bash
#!/bin/bash
fichero=alumnos.csv
if [ -f fichero ]; then
  tail -n 1 $fichero | while read nombre curso nota
  do
    echo "$nombre"
  done
fi
```

:::pregunta[Escribe la versión corregida]
```bash
#!/bin/bash
fichero=alumnos.csv
if [ -f "$fichero" ]; then
  tail -n +2 "$fichero" | while IFS=, read -r nombre curso nota
  do
    echo "$nombre"
  done
fi
```

Los fallos: `[ -f fichero ]` comprueba un fichero llamado literalmente `fichero` (falta el `$`), `tail -n 1` deja solo la última línea y para saltar la cabecera hace falta `tail -n +2`, y sin `IFS=,` el `read` no separa por comas, así que `nombre` recibe toda la línea. Escribe `Ana`, `Luis`, `Marta`, `Pablo` y `Sara`.
:::

### 4. Otro script roto

Este script debería escribir cuántos alumnos aprueban (nota 5 o más). Tiene dos fallos:

```bash
#!/bin/bash
aprobados=0
while IFS=, read -r nombre curso nota; do
  if [ $nota -ge 5 ]; then
    aprobados=$((aprobados + 1))
  fi
done < alumnos.csv
echo "Aprobados: aprobados"
```

:::pregunta[Escribe la versión corregida]
```bash
#!/bin/bash
aprobados=0
while IFS=, read -r nombre curso nota; do
  if [ "$nombre" = "nombre" ]; then
    continue
  fi
  if [ "$nota" -ge 5 ]; then
    aprobados=$((aprobados + 1))
  fi
done < alumnos.csv
echo "Aprobados: $aprobados"
```

Los fallos: la cabecera llega al `if` con `nota` igual a `nota`, que no es un número y provoca un error (se salta con `continue`), y el `echo` final escribía el texto `aprobados` en vez de su valor. Escribe `Aprobados: 4`.
:::

### 5. Rellena los huecos: crear un CSV

Completa los huecos `_____` para que el script cree `nuevo.csv` con dos líneas: la cabecera y un alumno:

```bash
#!/bin/bash
echo "nombre,curso,nota" _____ nuevo.csv
echo "Eva,1,10" _____ nuevo.csv
cat nuevo.csv
```

:::pregunta[Escribe el script completo]
```bash
#!/bin/bash
echo "nombre,curso,nota" > nuevo.csv
echo "Eva,1,10" >> nuevo.csv
cat nuevo.csv
```

El primero crea (o vacía) el fichero y el segundo añade una línea al final. Si los dos fueran `>`, la cabecera se perdería.
:::

### 6. Rellena los huecos: ordenar por nota

Completa los huecos `_____` para que el script escriba los alumnos ordenados por nota de menor a mayor, sin la cabecera:

```bash
#!/bin/bash
tail -n +2 alumnos.csv | sort -t, _____ _____
```

:::pregunta[Escribe el script completo]
```bash
#!/bin/bash
tail -n +2 alumnos.csv | sort -t, -k3 -n
```

Escribe `Pablo,2,4`, `Luis,2,5`, `Sara,1,7`, `Ana,1,8` y `Marta,1,9`. Sin `-n`, la nota `10` se ordenaría antes que la `4`, porque se compararía como texto.
:::

### 7. Escríbelo tú: la nota media

Escribe un script que calcule la nota media (entera) de los alumnos de `alumnos.csv`. Debe escribir `Media: 6`.

:::pregunta[Una solución posible]
```bash
#!/bin/bash
suma=0
alumnos=0
while IFS=, read -r nombre curso nota; do
  if [ "$nombre" = "nombre" ]; then
    continue
  fi
  suma=$((suma + nota))
  alumnos=$((alumnos + 1))
done < alumnos.csv
echo "Media: $((suma / alumnos))"
```

La suma es 33 y hay 5 alumnos: 33 / 5 da 6 en división entera.
:::

### 8. Escríbelo tú: los de primero

Escribe un script que escriba solo los nombres de los alumnos de curso 1. Debe escribir `Ana`, `Marta` y `Sara`.

:::pregunta[Una solución posible]
```bash
#!/bin/bash
while IFS=, read -r nombre curso nota; do
  if [ "$curso" = "1" ]; then
    echo "$nombre"
  fi
done < alumnos.csv
```

La cabecera tiene `curso` en el campo 2, no `1`, así que no sale. Otra solución es `grep ',1,' alumnos.csv | cut -d, -f1`.
:::

### 9. Escríbelo tú: contar filas

Escribe un script que reciba un fichero CSV como argumento y escriba cuántas filas de datos tiene, sin contar la cabecera. Si el fichero no existe, debe escribir un error y terminar con código 1. Con `alumnos.csv` debe escribir `5`.

:::pregunta[Una solución posible]
```bash
#!/bin/bash
if [ ! -f "$1" ]; then
  echo "No existe el fichero $1"
  exit 1
fi
filas=$(tail -n +2 "$1" | wc -l)
echo "$filas"
```

`tail -n +2` descarta la cabecera y `wc -l` cuenta lo que queda.
:::

### 10. Escríbelo tú: el informe

Escribe un script que cree `informe.txt` con una línea por alumno de `alumnos.csv`, con el formato `Ana - APROBADO` o `Pablo - SUSPENSO` (aprobado con 5 o más), sin la cabecera.

:::pregunta[Una solución posible]
```bash
#!/bin/bash
> informe.txt
while IFS=, read -r nombre curso nota; do
  if [ "$nombre" = "nombre" ]; then
    continue
  fi
  if [ "$nota" -ge 5 ]; then
    echo "$nombre - APROBADO" >> informe.txt
  else
    echo "$nombre - SUSPENSO" >> informe.txt
  fi
done < alumnos.csv
cat informe.txt
```

`> informe.txt` al principio vacía el fichero para que cada ejecución empiece de cero; después cada línea se añade con `>>`.
:::

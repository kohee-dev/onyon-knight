---
titulo: "Bash 10: redirecciones, pipes y filtros"
tipo: teoria
---

# Bash 10: redirecciones, pipes y filtros

Las órdenes escriben en pantalla y leen del teclado, pero ese comportamiento se puede cambiar: guardar lo que escriben en un fichero, leer de un fichero o pasar su salida a otra orden. Esta es la base para trabajar con ficheros y CSV en el bloque siguiente.

## Lo mínimo para empezar

| Símbolo | Qué hace |
|---|---|
| `orden > fichero` | guarda la salida en el fichero (lo **sobrescribe**) |
| `orden >> fichero` | añade la salida al final del fichero |
| `> fichero` (sin orden) | crea el fichero vacío, o lo vacía si ya existe |
| `orden < fichero` | la orden lee del fichero en vez del teclado |
| `orden 2> fichero` | guarda los **errores** en el fichero |
| `orden 2> /dev/null` | descarta los errores (`/dev/null` es un agujero negro) |
| `orden > /dev/null` | descarta la salida normal; los errores siguen saliendo |
| `orden > fichero 2>&1` | guarda en el fichero la salida **y** los errores |
| `orden &> fichero` | lo mismo que la fila anterior, más corto (solo en bash) |
| `orden1 \| orden2` | la salida de `orden1` es la entrada de `orden2` (**pipe**) |

Los **filtros** son órdenes que leen texto y lo transforman. Los más útiles:

- `sort` ordena las líneas (`-r` al revés, `-n` numéricamente).
- `uniq` quita las líneas repetidas **consecutivas**, así que casi siempre va después de `sort`.
- `grep texto` deja solo las líneas que contienen el texto (`-c` las cuenta).
- `wc -l` cuenta líneas.
- `head -n 3` y `tail -n 3` dejan las 3 primeras o las 3 últimas líneas.
- `cut -d: -f1` corta cada línea por el separador `:` y se queda con el campo 1.
  - `-f2,3` se queda con los campos 2 y 3 (y deja el separador entre ellos), y `-f2-` con todos desde el 2 hasta el final.
  - `-c1-3` no corta por separador: se queda con los caracteres del 1 al 3 de cada línea.
  - Sin `-d`, el separador es el tabulador, así que en un CSV hay que poner siempre `-d,`.
- `uniq -c` escribe delante de cada línea cuántas veces se repite (los espacios del principio pueden variar de un sistema a otro).

Los ejercicios usan estos tres ficheros:

```text
# datos.txt
manzana
pera
uva
pera
manzana
manzana
```

```text
# usuarios.txt
ana:1001:/home/ana
luis:1002:/home/luis
marta:1003:/home/marta
```

```text
# ventas.csv
lunes,pan,3
martes,leche,2
jueves,pan,5
viernes,fruta,1
```

## Ejercicios

### 1. Sobrescribir y añadir

Lee estas órdenes, ejecutadas en este orden en una carpeta vacía:

```bash
echo uno > f.txt
echo dos >> f.txt
echo tres > f.txt
cat f.txt
```

:::pregunta[¿Qué escribe `cat f.txt`?]
```text
tres
```

`>` crea el fichero o lo vacía antes de escribir, por lo que `uno` y `dos` se pierden. Solo `>>` conserva lo que ya había.
:::

### 2. Un pipe

Lee esta orden:

```bash
sort datos.txt | uniq
```

:::pregunta[¿Qué escribe en pantalla?]
```text
manzana
pera
uva
```

`sort` pone juntas las líneas repetidas y `uniq` deja una de cada. `uniq` solo quita las líneas repetidas que están **seguidas**: sin el `sort`, `pera` y `manzana` seguirían saliendo más de una vez.
:::

### 3. Contar y cortar

Lee estas dos órdenes:

```bash
grep pera datos.txt | wc -l
sort datos.txt | head -n 2
```

:::pregunta[¿Qué escribe cada una?]
```text
2
manzana
manzana
```

La primera deja las líneas con `pera` y cuenta cuántas hay. La segunda ordena todo y se queda con las dos primeras, que son `manzana`.
:::

### 4. Cortar un CSV

Lee estas dos órdenes, con `ventas.csv`:

```bash
cut -d, -f2 ventas.csv | sort | uniq
cut -d, -f1,3 ventas.csv
```

:::pregunta[¿Qué escribe cada una?]
```text
fruta
leche
pan
lunes,3
martes,2
jueves,5
viernes,1
```

La primera se queda con el producto (campo 2), lo ordena y quita los repetidos. La segunda se queda con los campos 1 y 3, y `cut` deja la coma entre ellos.
:::

### 5. Cortar por caracteres y por el final

Lee estas dos órdenes, con `usuarios.txt`:

```bash
cut -c1-3 usuarios.txt
cut -d: -f2- usuarios.txt
```

:::pregunta[¿Qué escribe cada una?]
```text
ana
lui
mar
1001:/home/ana
1002:/home/luis
1003:/home/marta
```

`-c1-3` se queda con los tres primeros caracteres de cada línea, vengan de donde vengan. `-f2-` se queda con todos los campos desde el 2 hasta el final, con sus separadores.
:::

### 6. Salida normal y errores

Lee estas dos órdenes (la ruta `/noexiste` no existe):

```bash
ls /noexiste > salida.txt
ls /noexiste 2> errores.txt
```

:::pregunta[¿Qué sale en pantalla y qué hay en cada fichero?]
La primera orden escribe en pantalla el mensaje de error de `ls`, y `salida.txt` queda **vacío**. La segunda no escribe nada en pantalla, y `errores.txt` contiene una línea con el mensaje de error.

`>` solo redirige la salida normal, y `ls` no tiene nada que escribir porque la carpeta no existe. El mensaje es un error y por eso sale por otro canal, que solo se redirige con `2>`.
:::

### 7. Salida y errores juntos

Lee esta orden, con `datos.txt` en la carpeta y sin `/noexiste`:

```bash
ls /noexiste datos.txt > todo.txt 2>&1
```

:::pregunta[¿Qué sale en pantalla y qué hay en `todo.txt`?]
En pantalla no sale nada. `todo.txt` contiene dos líneas: el mensaje de error de `ls` por `/noexiste` y la línea `datos.txt`.

`2>&1` significa «los errores van adonde vaya la salida normal», que aquí es `todo.txt`. En bash también se puede escribir `ls /noexiste datos.txt &> todo.txt`.
:::

### 8. Un script roto

Este script debería guardar en `frutas.txt` las frutas de `datos.txt` ordenadas y sin repetir, añadir la palabra `Hecho` al final y escribir cuántas líneas contienen `pera`. Tiene tres fallos:

```bash
#!/bin/bash
sort datos.txt > uniq > frutas.txt
echo "Hecho" | frutas.txt
grep pera datos.txt wc -l
```

:::pregunta[Escribe la versión corregida]
```bash
#!/bin/bash
sort datos.txt | uniq > frutas.txt
echo "Hecho" >> frutas.txt
grep pera datos.txt | wc -l
```

Los fallos: para pasar la salida de `sort` a `uniq` hace falta un pipe (`|`), no `>`; para añadir texto a un fichero se usa `>>`, no un pipe; y el `grep` necesita un pipe para pasar su salida a `wc -l`. El script escribe `2`.
:::

### 9. Otro script roto

Este script debería guardar en `productos.txt` los productos distintos de `ventas.csv` ordenados, añadirle la palabra `Fin` al final y guardar en `errores.log` el error que da `ls inventario.csv` (un fichero que no existe). Tiene tres fallos:

```bash
#!/bin/bash
cut -f2 ventas.csv | sort | uniq > productos.txt
echo "Fin" > productos.txt
ls inventario.csv > errores.log
```

:::pregunta[Escribe la versión corregida]
```bash
#!/bin/bash
cut -d, -f2 ventas.csv | sort | uniq > productos.txt
echo "Fin" >> productos.txt
ls inventario.csv 2> errores.log
```

Los fallos: sin `-d,` el separador es el tabulador y, como las líneas no tienen ninguno, `cut` devuelve las líneas enteras en vez del producto; `echo "Fin" > productos.txt` borra los productos, para añadir hace falta `>>`; y `>` no recoge errores, hace falta `2>`. `productos.txt` queda con `fruta`, `leche`, `pan` y `Fin`.
:::

### 10. Rellena los huecos: cortar campos

Completa los huecos `_____` para que el script escriba solo los nombres de usuario de `usuarios.txt` y después solo sus carpetas:

```bash
#!/bin/bash
cut _____ usuarios.txt
cut -d: _____ usuarios.txt
```

:::pregunta[Escribe el script completo]
```bash
#!/bin/bash
cut -d: -f1 usuarios.txt
cut -d: -f3 usuarios.txt
```

Escribe `ana`, `luis`, `marta` y después `/home/ana`, `/home/luis`, `/home/marta`. `-d:` indica el separador y `-f1` o `-f3` el campo que se queda.
:::

### 11. Rellena los huecos: descartar errores

Completa el hueco `_____` para que el script no escriba ningún mensaje de error aunque la carpeta no exista:

```bash
#!/bin/bash
ls /carpeta-que-no-existe _____ /dev/null
```

:::pregunta[Escribe el script completo]
```bash
#!/bin/bash
ls /carpeta-que-no-existe 2> /dev/null
```

`2>` redirige solo los errores. Si se escribiera `>`, se redirigiría la salida normal y el error seguiría saliendo por pantalla.
:::

### 12. Rellena los huecos: contar repetidos

Completa los huecos `_____` para que el script escriba cuántas ventas hay de cada producto de `ventas.csv`:

```bash
#!/bin/bash
cut _____ ventas.csv | sort | uniq _____
```

:::pregunta[Escribe el script completo]
```bash
#!/bin/bash
cut -d, -f2 ventas.csv | sort | uniq -c
```

Escribe `1 fruta`, `1 leche` y `2 pan` (con espacios delante del número). `uniq -c` cuenta cuántas veces se repite cada línea; por eso el `sort` va antes, para que las repetidas estén seguidas.
:::

### 13. Rellena los huecos: salida y errores en ficheros distintos

Completa los huecos `_____` para que el script guarde la salida normal en `ok.txt` y los errores en `fallos.txt`:

```bash
#!/bin/bash
ls datos.txt inventario.csv _____ ok.txt _____ fallos.txt
```

:::pregunta[Escribe el script completo]
```bash
#!/bin/bash
ls datos.txt inventario.csv > ok.txt 2> fallos.txt
```

`ok.txt` contiene `datos.txt` y `fallos.txt` el mensaje de error de `ls` por `inventario.csv`, que no existe.
:::

### 14. Escríbelo tú: frutas distintas

Escribe una orden (o un script) que cuente cuántas frutas distintas hay en `datos.txt`. Debe escribir `3`.

:::pregunta[Una solución posible]
```bash
sort datos.txt | uniq | wc -l
```

Primero se ordena, después se quitan los repetidos y por último se cuentan las líneas que quedan.
:::

### 15. Escríbelo tú: usuarios ordenados

Escribe un script que guarde en `nombres.txt` los nombres de usuario de `usuarios.txt` ordenados de la Z a la A y después escriba cuántos son. Debe escribir `3`.

:::pregunta[Una solución posible]
```bash
#!/bin/bash
cut -d: -f1 usuarios.txt | sort -r > nombres.txt
wc -l < nombres.txt
```

`nombres.txt` queda con `marta`, `luis` y `ana`. Con `wc -l < nombres.txt`, `wc` lee del fichero por la entrada y escribe solo el número.
:::

### 16. Escríbelo tú: días de pan

Escribe una orden (o un script) que escriba solo los días en los que se vendió pan según `ventas.csv`. Debe escribir `lunes` y `jueves`.

:::pregunta[Una solución posible]
```bash
grep pan ventas.csv | cut -d, -f1
```

`grep` deja las líneas con `pan` y `cut` se queda con el campo 1 de cada una. El orden importa: si se cortara primero, ya no quedaría el producto para que `grep` lo encontrase.
:::

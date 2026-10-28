---
titulo: "Bash 9: redirecciones, pipes y filtros"
tipo: teoria
---

# Bash 9: redirecciones, pipes y filtros

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
| `orden1 \| orden2` | la salida de `orden1` es la entrada de `orden2` (**pipe**) |

Los **filtros** son órdenes que leen texto y lo transforman. Los más útiles:

- `sort` ordena las líneas (`-r` al revés, `-n` numéricamente).
- `uniq` quita las líneas repetidas **consecutivas**, así que casi siempre va después de `sort`.
- `grep texto` deja solo las líneas que contienen el texto (`-c` las cuenta).
- `wc -l` cuenta líneas.
- `head -n 3` y `tail -n 3` dejan las 3 primeras o las 3 últimas líneas.
- `cut -d: -f1` corta cada línea por el separador `:` y se queda con el campo 1.

Los ejercicios usan estos dos ficheros:

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

### 4. Un script roto

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

### 5. Rellena los huecos: cortar campos

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

### 6. Rellena los huecos: descartar errores

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

### 7. Escríbelo tú: frutas distintas

Escribe una orden (o un script) que cuente cuántas frutas distintas hay en `datos.txt`. Debe escribir `3`.

:::pregunta[Una solución posible]
```bash
sort datos.txt | uniq | wc -l
```

Primero se ordena, después se quitan los repetidos y por último se cuentan las líneas que quedan.
:::

### 8. Escríbelo tú: usuarios ordenados

Escribe un script que guarde en `nombres.txt` los nombres de usuario de `usuarios.txt` ordenados de la Z a la A y después escriba cuántos son. Debe escribir `3`.

:::pregunta[Una solución posible]
```bash
#!/bin/bash
cut -d: -f1 usuarios.txt | sort -r > nombres.txt
wc -l < nombres.txt
```

`nombres.txt` queda con `marta`, `luis` y `ana`. Con `wc -l < nombres.txt`, `wc` lee del fichero por la entrada y escribe solo el número.
:::

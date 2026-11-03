---
titulo: "Comandos 8: ordenar, cortar y comparar texto"
tipo: teoria
---

# Comandos 8: ordenar, cortar y comparar texto

Cuando ya sabes encadenar órdenes con tuberías, necesitas piezas pequeñas que transformen el texto: ordenarlo, quitar lo repetido, quedarte con una columna, cambiar unas letras por otras o ver qué ha cambiado entre dos ficheros. Con ellas se resuelven la mayoría de los niveles de análisis de datos en los retos online.

## Lo mínimo para empezar

| Orden | Qué hace |
|---|---|
| `sort` | ordena las líneas (`-r` al revés, `-n` como números) |
| `uniq` | quita las líneas repetidas **seguidas**, por eso casi siempre va después de `sort` |
| `uniq -c` | escribe delante cuántas veces aparece cada línea |
| `uniq -u` | deja solo las líneas que aparecen **una única vez** |
| `uniq -d` | deja solo las líneas que están repetidas |
| `cut -d, -f2` | corta cada línea por las comas y se queda con el campo 2 |
| `tr a-z A-Z` | cambia cada letra de la primera lista por la de la segunda |
| `tr -d o` | borra el carácter `o` |
| `tr -s ' '` | si un carácter se repite seguido, deja uno solo |
| `diff f1 f2` | enseña las diferencias entre dos ficheros |

Tres ideas para no confundirte:

- Para ordenar números hay que usar `sort -n`. Sin `-n`, `sort` ordena como texto y pone el `10` antes que el `9`.
- `uniq` solo compara líneas que están **una al lado de otra**. Si no ordenas antes con `sort`, deja repetidos.
- `tr` no recibe ficheros: lee de la entrada, así que se usa siempre detrás de una tubería o con `<`.

`cut` necesita saber con qué se separan las columnas. Con `-d,` es la coma, con `-d:` los dos puntos. Para varias columnas, `-f1,3` se queda con la primera y la tercera, y `-f2-` con todas desde la segunda.

`tr` puede cambiar rangos de letras. El truco más famoso es **rot13**, que reemplaza cada letra por la que está 13 posiciones más allá en el alfabeto (y se deshace aplicándolo otra vez):

```bash
tr 'A-Za-z' 'N-ZA-Mn-za-m'
```

Los ejercicios usan estos ficheros:

```text
# frutas.txt
manzana
pera
uva
pera
manzana
manzana
```

```text
# numeros.txt
10
9
100
2
```

```text
# pedidos.csv
mesa1,cafe,2
mesa2,te,1
mesa1,tarta,1
mesa3,cafe,3
```

También dos ficheros `a.txt` (con las líneas `uno`, `dos`, `tres`) y `b.txt` (con `uno`, `DOS`, `tres`).

## Ejercicios

### 1. Ordenar

Lee estas dos órdenes:

```bash
sort frutas.txt
sort -r frutas.txt
```

:::pregunta[¿Qué escribe cada una?]
```text
manzana
manzana
manzana
pera
pera
uva
uva
pera
pera
manzana
manzana
manzana
```

Las seis primeras líneas son de `sort` (orden alfabético) y las seis siguientes de `sort -r` (al revés).
:::

### 2. Quitar repetidos

Lee esta orden:

```bash
sort frutas.txt | uniq
```

:::pregunta[¿Qué escribe y por qué hace falta el `sort`?]
```text
manzana
pera
uva
```

`sort` pone juntas las líneas iguales y `uniq` deja una de cada. Sin el `sort`, `pera` y `manzana` seguirían saliendo más de una vez, porque no están seguidas.
:::

### 3. Contar repeticiones

Lee esta orden:

```bash
sort frutas.txt | uniq -c
```

:::pregunta[¿Qué escribe?]
```text
      3 manzana
      2 pera
      1 uva
```

`-c` escribe delante de cada línea cuántas veces aparece. Los espacios del principio pueden variar de un sistema a otro.
:::

### 4. Lo único y lo repetido

Lee estas dos órdenes:

```bash
sort frutas.txt | uniq -u
sort frutas.txt | uniq -d
```

:::pregunta[¿Qué escribe cada una?]
```text
uva
manzana
pera
```

`-u` deja solo lo que aparece una única vez: `uva`. `-d` deja lo que está repetido: `manzana` y `pera`. Encontrar «la única línea que no se repite» es un clásico de los retos.
:::

### 5. Números

Lee estas tres órdenes, con `numeros.txt`:

```bash
sort numeros.txt
sort -n numeros.txt
sort -n numeros.txt | tail -n 1
```

:::pregunta[¿Qué escribe cada una?]
```text
10
100
2
9
2
9
10
100
100
```

La primera ordena como texto: compara carácter a carácter y `10` va antes que `2`. La segunda ordena por valor. La tercera se queda con la última línea de la segunda, que es el número mayor.
:::

### 6. Cortar columnas

Lee estas tres órdenes, con `pedidos.csv`:

```bash
cut -d, -f2 pedidos.csv
cut -d, -f1,3 pedidos.csv
cut -d, -f2 pedidos.csv | sort | uniq
```

:::pregunta[¿Qué escribe cada una?]
```text
cafe
te
tarta
cafe
mesa1,2
mesa2,1
mesa1,1
mesa3,3
cafe
tarta
te
```

La primera se queda con el producto. La segunda con la mesa y la cantidad, y deja la coma entre ellas. La tercera ordena los productos y quita los repetidos.
:::

### 7. Cambiar letras

Lee estas cuatro órdenes:

```bash
echo "Hola Mundo" | tr a-z A-Z
echo "Hola Mundo" | tr -d o
echo "Hola" | tr 'A-Za-z' 'N-ZA-Mn-za-m'
echo "a    b   c" | tr -s ' '
```

:::pregunta[¿Qué escribe cada una?]
```text
HOLA MUNDO
Hla Mund
Ubyn
a b c
```

La primera pasa a mayúsculas. La segunda borra las `o`. La tercera aplica rot13: `H` pasa a `U`, `o` a `b`, `l` a `y` y `a` a `n`. La cuarta deja un solo espacio donde había varios seguidos.
:::

### 8. Comparar ficheros

Lee estas tres órdenes, con `a.txt` y `b.txt`:

```bash
diff a.txt b.txt
diff a.txt a.txt
diff -q a.txt b.txt
```

:::pregunta[¿Qué escribe cada una?]
```text
2c2
< dos
---
> DOS
Files a.txt and b.txt differ
```

La primera enseña que la línea 2 ha **c**ambiado: `<` es la línea del primer fichero y `>` la del segundo. La segunda no escribe nada: los ficheros son iguales. La tercera, con `-q`, solo dice si difieren (el texto depende del idioma del sistema).
:::

### 9. Escribir una cadena

Quieres saber **cuántos productos distintos** hay en `pedidos.csv`.

:::pregunta[Escribe la orden y el número]
```bash
cut -d, -f2 pedidos.csv | sort | uniq | wc -l
```

Salen **3**: `cafe`, `tarta` y `te`. `uniq` solo puede quitar `cafe` repetido porque `sort` los ha dejado juntos.
:::

## Hazlo tú

Guarda este script como `preparar-8.sh` y ejecútalo con `bash preparar-8.sh`. Crea en `practica` una carpeta `misterio` con cinco ficheros de trabajo: una lista larga, un mensaje cifrado, una lista de empleados y dos versiones de una configuración. En ellos hay dos **claves** con la forma `CLAVE-X-0000`.

```bash
rm -rf ~/practica/misterio
mkdir -p ~/practica/misterio
cd ~/practica/misterio
for ronda in 1 2 3; do
    for n in $(seq 1 20); do
        echo "palabra$n"
        [ $ronda -eq 2 ] && [ $n -eq 5 ] && echo "CLAVE-G-3141"
    done
done > datos.txt
echo "yn pynir rf PYNIR-U-2718" > cifrado.txt
printf 'ana,ventas,1200\nluis,soporte,1500\nmarta,ventas,1300\npedro,soporte,1400\nsara,compras,1100\nleo,ventas,1250\n' > empleados.csv
printf 'puerto=22\nmodo=seguro\nlog=activo\n' > config-v1.txt
printf 'puerto=22\nmodo=seguro\nlog=activo\nclave=CLAVE-I-1618\n' > config-v2.txt
echo "Carpeta ~/practica/misterio preparada"
```

### 10. La línea que no se repite

`datos.txt` tiene muchas líneas y casi todas están repetidas tres veces. Solo una aparece **una única vez** y es la clave. Encuéntrala sin leer el fichero entero.

:::pregunta[Escribe la orden y la clave]
```bash
cd ~/practica/misterio
sort datos.txt | uniq -u
```

La clave es `CLAVE-G-3141`. Hay que ordenar antes: sin el `sort`, `uniq` no ve juntas las repeticiones y daría casi todas las líneas.
:::

### 11. Un mensaje secreto

`cifrado.txt` tiene un mensaje con una clave, escrito con rot13. Descífralo.

:::pregunta[Escribe la orden y el mensaje]
```bash
cat cifrado.txt | tr 'A-Za-z' 'N-ZA-Mn-za-m'
```

El mensaje es `la clave es CLAVE-H-2718`. Rot13 se deshace aplicándolo otra vez.
:::

### 12. Departamentos

El fichero `empleados.csv` tiene tres columnas: nombre, departamento y sueldo. Averigua qué departamentos hay, sin repetir y ordenados, y cuántas personas hay en cada uno.

:::pregunta[Escribe las órdenes y el resultado]
```bash
cut -d, -f2 empleados.csv | sort | uniq
cut -d, -f2 empleados.csv | sort | uniq -c
```

Hay tres departamentos: `compras` (1 persona), `soporte` (2) y `ventas` (3).
:::

### 13. El sueldo más alto

Averigua cuál es el sueldo más alto de `empleados.csv`.

:::pregunta[Escribe la orden y el número]
```bash
cut -d, -f3 empleados.csv | sort -n | tail -n 1
```

Es **1500**. Aquí todos los sueldos tienen cuatro cifras y ordenar como texto daría lo mismo, pero con sueldos de distinta longitud (por ejemplo 900 y 1500) fallaría: `-n` es imprescindible.
:::

### 14. Qué ha cambiado

Hay dos versiones de una configuración, `config-v1.txt` y `config-v2.txt`. Averigua qué diferencia hay entre ellas y escribe la clave que aparece.

:::pregunta[Escribe la orden y la clave]
```bash
diff config-v1.txt config-v2.txt
```

Sale `3a4` y la línea `> clave=CLAVE-I-1618`: en la segunda versión se ha **a**ñadido una línea. La clave es `CLAVE-I-1618`.
:::

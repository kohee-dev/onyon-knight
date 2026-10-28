---
titulo: "Bash 9: bucles"
tipo: teoria
---

# Bash 9: bucles

Un **bucle** repite unas órdenes. Bash tiene dos principales: `for`, que recorre una lista, y `while`, que repite mientras se cumpla una condición.

## Lo mínimo para empezar

```bash
#!/bin/bash
for fruta in manzana pera uva; do
  echo "Me gusta la $fruta"
done

n=3
while [ $n -gt 0 ]; do
  echo $n
  n=$((n - 1))
done
```

- `for variable in lista; do … done`: la variable toma cada valor de la lista, uno por vuelta.
- La lista puede ser palabras sueltas, un rango como `{1..5}`, `$(seq 1 10)`, ficheros como `*.txt` o los argumentos del script (`"$@"`).
- `while [ condición ]; do … done` repite mientras la condición sea cierta. Algo dentro del bucle tiene que acabar haciéndola falsa, o el bucle no termina nunca (para pararlo, `Ctrl+C`).
- `break` sale del bucle y `continue` salta a la vuelta siguiente.
- Un contador se actualiza con `n=$((n + 1))`.
- `echo -n` escribe sin salto de línea al final.

## Ejercicios

### 1. Recorrer una lista

Lee este script:

```bash
#!/bin/bash
for fruta in manzana pera uva; do
  echo "Me gusta la $fruta"
done
```

:::pregunta[¿Qué escribe en pantalla?]
```text
Me gusta la manzana
Me gusta la pera
Me gusta la uva
```
:::

### 2. Un rango

Lee este script:

```bash
#!/bin/bash
for i in {1..5}; do
  echo -n "$i "
done
echo
```

:::pregunta[¿Qué escribe en pantalla?]
```text
1 2 3 4 5
```

Cada `echo -n` escribe el número y un espacio sin saltar de línea. El `echo` final solo añade el salto de línea.
:::

### 3. Cuenta atrás

Lee este script:

```bash
#!/bin/bash
n=3
while [ $n -gt 0 ]; do
  echo $n
  n=$((n - 1))
done
echo "¡Despegue!"
```

:::pregunta[¿Qué escribe en pantalla?]
```text
3
2
1
¡Despegue!
```

Con `n` igual a 0 la condición `-gt 0` ya no se cumple y el bucle termina.
:::

### 4. Un for roto

Este script debería escribir `Vuelta 1`, `Vuelta 2` y `Vuelta 3`, pero tiene tres fallos:

```bash
#!/bin/bash
for i in 1..3
  echo "Vuelta i"
done
```

:::pregunta[Escribe la versión corregida]
```bash
#!/bin/bash
for i in {1..3}; do
  echo "Vuelta $i"
done
```

Los fallos: el rango necesita llaves (`{1..3}`; sin ellas es una única palabra), falta el `do` y en el `echo` falta el `$` delante de `i`.
:::

### 5. Un while roto

Este script debería escribir `n vale 1`, `n vale 2` y `n vale 3`, pero tiene dos fallos, y cuando se arregla el primero el bucle no termina nunca:

```bash
#!/bin/bash
n=1
while [ $n -le 3]
do
  echo "n vale $n"
done
```

:::pregunta[Escribe la versión corregida]
```bash
#!/bin/bash
n=1
while [ $n -le 3 ]
do
  echo "n vale $n"
  n=$((n + 1))
done
```

Los fallos: falta el espacio antes del `]` y nada cambia `n` dentro del bucle. Una vez arreglado el espacio, sin el contador la condición sería siempre cierta y el bucle, infinito.
:::

### 6. Rellena los huecos: suma hasta N

Completa los huecos `_____` para que el script sume los números de 1 a N. Con N igual a 4 debe escribir `10`.

```bash
#!/bin/bash
read -p "N: " n
suma=0
for i in $(seq 1 _____); do
  suma=$((suma + _____))
done
echo $suma
```

:::pregunta[Escribe el script completo]
```bash
#!/bin/bash
read -p "N: " n
suma=0
for i in $(seq 1 $n); do
  suma=$((suma + i))
done
echo $suma
```

`seq 1 4` escribe los números del 1 al 4. En cada vuelta, `i` vale uno de ellos y se suma a `suma`.
:::

### 7. Rellena los huecos: contar ficheros

Completa los huecos `_____` para que el script cuente los ficheros `.txt` de la carpeta actual y los escriba uno a uno:

```bash
#!/bin/bash
contador=0
for f in _____; do
  echo "Fichero: $f"
  contador=$((contador + _____))
done
echo "Total: $contador"
```

:::pregunta[Escribe el script completo]
```bash
#!/bin/bash
contador=0
for f in *.txt; do
  echo "Fichero: $f"
  contador=$((contador + 1))
done
echo "Total: $contador"
```

Si la carpeta tiene `a.txt` y `b.txt`, escribe `Fichero: a.txt`, `Fichero: b.txt` y `Total: 2`.
:::

### 8. Escríbelo tú: tabla de multiplicar

Escribe un script que pida un número y escriba su tabla de multiplicar del 1 al 10, con el formato `3 x 4 = 12`.

:::pregunta[Una solución posible]
```bash
#!/bin/bash
read -p "Número: " n
for i in {1..10}; do
  echo "$n x $i = $((n * i))"
done
```
:::

### 9. Escríbelo tú: repetir hasta acertar

Escribe un script que pida un número y siga pidiéndolo mientras no sea mayor que 0. Al final debe escribir el número aceptado.

:::pregunta[Una solución posible]
```bash
#!/bin/bash
n=0
while [ "$n" -le 0 ]; do
  read -p "Escribe un número mayor que 0: " n
done
echo "Has escrito $n"
```

Se inicializa `n` a 0 para que la condición sea cierta y el bucle entre al menos una vez.
:::

### 10. Escríbelo tú: sumar los argumentos

Escribe un script que sume todos los números que reciba como argumentos. Con `bash suma.sh 4 5 6` debe escribir `15`.

:::pregunta[Una solución posible]
```bash
#!/bin/bash
suma=0
for numero in "$@"; do
  suma=$((suma + numero))
done
echo $suma
```

`"$@"` es la lista de todos los argumentos, por lo que `for` los recorre uno por uno.
:::

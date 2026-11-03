---
titulo: "Primeros pasos 5: programas completos"
tipo: teoria
---

# Primeros pasos 5: programas completos

Ya sabes mostrar datos, guardarlos, calcular con ellos y pedirlos por teclado. Esta pieza junta todo en **programas completos** con la forma de siempre: primero se piden los datos, después se calculan y por último se muestra el resultado. Todavía no hay decisiones ni repeticiones, pero con lo que sabes ya se resuelven problemas de verdad.

## Lo mínimo para empezar

Un programa sencillo tiene tres partes, siempre en este orden:

| Parte | Qué hace | Ejemplo |
|---|---|---|
| **Datos** | recoge los valores y los convierte al tipo que toca | `metros = int(input("Metros: "))` |
| **Procesamiento** | calcula con ellos | `coste = metros * PRECIO_METRO` |
| **Salida** | muestra el resultado | `print("Coste:", coste)` |

Y estos consejos para escribirlo:

- Antes de teclear, escribe en papel **qué datos tienes, qué debes calcular y cómo quieres verlo**.
- Los datos fijos del problema (un precio, el número de segundos de una hora) son **constantes** con nombre en mayúsculas. Los que da la persona, variables.
- Resuelve el problema con **un ejemplo a mano** antes de programarlo. Si no sabes qué debe salir, no sabrás si el programa acierta.
- Cuando el resultado no sale como esperas, escribe con `print` los valores intermedios: te dirán dónde se tuerce el cálculo.
- Las operaciones que más se usan para trocear cantidades son `//` (cuántas veces cabe) y `%` (lo que sobra).

## Ejercicios

### 1. Leer un programa

Lee este programa y piensa qué escribe cuando alguien teclea `15`:

```python
PRECIO_METRO = 2
metros = int(input())
coste = metros * PRECIO_METRO
print("Coste:", coste, "euros")
```

:::pregunta[¿Qué escribe? ¿Qué parte es cada línea: datos, procesamiento o salida?]
```text
Coste: 30 euros
```

Las líneas 1 y 2 son los datos (la constante y la lectura), la 3 es el procesamiento y la 4 es la salida.
:::

### 2. Trocear segundos

Una persona teclea `3725`:

```python
segundos = int(input())
horas = segundos // 3600
minutos = (segundos % 3600) // 60
resto = segundos % 60
print(horas, "h", minutos, "min", resto, "s")
```

:::pregunta[¿Qué escribe?]
```text
1 h 2 min 5 s
```

3725 segundos son 1 hora (3600) y sobran 125. De esos 125, salen 2 minutos y 5 segundos. Fíjate en los paréntesis: `%` y `//` tienen la misma prioridad y se resuelven de izquierda a derecha.
:::

### 3. Seguir las variables a mano

Lee este programa:

```python
a = 4
b = 6
a = a + b
b = a - b
a = a - b
print(a, b)
```

:::pregunta[¿Qué escribe? ¿Qué consigue el programa?]
```text
6 4
```

Después de la tercera línea, `a` vale 10; de la cuarta, `b` vale 4; y de la quinta, `a` vale 6. El programa **intercambia** los valores de `a` y `b` sin usar una tercera variable.

Una forma de resolverlo es una tabla con una columna por variable y una fila por línea, apuntando cada valor nuevo.
:::

### 4. Un texto en lugar de un número

Una persona teclea `17`:

```python
edad = input()
print(edad + 1)
```

:::pregunta[¿Qué ocurre y cómo se arregla?]
Da un `TypeError`: `edad` es un texto y no se le puede sumar el entero `1`. Se arregla convirtiendo en la lectura: `edad = int(input())`.
:::

### 5. Un fallo en el área

Una persona teclea `3` y después `4`:

```python
base = input()
altura = input()
print("Área:", base * altura)
```

:::pregunta[¿Qué ocurre y cómo se arregla?]
Se para con un `TypeError`: `base` y `altura` son textos, y dos textos no se pueden multiplicar entre sí. Hay que convertirlos al leerlos:

```python
base = int(input())
altura = int(input())
print("Área:", base * altura)
```

Ahora escribe `Área: 12`.
:::

### 6. Con y sin paréntesis

Una persona teclea `10` y `20`:

```python
a = int(input())
b = int(input())
print((a + b) / 2)
print(a + b / 2)
```

:::pregunta[¿Qué escribe? ¿Cuál de las dos es la media?]
```text
15.0
20.0
```

La primera es la media. En la segunda, la división se hace antes que la suma: `a + (b / 2)` es `10 + 10.0`. Un solo par de paréntesis cambia el resultado.
:::

## Hazlo tú

Escribe cada programa en su propio fichero `.py`, con la forma datos, procesamiento y salida. Comprueba cada uno con **todos** los valores de la tabla: los datos fijos del problema van como constantes, y los que se piden por teclado, con una pregunta.

### 7. Las sillas

Escribe `sillas.py`. Pide cuántas mesas hay y cuántas sillas necesita cada una, y escribe `Sillas necesarias:` seguido del total.

| Se escribe | Sale |
|---|---|
| `6` y `3` | `Sillas necesarias: 18` |
| `10` y `2` | `Sillas necesarias: 20` |

:::pregunta[Solución]
```python
mesas = int(input("Mesas: "))
sillas_por_mesa = int(input("Sillas por mesa: "))

sillas_totales = mesas * sillas_por_mesa

print("Sillas necesarias:", sillas_totales)
```
:::

### 8. Los billetes

Escribe `billetes.py`. Pide una cantidad entera de euros y descomponla en el menor número de billetes de 20, de 10 y de 5, escribiendo lo que sobra (menos de 5) al final.

| Se escribe | Sale |
|---|---|
| `87` | `Billetes de 20: 4`, `Billetes de 10: 0`, `Billetes de 5: 1` y `Sobran: 2` |
| `135` | `Billetes de 20: 6`, `Billetes de 10: 1`, `Billetes de 5: 1` y `Sobran: 0` |

:::pregunta[Solución]
```python
euros = int(input("Euros: "))

de_20 = euros // 20
resto = euros % 20
de_10 = resto // 10
resto = resto % 10
de_5 = resto // 5
sobran = resto % 5

print("Billetes de 20:", de_20)
print("Billetes de 10:", de_10)
print("Billetes de 5:", de_5)
print("Sobran:", sobran)
```

En cada paso se saca cuántos billetes caben con `//` y se queda lo que sobra con `%`, para pasarlo al siguiente.
:::

### 9. Los minutos

Escribe `minutos.py`. Pide una duración en minutos y escribe cuántas horas y minutos son, con el formato `2 h 15 min`.

| Se escribe | Sale |
|---|---|
| `135` | `2 h 15 min` |
| `60` | `1 h 0 min` |
| `45` | `0 h 45 min` |

:::pregunta[Solución]
```python
minutos_totales = int(input("Minutos: "))

horas = minutos_totales // 60
minutos = minutos_totales % 60

print(horas, "h", minutos, "min")
```
:::

### 10. El descuento

Escribe `descuento.py`. Pide el precio de un artículo y el porcentaje de descuento, y escribe `Precio final:` seguido del precio con el descuento aplicado. Calcula con `precio * (100 - descuento) / 100`.

| Se escribe | Sale |
|---|---|
| `200` y `10` | `Precio final: 180.0` |
| `50` y `20` | `Precio final: 40.0` |

:::pregunta[Solución]
```python
precio = int(input("Precio: "))
descuento = int(input("Descuento (%): "))

precio_final = precio * (100 - descuento) / 100

print("Precio final:", precio_final)
```
:::

### 11. La factura

Escribe `factura.py`. Pide una base imponible y un porcentaje de IVA. Escribe en dos líneas el `IVA:` y el `Total:` (base más IVA).

| Se escribe | Sale |
|---|---|
| `100` y `21` | `IVA: 21.0` y `Total: 121.0` |
| `50` y `10` | `IVA: 5.0` y `Total: 55.0` |

:::pregunta[Solución]
```python
base = int(input("Base imponible: "))
porcentaje = int(input("IVA (%): "))

iva = base * porcentaje / 100
total = base + iva

print("IVA:", iva)
print("Total:", total)
```
:::

### 12. La nota final

Escribe `nota-final.py`. La nota final se calcula con un 60 % de la nota del examen y un 40 % de la nota de la práctica. Pide las dos notas (enteros) y escribe `Nota final:` seguido del resultado.

| Se escribe | Sale |
|---|---|
| `6` y `8` | `Nota final: 6.8` |
| `10` y `0` | `Nota final: 6.0` |

:::pregunta[Solución]
```python
PESO_EXAMEN = 60
PESO_PRACTICA = 40

examen = int(input("Nota del examen: "))
practica = int(input("Nota de la práctica: "))

nota_final = (examen * PESO_EXAMEN + practica * PESO_PRACTICA) / 100

print("Nota final:", nota_final)
```

Los pesos son datos fijos del problema, así que van como constantes. Si el reglamento cambiara a 70/30, solo se tocaría la parte de arriba.
:::

### 13. Las semanas

Escribe `semanas.py`. Pide un número de días y escríbelo como semanas completas y días sueltos, con el formato `14 semanas y 2 días`.

| Se escribe | Sale |
|---|---|
| `100` | `14 semanas y 2 días` |
| `7` | `1 semanas y 0 días` |

:::pregunta[Solución]
```python
dias_totales = int(input("Días: "))

semanas = dias_totales // 7
dias = dias_totales % 7

print(semanas, "semanas y", dias, "días")
```

El texto sale `1 semanas`: todavía no sabes hacer que cambie según el número, y llegarás a ello con los condicionales.
:::

### 14. Los ficheros

Escribe `almacenamiento.py`. Pide el tamaño en MB de un fichero y cuántos ficheros hay, y escribe el espacio total en MB y en GB (1 GB son 1024 MB), con el formato `Total: 3072 MB` y `Total: 3.0 GB`.

| Se escribe | Sale |
|---|---|
| `512` y `6` | `Total: 3072 MB` y `Total: 3.0 GB` |
| `100` y `20` | `Total: 2000 MB` y `Total: 1.953125 GB` |

:::pregunta[Solución]
```python
MB_POR_GB = 1024

tamano = int(input("Tamaño de cada fichero (MB): "))
cantidad = int(input("Número de ficheros: "))

total_mb = tamano * cantidad
total_gb = total_mb / MB_POR_GB

print("Total:", total_mb, "MB")
print("Total:", total_gb, "GB")
```
:::

### 15. La hipotenusa

Escribe `hipotenusa.py`. Pide los dos catetos de un triángulo rectángulo y escribe `Hipotenusa:` seguido de su longitud. La hipotenusa es la raíz cuadrada de la suma de los cuadrados de los catetos.

| Se escribe | Sale |
|---|---|
| `3` y `4` | `Hipotenusa: 5.0` |
| `5` y `12` | `Hipotenusa: 13.0` |

:::pregunta[Solución]
```python
cateto_a = int(input("Primer cateto: "))
cateto_b = int(input("Segundo cateto: "))

hipotenusa = (cateto_a ** 2 + cateto_b ** 2) ** 0.5

print("Hipotenusa:", hipotenusa)
```

Elevar a `0.5` es sacar la raíz cuadrada. Los paréntesis son necesarios para que la raíz afecte a toda la suma.
:::

### 16. El interés

Escribe `interes.py`. Pide un capital, un tipo de interés anual (en %) y un número de años, y escribe `Interés simple:` seguido del interés ganado. El interés simple es `capital * tipo * años / 100`.

| Se escribe | Sale |
|---|---|
| `1000`, `5` y `2` | `Interés simple: 100.0` |
| `2000`, `3` y `4` | `Interés simple: 240.0` |

:::pregunta[Solución]
```python
capital = int(input("Capital: "))
tipo = int(input("Interés anual (%): "))
anios = int(input("Años: "))

interes = capital * tipo * anios / 100

print("Interés simple:", interes)
```
:::

### 17. La suma de las cifras

Escribe `suma-cifras.py`. Pide un número entero de **tres cifras** y escribe la suma de sus cifras, con el formato `Suma de cifras: 14`. Se resuelve con `//` y `%`, sin convertir el número a texto.

| Se escribe | Sale |
|---|---|
| `482` | `Suma de cifras: 14` |
| `100` | `Suma de cifras: 1` |
| `999` | `Suma de cifras: 27` |

:::pregunta[Solución]
```python
numero = int(input("Número de tres cifras: "))

centenas = numero // 100
decenas = numero // 10 % 10
unidades = numero % 10

print("Suma de cifras:", centenas + decenas + unidades)
```

La última cifra es el resto de dividir entre 10. La de las decenas se obtiene quitando la última (`// 10`) y quedándose con la última de lo que queda (`% 10`). La primera es la división entera entre 100.
:::

### 18. El tamaño de un disco

Escribe `disco.py`. Un disco de 500 GB se llena con ficheros de 750 MB. Calcula cuántos ficheros enteros caben (1 GB son 1024 MB) y cuántos MB sobran. Muestra `Caben: 682` y `Sobran: 500`. Todos los datos van como constantes.

:::pregunta[Solución]
```python
DISCO_GB = 500
MB_POR_GB = 1024
FICHERO_MB = 750

disco_mb = DISCO_GB * MB_POR_GB

caben = disco_mb // FICHERO_MB
sobran = disco_mb % FICHERO_MB

print("Caben:", caben)
print("Sobran:", sobran)
```

Primero se pasa todo a la misma unidad (MB) y después se usa la pareja `//` y `%`.
:::

---
titulo: "Python 3: el bucle for"
tipo: teoria
---

# Python 3: el bucle for

Un **bucle** repite un bloque de código. El `for` es el bucle para cuando sabes qué quieres recorrer: una lista, un texto o una cuenta del 1 al 10. En lugar de escribir diez veces el mismo `print`, lo escribes una vez y le dices cuántas veces o sobre qué datos.

## Lo mínimo para empezar

| Pieza | Qué hace |
|---|---|
| `for x in lista:` | repite el bloque sangrado una vez por cada elemento; `x` toma cada valor |
| `range(5)` | los números `0, 1, 2, 3, 4` (el 5 **no** entra) |
| `range(1, 6)` | desde el 1 hasta el 5 |
| `range(0, 10, 3)` | de 3 en 3: `0, 3, 6, 9` |
| `range(5, 0, -1)` | hacia atrás: `5, 4, 3, 2, 1` |
| `range(len(lista))` | los índices de una lista |
| `break` | sale del bucle por completo |
| `continue` | salta al siguiente elemento sin acabar la vuelta |
| `print(x, end=" ")` | escribe sin salto de línea; deja un espacio al final |

Qué debes saber:

- El bloque del `for` se marca igual que el del `if`: dos puntos al final y las líneas del bucle **sangradas**. La primera línea sin sangrar ya está fuera del bucle.
- La variable del bucle (`x`) la crea el propio `for` y se actualiza sola en cada vuelta. No hace falta ni crearla antes ni sumarle nada.
- Un **acumulador** es una variable que se prepara **antes** del bucle (`total = 0`) y se actualiza dentro (`total += n`). Un **contador** es lo mismo, sumando 1 solo cuando se cumple una condición.
- `range` no crea una lista: produce los números a medida que se piden. Se puede convertir en lista con `list(range(5))`.
- Se puede meter un bucle dentro de otro. Por cada vuelta del de fuera, el de dentro hace todas las suyas.

## Ejercicios

### 1. Recorrer una lista

Lee este programa:

```python
for nombre in ["Alex", "Bea", "Carlos"]:
    print("Hola", nombre)
```

:::pregunta[¿Qué escribe? ¿Cuántas veces se ejecuta el `print`?]
```text
Hola Alex
Hola Bea
Hola Carlos
```

Tres veces, una por elemento. En cada vuelta, `nombre` vale un elemento distinto de la lista.
:::

### 2. `range` con un solo número

Lee este programa:

```python
for i in range(5):
    print(i)
```

:::pregunta[¿Qué escribe?]
```text
0
1
2
3
4
```

`range(5)` da cinco números empezando en 0. El 5 no se llega a escribir.
:::

### 3. `range` con principio y final

Lee este programa:

```python
for i in range(1, 6):
    print(i)
```

:::pregunta[¿Qué escribe? ¿Cómo escribirías los números del 1 al 100?]
```text
1
2
3
4
5
```

Empieza en el 1 y para **antes** del 6. Para llegar al 100 hay que escribir `range(1, 101)`.
:::

### 4. Con paso

Lee este programa:

```python
for i in range(0, 10, 3):
    print(i)
```

:::pregunta[¿Qué escribe?]
```text
0
3
6
9
```

El tercer número es el paso. Va sumando 3 mientras no llegue a 10.
:::

### 5. Hacia atrás

Lee este programa:

```python
for i in range(5, 0, -1):
    print(i)
```

:::pregunta[¿Qué escribe? ¿Por qué no sale el 0?]
```text
5
4
3
2
1
```

Con un paso negativo se cuenta hacia atrás. El límite (el 0) tampoco entra: el bucle se para al llegar a él.
:::

### 6. Un acumulador

Lee este programa:

```python
total = 0
for n in [4, 6, 10]:
    total = total + n
print(total)
```

:::pregunta[¿Qué escribe? ¿Cuánto vale `total` al empezar cada vuelta?]
```text
20
```

Al empezar valdría 0, 4 y 10 en cada una de las tres vueltas, y al acabar, 20. El acumulador se pone a 0 **antes** del bucle: si estuviera dentro, se reiniciaría en cada vuelta.
:::

### 7. Dentro o fuera del bucle

Los dos programas se diferencian en un solo sangrado:

```python
total = 0
for n in [4, 6, 10]:
    total += n
    print(total)
```

```python
total = 0
for n in [4, 6, 10]:
    total += n
print(total)
```

:::pregunta[¿Qué escribe cada uno?]
El primero escribe tres líneas, porque el `print` está dentro del bucle:

```text
4
10
20
```

El segundo escribe solo la última, porque el `print` está fuera:

```text
20
```
:::

### 8. Un contador

Lee este programa:

```python
contador = 0
for nota in [3, 8, 5, 9, 2]:
    if nota >= 5:
        contador += 1
print(contador)
```

:::pregunta[¿Qué escribe? ¿Qué cuenta?]
```text
3
```

Cuenta las notas aprobadas: 8, 5 y 9. Es un `if` dentro de un `for`: el bucle recorre y el `if` decide cuándo sumar.
:::

### 9. Recorrer un texto

Lee este programa:

```python
for letra in "red":
    print(letra)
```

:::pregunta[¿Qué escribe?]
```text
r
e
d
```

Un texto también se puede recorrer: la variable toma cada carácter por turnos.
:::

### 10. Sin salto de línea

Lee este programa:

```python
for i in range(1, 4):
    print(i, end=" ")
print("fin")
```

:::pregunta[¿Qué escribe?]
```text
1 2 3 fin
```

Con `end=" "`, el `print` termina con un espacio en lugar de un salto de línea, y lo siguiente se escribe a continuación. Un `print()` vacío se usa para saltar a la línea siguiente.
:::

### 11. `continue` y `break`

Lee este programa:

```python
for i in range(1, 8):
    if i == 3:
        continue
    if i == 6:
        break
    print(i)
```

:::pregunta[¿Qué escribe? ¿Qué hace cada una de las dos palabras?]
```text
1
2
4
5
```

Con el 3, `continue` se salta el resto de la vuelta y el 3 no se escribe. Con el 6, `break` sale del bucle: el 6 no se escribe y tampoco el 7.
:::

### 12. Recorrer con índices

Lee este programa:

```python
nombres = ["Alex", "Bea", "Carlos"]
for i in range(len(nombres)):
    print(i, nombres[i])
```

:::pregunta[¿Qué escribe? ¿Cuándo hace falta usar el índice en vez de recorrer la lista directamente?]
```text
0 Alex
1 Bea
2 Carlos
```

`range(len(nombres))` produce los índices 0, 1 y 2. Hace falta cuando necesitas saber la **posición** de cada elemento, o cuando vas a cambiar elementos de la lista, o a mirar a la vez dos listas del mismo tamaño.
:::

### 13. Un bucle dentro de otro

Lee este programa:

```python
for fila in range(1, 3):
    for columna in range(1, 4):
        print(fila, columna)
```

:::pregunta[¿Qué escribe? ¿Cuántas líneas son?]
```text
1 1
1 2
1 3
2 1
2 2
2 3
```

Seis líneas: 2 filas por 3 columnas. Por cada valor de `fila`, el bucle de dentro da sus tres vueltas completas.
:::

## Hazlo tú

Escribe cada programa en su propio fichero `.py`. Pruébalo con los valores indicados y después compáralo con la solución.

### 14. Del 1 al 10

Escribe `cuenta.py`. Con un `for` y `range`, escribe los números del 1 al 10, uno por línea.

:::pregunta[Solución]
```python
for i in range(1, 11):
    print(i)
```
:::

### 15. La tabla de multiplicar

Escribe `tabla.py`. Pide un número y escribe su tabla de multiplicar del 1 al 10, con el formato `7 x 3 = 21`.

| Número | Primera línea | Última línea |
|---|---|---|
| `7` | `7 x 1 = 7` | `7 x 10 = 70` |
| `12` | `12 x 1 = 12` | `12 x 10 = 120` |

:::pregunta[Solución]
```python
numero = int(input("Número: "))
for i in range(1, 11):
    print(numero, "x", i, "=", numero * i)
```
:::

### 16. De 1 a 100

Escribe `suma-cien.py`. Calcula la suma de todos los números del 1 al 100 con un bucle y escríbela. Debe salir `5050`.

:::pregunta[Solución]
```python
total = 0
for i in range(1, 101):
    total += i
print(total)
```

Un acumulador que se pone a 0 antes del bucle y va sumando `i` en cada vuelta.
:::

### 17. Múltiplos

Escribe `multiplos.py`. Escribe, uno por línea, los números del 1 al 50 que sean múltiplos de 3 o de 5. En total deben salir 23 números, de `3` a `50`.

:::pregunta[Solución]
```python
for n in range(1, 51):
    if n % 3 == 0 or n % 5 == 0:
        print(n)
```

El bucle recorre los 50 números y el `if` filtra. Un número es múltiplo de otro cuando el resto de la división es 0.
:::

### 18. Cuenta atrás

Escribe `cuenta-atras.py`. Pide un número y cuenta hacia atrás hasta el 1, uno por línea. Al final escribe `¡Despegue!`.

| Número | Salida |
|---|---|
| `3` | `3`, `2`, `1` y `¡Despegue!`, cada uno en su línea |
| `1` | `1` y `¡Despegue!` |

:::pregunta[Solución]
```python
inicio = int(input("Cuenta desde: "))
for i in range(inicio, 0, -1):
    print(i)
print("¡Despegue!")
```

El `print` final está fuera del bucle, sin sangrar, para que salga una sola vez.
:::

### 19. El triángulo

Escribe `triangulo.py`. Pide un número `n` y dibuja un triángulo de asteriscos de `n` filas, donde la primera tiene un `*`, la segunda `**` y así hasta `n`.

| Número | Salida |
|---|---|
| `4` | `*`, `**`, `***` y `****`, cada uno en su línea |

:::pregunta[Solución]
```python
n = int(input("Filas: "))
for fila in range(1, n + 1):
    print("*" * fila)
```

Un texto multiplicado por un número se repite: `"*" * 3` es `"***"`. Sin esa idea, también sale con un segundo `for` dentro del primero, que escriba los asteriscos de la fila con `end=""`.
:::

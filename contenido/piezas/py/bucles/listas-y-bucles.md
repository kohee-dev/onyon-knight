---
titulo: "Python 5: listas y bucles"
tipo: teoria
---

# Python 5: listas y bucles

Las listas guardan los datos y los bucles los recorren. Juntos resuelven casi todo lo que se pide a un programa pequeño: sumar, contar, buscar el mayor, filtrar, construir otra lista. Esta pieza es la de **combinarlos**; si algo de aquí te cuesta, repasa las piezas de listas y de bucles `for` y `while`.

## Lo mínimo para empezar

| Patrón | Cómo se escribe |
|---|---|
| Recorrer los valores | `for dato in datos:` |
| Recorrer con la posición | `for i in range(len(datos)):` y `datos[i]` |
| Acumular | `total = 0` antes; `total += dato` dentro |
| Contar | `cuenta = 0` antes; `cuenta += 1` dentro de un `if` |
| Quedarse con el mayor | `mayor = datos[0]` antes; `if dato > mayor: mayor = dato` |
| Construir otra lista | `nueva = []` antes; `nueva.append(dato)` dentro de un `if` |
| Buscar | `for ...:` con un `if` y un `break` al encontrarlo |
| Vaciar una lista | `while len(lista) > 0:` y `lista.pop(0)` |

Qué debes saber:

- En `for dato in datos`, `dato` es una **copia del valor** de cada vuelta: asignarle algo (`dato = dato * 2`) no cambia la lista. Para modificar los elementos hay que ir por índices: `datos[i] = datos[i] * 2`.
- No añadas ni quites elementos de una lista mientras la recorres con `for`: el bucle se descuadra. Construye una lista nueva.
- Para el mayor y el menor se empieza por el **primer elemento** de la lista, y no por 0 (si todos son negativos, 0 ganaría sin estar en la lista).
- Una lista puede contener otras listas: `tabla[1][0]` es el primer elemento de la segunda fila.
- Las listas paralelas (una de nombres y otra de precios, en el mismo orden) se recorren con un solo `range(len(...))`.

## Ejercicios

### 1. Cambiar los elementos

Lee estos dos programas:

```python
lista = [1, 2, 3]
for n in lista:
    n = n * 2
print(lista)
```

```python
lista = [1, 2, 3]
for i in range(len(lista)):
    lista[i] = lista[i] * 2
print(lista)
```

:::pregunta[¿Qué escribe cada uno?]
```text
[1, 2, 3]
[2, 4, 6]
```

En el primero, `n` es una copia: se duplica la copia y la lista queda como estaba. En el segundo se escribe en la posición `i` de la lista, y ahí sí se cambia.
:::

### 2. Construir una lista nueva

Lee este programa:

```python
pares = []
for n in range(1, 9):
    if n % 2 == 0:
        pares.append(n)
print(pares)
```

:::pregunta[¿Qué escribe?]
```text
[2, 4, 6, 8]
```

Se parte de una lista vacía y se añade cada elemento que pasa el `if`. Es el patrón para **filtrar**.
:::

### 3. El mayor

Lee este programa:

```python
datos = [4, 9, 2, 9, 7]
mayor = datos[0]
for dato in datos:
    if dato > mayor:
        mayor = dato
print(mayor)
```

:::pregunta[¿Qué escribe? ¿Por qué se empieza con `datos[0]`?]
```text
9
```

Se empieza con el primer elemento porque es un candidato real. Si se empezara con `mayor = 0`, en una lista de números negativos ganaría un 0 que no está en la lista.
:::

### 4. ¿Dónde está el mayor?

Lee este programa, con la misma lista:

```python
datos = [4, 9, 2, 9, 7]
posicion = 0
for i in range(len(datos)):
    if datos[i] > datos[posicion]:
        posicion = i
print(posicion)
```

:::pregunta[¿Qué escribe? ¿Cómo cambiaría si hubiera `>=` en lugar de `>`?]
```text
1
```

Hay dos 9, en las posiciones 1 y 3. Con `>` solo se cambia cuando aparece algo **estrictamente** mayor, así que se queda con el primero. Con `>=` saldría 3, el último.
:::

### 5. La media

Lee este programa:

```python
notas = [6, 8, 10, 4]
total = 0
for nota in notas:
    total += nota
print(total / len(notas))
```

:::pregunta[¿Qué escribe?]
```text
7.0
```

Suman 28 y hay 4 notas. La división con `/` siempre da un número decimal, aunque salga exacta.
:::

### 6. Quitar mientras se recorre

Lee este programa, que intenta quitar los números pares:

```python
numeros = [2, 4, 6, 8]
for n in numeros:
    if n % 2 == 0:
        numeros.remove(n)
print(numeros)
```

:::pregunta[¿Qué escribe? ¿Qué ha ido mal y cómo se hace bien?]
```text
[4, 8]
```

Al quitar el 2, la lista se acorta y el bucle pasa al índice 1, que ahora es el 6: el 4 se salta. Lo mismo ocurre con el 8. Para eliminar elementos se construye una lista nueva con los que se quedan:

```python
impares = []
for n in numeros:
    if n % 2 != 0:
        impares.append(n)
```
:::

### 7. Vaciar una cola

Lee este programa:

```python
cola = [3, 1, 2]
while len(cola) > 0:
    print(cola.pop(0))
```

:::pregunta[¿Qué escribe? ¿Cómo queda `cola` al final?]
```text
3
1
2
```

Cada vuelta saca el primer elemento y lo escribe. Cuando la lista queda vacía, `len(cola)` vale 0 y se sale. La cola acaba como `[]`. Aquí el `while` es la opción natural, porque la lista cambia durante el bucle.
:::

### 8. Listas dentro de listas

Lee este programa:

```python
tabla = [[1, 2], [3, 4]]
print(tabla[1][0])
for fila in tabla:
    print(sum(fila))
```

:::pregunta[¿Qué escribe?]
```text
3
3
7
```

`tabla[1]` es la segunda fila, `[3, 4]`, y `[0]` su primer elemento, el 3. El `for` recorre las filas, y `sum` suma cada una.
:::

### 9. Buscar

Lee este programa:

```python
nombres = ["Alex", "Bea", "Carlos"]
buscado = "Bea"
posicion = -1
for i in range(len(nombres)):
    if nombres[i] == buscado:
        posicion = i
        break
print(posicion)
```

:::pregunta[¿Qué escribe? ¿Y si `buscado` fuera `"Zoe"`?]
```text
1
```

Con `"Zoe"` escribiría `-1`. El `-1` es el valor que se guarda de antemano para decir «no se ha encontrado»; el `break` evita seguir recorriendo cuando ya se ha encontrado.
:::

### 10. Dos listas en paralelo

Lee este programa:

```python
objetos = ["Poción", "Éter"]
precios = [3, 12]
for i in range(len(objetos)):
    print(objetos[i], precios[i])
```

:::pregunta[¿Qué escribe? ¿Por qué hace falta el índice?]
```text
Poción 3
Éter 12
```

La posición `i` relaciona los dos datos: el precio `i` es el del objeto `i`. Un `for` normal recorrería solo una de las listas y no sabría en qué posición está.
:::

## Hazlo tú

Escribe cada programa en su propio fichero `.py`. Los datos de partida van fijos en el programa, salvo que se diga que se pidan por teclado.

### 11. Los nombres

Escribe `nombres.py`. Crea una lista con cinco nombres de personas y escríbelos uno por línea con un `for`.

:::pregunta[Solución]
```python
nombres = ["Alex", "Bea", "Carlos", "Diana", "Ester"]
for nombre in nombres:
    print(nombre)
```
:::

### 12. Suma sin `sum()`

Escribe `suma-lista.py`. Suma todos los números de la lista `[4, 8, 15, 16, 23, 42]` con un bucle, sin usar `sum()`. Debe salir `108`.

:::pregunta[Solución]
```python
numeros = [4, 8, 15, 16, 23, 42]
total = 0
for numero in numeros:
    total += numero
print(total)
```
:::

### 13. Las notas

Escribe `notas.py`. Dada la lista de notas `[4, 6, 8, 2, 10, 6]`, escribe cuántas están aprobadas (5 o más) y la nota media. Debe salir `Aprobadas: 4` y `Media: 6.0`.

:::pregunta[Solución]
```python
notas = [4, 6, 8, 2, 10, 6]
aprobadas = 0
total = 0
for nota in notas:
    total += nota
    if nota >= 5:
        aprobadas += 1
print("Aprobadas:", aprobadas)
print("Media:", total / len(notas))
```

Un solo bucle hace las dos cosas: el acumulador suma todas las notas y el contador solo las aprobadas.
:::

### 14. El mayor sin límite

Escribe `mayor.py`. Pide números por teclado con un `while` hasta que se escriba `0` y guárdalos en una lista. Cuando acabe, escribe `El mayor es` y el número más grande. Si no se ha escrito ningún número antes del 0, escribe `No has escrito ningún número`.

| Números escritos | Salida |
|---|---|
| `4`, `9`, `2`, `0` | `El mayor es 9` |
| `0` | `No has escrito ningún número` |

:::pregunta[Solución]
```python
numeros = []
numero = int(input("Número: "))
while numero != 0:
    numeros.append(numero)
    numero = int(input("Número: "))

if len(numeros) == 0:
    print("No has escrito ningún número")
else:
    mayor = numeros[0]
    for n in numeros:
        if n > mayor:
            mayor = n
    print("El mayor es", mayor)
```

Hace falta comprobar la lista vacía antes de usar `numeros[0]`, que daría un `IndexError`.
:::

### 15. Solo los pares

Escribe `pares.py`. Dada la lista `[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]`, crea otra lista con solo los números pares y escríbela. Debe salir `[2, 4, 6, 8, 10]`. Pruébalo también con `[7, 9, 11]`: debe salir `[]`.

:::pregunta[Solución]
```python
numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
pares = []
for numero in numeros:
    if numero % 2 == 0:
        pares.append(numero)
print(pares)
```
:::

### 16. El inventario con precios

Vuelve a la tienda del aventurero. Escribe `lista-precios.py` con dos listas paralelas: `["Poción", "Éter", "Pluma de Fénix"]` y `[3, 12, 52]`. Escribe una línea por objeto, con el formato `Poción: 3 monedas`, y al final el total en monedas de tener uno de cada.

| Salida |
|---|
| `Poción: 3 monedas` |
| `Éter: 12 monedas` |
| `Pluma de Fénix: 52 monedas` |
| `Total: 67 monedas` |

:::pregunta[Solución]
```python
objetos = ["Poción", "Éter", "Pluma de Fénix"]
precios = [3, 12, 52]

total = 0
for i in range(len(objetos)):
    print(objetos[i] + ":", precios[i], "monedas")
    total += precios[i]
print("Total:", total, "monedas")
```

Se une el nombre y los dos puntos con `+` para que no haya un espacio antes de `:`.
:::

### 17. Sin repetidos

Escribe `sin-repetidos.py`. Dada la lista `[3, 1, 3, 2, 1, 4]`, crea otra con los mismos números pero sin repeticiones, respetando el orden en que aparecen por primera vez. Debe salir `[3, 1, 2, 4]`.

:::pregunta[Solución]
```python
datos = [3, 1, 3, 2, 1, 4]
unicos = []
for dato in datos:
    if dato not in unicos:
        unicos.append(dato)
print(unicos)
```

Cada número solo se añade si todavía no está en la lista nueva.
:::

### 18. El segundo mayor

Escribe `segundo-mayor.py`. Dada la lista `[4, 9, 2, 9, 7]`, escribe el segundo número más grande, **distinto** del mayor, sin ordenar la lista. Debe salir `7`.

:::pregunta[Solución]
```python
datos = [4, 9, 2, 9, 7]

mayor = datos[0]
for dato in datos:
    if dato > mayor:
        mayor = dato

segundo = None
for dato in datos:
    if dato != mayor:
        if segundo is None or dato > segundo:
            segundo = dato

print(segundo)
```

Se hace en dos pasadas: primero se busca el mayor y después el mayor de los que no son ese. `None` es el valor «todavía no hay candidato». Si todos los números fueran iguales, `segundo` se quedaría en `None`.
:::

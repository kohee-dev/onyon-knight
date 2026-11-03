---
titulo: "Python 2: listas"
tipo: teoria
---

# Python 2: listas

Hasta ahora cada variable guardaba un solo dato. Una **lista** guarda muchos, en orden, bajo un mismo nombre: los equipos de un aula, las notas de una clase, los puertos abiertos de un servidor. Casi todos los programas reales trabajan con listas, y los bucles de las piezas siguientes sirven para recorrerlas.

## Lo mínimo para empezar

| Pieza | Qué hace |
|---|---|
| `datos = [4, 8, 6]` | crea una lista con tres elementos (`[]` es la lista vacía) |
| `datos[0]` | el primer elemento: el índice empieza en **0** |
| `datos[-1]` | el último elemento (`-2` es el penúltimo) |
| `len(datos)` | cuántos elementos tiene |
| `datos[1] = 5` | cambia un elemento |
| `datos.append(9)` | añade un elemento **al final** |
| `datos.insert(0, 9)` | inserta un elemento en la posición indicada |
| `datos.remove(8)` | quita la **primera** aparición del valor 8 |
| `datos.pop()` | quita el último y te lo devuelve (`pop(0)` quita el primero) |
| `8 in datos` | `True` si el valor está en la lista |
| `datos[1:3]` | un trozo: desde el índice 1 hasta el 3 **sin incluirlo** |
| `datos.sort()` | ordena la propia lista (`sort(reverse=True)` de mayor a menor) |
| `sum(datos)`, `min(datos)`, `max(datos)` | suma, menor y mayor |
| `datos.count(8)`, `datos.index(8)` | cuántas veces aparece y en qué posición está |

Qué debes saber:

- Una lista puede mezclar tipos (`["alex", 17, True]`), pero casi siempre se usa para datos del mismo tipo.
- Un índice que no existe da un `IndexError`. En una lista de 3 elementos, los índices válidos son 0, 1 y 2.
- En un corte `datos[a:b]` el índice `a` **sí** entra y el `b` **no**. Si se omite uno, se llega hasta el principio o hasta el final: `datos[:2]` y `datos[2:]`.
- `append`, `insert`, `remove`, `pop` y `sort` **modifican la propia lista** y no devuelven una lista nueva.
- Escribir `b = a` no copia la lista: ponen dos nombres a la misma. Para copiar se usa `a.copy()`.

## Ejercicios

### 1. Los índices

Lee este programa:

```python
colores = ["rojo", "verde", "azul"]
print(colores[0])
print(colores[2])
print(colores[-1])
```

:::pregunta[¿Qué escribe?]
```text
rojo
azul
azul
```

El primer elemento tiene el índice 0. El índice 2 es el último y también lo es el `-1`: los negativos cuentan desde el final.
:::

### 2. El tamaño y la lista entera

Con la misma lista:

```python
colores = ["rojo", "verde", "azul"]
print(len(colores))
print(colores)
```

:::pregunta[¿Qué escribe?]
```text
3
['rojo', 'verde', 'azul']
```

`len` cuenta elementos, no índices: el último índice es siempre `len(colores) - 1`. Cuando se imprime una lista entera, Python la escribe con corchetes, comas y las comillas de los textos.
:::

### 3. Un índice que no existe

Con la misma lista:

```python
colores = ["rojo", "verde", "azul"]
print(colores[3])
```

:::pregunta[¿Qué ocurre?]
El programa se para con un `IndexError: list index out of range`. La lista tiene tres elementos, con los índices 0, 1 y 2, y el 3 está fuera.

Es el error más habitual con listas. Cuando lo veas, piensa en el último índice válido: `len(lista) - 1`.
:::

### 4. Cambiar un elemento

Lee este programa:

```python
colores = ["rojo", "verde", "azul"]
colores[1] = "amarillo"
print(colores)
```

:::pregunta[¿Qué escribe?]
```text
['rojo', 'amarillo', 'azul']
```

Una lista se puede modificar elemento a elemento: el `verde` ha desaparecido y en su sitio hay un `amarillo`.
:::

### 5. Añadir elementos

Lee este programa:

```python
equipos = ["pc1", "pc2"]
equipos.append("pc3")
equipos.insert(0, "servidor")
print(equipos)
```

:::pregunta[¿Qué escribe?]
```text
['servidor', 'pc1', 'pc2', 'pc3']
```

`append` añade siempre al final. `insert(0, ...)` coloca el elemento en la posición 0 y desplaza los demás hacia la derecha.
:::

### 6. Quitar elementos

Lee este programa:

```python
numeros = [10, 20, 30, 20]
numeros.remove(20)
print(numeros)
ultimo = numeros.pop()
print(ultimo)
print(numeros)
```

:::pregunta[¿Qué escribe cada `print`?]
```text
[10, 30, 20]
20
[10, 30]
```

`remove(20)` solo quita la **primera** aparición del 20. Después `pop()` saca el último elemento, que es el otro 20, y lo guarda en `ultimo`. Si el valor que se quiere quitar con `remove` no está en la lista, el programa se para con un `ValueError`.
:::

### 7. ¿Está en la lista?

Lee este programa:

```python
puertos = [22, 80, 443]
print(80 in puertos)
print(8080 in puertos)
print(8080 not in puertos)
```

:::pregunta[¿Qué escribe?]
```text
True
False
True
```

`in` pregunta si el valor está en la lista y devuelve un booleano, así que se puede usar directamente dentro de un `if`.
:::

### 8. Cortes

Lee este programa:

```python
letras = ["a", "b", "c", "d", "e"]
print(letras[1:3])
print(letras[:2])
print(letras[2:])
print(letras[-2:])
```

:::pregunta[¿Qué escribe?]
```text
['b', 'c']
['a', 'b']
['c', 'd', 'e']
['d', 'e']
```

`[1:3]` toma los índices 1 y 2: el 3 no entra. `[:2]` empieza en el principio, `[2:]` llega hasta el final y `[-2:]` toma los dos últimos. Un corte siempre da una lista nueva.
:::

### 9. Ordenar

Lee este programa:

```python
notas = [7, 3, 9, 1]
notas.sort()
print(notas)
notas.sort(reverse=True)
print(notas)
```

:::pregunta[¿Qué escribe? ¿Qué pasaría si se escribiera `notas = notas.sort()`?]
```text
[1, 3, 7, 9]
[9, 7, 3, 1]
```

`sort` ordena la propia lista. Como no devuelve nada, `notas = notas.sort()` dejaría en `notas` el valor `None`, y la lista se perdería.
:::

### 10. Dos nombres, una lista

Lee este programa:

```python
a = [1, 2, 3]
b = a
b.append(4)
print(a)
c = a.copy()
c.append(5)
print(a)
```

:::pregunta[¿Qué escribe cada `print`?]
```text
[1, 2, 3, 4]
[1, 2, 3, 4]
```

`b = a` no crea otra lista: `a` y `b` son dos nombres de la misma, y añadir algo por `b` se ve en `a`. `a.copy()` sí crea una lista independiente, y por eso el `append(5)` sobre `c` no cambia `a`.
:::

### 11. Sumar listas y funciones

Lee este programa:

```python
print([1, 2] + [3])
print([0] * 3)
datos = [4, 8, 6]
print(sum(datos), min(datos), max(datos))
```

:::pregunta[¿Qué escribe?]
```text
[1, 2, 3]
[0, 0, 0]
18 4 8
```

`+` junta dos listas en una nueva y `*` repite una lista. `sum`, `min` y `max` resumen una lista de números en un solo valor.
:::

### 12. Contar y localizar

Lee este programa:

```python
cartas = ["A", "K", "A", "Q"]
print(cartas.count("A"))
print(cartas.index("K"))
```

:::pregunta[¿Qué escribe?]
```text
2
1
```

`count` dice cuántas veces aparece el valor. `index` dice **en qué posición** está la primera vez que aparece (se cuenta desde 0).
:::

## Hazlo tú

Escribe cada programa en su propio fichero `.py`. En todos ellos los datos van fijos en una lista al principio del programa, salvo que se diga que se pidan por teclado. Cuando te funcione, abre la solución y compara.

### 13. La lista de la compra

Escribe `compra.py`. Crea una lista con tres productos (por ejemplo `pan`, `leche` y `huevos`), añade un cuarto con `append` y escribe la lista y cuántos productos tiene.

:::pregunta[Solución]
```python
compra = ["pan", "leche", "huevos"]
compra.append("arroz")
print(compra)
print("Productos:", len(compra))
```

Escribe `['pan', 'leche', 'huevos', 'arroz']` y `Productos: 4`.
:::

### 14. El inventario

Escribe `inventario.py`. La mochila de un personaje es la lista `["espada", "escudo", "poción"]`. Pide por teclado el nombre de un objeto: si ya está en la mochila, escribe `Ya lo tienes`; si no, añádelo y escribe la mochila entera.

| Objeto | Salida |
|---|---|
| `escudo` | `Ya lo tienes` |
| `arco` | `['espada', 'escudo', 'poción', 'arco']` |

:::pregunta[Solución]
```python
mochila = ["espada", "escudo", "poción"]
objeto = input("Objeto: ")
if objeto in mochila:
    print("Ya lo tienes")
else:
    mochila.append(objeto)
    print(mochila)
```
:::

### 15. Intercambio

Escribe `intercambio.py`. Dada la lista `["a", "b", "c", "d"]`, intercambia el primer elemento con el último y escribe el resultado. No uses `sort` ni `reverse`.

:::pregunta[Solución]
```python
letras = ["a", "b", "c", "d"]
primero = letras[0]
letras[0] = letras[-1]
letras[-1] = primero
print(letras)
```

Escribe `['d', 'b', 'c', 'a']`. Hace falta guardar el primero en una variable aparte: si se hiciera `letras[0] = letras[-1]` sin más, el valor original de `letras[0]` se perdería. En Python también vale `letras[0], letras[-1] = letras[-1], letras[0]`.
:::

### 16. El ranking

Escribe `ranking.py`. Dadas las puntuaciones `[6, 9, 4, 10, 7]`, escribe la lista ordenada de mayor a menor y, en otra línea, las tres mejores.

:::pregunta[Solución]
```python
puntos = [6, 9, 4, 10, 7]
puntos.sort(reverse=True)
print(puntos)
print(puntos[:3])
```

Escribe `[10, 9, 7, 6, 4]` y después `[10, 9, 7]`. Una vez ordenada de mayor a menor, las tres mejores son simplemente un corte del principio.
:::

### 17. La cola de impresión

Escribe `cola.py`. La cola de impresión es `["informe", "foto", "tfg"]`. Atiende el primer trabajo, quitándolo de la cola y escribiendo `Atendiendo:` seguido de su nombre. Después llega `contrato` y se coloca al final. Escribe la cola resultante.

:::pregunta[Solución]
```python
cola = ["informe", "foto", "tfg"]
atendido = cola.pop(0)
print("Atendiendo:", atendido)
cola.append("contrato")
print(cola)
```

Escribe `Atendiendo: informe` y `['foto', 'tfg', 'contrato']`. Es una cola de verdad: sale el primero que llegó.
:::

### 18. El valor central

Escribe `central.py`. Dada la lista `[5, 3, 8, 1, 9]`, escribe el valor que quedaría **en el centro** si estuviera ordenada, pero sin alterar la lista original. Después escribe la lista original para demostrarlo.

:::pregunta[Solución]
```python
datos = [5, 3, 8, 1, 9]
copia = datos.copy()
copia.sort()
centro = copia[len(copia) // 2]
print("Central:", centro)
print("Original:", datos)
```

Escribe `Central: 5` y `Original: [5, 3, 8, 1, 9]`. Si se hubiera ordenado `datos` directamente, la lista original habría cambiado. Con una cantidad impar de elementos, el del centro está en el índice `len // 2`.
:::

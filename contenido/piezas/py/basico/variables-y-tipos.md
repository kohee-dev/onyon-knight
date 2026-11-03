---
titulo: "Primeros pasos 2: variables y tipos"
tipo: teoria
---

# Primeros pasos 2: variables y tipos

Una **variable** es un nombre al que se asocia un valor para poder usarlo más tarde: el número de equipos, el precio de un cable, el nombre de quien usa el programa. Y cada valor tiene un **tipo** (número entero, decimal, texto o verdadero/falso) que decide qué se puede hacer con él.

## Lo mínimo para empezar

| Pieza | Qué hace |
|---|---|
| `equipos = 6` | crea la variable `equipos` y le asocia el valor `6` |
| `equipos = 7` | le asocia otro valor: el anterior se pierde |
| `equipos = equipos + 1` | calcula con el valor actual y guarda el resultado |
| `print(equipos)` | escribe el **valor** de la variable |
| `print("equipos")` | escribe la palabra `equipos` (es solo un texto) |
| `type(equipos)` | dice el tipo del valor |
| `PUERTOS = 8` | una constante: un dato que no pensamos cambiar, en mayúsculas |

Los cuatro tipos básicos:

| Tipo | Qué guarda | Ejemplos |
|---|---|---|
| `int` | números enteros | `6`, `-3`, `0` |
| `float` | números con decimales (con **punto**) | `2.5`, `0.1`, `3.0` |
| `str` | texto, entre comillas | `"Aula 1"`, `"12"` |
| `bool` | verdadero o falso | `True`, `False` |

Qué debes saber:

- **`=` no es una igualdad matemática: es una asignación.** Se calcula lo de la derecha y el resultado se guarda en el nombre de la izquierda. Por eso `n = n + 1` tiene sentido.
- Una variable guarda el **valor** del momento. Si copias `b = a` y después cambias `a`, `b` se queda como estaba.
- Nombres: letras minúsculas sin tildes, números y guiones bajos (`numero_equipos`, en *snake_case*). No pueden empezar por un número ni llevar espacios o guiones medios, y no pueden ser palabras reservadas como `if`, `for` o `class`. Las mayúsculas cuentan: `equipo` y `Equipo` son dos nombres distintos.
- Un nombre que no existe todavía da un `NameError`. Una variable tiene que recibir su valor **antes** de usarse.
- `12` es un entero y `"12"` es un texto: no se comportan igual.
- Los decimales se escriben con punto (`2.5`), no con coma.
- Una constante es solo una convención: Python no impide cambiarla. El nombre en mayúsculas avisa de que no se debe tocar.

## Ejercicios

### 1. Crear y escribir

Lee este programa:

```python
equipos = 6
print(equipos)
print("equipos")
```

:::pregunta[¿Qué escribe cada `print`?]
```text
6
equipos
```

Sin comillas, `print` escribe el valor asociado al nombre. Con comillas, escribe el propio texto.
:::

### 2. Cambiar el valor

Lee este programa:

```python
equipos = 6
print(equipos)
equipos = 7
print(equipos)
```

:::pregunta[¿Qué escribe?]
```text
6
7
```

El programa usa el valor que tiene la variable **en el momento** de cada instrucción. La segunda asignación sustituye al 6.
:::

### 3. Actualizar con el valor anterior

Lee este programa:

```python
n = 5
n = n + 1
n = n * 2
print(n)
```

:::pregunta[¿Qué escribe? ¿Cuánto vale `n` después de cada línea?]
```text
12
```

Después de la primera línea `n` vale 5; de la segunda, 6; y de la tercera, 12. En cada una se calcula con el valor de ese momento y el resultado pasa a ser el nuevo valor.
:::

### 4. Copiar una variable

Lee este programa:

```python
a = 3
b = a
a = 10
print(a, b)
```

:::pregunta[¿Qué escribe?]
```text
10 3
```

`b = a` copia el valor que `a` tiene en ese momento, que es 3. Cambiar `a` después no afecta a `b`.
:::

### 5. Los tipos

Lee este programa:

```python
print(type(12))
print(type(2.5))
print(type("12"))
print(type(True))
```

:::pregunta[¿Qué escribe?]
```text
<class 'int'>
<class 'float'>
<class 'str'>
<class 'bool'>
```

`type` dice a qué tipo pertenece un valor. Fíjate en que `12` y `"12"` parecen iguales, pero uno es un entero y el otro, un texto.
:::

### 6. Número o texto

Lee este programa:

```python
print(12 + 1)
print("12" + "1")
print("12" * 2)
```

:::pregunta[¿Qué escribe?]
```text
13
121
1212
```

Con números, `+` suma. Con textos, `+` los pega y `*` los repite. La operación depende del tipo, aunque los dos valores se escriban con las mismas cifras.
:::

### 7. Nombres válidos

Se han probado estos nombres de variable:

```text
equipo1
1equipo
numero_equipos
numero-equipos
class
Equipo
```

:::pregunta[¿Cuáles son válidos y cuáles no? ¿Por qué?]
Son válidos `equipo1`, `numero_equipos` y `Equipo`.

No lo son:

- `1equipo`: empieza por un número.
- `numero-equipos`: el guion medio se lee como una resta.
- `class`: es una palabra reservada de Python.

`Equipo` es válido, pero distinto de `equipo`; por convención, en este curso los nombres van en minúsculas.
:::

### 8. Mayúsculas

Lee este programa:

```python
equipo = 1
print(Equipo)
```

:::pregunta[¿Qué ocurre?]
Da un `NameError`: `Equipo` con mayúscula es otro nombre, y no se le ha dado ningún valor.
:::

### 9. Usar antes de crear

Lee este programa:

```python
print(total)
total = 5
```

:::pregunta[¿Qué ocurre y por qué?]
Da un `NameError`. El programa se ejecuta de arriba abajo, y en la primera línea `total` todavía no existe: se crea en la segunda.
:::

### 10. Una constante

Lee este programa:

```python
PUERTOS_POR_SWITCH = 8
switches = 3
print(PUERTOS_POR_SWITCH * switches)
```

:::pregunta[¿Qué escribe? ¿Para qué sirve ponerle nombre al 8?]
```text
24
```

El nombre explica qué es el 8 (los puertos de cada *switch*) y, si el dato cambia algún día, se corrige en una sola línea. Un número escrito suelto en un cálculo, sin explicar qué es, se llama **número mágico**.
:::

### 11. Los decimales

Lee este programa:

```python
print(0.1 + 0.2)
print(0.1 + 0.2 == 0.3)
```

:::pregunta[¿Qué escribe? ¿Es un error de Python?]
```text
0.30000000000000004
False
```

No es un error de Python, sino de cómo se guardan los decimales en cualquier ordenador: en binario, el `0.1` no se puede representar de forma exacta. Por eso **no se comparan decimales con `==`**: hay un pequeño error de aproximación.
:::

### 12. División y tipos

Lee este programa:

```python
print(7 / 2)
print(6 / 2)
print(type(6 / 2))
```

:::pregunta[¿Qué escribe?]
```text
3.5
3.0
<class 'float'>
```

La división con `/` siempre da un `float`, incluso cuando es exacta: `6 / 2` es `3.0`, no `3`.
:::

### 13. Los booleanos

Lee este programa:

```python
print(3 > 2)
print(type(3 > 2))
print(True + True)
```

:::pregunta[¿Qué escribe?]
```text
True
<class 'bool'>
2
```

Una comparación da un `bool`. Y en Python `True` vale 1 y `False` vale 0 al operar con ellos, por eso `True + True` es 2.
:::

### 14. Varias variables en un `print`

Lee este programa:

```python
nombre = "Alex"
edad = 17
print(nombre, "tiene", edad, "años")
```

:::pregunta[¿Qué escribe? ¿Por qué hay comillas en `"tiene"` y no en `nombre`?]
```text
Alex tiene 17 años
```

`nombre` y `edad` son variables, y `print` escribe sus valores. `"tiene"` y `"años"` son textos literales. Las comas ponen los espacios y permiten mezclar tipos.
:::

### 15. Pegar un número a un texto

Lee este programa:

```python
edad = 17
print("Edad: " + edad)
```

:::pregunta[¿Qué ocurre? ¿Cómo se arregla?]
Da un `TypeError`: no se puede sumar un texto y un entero. Se arregla de dos maneras: con una coma, `print("Edad:", edad)`, o convirtiendo el número en texto, `print("Edad: " + str(edad))`.
:::

## Hazlo tú

Escribe cada programa en su propio fichero `.py`. Guarda siempre los datos en variables con un nombre que se entienda, y nunca los escribas sueltos dentro del cálculo.

### 16. Los cables

Escribe `cables.py`. Hay 12 ordenadores y cada uno necesita 3 cables. Guarda cada dato en una variable, calcula el total de cables y muestra `Cables necesarios: 36`.

:::pregunta[Solución]
```python
ordenadores = 12
cables_por_ordenador = 3

cables_totales = ordenadores * cables_por_ordenador

print("Cables necesarios:", cables_totales)
```
:::

### 17. El intercambio

Escribe `intercambio.py`. Parte de `a = 5` y `b = 9`. Intercambia sus valores para que `a` valga 9 y `b` valga 5, y escribe `a` y `b` con un solo `print`. Debe salir `9 5`.

:::pregunta[Solución]
```python
a = 5
b = 9

auxiliar = a
a = b
b = auxiliar

print(a, b)
```

Hace falta una tercera variable donde guardar el valor de `a` antes de pisarlo. Si hicieras `a = b` y después `b = a`, las dos acabarían valiendo 9. En Python también vale `a, b = b, a`.
:::

### 18. Los tipos

Escribe `tipos.py`. Muestra el tipo de cada uno de estos cuatro valores, uno por línea y en este orden: `7`, `7.0`, `"7"` y `True`.

:::pregunta[Solución]
```python
print(type(7))
print(type(7.0))
print(type("7"))
print(type(True))
```

Salen `<class 'int'>`, `<class 'float'>`, `<class 'str'>` y `<class 'bool'>`: cuatro tipos para el mismo «siete».
:::

### 19. El coste del cable

Escribe `coste.py`. Un metro de cable cuesta 2.5 euros, y ese precio debe ser una constante. Con 10 metros, calcula el coste y muestra `Coste: 25.0 euros`.

:::pregunta[Solución]
```python
PRECIO_METRO = 2.5
metros = 10

coste = PRECIO_METRO * metros

print("Coste:", coste, "euros")
```

Sale `25.0` porque uno de los números es decimal.
:::

### 20. Las visitas

Escribe `visitas.py`. Parte de `visitas = 0`. Súmale 1 tres veces, usando siempre el valor anterior, y después multiplícalo por 10. Muestra `Visitas: 30`.

:::pregunta[Solución]
```python
visitas = 0
visitas = visitas + 1
visitas = visitas + 1
visitas = visitas + 1
visitas = visitas * 10
print("Visitas:", visitas)
```

En cada línea se calcula con el valor que tiene `visitas` en ese momento: 1, 2, 3 y, al final, 30.
:::

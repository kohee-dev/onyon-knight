---
titulo: "Primeros pasos 4: conversiones y entrada de datos"
tipo: teoria
---

# Primeros pasos 4: conversiones y entrada de datos

Hasta ahora, los datos estaban escritos en el programa. Con `input()` los datos los da **la persona que lo ejecuta**, y el mismo programa sirve para valores distintos. Pero hay una trampa: todo lo que llega por teclado es **texto**. Esta pieza trata de recibir datos y de convertirlos al tipo que necesitas.

## Lo mínimo para empezar

| Pieza | Qué hace |
|---|---|
| `input()` | espera a que se escriba una línea y la devuelve **como texto** |
| `input("Edad: ")` | lo mismo, mostrando antes una pregunta |
| `int("12")` | convierte un texto o un decimal en un entero: `12` |
| `float("2.5")` | convierte en decimal: `2.5` |
| `str(3)` | convierte en texto: `"3"` |
| `bool(0)` | convierte en `bool`: `False` |
| `int(input("Edad: "))` | lee y convierte en un solo paso |
| `round(2.567, 2)` | redondea a dos decimales: `2.57` |

Qué debes saber:

- **`input()` siempre devuelve un `str`**, aunque se escriban cifras. Para operar hay que convertir antes.
- `int()` no redondea: **corta la parte decimal** (`int(3.9)` es `3`, y `int(-3.9)` es `-3`). Para redondear se usa `round()`.
- `int("3.9")` da error: un texto con decimales no es un entero. Hay que pasar por `float`: `int(float("3.9"))`.
- `int("doce")` da un `ValueError`: el texto no representa un número. Por ahora, en estos ejercicios se escriben siempre datos válidos.
- Los espacios a los lados no estorban a `int()` ni a `float()`: `int(" 42 ")` es `42`.
- `bool()` mira si hay «algo»: el `0`, el `0.0` y el texto vacío dan `False`; casi todo lo demás da `True`, **también `"False"` y `"0"`**: son textos con contenido.
- Python convierte solo, sin avisar, entre `int` y `float` al operar: `2 + 0.5` es `2.5`. Pero no convierte textos en números: `"2" + 3` es un `TypeError`.
- `round` redondea los empates al par: `round(2.5)` es `2` y `round(3.5)` es `4`.
- Al escribir decimales por teclado se usa el punto: `2.5`, no `2,5`.

## Ejercicios

En los ejercicios con `input()`, la persona que usa el programa escribe lo que se indica y pulsa Intro.

### 1. Convertir textos

Lee este programa:

```python
print(int("12") + 1)
print(float("2.5"))
print(str(3) + "x")
```

:::pregunta[¿Qué escribe?]
```text
13
2.5
3x
```

`int("12")` es el número 12, al que se le puede sumar 1. `str(3)` es el texto `"3"`, que se puede pegar con `"x"`.
:::

### 2. Cortar los decimales

Lee este programa:

```python
print(int(3.9))
print(int(-3.9))
print(int(7.0))
```

:::pregunta[¿Qué escribe? ¿Redondea `int`?]
```text
3
-3
7
```

No redondea: se queda con la parte entera, acercándose a cero. `int(3.9)` es 3, no 4.
:::

### 3. Decimales y espacios

Lee este programa:

```python
print(float(3))
print(int(" 42 "))
```

:::pregunta[¿Qué escribe?]
```text
3.0
42
```

`float(3)` pasa un entero a decimal. Y `int` ignora los espacios que haya al principio y al final del texto.
:::

### 4. Verdadero o falso

Lee este programa:

```python
print(bool(0), bool(""), bool("False"), bool(" "), bool(0.0), bool("0"))
```

:::pregunta[¿Qué escribe?]
```text
False False True True False True
```

El `0`, el `0.0` y el texto vacío son falsos. `"False"`, `" "` (un espacio) y `"0"` son textos que contienen algo, así que son verdaderos: `bool` no lee su significado, solo mira si el texto está vacío.
:::

### 5. Un texto que no es un número

Lee este programa:

```python
numero = int("doce")
```

:::pregunta[¿Qué ocurre?]
El programa se para con un `ValueError`: el texto `"doce"` no representa un entero. Solo se pueden convertir textos que contengan un número escrito con cifras.
:::

### 6. Un entero con decimales

Lee este programa:

```python
print(int("3.9"))
```

:::pregunta[¿Qué ocurre? ¿Cómo se consigue un 3?]
Da un `ValueError`: `"3.9"` es un texto con decimales y `int` solo acepta enteros escritos sin decimales. Se pasa por `float` primero:

```python
print(int(float("3.9")))
```

Primero se convierte en el decimal `3.9` y después se corta en `3`.
:::

### 7. Sumar un texto y un número

Lee este programa:

```python
print("2" + 3)
```

:::pregunta[¿Qué ocurre y cómo se arregla?]
Da un `TypeError`: no se puede sumar un texto y un entero. Depende de lo que se quiera: `int("2") + 3` suma y da `5`, y `"2" + str(3)` pega y da `"23"`.
:::

### 8. Conversiones automáticas

Lee este programa:

```python
print(2 + 0.5)
print(type(2 + 0.5))
print(type(4 / 2))
print(type(4 // 2))
```

:::pregunta[¿Qué escribe?]
```text
2.5
<class 'float'>
<class 'float'>
<class 'int'>
```

Al mezclar un entero con un decimal, Python pasa el entero a decimal sin que se lo pidas. `/` siempre da un decimal, y `//` entre dos enteros da un entero.
:::

### 9. Lo que llega por teclado

Una persona escribe `5` en este programa:

```python
x = input()
print(type(x))
print(x + x)
```

:::pregunta[¿Qué escribe?]
```text
<class 'str'>
55
```

Es un texto, aunque se haya escrito una cifra. Por eso `x + x` pega los dos textos en lugar de sumar.
:::

### 10. Leer un número

Una persona escribe `6`:

```python
n = int(input())
print(n + 1)
```

:::pregunta[¿Qué escribe? ¿En qué orden se ejecutan `input` e `int`?]
```text
7
```

Python ejecuta primero lo de dentro, `input()`, que devuelve el texto `"6"`, y después `int()` lo convierte en el número 6.
:::

### 11. Dos números

Una persona escribe `4` y después `5`. Lee estos dos programas:

```python
a = input()
b = input()
print(a + b)
```

```python
a = int(input())
b = int(input())
print(a + b)
```

:::pregunta[¿Qué escribe cada uno?]
```text
45
9
```

El primero pega dos textos. El segundo convierte cada lectura en número antes de sumar. Es el error más común al empezar con `input`.
:::

### 12. Un precio con decimales

Una persona escribe `2.5`:

```python
precio = float(input())
print(precio * 3)
```

:::pregunta[¿Qué escribe? ¿Qué ocurriría con `int(input())`?]
```text
7.5
```

Con `int(input())` el programa se pararía con un `ValueError`, porque `"2.5"` no es un entero. Para precios y medidas con decimales se usa `float`.
:::

### 13. Un número dentro de un texto

Lee este programa:

```python
edad = 17
print("Tengo " + str(edad) + " años")
```

:::pregunta[¿Qué escribe? ¿Qué cambiaría si no estuviera `str(...)`?]
```text
Tengo 17 años
```

Sin `str`, el programa se pararía con un `TypeError`, porque `+` no mezcla textos con números. La alternativa es la coma: `print("Tengo", edad, "años")`.
:::

### 14. `round` frente a `int`

Lee este programa:

```python
print(round(2.5), round(3.5), round(2.567, 2))
```

:::pregunta[¿Qué escribe? ¿Qué tiene de raro?]
```text
2 4 2.57
```

`round(2.5)` da 2 y `round(3.5)` da 4: cuando el decimal es justo un medio, Python redondea al número **par** más próximo. Con un segundo argumento, `round` deja ese número de decimales.
:::

## Hazlo tú

Escribe cada programa en su propio fichero `.py`. Ponle siempre una pregunta al `input` para que se sepa qué hay que escribir. Pruébalo con los valores de la tabla.

### 15. El doble

Escribe `doble.py`. Pide un número entero con `input` y escribe su doble.

| Se escribe | Sale |
|---|---|
| `21` | `42` |
| `-5` | `-10` |

:::pregunta[Solución]
```python
numero = int(input("Número: "))
print(numero * 2)
```
:::

### 16. La suma

Escribe `suma.py`. Pide dos números enteros y escribe `La suma es` seguido del resultado.

| Se escribe | Sale |
|---|---|
| `5` y `7` | `La suma es 12` |

:::pregunta[Solución]
```python
primero = int(input("Primer número: "))
segundo = int(input("Segundo número: "))
print("La suma es", primero + segundo)
```
:::

### 17. El área

Escribe `area.py`. Pide la base y la altura de un rectángulo, que pueden llevar decimales, y escribe `Área:` seguido del área.

| Se escribe | Sale |
|---|---|
| `2.5` y `4` | `Área: 10.0` |
| `3` y `3` | `Área: 9.0` |

:::pregunta[Solución]
```python
base = float(input("Base: "))
altura = float(input("Altura: "))
print("Área:", base * altura)
```

Las dos cosas se convierten en `float`, porque la entrada puede llevar decimales.
:::

### 18. La media

Escribe `media.py`. Pide tres notas enteras y escribe `Media:` seguido de la media.

| Se escribe | Sale |
|---|---|
| `6`, `7` y `8` | `Media: 7.0` |
| `4`, `10` y `10` | `Media: 8.0` |

:::pregunta[Solución]
```python
nota1 = int(input("Primera nota: "))
nota2 = int(input("Segunda nota: "))
nota3 = int(input("Tercera nota: "))
media = (nota1 + nota2 + nota3) / 3
print("Media:", media)
```

Los paréntesis son imprescindibles: sin ellos solo se dividiría la tercera nota entre 3.
:::

### 19. Grados Fahrenheit

Escribe `fahrenheit.py`. Pide una temperatura en grados Celsius (puede llevar decimales) y escribe `Fahrenheit:` seguido de su valor en grados Fahrenheit. La fórmula es `celsius * 9 / 5 + 32`.

| Se escribe | Sale |
|---|---|
| `100` | `Fahrenheit: 212.0` |
| `0` | `Fahrenheit: 32.0` |
| `20` | `Fahrenheit: 68.0` |

:::pregunta[Solución]
```python
celsius = float(input("Grados Celsius: "))
fahrenheit = celsius * 9 / 5 + 32
print("Fahrenheit:", fahrenheit)
```
:::

### 20. Las cifras

Escribe `cifras.py`. Pide un número entero positivo y escribe cuántas cifras tiene, con el formato `Cifras: 5`. No uses divisiones: se puede resolver convirtiendo el número a texto.

| Se escribe | Sale |
|---|---|
| `12345` | `Cifras: 5` |
| `7` | `Cifras: 1` |
| `100` | `Cifras: 3` |

:::pregunta[Solución]
```python
numero = int(input("Número: "))
print("Cifras:", len(str(numero)))
```

`str(numero)` convierte el número en texto y `len` cuenta los caracteres de un texto. Funciona con cualquier número positivo.
:::

---
titulo: "Python 4: el bucle while"
tipo: teoria
---

# Python 4: el bucle while

El `for` repite sobre algo que ya conoces. El `while` repite **mientras se cumpla una condición**, sin saber de antemano cuántas vueltas serán: pedir una contraseña hasta que sea correcta, leer números hasta que escriban un 0, reintentar una conexión. Es el bucle de las situaciones en que no hay una lista que recorrer.

## Lo mínimo para empezar

| Pieza | Qué hace |
|---|---|
| `while condición:` | repite el bloque sangrado mientras la condición sea `True` |
| `while True:` | bucle que no acaba por sí solo: solo se sale con `break` |
| `break` | sale del bucle |
| `continue` | salta al principio de la siguiente vuelta |
| `n += 1` | actualiza la variable que controla el bucle |
| Ctrl+C | detiene un programa que no termina |

Qué debes saber:

- La condición se mira **antes de cada vuelta**, también antes de la primera. Si ya es falsa al llegar, el bloque no se ejecuta ni una vez.
- Algo dentro del bloque tiene que acabar haciendo falsa la condición. Si no, el bucle es **infinito** y el programa no termina. Casi siempre es que se ha olvidado actualizar la variable que controla el bucle.
- Un bucle `while` que lee datos suele tener esta forma: se lee el primer dato **antes** del bucle, el bucle procesa y lee el siguiente al final del bloque, y la condición mira si el dato es el de parada.
- Un valor que indica «se acabó» (como el `0` o la palabra `fin`) se llama **centinela**.
- Con `while True` y un `break` dentro de un `if`, la condición de salida se puede poner donde más claro quede.
- Todo `for` se puede escribir como `while`, pero no al revés: el `for` es más corto cuando se sabe qué recorrer.

## Ejercicios

### 1. Un bucle que cuenta

Lee este programa:

```python
n = 1
while n <= 3:
    print(n)
    n += 1
print("fin")
```

:::pregunta[¿Qué escribe? ¿Cuántas veces se mira la condición?]
```text
1
2
3
fin
```

La condición se mira cuatro veces: con `n` valiendo 1, 2 y 3 es cierta y entra en el bloque; con 4 es falsa y sale. `n += 1` es lo que hace que el bucle acabe.
:::

### 2. Una condición que ya es falsa

Lee este programa:

```python
n = 10
while n < 5:
    print(n)
print("hecho")
```

:::pregunta[¿Qué escribe?]
```text
hecho
```

La condición `10 < 5` es falsa desde el principio, así que el bloque no se ejecuta ni una vez. Aquí no hay bucle infinito, porque nunca se entra.
:::

### 3. Cuenta atrás

Lee este programa:

```python
n = 3
while n > 0:
    print(n)
    n -= 1
```

:::pregunta[¿Qué escribe?]
```text
3
2
1
```

Se escribe mientras `n` sea mayor que 0. Cuando `n` llega a 0, la condición es falsa y se sale sin escribir el 0.
:::

### 4. El bucle infinito

Lee este programa:

```python
n = 1
while n <= 3:
    print(n)
```

:::pregunta[¿Qué ocurre? ¿Cómo se arregla y cómo se detiene mientras tanto?]
Escribe `1` una y otra vez, sin parar. Nada dentro del bloque cambia `n`, así que `n <= 3` es siempre cierto.

Se arregla añadiendo `n += 1` como última línea del bloque. Mientras el programa está corriendo, se detiene pulsando **Ctrl+C**.
:::

### 5. Hasta pasarse

Lee este programa:

```python
total = 0
n = 1
while total < 20:
    total += n
    n += 1
print(total, n)
```

:::pregunta[¿Qué escribe?]
```text
21 7
```

`total` va valiendo 1, 3, 6, 10, 15 y 21. Con 21 la condición es falsa y se sale; para entonces `n` ya ha llegado a 7. Mira que el bucle **no** se para justo en 20: se para en el primer valor que no cumple la condición.
:::

### 6. Salir con `break`

Lee este programa:

```python
i = 0
while True:
    i += 1
    if i % 4 == 0:
        break
print(i)
```

:::pregunta[¿Qué escribe? ¿Por qué no es infinito, si la condición es `True`?]
```text
4
```

Cuando `i` llega a 4, el resto de dividir entre 4 es 0 y el `break` saca al programa del bucle, saltándose la condición.
:::

### 7. Saltar una vuelta

Lee este programa:

```python
i = 0
while i < 6:
    i += 1
    if i % 2 == 0:
        continue
    print(i)
```

:::pregunta[¿Qué escribe? ¿Qué pasaría si `i += 1` estuviera debajo del `if`?]
```text
1
3
5
```

`continue` vuelve a mirar la condición sin ejecutar el `print`. Si `i += 1` estuviera debajo del `if`, el `continue` se lo saltaría y con `i == 2` el bucle se repetiría para siempre.
:::

### 8. Leer hasta una palabra

Este programa lee de teclado, y una persona escribe `a`, `b` y `fin`, cada una en su línea:

```python
palabra = input()
while palabra != "fin":
    print("Leído:", palabra)
    palabra = input()
```

:::pregunta[¿Qué escribe?]
```text
Leído: a
Leído: b
```

La primera lectura va antes del bucle, y la siguiente, al final de cada vuelta. `fin` es el centinela: la condición se hace falsa, y esa palabra no se procesa.
:::

### 9. Sumar hasta el cero

Este programa lee `5`, `3` y `0`, uno por línea:

```python
total = 0
numero = int(input())
while numero != 0:
    total += numero
    numero = int(input())
print(total)
```

:::pregunta[¿Qué escribe? ¿Se suma el 0 final?]
```text
8
```

El 0 se lee, pero la condición es falsa y no entra en el bloque, así que no se suma. Daría igual en una suma, pero no en un conteo de elementos.
:::

### 10. Repetir mientras el dato sea malo

Este programa lee `-5`, `-1` y `30`, uno por línea:

```python
edad = int(input())
while edad < 0:
    print("No válida")
    edad = int(input())
print("Edad", edad)
```

:::pregunta[¿Qué escribe?]
```text
No válida
No válida
Edad 30
```

Es el patrón para **validar una entrada**: mientras el dato no sirva, avisa y vuelve a pedirlo. Las dos primeras lecturas no cumplen y la tercera sí.
:::

### 11. Limitar los intentos

Lee este programa:

```python
intentos = 0
clave = ""
while clave != "1234" and intentos < 3:
    clave = input()
    intentos += 1
print(intentos)
```

:::pregunta[¿Qué escribe si se teclean `a`, `b` y `c`? ¿Y si se teclea `1234` a la primera?]
Con `a`, `b` y `c` escribe `3`: las tres lecturas fallan y el bucle se para porque `intentos` llega a 3. Con `1234` a la primera escribe `1`.

La condición junta las dos razones para parar: acertar o agotar los intentos. Con `and`, el bucle sigue solo mientras **las dos** cosas sigan siendo ciertas.
:::

### 12. `for` o `while`

Estos dos programas hacen lo mismo:

```python
for i in range(3):
    print(i)
```

```python
i = 0
while i < 3:
    print(i)
    i += 1
```

:::pregunta[¿Qué escriben? ¿Cuál es mejor aquí y cuál lo sería para pedir una contraseña hasta acertar?]
Los dos escriben `0`, `1` y `2`, cada uno en su línea.

Aquí es mejor el `for`: se sabe cuántas vueltas son, y el `while` obliga a crear la variable y a no olvidar sumarla. Para pedir una contraseña hasta acertar es mejor el `while`, porque no se sabe cuántos intentos hará falta.
:::

## Hazlo tú

Escribe cada programa en su propio fichero `.py`. Los tres primeros indican las herramientas y los últimos solo piden el objetivo.

### 13. Del 1 al 10 con `while`

Escribe `contar.py`. Con un `while`, escribe los números del 1 al 10, uno por línea.

:::pregunta[Solución]
```python
n = 1
while n <= 10:
    print(n)
    n += 1
```
:::

### 14. Suma hasta el cero

Escribe `suma-hasta-cero.py`. Pide números con un `while` hasta que se escriba un `0`. Al final escribe `Suma:` y la suma y, en otra línea, `Números:` y cuántos números se han escrito, sin contar el 0.

| Números escritos | Salida |
|---|---|
| `4`, `6`, `10`, `0` | `Suma: 20` y `Números: 3` |
| `0` | `Suma: 0` y `Números: 0` |

:::pregunta[Solución]
```python
suma = 0
cantidad = 0
numero = int(input("Número: "))
while numero != 0:
    suma += numero
    cantidad += 1
    numero = int(input("Número: "))
print("Suma:", suma)
print("Números:", cantidad)
```
:::

### 15. Adivina el número

Escribe `adivina.py`. El número secreto es `7`, y debe estar en una constante. El programa pide números hasta que se acierte. Si el número es menor que el secreto, escribe `Más alto`; si es mayor, `Más bajo`. Al acertar escribe `Acertaste en` seguido del número de intentos y la palabra `intentos`.

| Números escritos | Salida |
|---|---|
| `3`, `9`, `7` | `Más alto`, `Más bajo` y `Acertaste en 3 intentos` |
| `7` | `Acertaste en 1 intentos` |

:::pregunta[Solución]
```python
NUMERO_SECRETO = 7

intentos = 0
numero = 0
while numero != NUMERO_SECRETO:
    numero = int(input("Número: "))
    intentos += 1
    if numero < NUMERO_SECRETO:
        print("Más alto")
    elif numero > NUMERO_SECRETO:
        print("Más bajo")
print("Acertaste en", intentos, "intentos")
```

Con un solo intento, el texto sale como `1 intentos`: no importa, el objetivo es el bucle. Se arrancó `numero` en 0 para que el bucle entre la primera vez.
:::

### 16. Tres intentos

Escribe `clave.py`. Pide la clave hasta tres veces. La clave correcta es `Router2026`, en una constante. Si se acierta, escribe `Acceso concedido` y deja de pedir. Si se agotan los tres intentos, escribe `Cuenta bloqueada`.

| Claves escritas | Salida |
|---|---|
| `x`, `y`, `Router2026` | `Acceso concedido` |
| `x`, `y`, `z` | `Cuenta bloqueada` |
| `Router2026` | `Acceso concedido` |

:::pregunta[Solución]
```python
CLAVE_CORRECTA = "Router2026"
MAX_INTENTOS = 3

intentos = 0
acierto = False
while intentos < MAX_INTENTOS and not acierto:
    clave = input("Clave: ")
    intentos += 1
    if clave == CLAVE_CORRECTA:
        acierto = True

if acierto:
    print("Acceso concedido")
else:
    print("Cuenta bloqueada")
```

La variable `acierto` es una **bandera**: el bucle la consulta para saber si ya puede parar. Con `break` también saldría, y es igual de válido.
:::

### 17. El menú

Escribe `menu.py`. El programa muestra un menú y lo repite hasta que se elija salir. Con `1` escribe `Hola`; con `2`, `Adiós`; con `0`, `Hasta luego` y termina; con cualquier otra cosa, `Opción no válida`.

| Opciones escritas | Salida |
|---|---|
| `1`, `5`, `2`, `0` | `Hola`, `Opción no válida`, `Adiós` y `Hasta luego` |

:::pregunta[Solución]
```python
while True:
    opcion = input("Opción (1, 2 o 0): ")
    if opcion == "1":
        print("Hola")
    elif opcion == "2":
        print("Adiós")
    elif opcion == "0":
        print("Hasta luego")
        break
    else:
        print("Opción no válida")
```

Aquí `while True` con `break` queda más claro que un `while` con condición, porque la salida está en una de las opciones. Se comparan textos (`"1"`) porque `input` devuelve texto.
:::

### 18. La secuencia

Escribe `secuencia.py`. Pide un número entero positivo `n` y repite estos pasos hasta llegar a 1: si `n` es par, cámbialo por su mitad; si es impar, por el triple más uno. Escribe cada valor, empezando por el inicial, y al final escribe `Pasos:` y cuántos cambios han hecho falta.

| Número | Valores | Pasos |
|---|---|---|
| `6` | `6`, `3`, `10`, `5`, `16`, `8`, `4`, `2`, `1` | `8` |
| `1` | `1` | `0` |

:::pregunta[Solución]
```python
n = int(input("Número: "))
pasos = 0
print(n)
while n != 1:
    if n % 2 == 0:
        n = n // 2
    else:
        n = 3 * n + 1
    pasos += 1
    print(n)
print("Pasos:", pasos)
```

No se sabe cuántas vueltas dará, y esa es la señal de que hace falta un `while`. Con `n = 1` no entra ni una vez y escribe solo `1` y `Pasos: 0`.
:::

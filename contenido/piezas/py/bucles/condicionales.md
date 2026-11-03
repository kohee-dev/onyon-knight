---
titulo: "Python 1: condicionales"
tipo: teoria
---

# Python 1: condicionales

Hasta ahora tus programas hacían siempre lo mismo, de arriba abajo. Con un **condicional** el programa decide: ejecuta unas líneas solo si se cumple algo. Es la base de todo lo demás: comprobar una contraseña, validar un dato, elegir entre dos caminos.

## Lo mínimo para empezar

| Pieza | Qué hace |
|---|---|
| `if condición:` | ejecuta el bloque de debajo **solo si** la condición es `True` |
| `else:` | el bloque que se ejecuta cuando la condición del `if` era `False` |
| `elif condición:` | otra condición, que solo se mira si las anteriores han fallado |
| `==` `!=` | igual y distinto |
| `<` `>` `<=` `>=` | menor, mayor, menor o igual y mayor o igual |
| `and` `or` `not` | las dos a la vez, al menos una y la contraria |
| `texto in cadena` | `True` si el texto aparece dentro de la cadena |
| `a % b` | el resto de dividir `a` entre `b` (`14 % 2` es `0`) |

Qué debes saber:

- La línea del `if` acaba siempre en **dos puntos** (`:`) y las líneas que dependen de ella van **sangradas** cuatro espacios. El sangrado es lo que dice qué líneas están dentro del `if`; la primera línea sin sangrar ya queda fuera.
- **`=` asigna y `==` compara.** Escribir `if x = 5:` es un error.
- En una cadena `if / elif / else`, Python mira las condiciones **en orden** y ejecuta solo el primer bloque cuya condición se cumple. Las demás ya no se miran. Por eso el orden importa.
- Dos `if` seguidos (sin `elif`) son independientes: cada uno se evalúa por su cuenta.
- `input()` siempre devuelve **texto**. Para comparar con un número hay que convertirlo antes con `int()` o `float()`.
- Una condición no tiene por qué ser una comparación: `0`, la cadena vacía `""` y `False` cuentan como falso, y casi todo lo demás como verdadero.
- Se puede comparar un valor con dos límites a la vez: `8 <= hora < 15` equivale a `hora >= 8 and hora < 15`.

## Ejercicios

### 1. Un `if` solo

Lee este programa:

```python
temperatura = 28
if temperatura > 25:
    print("Hace calor")
print("Fin")
```

:::pregunta[¿Qué escribe?]
```text
Hace calor
Fin
```

`28 > 25` es `True`, así que se ejecuta el `print` sangrado. `print("Fin")` no está sangrado: está fuera del `if` y se ejecuta siempre.
:::

### 2. El mismo `if` con otro valor

Ahora la temperatura es 20 y el bloque tiene dos líneas:

```python
temperatura = 20
if temperatura > 25:
    print("Hace calor")
    print("Pon el ventilador")
print("Fin")
```

:::pregunta[¿Qué escribe?]
```text
Fin
```

La condición es `False`, así que Python se salta **todo el bloque sangrado**, las dos líneas. Solo se ejecuta lo que queda sin sangrar.
:::

### 3. Si no, esto otro

Lee este programa:

```python
edad = 17
if edad >= 18:
    print("Mayor de edad")
else:
    print("Menor de edad")
```

:::pregunta[¿Qué escribe? ¿Se podría ejecutar a la vez el `print` del `if` y el del `else`?]
```text
Menor de edad
```

No: con `if / else` se ejecuta **exactamente uno** de los dos bloques. Como `17 >= 18` es falso, se ejecuta el del `else`.
:::

### 4. Varias ramas

Lee este programa:

```python
nota = 7
if nota >= 9:
    print("Sobresaliente")
elif nota >= 7:
    print("Notable")
elif nota >= 5:
    print("Aprobado")
else:
    print("Suspenso")
```

:::pregunta[¿Qué escribe? ¿Por qué no escribe también `Aprobado`?]
```text
Notable
```

Python mira `nota >= 9` (falso), después `nota >= 7` (verdadero), ejecuta ese bloque y **se acaba la cadena**. `nota >= 5` también es cierto, pero ya no se llega a mirar.
:::

### 5. `if` seguido de `if`

Lee este programa, que se parece al anterior pero no lo es:

```python
puntos = 10
if puntos >= 5:
    print("A")
if puntos >= 8:
    print("B")
elif puntos >= 5:
    print("C")
```

:::pregunta[¿Qué escribe?]
```text
A
B
```

Son dos cadenas independientes. La primera (`if puntos >= 5`) escribe `A`. La segunda empieza en el segundo `if`: `puntos >= 8` es cierto y escribe `B`, y el `elif` ya no se mira.
:::

### 6. Orden de las condiciones

Una persona ha escrito esto para decidir el precio de una entrada:

```python
edad = 8
if edad < 18:
    print("Entrada joven")
elif edad < 12:
    print("Entrada infantil")
else:
    print("Entrada normal")
```

:::pregunta[Con `edad = 8`, ¿qué escribe? ¿Qué falla y cómo se arregla?]
```text
Entrada joven
```

El bloque `elif edad < 12` **nunca se ejecuta**: cualquiera menor de 12 es también menor de 18, y esa condición va antes. Se arregla poniendo primero la condición más estricta:

```python
if edad < 12:
    print("Entrada infantil")
elif edad < 18:
    print("Entrada joven")
else:
    print("Entrada normal")
```

Cuando las condiciones se solapan, ordénalas de la más específica a la más general.
:::

### 7. `and` y `or`

Lee estos dos programas:

```python
usuario = "alex"
activo = True
if usuario == "alex" and activo:
    print("Entra")
else:
    print("Rechazado")
```

```python
puerto = 22
if puerto == 80 or puerto == 443:
    print("Web")
else:
    print("Otro")
```

:::pregunta[¿Qué escribe cada uno?]
```text
Entra
Otro
```

En el primero se cumplen las dos condiciones (`usuario == "alex"` y `activo`), así que `and` es verdadero. En el segundo ninguna se cumple: 22 no es ni 80 ni 443.

Fíjate en que hay que escribir `puerto == 80 or puerto == 443`. `puerto == 80 or 443` no hace lo que parece.
:::

### 8. Buscar dentro de un texto

Lee este programa:

```python
correo = "alex.mail.com"
if "@" in correo:
    print("Correo válido")
else:
    print("Falta la arroba")
```

:::pregunta[¿Qué escribe? ¿Y si `correo` fuera `"alex@mail.com"`?]
```text
Falta la arroba
```

`"@" in correo` es verdadero cuando el texto aparece en alguna parte de la cadena. Con `"alex@mail.com"` escribiría `Correo válido`. Con `not in` se pregunta lo contrario.
:::

### 9. Pares e impares

Lee este programa:

```python
numero = 14
if numero % 2 == 0:
    print("Par")
else:
    print("Impar")
```

:::pregunta[¿Qué escribe? ¿Cómo cambiaría la condición para saber si un número es múltiplo de 5?]
```text
Par
```

`14 % 2` es el resto de dividir 14 entre 2, que es 0, y un número es par cuando el resto es 0. Para el múltiplo de 5 se usa `numero % 5 == 0`.
:::

### 10. Verdadero y falso

Lee este programa:

```python
if 0:
    print("A")
if "":
    print("B")
if "hola":
    print("C")
```

:::pregunta[¿Qué escribe?]
```text
C
```

El `0` y la cadena vacía cuentan como falso, y un texto con algo dentro cuenta como verdadero. No hace falta escribir `== True`.
:::

### 11. Condiciones anidadas

Lee este programa:

```python
hora = 10
dia = "sab"
if dia != "sab" and dia != "dom":
    if hora >= 8 and hora < 15:
        print("Abierto")
    else:
        print("Cerrado por la hora")
else:
    print("Cerrado el fin de semana")
```

:::pregunta[¿Qué escribe? ¿Cómo se escribiría la condición de la hora con una sola comparación?]
```text
Cerrado el fin de semana
```

Un `if` puede ir dentro de otro. Aquí el primero decide si es un día laborable. Como `dia` es `"sab"`, se va al `else` de fuera y el `if` de la hora ni se mira.

La hora se puede escribir como `8 <= hora < 15`.
:::

### 12. Dos errores que se repiten

Estos dos programas no llegan a ejecutarse:

```python
clave = "abc"
if clave = "abc":
    print("Correcta")
```

```python
x = 5
if x > 3:
print("grande")
```

:::pregunta[¿Qué falla en cada uno?]
En el primero se ha usado `=` (asignar) donde hacía falta `==` (comparar): Python se queja de un error de sintaxis en la línea del `if`.

En el segundo, el `print` **no está sangrado**, así que Python no sabe qué hay dentro del `if` y da un `IndentationError`. Casi siempre se arregla poniendo cuatro espacios delante.

Los errores de este tipo se leen de abajo arriba: la última línea del mensaje dice el tipo de error y la anterior, dónde.
:::

## Hazlo tú

Escribe cada programa en su propio fichero `.py` y pruébalo con los valores de la tabla. **No sirve que funcione con uno solo**: los valores de la tabla están pensados para caer justo en los límites, que es donde más se falla. Cuando funcione con todos, abre la solución y compara.

### 13. Mayor de edad

Escribe `votar.py`. Pregunta la edad con `input` y conviértela con `int`. Con un `if` y un `else`, escribe `Ya puedes votar` si la edad es 18 o más, y `Todavía no puedes votar` en caso contrario.

| Edad | Salida |
|---|---|
| `17` | `Todavía no puedes votar` |
| `18` | `Ya puedes votar` |
| `40` | `Ya puedes votar` |

:::pregunta[Solución]
```python
edad = int(input("¿Qué edad tienes? "))
if edad >= 18:
    print("Ya puedes votar")
else:
    print("Todavía no puedes votar")
```

El fallo típico es escribir `edad > 18`: con 18 saldría `Todavía no puedes votar`.
:::

### 14. El semáforo

Escribe `semaforo.py`. Pregunta el color con `input` y usa `if`, `elif` y `else`: con `verde` escribe `Pasa`, con `amarillo` escribe `Precaución` y con cualquier otra cosa escribe `Para`.

| Color | Salida |
|---|---|
| `verde` | `Pasa` |
| `amarillo` | `Precaución` |
| `rojo` | `Para` |
| `azul` | `Para` |

:::pregunta[Solución]
```python
color = input("Color del semáforo: ")
if color == "verde":
    print("Pasa")
elif color == "amarillo":
    print("Precaución")
else:
    print("Para")
```

Aquí no hace falta convertir nada: `input` ya devuelve texto, y estamos comparando con texto.
:::

### 15. La nota

Escribe `nota.py`. Pide una nota (puede tener decimales) y escribe su calificación según esta tabla.

| Nota | Calificación |
|---|---|
| menos de 5 | `Suspenso` |
| de 5 a menos de 6 | `Aprobado` |
| de 6 a menos de 7 | `Bien` |
| de 7 a menos de 9 | `Notable` |
| 9 o más | `Sobresaliente` |

Pruébalo con `4.99`, `5`, `6`, `8.5` y `9`: deben salir `Suspenso`, `Aprobado`, `Bien`, `Notable` y `Sobresaliente`.

:::pregunta[Solución]
```python
nota = float(input("Nota: "))
if nota >= 9:
    print("Sobresaliente")
elif nota >= 7:
    print("Notable")
elif nota >= 6:
    print("Bien")
elif nota >= 5:
    print("Aprobado")
else:
    print("Suspenso")
```

Se empieza por la nota más alta y cada `elif` solo necesita un límite, porque los de arriba ya han fallado. Se ha usado `float` para admitir decimales.
:::

### 16. El acceso

Escribe `acceso.py`. El programa pregunta el usuario y la clave, y escribe `Acceso concedido` solo si **los dos** son correctos, y `Acceso denegado` en cualquier otro caso. El usuario correcto es `admin` y la clave correcta es `Router2026`. Guarda ambos datos como constantes del programa.

| Usuario | Clave | Salida |
|---|---|---|
| `admin` | `Router2026` | `Acceso concedido` |
| `admin` | `1234` | `Acceso denegado` |
| `root` | `Router2026` | `Acceso denegado` |
| `admin` | `router2026` | `Acceso denegado` |

:::pregunta[Solución]
```python
USUARIO_CORRECTO = "admin"
CLAVE_CORRECTA = "Router2026"

usuario = input("Usuario: ")
clave = input("Clave: ")

if usuario == USUARIO_CORRECTO and clave == CLAVE_CORRECTA:
    print("Acceso concedido")
else:
    print("Acceso denegado")
```

La comparación distingue mayúsculas de minúsculas, y por eso falla la última fila. Las constantes van en mayúsculas y al principio, como en las prácticas anteriores.
:::

### 17. El año bisiesto

Escribe `bisiesto.py`. Pide un año y escribe `Bisiesto` o `No bisiesto`. Un año es bisiesto si es divisible entre 4, salvo que lo sea entre 100; pero los divisibles entre 400 sí lo son.

| Año | Salida |
|---|---|
| `2024` | `Bisiesto` |
| `2026` | `No bisiesto` |
| `1900` | `No bisiesto` |
| `2000` | `Bisiesto` |

:::pregunta[Solución]
```python
anio = int(input("Año: "))
if anio % 400 == 0 or (anio % 4 == 0 and anio % 100 != 0):
    print("Bisiesto")
else:
    print("No bisiesto")
```

Hay que juntar las tres reglas en una sola condición con `and`, `or` y paréntesis. 1900 sirve de prueba: es divisible entre 4 y entre 100, pero no entre 400. También se puede hacer con tres `if` anidados, y funciona igual.
:::

### 18. Los puertos

Escribe `puerto.py`. Pide un número de puerto de red y clasifícalo según esta tabla. Los números fuera de rango no son puertos.

| Puerto | Salida |
|---|---|
| de 0 a 1023 | `Puerto bien conocido` |
| de 1024 a 49151 | `Puerto registrado` |
| de 49152 a 65535 | `Puerto dinámico` |
| cualquier otro | `No es un puerto válido` |

Pruébalo con `-1`, `22`, `1024`, `49151`, `49152`, `65535` y `65536`.

:::pregunta[Solución]
```python
puerto = int(input("Número de puerto: "))
if puerto < 0 or puerto > 65535:
    print("No es un puerto válido")
elif puerto < 1024:
    print("Puerto bien conocido")
elif puerto < 49152:
    print("Puerto registrado")
else:
    print("Puerto dinámico")
```

Se descartan primero los valores imposibles y después cada `elif` ya sabe que el número está dentro del rango, así que solo necesita el límite de arriba. Salen, por orden: `No es un puerto válido`, `Puerto bien conocido`, `Puerto registrado`, `Puerto registrado`, `Puerto dinámico`, `Puerto dinámico` y `No es un puerto válido`.
:::

### 19. El mayor de tres

Escribe `mayor.py`. Pide tres números enteros y escribe cuál es el mayor con el texto `El mayor es` seguido del número. No uses la función `max()`: se trata de resolverlo con condicionales.

| Números | Salida |
|---|---|
| `3`, `9`, `5` | `El mayor es 9` |
| `9`, `3`, `5` | `El mayor es 9` |
| `5`, `3`, `9` | `El mayor es 9` |
| `4`, `4`, `4` | `El mayor es 4` |

:::pregunta[Solución]
```python
primero = int(input("Primer número: "))
segundo = int(input("Segundo número: "))
tercero = int(input("Tercer número: "))

if primero >= segundo and primero >= tercero:
    mayor = primero
elif segundo >= tercero:
    mayor = segundo
else:
    mayor = tercero

print("El mayor es", mayor)
```

Si el primero no es el mayor, queda decidir entre los otros dos, y el `elif` solo necesita compararlos entre sí. Fíjate en que el último `else` no lleva condición: es el caso que queda. Pruébalo con el mayor en cada posición para estar seguro de que no hay ninguna que falle.
:::

---
titulo: "Python 6: cadenas de texto"
tipo: teoria
---

# Python 6: cadenas de texto

Una **cadena** es un texto: un nombre de usuario, una dirección IP, la línea de un fichero de registro. Y se parece mucho a una lista: tiene un tamaño, se accede por índices, se corta en trozos y se recorre con un `for`. Esta pieza junta lo que ya sabes de listas y bucles con las herramientas propias del texto.

## Lo mínimo para empezar

| Pieza | Qué hace |
|---|---|
| `len(texto)` | cuántos caracteres tiene |
| `texto[0]`, `texto[-1]` | el primer y el último carácter |
| `texto[1:4]` | un trozo, igual que en las listas |
| `texto.upper()`, `texto.lower()` | a mayúsculas y a minúsculas |
| `texto.strip()` | quita los espacios del principio y del final |
| `texto.replace("a", "b")` | cambia todas las apariciones de un trozo por otro |
| `texto.split(",")` | parte el texto por un separador y da una **lista** (sin separador, parte por espacios) |
| `"-".join(lista)` | une una lista de textos con un separador |
| `texto.count("a")`, `texto.find("a")` | cuántas veces aparece, y en qué posición (`-1` si no está) |
| `texto.startswith("a")`, `texto.endswith("a")` | si empieza o acaba así |
| `texto.isdigit()` | `True` si todos los caracteres son cifras |
| `"a" in texto` | si el trozo aparece dentro |
| `texto + otro`, `texto * 3` | juntar y repetir |

Qué debes saber:

- Una cadena **no se puede modificar**: `texto[0] = "P"` da un error. Los métodos como `upper` o `replace` no cambian el texto, **devuelven uno nuevo**, y hay que guardarlo: `texto = texto.upper()`.
- Los métodos se pueden encadenar: `texto.strip().lower()`.
- Las cadenas se comparan por orden de código de carácter: todas las mayúsculas van antes que las minúsculas, y se comparan carácter a carácter, sin entender números.
- `"5" + "5"` es `"55"`: con textos, `+` junta. Para sumar números hay que convertirlos antes con `int()`.
- `input()` siempre devuelve una cadena. Con `isdigit()` se puede comprobar que lo escrito son cifras antes de convertirlo con `int()` y evitar un error.

## Ejercicios

### 1. Índices y cortes

Lee este programa:

```python
palabra = "python"
print(len(palabra))
print(palabra[0])
print(palabra[-1])
print(palabra[1:4])
```

:::pregunta[¿Qué escribe?]
```text
6
p
n
yth
```

Funciona igual que en las listas: el primer carácter tiene el índice 0, el último es el `-1`, y en `[1:4]` entran los índices 1, 2 y 3.
:::

### 2. Una cadena no se modifica

Lee este programa:

```python
palabra = "python"
palabra[0] = "P"
```

:::pregunta[¿Qué ocurre? ¿Cómo se consigue `Python` con mayúscula?]
El programa se para con un `TypeError`: las cadenas no admiten asignar a una posición.

Se construye otra, juntando la nueva letra con el resto del texto:

```python
palabra = "P" + palabra[1:]
```
:::

### 3. Mayúsculas y minúsculas

Lee este programa:

```python
texto = "Hola Mundo"
print(texto.upper())
print(texto.lower())
print(texto)
```

:::pregunta[¿Qué escribe? ¿Por qué la tercera línea sigue igual?]
```text
HOLA MUNDO
hola mundo
Hola Mundo
```

Los métodos devuelven un texto nuevo y no cambian el original. Para quedarse con el resultado hay que asignarlo a una variable.
:::

### 4. Quitar los espacios

Lee este programa:

```python
texto = "   hola  "
print("[" + texto.strip() + "]")
```

:::pregunta[¿Qué escribe? ¿Para qué sirve en un programa que pide datos?]
```text
[hola]
```

`strip` quita los espacios y los saltos de línea del principio y del final, pero no los de en medio. Sirve para limpiar lo que una persona escribe por teclado antes de compararlo: `" admin"` no es igual a `"admin"`.
:::

### 5. Sustituir

Lee este programa:

```python
ip = "192.168.1.10"
print(ip.replace(".", "-"))
```

:::pregunta[¿Qué escribe?]
```text
192-168-1-10
```

`replace` cambia **todas** las apariciones del primer texto por el segundo.
:::

### 6. Partir un texto

Lee este programa:

```python
print("a,b,c".split(","))
print("uno dos  tres".split())
```

:::pregunta[¿Qué escribe?]
```text
['a', 'b', 'c']
['uno', 'dos', 'tres']
```

`split` devuelve una **lista**. Sin argumentos, parte por los espacios y no se queda con trozos vacíos aunque haya varios seguidos. Se usa para separar los campos de una línea.
:::

### 7. Unir una lista

Lee este programa:

```python
print("-".join(["a", "b", "c"]))
print(", ".join(["rojo", "verde"]))
```

:::pregunta[¿Qué escribe? ¿Qué relación tiene con `split`?]
```text
a-b-c
rojo, verde
```

`join` hace lo contrario que `split`: une los elementos de una lista de textos usando como pegamento el texto sobre el que se llama. Todos los elementos tienen que ser textos.
:::

### 8. Contar y localizar

Lee este programa:

```python
print("banana".count("a"))
print("banana".find("n"))
print("banana".find("z"))
```

:::pregunta[¿Qué escribe?]
```text
3
2
-1
```

`count` cuenta apariciones, `find` da la posición de la primera y `-1` indica que no está. A diferencia de `index` en las listas, `find` no se queja si no encuentra el texto.
:::

### 9. Empieza y acaba

Lee este programa:

```python
fichero = "informe.txt"
print(fichero.endswith(".txt"))
print(fichero.startswith("foto"))
```

:::pregunta[¿Qué escribe?]
```text
True
False
```

Son preguntas con respuesta `True` o `False`, y se usan casi siempre dentro de un `if`: por ejemplo, para quedarse solo con los ficheros `.txt`.
:::

### 10. Contar vocales

Lee este programa:

```python
frase = "murcielago"
vocales = 0
for letra in frase:
    if letra in "aeiou":
        vocales += 1
print(vocales)
```

:::pregunta[¿Qué escribe? ¿Qué dos ideas se combinan?]
```text
5
```

Las vocales son `u`, `i`, `e`, `a` y `o`. Se combina recorrer una cadena con un `for` y preguntar si un carácter está en otro texto con `in`.
:::

### 11. Dar la vuelta

Lee este programa:

```python
texto = "abc"
inverso = ""
for letra in texto:
    inverso = letra + inverso
print(inverso)
```

:::pregunta[¿Qué escribe? ¿Qué valor tiene `inverso` en cada vuelta?]
```text
cba
```

`inverso` vale `a`, luego `ba` y al final `cba`: cada letra se pone **delante** de lo que ya había. Python permite hacerlo más corto con `texto[::-1]`.
:::

### 12. Comparar textos

Lee este programa:

```python
print("a" < "b")
print("Z" < "a")
print("10" < "9")
```

:::pregunta[¿Qué escribe? ¿Por qué la última es cierta?]
```text
True
True
True
```

Las cadenas se comparan carácter a carácter por el código de cada uno: todas las mayúsculas van antes que las minúsculas. En `"10" < "9"` se compara primero `"1"` con `"9"`, y el `1` va antes: el texto no entiende de números. Por eso hay que convertir con `int()` antes de comparar cifras.
:::

### 13. Repetir y comprobar cifras

Lee este programa:

```python
print("ab" * 3)
print("5" + "5")
print("123".isdigit())
print("12a".isdigit())
```

:::pregunta[¿Qué escribe?]
```text
ababab
55
True
False
```

Con textos, `*` repite y `+` junta: `"5" + "5"` no suma, da `"55"`. `isdigit` dice si todo son cifras.
:::

## Hazlo tú

Escribe cada programa en su propio fichero `.py`. Los primeros indican las herramientas y los últimos solo piden el objetivo.

### 14. La palabra

Escribe `palabra.py`. Pide una palabra y escribe su número de letras, la primera y la última, con las etiquetas `Letras:`, `Primera:` y `Última:`.

| Palabra | Salida |
|---|---|
| `python` | `Letras: 6`, `Primera: p` y `Última: n` |

:::pregunta[Solución]
```python
palabra = input("Palabra: ")
print("Letras:", len(palabra))
print("Primera:", palabra[0])
print("Última:", palabra[-1])
```
:::

### 15. Vocales

Escribe `vocales.py`. Pide una frase y escribe cuántas vocales tiene, contando también las mayúsculas. No hace falta contar las vocales con tilde.

| Frase | Salida |
|---|---|
| `Hola Mundo` | `4` |
| `rhythm` | `0` |
| `AEIOU` | `5` |

:::pregunta[Solución]
```python
frase = input("Frase: ").lower()
vocales = 0
for letra in frase:
    if letra in "aeiou":
        vocales += 1
print(vocales)
```

Pasar la frase a minúsculas permite mirar solo `aeiou`, sin repetir las mayúsculas.
:::

### 16. Al revés

Escribe `inversa.py`. Pide una palabra y escríbela al revés.

| Palabra | Salida |
|---|---|
| `redes` | `seder` |
| `a` | `a` |

:::pregunta[Solución]
```python
palabra = input("Palabra: ")
inversa = ""
for letra in palabra:
    inversa = letra + inversa
print(inversa)
```

También vale `print(palabra[::-1])`.
:::

### 17. Palíndromos

Escribe `palindromo.py`. Un palíndromo es un texto que se lee igual al derecho y al revés, sin tener en cuenta las mayúsculas ni los espacios. Pide una frase y escribe `Es un palíndromo` o `No es un palíndromo`.

| Frase | Salida |
|---|---|
| `reconocer` | `Es un palíndromo` |
| `Anita lava la tina` | `Es un palíndromo` |
| `python` | `No es un palíndromo` |

:::pregunta[Solución]
```python
frase = input("Frase: ")
limpia = frase.lower().replace(" ", "")

inversa = ""
for letra in limpia:
    inversa = letra + inversa

if limpia == inversa:
    print("Es un palíndromo")
else:
    print("No es un palíndromo")
```

Primero se **normaliza** el texto, y después se compara con su inverso. Es la misma idea que `strip` y `lower` antes de comprobar una contraseña o un usuario.
:::

### 18. El correo

Escribe `correo.py`. Pide una dirección de correo y escribe `Correo válido` solo si cumple las tres cosas: tiene exactamente una `@`, acaba en `.com` o en `.es` y no tiene espacios. En otro caso escribe `Correo no válido`.

| Correo | Salida |
|---|---|
| `alex@mail.com` | `Correo válido` |
| `alex.mail.com` | `Correo no válido` |
| `a@b@c.com` | `Correo no válido` |
| `alex@mail.org` | `Correo no válido` |
| `alex @mail.com` | `Correo no válido` |

:::pregunta[Solución]
```python
correo = input("Correo: ")
una_arroba = correo.count("@") == 1
termina_bien = correo.endswith(".com") or correo.endswith(".es")
sin_espacios = " " not in correo

if una_arroba and termina_bien and sin_espacios:
    print("Correo válido")
else:
    print("Correo no válido")
```

Guardar cada comprobación en una variable con nombre hace que el `if` final se lea casi como una frase.
:::

### 19. La dirección IP

Escribe `ip.py`. Pide una dirección IPv4 y escribe `IP válida` o `IP no válida`. Es válida si tiene exactamente cuatro partes separadas por puntos y cada una es un número entre 0 y 255.

| Dirección | Salida |
|---|---|
| `192.168.1.10` | `IP válida` |
| `192.168.1` | `IP no válida` |
| `192.168.1.256` | `IP no válida` |
| `192.168.1.a` | `IP no válida` |

:::pregunta[Solución]
```python
direccion = input("Dirección IP: ")
partes = direccion.split(".")

valida = len(partes) == 4
for parte in partes:
    if not parte.isdigit():
        valida = False
    elif int(parte) > 255:
        valida = False

if valida:
    print("IP válida")
else:
    print("IP no válida")
```

Hay que comprobar `isdigit()` **antes** de convertir con `int()`; si no, `int("a")` pararía el programa con un error. Se parte de que es válida y cada fallo la hace falsa. Por eso nunca se vuelve a poner a `True`.
:::

### 20. Las siglas

Escribe `siglas.py`. Pide el nombre de un módulo y escribe sus siglas: la primera letra de cada palabra, en mayúscula.

| Nombre | Salida |
|---|---|
| `Sistemas Operativos Monopuesto` | `SOM` |
| `redes locales` | `RL` |

:::pregunta[Solución]
```python
nombre = input("Nombre: ")
siglas = ""
for palabra in nombre.split():
    siglas += palabra[0].upper()
print(siglas)
```

`split()` convierte la frase en lista de palabras, el `for` recorre la lista y de cada palabra se toma la primera letra.
:::

---
titulo: "Primeros pasos 1: mostrar texto con print"
tipo: teoria
---

# Primeros pasos 1: mostrar texto con print

Un programa que no enseña nada no sirve de mucho. `print()` es la forma de que Python **escriba en pantalla**: un saludo, un resultado, un aviso. Es lo primero que se aprende y lo que más se usa después, también para buscar fallos: cuando algo no funciona, un `print` te dice qué está pasando.

## Lo mínimo para empezar

| Pieza | Qué hace |
|---|---|
| `print("Hola")` | escribe el texto `Hola` y salta de línea |
| `print(2 + 3)` | calcula y escribe `5` |
| `print("Total:", 5)` | escribe varias cosas separadas por un espacio |
| `print("a", "b", sep="-")` | cambia el separador: escribe `a-b` |
| `print("Hola", end="")` | cambia el final: no salta de línea |
| `print()` | escribe una línea vacía |
| `"\n"`, `"\t"` | un salto de línea y un tabulador dentro de un texto |
| `"\\"`, `"\""` | una barra invertida y unas comillas dentro de un texto |
| `"Aula " + "1"` | junta dos textos |
| `"-" * 10` | repite un texto: `----------` |
| `# comentario` | una nota para quien lea el código; Python la ignora |

Qué debes saber:

- Un texto va **entre comillas**, simples (`'`) o dobles (`"`), y hay que cerrar las que se abren. Un número o una operación va sin comillas: `print(2 + 3)` escribe `5`, pero `print("2 + 3")` escribe literalmente `2 + 3`.
- Si el texto lleva comillas dentro, usa las otras para rodearlo (`"Dice 'hola'"`) o pon una barra delante de la que estorba (`"Dice \"hola\""`).
- La barra invertida `\` tiene un significado especial dentro de un texto. Para escribir una barra de verdad hay que doblarla: `"C:\\Users"`.
- Un programa se ejecuta **en orden, de arriba abajo**, y cada `print` termina con un salto de línea salvo que se cambie con `end`.
- Un comentario empieza con `#` y llega hasta el final de la línea. Se usa para explicar el porqué de algo, y también para desactivar una línea sin borrarla.
- Python distingue mayúsculas de minúsculas: `print` existe y `Print` no.

## Ejercicios

### 1. El primer programa

Lee este programa:

```python
print("Hola, mundo")
print('Python')
```

:::pregunta[¿Qué escribe? ¿Importa que una línea use comillas dobles y la otra simples?]
```text
Hola, mundo
Python
```

No importa: las dos formas valen, siempre que se cierre con la misma que se abrió. Las comillas no se escriben, solo rodean el texto.
:::

### 2. Un cálculo o un texto

Lee este programa:

```python
print(2 + 3)
print("2 + 3")
```

:::pregunta[¿Qué escribe cada línea?]
```text
5
2 + 3
```

Sin comillas, Python calcula la operación y escribe el resultado. Con comillas es solo un texto y se escribe tal cual.
:::

### 3. Varias cosas en un `print`

Lee este programa:

```python
print("Equipos:", 6)
print("Total:", 3 * 4)
```

:::pregunta[¿Qué escribe?]
```text
Equipos: 6
Total: 12
```

Las comas separan lo que se escribe, y Python pone un espacio entre cada cosa. Se pueden mezclar textos, números y operaciones.
:::

### 4. El separador

Lee este programa:

```python
print("a", "b", "c", sep="-")
print("a", "b", sep="")
```

:::pregunta[¿Qué escribe?]
```text
a-b-c
ab
```

`sep` es lo que se pone entre cada cosa. Por defecto es un espacio, y con `sep=""` no se pone nada.
:::

### 5. El final de línea

Lee este programa:

```python
print("Cargando", end="...")
print("listo")
```

:::pregunta[¿Qué escribe? ¿En cuántas líneas?]
```text
Cargando...listo
```

En una sola. `end` es lo que se escribe al terminar, y por defecto es un salto de línea. Con `end="..."` el segundo `print` sigue en la misma línea.
:::

### 6. Saltos de línea dentro del texto

Lee este programa:

```python
print("uno\ndos\ntres")
```

:::pregunta[¿Qué escribe?]
```text
uno
dos
tres
```

`\n` es un salto de línea dentro del texto, así que un solo `print` escribe tres líneas. De forma parecida, `\t` escribe un tabulador.
:::

### 7. Comillas dentro del texto

Lee este programa:

```python
print("Dice 'hola'")
print('Dice "hola"')
print("Dice \"hola\"")
```

:::pregunta[¿Qué escribe? ¿Cuándo hace falta la barra?]
```text
Dice 'hola'
Dice "hola"
Dice "hola"
```

Las comillas del otro tipo se escriben sin problema. La barra delante (`\"`) sirve cuando el texto lleva dentro el mismo tipo de comillas que lo rodea.
:::

### 8. Una línea vacía

Lee este programa:

```python
print("A")
print()
print("B")
```

:::pregunta[¿Qué escribe?]
```text
A

B
```

`print()` sin nada dentro escribe solo el salto de línea, y deja una línea en blanco entre las dos letras.
:::

### 9. Juntar y repetir

Lee este programa:

```python
print("Aula " + "1")
print("-" * 10)
```

:::pregunta[¿Qué escribe?]
```text
Aula 1
----------
```

Con textos, `+` los pega (sin añadir espacio: por eso hay uno dentro de `"Aula "`) y `*` los repite. Es el truco para dibujar una línea de separación.
:::

### 10. Los comentarios

Lee este programa:

```python
# print("uno")
print("dos")  # print("tres")
```

:::pregunta[¿Qué escribe?]
```text
dos
```

Todo lo que va detrás de `#` lo ignora Python, sea una explicación o código. La primera línea está desactivada y el `print("tres")` es solo parte del comentario.
:::

### 11. Comillas sin cerrar

Este programa no llega a ejecutarse:

```python
print("Hola)
```

:::pregunta[¿Qué error da y cómo se arregla?]
Da un `SyntaxError` (error de sintaxis): el texto se abre con comillas, pero no se cierran, y Python no sabe dónde acaba. Se arregla cerrando las comillas: `print("Hola")`.

Cuando falla el programa entero antes de empezar a ejecutarse, casi siempre es un error de escritura: comillas, paréntesis o dos puntos que faltan.
:::

### 12. Mayúsculas

Este programa tampoco funciona:

```python
Print("Hola")
```

:::pregunta[¿Qué error da?]
Da un `NameError`: Python no conoce ningún nombre `Print`. La función se llama `print`, con minúscula, porque Python distingue mayúsculas de minúsculas.

Es un error distinto del anterior: el programa se escribe bien, pero se para al intentar ejecutar esa línea.
:::

### 13. Sin paréntesis

Un programa de otro lenguaje se ha copiado así:

```python
print "Hola"
```

:::pregunta[¿Qué error da y cómo se arregla?]
Da un `SyntaxError`: en Python 3, `print` es una función y necesita paréntesis. Se escribe `print("Hola")`.
:::

### 14. Leer un error

Lee el final de este mensaje de error:

```text
  File "programa.py", line 3
    print("Total:" 5)
                   ^
SyntaxError: invalid syntax
```

:::pregunta[¿En qué línea está? ¿Qué falta?]
En la línea **3** del fichero `programa.py`. Falta una **coma** entre `"Total:"` y `5`: son dos cosas distintas dentro del `print` y hay que separarlas.

Un error se lee de abajo arriba: la última línea dice qué ha pasado y las de encima, dónde.
:::

## Hazlo tú

Escribe cada programa en su propio fichero `.py`. Compara lo que escribe con lo que se pide **carácter a carácter**: un espacio de más ya es un fallo.

### 15. La tarjeta

Escribe `tarjeta.py`. Con tres `print`, muestra exactamente esto:

```text
+----------+
| Alex     |
+----------+
```

:::pregunta[Solución]
```python
print("+----------+")
print("| Alex     |")
print("+----------+")
```
:::

### 16. Los días

Escribe `dias.py`. Con **un solo** `print` y el separador, muestra `Lunes-Martes-Miércoles`.

:::pregunta[Solución]
```python
print("Lunes", "Martes", "Miércoles", sep="-")
```
:::

### 17. La cuenta atrás

Escribe `despegue.py`. Con cuatro `print` y sin `sep`, muestra en una sola línea: `3... 2... 1... ¡Despegue!`

:::pregunta[Solución]
```python
print("3...", end=" ")
print("2...", end=" ")
print("1...", end=" ")
print("¡Despegue!")
```

Con `end=" "` cada `print` deja un espacio al terminar en lugar del salto de línea, y el último, sin `end`, cierra la línea.
:::

### 18. La cita

Escribe `cita.py`. Muestra exactamente esta línea, con las dos clases de comillas:

```text
Ella dijo: "Hola, 'mundo'"
```

:::pregunta[Solución]
```python
print("Ella dijo: \"Hola, 'mundo'\"")
```

Las comillas simples caben sin problema dentro de las dobles. Las dobles de dentro necesitan la barra. Otra forma válida es rodear todo con comillas triples: `print('''Ella dijo: "Hola, 'mundo'"''')`.
:::

### 19. La ruta

Escribe `ruta.py`. Muestra esta ruta de Windows:

```text
C:\Users\alex\Documents
```

:::pregunta[Solución]
```python
print("C:\\Users\\alex\\Documents")
```

Cada barra se escribe doble. Si escribieras `"C:\Users"`, Python intentaría leer `\U` como un código especial y daría un `SyntaxError` antes de ejecutar nada.
:::

### 20. El cartel

Escribe `cartel.py`. Muestra este cartel, con una línea de 20 signos `=` arriba y abajo. No escribas los 20 signos a mano.

```text
====================
BIENVENIDO
====================
```

:::pregunta[Solución]
```python
print("=" * 20)
print("BIENVENIDO")
print("=" * 20)
```

La repetición evita contar signos y permite cambiar el ancho en un solo sitio. Mejor aún: guardar la línea en una variable, como verás en la pieza siguiente.
:::

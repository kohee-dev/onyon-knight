---
titulo: "Primeros programas en Python"
licencia: CC-BY-NC-SA-4.0
---

# 1. Programar para resolver un problema

Un programa es un conjunto instrucciones almacenadas que un equipo puede ejecutar. 

**Programar** consiste en diseñar una solución y expresarla mediante un lenguaje, utilizando datos y operaciones.

En SMR podemos utilizar programas para calcular el material de una instalación, preparar información sobre equipos o automatizar tareas repetitivas; aunque en tambien podemos usar estas habilidades en cualquier entorno de nuestra vida cotidiana.

Imagina que tenemos que entregar cinco boligrafos a cada alumno y tenemos 23 alumnos en clase. Podemos expresar la solución en tres pasos:

1. Conocer cuántos alumnos hay.
2. Multiplicar esa cantidad por los boligrafos que necesita cada uno de los alumnos.
3. Mostrar el total.

Esta secuencia es un **algoritmo**: una descripción ordenada de los pasos de la solución. Python permite escribirlo en código.

```python
alumnos = 23
boligrafos_por_alumno = 5
total = alumnos * boligrafos_por_alumno
print("Boligrafos necesarios:", total)
```

Resultado esperado:

```text
Boligrafos necesarios: 115
```

**Antes de escribir código debemos entender qué queremos obtener y con qué datos contamos.**

# 2. Preparar el entorno de trabajo

## 2.1. Lenguaje, intérprete y entorno de desarrollo

| Elemento | Función |
| --- | --- |
| **Python** | Lenguaje en el que escribimos las instrucciones. |
| **Intérprete** | Software que ejecuta el código Python. |
| **Editor** | Herramienta donde escribimos y guardamos el código. |
| **IDE** | Entorno integrado que reúne edición, ejecución y otras herramientas de desarrollo. |

En clase utilizaremos **Python 3 y Mu**. Empezaremos con un entorno sencillo para centrarnos en comprender el código, ejecutarlo y aprender a corregir los errores.

A medida que demostréis autonomía, podréis utilizar otros entornos, como **Thonny o Visual Studio Code**. Para dar ese paso, tendréis que saber crear y guardar un programa, ejecutarlo e interpretar los mensajes de error sin depender continuamente de la ayuda del docente.

Aunque cambie la apariencia del entorno, siempre debemos reconocer tres espacios:

- **Zona de edición:** donde escribimos el código.
- **Controles de ejecución:** con los que iniciamos o detenemos el programa.
- **Zona de salida:** donde aparecen los resultados y los mensajes de error.

::: tip
Antes de comenzar, localiza estos elementos en Mu. Después escribe `print("Hola, mundo")`, ejecuta el programa y comprueba dónde aparece el mensaje.
:::

## 2.2. Crear un proyecto

Un **proyecto** reúne los archivos necesarios para desarrollar una aplicación. En esta unidad utilizaremos una carpeta para organizar nuestros primeros programas. Cada archivo será un ejercicio independiente.

La carpeta irá tomando esta forma a medida que avancemos:

```text
unidad01_python/
├── presentacion.py
├── operaciones.py
└── material_aula.py
```

La extensión **`.py`** identifica los archivos que contienen código Python. Utilizaremos nombres descriptivos, sin espacios ni tildes, para reconocer fácilmente cada ejercicio.

### Crear y ejecutar nuestro primer programa

1. **Crea la carpeta** `unidad01_python` en la ubicación indicada por el docente.
2. **Abre Mu** y comprueba que está seleccionado el modo **Python 3**.
3. **Crea un archivo nuevo** y escribe este código:

```python
print("Mi primer programa en Python")
print("Estoy aprendiendo a programar")
```

4. **Guarda el archivo** dentro de la carpeta con el nombre `presentacion.py`.
5. **Ejecuta el programa** mediante el botón de ejecución de Mu.
6. **Localiza la salida** y comprueba que aparecen los dos mensajes:

```text
Mi primer programa en Python
Estoy aprendiendo a programar
```

La función **`print()`** muestra información en la salida del programa. En este ejemplo, cada llamada muestra un texto en una línea distinta. Las comillas delimitan el texto, pero no aparecen en el resultado.

::: tip
**Aprender a programar también consiste en experimentar.** Parte de un código que comprendas, intenta predecir qué ocurrirá al modificarlo y ejecútalo para comprobarlo.

Si aparece un error, lee el mensaje, identifica qué cambio lo ha provocado e intenta corregirlo. Cambiar una cosa cada vez te ayudará a entender lo que sucede.

**¡No tengáis miedo de romper vuestros programas de práctica!** Conservad una copia de la versión que funciona para poder volver a ella. Investigar un error y resolverlo también es aprender.
:::

## 2.3. Consola interactiva y archivo

Podemos trabajar con Python de dos formas: **probando instrucciones en una consola interactiva** o **escribiendo un programa en un archivo**.

### La consola interactiva

La **consola interactiva** permite introducir instrucciones y ver su resultado sin preparar un archivo. Resulta útil para realizar pruebas pequeñas, como comprobar una operación.

El indicador `>>>` señala que el intérprete está esperando una instrucción. Por ejemplo:

```pycon
>>> 3 + 2
5
>>> print("Hola")
Hola
```

En este ejemplo, escribimos `3 + 2` y el intérprete responde con `5`. Después, escribimos `print("Hola")` y aparece el mensaje.

**El indicador `>>>` lo muestra la consola: no tenemos que escribirlo.**

### Los archivos de programa

Un **archivo con extensión `.py`** permite guardar un conjunto de instrucciones, modificarlas y ejecutarlas de nuevo. Es la forma que utilizaremos para resolver los ejercicios de la unidad.

En un archivo escribiríamos:

```python
print(3 + 2)
print("Hola")
```

Al ejecutarlo, obtendríamos:

```text
5
Hola
```

::: nota
La consola interactiva muestra automáticamente el resultado de expresiones como `3 + 2`. En un archivo, escribir únicamente esa operación no muestra su resultado: utilizamos `print()` para hacerlo visible.
:::

Los ejemplos de esta unidad están preparados para escribirse en **archivos `.py`**, salvo que se indique que son pruebas de consola. No añadas los indicadores `>>>` ni copies las líneas que representan los resultados.

::: aviso
**Guardar y ejecutar son operaciones distintas.** Si el resultado no refleja tus últimos cambios, comprueba que has guardado el código y ejecutado el archivo correcto.
:::

[Referencia: uso del intérprete de Python](https://docs.python.org/es/3/tutorial/interpreter.html).

# 3. Estructura de un programa sencillo

Antes de escribir un programa, conviene responder a tres preguntas: **¿qué datos tenemos?, ¿qué debemos hacer con ellos? y ¿qué resultado queremos mostrar?**

En nuestros primeros programas distinguiremos tres partes lógicas:

| Parte | Qué hacemos | Ejemplo |
| --- | --- | --- |
| **Datos** | Establecemos los valores con los que trabajaremos. | Tenemos cuatro mesas y necesitamos dos sillas por mesa. |
| **Procesamiento** | Realizamos las operaciones necesarias. | Multiplicamos las mesas por las sillas que necesita cada una. |
| **Salida** | Mostramos el resultado. | Indicamos cuántas sillas hacen falta en total. |

Podemos trasladar esta organización al código:

```python
# Datos de la instalación
mesas = 4
sillas_por_mesa = 2

# Cálculo del material
sillas_totales = mesas * sillas_por_mesa

# Presentación del resultado
print("Sillas necesarias:", sillas_totales)
```

La salida será:

```text
Sillas necesarias: 8
```

Las instrucciones de este programa se ejecutan **en orden, de arriba abajo**, es lo que se llama **flujo de control *secuencial***:

1. Asociamos el valor `4` al nombre `mesas` y el valor `2` al nombre `sillas_por_mesa`.
2. Multiplicamos ambos valores mediante el operador `*` y guardamos el resultado en `sillas_totales`.
3. Utilizamos `print()` para mostrar un mensaje acompañado del resultado.

::: tip
Si ahora tenemos seis mesas y necesitamos tres sillas por mesa, ¿qué líneas cambiarías? Predice el resultado antes de ejecutar el programa. No necesitas modificar la operación: utiliza los valores asociados a los nombres.
:::

### Organizar el código para facilitar su lectura

**Datos, procesamiento y salida no son secciones obligatorias de Python**, sino una forma de organizar nuestros primeros programas.

Las líneas que comienzan por `#` son **comentarios**: explican el código y no se ejecutan como instrucciones. Las líneas en blanco separan visualmente las partes del programa.

Python también utiliza la **indentación**, es decir, los espacios al comienzo de una línea, para delimitar bloques de instrucciones. La estudiaremos cuando necesitemos agrupar instrucciones dentro de condiciones o bucles.

::: aviso
En los ejemplos secuenciales de este apartado, las instrucciones comienzan en el margen izquierdo. **No añadas espacios al principio para decorar o centrar el código**, porque pueden provocar un error de indentación.
:::

::: nota
En esta unidad trabajaremos con programas secuenciales: sus instrucciones se ejecutan una detrás de otra. Más adelante aprenderemos a tomar decisiones mediante condiciones y a repetir acciones mediante bucles.
:::

# 4. Variables y tipos de datos

## 4.1. Crear y utilizar variables

Una **variable** es un nombre asociado a un valor. Nos permite utilizar ese valor en distintas partes del programa y cambiarlo cuando sea necesario.

Para crear una variable utilizamos una **asignación**, que se escribe con `=`:

```python
equipos = 6
print(equipos)
```

En este ejemplo, asociamos el nombre `equipos` al valor `6`. Cuando escribimos `print(equipos)`, Python consulta el valor asociado a ese nombre y lo muestra.

::: aviso
**El nombre de una variable se escribe sin comillas.** `print(equipos)` muestra su valor; `print("equipos")` muestra literalmente la palabra `equipos`.
:::

### Cambiar el valor de una variable

Podemos realizar una nueva asignación utilizando el mismo nombre:

```python
equipos = 6
print(equipos)

equipos = 7
print(equipos)
```

La salida será:

```text
6
7
```

La segunda asignación hace que `equipos` pase a estar asociado al valor `9`. **El programa utiliza el valor que tiene la variable en el momento de ejecutar cada instrucción.**

### Actualizar un valor a partir del anterior

También podemos utilizar el valor actual de una variable para calcular el siguiente. Por ejemplo, si llega un equipo nuevo al aula:

```python
equipos = 6
equipos = equipos + 1
print(equipos)
```

El resultado es `7`. Para entender la segunda línea, debemos leer la asignación **de derecha a izquierda**:

1. Python consulta el valor actual de `equipos`: `6`.
2. Calcula la expresión `equipos + 1`: obtiene `7`.
3. Asocia ese resultado al nombre `equipos`.

::: aviso
**`=` indica una asignación, no una igualdad matemática.** La instrucción `equipos = equipos + 1` significa «calcula el valor actual de equipos más uno y actualiza la variable con el resultado».
:::

::: tip
Partimos de seis equipos. Añade dos y retira después uno utilizando dos asignaciones consecutivas. Muestra el valor tras cada cambio y comprueba si coincide con lo que habías previsto.
:::

## 4.2. Elegir nombres

Los nombres de las variables deben ayudar a comprender **qué representa cada valor**. Es más fácil interpretar `numero_equipos = 6` que `x = 6`.

### Cómo escribiremos los nombres

En nuestros ejercicios utilizaremos **letras minúsculas sin tildes, números y guiones bajos**. Si el nombre contiene varias palabras, las separaremos mediante guiones bajos. Esta convención se llama **snake_case**:

```python
numero_equipos = 6
longitud_cable = 12
sillas_por_mesa = 2
```

Además, debemos respetar estas reglas:

- **No comenzar por un número:** `equipo1` es válido, pero `1equipo` no.
- **No incluir espacios ni guiones medios:** utilizaremos `numero_equipos`, no `numero equipos` ni `numero-equipos`.
- **Respetar las mayúsculas y minúsculas:** `equipo` y `Equipo` son nombres diferentes.
- **No utilizar palabras reservadas:** palabras como `if`, `for` o `class` tienen un significado propio en Python y no pueden ser nombres de variables.

::: nota
**Snake_case es una convención de escritura**, no una obligación del lenguaje. Python admite otros nombres, incluso con determinados caracteres Unicode, pero mantendremos este criterio para escribir código uniforme y fácil de leer.
:::

### Evitar nombres que oculten funciones

Tampoco utilizaremos nombres de funciones incorporadas, como `print`, `input` o `str`, para nuestras variables.

Aunque Python permite asignarles un valor, hacerlo puede impedir que utilicemos después la función mediante ese nombre.

::: aviso
**`print` no es una palabra reservada**, pero debemos conservar su significado como función. Para guardar un mensaje, utiliza un nombre como `mensaje`, no `print`.
:::

::: tip
¿Qué nombres elegirías para guardar la cantidad de alumnos, el precio de un teclado y las horas de una clase? Procura que se entiendan sin necesitar un comentario.
:::

## 4.3. Tipos básicos

El **tipo de dato** indica qué clase de valor estamos utilizando y qué operaciones podemos realizar con él. No trabajamos de la misma forma con un número, un texto o una colección de elementos.

Python incorpora los siguientes tipos de datos, agrupados por categorías:

| Categoría | Tipos |
| --- | --- |
| **Texto** | `str` |
| **Numéricos** | `int`, `float`, `complex` |
| **Secuencias** | `list`, `tuple`, `range` |
| **Mapas o correspondencias** | `dict` |
| **Conjuntos** | `set`, `frozenset` |
| **Booleanos** | `bool` |
| **Binarios** | `bytes`, `bytearray`, `memoryview` |
| **Ausencia de valor** | `NoneType` |

En Python no necesitamos declarar el tipo antes de asignar un valor a una variable. Por ejemplo, `cantidad = 12` asocia la variable a un entero, mientras que `nombre = "Aula 1"` la asocia a una cadena de texto.

Podemos consultar el tipo de un valor mediante la función **`type()`**, como en `print(type(cantidad))`.

::: nota
Comenzaremos utilizando principalmente **`int`, `float`, `str` y `bool`**. Los demás tipos se introducirán a medida que los necesitemos.
:::

::: aviso
**`12` y `"12"` no son lo mismo:** el primero es un entero y el segundo es texto. Para escribir números decimales en el código utilizamos el punto, como en `2.5`.
:::

# 5. Literales y constantes

UUn **literal** es un valor escrito directamente en el código, como `8`, `1.5` o `"Teclado"`. En `cantidad = 8`, `cantidad` es el nombre de la variable y `8` es el literal.

Una **constante** representa un dato que decidimos mantener sin cambios durante el programa. En Python utilizamos habitualmente nombres en **mayúsculas**, separando las palabras con guiones bajos:

```python
PUERTOS_POR_SWITCH = 8
switches = 3

puertos_totales = PUERTOS_POR_SWITCH * switches
print("Puertos totales:", puertos_totales)
```

El programa muestra `Puertos totales: 24`. El nombre `PUERTOS_POR_SWITCH` explica qué representa el valor `8` y permite reutilizarlo sin repetir el número.

### ¿Qué es un número mágico?

Un **número mágico**, o *magic number*, es un valor numérico utilizado en el código **sin que quede claro qué representa o por qué se ha elegido**. No es un sinónimo de literal.

Por ejemplo:

```python
puertos_totales = switches * 8
```

El `8` es un literal, pero su significado puede no resultar evidente. Sustituirlo por `PUERTOS_POR_SWITCH` hace que la operación sea más fácil de comprender.

::: nota
**No todos los literales son números mágicos.** Lo importante es que el significado de los valores resulte claro. Utilizar un nombre descriptivo es especialmente útil cuando un dato aparece varias veces o podría cambiar en futuras versiones del programa.
:::

::: aviso
**Escribir un nombre en mayúsculas no impide reasignarlo.** Es una convención para comunicar que ese dato debe mantenerse constante.
:::

# 6. Operadores y expresiones

Una **expresión** combina valores, variables y operadores para obtener un resultado.

## 6.1. Operadores aritméticos

| Operador | Operación | Ejemplo y resultado |
| --- | --- | --- |
| `+` | Suma. | `7 + 2` → `9` |
| `-` | Resta. | `7 - 2` → `5` |
| `*` | Multiplicación. | `7 * 2` → `14` |
| `/` | División. | `7 / 2` → `3.5` |
| `//` | División con redondeo hacia abajo. | `7 // 2` → `3` |
| `%` | Resto. | `7 % 2` → `1` |
| `**` | Potencia. | `2 ** 3` → `8` |

Utilizaremos paréntesis para hacer explícito el orden del cálculo cuando sea necesario. Compara `2 + 3 * 4`, cuyo resultado es `14`, con `(2 + 3) * 4`, cuyo resultado es `20`.

Con texto, `+` concatena cadenas: `"Aula " + "1"` produce `"Aula 1"`. El efecto del operador depende de los tipos utilizados.

## 6.2. Comparaciones

Las comparaciones producen valores booleanos:

| Operador | Significado |
| --- | --- |
| `==` | Igual a. |
| `!=` | Distinto de. |
| `<` y `>` | Menor que y mayor que. |
| `<=` y `>=` | Menor o igual y mayor o igual. |

```python
puertos_disponibles = 8
equipos = 6
hay_capacidad = puertos_disponibles >= equipos
print(hay_capacidad)
```

El resultado es `True`. Hemos calculado una comparación sin introducir todavía una condición `if`.

::: aviso
**`=` asigna; `==` compara.** Son operaciones distintas.
:::

## 6.3. Operadores lógicos

Con valores booleanos, `and` expresa que ambas condiciones deben cumplirse, `or` que se cumpla al menos una y `not` invierte el valor lógico.

```python
conectado = True
configurado = False
print(conectado and configurado)
print(conectado or configurado)
print(not conectado)
```

Se muestran `False`, `True` y `False`. Más adelante utilizaremos estas expresiones para tomar decisiones.

## 6.4. Operadores de asignación

La **asignación** permite asociar un valor a una variable. Además de `=`, Python ofrece operadores que combinan una operación con la actualización de la variable.

En los siguientes ejemplos numéricos, cada fila parte de `cantidad = 8`:

| Operador | Ejemplo | Equivalente en este ejemplo | Valor final |
| --- | --- | --- | --- |
| `=` | `cantidad = 3` | Asigna un nuevo valor. | `3` |
| `+=` | `cantidad += 3` | `cantidad = cantidad + 3` | `11` |
| `-=` | `cantidad -= 3` | `cantidad = cantidad - 3` | `5` |
| `*=` | `cantidad *= 3` | `cantidad = cantidad * 3` | `24` |
| `/=` | `cantidad /= 2` | `cantidad = cantidad / 2` | `4.0` |
| `//=` | `cantidad //= 3` | `cantidad = cantidad // 3` | `2` |
| `%=` | `cantidad %= 3` | `cantidad = cantidad % 3` | `2` |
| `**=` | `cantidad **= 2` | `cantidad = cantidad ** 2` | `64` |

Por ejemplo, podemos actualizar el número de equipos de un aula:

```python
equipos = 6
equipos += 2
print(equipos)

equipos -= 1
print(equipos)
```

El programa muestra primero `8` y después `7`.

::: aviso
Para utilizar `+=` y los demás operadores de asignación aumentada, **la variable debe tener previamente un valor**.
:::

## 6.5. Operadores de bits — ampliación

Los **operadores de bits** trabajan sobre la representación binaria de los números enteros. Actúan sobre sus bits, es decir, sobre sus posiciones de ceros y unos.

Por ejemplo, podemos representar el número `6` como `0110` y el número `3` como `0011`. Utilizamos cuatro posiciones para facilitar la comparación.

| Operador | Operación | Ejemplo | Resultado |
| --- | --- | --- | --- |
| `&` | AND: cada bit vale `1` si ambos bits son `1`. | `6 & 3` | `2` |
| `\|` | OR: cada bit vale `1` si al menos uno es `1`. | `6 \| 3` | `7` |
| `^` | XOR: cada bit vale `1` si los dos bits son diferentes. | `6 ^ 3` | `5` |
| `~` | Complemento: invierte los bits. En enteros de Python, `~x` equivale a `-x - 1`. | `~6` | `-7` |
| `<<` | Desplaza los bits hacia la izquierda. | `6 << 1` | `12` |
| `>>` | Desplaza los bits hacia la derecha. | `6 >> 1` | `3` |

Podemos observar las tres primeras operaciones:

```text
  0110       0110       0110
& 0011     | 0011     ^ 0011
------     ------     ------
  0010       0111       0101
     2          7          5
```

También existen operadores de asignación aumentada para estas operaciones: **`&=`, `|=`, `^=`, `<<=` y `>>=`**. Por ejemplo, `numero <<= 1` actualiza la variable con el resultado de desplazar sus bits una posición a la izquierda.

::: aviso
**`and` y `&` no son intercambiables.** En los ejemplos de esta unidad, utilizamos `and`, `or` y `not` para trabajar con valores booleanos, y los operadores de bits para trabajar con la representación binaria de enteros.
:::

::: nota
Los enteros de Python no están limitados a las cuatro posiciones utilizadas en el dibujo. Por eso, **`~6` no produce `9`**, aunque invertir únicamente los cuatro bits de `0110` daría `1001`.
:::

## 6.6. Orden de las operaciones

Cuando una expresión contiene varios operadores, Python sigue un **orden de prioridad**, también llamado **precedencia**. No realiza necesariamente todas las operaciones de izquierda a derecha.

Esta tabla recoge los operadores estudiados, de **mayor a menor prioridad**:

| Prioridad | Operadores | Operación |
| --- | --- | --- |
| Mayor | `( ... )` | Agrupación mediante paréntesis. |
| ↓ | `**` | Potencia. |
| ↓ | `+x`, `-x`, `~x` | Signo positivo, signo negativo y complemento. |
| ↓ | `*`, `/`, `//`, `%` | Multiplicación, división y resto. |
| ↓ | `+`, `-` | Suma y resta. |
| ↓ | `<<`, `>>` | Desplazamientos de bits. |
| ↓ | `&` | AND de bits. |
| ↓ | `^` | XOR de bits. |
| ↓ | `|` | OR de bits. |
| ↓ | `==`, `!=`, `<`, `>`, `<=`, `>=` | Comparaciones. |
| ↓ | `not` | Negación lógica. |
| ↓ | `and` | Conjunción lógica. |
| Menor | `or` | Disyunción lógica. |

### Los paréntesis cambian la agrupación

```python
print(2 + 3 * 4)
print((2 + 3) * 4)
```

El primer cálculo produce `14`: primero se multiplica y después se suma. El segundo produce `20`: los paréntesis indican que debe realizarse primero la suma.

### Operadores con la misma prioridad

Las operaciones aritméticas de la misma prioridad se agrupan normalmente **de izquierda a derecha**:

```python
print(10 - 3 + 2)
```

Primero se calcula `10 - 3` y después se suma `2`. El resultado es `9`.

La potencia es una excepción: se agrupa **de derecha a izquierda**.

```python
print(2 ** 3 ** 2)
```

Equivale a `2 ** (3 ** 2)`, por lo que el resultado es `512`.

::: nota
La potencia también requiere atención al utilizar signos: `-2 ** 2` equivale a `-(2 ** 2)` y produce `-4`, mientras que `(-2) ** 2` produce `4`. A su derecha admite exponentes negativos: `2 ** -2` equivale a `2 ** (-2)` y produce `0.25`.
:::

### Primero calculamos; después asignamos

En una asignación como esta:

```python
resultado = 2 + 3 * 4
```

Python calcula primero la expresión de la derecha y después asocia el resultado, `14`, al nombre `resultado`. **`=` no forma parte de la tabla de prioridad de estos operadores:** establece la asignación.

::: tip
**Utiliza paréntesis para que la intención del cálculo sea clara**, aunque no siempre sean necesarios. Es preferible una expresión fácil de comprender a otra que obligue a consultar continuamente la tabla de prioridad.
:::

[Consulta de apoyo: introducción a Python](https://docs.python.org/es/3/tutorial/introduction.html).

# 7. Conversiones de tipo

A veces necesitamos **convertir un valor de un tipo a otro** para utilizarlo en una operación. Por ejemplo, el texto `"12"` contiene cifras, pero no podemos sumarle directamente un número.

## 7.1. Conversión explícita

La **conversión explícita** es aquella que indicamos en el código mediante una función de conversión.

| Función | Para qué la utilizaremos | Ejemplo y resultado |
| --- | --- | --- |
| `int()` | Convertir un valor compatible en un entero. | `int("12")` → `12` |
| `float()` | Convertir un valor compatible en un número en coma flotante. | `float("2.5")` → `2.5` |
| `str()` | Obtener la representación de un valor como texto. | `str(3)` → `"3"` |
| `bool()` | Obtener el valor booleano asociado a un dato. | `bool(0)` → `False` |

Podemos utilizar estas conversiones en un programa:

```python
cantidad_texto = "12"
cantidad = int(cantidad_texto)
longitud = float("2.5")
etiqueta = "Equipo " + str(3)

print(cantidad + 1)
print(longitud)
print(etiqueta)
```

La salida será:

```text
13
2.5
Equipo 3
```

En este ejemplo:

- `int()` convierte `"12"` en un entero con el que podemos realizar una suma.
- `float()` convierte `"2.5"` en un número en coma flotante.
- `str()` convierte `3` en texto para concatenarlo con `"Equipo "`.

**La conversión no modifica por sí sola el dato original.** En el ejemplo, `cantidad_texto` sigue conteniendo `"12"`; el entero obtenido se guarda en `cantidad`.

### No todos los valores pueden convertirse

La conversión requiere un valor compatible con el tipo de destino:

| Expresión | Resultado |
| --- | --- |
| `int("12")` | Produce el entero `12`. |
| `int("doce")` | Provoca un error: el texto no representa un entero. |
| `int("3.9")` | Provoca un error: el texto representa un número con decimales. |
| `float("3.9")` | Produce el valor `3.9`. |
| `int(3.9)` | Produce el entero `3`. |
| `int(-3.9)` | Produce el entero `-3`. |

::: aviso
**`int()` no redondea al entero más cercano:** al convertir un número en coma flotante, elimina la parte fraccionaria, acercándose a cero.
:::

### Convertir a booleano

Con `bool()`, el cero, el texto vacío y `None` producen `False`. Un número distinto de cero o un texto no vacío producen `True`.

::: aviso
**`bool("False")` produce `True`.** La función no interpreta el significado de la palabra: comprueba que la cadena contiene texto. Lo mismo ocurre con `bool("0")`.
:::

## 7.2. Conversión implícita en operaciones numéricas

Una **conversión implícita** se realiza automáticamente, sin que escribamos una función de conversión.

Por ejemplo, Python puede combinar un entero y un número en coma flotante:

```python
equipos = 2
reserva = 0.5

resultado = equipos + reserva

print(resultado)
print(type(resultado))
```

La salida será:

```text
2.5
<class 'float'>
```

El resultado es de tipo `float`. La variable `equipos` continúa asociada al entero `2`: **obtener un resultado de otro tipo no cambia automáticamente el tipo de los valores originales**.

Esto no significa que Python convierta cualquier texto en un número:

| Expresión | Resultado |
| --- | --- |
| `"2" + "3"` | `"23"`: concatena dos cadenas. |
| `int("2") + int("3")` | `5`: suma dos enteros. |
| `"2" + 3` | Error: no podemos sumar directamente una cadena y un entero. |

## 7.3. Primera entrada desde teclado

Hasta ahora, los datos estaban escritos en el código. Con **`input()`** podemos solicitar un dato a la persona que ejecuta el programa.

```python
nombre = input("¿Cómo te llamas? ")
print("Hola,", nombre)
```

El programa muestra la pregunta y espera a que escribamos una respuesta y pulsemos **Intro**. Después, guarda el texto en `nombre` y muestra el saludo.

**`input()` siempre devuelve una cadena de texto**, aunque escribamos cifras. Si queremos realizar cálculos, debemos convertir la respuesta:

```python
cantidad_texto = input("Número de equipos: ")
cantidad = int(cantidad_texto)

print("Equipos registrados:", cantidad)
print("Si añadimos uno más:", cantidad + 1)
```

Si introducimos `6`, el programa muestra:

```text
Equipos registrados: 6
Si añadimos uno más: 7
```

También podemos escribir la lectura y la conversión en una sola línea:

```python
cantidad = int(input("Número de equipos: "))
print("Equipos registrados:", cantidad)
```

Python ejecuta primero `input()` y después pasa el texto recibido a `int()`.

::: aviso
En estos ejercicios introduciremos **enteros válidos**, como `6` o `12`. Si escribimos `seis` o `6.5`, la conversión mediante `int()` provocará un error. Más adelante aprenderemos a comprobar las entradas y gestionar estos casos.
:::

::: tip
Solicita el precio de un cable y conviértelo mediante `float()`. Después muestra cuánto cuestan tres cables. Al introducir el precio, utiliza un punto para separar los decimales.
:::

::: nota
Utilizaremos `input()` para que nuestros primeros programas trabajen con datos diferentes sin modificar el código. Profundizaremos en las operaciones de entrada y salida más adelante.
:::

[Referencia: funciones incorporadas de Python](https://docs.python.org/es/3/library/functions.html).

# 8. Comentarios y lectura del código

Los **comentarios** permiten añadir explicaciones al código. Nos ayudan a recordar por qué hemos tomado una decisión y facilitan que otras personas comprendan el programa.

Comienzan por `#` y continúan hasta el final de la línea. Python no ejecuta ese texto como una instrucción.

```python
# Añadimos dos latiguillos de reserva para futuras sustituciones.
latiguillos = 10
reserva = 2
total = latiguillos + reserva

print(total)
```

El programa muestra `12`. El comentario explica **para qué incluimos una reserva**, pero no interviene en el cálculo.

### Dónde podemos escribir comentarios

Podemos escribirlos en una línea independiente o después de una instrucción:

```python
# Datos del aula
equipos = 12
reserva = 2  # Equipos adicionales para sustituir los que fallen.
```

Si necesitamos varias líneas de explicación, comenzamos cada una con `#`:

```python
# Calculamos el material para todos los puestos.
# Incluimos una reserva para cubrir posibles averías.
```

::: nota
**Un `#` dentro de una cadena forma parte del texto.** Por ejemplo, `print("Equipo #1")` muestra `Equipo #1`: no introduce un comentario.
:::

### Escribir comentarios útiles

Un buen comentario explica una **decisión, una finalidad o un detalle que no resulta evidente**. No necesita repetir lo que ya expresa claramente la instrucción.

| Comentario | Qué aporta |
| --- | --- |
| `equipos = 12  # Asignamos 12 a equipos.` | Repite lo que ya indica el código. |
| `equipos = 12  # No contamos el ordenador del docente.` | Aclara qué incluye el dato. |

Los **nombres descriptivos**, las líneas en blanco y una distribución ordenada también ayudan a entender el programa. No es necesario comentar cada línea.

::: aviso
**Actualiza los comentarios cuando cambies el código.** Una explicación que ya no coincide con el programa puede confundir más que la ausencia de comentarios.
:::

### Comentarios para realizar pruebas

Durante una prueba, podemos colocar `#` delante de una instrucción para que no se ejecute. Esto se conoce como **comentar una línea**.

```python
print("Inicio del programa")
# print("Mensaje de prueba")
print("Fin del programa")
```

Solo aparecen los mensajes de inicio y fin. Si retiramos el `#`, la instrucción vuelve a ejecutarse.

::: nota
Las cadenas entre comillas triples **no son comentarios**. Pueden contener texto de varias líneas y, en determinadas posiciones, servir como documentación de funciones, clases o módulos. Las estudiaremos más adelante.
:::

::: tip
Revisa uno de tus programas anteriores. Añade un comentario que explique una decisión y comprueba si puedes mejorar algún nombre de variable para que el código se entienda mejor.
:::

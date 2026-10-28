---
titulo: "Bash 2: variables"
tipo: teoria
---

# Bash 2: variables

Una **variable** es un nombre al que le asignas un valor para poder usarlo más tarde en el script.

## Lo mínimo para empezar

```bash
#!/bin/bash
nombre="Ana"
echo "Hola, $nombre"
```

- Se crea con `nombre=valor`, **sin espacios** alrededor del `=`.
- Se lee poniendo `$` delante: `$nombre`.
- Entre comillas dobles, bash sustituye `$nombre` por su valor. Entre comillas simples, no: `'Hola $nombre'` escribe literalmente `Hola $nombre`.
- Si la variable va pegada a otro texto, usa llaves: `"${nombre}s"`.
- Para guardar lo que escribe una orden, se usa `$(orden)`: `fecha=$(date +%Y)` guarda el año actual.
- Las mayúsculas importan: `$Nombre` y `$nombre` son variables distintas.

## Ejercicios

### 1. Comillas dobles y simples

Lee este script:

```bash
#!/bin/bash
nombre="Ana"
echo "Hola $nombre"
echo 'Hola $nombre'
echo "Hola ${nombre}s"
```

:::pregunta[¿Qué escribe en pantalla?]
```text
Hola Ana
Hola $nombre
Hola Anas
```

Las comillas dobles sustituyen la variable; las simples la dejan como texto. Las llaves de `${nombre}s` delimitan el nombre de la variable, para que bash no busque una variable llamada `nombres`.
:::

### 2. Copiar y cambiar

Lee este script:

```bash
#!/bin/bash
x=5
y=$x
x=7
echo "$x $y"
```

:::pregunta[¿Qué escribe en pantalla?]
```text
7 5
```

`y=$x` copia el valor que `x` tenía en ese momento (5). Cambiar `x` después no modifica `y`.
:::

### 3. Un script roto

Este script debería escribir `Hola, Luis. Tienes 17 años.`, pero tiene tres fallos:

```bash
#!/bin/bash
nombre = "Luis"
edad=17
echo "Hola, nombre. Tienes $Edad años."
```

:::pregunta[Escribe la versión corregida]
```bash
#!/bin/bash
nombre="Luis"
edad=17
echo "Hola, $nombre. Tienes $edad años."
```

Los fallos: los espacios alrededor del `=` (bash cree que `nombre` es una orden), la falta del `$` delante de `nombre` en el `echo` y la `E` mayúscula de `$Edad`, que es otra variable (vacía).
:::

### 4. Rellena los huecos

Completa los huecos `_____` para que el script guarde el usuario y la carpeta actual en variables:

```bash
#!/bin/bash
usuario=_____
carpeta=_____
echo "El usuario $usuario está en $carpeta"
```

:::pregunta[Escribe el script completo]
```bash
#!/bin/bash
usuario=$(whoami)
carpeta=$(pwd)
echo "El usuario $usuario está en $carpeta"
```

`$(orden)` ejecuta la orden y se sustituye por lo que escribe.
:::

### 5. Escríbelo tú: ficha de personaje

Escribe un script que guarde en tres variables el nombre, la clase y el nivel de un personaje de rol, y los escriba así:

```text
Personaje: Aelar
Clase: Mago
Nivel: 7
```

:::pregunta[Una solución posible]
```bash
#!/bin/bash
nombre="Aelar"
clase="Mago"
nivel=7
echo "Personaje: $nombre"
echo "Clase: $clase"
echo "Nivel: $nivel"
```
:::

### 6. Escríbelo tú: intercambio

Escribe un script con `a=1` y `b=2` que intercambie sus valores usando una tercera variable auxiliar y escriba `a=2 b=1`.

:::pregunta[Una solución posible]
```bash
#!/bin/bash
a=1
b=2
aux=$a
a=$b
b=$aux
echo "a=$a b=$b"
```

Se guarda `a` en `aux` antes de pisarla: si hicieras `a=$b` primero, el valor original de `a` se perdería.
:::

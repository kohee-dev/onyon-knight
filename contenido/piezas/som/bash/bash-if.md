---
titulo: "Bash 6: condiciones con if"
tipo: teoria
---

# Bash 6: condiciones con if

Con `if` el script toma decisiones: ejecuta unas órdenes solo si se cumple una condición.

## Lo mínimo para empezar

```bash
#!/bin/bash
read -p "Número: " n
if [ "$n" -gt 10 ]; then
  echo "Mayor que 10"
elif [ "$n" -eq 10 ]; then
  echo "Justo 10"
else
  echo "Menor que 10"
fi
```

- La condición va entre corchetes, **con un espacio** después de `[` y antes de `]`: `[ "$n" -gt 10 ]`.
- Después de la condición va `then`, y todo el `if` se cierra con `fi`.
- `elif` añade otra condición; `else` recoge todo lo demás.
- Para comparar **números**: `-eq` (igual), `-ne` (distinto), `-gt` (mayor), `-ge` (mayor o igual), `-lt` (menor), `-le` (menor o igual).
- Para comparar **texto**: `=` y `!=`. Con `-z "$x"` se comprueba que está vacío.
- Para **ficheros**: `-e` (existe), `-f` (es un fichero), `-d` (es un directorio).
- Se pueden combinar condiciones: `[ ... ] && [ ... ]` (las dos) y `[ ... ] || [ ... ]` (alguna).
- Pon entre comillas las variables de texto dentro de `[ ]` (`[ "$nombre" = "Ana" ]`): si la variable está vacía o tiene espacios, sin comillas la condición falla con un error.
- `>` y `<` dentro de `[ ]` no comparan números: son redirecciones. Se usan `-gt` y `-lt`.

## Ejercicios

### 1. El primer if

Lee este script:

```bash
#!/bin/bash
n=10
if [ $n -gt 5 ]; then
  echo "mayor"
else
  echo "menor o igual"
fi
```

:::pregunta[¿Qué escribe en pantalla?]
```text
mayor
```
:::

### 2. La escalera de elif

Lee este script:

```bash
#!/bin/bash
nota=7
if [ $nota -ge 9 ]; then
  echo "sobresaliente"
elif [ $nota -ge 7 ]; then
  echo "notable"
elif [ $nota -ge 5 ]; then
  echo "aprobado"
else
  echo "suspenso"
fi
```

:::pregunta[¿Qué escribe en pantalla?]
```text
notable
```

Bash recorre las condiciones en orden y ejecuta solo la primera que se cumple. 7 cumple `-ge 7`, y ya no se miran las demás aunque también cumpla `-ge 5`.
:::

### 3. Comparar texto

Lee este script:

```bash
#!/bin/bash
a="Hola"
b="hola"
c=""
if [ "$a" = "$b" ]; then
  echo "iguales"
else
  echo "distintos"
fi
if [ -z "$c" ]; then
  echo "vacía"
fi
```

:::pregunta[¿Qué escribe en pantalla?]
```text
distintos
vacía
```

Las mayúsculas importan al comparar texto. `-z` es cierto cuando el texto tiene longitud cero.
:::

### 4. Un script roto

Este script debería escribir `Grande` si el número es mayor que 10 y `Pequeño` si no, pero tiene tres fallos:

```bash
#!/bin/bash
read -p "Número: " n
if [$n > 10]
  echo "Grande"
else
  echo "Pequeño"
fi
```

:::pregunta[Escribe la versión corregida]
```bash
#!/bin/bash
read -p "Número: " n
if [ "$n" -gt 10 ]; then
  echo "Grande"
else
  echo "Pequeño"
fi
```

Los fallos: faltan los espacios dentro de los corchetes, `>` es una redirección y no una comparación (se usa `-gt`) y falta el `then`.
:::

### 5. Otro script roto

Este script debería saludar según el nombre, pero tiene dos fallos (uno de ellos se nota sobre todo cuando se escribe «Ana Pérez» o nada):

```bash
#!/bin/bash
read -p "Nombre: " nombre
if [ $nombre = "Ana" ]; then
  echo "Hola, jefa"
else if [ $nombre = "Luis" ]; then
  echo "Hola, Luis"
else
  echo "Hola, desconocido"
fi
```

:::pregunta[Escribe la versión corregida]
```bash
#!/bin/bash
read -p "Nombre: " nombre
if [ "$nombre" = "Ana" ]; then
  echo "Hola, jefa"
elif [ "$nombre" = "Luis" ]; then
  echo "Hola, Luis"
else
  echo "Hola, desconocido"
fi
```

Los fallos: `$nombre` sin comillas (con «Ana Pérez» bash ve tres palabras y da error `too many arguments`) y `else if`, que obligaría a un segundo `fi`; lo correcto es `elif`.
:::

### 6. Rellena los huecos: ¿qué es esta ruta?

Completa los huecos `_____` para que el script diga si la ruta es un directorio, un fichero u otra cosa:

```bash
#!/bin/bash
read -p "Ruta: " ruta
if [ _____ "$ruta" ]; then
  echo "Es un directorio"
_____ [ -f "$ruta" ]; then
  echo "Es un fichero"
else
  echo "No existe o es otra cosa"
_____
```

:::pregunta[Escribe el script completo]
```bash
#!/bin/bash
read -p "Ruta: " ruta
if [ -d "$ruta" ]; then
  echo "Es un directorio"
elif [ -f "$ruta" ]; then
  echo "Es un fichero"
else
  echo "No existe o es otra cosa"
fi
```
:::

### 7. Rellena los huecos: dos condiciones

Completa el hueco `_____` para que el acceso solo se conceda si el usuario es `admin` **y** la clave es `abracadabra`:

```bash
#!/bin/bash
read -p "Usuario: " usuario
read -p "Clave: " clave
if [ "$usuario" = "admin" ] _____ [ "$clave" = "abracadabra" ]; then
  echo "Acceso concedido"
else
  echo "Acceso denegado"
fi
```

:::pregunta[Escribe el script completo]
```bash
#!/bin/bash
read -p "Usuario: " usuario
read -p "Clave: " clave
if [ "$usuario" = "admin" ] && [ "$clave" = "abracadabra" ]; then
  echo "Acceso concedido"
else
  echo "Acceso denegado"
fi
```

`&&` exige que se cumplan las dos condiciones; con `||` bastaría con una.
:::

### 8. Escríbelo tú: par o impar

Escribe un script que pida un número y escriba si es par o impar.

:::pregunta[Una solución posible]
```bash
#!/bin/bash
read -p "Número: " n
if [ $((n % 2)) -eq 0 ]; then
  echo "$n es par"
else
  echo "$n es impar"
fi
```

Un número es par si el resto de dividirlo entre 2 es 0.
:::

### 9. Escríbelo tú: el mayor de tres

Escribe un script que pida tres números y escriba el mayor.

:::pregunta[Una solución posible]
```bash
#!/bin/bash
read -p "Primero: " a
read -p "Segundo: " b
read -p "Tercero: " c
if [ "$a" -ge "$b" ] && [ "$a" -ge "$c" ]; then
  echo "El mayor es $a"
elif [ "$b" -ge "$c" ]; then
  echo "El mayor es $b"
else
  echo "El mayor es $c"
fi
```

Si `a` no es el mayor, solo quedan `b` y `c`: basta compararlos entre sí.
:::

### 10. Escríbelo tú: año bisiesto

Escribe un script que pida un año y diga si es bisiesto. Un año es bisiesto si es divisible entre 4, salvo los divisibles entre 100 que no lo son entre 400.

:::pregunta[Una solución posible]
```bash
#!/bin/bash
read -p "Año: " anio
if [ $((anio % 400)) -eq 0 ]; then
  echo "$anio es bisiesto"
elif [ $((anio % 100)) -eq 0 ]; then
  echo "$anio no es bisiesto"
elif [ $((anio % 4)) -eq 0 ]; then
  echo "$anio es bisiesto"
else
  echo "$anio no es bisiesto"
fi
```

Se comprueban primero las excepciones más específicas (400 y 100) y después la regla general (4). Por ejemplo, 2000 es bisiesto, 1900 no y 2024 sí.
:::

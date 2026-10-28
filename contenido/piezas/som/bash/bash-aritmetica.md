---
titulo: "Bash 5: operaciones aritméticas"
tipo: teoria
---

# Bash 5: operaciones aritméticas

En bash las variables son texto: `a=2` y `b=3` no se suman con `a+b`. Para hacer cálculos con números enteros se usa la **expansión aritmética** `$(( ))`.

## Lo mínimo para empezar

```bash
a=7
b=2
echo $((a + b))      # 9
suma=$((a + b))      # se puede guardar en una variable
```

| Operador | Significado |
|---|---|
| `+` `-` `*` | suma, resta, multiplicación |
| `/` | división **entera** (7 / 2 es 3) |
| `%` | resto de la división (7 % 2 es 1) |
| `**` | potencia |

- Dentro de `$(( ))` no hace falta poner `$` delante de las variables.
- Solo trabaja con enteros: `7 / 2` da `3`, sin decimales.
- Una variable no hace cuentas por sí sola: `y=$x+1` guarda el texto `5+1`, no 6. Hay que escribir `y=$((x + 1))`.

## Ejercicios

### 1. Las cinco operaciones

Lee este script:

```bash
#!/bin/bash
a=7
b=2
echo $((a + b)) $((a - b)) $((a * b)) $((a / b)) $((a % b))
```

:::pregunta[¿Qué escribe en pantalla?]
```text
9 5 14 3 1
```

La división es entera: 7 entre 2 da 3 y sobra 1, que es lo que devuelve `%`.
:::

### 2. Sumar texto

Lee este script:

```bash
#!/bin/bash
x=5
x=$((x + 1))
y=$x+1
echo "$x $y"
```

:::pregunta[¿Qué escribe en pantalla?]
```text
6 6+1
```

`x=$((x + 1))` sí calcula (5 + 1 = 6). `y=$x+1` solo une el texto `6` con `+1`.
:::

### 3. Un script roto

Este script debería leer una base y una altura y escribir el área de un triángulo y el resto de dividir la base entre 2. Con base 7 y altura 4 tendría que escribir `Área: 14` y `Resto: 1`, pero tiene tres fallos:

```bash
#!/bin/bash
read -p "Base: " base
read -p "Altura: " altura
area = $((base * altura / 2))
echo "Área: area"
echo "Resto: $base % 2"
```

:::pregunta[Escribe la versión corregida]
```bash
#!/bin/bash
read -p "Base: " base
read -p "Altura: " altura
area=$((base * altura / 2))
echo "Área: $area"
echo "Resto: $((base % 2))"
```

Los fallos: espacios alrededor del `=`, falta el `$` en `$area` y el cálculo del resto debe ir dentro de `$(( ))`; dentro de las comillas, `% 2` es solo texto.
:::

### 4. Rellena los huecos

Completa el hueco `_____` para que el script pase grados Celsius a Fahrenheit con la fórmula `C * 9 / 5 + 32`. Con 100 debe escribir `212`.

```bash
#!/bin/bash
read -p "Grados Celsius: " c
f=$((_____))
echo "$c ºC son $f ºF"
```

:::pregunta[Escribe el script completo]
```bash
#!/bin/bash
read -p "Grados Celsius: " c
f=$((c * 9 / 5 + 32))
echo "$c ºC son $f ºF"
```

Con 100 escribe `100 ºC son 212 ºF`. Como la división es entera, con 37 escribe 98 (el valor exacto es 98,6).
:::

### 5. Escríbelo tú: la calculadora

Escribe un script que pida dos números y escriba su suma, resta, producto, cociente (entero) y resto.

:::pregunta[Una solución posible]
```bash
#!/bin/bash
read -p "Primer número: " a
read -p "Segundo número: " b
echo "Suma: $((a + b))"
echo "Resta: $((a - b))"
echo "Producto: $((a * b))"
echo "Cociente: $((a / b))"
echo "Resto: $((a % b))"
```

Si el segundo número es 0, bash da un error de división por cero. Más adelante verás cómo evitarlo con un `if`.
:::

### 6. Escríbelo tú: horas, minutos y segundos

Escribe un script que pida un número de segundos y lo escriba como horas, minutos y segundos. Con 3725 debe escribir `1h 2m 5s`.

:::pregunta[Una solución posible]
```bash
#!/bin/bash
read -p "Segundos: " total
h=$((total / 3600))
m=$((total % 3600 / 60))
s=$((total % 60))
echo "${h}h ${m}m ${s}s"
```

Las horas son la división entera entre 3600. Lo que sobra (`total % 3600`) se divide entre 60 para los minutos, y `total % 60` son los segundos que quedan.
:::

---
titulo: "Primeros pasos 3: operadores"
tipo: teoria
---

# Primeros pasos 3: operadores

Con los operadores el programa calcula y compara. Sumar y multiplicar ya lo sabes; lo importante de esta pieza son los que no existen en una calculadora (`//`, `%`, `**`), el orden en que Python resuelve una expresión y las comparaciones que dan verdadero o falso.

## Lo mínimo para empezar

| Operador | Qué hace | Ejemplo |
|---|---|---|
| `+` `-` `*` | sumar, restar y multiplicar | `7 * 2` → `14` |
| `/` | división (siempre da un `float`) | `7 / 2` → `3.5` |
| `//` | división entera: se queda con la parte entera | `7 // 2` → `3` |
| `%` | resto de la división | `7 % 2` → `1` |
| `**` | potencia | `2 ** 3` → `8` |
| `==` `!=` | igual y distinto | `5 == 5` → `True` |
| `<` `>` `<=` `>=` | menor, mayor, menor o igual y mayor o igual | `3 >= 3` → `True` |
| `and` `or` `not` | y, o, no | `True and False` → `False` |
| `+=` `-=` `*=` `/=` `//=` `%=` `**=` | operar y guardar en la misma variable | `n += 1` es `n = n + 1` |
| `round(x, n)` | redondea `x` a `n` decimales | `round(3.14159, 2)` → `3.14` |

Orden en que se resuelve una expresión, de lo que se hace primero a lo último:

1. Paréntesis.
2. `**`
3. `*` `/` `//` `%`
4. `+` `-`
5. Comparaciones (`==`, `<`, ...)
6. `not`, después `and` y por último `or`

Qué debes saber:

- **`=` asigna y `==` compara.** No los confundas.
- Con la misma prioridad se resuelve **de izquierda a derecha**: `10 - 2 - 3` es `5`. La excepción es `**`, que va de derecha a izquierda.
- `//` y `%` van en pareja: `n // d` es el cociente y `n % d` el resto, y se cumple siempre `n == (n // d) * d + n % d`. Sirven para trocear cantidades: horas y minutos, euros y céntimos, filas y columnas.
- `n % 2 == 0` pregunta si `n` es par. `n % 10` es la última cifra de `n`.
- Dividir entre 0 es un error: `ZeroDivisionError`.
- Una comparación da un `bool` y se puede guardar en una variable.
- Se puede encadenar: `1 < x < 10` equivale a `1 < x and x < 10`.
- Los paréntesis son gratis. Si dudas del orden, ponlos: hacen el código más fácil de leer.

## Ejercicios

### 1. Aritmética básica

Lee este programa:

```python
print(7 + 2, 7 - 2, 7 * 2)
```

:::pregunta[¿Qué escribe?]
```text
9 5 14
```
:::

### 2. Tres divisiones

Lee este programa:

```python
print(7 / 2)
print(7 // 2)
print(7 % 2)
```

:::pregunta[¿Qué escribe cada línea?]
```text
3.5
3
1
```

`/` da el resultado exacto, `//` la parte entera del cociente (3) y `%` lo que sobra (1): 7 son tres veces 2 y sobra 1.
:::

### 3. Con números negativos

Lee este programa:

```python
print(-7 // 2)
print(-7 % 2)
```

:::pregunta[¿Qué escribe? ¿Por qué no sale `-3`?]
```text
-4
1
```

`//` redondea siempre **hacia abajo** (hacia el menos infinito): -3.5 baja a -4. Y el resto se ajusta para que la cuenta siga saliendo: `-4 * 2 + 1` es `-7`.
:::

### 4. Potencias

Lee este programa:

```python
print(2 ** 3)
print(2 ** 10)
print(9 ** 0.5)
```

:::pregunta[¿Qué escribe?]
```text
8
1024
3.0
```

`9 ** 0.5` es elevar a un medio, que es la raíz cuadrada: da `3.0`, un `float`. Útil para calcular raíces sin importar nada.
:::

### 5. El orden de las operaciones

Lee este programa:

```python
print(2 + 3 * 4)
print((2 + 3) * 4)
print(10 - 2 - 3)
print(2 ** 3 ** 2)
```

:::pregunta[¿Qué escribe cada línea?]
```text
14
20
5
512
```

El `*` va antes que el `+`. Los paréntesis cambian el orden. La resta se hace de izquierda a derecha: `(10 - 2) - 3`. Y la potencia, de derecha a izquierda: `2 ** (3 ** 2)`, que es `2 ** 9`.
:::

### 6. El resto

Lee este programa:

```python
print(17 % 5)
print(15 % 5)
print(3 % 5)
```

:::pregunta[¿Qué escribe? ¿Qué significa un resto 0?]
```text
2
0
3
```

Un resto de 0 significa que la división es exacta, es decir, que 15 es **múltiplo** de 5. Y cuando el número es menor que el divisor, como en `3 % 5`, el resto es el propio número.
:::

### 7. Horas y minutos

Lee este programa:

```python
minutos = 135
print(minutos // 60, minutos % 60)
```

:::pregunta[¿Qué escribe? ¿Qué representa cada número?]
```text
2 15
```

135 minutos son 2 horas (`//`) y 15 minutos que sobran (`%`). Es el uso típico de la pareja `//` y `%`.
:::

### 8. Comparaciones

Lee este programa:

```python
print(5 > 3, 5 == 5.0, 5 != 5, "a" == "A")
```

:::pregunta[¿Qué escribe?]
```text
True True False False
```

`5 == 5.0` es cierto: se comparan los valores, no los tipos. Y `"a" == "A"` es falso, porque las mayúsculas cuentan.
:::

### 9. Y, o, no

Lee este programa:

```python
print(True and False)
print(True or False)
print(not True)
```

:::pregunta[¿Qué escribe?]
```text
False
True
False
```

`and` pide que se cumplan las dos, `or` que se cumpla al menos una y `not` da la contraria.
:::

### 10. El orden de `and` y `or`

Lee este programa:

```python
print(True or False and False)
print((True or False) and False)
```

:::pregunta[¿Qué escribe? ¿Por qué cambia?]
```text
True
False
```

`and` se resuelve antes que `or`. En la primera línea queda `True or (False and False)`, que es `True or False`. En la segunda, los paréntesis obligan a resolver el `or` primero y el resultado es `True and False`.
:::

### 11. Operar y guardar

Lee este programa:

```python
n = 10
n += 5
n -= 3
n *= 2
n //= 5
n **= 2
print(n)
```

:::pregunta[¿Qué escribe? ¿Cuánto vale `n` en cada paso?]
```text
16
```

`n` vale 10, luego 15, 12, 24, 4 y, al final, 16. Cada línea equivale a `n = n operación valor`.
:::

### 12. Sumar o pegar

Lee este programa:

```python
print("3" + "4")
print(3 + 4)
print("ab" * 2)
print("3" * 3)
```

:::pregunta[¿Qué escribe?]
```text
34
7
abab
333
```

El mismo operador se comporta distinto con números que con textos: con textos, `+` pega y `*` repite.
:::

### 13. Decimales y redondeo

Lee este programa:

```python
print(10 / 3)
print(round(10 / 3, 2))
```

:::pregunta[¿Qué escribe? ¿Cuándo conviene `round`?]
```text
3.3333333333333335
3.33
```

`round(x, 2)` deja dos decimales. Conviene al **mostrar** un resultado; para comparar valores decimales no es buena idea, porque los errores de aproximación siguen ahí.
:::

### 14. Dividir entre cero

Lee este programa:

```python
print(5 / 0)
```

:::pregunta[¿Qué ocurre?]
El programa se para con un `ZeroDivisionError`. Dividir entre 0 no tiene resultado, y lo mismo ocurre con `5 // 0` y con `5 % 0`.
:::

### 15. Comparaciones encadenadas

Lee este programa:

```python
print(1 < 2 < 3)
print(1 < 2 > 3)
```

:::pregunta[¿Qué escribe?]
```text
True
False
```

`1 < 2 < 3` es `1 < 2 and 2 < 3`. En la segunda línea, `1 < 2` es cierto pero `2 > 3` no lo es.
:::

## Hazlo tú

Escribe cada programa en su propio fichero `.py`. Los datos van en variables al principio, no escritos dentro de los cálculos.

### 16. El IVA

Escribe `iva.py`. Un producto cuesta 100 euros y el IVA es el 21 %. Calcula el IVA (precio por 21 entre 100) y el total, y muestra `IVA: 21.0` y `Total: 121.0`, cada uno en su línea.

:::pregunta[Solución]
```python
precio = 100
porcentaje_iva = 21

iva = precio * porcentaje_iva / 100
total = precio + iva

print("IVA:", iva)
print("Total:", total)
```
:::

### 17. Segundos a horas

Escribe `reloj.py`. Dados 7384 segundos, calcula cuántas horas, minutos y segundos son. Debe salir `2 h 3 min 4 s`.

:::pregunta[Solución]
```python
segundos_totales = 7384

horas = segundos_totales // 3600
resto = segundos_totales % 3600
minutos = resto // 60
segundos = resto % 60

print(horas, "h", minutos, "min", segundos, "s")
```

Primero se sacan las horas completas, y con lo que sobra se repite el proceso con los minutos. Una hora tiene 3600 segundos y un minuto, 60.
:::

### 18. El reparto

Escribe `reparto.py`. Hay 47 cables para repartir entre 5 aulas, a partes iguales. Muestra `Cada aula: 9` y `Sobran: 2`.

:::pregunta[Solución]
```python
cables = 47
aulas = 5

por_aula = cables // aulas
sobran = cables % aulas

print("Cada aula:", por_aula)
print("Sobran:", sobran)
```
:::

### 19. ¿Es par?

Escribe `par.py`. Dado `numero = 14`, guarda en una variable si es par y muestra `¿Es par? True`. Con `numero = 15` debe salir `¿Es par? False`.

:::pregunta[Solución]
```python
numero = 14

es_par = numero % 2 == 0

print("¿Es par?", es_par)
```

Primero se calcula `numero % 2`, después se compara con 0 y al final se guarda el resultado en `es_par`. La comparación da directamente un `bool`: no hace falta ningún `if`.
:::

### 20. El precio final

Escribe `precio-final.py`. Un artículo cuesta 200 euros. Aplica un 10 % de descuento y, después, un 21 % de IVA sobre el precio ya rebajado. Muestra `Precio final: 217.8`. Para evitar errores de aproximación, calcula con `precio * (100 - descuento) / 100` y la misma forma para el IVA.

:::pregunta[Solución]
```python
precio = 200
descuento = 10
iva = 21

precio_rebajado = precio * (100 - descuento) / 100
precio_final = precio_rebajado * (100 + iva) / 100

print("Precio final:", precio_final)
```

El descuento y el IVA no se suman (un 11 %): se aplican uno detrás de otro, cada uno sobre el resultado del anterior. Por eso hay dos pasos.
:::

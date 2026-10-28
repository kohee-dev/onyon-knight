---
titulo: "Bash 11: funciones y arrays"
tipo: teoria
---

# Bash 11: funciones y arrays

Una **función** agrupa unas órdenes bajo un nombre para poder repetirlas sin copiarlas. Un **array** guarda varios valores en una sola variable.

## Lo mínimo para empezar

```bash
#!/bin/bash
saludar() {
  echo "Hola, $1"
}
saludar Ana
saludar Luis

frutas=(manzana pera uva)
echo "${frutas[1]}"        # pera
echo "${#frutas[@]}"       # 3
```

**Funciones**

- Se definen con `nombre() { … }` y se llaman escribiendo su nombre, como una orden más. La definición tiene que ir **antes** de la llamada.
- Dentro de la función, `$1`, `$2`… son los argumentos de **la función**, no los del script.
- Una variable creada dentro de una función es global, salvo que se declare con `local`.
- `return N` solo devuelve un código de salida (de 0 a 255), como `exit`. Para devolver un valor, la función lo escribe con `echo` y quien la llama lo captura: `resultado=$(doble 5)`.

**Arrays**

- Se crean con paréntesis y **sin comas**: `frutas=(manzana pera uva)`. Los elementos se numeran desde 0.
- `${frutas[1]}` es un elemento, `${frutas[@]}` son todos y `${#frutas[@]}` es cuántos hay. Las llaves son obligatorias.
- `frutas+=(kiwi)` añade un elemento al final.
- Para recorrerlo: `for f in "${frutas[@]}"; do … done`.

## Ejercicios

### 1. Los argumentos de una función

El script `saludos.sh` se lanza con `bash saludos.sh Luis`:

```bash
#!/bin/bash
saludar() {
  echo "Hola, $1"
}
saludar Ana
saludar "$1"
```

:::pregunta[¿Qué escribe en pantalla?]
```text
Hola, Ana
Hola, Luis
```

El `$1` de dentro de la función es el argumento con el que se llama a la función. La segunda llamada le pasa el primer argumento del script, `Luis`.
:::

### 2. Variables locales y globales

Lee este script:

```bash
#!/bin/bash
x=1
cambiar() {
  x=2
  local y=3
}
cambiar
echo "[$x] [$y]"
```

:::pregunta[¿Qué escribe en pantalla?]
```text
[2] []
```

`x` no es local, así que la función la modifica para todo el script. `y` es local y deja de existir al terminar la función.
:::

### 3. Un array

Lee este script:

```bash
#!/bin/bash
frutas=(manzana pera uva)
echo "${frutas[1]}"
echo "${#frutas[@]}"
frutas+=(kiwi)
echo "${frutas[@]}"
```

:::pregunta[¿Qué escribe en pantalla?]
```text
pera
3
manzana pera uva kiwi
```

Los elementos se numeran desde 0, por lo que el índice 1 es `pera`.
:::

### 4. Una función rota

Este script debería escribir `El doble es 10`, pero tiene dos fallos:

```bash
#!/bin/bash
doble() {
  local resultado=$(($1 * 2))
}
doble 5
echo "El doble es $resultado"
```

:::pregunta[Escribe la versión corregida]
```bash
#!/bin/bash
doble() {
  echo $(($1 * 2))
}
resultado=$(doble 5)
echo "El doble es $resultado"
```

Los fallos: `resultado` es local y desaparece al salir de la función, y aunque no lo fuera, la función no devuelve nada. Lo habitual es que la función escriba el valor con `echo` y quien la llama lo capture con `$(...)`.
:::

### 5. Un array roto

Este script debería escribir cada fruta en una línea, pero tiene tres fallos:

```bash
#!/bin/bash
frutas=(manzana, pera, uva)
echo "Hay $#frutas frutas"
for f in $frutas; do
  echo "$f"
done
```

:::pregunta[Escribe la versión corregida]
```bash
#!/bin/bash
frutas=(manzana pera uva)
echo "Hay ${#frutas[@]} frutas"
for f in "${frutas[@]}"; do
  echo "$f"
done
```

Los fallos: los elementos del array se separan con espacios, no con comas (con comas, los elementos serían `manzana,`, `pera,` y `uva`), el número de elementos es `${#frutas[@]}` y para recorrerlos todos hay que escribir `"${frutas[@]}"`; con `$frutas` solo se obtiene el primero.
:::

### 6. Rellena los huecos: par o impar

Completa los huecos `_____` para que la función diga si el número que recibe es par o impar:

```bash
#!/bin/bash
es_par() {
  if [ $(( _____ % 2 )) -eq 0 ]; then
    echo "par"
  _____
    echo "impar"
  fi
}
es_par 7
es_par 10
```

:::pregunta[Escribe el script completo]
```bash
#!/bin/bash
es_par() {
  if [ $(( $1 % 2 )) -eq 0 ]; then
    echo "par"
  else
    echo "impar"
  fi
}
es_par 7
es_par 10
```

Escribe `impar` y después `par`.
:::

### 7. Escríbelo tú: el máximo

Escribe una función `maximo` que reciba dos números y escriba el mayor, y úsala para guardar en una variable el mayor de 8 y 13 y escribirlo. Debe escribir `El mayor es 13`.

:::pregunta[Una solución posible]
```bash
#!/bin/bash
maximo() {
  if [ "$1" -ge "$2" ]; then
    echo "$1"
  else
    echo "$2"
  fi
}
mayor=$(maximo 8 13)
echo "El mayor es $mayor"
```
:::

### 8. Escríbelo tú: la lista numerada

Escribe un script que guarde todos sus argumentos en un array y los escriba numerados desde 1. Con `bash lista.sh Ana Luis Marta` debe escribir:

```text
1. Ana
2. Luis
3. Marta
```

:::pregunta[Una solución posible]
```bash
#!/bin/bash
nombres=("$@")
numero=1
for nombre in "${nombres[@]}"; do
  echo "$numero. $nombre"
  numero=$((numero + 1))
done
```

`("$@")` copia los argumentos en un array. Se usa un contador aparte porque los índices del array empiezan en 0.
:::

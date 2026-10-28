---
titulo: "Bash 7: case y códigos de salida"
tipo: teoria
---

# Bash 7: case y códigos de salida

Cuando hay muchas opciones, una cadena de `elif` se vuelve larga. `case` compara un valor con varios patrones. Y todo programa termina con un **código de salida** que dice si salió bien o mal.

## Lo mínimo para empezar

```bash
#!/bin/bash
case $1 in
  inicio)
    echo "Arrancando"
    ;;
  parada|stop)
    echo "Parando"
    ;;
  *)
    echo "Orden desconocida"
    exit 1
    ;;
esac
```

- Cada rama es `patrón)` seguido de sus órdenes y terminada con `;;`.
- `a|b)` significa «a o b». `*)` recoge todo lo demás y va la última.
- El `case` se cierra con `esac` (`case` al revés).
- El **código de salida** es un número: `0` significa que todo ha ido bien y cualquier otro número, que ha fallado. La variable `$?` guarda el del último comando ejecutado.
- `exit N` termina el script con el código `N`. Si el script termina sin `exit`, el código es el de su última orden.
- Es costumbre que un script que recibe mal sus argumentos escriba cómo se usa y termine con `exit 1`.

## Ejercicios

### 1. Un case

Lee este script:

```bash
#!/bin/bash
opcion="b"
case $opcion in
  a)
    echo "A"
    ;;
  b|c)
    echo "B o C"
    ;;
  *)
    echo "otra"
    ;;
esac
```

:::pregunta[¿Qué escribe en pantalla?]
```text
B o C
```
:::

### 2. Códigos de salida

Lee estas órdenes, ejecutadas en la terminal en este orden:

```bash
[ -d /tmp ]
echo $?
[ -d /noexiste ]
echo $?
```

Y este script, `salida.sh`, que se ejecuta después con `bash salida.sh`:

```bash
#!/bin/bash
echo "Fin"
exit 3
```

```bash
echo $?
```

:::pregunta[¿Qué escriben los tres `echo`?]
```text
0
1
Fin
3
```

La condición cierta termina con `0` y la falsa con `1`. `echo $?` muestra siempre el código de la orden anterior, en este caso el de `salida.sh`, que es el `3` de su `exit`.
:::

### 3. Un script roto

Este script debería arrancar o parar según la orden, pero tiene tres fallos:

```bash
#!/bin/bash
read -p "Orden (inicio/parada): " orden
case $orden en
  inicio)
    echo "Arrancando"
  parada)
    echo "Parando"
  *)
    echo "Orden desconocida"
ESAC
```

:::pregunta[Escribe la versión corregida]
```bash
#!/bin/bash
read -p "Orden (inicio/parada): " orden
case $orden in
  inicio)
    echo "Arrancando"
    ;;
  parada)
    echo "Parando"
    ;;
  *)
    echo "Orden desconocida"
    ;;
esac
```

Los fallos: es `in` y no `en`, cada rama termina con `;;` y el cierre es `esac` en minúsculas (bash distingue mayúsculas).
:::

### 4. Rellena el hueco

Completa el hueco `_____` para que el script termine con error si no recibe exactamente un argumento:

```bash
#!/bin/bash
if [ $# -ne 1 ]; then
  echo "Uso: $0 nombre"
  _____ 1
fi
echo "Hola, $1"
```

:::pregunta[Escribe el script completo]
```bash
#!/bin/bash
if [ $# -ne 1 ]; then
  echo "Uso: $0 nombre"
  exit 1
fi
echo "Hola, $1"
```

Con `bash saludo.sh` sin argumentos escribe `Uso: saludo.sh nombre`, y `echo $?` después muestra `1`. Sin el `exit`, el script seguiría y escribiría `Hola, `.
:::

### 5. Escríbelo tú: el mes

Escribe un script que reciba un número de mes (del 1 al 12) como argumento y escriba su nombre usando `case`. Si el número no es válido, debe escribir un error y terminar con código 1.

:::pregunta[Una solución posible]
```bash
#!/bin/bash
case $1 in
  1) echo "enero" ;;
  2) echo "febrero" ;;
  3) echo "marzo" ;;
  4) echo "abril" ;;
  5) echo "mayo" ;;
  6) echo "junio" ;;
  7) echo "julio" ;;
  8) echo "agosto" ;;
  9) echo "septiembre" ;;
  10) echo "octubre" ;;
  11) echo "noviembre" ;;
  12) echo "diciembre" ;;
  *)
    echo "Mes no válido: $1"
    exit 1
    ;;
esac
```

Cuando una rama tiene una sola orden se puede escribir en una línea con `;;` al final.
:::

### 6. Escríbelo tú: comprobar una carpeta

Escribe un script que reciba una carpeta como argumento y:

- Si no recibe argumento, escribe cómo se usa y termina con código 1.
- Si la carpeta no existe, escribe un error y termina con código 2.
- Si existe, muestra su contenido con `ls`.

:::pregunta[Una solución posible]
```bash
#!/bin/bash
if [ $# -ne 1 ]; then
  echo "Uso: $0 carpeta"
  exit 1
fi
if [ ! -d "$1" ]; then
  echo "La carpeta $1 no existe"
  exit 2
fi
ls "$1"
```

`!` delante de una condición la niega. Códigos distintos para errores distintos permiten saber desde fuera (con `$?`) qué ha fallado.
:::

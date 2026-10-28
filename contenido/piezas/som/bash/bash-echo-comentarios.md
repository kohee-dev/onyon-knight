---
titulo: "Bash 1: echo, comentarios y órdenes sencillas"
tipo: teoria
---

# Bash 1: echo, comentarios y órdenes sencillas

Un **script** es un fichero de texto con órdenes, una por línea, que la shell ejecuta de arriba abajo. Es lo mismo que escribirías en la terminal, pero guardado para poder repetirlo.

## Lo mínimo para empezar

Crea un fichero `hola.sh` con este contenido:

```bash
#!/bin/bash
echo "Hola, mundo"
```

- La primera línea, `#!/bin/bash`, indica qué programa ejecuta el script. Va siempre en la primera línea; por costumbre se escribe pegado, sin espacios.
- `echo` escribe en pantalla el texto que le pases.
- Una línea que empieza por `#` es un **comentario**: bash la ignora. Sirve para explicar el script a quien lo lea. Un `#` también comenta el resto de una línea.
- Cualquier orden que uses en la terminal (`date`, `pwd`, `whoami`, `ls`…) funciona igual dentro de un script.

Hay dos formas de ejecutarlo:

```bash
bash hola.sh
```

Se lo pasas como argumento al programa `bash`. No necesita permiso de ejecución ni que la primera línea sea `#!/bin/bash`, porque ya has elegido tú el intérprete.

```bash
chmod +x hola.sh
./hola.sh
```

Se le da permiso de ejecución una sola vez y después se lanza con su ruta. Aquí sí hace falta el `#!/bin/bash`, que es lo que dice qué intérprete lo ejecuta.

Las comillas dobles conservan los espacios del texto. Sin comillas, bash separa las palabras y `echo` las escribe con un solo espacio entre ellas.

## Ejercicios

En cada ejercicio, intenta resolverlo antes de abrir la solución. Los primeros te piden leer un script y decir qué hace; los últimos, escribirlo tú.

### 1. Los espacios

Lee este script:

```bash
#!/bin/bash
echo Hola
echo "Soy   un   script"
echo Soy   un   script
```

:::pregunta[¿Qué escribe en pantalla?]
```text
Hola
Soy   un   script
Soy un script
```

Con comillas, el texto se escribe tal cual, con sus espacios. Sin comillas, bash separa las palabras y `echo` las une con un solo espacio.
:::

### 2. Qué ignora bash

Lee este script:

```bash
#!/bin/bash
# echo "Esto no sale"
echo "Línea 1" # echo "Línea 2"
echo "Línea 3"
```

:::pregunta[¿Qué escribe en pantalla?]
```text
Línea 1
Línea 3
```

La línea 2 del script es un comentario entero y se ignora. En la línea 3, todo lo que va después de `#` también es un comentario, así que solo se ejecuta el primer `echo`.
:::

### 3. Un script roto

Este script debería dar la bienvenida y mostrar la fecha, pero tiene tres fallos:

```bash
!/bin/bash
Ecoh "Bienvenido al sistema"
echo Hoy es: date
```

:::pregunta[Escribe la versión corregida]
```bash
#!/bin/bash
echo "Bienvenido al sistema"
echo "Hoy es:"
date
```

Los tres fallos eran: a la primera línea le faltaba el `#` (sin él no es un comentario de arranque, sino una orden inexistente), `Ecoh` está mal escrito (`echo`) y `date` dentro de `echo` es solo texto: para ejecutar la orden hay que ponerla en su propia línea.
:::

### 4. Rellena los huecos

Completa los huecos `_____` para que el script escriba un pequeño informe:

```bash
#!/bin/bash
_____ Informe del sistema
echo "Usuario:"
_____
echo "Directorio actual:"
_____
```

:::pregunta[Escribe el script completo]
```bash
#!/bin/bash
# Informe del sistema
echo "Usuario:"
whoami
echo "Directorio actual:"
pwd
```

El primer hueco es un comentario (`#`). `whoami` escribe el nombre del usuario y `pwd` la carpeta en la que estás.
:::

### 5. Escríbelo tú

Escribe un script que:

1. Empiece con un comentario que diga qué hace.
2. Escriba un saludo con tu nombre.
3. Escriba la fecha y la hora actuales.
4. Muestre el listado de ficheros de la carpeta actual.

:::pregunta[Una solución posible]
```bash
#!/bin/bash
# Saluda, muestra la fecha y lista la carpeta actual
echo "Hola, soy Ana"
date
ls
```

La salida depende de la fecha y de los ficheros que haya en tu carpeta. Lo importante es que el script empiece por `#!/bin/bash`, que lleve su comentario y que cada orden esté en su propia línea.
:::

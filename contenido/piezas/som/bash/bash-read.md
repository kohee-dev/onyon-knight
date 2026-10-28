---
titulo: "Bash 3: entrada del usuario con read"
tipo: teoria
---

# Bash 3: entrada del usuario con read

Hasta ahora los scripts siempre hacen lo mismo. Con `read` el script puede preguntar al usuario y guardar lo que escriba en una variable.

## Lo mínimo para empezar

```bash
#!/bin/bash
read -p "¿Cómo te llamas? " nombre
echo "Hola, $nombre"
```

- `read variable` espera a que el usuario escriba una línea y pulse Intro, y la guarda en `variable`.
- `-p "texto"` muestra un mensaje antes de esperar.
- `read a b` reparte las palabras escritas: la primera va a `a`, la segunda a `b`, y **todo el resto** va a `b`.
- Cuando uses una variable como argumento de una orden, ponla entre comillas dobles (`ls -l "$carpeta"`) para que funcione aunque tenga espacios.

## Ejercicios

En los ejercicios de leer, el texto que escribe el usuario aparece entre «».

### 1. Dos palabras en una variable

Lee este script, y supón que el usuario escribe «Ana Pérez»:

```bash
#!/bin/bash
read -p "Nombre: " nombre
echo "Hola, $nombre"
```

:::pregunta[¿Qué escribe en pantalla después del mensaje «Nombre: »?]
```text
Hola, Ana Pérez
```

Con una sola variable, `read` guarda la línea completa.
:::

### 2. Más palabras que variables

Lee este script, y supón que el usuario escribe «uno dos tres»:

```bash
#!/bin/bash
read a b
echo "$b $a"
```

:::pregunta[¿Qué escribe en pantalla?]
```text
dos tres uno
```

`a` recibe `uno` y `b` recibe todo el resto, `dos tres`.
:::

### 3. Un script roto

Este script debería preguntar el nombre y la edad y saludar, pero tiene tres fallos:

```bash
#!/bin/bash
read -p "Nombre: "nombre
read -p Tu edad: edad
echo "$nom tiene $edad años"
```

:::pregunta[Escribe la versión corregida]
```bash
#!/bin/bash
read -p "Nombre: " nombre
read -p "Edad: " edad
echo "$nombre tiene $edad años"
```

Los fallos: falta el espacio tras las comillas del primer mensaje (el mensaje pasaba a ser `Nombre: nombre` y, al no haber variable, lo escrito se guardaba en `REPLY`, así que `$nombre` quedaba vacía), el mensaje del segundo `read` lleva un espacio y debe ir entre comillas (sin ellas, `Tu` es el mensaje y `edad:` un nombre de variable inválido), y el `echo` usaba `$nom` en vez de `$nombre`.
:::

### 4. Rellena los huecos

Completa los huecos `_____` para que el script pregunte el nombre y la ciudad y escriba, por ejemplo, `Ana vive en Sevilla`:

```bash
#!/bin/bash
read -p "¿Cómo te llamas? " _____
read -p "¿En qué ciudad vives? " _____
echo "_____ vive en _____"
```

:::pregunta[Escribe el script completo]
```bash
#!/bin/bash
read -p "¿Cómo te llamas? " nombre
read -p "¿En qué ciudad vives? " ciudad
echo "$nombre vive en $ciudad"
```

Los nombres de variable pueden ser otros, siempre que uses el mismo en el `read` y en el `echo`.
:::

### 5. Escríbelo tú: la frase

Escribe un script que pregunte un animal, un color y un lugar, y escriba una frase con los tres. Por ejemplo, si escribes `gato`, `azul` y `Madrid`: `El gato azul vive en Madrid.`

:::pregunta[Una solución posible]
```bash
#!/bin/bash
read -p "Un animal: " animal
read -p "Un color: " color
read -p "Un lugar: " lugar
echo "El $animal $color vive en $lugar."
```
:::

### 6. Escríbelo tú: listar una carpeta

Escribe un script que pregunte por una carpeta y muestre su contenido con `ls -l`. Debe funcionar también si el nombre de la carpeta tiene espacios.

:::pregunta[Una solución posible]
```bash
#!/bin/bash
read -p "Carpeta: " carpeta
ls -l "$carpeta"
```

Las comillas en `"$carpeta"` evitan que bash trate un nombre como `Mis documentos` como dos argumentos distintos.
:::

---
titulo: "Comandos 3: crear, copiar, mover y borrar"
tipo: teoria
---

# Comandos 3: crear, copiar, mover y borrar

Ya sabes moverte y leer. Ahora toca **cambiar** cosas: crear carpetas y ficheros, copiarlos, cambiarlos de sitio y borrarlos. Es lo que se hace todos los días al ordenar un servidor, y donde un descuido sale caro, así que esta pieza termina con un aviso importante.

## Lo mínimo para empezar

| Orden | Qué hace |
|---|---|
| `mkdir carpeta` | crea una carpeta |
| `mkdir -p a/b/c` | crea la carpeta `c` y las que falten por el camino |
| `touch fichero` | crea un fichero vacío (o actualiza su fecha si ya existe) |
| `cp origen destino` | copia un fichero |
| `cp -r carpeta destino` | copia una carpeta con todo lo que lleva dentro |
| `mv origen destino` | **mueve** un fichero o carpeta, o le cambia el nombre |
| `rm fichero` | borra un fichero |
| `rm -r carpeta` | borra una carpeta con todo lo que lleva dentro |
| `rmdir carpeta` | borra una carpeta, pero solo si está vacía |

Tres ideas para no equivocarte:

- `mv` hace dos cosas con la misma orden: si el destino es una carpeta que existe, **mueve** dentro de ella; si no existe, **cambia el nombre**.
- `cp` y `mv` **sobrescriben** el destino si ya existe, sin avisar. Con `-i` preguntan antes.
- `rm` no tiene papelera: lo que borras no se recupera.

Los **comodines** sustituyen parte de un nombre, y los expande la propia terminal antes de ejecutar la orden:

| Comodín | Significa |
|---|---|
| `*` | cualquier cosa, incluso nada: `*.txt` son todos los que acaban en `.txt` |
| `?` | exactamente un carácter cualquiera: `foto?.png` |
| `[12]` | uno de los caracteres de la lista: `foto[12].png` |
| `{a,b,c}` | no es un comodín de ficheros, genera varias palabras: `mkdir {a,b,c}` equivale a `mkdir a b c` |

:::aviso
`rm -r` con un comodín mal escrito puede borrar mucho más de lo que querías. Antes de borrar con comodín, ejecuta primero `ls` con **el mismo patrón** y comprueba que salen justo los ficheros que quieres.
:::

Los ejercicios usan estos nombres, siempre dentro de una carpeta de pruebas:

```text
foto1.png  foto2.png  foto3.png
informe-a.pdf  informe-b.pdf
notas.txt  resumen.txt
```

## Ejercicios

### 1. Crear

Estás en una carpeta vacía. Lee estas órdenes:

```bash
mkdir proyecto
cd proyecto
touch a.txt b.txt
ls
```

:::pregunta[¿Qué escribe `ls`?]
```text
a.txt  b.txt
```

`mkdir` crea la carpeta, `cd` entra en ella y `touch` crea los dos ficheros vacíos. En pantalla salen en una línea, en columnas.
:::

### 2. Crear con camino

Estás en una carpeta vacía. Lee estas órdenes:

```bash
mkdir -p x/y/z
ls x/y
mkdir q/r/s
```

:::pregunta[¿Qué escribe el `ls`? ¿Qué ocurre con la última orden?]
El `ls` escribe `z`. La última orden falla con un mensaje de que no se puede crear `q/r/s` porque no existe el directorio.

`-p` crea también las carpetas intermedias. Sin `-p`, `mkdir` solo crea el último nivel y exige que el resto ya exista.
:::

### 3. Copiar

Estás en `proyecto`, que tiene `a.txt` y `b.txt`. Lee esta orden:

```bash
cp a.txt copia.txt
ls
```

:::pregunta[¿Qué escribe `ls`? ¿Qué pasa si `copia.txt` ya existía?]
```text
a.txt  b.txt  copia.txt
```

Si `copia.txt` ya existía, `cp` lo sobrescribe sin avisar. Con `cp -i a.txt copia.txt` preguntaría antes.
:::

### 4. Copiar una carpeta

Estás en `proyecto`, que tiene una carpeta `carpeta` con un fichero `f.txt` y una subcarpeta `sub`. Lee estas órdenes:

```bash
cp carpeta destino
cp -r carpeta destino
ls destino
```

:::pregunta[¿Qué ocurre con la primera? ¿Qué escribe el `ls`?]
La primera falla con un aviso de que `carpeta` es un directorio y se omite, porque falta `-r`. La segunda copia la carpeta entera. El `ls` escribe:

```text
f.txt  sub
```

`cp` solo copia ficheros a menos que le digas `-r` (de *recursivo*, «y todo lo que haya dentro»).
:::

### 5. Mover o renombrar

Estás en `proyecto`, que tiene `a.txt` y `b.txt`. Lee estas órdenes:

```bash
mv a.txt z.txt
mv b.txt ..
ls
ls ..
```

:::pregunta[¿Qué hace cada `mv`? ¿Qué se ve en cada `ls`?]
El primer `mv` **cambia el nombre** de `a.txt` a `z.txt`, porque `z.txt` no existe. El segundo **mueve** `b.txt` a la carpeta de arriba, porque `..` sí existe y es una carpeta.

El primer `ls` ya no muestra `a.txt` ni `b.txt` (muestra `z.txt` y lo demás que hubiera). El segundo `ls` muestra `b.txt` entre lo que hay en la carpeta de arriba.
:::

### 6. Borrar

Estás en una carpeta con un fichero `copia.txt` y una carpeta `carpeta` que no está vacía. Lee estas órdenes:

```bash
rm copia.txt
rm carpeta
rmdir carpeta
rm -r carpeta
```

:::pregunta[¿Qué ocurre con cada una?]
`rm copia.txt` borra el fichero sin preguntar. `rm carpeta` falla: es un directorio. `rmdir carpeta` falla también: el directorio no está vacío. `rm -r carpeta` la borra con todo su contenido.

`rmdir` es la orden prudente, porque no borra nada que tenga dentro. `rm -r` borra sin hacer preguntas.
:::

### 7. Comodines

En una carpeta están los siete ficheros de la lista del principio. Lee estas órdenes:

```bash
ls *.png
ls *.txt
ls foto[12].png
ls informe-?.pdf
ls *f*
```

:::pregunta[¿Qué escribe cada una?]
```text
foto1.png  foto2.png  foto3.png
notas.txt  resumen.txt
foto1.png  foto2.png
informe-a.pdf  informe-b.pdf
foto1.png  foto2.png  foto3.png  informe-a.pdf  informe-b.pdf
```

Cada `ls` lista los ficheros que casan con el patrón. `*f*` son todos los que tienen una `f` en cualquier parte del nombre, y en `notas.txt` y `resumen.txt` no hay ninguna.
:::

### 8. Varias a la vez con llaves

Estás en una carpeta vacía. Lee estas órdenes:

```bash
mkdir {enero,febrero,marzo}
touch informe{1,2,3}.txt
ls
```

:::pregunta[¿Qué escribe `ls`?]
```text
enero  febrero  informe1.txt  informe2.txt  informe3.txt  marzo
```

La terminal convierte `mkdir {enero,febrero,marzo}` en `mkdir enero febrero marzo`, y `informe{1,2,3}.txt` en tres nombres. Es un atajo de escritura, no hace nada especial.
:::

## Hazlo tú

Guarda este script como `preparar-3.sh` y ejecútalo con `bash preparar-3.sh`. Crea en `practica` una carpeta `descargas` muy desordenada.

```bash
rm -rf ~/practica/descargas ~/practica/ordenado ~/practica/ordenado-copia
mkdir -p ~/practica/descargas/viejo/2023
cd ~/practica/descargas
touch foto1.jpg foto2.jpg captura.png factura-enero.pdf factura-febrero.pdf
touch apuntes.txt lista.txt cancion1.mp3 cancion2.mp3 borrador.tmp cache.tmp
touch viejo/2023/restos.tmp
echo "Carpeta ~/practica/descargas preparada"
```

Vas a ordenar esa carpeta como si fuera la de un compañero que no ha ordenado nunca nada.

### 9. Una estructura nueva

Dentro de `practica`, crea una carpeta `ordenado` con tres carpetas dentro: `imagenes`, `documentos` y `musica`. Hazlo con una sola orden.

:::pregunta[Escribe la orden]
```bash
mkdir -p ~/practica/ordenado/{imagenes,documentos,musica}
```

Sirve también `mkdir ~/practica/ordenado` seguido de `cd` y tres `mkdir`, pero el enunciado pide una sola orden.
:::

### 10. Cada cosa en su sitio

Mueve las imágenes (`.jpg` y `.png`) de `descargas` a `imagenes`, los documentos (`.pdf` y `.txt`) a `documentos` y las canciones a `musica`. No muevas los ficheros uno a uno: usa comodines.

:::pregunta[Escribe las órdenes]
```bash
cd ~/practica
mv descargas/*.jpg descargas/*.png ordenado/imagenes
mv descargas/*.pdf descargas/*.txt ordenado/documentos
mv descargas/*.mp3 ordenado/musica
```

Cada `mv` recibe varios orígenes y una carpeta destino al final. Si algo sale mal, puedes volver a ejecutar `preparar-3.sh` y empezar de cero.
:::

### 11. Limpiar

Elimina de `descargas` todo lo temporal (los ficheros `.tmp`) y la carpeta `viejo` con lo que lleva dentro. Después haz una copia completa de `ordenado` con el nombre `ordenado-copia`.

:::pregunta[Escribe las órdenes]
```bash
cd ~/practica
ls descargas/*.tmp
rm descargas/*.tmp
rm -r descargas/viejo
cp -r ordenado ordenado-copia
```

El `ls` previo es la costumbre que debes coger: comprobar el patrón antes de borrar. `descargas/*.tmp` solo alcanza los ficheros de esa carpeta; `restos.tmp` desaparece con la carpeta `viejo`.
:::

### 12. La evidencia

Demuestra que `descargas` ha quedado vacía y que `ordenado` contiene lo que le corresponde en cada carpeta, con una sola orden para esto último.

:::pregunta[Escribe las órdenes y lo que esperas ver]
```bash
ls -A ~/practica/descargas
cd ~/practica
ls -R ordenado
```

El primero no escribe nada. El segundo debe mostrar:

```text
ordenado:
documentos  imagenes  musica

ordenado/documentos:
apuntes.txt  factura-enero.pdf  factura-febrero.pdf  lista.txt

ordenado/imagenes:
captura.png  foto1.jpg  foto2.jpg

ordenado/musica:
cancion1.mp3  cancion2.mp3
```

`-R` lista una carpeta y todas las de dentro, cada una con su nombre y una línea en blanco entre ellas.
:::

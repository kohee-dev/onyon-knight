---
titulo: "Comandos 7: redirecciones y tuberías"
tipo: teoria
---

# Comandos 7: redirecciones y tuberías

Cada orden escribe su resultado en pantalla y lee del teclado, pero ese comportamiento se puede cambiar: guardar lo que escribe en un fichero, descartar los errores o pasarle el resultado a otra orden. Es la idea más poderosa de la terminal: órdenes sencillas que se combinan para hacer cosas complicadas.

## Lo mínimo para empezar

Una orden tiene tres canales: lo que **lee** (entrada), lo que **escribe** (salida) y los **mensajes de error**, que salen por un canal aparte aunque en pantalla parezcan lo mismo.

| Símbolo | Qué hace |
|---|---|
| `orden > fichero` | guarda la salida en el fichero (lo crea, o lo **vacía** si ya existía) |
| `orden >> fichero` | añade la salida al final del fichero |
| `orden < fichero` | la orden lee del fichero en vez del teclado |
| `orden 2> fichero` | guarda los **errores** en el fichero |
| `orden 2> /dev/null` | descarta los errores (`/dev/null` es el agujero negro) |
| `orden > fichero 2>&1` | guarda en el fichero la salida **y** los errores |
| `orden1 \| orden2` | la salida de `orden1` es la entrada de `orden2` (**tubería** o *pipe*) |
| `orden \| tee fichero` | escribe en pantalla **y** guarda en el fichero (`-a` para añadir) |

`echo texto` escribe el texto, así que `echo texto > fichero` crea un fichero con ese texto.

Los ejercicios usan estos ficheros, juntos en una carpeta:

```text
# compra.txt
pan
leche
huevos
queso
fruta
```

```text
# notas.txt
alta
media
baja
```

## Ejercicios

### 1. Sobrescribir y añadir

Estás en una carpeta vacía. Lee estas órdenes:

```bash
echo rojo > c.txt
echo verde >> c.txt
echo azul >> c.txt
cat c.txt
echo negro > c.txt
cat c.txt
```

:::pregunta[¿Qué escribe cada `cat`?]
```text
rojo
verde
azul
negro
```

`>` crea el fichero o lo vacía, y `>>` añade al final. Con la última orden, `c.txt` pierde las tres líneas anteriores y solo queda `negro`.
:::

### 2. Una tubería

Lee esta orden:

```bash
cat compra.txt | head -n 3
```

:::pregunta[¿Qué escribe?]
```text
pan
leche
huevos
```

`cat` escribe el fichero entero, pero en vez de ir a pantalla va a `head`, que se queda con las tres primeras líneas.
:::

### 3. Contar lo que sale

En una carpeta hay siete ficheros. Lee esta orden:

```bash
ls | wc -l
```

:::pregunta[¿Qué escribe?]
```text
7
```

`ls` escribe un nombre por línea cuando va a una tubería, y `wc -l` cuenta las líneas: es la forma de contar cuántas cosas hay en una carpeta.
:::

### 4. Filtrar y contar

Lee esta orden, con `compra.txt`:

```bash
grep a compra.txt | wc -l
```

:::pregunta[¿Qué escribe? ¿Qué líneas son?]
```text
2
```

Son las líneas que contienen una `a`: `pan` y `fruta`. `leche`, `huevos` y `queso` no la tienen.
:::

### 5. Separar los errores

La ruta `/noexiste` no existe. Lee estas tres órdenes:

```bash
ls /noexiste > salida.txt
ls /noexiste 2> errores.txt
ls /noexiste 2> /dev/null
```

:::pregunta[¿Qué sale en pantalla y qué hay en cada fichero?]
La primera orden **escribe en pantalla** el mensaje de error, y `salida.txt` queda **vacío**. La segunda no escribe nada en pantalla, y `errores.txt` contiene una línea con el mensaje. La tercera no escribe nada ni guarda nada.

`>` solo redirige la salida normal, y `ls` no tiene nada que decir porque la carpeta no existe. El mensaje es un error y por eso solo se redirige con `2>`.
:::

### 6. Salida y errores juntos

Lee esta orden, con `compra.txt` en la carpeta y sin `/noexiste`:

```bash
ls /noexiste compra.txt > todo.txt 2>&1
```

:::pregunta[¿Qué sale en pantalla y qué hay en `todo.txt`?]
En pantalla no sale nada. `todo.txt` contiene dos líneas: el mensaje de error de `ls` por `/noexiste` y la línea `compra.txt`.

`2>&1` significa «los errores van adonde vaya la salida normal», que aquí es `todo.txt`.
:::

### 7. Escribir y guardar a la vez

Lee estas órdenes:

```bash
echo hola | tee salida.txt
echo adios | tee -a salida.txt
cat salida.txt
```

:::pregunta[¿Qué escribe cada orden?]
```text
hola
adios
hola
adios
```

Los dos `tee` escriben en pantalla lo que reciben (`hola` y `adios`) y además lo guardan. El primero crea el fichero y el segundo, con `-a`, añade. El `cat` final enseña el fichero con las dos líneas.
:::

### 8. Leer de un fichero

Lee estas dos órdenes:

```bash
wc -l compra.txt
wc -l < compra.txt
```

:::pregunta[¿Qué escribe cada una?]
```text
5 compra.txt
5
```

Con el nombre, `wc` sabe de qué fichero habla y lo escribe. Con `<`, `wc` lee de la entrada y no sabe cómo se llama el fichero, así que solo escribe el número. Es útil cuando quieres guardar ese número en una variable.
:::

### 9. Varios ficheros en una tubería

Lee esta orden, con `compra.txt` y `notas.txt`:

```bash
cat compra.txt notas.txt | grep -c a
```

:::pregunta[¿Qué escribe y por qué?]
```text
5
```

`cat` junta las ocho líneas de los dos ficheros y `grep -c a` cuenta las que llevan una `a`: `pan`, `fruta`, `alta`, `media` y `baja`.
:::

### 10. Escribir una tubería

Quieres saber cuántos ficheros `.txt` hay en la carpeta actual.

:::pregunta[Escribe la orden]
```bash
ls *.txt | wc -l
```

También sirve `find . -maxdepth 1 -name "*.txt" | wc -l`. Con una tubería ya tienes un contador de cualquier cosa que pueda listarse.
:::

## Hazlo tú

Guarda este script como `preparar-7.sh` y ejecútalo con `bash preparar-7.sh`. Crea en `practica` una carpeta `pistas` con cinco ficheros de texto, una imagen vacía y un script `generador.sh` que escribe cosas por el canal normal y por el de errores.

```bash
rm -rf ~/practica/pistas ~/practica/lista.txt
mkdir -p ~/practica/pistas
cd ~/practica/pistas
for n in 1 2 3 4 5; do echo "pista $n" > pista$n.txt; done
touch mapa.png
cat > generador.sh <<'X'
echo "inicio"
echo "fallo en el disco" >&2
echo "copiando datos"
echo "fallo en la red" >&2
echo "fin"
X
echo "Carpeta ~/practica/pistas preparada"
```

### 11. Una lista guardada

Guarda en el fichero `~/practica/lista.txt` los nombres de los ficheros de texto de `pistas`, uno por línea. Demuestra después cuántos son sin contarlos tú.

:::pregunta[Escribe las órdenes y el número]
```bash
cd ~/practica/pistas
ls *.txt > ~/practica/lista.txt
wc -l < ~/practica/lista.txt
```

Salen **5** nombres. `lista.txt` está fuera de `pistas` para que no entre en su propia lista.
:::

### 12. Una línea más

Añade a `lista.txt` una última línea que diga `FIN`, sin borrar las anteriores. Demuestra que el fichero tiene ahora seis líneas y que la última es esa.

:::pregunta[Escribe las órdenes y lo que ves]
```bash
echo FIN >> ~/practica/lista.txt
wc -l < ~/practica/lista.txt
tail -n 1 ~/practica/lista.txt
```

Sale `6` y `FIN`. Con un solo `>` habrías vaciado el fichero.
:::

### 13. Cada cosa a su fichero

Ejecuta `generador.sh` con `bash generador.sh` de modo que lo normal se guarde en `salida.log` y los errores en `errores.log`, y no salga nada en pantalla. Demuestra cuántas líneas tiene cada fichero.

:::pregunta[Escribe las órdenes y los números]
```bash
bash generador.sh > salida.log 2> errores.log
wc -l salida.log errores.log
```

Salen **3** líneas en `salida.log` y **2** en `errores.log`.
:::

### 14. Solo lo bueno

Ejecuta de nuevo `generador.sh` y haz que en pantalla solo se vea lo normal, sin los mensajes de fallo, sin guardar nada en ningún fichero.

:::pregunta[Escribe la orden y lo que ves]
```bash
bash generador.sh 2> /dev/null
```

Salen `inicio`, `copiando datos` y `fin`.
:::

### 15. Todo junto

Ejecuta `generador.sh` guardando **todo** (salida y errores) en un único fichero `todo.log`, y averigua cuántas de sus líneas hablan de un `fallo`, sin contar a mano.

:::pregunta[Escribe las órdenes y el número]
```bash
bash generador.sh > todo.log 2>&1
grep -c fallo todo.log
```

Sale **2**. En `todo.log` hay cinco líneas, y el orden en que se mezclan salida y errores puede variar.
:::

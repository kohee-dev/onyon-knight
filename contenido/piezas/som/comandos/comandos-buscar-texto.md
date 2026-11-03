---
titulo: "Comandos 6: buscar texto con grep"
tipo: teoria
---

# Comandos 6: buscar texto con grep

`find` busca ficheros por sus datos; `grep` busca **dentro** de ellos. Con él encuentras una línea concreta en un registro de miles, o sabes qué fichero de una carpeta menciona una palabra. En los retos online es la otra mitad de casi todos los niveles.

## Lo mínimo para empezar

```bash
grep texto fichero
```

escribe las líneas del fichero que contienen ese texto.

| Opción | Qué hace |
|---|---|
| `-i` | no distingue mayúsculas de minúsculas |
| `-v` | invierte: escribe las líneas que **no** lo contienen |
| `-n` | escribe delante el número de cada línea |
| `-c` | no escribe las líneas, solo **cuántas** son |
| `-w` | busca palabras enteras, no trozos de palabra |
| `-r` | busca dentro de todos los ficheros de una carpeta, bajando por las subcarpetas |
| `-l` | escribe solo el **nombre** de los ficheros donde hay coincidencias |

Las opciones se pueden juntar: `grep -in error registro.log`.

El texto que buscas puede llevar unos pocos símbolos especiales:

| Símbolo | Significa |
|---|---|
| `^` | principio de línea: `^2025` son las líneas que empiezan por 2025 |
| `$` | final de línea: `lleno$` son las líneas que acaban en `lleno` |
| `.` | cualquier carácter: `c.sa` casa con `casa` y con `cosa` |
| `[0-5]` | uno de los caracteres del rango o de la lista |

Dos detalles importantes:

- Si el texto lleva espacios o símbolos, escríbelo entre comillas: `grep "disco lleno" registro.log`.
- Cuando `grep` no encuentra nada, no escribe nada, pero termina con un código de error (`$?` vale 1). Es la forma de saber si algo estaba o no.

Los ejercicios usan estos dos ficheros, `registro.log` y `palabras.txt`, y una carpeta:

```text
# registro.log
2025-03-01 10:00 INFO inicio
2025-03-01 10:05 ERROR disco lleno
2025-03-01 10:07 INFO copia hecha
2025-03-01 10:09 error de red
2025-03-01 10:12 WARNING poco espacio
```

```text
# palabras.txt
copia
copiado
recopia
```

```text
carpeta
├── a.txt          (hola mundo)
├── c.txt          (nada)
└── sub
    └── b.txt      (hola otra vez / adios)
```

## Ejercicios

### 1. Buscar una palabra

Lee esta orden:

```bash
grep ERROR registro.log
```

:::pregunta[¿Qué escribe?]
```text
2025-03-01 10:05 ERROR disco lleno
```

Solo una línea tiene `ERROR` escrito así, en mayúsculas. La de `error de red` no cuenta: `grep` distingue mayúsculas.
:::

### 2. Sin distinguir mayúsculas

Lee esta orden:

```bash
grep -i error registro.log
```

:::pregunta[¿Qué escribe?]
```text
2025-03-01 10:05 ERROR disco lleno
2025-03-01 10:09 error de red
```

`-i` hace que `ERROR` y `error` cuenten como lo mismo.
:::

### 3. Todo lo que no es

Lee esta orden:

```bash
grep -v INFO registro.log
```

:::pregunta[¿Qué escribe?]
```text
2025-03-01 10:05 ERROR disco lleno
2025-03-01 10:09 error de red
2025-03-01 10:12 WARNING poco espacio
```

`-v` invierte el filtro: salen las tres líneas donde **no** aparece `INFO`.
:::

### 4. Numerar y contar

Lee estas dos órdenes:

```bash
grep -n INFO registro.log
grep -c INFO registro.log
```

:::pregunta[¿Qué escribe cada una?]
```text
1:2025-03-01 10:00 INFO inicio
3:2025-03-01 10:07 INFO copia hecha
2
```

`-n` escribe delante el número de línea y dos puntos. `-c` no escribe líneas: escribe cuántas hay.
:::

### 5. Palabra entera

Lee estas dos órdenes, con `palabras.txt`:

```bash
grep copia palabras.txt
grep -w copia palabras.txt
```

:::pregunta[¿Qué escribe cada una?]
```text
copia
copiado
recopia
copia
```

Sin `-w`, `copia` aparece **dentro** de `copiado` y de `recopia`, y las tres líneas casan. Con `-w` solo cuenta la palabra completa.
:::

### 6. Principio y final de línea

Lee estas dos órdenes, con `registro.log`:

```bash
grep '^2025-03-01 10:0[0-5]' registro.log
grep 'lleno$' registro.log
```

:::pregunta[¿Qué escribe cada una?]
```text
2025-03-01 10:00 INFO inicio
2025-03-01 10:05 ERROR disco lleno
2025-03-01 10:05 ERROR disco lleno
```

Las dos primeras líneas son de la primera orden: casa con las que **empiezan** por esa fecha y una hora entre las 10:00 y las 10:05 (el último dígito de los minutos entre 0 y 5). La tercera es de la segunda orden: casa con las que **terminan** en `lleno`.
:::

### 7. En todas las carpetas

Lee estas dos órdenes, desde la carpeta que contiene `carpeta`:

```bash
grep -r hola carpeta
grep -rl hola carpeta
```

:::pregunta[¿Qué escribe cada una?]
```text
carpeta/a.txt:hola mundo
carpeta/sub/b.txt:hola otra vez
carpeta/a.txt
carpeta/sub/b.txt
```

Con `-r`, `grep` escribe delante de cada línea el fichero donde la encontró. Con `-l` solo escribe los nombres. `c.txt` no sale porque no contiene `hola`. El orden puede variar.
:::

### 8. Opciones juntas

Lee esta orden:

```bash
grep -in error registro.log
```

:::pregunta[¿Qué escribe?]
```text
2:2025-03-01 10:05 ERROR disco lleno
4:2025-03-01 10:09 error de red
```

`-i` y `-n` se juntan en `-in`. Salen las dos líneas con `error` en cualquier forma, con su número.
:::

### 9. ¿Está o no está?

Lee esta orden y la siguiente:

```bash
grep -q nohayesto registro.log
echo $?
```

:::pregunta[¿Qué escribe `echo $?` y qué significa?]
Escribe `1`. `grep` ha terminado con código 1 porque **no encontró** nada. Si hubiera encontrado algo, el código sería 0.

`$?` guarda el código de la última orden: 0 es «bien» y cualquier otro número es «no». `-q` (de *quiet*) hace que `grep` no escriba nada y solo responda con ese código.
:::

### 10. Escribir una búsqueda

Quieres saber **cuántas** líneas de `registro.log` no son de tipo `INFO`.

:::pregunta[Escribe la orden]
```bash
grep -vc INFO registro.log
```

`-v` invierte y `-c` cuenta: escribe `3`.
:::

## Hazlo tú

Guarda este script como `preparar-6.sh` y ejecútalo con `bash preparar-6.sh`. Crea en `practica` una carpeta `diario` con un registro de un servidor, una lista de accesos y un archivo de notas. En ella hay una clave con la forma `CLAVE-X-0000` escondida en una línea.

```bash
rm -rf ~/practica/diario
mkdir -p ~/practica/diario/archivo/viejo
cd ~/practica/diario
for i in $(seq 1 60); do
    if [ $((i % 10)) -eq 0 ]; then nivel=ERROR
    elif [ $((i % 7)) -eq 0 ]; then nivel=WARNING
    else nivel=INFO; fi
    texto=evento$i
    [ $i -eq 33 ] && texto="revisado error de usuario"
    echo "linea $i $nivel $texto"
done > servidor.log
usuarios=(alex luis marta)
for i in $(seq 1 30); do
    echo "usuario ${usuarios[$((i % 3))]} entra"
done > acceso.txt
echo "usuario marta entra con CLAVE-E-5019" >> acceso.txt
for n in 1 2 3; do echo "nada que ver $n" > archivo/notas$n.txt; done
echo "el secreto es CLAVE-F-6620" > archivo/viejo/notas4.txt
echo "Carpeta ~/practica/diario preparada"
```

### 11. Errores del servidor

Averigua cuántas líneas de `servidor.log` son de tipo `ERROR` y cuántas contienen la palabra `error` escrita de cualquier forma. No cuentes a mano.

:::pregunta[Escribe las órdenes y los dos números]
```bash
cd ~/practica/diario
grep -c ERROR servidor.log
grep -ic error servidor.log
```

Salen **6** y **7**. La diferencia es la línea 33, que es de tipo `INFO` pero dice `revisado error de usuario`.
:::

### 12. Los que no son de alex

Cuenta cuántas entradas de `acceso.txt` no son de `alex`.

:::pregunta[Escribe la orden y el número]
```bash
grep -vc alex acceso.txt
```

Salen **21**: veinte entradas de `luis` y de `marta` del ciclo, más la línea con la clave.
:::

### 13. La clave de los accesos

Encuentra en `acceso.txt` la línea que lleva una clave, y escribe la clave.

:::pregunta[Escribe la orden y la clave]
```bash
grep CLAVE acceso.txt
```

La línea es `usuario marta entra con CLAVE-E-5019`, y la clave es `CLAVE-E-5019`.
:::

### 14. El secreto del archivo

En la carpeta `archivo`, o en alguna de sus subcarpetas, un fichero menciona la palabra `secreto`. Averigua cuál y lee la clave.

:::pregunta[Escribe la orden y la clave]
```bash
grep -r secreto archivo
```

Sale `archivo/viejo/notas4.txt:el secreto es CLAVE-F-6620`. La clave es `CLAVE-F-6620`. Con `-rl` solo te habría dado el nombre del fichero.
:::

### 15. El número de línea

Averigua en qué línea de `servidor.log` está `revisado error` y escribe esa línea completa con su número.

:::pregunta[Escribe la orden y la salida]
```bash
grep -n "revisado error" servidor.log
```

```text
33:linea 33 INFO revisado error de usuario
```

Las comillas son obligatorias: sin ellas, `grep` buscaría `revisado` en dos ficheros, `error` y `servidor.log`, y se quejaría de que `error` no existe.
:::

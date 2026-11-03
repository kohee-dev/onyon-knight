---
titulo: "Comandos 10: comprimir y empaquetar"
tipo: teoria
---

# Comandos 10: comprimir y empaquetar

Para guardar copias de seguridad, enviar una carpeta o descargar software, los ficheros se **empaquetan** (muchos ficheros en uno) y se **comprimen** (ocupan menos). En Linux son dos pasos distintos, y a veces se hacen uno detrás de otro, por eso una descarga puede acabar en `.tar.gz`. También es un clásico de los retos: un fichero comprimido dentro de otro, varias veces.

## Lo mínimo para empezar

| Orden | Qué hace |
|---|---|
| `tar -cvf paquete.tar a b` | **c**rea un paquete con los ficheros `a` y `b` (`v` va escribiendo lo que mete) |
| `tar -tf paquete.tar` | **l**ista el contenido (*t* de *table*) |
| `tar -xvf paquete.tar` | e**x**trae el contenido |
| `tar -xvf paquete.tar -C destino` | extrae dentro de la carpeta `destino` |
| `tar -czf paquete.tar.gz carpeta` | crea el paquete y lo comprime con gzip (`z`) |
| `tar -tzf`, `tar -xzf` | lista o extrae un paquete comprimido con gzip |
| `gzip fichero` / `gunzip fichero.gz` | comprime o descomprime un fichero (borra el original) |
| `bzip2 fichero` / `bzip2 -d fichero.bz2` | lo mismo con otro formato (`j` en `tar`) |
| `xz fichero` / `xz -d fichero.xz` | lo mismo con otro formato más (`J` en `tar`) |
| `zip -r paquete.zip carpeta` | crea un `.zip` (el formato de Windows) |
| `unzip paquete.zip` / `unzip -l paquete.zip` | extrae o lista un `.zip` |

Lo que debes tener claro:

- **`tar` empaqueta, pero no comprime.** Las letras van juntas y cada una significa algo: `c` crear, `x` extraer, `t` listar, `v` mostrar lo que hace, `f` el fichero del paquete (siempre va **justo antes** del nombre) y `z`, `j` o `J` para comprimir con gzip, bzip2 o xz.
- **`gzip`, `bzip2` y `xz` comprimen un solo fichero** y, por defecto, **borran el original** y dejan el comprimido. Con `-k` (de *keep*) se queda el original.
- **La extensión no manda.** Un fichero puede llamarse `informe.txt` y ser un comprimido. `file` mira el contenido y te dice qué es de verdad: un texto como `gzip compressed data`, `bzip2 compressed data`, `POSIX tar archive` o `Zip archive data`.
- Para descomprimir hay que usar la orden que corresponde al formato. Y si el fichero no tiene la extensión correcta, `gunzip` y compañía se niegan: se renombra o se usa `-c` para escribir el resultado sin tocar el original.
- Si no quieres romper nada, extrae siempre en una carpeta nueva, con `-C`.

Los ejercicios usan dos ficheros `a.txt` (con `uno`) y `b.txt` (con `dos`).

## Ejercicios

### 1. Empaquetar

Estás en una carpeta con `a.txt` y `b.txt`. Lee esta orden:

```bash
tar -cvf docs.tar a.txt b.txt
```

:::pregunta[¿Qué escribe y qué se crea?]
```text
a.txt
b.txt
```

Crea el paquete `docs.tar` con los dos ficheros. `v` es la responsable de que vaya escribiendo los nombres que mete. Los originales siguen donde estaban.
:::

### 2. Mirar sin extraer

Lee esta orden:

```bash
tar -tf docs.tar
```

:::pregunta[¿Qué escribe?]
```text
a.txt
b.txt
```

`-t` lista el contenido del paquete sin extraer nada. Es lo primero que se hace con un paquete que no conoces.
:::

### 3. Extraer en otra carpeta

Existe una carpeta `destino` vacía. Lee estas dos órdenes:

```bash
tar -xvf docs.tar -C destino
ls destino
```

:::pregunta[¿Qué escribe cada una?]
```text
a.txt
b.txt
a.txt
b.txt
```

La primera extrae y escribe lo que va sacando (`-v`); lo extrae dentro de `destino` porque `-C` cambia la carpeta de destino. El `ls` confirma que están allí.
:::

### 4. Comprimir un fichero

Lee estas dos órdenes:

```bash
gzip a.txt
ls
gunzip a.txt.gz
ls
```

:::pregunta[¿Qué escribe cada `ls`? ¿Qué ha pasado con `a.txt`?]
El primer `ls` enseña `a.txt.gz` y ya **no** aparece `a.txt` (y sí el resto de ficheros que hubiera). El segundo `ls` enseña de nuevo `a.txt`, y `a.txt.gz` ha desaparecido.

`gzip` reemplaza el fichero por su versión comprimida y `gunzip` lo hace al revés. Con `gzip -k` se habría quedado también el original.
:::

### 5. Empaquetar y comprimir

Hay una carpeta `carpeta` con un fichero `f`. Lee estas dos órdenes:

```bash
tar -czf c.tar.gz carpeta
tar -tzf c.tar.gz
```

:::pregunta[¿Qué escribe la segunda? ¿Qué significa cada letra de `-czf`?]
```text
carpeta/
carpeta/f
```

`c` crea el paquete, `z` lo comprime con gzip y `f` indica que el nombre del fichero viene a continuación (`c.tar.gz`). En la segunda orden, `t` lista y `z` avisa de que el paquete está comprimido con gzip.
:::

### 6. Un zip

Lee estas dos órdenes, con la misma `carpeta`:

```bash
zip -r c.zip carpeta
unzip -l c.zip
```

:::pregunta[¿Qué hace cada una?]
La primera crea `c.zip` con la carpeta entera: `-r` hace que entre en las subcarpetas, igual que en `cp` y `rm`. La segunda **lista** su contenido sin extraerlo: aparecen `carpeta/` y `carpeta/f`, con su tamaño y su fecha.
:::

### 7. Qué formato es

Has ejecutado `file` sobre cinco ficheros y esto es lo que ha escrito, en una forma abreviada:

```text
uno: gzip compressed data
dos: bzip2 compressed data
tres: POSIX tar archive
cuatro: Zip archive data
cinco: XZ compressed data
```

:::pregunta[¿Con qué orden extraerías o descomprimirías cada uno?]
```bash
gunzip uno        # tras renombrarlo a uno.gz
bzip2 -d dos      # tras renombrarlo a dos.bz2
tar -xf tres
unzip cuatro
xz -d cinco       # tras renombrarlo a cinco.xz
```

El nombre no importa: lo que cuenta es lo que dice `file`. Si la orden se queja de la extensión, se renombra el fichero o se usa `-c`, que deja el original intacto: `bzip2 -dc dos > resultado`.
:::

### 8. Descomprimir sin tocar

Tienes un fichero `datos` que `file` dice que es `bzip2 compressed data`. Quieres descomprimirlo en `salida` sin renombrarlo y sin perder `datos`.

:::pregunta[Escribe la orden]
```bash
bzip2 -dc datos > salida
```

`-d` descomprime y `-c` escribe el resultado por pantalla, sin tocar el original; con `>` lo guardas en `salida`. Después `file salida` te dirá qué es lo que había dentro: puede ser otra capa.
:::

## Hazlo tú

Guarda este script como `preparar-10.sh` y ejecútalo con `bash preparar-10.sh`. Crea en `practica` una carpeta `paquetes` con un pequeño proyecto y con un fichero llamado `paquete`, que tiene varias capas de empaquetado y compresión. La última capa guarda una **clave** con la forma `CLAVE-X-0000`.

```bash
rm -rf ~/practica/paquetes
mkdir -p ~/practica/paquetes/proyecto/src
cd ~/practica/paquetes
echo "print('hola')" > proyecto/src/main.py
echo "# Proyecto" > proyecto/README.md
echo "version=1" > proyecto/config.ini
mkdir capa
cd capa
echo "CLAVE-N-4242" > clave.txt
tar -cf paso.tar clave.txt
gzip paso.tar
bzip2 -c paso.tar.gz > ../paquete
cd ..
rm -r capa
echo "Carpeta ~/practica/paquetes preparada"
```

### 9. Copia de seguridad

Crea una copia de seguridad de la carpeta `proyecto` en un único fichero comprimido con gzip llamado `proyecto.tar.gz`, y demuestra qué contiene sin extraerlo.

:::pregunta[Escribe las órdenes y lo que contiene]
```bash
cd ~/practica/paquetes
tar -czf proyecto.tar.gz proyecto
tar -tzf proyecto.tar.gz
```

Contiene `proyecto/`, `proyecto/README.md`, `proyecto/config.ini`, `proyecto/src/` y `proyecto/src/main.py` (el orden puede variar).
:::

### 10. Restaurar

Imagina que has perdido `proyecto`. Restáuralo desde la copia, pero en una carpeta nueva llamada `restaurado`, sin pisar nada, y demuestra que es idéntico al original.

:::pregunta[Escribe las órdenes y cómo lo demuestras]
```bash
mkdir restaurado
tar -xzf proyecto.tar.gz -C restaurado
diff -r proyecto restaurado/proyecto
```

`diff -r` compara dos carpetas entera. Si no escribe nada, son idénticas.
:::

### 11. El paquete de capas

El fichero `paquete` esconde una clave dentro de varias capas de compresión. No sabes qué hay en cada una: hay que descubrirlo capa a capa con `file`. Saca la clave, trabajando en una carpeta nueva `~/trabajo` y sin tocar el fichero original.

:::pregunta[Escribe las órdenes y la clave]
```bash
mkdir -p ~/trabajo
cd ~/trabajo
file ~/practica/paquetes/paquete
bzip2 -dc ~/practica/paquetes/paquete > capa2
file capa2
mv capa2 capa2.gz
gunzip capa2.gz
file capa2
tar -xf capa2
cat clave.txt
```

`file` descubre primero que `paquete` es `bzip2`; el resultado de descomprimirlo es un `gzip`, y el de ese es un paquete `tar`; el `tar` contiene `clave.txt`, que dice `CLAVE-N-4242`. Es el mismo proceso que en los retos online: **mira siempre qué es antes de decidir qué orden usar**.
:::

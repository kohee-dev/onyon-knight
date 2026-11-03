---
titulo: "Comandos 4: permisos y usuarios"
tipo: teoria
---

# Comandos 4: permisos y usuarios

En Linux cada fichero tiene un **dueño**, un **grupo** y unos **permisos** que dicen quién puede leerlo, modificarlo o ejecutarlo. Es la razón de que veas `Permission denied` tantas veces, y también lo que protege el sistema. En esta pieza aprendes a leerlos y a cambiarlos.

## Lo mínimo para empezar

| Orden | Qué hace |
|---|---|
| `whoami` | escribe tu nombre de usuario |
| `id` | escribe tu número de usuario y los grupos a los que perteneces |
| `ls -l` | lista con los permisos, el dueño y el grupo de cada fichero |
| `chmod permisos fichero` | cambia los permisos |
| `chown usuario fichero` | cambia el dueño (hace falta ser administrador) |
| `chgrp grupo fichero` | cambia el grupo |
| `sudo orden` | ejecuta la orden con permisos de administrador (`root`) |
| `umask` | escribe la máscara que decide los permisos de los ficheros nuevos |

Una línea de `ls -l` empieza con diez caracteres:

```text
-rwxr-xr--
```

- El primero es el **tipo**: `-` fichero, `d` carpeta, `l` enlace.
- Los tres siguientes (`rwx`) son los permisos del **dueño**, los tres siguientes (`r-x`) los del **grupo** y los tres últimos (`r--`) los de **todos los demás**.
- `r` es leer, `w` es escribir (modificar) y `x` es ejecutar. Un guion significa que falta ese permiso.

En una **carpeta**, los permisos significan otra cosa: `r` permite ver qué hay dentro (`ls`), `x` permite **entrar** y acceder a lo que contiene (`cd`, leer un fichero concreto) y `w` permite crear y borrar ficheros dentro.

`chmod` admite dos escrituras. La **simbólica** dice quién (`u` dueño, `g` grupo, `o` otros, `a` todos), si suma o resta (`+` o `-`) y qué permiso: `chmod u+x f`, `chmod go-w f`. La **octal** da un número por cada grupo, sumando `r`=4, `w`=2 y `x`=1: `chmod 754 f` significa `rwx` (7), `r-x` (5) y `r--` (4).

Los ejercicios usan estos permisos de partida, y los de `chmod` parten siempre de `-rw-r--r--` (que es `644`).

## Ejercicios

### 1. Leer una línea

Esta es una línea de `ls -l`:

```text
-rw-r----- 1 alex contabilidad 120 mar  3 10:15 sueldos.txt
```

:::pregunta[¿Quién es el dueño y de qué grupo es? ¿Qué puede hacer cada uno?]
El dueño es `alex` y el grupo es `contabilidad`.

`alex` puede leer y modificar el fichero (`rw-`). Los miembros del grupo `contabilidad` solo pueden leerlo (`r--`). Cualquier otra persona no puede hacer nada (`---`).
:::

### 2. Leer una carpeta

Esta es otra línea de `ls -l`:

```text
drwxr-x--- 2 alex alex 4096 mar  3 10:15 privado
```

:::pregunta[¿Qué es? ¿Quién puede entrar y quién puede crear ficheros dentro?]
Es una **carpeta** (empieza por `d`). Pueden entrar `alex` y su grupo (los dos tienen `x`). Solo `alex` puede crear y borrar ficheros dentro, porque es la única con `w`. Los demás no pueden ni entrar.
:::

### 3. De letras a números

:::pregunta[Escribe en octal estos permisos: `rw-r-----`, `rwxr-xr--` y `rw-------`]
```text
640
754
600
```

Cada grupo de tres letras se convierte en un número sumando `r`=4, `w`=2 y `x`=1. Por ejemplo, `rw-` es 4+2=6 y `r-x` es 4+1=5.
:::

### 4. Cambiar permisos

Parte de un fichero `f` con permisos `-rw-r--r--`. Para cada orden, escribe cómo queda `ls -l` (solo los diez primeros caracteres). Cada una parte otra vez de `-rw-r--r--`:

```bash
chmod 755 f
chmod g+w f
chmod u+x f
chmod go-r f
```

:::pregunta[¿Cómo queda el fichero en cada caso?]
```text
-rwxr-xr-x
-rw-rw-r--
-rwxr--r--
-rw-------
```

`755` es `rwx r-x r-x`. `g+w` añade escritura al grupo. `u+x` añade ejecución al dueño. `go-r` quita lectura al grupo y a los otros.
:::

### 5. ¿Quién soy?

Esta es la salida de `id` de un usuario:

```text
uid=1000(alex) gid=1000(alex) groups=1000(alex),27(sudo),100(users)
```

:::pregunta[¿Cuál es su nombre de usuario? ¿A qué grupos pertenece? ¿Puede usar `sudo`?]
Se llama `alex`. Pertenece a tres grupos: `alex` (su grupo principal), `sudo` y `users`. Puede usar `sudo`, porque pertenece al grupo `sudo`, que es el grupo que da permiso de administrador.
:::

### 6. Permiso denegado

Un fichero `r.txt` tiene permisos `-rw-------` y su dueño es `root`. Tú eres `alex`. Lee estas dos órdenes:

```bash
cat r.txt
sudo cat r.txt
```

:::pregunta[¿Qué ocurre con cada una y por qué?]
La primera falla con `Permission denied`: el fichero solo puede leerlo su dueño, `root`, y tú eres otra persona. La segunda lo escribe, porque `sudo` ejecuta `cat` con los permisos de `root` (te pedirá tu contraseña).

`sudo` es una herramienta poderosa: úsala solo cuando sepas qué orden vas a lanzar.
:::

### 7. Un script que no se ejecuta

Has escrito un script `h.sh`, con permisos `-rw-r--r--`. Lee estas órdenes:

```bash
./h.sh
bash h.sh
chmod u+x h.sh
./h.sh
```

:::pregunta[¿Qué pasa con cada una?]
`./h.sh` falla con `Permission denied`: el fichero no tiene permiso de ejecución. `bash h.sh` funciona: el que se ejecuta es `bash`, que solo necesita **leer** el script. Tras `chmod u+x h.sh`, el último `./h.sh` ya funciona.
:::

### 8. Cambiar de dueño

Un fichero `informe.txt` pertenece a `root`. Quieres que sea tuyo, y tu usuario se llama `alex`.

:::pregunta[Escribe la orden]
```bash
sudo chown alex informe.txt
```

Hace falta `sudo`: solo el administrador puede regalar o quitar la propiedad de un fichero. Para cambiar también el grupo se escribe `sudo chown alex:alex informe.txt`.
:::

### 9. Los permisos de un fichero nuevo

Lee estas órdenes, con la máscara `022`:

```bash
umask 022
touch nuevo.txt
mkdir nueva
```

:::pregunta[¿Qué permisos tienen `nuevo.txt` y `nueva`?]
`nuevo.txt` queda con `644` (`rw-r--r--`) y `nueva` con `755` (`rwxr-xr-x`).

`umask` dice qué permisos se **quitan** al crear: los ficheros nacen con `666` y las carpetas con `777`, y la máscara `022` les quita la escritura para el grupo y los otros.
:::

## Hazlo tú

Guarda este script como `preparar-4.sh` y ejecútalo con `bash preparar-4.sh`. Necesita `sudo`, así que te pedirá tu contraseña. Crea en `practica` una carpeta `permisos` con cinco cosas que arreglar.

```bash
sudo rm -rf ~/practica/permisos
mkdir -p ~/practica/permisos/cerrada
cd ~/practica/permisos
printf '#!/bin/bash\necho "Hola desde el script"\n' > hola.sh
echo "contenido secreto" > secreto.txt
echo "contenido publico" > publico.txt
echo "DENTRO-777" > cerrada/nota.txt
echo "clave del sistema" | sudo tee del-sistema.txt > /dev/null
chmod 644 hola.sh
chmod 666 secreto.txt publico.txt
sudo chown root:root del-sistema.txt
sudo chmod 600 del-sistema.txt
chmod 000 cerrada
echo "Carpeta ~/practica/permisos preparada"
```

### 10. Un script que ejecutar

Consigue ejecutar `hola.sh` con `./hola.sh` y que escriba su mensaje.

:::pregunta[Escribe las órdenes y el mensaje]
```bash
cd ~/practica/permisos
chmod u+x hola.sh
./hola.sh
```

Escribe `Hola desde el script`. Si lo ejecutas antes del `chmod`, verás el error del ejercicio 7.
:::

### 11. Un secreto de verdad

Ahora mismo cualquiera puede leer y modificar `secreto.txt`. Deja el fichero de modo que **solo tú** puedas leerlo y modificarlo, y que nadie más pueda hacer nada con él. Demuestra el resultado.

:::pregunta[Escribe la orden y cómo lo demuestras]
```bash
chmod 600 secreto.txt
ls -l secreto.txt
```

Debe empezar por `-rw-------`. Sirve también `chmod go-rw secreto.txt`.
:::

### 12. Público pero intocable

`publico.txt` debe poder leerlo todo el mundo, pero modificarlo solo tú. Demuestra el resultado.

:::pregunta[Escribe la orden y cómo lo demuestras]
```bash
chmod 644 publico.txt
ls -l publico.txt
```

Debe empezar por `-rw-r--r--`. Sirve también `chmod go-w publico.txt`, que solo quita lo que sobra.
:::

### 13. El fichero del sistema

El fichero `del-sistema.txt` es del administrador. Demuestra que tú no puedes leerlo, léelo igualmente con permisos de administrador y, por último, hazlo tuyo para poder leerlo sin `sudo`.

:::pregunta[Escribe las órdenes y lo que escribe cada lectura]
```bash
cat del-sistema.txt
sudo cat del-sistema.txt
sudo chown $USER del-sistema.txt
cat del-sistema.txt
```

La primera lectura falla con `Permission denied`. La segunda y la cuarta escriben `clave del sistema`. `$USER` es una variable con tu nombre de usuario; vale igual `sudo chown alex del-sistema.txt` si te llamas `alex`.
:::

### 14. La carpeta cerrada

La carpeta `cerrada` no deja pasar a nadie, ni siquiera a ti. Dentro hay un fichero `nota.txt` con una clave. Consigue leerlo cambiando lo mínimo posible.

:::pregunta[Escribe las órdenes y la clave]
```bash
cat cerrada/nota.txt
chmod u+x cerrada
cat cerrada/nota.txt
```

El primer `cat` falla con `Permission denied`. Con el permiso `x` para el dueño ya puedes acceder a `nota.txt`, aunque aún no puedas listar la carpeta con `ls`: para eso haría falta también `r`. La clave es `DENTRO-777`.
:::

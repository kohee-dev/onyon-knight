---
titulo: "Bash 13: administración de usuarios desde scripts"
tipo: teoria
---

# Bash 13: administración de usuarios desde scripts

Hasta ahora los scripts trabajaban con texto. Aquí usan lo aprendido para administrar el sistema: crear y borrar usuarios, ponerles clave, procesar listas de usuarios y revisar quién falla al entrar.

:::aviso[Antes de empezar]
Estos ejercicios ejecutan órdenes **reales** que cambian el sistema, así que haz todo en una máquina virtual Linux, nunca en tu equipo de uso diario. Haz una **instantánea** antes de empezar y usa solo usuarios de prueba (`prueba1`, `prueba2`...). Los ejercicios indican cómo deshacerlos; en cualquier caso, al terminar borra los usuarios de prueba que queden con `sudo userdel -r usuario`.
:::

## Lo mínimo para empezar

- `id usuario` escribe los datos del usuario y termina con código `0` si existe y `1` si no. Con `> /dev/null 2>&1` no escribe nada y solo sirve su código: `if id "$usuario" > /dev/null 2>&1; then`. También sirve `getent passwd usuario`.
- `useradd -m usuario` crea el usuario y su carpeta personal. `userdel -r usuario` lo borra con su carpeta. Las dos necesitan `root` (es decir, `sudo`).
- `echo "usuario:clave" | chpasswd` pone la clave de un usuario sin preguntar nada. `chpasswd < claves.txt` hace lo mismo con todas las líneas `usuario:clave` de un fichero.
- Para repetir algo por cada línea de un fichero:

```bash
while IFS=: read -r usuario clave; do
  echo "Usuario: $usuario"
done < claves.txt
```

  `IFS=:` hace que `read` separe cada línea por `:` en vez de por espacios, y `-r` evita que interprete las barras invertidas. La redirección `< claves.txt` va al final, después de `done`.
- Un script que cambia el sistema debe poder ejecutarse **varias veces seguidas** sin dar errores: antes de crear algo, comprueba si ya existe.
- Los intentos de entrada fallidos quedan en el registro de autenticación: `/var/log/auth.log` en Debian y Ubuntu, o `journalctl -u ssh --no-pager` si ese fichero no existe. Una línea de intento fallido tiene esta forma, con los campos separados por espacios:

```text
# autenticacion.log
Oct 28 10:15:01 srv sshd[1201]: Failed password for ana from 10.0.0.5 port 50122 ssh2
Oct 28 10:15:09 srv sshd[1203]: Accepted password for marta from 10.0.0.9 port 50310 ssh2
Oct 28 10:16:44 srv sshd[1207]: Failed password for luis from 10.0.0.7 port 50455 ssh2
Oct 28 10:17:02 srv sshd[1209]: Failed password for ana from 10.0.0.5 port 50501 ssh2
Oct 28 10:17:30 srv sshd[1211]: Failed password for ana from 10.0.0.8 port 50612 ssh2
```

  El nombre de usuario es el campo 9 cuando se separa por espacios. Cuidado: los días del 1 al 9 se escriben con dos espacios (`Oct  8`), lo que desplaza los campos; `tr -s ' '` junta los espacios repetidos en uno y lo arregla. Si tu sistema escribe las fechas con otro formato, el número de campo cambia. Los ejercicios usan estas líneas como ejemplo.

## Ejercicios

### 1. ¿Existe el usuario?

Lee estas órdenes, ejecutadas en la máquina virtual:

```bash
id root > /dev/null
echo $?
id noexiste 2> /dev/null
echo $?
```

:::pregunta[¿Qué escriben los dos `echo`?]
```text
0
1
```

`id` termina con `0` si el usuario existe y con `1` si no. Los `> /dev/null` y `2> /dev/null` solo evitan que escriba los datos o el error en pantalla.
:::

### 2. Un alta que se puede repetir

Lee este script, `alta.sh`, que se ejecuta dos veces seguidas con `sudo bash alta.sh` (el usuario `prueba1` no existe al empezar):

```bash
#!/bin/bash
usuario="prueba1"
if id "$usuario" > /dev/null 2>&1; then
  echo "$usuario ya existe"
else
  useradd -m "$usuario"
  echo "$usuario creado"
fi
```

:::pregunta[¿Qué escribe cada ejecución?]
```text
prueba1 creado
prueba1 ya existe
```

La primera vez `id` falla (el usuario no existe) y se crea; la segunda ya existe y el script no hace nada. Sin la comprobación, la segunda ejecución daría el error `useradd: user 'prueba1' already exists`. Para deshacerlo: `sudo userdel -r prueba1` (puede avisar de que no encuentra el «mail spool» del usuario; es inofensivo).
:::

### 3. Contar intentos fallidos

Lee esta orden, con el fichero `autenticacion.log` de la teoría:

```bash
grep "Failed password" autenticacion.log | tr -s ' ' | cut -d' ' -f9 | sort | uniq -c
```

:::pregunta[¿Qué escribe en pantalla?]
```text
      3 ana
      1 luis
```

`grep` deja solo los intentos fallidos, `tr -s ' '` junta los espacios repetidos en uno, `cut` se queda con el campo 9 (el usuario), `sort` junta los repetidos y `uniq -c` cuenta cada uno. `marta` no sale porque su intento fue correcto. Los espacios del principio pueden variar de un sistema a otro.
:::

### 4. Un alta rota

Este script debería crear el usuario que recibe como argumento solo si no existe, y negarse a funcionar si no lo ejecuta `root`. Tiene dos fallos:

```bash
#!/bin/bash
usuario=$1
if id "$usuario" > /dev/null 2>&1; then
  useradd -m "$usuario"
  echo "$usuario creado"
fi
```

Con `sudo bash alta.sh prueba1` y el usuario sin crear no pasa nada, y si ya existe da un error pero escribe `prueba1 creado`.

:::pregunta[Escribe la versión corregida]
```bash
#!/bin/bash
if [ "$(id -u)" -ne 0 ]; then
  echo "Ejecuta este script con sudo" >&2
  exit 1
fi
usuario=$1
if id "$usuario" > /dev/null 2>&1; then
  echo "$usuario ya existe"
else
  useradd -m "$usuario"
  echo "$usuario creado"
fi
```

Los fallos: la condición está al revés (`id` tiene éxito cuando el usuario **ya existe**, así que `useradd` iba en el `else`), y faltaba comprobar que lo ejecuta `root`: `id -u` escribe `0` solo para `root`. Para deshacerlo: `sudo userdel -r prueba1`.
:::

### 5. Rellena los huecos: claves sin preguntar

Los usuarios `prueba1`, `prueba2` y `prueba3` ya existen. El fichero `claves.txt` contiene:

```text
prueba2:Clave2
prueba3:Clave3
```

Completa los huecos `_____` para poner la clave de `prueba1` con un `echo` y las de los otros dos desde el fichero:

```bash
#!/bin/bash
echo "prueba1:Abc123" _____ chpasswd
chpasswd _____ claves.txt
```

:::pregunta[Escribe el script completo]
```bash
#!/bin/bash
echo "prueba1:Abc123" | chpasswd
chpasswd < claves.txt
```

Se ejecuta con `sudo`. El `|` pasa el texto a `chpasswd` y `<` hace que lea del fichero. `chpasswd` no escribe nada si todo va bien. Para comprobarlo: `sudo grep '^prueba1:' /etc/shadow` muestra una clave cifrada. Las claves de estos ejercicios son de prueba: nunca escribas una clave real así, porque queda en el historial de la terminal. Para deshacerlo: `sudo userdel -r prueba1`, y lo mismo con `prueba2` y `prueba3`.
:::

### 6. Rellena los huecos: una línea por usuario

El fichero `claves.txt` contiene:

```text
prueba1:Abc123
prueba2:Clave2
prueba3:Clave3
```

Completa los huecos `_____` para que el script escriba el nombre de cada usuario:

```bash
#!/bin/bash
while IFS=: _____ -r usuario clave; do
  echo "Usuario: $usuario"
done _____ claves.txt
```

:::pregunta[Escribe el script completo]
```bash
#!/bin/bash
while IFS=: read -r usuario clave; do
  echo "Usuario: $usuario"
done < claves.txt
```

Escribe `Usuario: prueba1`, `Usuario: prueba2` y `Usuario: prueba3`. En cada vuelta, `read` separa la línea por `:` y deja el primer trozo en `usuario` y el segundo en `clave`. Este script no cambia nada en el sistema.
:::

### 7. Rellena los huecos: alta o baja

Completa los huecos `_____` para que el script cree el usuario con `alta`, lo borre con `baja` y termine con código 2 con cualquier otra acción:

```bash
#!/bin/bash
if [ $# -ne 2 ]; then
  echo "Uso: $0 alta|baja usuario" >&2
  exit 1
fi
case $1 in
  alta) useradd -m "$2" ;;
  baja) _____ -r "$2" ;;
  *)
    echo "Acción desconocida: $1" >&2
    _____ 2
    ;;
esac
```

:::pregunta[Escribe el script completo]
```bash
#!/bin/bash
if [ $# -ne 2 ]; then
  echo "Uso: $0 alta|baja usuario" >&2
  exit 1
fi
case $1 in
  alta) useradd -m "$2" ;;
  baja) userdel -r "$2" ;;
  *)
    echo "Acción desconocida: $1" >&2
    exit 2
    ;;
esac
```

Se ejecuta con `sudo`: `sudo bash accion.sh alta prueba1` crea el usuario y `sudo bash accion.sh baja prueba1` lo borra. Con `borrar` escribe el error y `echo $?` muestra `2`. Los dos códigos de salida distintos (1 y 2) permiten saber desde fuera qué ha fallado.
:::

### 8. Escríbelo tú: altas desde un fichero

Escribe un script `altas.sh` que reciba un fichero con líneas `usuario:clave` (como `claves.txt`) y, para cada línea, cree el usuario y le ponga la clave. Debe:

- terminar con código 1 y un aviso por la salida de errores si no lo ejecuta `root` o si no recibe exactamente un argumento;
- terminar con código 2 y un aviso si el fichero no se puede leer;
- no dar error si se ejecuta dos veces: si un usuario ya existe, escribe `usuario ya existe` y pasa al siguiente.

:::pregunta[Una solución posible]
```bash
#!/bin/bash
if [ "$(id -u)" -ne 0 ]; then
  echo "Ejecuta este script con sudo" >&2
  exit 1
fi
if [ $# -ne 1 ]; then
  echo "Uso: $0 fichero" >&2
  exit 1
fi
if [ ! -r "$1" ]; then
  echo "No puedo leer $1" >&2
  exit 2
fi
while IFS=: read -r usuario clave; do
  if id "$usuario" > /dev/null 2>&1; then
    echo "$usuario ya existe"
  else
    useradd -m "$usuario"
    echo "$usuario:$clave" | chpasswd
    echo "$usuario creado"
  fi
done < "$1"
```

La primera ejecución escribe `prueba1 creado`, `prueba2 creado` y `prueba3 creado`, y la segunda, tres `ya existe`. Las comprobaciones van antes del bucle para no hacer nada si algo falla. Ojo: `read` ignora una última línea que no termine en salto de línea, así que el fichero debe acabar con uno. Para deshacerlo: `sudo userdel -r` con cada usuario.
:::

### 9. Escríbelo tú: gestión de un usuario

Escribe un script `gestion.sh` que reciba una acción (`alta` o `baja`) y un nombre de usuario. Debe:

- terminar con código 1 y un aviso de uso por la salida de errores si no lo ejecuta `root` o si no recibe exactamente dos argumentos;
- con `alta`, crear el usuario y escribir `usuario creado`, o terminar con código 3 y un aviso si ya existe;
- con `baja`, borrarlo con su carpeta y escribir `usuario eliminado`, o terminar con código 3 y un aviso si no existe;
- con cualquier otra acción, terminar con código 2 y un aviso.

:::pregunta[Una solución posible]
```bash
#!/bin/bash
if [ "$(id -u)" -ne 0 ]; then
  echo "Ejecuta este script con sudo" >&2
  exit 1
fi
if [ $# -ne 2 ]; then
  echo "Uso: $0 alta|baja usuario" >&2
  exit 1
fi
case $1 in
  alta)
    if id "$2" > /dev/null 2>&1; then
      echo "$2 ya existe" >&2
      exit 3
    fi
    useradd -m "$2"
    echo "$2 creado"
    ;;
  baja)
    if ! id "$2" > /dev/null 2>&1; then
      echo "$2 no existe" >&2
      exit 3
    fi
    userdel -r "$2"
    echo "$2 eliminado"
    ;;
  *)
    echo "Acción desconocida: $1" >&2
    exit 2
    ;;
esac
```

Cada error tiene su propio código (1, 2 y 3), lo que permite que otro script sepa qué ha fallado con `$?`. La condición `! id ...` es cierta cuando el usuario **no** existe.
:::

### 10. Escríbelo tú: usuarios con demasiados fallos

Escribe un script `intentos.sh` que reciba un número (el umbral) y, de forma opcional, un fichero de registro, y escriba `Aviso: usuario, intentos: N` por cada usuario con N intentos fallidos o más. Si no recibe fichero, debe leer `/var/log/auth.log` si se puede leer y, si no, `journalctl -u ssh --no-pager`. Con ningún argumento o con más de dos, escribe el modo de uso por la salida de errores y termina con código 1.

La rama de `journalctl` puede necesitar `sudo` para leer el registro y el nombre de la unidad cambia según la distribución (`ssh` o `sshd`). Para probarlo sin intentos reales, guarda las líneas de ejemplo de la teoría en `autenticacion.log` y ejecuta `bash intentos.sh 2 autenticacion.log`: debe avisar solo de `ana`.

:::pregunta[Una solución posible]
```bash
#!/bin/bash
if [ $# -lt 1 ] || [ $# -gt 2 ]; then
  echo "Uso: $0 umbral [fichero]" >&2
  exit 1
fi
if [ $# -eq 2 ]; then
  registro=$(cat "$2")
elif [ -r /var/log/auth.log ]; then
  registro=$(cat /var/log/auth.log)
else
  registro=$(journalctl -u ssh --no-pager)
fi
echo "$registro" | grep "Failed password" | tr -s ' ' | cut -d' ' -f9 | sort | uniq -c | while read -r veces usuario; do
  if [ "$veces" -ge "$1" ]; then
    echo "Aviso: $usuario, intentos: $veces"
  fi
done
```

Con el umbral `2` escribe `Aviso: ana, intentos: 3`, y con `1`, además `Aviso: luis, intentos: 1`. `$(...)` guarda el registro entero en una variable, venga de donde venga, y `tr -s ' '` evita que los días de un solo dígito desplacen los campos. `read -r veces usuario` quita los espacios del principio que pone `uniq -c`. En una línea con `invalid user pepe` el campo 9 es `invalid`; se pueden descartar antes con `grep -v "invalid user"`.
:::

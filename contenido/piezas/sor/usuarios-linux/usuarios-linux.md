---
titulo: "Linux: usuarios, permisos y acceso remoto"
licencia: CC-BY-NC-SA-4.0
---

Este es tu material de estudio del bloque. Está escrito para que lo puedas leer con calma y entender no solo *qué* comando se usa, sino *por qué* Linux funciona así. En el bloque 2 viste cómo se organizan las cuentas en un dominio de Windows. Ahora vas a ver el mismo problema desde el otro lado: cómo gestiona Linux a las personas que usan una máquina, qué puede hacer cada una y cómo se conectan a ella desde fuera.

Trabajaremos con **Ubuntu Server**, pero casi todo lo que veas sirve igual en cualquier distribución. Y es una base importante: en el bloque 4 vas a llevar estas mismas cuentas a un directorio centralizado con LDAP, y entenderás mucho mejor lo que ocurre si antes dominas lo que hay en una sola máquina.

# Qué vas a aprender

Al terminar el bloque deberías ser capaz de:

- Explicar el modelo multiusuario de Linux: usuarios, grupos, UID, GID y root.
- Saber dónde guarda Linux las cuentas y por qué las contraseñas están en un archivo aparte.
- Crear, modificar y eliminar usuarios y grupos, y distinguir el grupo primario de los secundarios.
- Controlar el entorno de un usuario: su directorio personal, su intérprete de comandos y sus variables.
- Gestionar contraseñas y cuentas: caducidad, bloqueo, calidad de las contraseñas y bloqueo tras intentos fallidos.
- Leer y cambiar permisos de archivos y directorios, incluidos los permisos especiales.
- Dar a un usuario privilegios de administrador de forma controlada con `sudo`.
- Configurar el acceso por SSH con claves públicas y restringir quién puede entrar.
- Revisar quién ha entrado en el sistema, cuándo y qué ha intentado hacer.

:::nota
Las ACL (permisos más finos que los de usuario, grupo y otros) las verás en el bloque 5, junto a los recursos compartidos. LDAP y PAM en profundidad son del bloque 4.
:::

# 1. El modelo multiusuario de Linux

Linux nació pensado para que **varias personas usen la misma máquina a la vez**, cada una con sus archivos y sus límites. Eso lo diferencia de la idea de "mi ordenador, mis cosas" a la que estás acostumbrado, y explica casi todo lo que viene después.

## Usuarios, grupos y root

- Un **usuario** es una identidad con la que se ejecuta cualquier cosa en el sistema. Puede ser una persona, pero también un programa. Todo proceso que corre en Linux lo hace "en nombre de" algún usuario.
- Un **grupo** es un conjunto de usuarios. Sirve para dar el mismo permiso a varios de golpe, igual que los grupos de Active Directory.
- **root** es el usuario administrador. Puede hacer absolutamente todo: leer cualquier archivo, borrar cualquier cosa, matar cualquier proceso. Para Linux no hay nada que le esté prohibido.

## UID y GID

Por dentro, Linux no usa nombres, sino números. Cada usuario tiene un **UID** (*user ID*) y cada grupo un **GID** (*group ID*). El nombre `andrea` es solo una etiqueta cómoda para las personas; el sistema trabaja con el número.

Los números se reparten por rangos. En Ubuntu y Debian:

| UID | Quién es |
| --- | --- |
| 0 | `root` |
| 1 – 999 | Cuentas de sistema y de servicio |
| 1000 en adelante | Personas: los usuarios "normales" |
| 65534 | `nobody`, una cuenta sin privilegios para casos especiales |

## Tipos de cuentas

Con esos rangos salen tres tipos de cuentas:

- **Cuentas de persona:** las de los usuarios reales. Tienen directorio personal, contraseña y un intérprete de comandos.
- **Cuentas de servicio:** las usan programas. El servidor web corre con su propio usuario, el servidor de correo con el suyo... No están pensadas para que nadie inicie sesión con ellas.
- **Cuentas de sistema:** las que crea el propio sistema para sus tareas internas.

¿Por qué separar los servicios en usuarios distintos? Por seguridad. Si un atacante consigue colarse en el servidor web, solo tendrá los permisos de **ese** usuario, y no los de root. Es la idea del mínimo privilegio: cada cosa con lo justo para hacer su trabajo.

:::tip
Con el comando `id` puedes ver tu UID, tu GID y todos los grupos a los que perteneces. Es lo primero que se mira cuando algo "no tiene permiso" y no se entiende por qué.
:::

:::nota[En resumen]
Linux es multiusuario por diseño. Cada usuario y grupo se identifica internamente con un número (UID y GID). Root es el administrador absoluto, las personas empiezan en el UID 1000, y los servicios corren con sus propias cuentas para limitar el daño si algo falla.
:::

:::pregunta[¿Por qué las cuentas de servicio tienen su propio usuario en vez de ejecutarse como root?]
Por el mínimo privilegio. Si un atacante compromete el servicio, solo tendrá los permisos de ese usuario y no los de root.
:::

# 2. Dónde guarda Linux las cuentas

En Windows las cuentas viven en una base de datos que no se edita a mano. En Linux, tres archivos de texto plano guardan lo esencial. Puedes abrirlos con cualquier editor, y por eso conviene que entiendas qué contiene cada campo.

## `/etc/passwd`

Tiene una línea por cada usuario, con siete campos separados por dos puntos:

```
andrea:x:1001:1001:Andrea Windrose:/home/andrea:/bin/bash
```

| Campo | Ejemplo | Qué significa |
| --- | --- | --- |
| 1 | `andrea` | Nombre de usuario |
| 2 | `x` | Antes aquí estaba la contraseña. Ahora una `x` indica que está en `/etc/shadow` |
| 3 | `1001` | UID |
| 4 | `1001` | GID del grupo primario |
| 5 | `Andrea Windrose` | Comentario: normalmente el nombre completo |
| 6 | `/home/andrea` | Directorio personal |
| 7 | `/bin/bash` | Intérprete de comandos que se abre al entrar |

## `/etc/shadow`

Aquí están las contraseñas, **cifradas** (en realidad, un *hash*: una huella que no se puede deshacer), junto con la información de caducidad:

```
andrea:$y$j9T$...:19650:0:90:7:14::
```

Los campos, en orden, son: nombre, hash de la contraseña, día del último cambio (contado en días desde 1970), mínimo de días entre cambios, máximo de días de validez, días de aviso antes de que caduque, días de gracia después de caducar, fecha en la que se desactiva la cuenta y un campo reservado.

Si en el campo del hash aparece un `!` o un `*`, significa que **no se puede entrar con contraseña** en esa cuenta. Es lo normal en las cuentas de servicio, o en una cuenta bloqueada.

## `/etc/group`

Una línea por grupo:

```
orquesta:x:1100:andrea,luis
```

Son el nombre del grupo, una `x`, el GID y la lista de miembros **secundarios**. Existe además `/etc/gshadow` para las contraseñas de grupo, que casi nunca se usan.

## ¿Por qué están las contraseñas en un archivo aparte?

Históricamente las contraseñas iban dentro de `/etc/passwd`. Pero ese archivo tiene que ser **legible por todos**: cualquier programa necesita saber, por ejemplo, a qué usuario pertenece el UID 1001 para mostrar el nombre. Y si todo el mundo puede leer el archivo, todo el mundo puede copiar los hashes y probar a romperlos tranquilamente en su propio ordenador.

La solución fue mover los hashes a `/etc/shadow`, que solo puede leer root. Así, `passwd` queda legible para todos pero ya no contiene nada secreto.

:::aviso
Aunque los archivos se pueden editar a mano, **no lo hagas**: un error de una coma puede dejar sin acceso a todos los usuarios. Usa los comandos de la siguiente sección, que comprueban lo que haces. Si tienes que editarlos de verdad, existe `vipw`, que bloquea el archivo mientras lo tocas.
:::

:::tip
Para consultar usuarios y grupos, mejor `getent passwd andrea` o `getent group orquesta`. Preguntan al sistema, no al archivo, así que seguirán funcionando cuando en el bloque 4 las cuentas vengan de un servidor LDAP.
:::

:::nota[En resumen]
`/etc/passwd` guarda los usuarios, `/etc/group` los grupos y `/etc/shadow` los hashes de contraseña y su caducidad. Las contraseñas están separadas porque `passwd` debe ser legible por todos, y `shadow` solo por root.
:::

:::pregunta[¿Qué guarda cada campo de una línea de `/etc/passwd`?]
Siete campos separados por dos puntos: nombre de usuario, una `x` (la contraseña está en `/etc/shadow`), UID, GID del grupo primario, comentario (normalmente el nombre completo), directorio personal e intérprete de comandos.
:::

:::pregunta[¿Por qué las contraseñas no están en `/etc/passwd`?]
Porque ese archivo debe ser legible por todos, y así cualquiera podría copiar los hashes y atacarlos tranquilamente. Por eso están en `/etc/shadow`, que solo puede leer root.
:::

# 3. Crear y gestionar usuarios y grupos

## Crear un usuario

Hay dos comandos que parecen hacer lo mismo y no lo son:

- `useradd` es la herramienta de bajo nivel. Hace lo que le dices y nada más: si no le pides crear el directorio personal (`-m`), no lo crea.
- `adduser` es un asistente más amable (en Debian y Ubuntu). Crea el directorio, copia los archivos iniciales y te pregunta por la contraseña.

```bash
sudo adduser andrea                       # asistente interactivo
sudo useradd -m -s /bin/bash -c "Luis Gómez" luis   # a mano
sudo passwd luis                       # ponerle contraseña
```

:::tip
Para ir aprendiendo, usa `adduser` en el día a día. Para scripts, `useradd`, porque se comporta siempre igual y no hace preguntas.
:::

## Modificar y borrar

```bash
sudo usermod -s /bin/zsh andrea          # cambiar el intérprete
sudo usermod -aG orquesta andrea         # añadir a un grupo secundario
sudo userdel luis                     # borrar el usuario, deja su directorio
sudo userdel -r luis                  # borrar también su directorio personal
```

:::aviso
En `usermod -aG`, la **`-a` es crucial**. Sin ella (`usermod -G orquesta andrea`), el usuario pasa a estar *solo* en ese grupo y se le quitan todos los demás. Es uno de los errores más comunes, y puede dejar a alguien sin acceso a `sudo`.
:::

## Grupos

```bash
sudo groupadd orquesta                # crear un grupo
sudo gpasswd -a andrea orquesta          # añadir a andrea al grupo
sudo gpasswd -d andrea orquesta          # quitarla
sudo groupdel orquesta                # borrar el grupo
```

## Grupo primario y grupos secundarios

Todo usuario tiene:

- Un **grupo primario**, el que figura en `/etc/passwd`. Es el grupo que se asigna a los archivos que crea. En Ubuntu, al crear un usuario se crea también un grupo con su mismo nombre.
- Cero o más **grupos secundarios**, los que aparecen en `/etc/group`. Dan acceso a recursos compartidos.

Los cambios de pertenencia a grupos **no afectan a sesiones ya abiertas**. Si añades a Andrea a un grupo mientras tiene una sesión abierta, tendrá que cerrarla y volver a entrar para que lo note.

## Cómo comprobar lo que has hecho

```bash
id andrea            # UID, GID y grupos
groups andrea        # solo los grupos
getent passwd andrea # su línea de passwd
```

:::nota[En resumen]
`adduser` es el asistente amable y `useradd` la herramienta precisa. Con `usermod -aG` se añade a grupos secundarios (sin olvidar la `-a`). Cada usuario tiene un grupo primario, que marca el grupo de lo que crea, y los secundarios, que le dan acceso a recursos.
:::

:::pregunta[Ejecutas `usermod -G proyecto andrea` y Andrea pierde el acceso a `sudo`. ¿Qué ha pasado y cómo se evita?]
Sin la opción `-a`, `usermod -G` sustituye todos los grupos secundarios de Andrea por `proyecto`, y se le quita también el grupo `sudo`. Se evita con `usermod -aG proyecto andrea`, que añade sin quitar.
:::

:::pregunta[¿Qué diferencia hay entre `useradd` y `adduser`?]
`useradd` es la herramienta de bajo nivel y hace solo lo que se le indica (no crea el directorio personal sin `-m`). `adduser` es un asistente de Debian y Ubuntu que crea el directorio, copia `/etc/skel` y pide la contraseña.
:::

# 4. El entorno del usuario

Cuando alguien inicia sesión, el sistema le prepara un "espacio de trabajo". Conviene que sepas qué lo forma.

## Directorio personal y `/etc/skel`

Cada usuario de persona tiene un **directorio personal** (*home*), normalmente `/home/nombre`, donde guarda sus cosas y su configuración. Al crear la cuenta con `adduser` o `useradd -m`, el sistema copia en él el contenido de `/etc/skel` ("esqueleto"): una carpeta con los archivos iniciales que recibirá todo usuario nuevo, como `.bashrc` o `.profile`.

Esto es útil: si quieres que todos tus usuarios nuevos tengan un mismo archivo de bienvenida o una carpeta ya creada, lo pones en `/etc/skel` y se copiará solo.

## El intérprete de comandos

El último campo de `/etc/passwd` es el intérprete (*shell*) que se abre al entrar. Casi siempre es `/bin/bash`. Pero también puede ser:

- `/usr/sbin/nologin`: la cuenta existe pero **no puede abrir una sesión**. Es lo que llevan las cuentas de servicio.
- `/bin/false`: parecido; sale inmediatamente.

Eso permite, por ejemplo, tener un usuario que posee archivos o ejecuta un servicio pero con el que nadie puede entrar al sistema.

## Archivos de configuración y variables de entorno

Dos archivos del directorio personal configuran la sesión:

- `~/.profile`: se lee cuando inicias una **sesión de inicio** (al entrar por SSH, por ejemplo).
- `~/.bashrc`: se lee cada vez que abres una terminal interactiva.

Ahí se definen cosas como alias (`alias ll='ls -l'`) o **variables de entorno**: valores que los programas pueden consultar. Algunas importantes:

| Variable | Qué contiene |
| --- | --- |
| `HOME` | El directorio personal |
| `USER` | El nombre del usuario |
| `SHELL` | Su intérprete |
| `PATH` | Lista de carpetas donde se buscan los comandos |

Para crear una variable que heredan los programas que lances, se usa `export`:

```bash
export EDITOR=nano
echo $PATH
```

:::nota
Los valores por defecto al crear usuarios (intérprete, rango de UID, caducidad de contraseña...) están en `/etc/adduser.conf`, `/etc/default/useradd` y `/etc/login.defs`. Si quieres cambiar cómo se crean *todos* los usuarios nuevos, ahí es donde se toca.
:::

:::nota[En resumen]
Cada persona tiene un directorio personal que se rellena a partir de `/etc/skel`, un intérprete que define cómo entra (o `nologin` si no debe entrar) y archivos como `.profile` y `.bashrc` donde se configuran sus variables de entorno.
:::

# 5. Contraseñas y cuentas

Tener cuentas es fácil. Lo difícil es mantenerlas seguras: contraseñas que no se adivinen, que caduquen, y cuentas que se puedan bloquear rápidamente si algo huele raro.

## Caducidad de contraseñas con `chage`

`chage` (de *change age*) gestiona la información de caducidad que viste en `/etc/shadow`:

```bash
sudo chage -l andrea              # ver el estado de la cuenta
sudo chage -M 90 andrea           # la contraseña caduca a los 90 días
sudo chage -m 1 andrea            # no se puede cambiar más de una vez al día
sudo chage -W 7 andrea            # avisar 7 días antes de que caduque
sudo chage -d 0 andrea            # obligar a cambiarla en el próximo inicio de sesión
sudo chage -E 2026-12-31 andrea   # la cuenta deja de funcionar en esa fecha
```

## Bloquear y desbloquear una cuenta

Hay varias maneras y **no son equivalentes**:

| Qué quieres | Comando | Cómo funciona |
| --- | --- | --- |
| Bloquear la contraseña | `sudo passwd -l andrea` (o `usermod -L`) | Pone un `!` delante del hash. Ya no sirve la contraseña |
| Desbloquearla | `sudo passwd -u andrea` | Quita el `!` |
| Desactivar la cuenta entera | `sudo chage -E 0 andrea` | Marca la cuenta como caducada. No entra nadie, ni con contraseña ni con clave |
| Impedir que abra sesión | `sudo usermod -s /usr/sbin/nologin andrea` | Le quita el intérprete |

:::aviso
Esta es una trampa clásica: `passwd -l` bloquea **solo la contraseña**. Si ese usuario tiene una clave SSH autorizada, **seguirá pudiendo entrar con la clave**. Para cortar el acceso del todo, usa `chage -E 0`, y mata las sesiones que tenga abiertas.
:::

## Calidad de las contraseñas

Linux gestiona las contraseñas con **PAM**, un sistema de módulos que se engancha a los programas que autentican (`login`, `ssh`, `sudo`...) y que decide si se deja pasar o no. En el bloque 4 verás cómo funciona por dentro; aquí basta con saber que sus módulos se pueden configurar.

El módulo **`pwquality`** exige que las contraseñas nuevas sean razonables. Se instala con el paquete `libpam-pwquality` y se configura en `/etc/security/pwquality.conf`:

```
minlen = 12        # longitud mínima
minclass = 3       # mínimo de tipos de carácter distintos (minúsculas, mayúsculas, números, símbolos)
```

Ten en cuenta que, por defecto, `minlen` vale 8 y `minclass` vale 0 (sin exigencia), y que **root no queda sujeto a estas reglas**: si cambia una contraseña, el sistema solo avisa. Por eso las pruebas se hacen con un usuario normal.

Otro módulo, **`pwhistory`**, recuerda las últimas contraseñas para que no se repitan.

## Bloqueo por intentos fallidos

Si alguien está probando contraseñas contra una cuenta, lo ideal es que el sistema se bloquee solo tras unos cuantos fallos. De eso se encarga **`pam_faillock`**, configurado en `/etc/security/faillock.conf`:

```
deny = 5            # bloquear tras 5 fallos seguidos
unlock_time = 900   # desbloqueo automático tras 900 segundos
```

Con `faillock --user andrea` ves los intentos fallidos de una cuenta, y con `faillock --user andrea --reset` la desbloqueas a mano. Hay que activar el módulo en la configuración de PAM para que funcione.

:::nota
Otra herramienta muy usada contra los intentos repetidos por SSH es **fail2ban**. Lee el registro de autenticación y bloquea durante un tiempo la dirección IP de quien falla demasiadas veces. Se verá solo de pasada.
:::

:::tip
Cuando sospeches que una cuenta está comprometida, el orden es: 1) desactívala (`chage -E 0`), 2) cierra sus sesiones, 3) revisa qué ha hecho (sección 10), 4) cambia credenciales y claves, 5) vuelve a activarla.
:::

:::nota[En resumen]
`chage` controla la caducidad de contraseñas y cuentas. `passwd -l` bloquea solo la contraseña; para cortar del todo hay que usar `chage -E 0`. `pwquality` exige contraseñas decentes y `pam_faillock` bloquea las cuentas tras varios intentos fallidos.
:::

:::pregunta[Has bloqueado a un usuario con `passwd -l`, pero sigue entrando por SSH. ¿Por qué y qué harías?]
`passwd -l` bloquea solo la contraseña, y el usuario puede tener una clave pública autorizada con la que seguir entrando. Para cortar el acceso del todo se usa `chage -E 0` y se cierran sus sesiones abiertas.
:::

:::pregunta[¿Cómo evitarías que una cuenta sufra un ataque de adivinación de contraseñas por SSH?]
Con `pam_faillock`, que bloquea la cuenta tras un número de fallos seguidos, o con fail2ban, que bloquea la IP de quien falla demasiado. Mejor aún, desactivando las contraseñas en `sshd_config` y usando solo claves públicas.
:::

# 6. Permisos de archivos

Este es probablemente el tema más importante del bloque, porque cada vez que algo en Linux "no funciona", la causa suele ser un permiso.

## Lectura de los permisos

Al listar con `ls -l` ves algo así:

```
-rwxr-x--- 1 andrea orquesta 2048 oct 12 10:00 partitura.txt
```

El primer bloque de diez caracteres se lee así:

```
-   rwx   r-x   ---
│    │     │     └─ otros: sin permisos
│    │     └─────── grupo: puede leer y ejecutar
│    └───────────── propietario: puede leer, escribir y ejecutar
└────────────────── tipo: "-" archivo, "d" directorio, "l" enlace
```

Después van el **propietario** (`andrea`) y el **grupo** (`orquesta`). Cada archivo pertenece a un usuario y a un grupo, y los permisos se dividen en tres bloques: para el **propietario** (*user*, `u`), para el **grupo** (*group*, `g`) y para **todos los demás** (*others*, `o`).

Cada bloque tiene tres permisos posibles: lectura (`r`), escritura (`w`) y ejecución (`x`). Y su significado cambia según sea un archivo o un directorio:

| Permiso | En un archivo | En un directorio |
| --- | --- | --- |
| `r` | Leer su contenido | Listar lo que contiene |
| `w` | Modificarlo | Crear, borrar y renombrar archivos dentro |
| `x` | Ejecutarlo como programa | **Entrar** en él (atravesarlo) |

:::aviso
Sobre directorios, dos cosas que sorprenden. Sin `x`, no puedes entrar aunque tengas `r`. Y con `w` en un directorio puedes **borrar archivos que no son tuyos**, aunque tú no puedas leerlos. Lo que importa para borrar es el permiso sobre el directorio, no sobre el archivo.
:::

## `chmod`: cambiar permisos

Se puede hacer de dos maneras.

**Modo simbólico:** dices a quién y qué cambias.

```bash
chmod u+x script.sh        # el propietario puede ejecutarlo
chmod g-w datos.txt        # el grupo ya no puede escribir
chmod o= datos.txt         # los demás, sin ningún permiso
chmod u=rwx,g=rx,o= carpeta
```

**Modo octal:** cada permiso vale un número (`r`=4, `w`=2, `x`=1) y se suman. Así, tres cifras dan los permisos de propietario, grupo y otros:

| Octal | Significa | Cuándo se usa |
| --- | --- | --- |
| `7` | rwx | Control total |
| `6` | rw- | Leer y escribir |
| `5` | r-x | Leer y entrar o ejecutar |
| `4` | r-- | Solo leer |
| `0` | --- | Nada |

Por ejemplo, `chmod 750 carpeta` da rwx al propietario, r-x al grupo y nada al resto. Y `chmod 644 archivo` es lo habitual para un archivo normal: el propietario lo modifica, el resto lo lee.

Con `-R` se aplica de forma recursiva a todo el contenido.

## `chown` y `chgrp`: cambiar propietario y grupo

```bash
sudo chown andrea archivo              # nuevo propietario
sudo chown andrea:orquesta archivo     # propietario y grupo a la vez
sudo chgrp orquesta archivo         # solo el grupo
sudo chown -R andrea:orquesta carpeta  # recursivo
```

Solo root puede cambiar el propietario de un archivo. Un usuario normal puede cambiar el grupo, pero solo a uno al que pertenezca.

## `umask`: permisos por defecto

Cuando creas un archivo nuevo, ¿quién decide sus permisos? La **umask**, que indica qué permisos se *quitan* a los que pondría el sistema por defecto (666 para archivos y 777 para directorios).

Con `umask 022`, los archivos nuevos quedan en `644` y los directorios en `755`. Con `umask 002`, en `664` y `775`. Ubuntu usa `002` para los usuarios con grupo propio, algo que viene bien cuando se trabaja en grupo, porque lo que crea uno puede ser editado por el grupo.

:::tip
Cuando un permiso falla, comprueba tres cosas por este orden: 1) los permisos de **todos los directorios del camino** (necesitas `x` en cada uno), 2) los permisos del propio archivo, 3) tu usuario y tus grupos (`id`).
:::

:::nota[En resumen]
Cada archivo tiene propietario, grupo y tres bloques de permisos (`rwx` para propietario, grupo y otros). En directorios, `x` significa poder entrar y `w` poder crear y borrar. Se cambian con `chmod` (simbólico u octal), `chown` y `chgrp`, y la `umask` decide los permisos por defecto de lo nuevo.
:::

:::pregunta[¿Qué permisos tiene un archivo con `chmod 640` y quién puede hacer qué?]
El propietario puede leer y escribir (6), el grupo solo leer (4) y los demás no pueden hacer nada (0).
:::

:::pregunta[Para entrar en un directorio y listar su contenido, ¿qué permisos hacen falta?]
`x` para poder atravesarlo y `r` para listar lo que contiene. Además hace falta `x` en todos los directorios del camino.
:::

# 7. Permisos especiales

Además de `rwx`, hay tres permisos que modifican el comportamiento de un archivo o directorio. Aparecen como un cuarto dígito delante de los tres habituales en el modo octal.

## SGID en directorios

Cuando un directorio tiene el bit **SGID** (*set group ID*, valor `2`), todo lo que se crea dentro **hereda el grupo del directorio** en vez del grupo primario de quien lo creó.

Es la pieza clave para las carpetas de trabajo en grupo. Sin SGID, si Andrea crea un archivo en una carpeta compartida, el archivo se queda con *su* grupo primario (`andrea`), y el resto del equipo no podrá tocarlo. Con SGID, el archivo se queda con el grupo de la carpeta, y todo el equipo puede trabajar sobre él.

```bash
sudo mkdir /srv/proyecto
sudo chown root:equipo /srv/proyecto
sudo chmod 2775 /srv/proyecto
```

En el listado se reconoce por una `s` en el bloque del grupo (`drwxrwsr-x`).

## Sticky bit

El **sticky bit** (valor `1`) se pone en directorios. Su efecto: aunque todos puedan escribir en el directorio, **cada uno solo puede borrar o renombrar sus propios archivos**.

El ejemplo más conocido es `/tmp`, donde todos los usuarios escriben, pero nadie puede borrar el archivo temporal de otro. Aparece como una `t` al final (`drwxrwxrwt`).

Combinándolo con lo anterior, se consigue algo muy habitual: una carpeta donde **todo el mundo ve lo de todos, pero cada uno solo modifica lo suyo**. Para ello:

1. La carpeta pertenece a un grupo común al que pertenecen todos los usuarios, y tiene SGID, para que lo nuevo herede ese grupo.
2. Los archivos se crean con permisos `644` (el propietario escribe, el grupo y los demás solo leen). Si tu umask es `002`, los archivos nacen como `664` y el grupo podría editarlos, así que hay que usar `umask 022` o ajustarlos con `chmod`.
3. El sticky bit evita que alguien borre o renombre archivos ajenos, que es lo que permitiría el `w` sobre la carpeta.

```bash
sudo chmod 3775 /srv/compartida     # SGID + sticky + rwxrwxr-x
```

## SUID

El bit **SUID** (*set user ID*, valor `4`) se pone en archivos ejecutables, y hace que el programa se ejecute con los permisos de su **propietario**, no con los de quien lo lanza.

El ejemplo clásico es el comando `passwd`. Un usuario normal necesita poder cambiar su contraseña, que está en `/etc/shadow`, un archivo que solo puede modificar root. Por eso `passwd` pertenece a root y tiene SUID: mientras se ejecuta, tiene permisos de root, pero solo para hacer esa tarea concreta. Se reconoce por una `s` en el bloque del propietario (`-rwsr-xr-x`).

Es una herramienta delicada: un programa con SUID mal escrito es una vía directa para convertirse en root. Por eso no se debe usar a la ligera, y los administradores revisan periódicamente qué archivos lo tienen.

```bash
find / -perm -4000 -type f 2>/dev/null     # buscar archivos con SUID
```

## Resumen de valores

| Bit | Valor | Se aplica a | Efecto |
| --- | --- | --- | --- |
| SUID | 4 | Archivos ejecutables | Se ejecuta con los permisos del propietario |
| SGID | 2 | Directorios | Lo nuevo hereda el grupo del directorio |
| Sticky | 1 | Directorios | Solo el propietario puede borrar sus archivos |

:::nota[En resumen]
SGID en un directorio hace que lo nuevo herede su grupo: es la base de las carpetas de grupo. El sticky bit impide borrar archivos ajenos, como en `/tmp`. SUID hace que un programa se ejecute con los permisos de su dueño, y hay que usarlo con mucho cuidado.
:::

:::pregunta[Un equipo comparte una carpeta, pero los archivos que crea cada miembro no los pueden editar los demás. ¿Cómo lo arreglas?]
Se asigna la carpeta a un grupo común y se activa el bit SGID (`chmod 2775`) para que lo nuevo herede el grupo de la carpeta. Además, la umask de los usuarios debe dar permiso de escritura al grupo (por ejemplo `002`).
:::

:::pregunta[¿Para qué sirve el sticky bit y dónde lo has visto?]
Para que, en un directorio donde todos pueden escribir, cada uno solo pueda borrar o renombrar sus propios archivos. Se ve en `/tmp`.
:::

:::pregunta[¿Por qué `passwd` tiene el bit SUID?]
Porque cualquier usuario debe poder cambiar su contraseña, que está en `/etc/shadow`, un archivo que solo puede modificar root. Con SUID el programa se ejecuta con los permisos de root, pero solo para esa tarea concreta.
:::

# 8. Elevar privilegios: `su` y `sudo`

Trabajar siempre como root es una mala idea: un error de teclado (`rm -rf` en el sitio equivocado) o un programa malicioso lo pueden destrozar todo. Lo sensato es usar tu usuario normal y **subir de privilegios solo cuando hace falta**.

## `su` y `sudo`

- **`su`** (*switch user*) te cambia a otro usuario, normalmente root, y para eso necesitas **su contraseña**. Tendrías que compartir la contraseña de root con todos los administradores.
- **`sudo`** ejecuta **un solo comando** como otro usuario (por defecto, root), y te pide **tu propia contraseña**, no la de root. Así no se comparte nada, y cada vez que alguien usa `sudo` queda apuntado en el registro.

Por eso, en Ubuntu, la cuenta de root viene con la contraseña bloqueada, y la administración se hace con `sudo`. El grupo `sudo` de Ubuntu es el que da ese permiso: quien pertenece a él, puede usarlo.

```bash
sudo usermod -aG sudo andrea     # andrea pasa a ser administradora
sudo -l                       # ver qué puedo hacer con sudo
```

## El archivo `sudoers`

Las reglas de `sudo` están en `/etc/sudoers` y en los archivos de `/etc/sudoers.d/`. Cada línea sigue este esquema:

```
quién   desde_dónde=(como_quién)   qué_comandos
```

Algunos ejemplos:

```
andrea     ALL=(ALL:ALL) ALL                       # andrea puede ejecutar cualquier cosa como cualquiera
%sudo   ALL=(ALL:ALL) ALL                       # el grupo sudo (el % indica un grupo)
%soporte ALL=(root) /usr/bin/systemctl restart ssh   # el grupo soporte, solo este comando
```

:::aviso
**Nunca edites `/etc/sudoers` con un editor normal.** Un error de sintaxis y `sudo` deja de funcionar para todos, y puedes quedarte sin forma de ser administrador. Usa siempre **`visudo`**, que comprueba el archivo antes de guardarlo. Para reglas propias, crea un archivo dentro de `/etc/sudoers.d/` con `sudo visudo -f /etc/sudoers.d/soporte`.
:::

## Delegar solo lo necesario

La gran potencia de `sudoers` es que permite el **mínimo privilegio**: no hace falta convertir a alguien en administrador para que haga una tarea concreta. Se puede dar a un grupo el permiso de ejecutar *solo* ciertos comandos, como reiniciar un servicio o ver un registro, y nada más. Es el equivalente en Linux a la delegación de control del bloque 2.

Un detalle: la opción `NOPASSWD` permite ejecutar comandos sin pedir contraseña. Es cómoda para scripts automáticos, pero muy peligrosa si se da a personas, porque cualquiera que se siente en una sesión abierta tendría acceso total.

:::nota[En resumen]
`su` cambia de usuario con la contraseña de ese usuario; `sudo` ejecuta un comando con tu propia contraseña y deja constancia en el registro. Las reglas están en `sudoers`, que siempre se edita con `visudo`, y permiten delegar comandos concretos a grupos concretos.
:::

:::pregunta[¿Por qué se edita `sudoers` con `visudo`?]
Porque `visudo` comprueba la sintaxis antes de guardar. Un error en `sudoers` puede dejar `sudo` inutilizable para todos y sin forma de ser administrador.
:::

:::pregunta[¿Cómo permitirías a un grupo reiniciar el servicio SSH sin darle acceso de administrador?]
Con una regla en `sudoers` que le permita solo ese comando, creada con `visudo`:

```
%soporte ALL=(root) /usr/bin/systemctl restart ssh
```
:::

# 9. Acceso remoto por SSH

Casi ningún servidor Linux tiene pantalla ni teclado. Se administra a distancia mediante **[SSH](https://es.wikipedia.org/wiki/Secure_Shell)** (*Secure Shell*): una conexión cifrada que te da una terminal en la máquina remota. Escucha por defecto en el puerto 22.

## Instalar y conectar

```bash
sudo apt install openssh-server       # en el servidor
sudo systemctl status ssh             # comprobar que funciona

ssh andrea@192.168.50.30                 # desde el cliente
```

La primera vez que te conectas, el cliente te enseña la **huella** (*fingerprint*) del servidor y te pregunta si confías. Al aceptar, la guarda en `~/.ssh/known_hosts`. Si más adelante cambia (porque se ha reinstalado el servidor... o porque alguien se está haciendo pasar por él), el cliente te avisará con una advertencia muy visible. No la ignores sin comprobar por qué.

## Autenticación por clave pública

Con la contraseña, cualquiera que la adivine entra. Una alternativa mucho más segura es usar un **par de claves**:

- La **clave privada** se queda en tu equipo y no la compartes con nadie nunca.
- La **clave pública** se copia en el servidor, y es inofensiva por sí sola.

Cuando te conectas, el servidor te plantea un reto que solo puede resolver quien tenga la clave privada que corresponde a la pública que él tiene guardada. Tu contraseña nunca viaja por la red, y no se puede adivinar por fuerza bruta.

```bash
ssh-keygen -t ed25519                 # crear el par de claves (en el cliente)
ssh-copy-id andrea@192.168.50.30         # copiar la pública al servidor
ssh andrea@192.168.50.30                 # ahora entra sin contraseña
```

La clave pública se guarda en el servidor, en el archivo `~/.ssh/authorized_keys` del usuario. Los permisos importan: SSH rechaza las claves si el directorio `~/.ssh` y ese archivo son accesibles por otros (deben ser `700` y `600`).

:::tip
Protege tu clave privada con una **frase de contraseña** (*passphrase*). Si alguien copia tu archivo, no podrá usarlo sin ella.
:::

## Configurar el servidor: `sshd_config`

La configuración del servidor está en `/etc/ssh/sshd_config`. Estas son las opciones que más se tocan:

| Opción | Efecto |
| --- | --- |
| `PermitRootLogin no` | Nadie puede entrar directamente como root |
| `PasswordAuthentication no` | Solo se permiten claves, no contraseñas |
| `AllowUsers andrea luis` | Solo esos usuarios pueden entrar por SSH |
| `AllowGroups sshusers` | Solo los miembros de ese grupo |
| `Port 2222` | Cambia el puerto (reduce el ruido de escaneos automáticos, pero no es seguridad real) |

Tras cambiar algo, comprueba la sintaxis y recarga el servicio:

```bash
sudo sshd -t                  # comprobar la configuración
sudo systemctl reload ssh
```

:::aviso
Antes de desactivar las contraseñas o limitar usuarios, **deja una sesión SSH abierta** y prueba desde una segunda. Si te equivocas, la primera te permitirá corregirlo. Si la cierras antes de comprobar, puedes quedarte fuera del servidor.
:::

## Copiar archivos

Sobre la misma conexión se pueden transferir archivos con `scp` o `sftp`:

```bash
scp informe.txt andrea@192.168.50.30:/home/andrea/
```

:::nota[En resumen]
SSH da una terminal remota cifrada por el puerto 22. Lo más seguro es autenticarse con un par de claves: la privada se queda contigo y la pública va al `authorized_keys` del servidor. En `sshd_config` se prohíbe entrar como root, se limita quién puede entrar y se puede desactivar la contraseña.
:::

:::pregunta[¿Qué ventajas tiene la autenticación por clave pública frente a la contraseña?]
La contraseña nunca viaja por la red y no se puede adivinar por fuerza bruta, porque solo resuelve el reto quien tiene la clave privada. Eso sí, la clave privada hay que protegerla (por ejemplo con una frase de contraseña).
:::

# 10. Buenas prácticas y auditoría

Montar el sistema es la mitad del trabajo. La otra mitad es cuidarlo: seguir ciertas normas y mirar de vez en cuando qué ha pasado.

## Normas básicas

- **Mínimo privilegio:** da a cada persona y a cada servicio solo lo que necesita.
- **No trabajes como root:** usa tu usuario normal y `sudo` puntual.
- **Una cuenta por persona:** nada de cuentas compartidas, porque si todos entran como "admin" no se sabe quién hizo qué.
- **Cierra lo que sobra:** desactiva o borra cuentas que ya no se usan, y evita contraseñas por defecto.
- **Sin contraseña no hay acceso remoto fácil:** claves SSH, root bloqueado y límites de intentos.

## Quién ha entrado y cuándo

Linux guarda un historial de accesos que puedes consultar:

| Comando | Qué muestra |
| --- | --- |
| `who` / `w` | Quién está conectado ahora mismo |
| `last` | Historial de sesiones iniciadas (desde dónde y cuánto duraron) |
| `lastb` | Intentos de inicio de sesión **fallidos** (requiere root) |
| `lastlog` | La última vez que cada usuario inició sesión |

Con ellos puedes responder a preguntas como: ¿quién ha entrado hoy?, ¿cuántas personas distintas han accedido?, ¿alguien que no debería?

```bash
last -F | head -20                          # últimas sesiones, con fecha completa
last | awk '{print $1}' | sort | uniq -c    # cuántas veces ha entrado cada usuario
sudo lastb | head                           # últimos intentos fallidos
```

## El registro de autenticación

Todo lo que tiene que ver con inicios de sesión y `sudo` queda registrado:

- En `/var/log/auth.log` (en Ubuntu, si el servicio de registro `rsyslog` está instalado).
- En el registro del sistema, que se consulta con `journalctl`.

```bash
sudo grep "Failed password" /var/log/auth.log     # contraseñas erróneas
sudo grep "sudo" /var/log/auth.log | tail         # uso de sudo
sudo journalctl -u ssh --since today              # actividad de SSH de hoy
```

Si ves muchos intentos fallidos desde la misma dirección, o un usuario que no debería acceder, es el momento de bloquear cuentas, revisar las claves autorizadas y reforzar `sshd_config`.

:::nota
Los registros son tu memoria del servidor. Un atacante que consigue entrar suele intentar borrar sus huellas, por eso en entornos serios se envían a otro equipo.
:::

:::nota[En resumen]
Seguridad es mantener el mínimo privilegio, no usar root y tener una cuenta por persona. Con `last`, `lastb`, `lastlog` y el registro de autenticación se puede saber quién entró, quién lo intentó y qué hizo.
:::

:::pregunta[¿Cómo averiguarías cuántas personas distintas han accedido a un servidor y si ha habido intentos fallidos?]
Con `last` para el historial de sesiones (contando usuarios distintos con `awk`, `sort` y `uniq`), con `lastb` para los intentos fallidos y con `grep "Failed password" /var/log/auth.log` para el detalle.
:::

# Glosario

| Término | Significado |
| --- | --- |
| Usuario | Identidad con la que se ejecuta cualquier proceso |
| Grupo | Conjunto de usuarios al que se dan permisos en común |
| root | Usuario administrador, con permiso para todo (UID 0) |
| UID / GID | Identificadores numéricos de usuario y de grupo |
| Cuenta de servicio | Cuenta usada por un programa, no por una persona |
| `/etc/passwd` | Archivo con los usuarios (legible por todos) |
| `/etc/shadow` | Archivo con los hashes de contraseña (solo root) |
| `/etc/group` | Archivo con los grupos y sus miembros |
| Grupo primario | El que se asigna a los archivos que crea el usuario |
| Grupo secundario | Grupo adicional que da acceso a recursos |
| `/etc/skel` | Plantilla de archivos que reciben los usuarios nuevos |
| Shell | Intérprete de comandos del usuario |
| `nologin` | Intérprete que impide abrir sesión |
| Variable de entorno | Valor que los programas pueden consultar (`PATH`, `HOME`...) |
| `chage` | Comando que gestiona la caducidad de contraseñas y cuentas |
| PAM | Sistema de módulos que decide si se autentica a un usuario |
| `pwquality` | Módulo PAM que exige contraseñas de cierta calidad |
| `pam_faillock` | Módulo PAM que bloquea cuentas tras varios fallos |
| `chmod` / `chown` / `chgrp` | Cambiar permisos, propietario y grupo |
| `umask` | Máscara que fija los permisos por defecto de lo nuevo |
| SUID | Ejecutar un programa con los permisos de su propietario |
| SGID | En directorios, lo nuevo hereda el grupo del directorio |
| Sticky bit | En directorios, cada uno solo borra lo suyo |
| `sudo` | Ejecutar un comando con privilegios, con tu contraseña |
| `visudo` | Editor seguro del archivo `sudoers` |
| SSH | Conexión remota cifrada, normalmente por el puerto 22 |
| Clave pública / privada | Par de claves: la privada se guarda, la pública se reparte |
| `authorized_keys` | Archivo del servidor con las claves públicas autorizadas |
| `last` / `lastb` / `lastlog` | Historial de accesos, de intentos fallidos y de último acceso |

# Fuentes y para saber más

Documentación para ampliar el bloque:

| Apartado | Enlace |
| --- | --- |
| 3. Gestión de usuarios en Ubuntu Server | [User management (Ubuntu Server)](https://ubuntu.com/server/docs/how-to/security/user-management/) |
| 5. Caducidad de contraseñas | [Manual de chage](https://manpages.debian.org/bookworm/passwd/chage.1.en.html) |
| 5. Calidad de contraseñas | [Manual de pwquality.conf](https://www.mankier.com/5/pwquality.conf) |
| 5. Bloqueo por intentos fallidos | [Manual de faillock.conf](https://manpages.ubuntu.com/manpages/noble/en/man5/faillock.conf.5.html) |
| 8. Reglas de sudo | [Manual de sudoers](https://manpages.debian.org/bookworm/sudo/sudoers.5.en.html) |
| 9. Servidor OpenSSH en Ubuntu | [OpenSSH server (Ubuntu Server)](https://ubuntu.com/server/docs/how-to/security/openssh-server/) |
| 9. Opciones de `sshd_config` | [Manual de sshd_config](https://manpages.ubuntu.com/manpages/noble/man5/sshd_config.5.html) |

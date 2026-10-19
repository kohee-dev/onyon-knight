---
dificultad: avanzado
titulo: "La Ópera de Garnier"
licencia: CC-BY-NC-SA-4.0
tipo: caso
horas: 14
portada: ./img/opera-portada.webp
cabecera: ./img/opera-cabecera.webp
---

:::aviso[Antes de empezar]
Para esta actividad parto de estos supuestos:

- Eres capaz de leer oraciones largas y entender lo que hay que hacer.
- Manejas rutas relativas y absolutas con precisión. Si una ruta está mal, esa parte no se corrige y tendrás un 0 en ella.
- Cada tarea se corrige de forma individual y separada del resto.
- Hay retos que no hemos trabajado a fondo en clase. No tengas miedo de preguntar.
- Apunta los comandos que vayas usando: los vas a necesitar más adelante.
- Si alguien hace trampas o copia, lo sabré.
:::

# Bienvenidos a Garnier

El Impresario os ha contratado para preparar el regreso triunfal de María a la ópera, en la obra *María y Jay*. Justo cuando os lo cuenta, os avisa de que tiene un gran problema: han informatizado toda la orquesta y el público ya está sentado, pero entre los artistas reina el caos. Se han perdido instrumentos, los encargados de seguridad han desaparecido, los músicos están desconcertados y la artista principal está amenazada: puede que la secuestren. La función es esta misma noche, así que el tiempo apremia.

La situación es esta. Los **instrumentos son usuarios** del sistema y las **partituras son archivos** que viven en carpetas de `/srv/garnier/opera`. Por desgracia, algunos músicos son muy torpes con las partituras: entran donde no les toca y tocan lo que no es. ¡TODO ES EL CAOS!

Tu trabajo es devolver el orden, y también proteger el teatro de lo que viene después.

# El entorno

| Máquina | Sistema | IP | Para qué sirve |
| --- | --- | --- | --- |
| `garnier` | Ubuntu Server 24.04 | `192.168.50.30` | El teatro: aquí haces todo el trabajo |
| `cliente` | Ubuntu o Windows 11 | `192.168.50.23` | Desde aquí vienen los espectadores |

Trabajas con un usuario administrador y `sudo`. **Haz una instantánea de la máquina antes de cada acto**: si algo sale mal, podrás volver atrás. Antes de la tarea 9 es obligatorio.

Material que te entrega el profesorado:

| Archivo | Contenido |
| --- | --- |
| `claves.txt` | Contraseña inicial de cada usuario, en formato `usuario:contraseña` |
| `banner.txt` | Cartel de bienvenida del teatro |
| `programa.txt` | Lista de obras que se representan |

# Usuarios y grupos

Estos son los usuarios que hay que crear o comprobar. Los nombres van en **minúsculas y sin tildes**.

| Tipo | Usuarios |
| --- | --- |
| Instrumentos | `oboe`, `clarinete`, `flauta`, `corno`, `violin`, `cello`, `contrabajo`, `guitarra`, `sistro`, `timbal`, `conductor` |
| Artistas | `maria`, `raul`, `jay`, `octavio` |
| Público | `espectador` (se crea en la tarea 2) |

Los grupos de la orquesta son `cuerda`, `viento_madera`, `viento_metal`, `percusion`, `conductor`, `orquesta` y `artistas`. El grupo `orquesta` incluye a todos los instrumentos y `artistas` incluye a María, Raul, Jay y Octavio.

| Instrumento | cuerda | viento_madera | viento_metal | percusion | conductor |
| --- | :-: | :-: | :-: | :-: | :-: |
| oboe | | X | | | |
| clarinete | | X | | | |
| flauta | | X | | | |
| corno | | | X | | |
| violin | X | | | | |
| cello | X | | | | |
| contrabajo | X | | | | |
| guitarra | X | | | | |
| sistro | | | | X | |
| timbal | | | | X | |
| conductor | | | | | X |

:::nota[Cómo se asignan los grupos]
Cada instrumento tiene como **grupo principal** el de su sección, y además pertenece al grupo secundario `orquesta`. Los artistas tienen como grupo principal `artistas`. El director de orquesta es el administrador del teatro: pertenece también a `sudo` y, para poder leer las partituras de todas las secciones, a los cuatro grupos de instrumentos.
:::

# Tarea 1: Vista interna

Escribe un script llamado `crear_orquesta.sh` que prepare los usuarios y grupos del sistema.

- Debe leer los usuarios y sus grupos de un fichero `usuarios.csv` que crearás tú, con las columnas `usuario`, `grupo_primario` y `grupos_secundarios`.
- Las contraseñas se establecen **de forma desatendida**, leyendo el fichero `claves.txt`: el script no debe preguntar nada por teclado.
- Para cada grupo y para cada usuario, comprueba si ya existe. Si existe, muestra un mensaje personalizado que indique que se ha saltado su creación.
- El script debe poder ejecutarse varias veces seguidas sin errores.

Cuando termines, comprueba el resultado con `id`, `getent passwd` y `getent group`.

# Tarea 2: Vista de los espectadores

Para que el público pueda ver el espectáculo, vas a crear un usuario `espectador` que se conecta por **SSH** a la máquina y consulta el programa.

Configura el servidor OpenSSH para cumplir estos requisitos:

1. El usuario `espectador` no tiene contraseña. **Solo entra con clave pública**.
2. Antes de pedir la autenticación se muestra el cartel `banner.txt`, que colocarás en `/etc/`.
3. Cuando el espectador inicia sesión, solo puede hacer una acción: **mostrar la lista de obras de `programa.txt` y salir automáticamente**. No debe poder abrir una terminal, ejecutar otros comandos ni redirigir puertos.
4. Cada persona que viene a ver el espectáculo entra con **su propia clave**: genera un par con `ssh-keygen` en el cliente y añade la clave pública al servidor.

Prueba que funciona entrando desde `cliente`. Prueba también lo que **no** debe funcionar: intenta ejecutar otro comando (`ssh espectador@192.168.50.30 ls`) y entrar con contraseña.

:::aviso
Antes de cambiar la configuración de SSH, **deja una sesión abierta** como administrador. Comprueba siempre los cambios con `sudo sshd -t` antes de recargar el servicio. Si te equivocas y cierras esa sesión, puedes quedarte fuera del teatro.
:::

# Acto I: Obertura

El concierto cuenta con un trabajo en estas carpetas:

- **Orquesta:** `/srv/garnier/opera/Il_barbiere_di_Siviglia/orquesta`
- **Artistas:** `/srv/garnier/opera/Il_barbiere_di_Siviglia/artistas`

En cada una están las partituras de los instrumentos y los artistas. Las simularemos con un `.txt` cuyo nombre es el del instrumento (con la primera letra en mayúscula) y que contiene ese mismo nombre.

:::nota[Ejemplo]
Para el usuario `oboe` debe existir el archivo `Oboe.txt` y su contenido será `Oboe`.
:::

Las exigencias del conductor son estas:

1. Cada instrumento puede leer y escribir **únicamente en su partitura**.
2. Cada sección puede **leer** las partituras de su propio grupo, pero no escribir en ellas.
3. El conductor puede leer y escribir en **todas** las partituras. Para él la solución es la de un administrador.
4. Los artistas no pueden leer las partituras de la orquesta, ni la orquesta las de los artistas. Nadie ajeno al teatro puede leer ninguna.

Además, el teatro necesita dos espacios más en `/srv/garnier/opera`:

- **`ensayos/<sección>`**: una carpeta de ensayo por cada sección de instrumentos (`cuerda`, `viento_madera`, `viento_metal`, `percusion`). Solo entran los miembros de esa sección, y **cualquier archivo que cree uno de ellos debe pertenecer al grupo de la sección y poder ser editado por sus compañeros**, sin que nadie tenga que cambiar permisos a mano.
- **`tablon`**: el tablón de avisos. **Todo el mundo puede ver todo lo que hay en él, pero nadie puede editar ni borrar las notas de otros**, ni siquiera un compañero de su misma sección. Solo el dueño de cada nota puede cambiarla o borrarla.

# Tarea 3: Creación de partituras

Escribe un script `act01.sh` con las órdenes necesarias. Te conviene usar variables para las rutas y bucles para repetir las operaciones.

Después, demuestra que funciona **probando con los distintos usuarios** (con `su`, `sudo -u` o `runuser`) que lo permitido se puede hacer y lo prohibido, no. Apunta cada prueba en tu informe.

:::tip[Pista]
En `ensayos` y en `tablon` los permisos de los archivos nuevos dependen de la `umask` de quien los crea. Piensa qué `umask` necesita cada uno de los dos casos.
:::

# Acto II: Aria de la suplente

El primer acto salió bien, pero alguien ha tirado todas las carpetas al suelo y han quedado mezcladas las partituras. Además, el Impresario ha decidido que es peligroso que María actúe, y **Andrea Windrose** la sustituirá durante este acto.

Como Jay ya ha terminado la Obertura, solo hay que gestionar las partituras del *Aria de la suplente*. El director te encarga ordenar los documentos rápidamente. Se pueden dar cuatro casos:

**1. La carpeta de un instrumento no tiene partituras.** Hay que construir esta estructura en el directorio personal del usuario (ejemplo para `oboe`):

```
Oboe/
  Oboe.txt
  Acto_I/
    Oboe_1.txt
  Acto_II/
    Oboe_2.txt
  Acto_III/
    Oboe_3.txt
  Acto_IV/
    Oboe_4.txt
```

El contenido de cada archivo es su propio nombre sin la extensión. Todo debe pertenecer al usuario y no ser accesible para los demás.

**2. Comprobar** que la carpeta es la correcta y que el usuario puede leer todo lo que debe. Salida de ejemplo:

```
$ sudo ./act02.sh oboe Probar

*Test 1: El usuario oboe existe
--Oboe.txt existe y puede ser leído por oboe
--Acto_I/ existe
--Acto_I/Oboe_1.txt existe y puede ser leído por oboe
*Error Acto_II/ no existe
*Error Acto_II/Oboe_2.txt no existe o no puede ser leído por oboe
--Acto_III/ existe
*Error Acto_III/Oboe_3.txt no existe o no puede ser leído por oboe
...
```

**3. Limpiar** una carpeta alterada, borrando todo su interior, **siempre que lo ordene alguien del mismo grupo musical**. Si lo pide alguien de otra sección, el script debe negarse con un mensaje.

**4. Sustituir a María por Andrea Windrose.** Añade el usuario `andrea` con **los mismos grupos que María**, crea para ella una copia de la carpeta de María y cambia el archivo `Maria.txt` por `Andrea.txt` **conservando el contenido**. Esto incluye también su partitura de la carpeta de los artistas.

# Tarea 4: act02.sh y andrea.sh

Escribe el script `act02.sh`, que recibe **dos parámetros**:

- El primero es un usuario válido del sistema. Si no lo es, muestra un mensaje de error y termina.
- El segundo es una de estas palabras: `Restablecer`, `Probar` o `Limpiar`. `Restablecer` resuelve el caso 1, `Probar` el caso 2 y `Limpiar` el caso 3. Cualquier otra palabra muestra cómo se usa el script.

En `Probar` y `Limpiar` se trabaja a partir de la carpeta con el nombre del usuario. Te conviene empezar por poder limpiar una carpeta, por si cometes errores en lo demás.

Después escribe `andrea.sh`, que resuelve el caso 4:

- Crea el usuario `andrea` (con los grupos y la carpeta de María) y después elimina a `maria`. Piensa en el orden: si borras primero, ya no hay nada que copiar.
- Crea también el usuario `rai` si no existe.

# Tarea 5: Delegación al primer violín

Con tanto ensayo, el director no puede encargarse de todo. Quiere que **`violin`**, el primer violín, pueda hacer dos cosas, y solo esas dos, sin ser administrador:

- Reiniciar el servicio SSH (para que el teatro vuelva a abrir sus puertas al público).
- Consultar los intentos de acceso fallidos con `lastb`.

El director (`conductor`) sigue siendo el administrador del teatro.

Configúralo con `visudo` en un archivo propio dentro de `/etc/sudoers.d/`. Después comprueba, con `sudo -l -U violin` y entrando como `violin`, que puede hacer lo permitido y que **no** puede, por ejemplo, leer `/etc/shadow` con `sudo`.

# Entreacto: la taquilla

Cae el telón del segundo acto y el Impresario quiere saber una cosa: **¿cuánta gente ha venido a ver la obra?** Hay que hacer caja.

# Tarea 6: Caja

Pide a al menos dos compañeros que vengan a ver la obra, cada uno con su clave, o genera tú varias claves distintas. Después escribe un script `caja.sh` que lea el registro de autenticación del sistema y muestre:

- Cuántas **sesiones** de espectador se han abierto.
- Cuántos **espectadores distintos** han venido (una clave pública es una persona: una misma persona puede entrar varias veces).
- La **recaudación**, sabiendo que cada espectador paga una entrada de 5 €.

El script debe funcionar tanto si existe `/var/log/auth.log` como si hay que consultar el diario del sistema con `journalctl`.

# Acto III: Vals de las sombras

La actuación de Andrea Windrose ha salido a la perfección gracias a ti, pero misteriosamente están desapareciendo las partituras de todos los actos.

# Tarea 7: Rai Clemente contra el sabotaje

Escribe un script `act03.sh` que cree el usuario `rai` si no existe y acepte uno de estos argumentos:

| Argumento | Qué borra |
| --- | --- |
| `--all` | Todos los actos |
| `--01` | Solo el Acto I |
| `--02` | Solo el Acto II |
| `--03` | Solo el Acto III |
| `--04` | Solo el Acto IV |

El script borra los ficheros y carpetas del acto indicado en las carpetas de **todos** los usuarios. Si el argumento no es válido o falta, muestra un mensaje de aviso.

`act03.sh` debe ejecutarse **cada 10 minutos con un argumento elegido al azar**.

Además, escribe `act03_rai.sh`, que se ejecuta **cada 15 minutos** y comprueba con `act02.sh` la carpeta de cada usuario. Si algo no está en orden, la limpia, la restablece y envía un mensaje diciendo que ha restaurado las partituras de ese usuario.

# Acto IV: El intruso

Rai Clemente ha descubierto que **Herme** lleva tiempo intentando entrar en el teatro. Hay intentos de acceso extraños en el registro y alguien tiene una cuenta que no debería. Hay que averiguar qué ha pasado y cerrar las puertas.

El profesorado lanzará el ataque desde otra máquina. No sabes cuándo ni contra qué cuentas.

# Tarea 8: Investigar y reforzar

Hazlo en este orden y deja constancia de cada paso en un informe (`informe_herme.md`).

**1. Investiga.** Con `lastb`, `last`, `lastlog` y el registro de autenticación, averigua:

- Qué cuentas han recibido muchos intentos fallidos.
- Desde qué dirección IP se han hecho.
- Si, entre tantos fallos, alguien ha conseguido entrar, con qué cuenta y desde dónde.

**2. Refuerza las contraseñas.**

- Exige contraseñas de **al menos 12 caracteres y 3 tipos de carácter distintos** para las contraseñas nuevas.
- Haz que las contraseñas de los músicos caduquen a los **60 días**, con aviso 7 días antes, y **obliga a cambiarlas en el próximo inicio de sesión** (para todos menos para el director).
- Haz que una cuenta se bloquee temporalmente tras **3 intentos fallidos seguidos**.

**3. Bloquea lo que huele raro.** Escribe un script `seguridad.sh` que reciba un umbral de intentos y bloquee:

- Las cuentas que han recibido tantos intentos fallidos como el umbral o más.
- Las cuentas en las que alguien ha entrado desde una dirección que ha atacado el sistema.

Bloquear una cuenta significa que **no se pueda entrar de ninguna forma**, cerrar sus sesiones abiertas y dejar un mensaje en el registro del sistema. Nunca debe bloquear a `root`, `conductor` ni `espectador`. Recuerda qué comando bloquea solo la contraseña y cuál bloquea la cuenta entera.

**4. Cierra las puertas de SSH.**

- Nadie puede entrar como `root`.
- Solo pueden entrar por SSH los miembros de `orquesta`, `artistas` y `espectador`.
- El director solo puede entrar con clave pública.

**5. Informe.** Cuenta en una página qué ha pasado, qué cuenta cayó, desde dónde y qué has hecho.

# Acto V: Finale

Herme ha logrado colarse y no deja de sabotear la función: roba instrumentos y descoordina a los distintos grupos de la orquesta. María está en peligro.

:::aviso[Antes de continuar]
Esta tarea **destruye usuarios y grupos de tu sistema**. Haz una instantánea de la máquina antes de lanzar nada. Cuando termines, vuelve a ella.
:::

# Tarea 9: Finale

Escribe un script `finale.sh` que acepte dos argumentos. El primero puede ser:

| Primer argumento | Segundo argumento |
| --- | --- |
| `-i` o `--instruments` | Un usuario |
| `-g` o `--groups` | Un grupo |
| `-p` o `--partitures` | Un acto (1 a 4) |

- Con **instrumentos**, para el usuario indicado: comprueba que existe, borra su directorio personal y elimina su cuenta, y comprueba que ya no aparece en `/etc/passwd` ni en `/etc/shadow`. Muestra un mensaje por cada operación.
- Con **grupos**, para el grupo indicado: si no existe, muestra un mensaje y avanza. Si existe, elimina las cuentas cuyo **grupo principal** es ese grupo, saca al resto de los miembros del grupo y elimina el grupo. Muestra un mensaje por cada operación.
- Con **partituras**, borra el contenido del acto indicado.
- Si el primer argumento no es válido, muestra un mensaje de error.

A continuación, programa el sabotaje de Herme, que se ejecutará **cada minuto** desde `crontab`:

- Crea el usuario `herme` si no existe.
- Elimina un instrumento o un grupo existente **elegido al azar**.
- Si ya no queda ningún instrumento ni grupo, crea el usuario `joan`, elimina a `andrea`, `rai` y `herme`, y escribe en el registro del sistema (con `logger`) y por pantalla: **"María ha sido secuestrada!"**

Por último, escribe `finale_rai.sh`, que vuelve a crear los usuarios que falten **antes** de que se ejecute `act03_rai.sh`.

:::tip[Pista]
`logger` envía un mensaje al registro del sistema. Puedes comprobarlo luego con `journalctl -t finale` o buscándolo en el registro.
:::

# Entrega

Por Esemtia:

- Todos los scripts que hayas creado (`.sh`).
- Los ficheros que hayas modificado durante la práctica (`usuarios.csv`, los de configuración de SSH, sudoers y PAM).
- El informe con las pruebas de las tareas 3 y 5, y `informe_herme.md`.

Mucho ánimo.

---
dificultad: avanzado
titulo: "Minerva, la ciudad del conocimiento"
licencia: CC-BY-NC-SA-4.0
tipo: caso
horas: 12
portada: ./img/minerva-portada.webp
cabecera: ./img/minerva-cabecera.webp
---

:::aviso[Antes de empezar]
Para esta actividad parto de estos supuestos:

- Eres capaz de leer oraciones largas y entender lo que hay que hacer.
- Manejas rutas relativas y absolutas con precisión. Si una ruta está mal, esa parte no se corrige y tendrás un 0 en ella.
- Cada tarea se corrige de forma individual y separada del resto.
- Hay retos que no hemos trabajado a fondo en clase. No tengas miedo de preguntar.
- Apunta los comandos que vayas usando: los vas a necesitar más adelante.
- Esta práctica **rompe discos a propósito**. Haz una instantánea de la máquina virtual antes de la tarea 7 y no la borres hasta que te hayan corregido.
- Si alguien hace trampas o copia, lo sabré.
:::

:::tip[Cómo usar la teoría]
Cada tarea indica qué tema de teoría la apoya. Léelo **antes** de empezar la tarea: la práctica da por hecho que sabes qué es cada cosa. Si te atascas, vuelve al tema y mira el glosario y las preguntas del final.
:::

## Bienvenidos a Minerva

Minerva queda al norte de Elpis y vive de lo que guarda: manuscritos escaneados, estudios a medias, apuntes de las escuelas y los papeles del Consejo. Todo está en un servidor llamado `biblioteca`, una máquina vieja que nadie ha tocado en años. Ni siquiera se sabe cuánto espacio le queda. De copias de seguridad, ni hablar, y la semana pasada uno de sus discos soltó un chasquido que no le gustó a nadie.

Andrea Windrose llegó a Minerva hace unas semanas por un asunto de documentos que no están donde deberían: una carta que cambia de carpeta, un informe al que le faltan páginas. Puede ser culpa del servidor, que está hecho un desastre, o puede ser culpa de alguien. Andrea no lo sabe. Como no se fía de los ordenadores, lo apunta todo en un cuaderno, pero tampoco se engaña: con ese servidor no va a averiguar nada.

Por eso ha venido a buscaros. El Consejo le ha dejado entrar en los papeles de Dirección mientras dure el caso, y os pide que pongáis el servidor en orden. Que cada departamento vea lo suyo y nada más, que un estropicio se pueda deshacer sin dramas y que, si algo vuelve a romperse, el servidor avise antes de que Andrea lo descubra por las malas.

Minerva tiene cuatro departamentos:

| Departamento | Grupo | Qué guarda |
| --- | --- | --- |
| Archivo | `archivo` | Manuscritos y documentos históricos |
| Investigación | `investigacion` | Estudios en curso |
| Docencia | `docencia` | Material de las escuelas |
| Dirección | `direccion` | Documentos confidenciales del Consejo de Minerva |

## El entorno

| Máquina | Sistema | IP | Para qué sirve |
| --- | --- | --- | --- |
| `biblioteca` | Ubuntu Server 24.04 | `192.168.50.40` | El servidor de almacenamiento: aquí haces casi todo el trabajo |
| `lector` | Ubuntu Server 24.04 | `192.168.50.41` | Cliente Linux (NFS y Samba) |
| `escriba` | Windows 11 | `192.168.50.42` | Cliente Windows (Samba) |
| `archivo-win` | Windows Server 2022 | `192.168.50.43` | Servidor de archivos Windows (tarea 10) |

`biblioteca` tiene, además del disco del sistema, **cinco discos virtuales vacíos**:

| Disco | Tamaño | Uso previsto |
| --- | --- | --- |
| `sdb`, `sdc`, `sdd` | 1 GB cada uno | Almacén principal |
| `sde` | 1 GB | Repuesto |
| `sdf` | 2 GB | Copia de seguridad |

:::tip[Cómo comprobar tus discos]
Con `lsblk` ves los discos y sus tamaños. Si en tu máquina los nombres no coinciden con la tabla, usa los tuyos y **apunta la correspondencia**: te equivocarás menos.
:::

Trabajas con un usuario administrador y `sudo`. Las máquinas `escriba` y `archivo-win` solo se usan cuando se indica.

Material que te entrega el profesorado: el script `crear_personal.sh`.

## Personal y grupos

| Persona | Usuario | Grupo principal |
| --- | --- | --- |
| Irene | `irene` | `archivo` |
| Tomás | `tomas` | `archivo` |
| Nuria | `nuria` | `investigacion` |
| Omar | `omar` | `investigacion` |
| Elena | `elena` | `docencia` |
| Pablo | `pablo` | `docencia` |
| Andrea Windrose (detective) | `andrea` | `direccion` |

Los nombres van en **minúsculas y sin tildes**.

Quién puede qué sobre cada recurso (lo vas a implantar con ACL en la tarea 4, con Samba en la 7 y con NFS en la 8):

| Recurso | archivo | investigacion | docencia | direccion |
| --- | :-: | :-: | :-: | :-: |
| `archivo` | Lee y escribe | Lee | No entra | Lee |
| `investigacion` | Lee | Lee y escribe | No entra | Lee |
| `docencia` | No entra | Lee | Lee y escribe | Lee |
| `direccion` | No entra | No entra | No entra | Lee y escribe |

---

## Tarea 0: Preparación

Ejecuta en `biblioteca` el script `crear_personal.sh` que te da el profesorado. Crea los cuatro grupos y los siete usuarios de la tabla anterior, cada uno con su grupo principal, su carpeta personal y la contraseña inicial `Papel-2026` (en un servidor real la cambiarías). Léelo antes de ejecutarlo y entiende qué hace.

```bash
sudo bash crear_personal.sh
```

Comprueba el resultado:

```bash
getent passwd irene tomas nuria omar elena pablo andrea
```

Haz una instantánea de la máquina virtual y llámala `limpia`.

## Tarea 1: Pool ZFS

**Teoría:** [[discos-raid]] y [[zfs-pools-datasets]], secciones 1 a 3.

Hasta ahora has visto el disco como una partición con un sistema de ficheros. [ZFS](https://es.wikipedia.org/wiki/ZFS) junta varias capas en una: gestiona los discos, agrupa su espacio en un **pool** y ofrece sistemas de ficheros llamados **datasets**. Para qué sirve: un pool puede repartir los datos entre varios discos y sobrevivir al fallo de uno, algo que en otros sistemas harías con [RAID](https://es.wikipedia.org/wiki/RAID) por un lado y LVM por otro.

Instala las herramientas de ZFS:

```bash
sudo apt install zfsutils-linux
```

Crea un pool llamado `saber` con **tres discos en `raidz1`** (`sdb`, `sdc` y `sdd`) y el disco `sde` como **repuesto** (*spare*). Debe montarse en `/saber`.

Usa estas opciones al crearlo: `ashift=12`, `acltype=posixacl` y `xattr=sa`.

:::tip[Pista]
El formato es `zpool create -o opciones... nombre tipo discos... spare disco`. Las propiedades de los **datasets** (`acltype` y `xattr`) se indican con `-O` en mayúscula, y las del pool (`ashift`) con `-o` en minúscula. Para que el pool se monte en `/saber` basta con que se llame `saber`.
:::

:::nota[Qué hace cada cosa]
- `raidz1` reparte los datos entre los discos y guarda **paridad** de uno: aguanta la pérdida de un disco, a cambio de perder la capacidad de uno.
- `ashift=12` le dice a ZFS que los sectores del disco son de 4 KiB. No se puede cambiar después de crear el pool.
- `acltype=posixacl` y `xattr=sa` son necesarios para usar ACL de Linux sobre ZFS (tarea 4).
:::

Comprueba el estado:

```bash
zpool status saber
```

```bash
zpool list saber
```

```bash
zfs list
```

**Entrega:** los comandos que has usado y la respuesta a estas preguntas, con tus palabras: ¿cuánto espacio útil tiene el pool y por qué no son 3 GB?; ¿qué pasaría si quisieras añadir más espacio al pool después?

## Tarea 2: Datasets, cuotas y compresión

**Teoría:** [[zfs-pools-datasets]], sección 4.

Crea un dataset por departamento dentro de `saber`: `archivo`, `investigacion` y `docencia`. El de `direccion` lo harás en la tarea 3.

| Dataset | Cuota | Compresión |
| --- | --- | --- |
| `saber/archivo` | 600 MB | `lz4` |
| `saber/investigacion` | 400 MB | `lz4` |
| `saber/docencia` | 300 MB | `lz4` |

```bash
sudo zfs create -o quota=600M -o compression=lz4 saber/archivo
```

Ese es el comando del primero. Haz tú los otros dos.

:::nota[Para qué sirve]
Un dataset no es una carpeta: tiene sus propias propiedades (cuota, compresión, instantáneas...). Una **cuota** limita el espacio que puede ocupar; la compresión `lz4` es casi gratis en CPU y suele ahorrar espacio.
:::

Cambia el grupo de cada punto de montaje al del departamento y deja los permisos en `2770`. Recuerda qué hace el `2` de `2770` (teoría 04, sección 1).

Llena `/saber/archivo` con unos cuantos manuscritos de ejemplo. Estos comandos crean 40 ficheros de texto, unos 17 MB en total:

```bash
for i in $(seq -w 1 40); do seq 1 20000 | sed "s/^/folio $i, linea /" | sudo tee /saber/archivo/manuscrito$i.txt >/dev/null; done
```

Deja que los ficheros sean de `irene` y del grupo `archivo`, y comprueba cuánto ocupan de verdad:

```bash
zfs get used,logicalused,compressratio saber/archivo
```

Para ver la cuota en acción, crea un fichero **grande y aleatorio** en `/saber/docencia` con `dd` hasta que ZFS te pare. Hazlo como `elena`, con `sudo -u elena`.

:::aviso[Error frecuente]
Si rellenas con `/dev/zero` la compresión lo reduce casi a nada y la cuota no salta nunca. Usa `/dev/urandom`.
:::

**Entrega:** salida de `zfs get` con cuota, compresión y `compressratio` de cada dataset, y el mensaje de error que te da `dd` al superar la cuota.

## Tarea 3: Cifrado de Dirección

**Teoría:** [[cifrado-datos]], secciones 4 y 5.

Los papeles del Consejo, que Andrea tiene ahora en custodia, no pueden leerse aunque alguien se lleve un disco. Crea `saber/direccion` **cifrado con contraseña** (algoritmo `aes-256-gcm`), con cuota de 100 MB y carpeta en `2770` para el grupo `direccion`.

:::tip[Pista]
Necesitas las propiedades `encryption=aes-256-gcm` y `keyformat=passphrase`. ZFS te pedirá la contraseña al crearlo.
:::

Demuestra que funciona:

1. Crea un fichero `testamento.txt` dentro, como `andrea`.
2. Desmonta el dataset y descarga la clave.
3. Intenta montarlo: tiene que fallar.
4. Carga la clave y móntalo otra vez.

**Entrega:** los comandos, y respuesta a esta pregunta: tras reiniciar `biblioteca`, ¿estará `saber/direccion` accesible? ¿Qué habría que hacer? Compruébalo.

## Tarea 4: ACL por departamento

**Teoría:** [[permisos-acl]], secciones 1 a 3 y 5.

Los permisos clásicos no pueden expresar la tabla de la sección "Personal y grupos": ahí un departamento *lee* los recursos de otro. Para eso se usan las [ACL](https://es.wikipedia.org/wiki/Lista_de_control_de_acceso).

Este es el ejemplo para `archivo`: da lectura a `investigacion` y a `direccion`, tanto a lo que ya existe como a lo que se cree después:

```bash
sudo setfacl -R -m g:investigacion:rX,g:direccion:rX /saber/archivo
```

```bash
sudo setfacl -d -m g:investigacion:rX,g:direccion:rX /saber/archivo
```

Haz tú lo mismo con `investigacion` y con `docencia`, mirando quién lee cada uno en la tabla. `direccion` no necesita ACL.

Comprueba con `getfacl` y con pruebas reales usando `sudo -u`:

```bash
sudo -u nuria touch /saber/archivo/prueba.txt
```

Tiene que fallar. En cambio, `sudo -u irene touch /saber/archivo/prueba.txt` tiene que funcionar.

:::tip[Pista]
Una ACL "por defecto" (`-d`) no afecta a lo que ya existe: solo a lo que se cree después. Por eso se pone dos veces.
:::

**Entrega:** salida de `getfacl` de los cuatro puntos de montaje y una tabla con la prueba real de cada celda de la tabla de permisos (qué usuario probaste y qué resultado dio).

## Tarea 5: Instantáneas

**Teoría:** [[instantaneas-copias]], sección 2.

Un **snapshot** guarda el estado de un dataset en un instante. Casi no ocupa espacio hasta que el dataset cambia, porque ZFS nunca sobrescribe: escribe los cambios en otro sitio ([copy-on-write](https://es.wikipedia.org/wiki/Copy-on-write)). Es la herramienta para deshacer desastres.

1. Crea una instantánea de `saber/archivo` llamada `inicial`.
2. Simula un accidente: **borra** los manuscritos de `/saber/archivo`.
3. Recupéralos de dos formas distintas: copiando un fichero desde el directorio oculto `.zfs/snapshot/` y haciendo `rollback`.
4. Crea un **clon** de la instantánea y comprueba que puedes modificarlo sin tocar el original. Después, bórralo.

Luego programa una instantánea automática. Añade al `crontab` de root una línea que, **cada 5 minutos**, cree una instantánea de `saber/archivo` cuyo nombre incluya la fecha y la hora. Deja que pasen 15 minutos y comprueba que salen en `zfs list -t snapshot`.

:::tip[Pista]
En el `crontab` el carácter `%` tiene un significado especial y hay que escribirlo como `\%`. Para el nombre, `$(date +\%F-\%H\%M)` te da algo como `2026-10-15-1305`. Además, `cron` usa un `PATH` reducido: escribe el comando con su ruta completa (`/usr/sbin/zfs`).
:::

:::aviso[Error frecuente]
`rollback` borra todas las instantáneas posteriores a la que restauras. Si solo quieres recuperar un fichero, copia desde `.zfs/snapshot/`.
:::

**Entrega:** los comandos de las dos recuperaciones, la línea de `cron` y la salida de `zfs list -t snapshot`. Responde: ¿qué pasará con el espacio si no borras nunca las instantáneas automáticas?

## Tarea 6: Copia de seguridad

**Teoría:** [[instantaneas-copias]], secciones 3 a 5.

Un snapshot protege de un error del usuario, pero **no de que se muera el pool**. Necesitas una copia en otro sitio.

1. Crea un segundo pool llamado `copia` con el disco `sdf`.
2. Envía a `copia` un snapshot de `saber/archivo` con `zfs send` y `zfs receive`. Esta primera copia es **completa**. Pasa la opción `-u` a `zfs receive` para que no se monte solo.
3. Añade ficheros nuevos a `/saber/archivo`, haz otro snapshot y envía solo **lo que ha cambiado** (copia incremental).
4. Monta la copia, comprueba que se puede leer y, borrando algo en `saber`, restaura un fichero desde `copia`.

:::aviso[Error frecuente]
Si montas y lees el destino antes de la copia incremental, ZFS puede decir que *el destino ha sido modificado*. Pon el dataset de copia en solo lectura con `zfs set readonly=on` justo después de la copia completa.
:::

:::nota[Alternativas]
Con otros sistemas de ficheros se usa `rsync` (copia fichero a fichero), `tar` o programas con deduplicación como `restic` o `borg`. `zfs send` es más rápido porque sabe qué bloques cambiaron sin comparar nada.
:::

**Entrega:** los comandos de la copia completa y la incremental, y la respuesta a: ¿cumple tu copia la regla 3-2-1? ¿Qué le falta?

## Tarea 7: Fallo de disco

**Teoría:** [[zfs-pools-datasets]], sección 5; y [[discos-raid]], sección 6.

Hace una semana un disco hizo un ruido feo. Hoy ha dejado de responder. **Haz una instantánea de la máquina virtual `biblioteca`** y empieza:

1. Con `zpool status` anota el estado inicial.
2. Simula el fallo poniendo `sdc` fuera de servicio con `zpool offline`.
3. Comprueba que el pool está **DEGRADED** y que los datos siguen accesibles. Escribe un fichero nuevo y lee uno antiguo.
4. Sustituye el disco averiado por el repuesto `sde` con `zpool replace`.
5. Vigila la reconstrucción (*resilver*) hasta que termine.
6. Deja el repuesto como disco permanente quitando del pool el disco averiado con `zpool detach`.
7. Lanza una revisión completa del pool (`zpool scrub`) y comprueba que no hay errores.

**Entrega:** salida de `zpool status` en cada paso (puedes resumirla) y respuesta: ¿qué habría pasado si hubieran fallado **dos** discos a la vez? ¿Y si hubieras usado `mirror` de dos discos?

## Tarea 8: Samba para Windows

**Teoría:** [[compartir-linux]], sección 2.

Los departamentos usan Windows 11 y quieren ver sus carpetas como unidades de red. [Samba](https://es.wikipedia.org/wiki/Samba_(software%29) implementa en Linux el protocolo [SMB](https://es.wikipedia.org/wiki/Protocolo_Server_Message_Block) de Windows.

Instálalo (`sudo apt install samba`) y añade al final de `/etc/samba/smb.conf` este recurso de ejemplo:

```ini
[archivo]
   path = /saber/archivo
   valid users = @archivo @investigacion @direccion
   write list = @archivo
   create mask = 0660
   directory mask = 2770
```

Escribe tú los de `investigacion` y `docencia`, siguiendo la tabla de permisos. `direccion` no se comparte.

- Los usuarios de Samba tienen su propia contraseña: tienes que dar de alta a cada persona con `smbpasswd -a`.
- Revisa la configuración con `testparm` antes de reiniciar el servicio.

Desde `escriba`, conecta la unidad `Z:` con la cuenta de `irene` al recurso `archivo` y prueba:

- que Irene puede crear y borrar ficheros,
- que Nuria (`investigacion`) puede leer pero no escribir,
- que Elena (`docencia`) no puede ni entrar.

Desde `lector`, comprueba el acceso de Irene con `smbclient`.

:::aviso[Error frecuente]
Windows recuerda las credenciales con las que entraste la primera vez. Si necesitas probar otro usuario, borra las conexiones antes con `net use * /delete`.
:::

**Entrega:** lo que has añadido a `smb.conf`, la salida de `testparm -s` y capturas de las pruebas de `escriba`.

## Tarea 9: NFS para Linux

**Teoría:** [[compartir-linux]], sección 3.

`lector` necesita el material de Docencia como si fuera una carpeta suya. [NFS](https://es.wikipedia.org/wiki/Network_File_System) comparte carpetas entre sistemas Linux.

1. En `biblioteca`, exporta `/saber/docencia` solo a la red `192.168.50.0/24`, con lectura y escritura.
2. En `lector`, monta la exportación en `/mnt/docencia`.
3. Crea un fichero como `elena` en `lector` y mira quién es su dueño en `biblioteca`.
4. Comprueba qué pasa cuando `root` de `lector` intenta crear un fichero en la exportación y explica el resultado.
5. Haz que el montaje sea **permanente** y se haga solo al primer acceso, no al arrancar.

:::nota[Cuidado con los UID]
NFS no entiende nombres, solo números (UID y GID). Si `elena` es 1004 en `biblioteca` y 1001 en `lector`, el servidor verá a otra persona. Resuélvelo creando a `elena` en `lector` con el **mismo UID**. Con cien usuarios esto sería inviable; más adelante verás cómo se resuelve con un directorio centralizado.
:::

**Entrega:** línea de `/etc/exports`, línea de `/etc/fstab`, y la salida de `ls -ln` para los pasos 3 y 4 con tu explicación.

## Tarea 10: Servidor de archivos Windows

**Teoría:** [[compartir-windows]], y [[permisos-acl]], sección 4.

No todo es Linux. La escuela de Minerva usa `archivo-win` (Windows Server 2022). Aquí los permisos funcionan de otra manera: hay dos capas que se combinan.

1. Instala los roles **Servidor de archivos** y **Administrador de recursos del servidor de archivos (FSRM)**.
2. Crea la carpeta `D:\Escuela` con una subcarpeta por departamento y crea en el servidor los grupos locales `archivo`, `investigacion`, `docencia` y `direccion`, con sus usuarios.
3. Compártela como `Escuela$` con **permisos de compartición** `Cambiar` para `Todos` y gestiona la seguridad solo con **permisos NTFS** según la tabla de la actividad. Quita la herencia donde haga falta.
4. Activa la **enumeración basada en el acceso**, para que cada persona vea solo las subcarpetas que puede abrir.
5. Pon una cuota de 100 MB en cada subcarpeta (que **no** se pueda superar) y un filtro de archivos que impida guardar `.mp3` y `.exe`.
6. Comprueba con la pestaña **Acceso efectivo** de las propiedades de seguridad qué puede hacer `irene` en cada carpeta.

:::nota[Dos capas]
Cuando entras por la red, el sistema aplica **los permisos de compartición y los NTFS a la vez** y manda el más restrictivo. Por eso se suele dar `Cambiar` o `Control total` en la compartición y afinar con NTFS, que además protege cuando alguien entra en la máquina de forma local.
:::

**Entrega:** los comandos o capturas de lo que has hecho, una captura del acceso efectivo de `irene` y la respuesta a esta pregunta: si el permiso de compartición es `Leer` y el NTFS es `Control total`, ¿qué puede hacer el usuario por la red? ¿Y desde la consola del servidor?

## Tarea 11: Salud y monitorización

**Teoría:** [[monitorizacion-almacenamiento]].

Andrea quiere que el servidor lo **avise antes** de que algo se rompa.

Primero explora las herramientas de monitorización de `biblioteca` y describe, en una frase cada una, qué mide y cuándo la usarías:

```bash
zpool iostat -v 2
```

```bash
iostat -xz 2
```

```bash
vmstat 2
```

Además: `free -h`, `df -h` y `journalctl -p warning -b`. Para `iostat` necesitas instalar `sysstat`.

Después escribe un script `salud.sh`. Revisa si todos los pools están `ONLINE` y si algún dataset de `saber` supera el umbral de ocupación. Cada resultado debe quedar en `/var/log/ciudad-salud.log` y los problemas se mandan además al diario del sistema con `logger`.

Pistas para escribirlo:

- `zpool list -H -o name` da los nombres de los pools y `zpool list -H -o health NOMBRE` su estado.
- `zfs list -H -p -r -o name,used,avail saber` da, en bytes, lo usado y lo libre de cada dataset. El porcentaje es `usado * 100 / (usado + libre)`; en `bash` se calcula con `$(( ... ))`.
- `logger -t salud -p user.warning "mensaje"` escribe en el diario con la etiqueta `salud`.
- `cron` trae un `PATH` reducido en el que no está `/usr/sbin`. Pon el `PATH` al principio del script o usa rutas completas.

Ejecútalo cada 5 minutos con `cron`. Para provocar un aviso, rellena `saber/docencia` hasta el 90 % y comprueba con `journalctl -t salud` que el aviso sale.

:::nota[En producción]
Un script así es el principio. Los sistemas reales usan **ZED** (el demonio de eventos de ZFS), `smartd`, y plataformas como Zabbix o Prometheus con Grafana, que además guardan el histórico y dibujan gráficas.
:::

**Entrega:** el `salud.sh` completo, la línea de `cron`, el contenido del log tras el aviso y la salida de `journalctl -t salud`.

---

## Cómo se corrige

Cada tarea se puntúa por separado según su rúbrica. Se valora:

- que lo que has hecho **funcione** (se prueba con usuarios reales, no solo con la salida de los comandos),
- que expliques con tus palabras qué has hecho y por qué,
- que entregues a tiempo y con los ficheros pedidos.

:::nota[Lo que viene]
Más adelante volverás a esta máquina: automatizarás las instantáneas y las copias con scripts, y sustituirás las cuentas locales por las de un directorio centralizado. Conserva la instantánea final de `biblioteca`.
:::

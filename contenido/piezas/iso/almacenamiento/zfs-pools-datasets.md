---
titulo: "ZFS, pools y datasets"
licencia: CC-BY-NC-SA-4.0
---

En el tema anterior viste las capas del almacenamiento por separado: particiones, LVM, RAID y sistema de ficheros. [ZFS](https://es.wikipedia.org/wiki/ZFS) las junta todas en una sola herramienta. Es uno de los sistemas más usados en servidores de ficheros y de copias de seguridad, y va a ser el eje de la práctica de este bloque, así que merece que le dediquemos un tema entero.

## Qué vas a aprender

Al terminar este tema deberías ser capaz de:

- Explicar qué es ZFS y qué problemas resuelve frente al esquema clásico de partición, LVM, RAID y ext4.
- Distinguir disco, vdev, pool y dataset.
- Crear un pool con `mirror` o `raidz` y calcular la capacidad útil que te da.
- Crear datasets y ajustar sus propiedades: cuota, reserva y compresión.
- Entender por qué ZFS detecta datos corruptos y, si puede, los arregla.
- Saber qué ocurre cuando falla un disco y cómo se sustituye.

---

## 1. Qué es ZFS y por qué es distinto

ZFS nació en Sun Microsystems. Hoy lo mantiene la comunidad con el nombre de **OpenZFS**, y funciona en Linux, FreeBSD y otros sistemas. En Ubuntu viene en el paquete `zfsutils-linux`.

Lo que lo hace diferente es que gestiona toda la pila a la vez. Tú le das discos y él se encarga de repartir los datos, protegerlos y organizarlos en sistemas de ficheros. No hay una capa de RAID aparte ni una de LVM. Y como lo controla todo, puede hacer cosas que los sistemas separados no pueden:

| Característica | Qué significa |
| --- | --- |
| Sumas de comprobación | Cada bloque que escribe lleva una suma, y al leerlo la comprueba para saber si se ha corrompido |
| Autorreparación | Si un bloque está dañado y existe otra copia buena (espejo o paridad), lo detecta al leerlo y lo arregla solo |
| Copy-on-write | Nunca sobrescribe datos: escribe en otro sitio y después cambia el puntero. Por eso un apagón no lo deja a medias, y por eso las instantáneas casi no cuestan nada |
| Instantáneas y clones | Fotos del sistema en un instante ([[instantaneas-copias]]) |
| Compresión integrada | Comprime los datos al escribirlos, sin que tú hagas nada |
| Cuotas y reservas por dataset | Limita o garantiza espacio a cada parte |
| Cifrado integrado | Por dataset ([[cifrado-datos]]) |
| Envío de datos | `zfs send` y `zfs receive` copian datasets enteros, también de forma incremental ([[instantaneas-copias]]) |

:::nota[¿Por qué no es el sistema por defecto de Linux?]
Es una cuestión de licencias. El código de ZFS usa una licencia (CDDL) que no es compatible con la del núcleo de Linux (GPL), así que no puede formar parte del núcleo oficial. Ubuntu lo distribuye como módulo aparte y le da soporte, pero la mayoría de distribuciones usan ext4 o XFS por defecto. Una alternativa nativa de Linux con ideas parecidas, como las instantáneas y las sumas de comprobación, es Btrfs.
:::

## 2. Disco, vdev, pool y dataset

ZFS organiza el almacenamiento en capas, y lo primero es tener claro el vocabulario:

1. **Disco**: el dispositivo físico (o una partición, o incluso un fichero).
2. **vdev** (*virtual device*): un grupo de discos que trabajan juntos con una cierta redundancia. Puede ser un disco suelto, un espejo (`mirror`) o un `raidz`.
3. **Pool** (*zpool*): el conjunto de uno o más vdev. Su capacidad es la suma de la de sus vdev, y los datos se reparten entre ellos.
4. **Dataset**: un sistema de ficheros dentro del pool. Se crean al instante, comparten el espacio libre del pool y cada uno tiene sus propias propiedades.

```text
pool "saber"
└── vdev raidz1  (sdb + sdc + sdd)
    ├── dataset saber/archivo
    ├── dataset saber/investigacion
    └── dataset saber/docencia
```

:::aviso[La redundancia está en el vdev, no en el pool]
Un pool con varios vdev reparte los datos entre todos. Si se pierde un solo vdev por completo (por ejemplo, un disco suelto sin protección que falla), se pierde todo el pool. Por eso cada vdev tiene que llevar su propia redundancia.
:::

### Tipos de vdev

| Tipo | Discos mínimos | Capacidad útil | Fallos que aguanta |
| --- | :-: | --- | --- |
| Disco suelto | 1 | 1 disco | Ninguno |
| `mirror` | 2 | 1 disco (el de menor tamaño) | Todos menos uno |
| `raidz1` | 3 | *N* − 1 | 1 disco |
| `raidz2` | 4 | *N* − 2 | 2 discos |
| `raidz3` | 5 | *N* − 3 | 3 discos |

`raidz` es la versión de ZFS de RAID 5 y 6. Tiene una ventaja sobre el RAID 5 clásico: usa franjas de tamaño variable y así evita el llamado *write hole*, que es cuando un apagón en mitad de una escritura deja la paridad mal calculada.

Además, un pool puede tener:

- **Discos de repuesto** (*spare*), que esperan sin hacer nada hasta que hace falta que sustituyan a otro.
- **Dispositivos de caché** (`cache`, un SSD que acelera las lecturas) y **de registro** (`log`, un SSD que acelera las escrituras síncronas). En la práctica no los vas a usar.

:::nota[Ampliar un pool]
Lo normal es ampliar un pool **añadiendo otro vdev** con `zpool add`. Añadir un solo disco a un `raidz` que ya existe es algo que solo ha llegado con OpenZFS 2.3, y la versión 2.2, que es la de Ubuntu 24.04, no puede. Por eso conviene pensar el tamaño y el tipo de vdev antes de crear el pool.
:::

:::pregunta[¿Qué diferencia hay entre un vdev, un pool y un dataset?]
Un vdev es un grupo de discos con una redundancia concreta (disco, `mirror` o `raidz`). Un pool es el conjunto de uno o más vdev y suma su capacidad. Un dataset es un sistema de ficheros dentro del pool, con propiedades propias.
:::

:::pregunta[¿Qué ocurre si en un pool con dos vdev se pierde uno de ellos por completo?]
Se pierde todo el pool, porque los datos se reparten entre todos los vdev. Por eso cada vdev debe llevar su propia redundancia.
:::

:::pregunta[Tienes cuatro discos de 2 TB. ¿Qué capacidad útil tendrías con `raidz1`, con `raidz2` y con dos `mirror`?]
Con `raidz1`, *N* − 1 discos: 6 TB. Con `raidz2`, *N* − 2: 4 TB. Con dos `mirror`, cada espejo da un disco: 4 TB en total.
:::

## 3. Crear un pool

Con tres discos en `raidz1` y un cuarto de repuesto, el comando es este:

```bash
sudo zpool create -o ashift=12 saber raidz1 sdb sdc sdd spare sde
```

Vamos por partes:

- `saber` es el nombre del pool, y ZFS lo monta solo en `/saber`.
- `-o ashift=12` indica el tamaño de sector: 2¹² son 4096 bytes (4 KiB), que es lo que usan casi todos los discos actuales. No se puede cambiar una vez creado el pool, y si te quedas corto el rendimiento baja.
- `raidz1 sdb sdc sdd` es el vdev.
- `spare sde` añade el repuesto.

Para ver el estado y el espacio:

```bash
zpool status saber
```

```bash
zpool list saber
```

```bash
zfs list
```

Al principio te va a confundir una cosa: `zpool list` y `zfs list` no dicen lo mismo. El primero enseña el espacio **bruto**, con la paridad dentro, y el segundo el espacio **útil**, el que realmente puedes llenar de datos. Con tres discos de 1 GB en `raidz1`, el bruto son unos 3 GB y el útil algo menos de 2 GB.

:::tip[Nombres de disco estables]
En un servidor de verdad crearías el pool con rutas de `/dev/disk/by-id/...` en lugar de `sdb`, para que un cambio en el orden de los discos no confunda a ZFS.
:::

:::pregunta[¿Por qué `zpool list` y `zfs list` muestran tamaños distintos?]
`zpool list` enseña el espacio bruto, con la paridad incluida, y `zfs list` el espacio útil, el que realmente puedes llenar de datos.
:::

:::pregunta[¿Qué significa `ashift=12` y por qué hay que decidirlo al crear el pool?]
Indica el tamaño de sector: 2¹² son 4096 bytes (4 KiB), el que usan casi todos los discos actuales. No se puede cambiar una vez creado el pool, y si te quedas corto el rendimiento baja.
:::

## 4. Datasets

Un dataset se parece a una carpeta, pero con superpoderes: tiene sus propias propiedades. Se crea con una sola línea:

```bash
sudo zfs create saber/archivo
```

Se monta en `/saber/archivo` y comparte el espacio del pool con los demás. Se pueden anidar (`saber/archivo/siglo-xx`) y los hijos heredan las propiedades del padre, aunque puedes cambiarlas.

Las propiedades se ven con `zfs get` y se cambian con `zfs set`:

```bash
zfs get compression,quota,used saber/archivo
```

```bash
sudo zfs set quota=600M saber/archivo
```

### Cuotas y reservas

Una **cuota** (`quota`) es un tope: el dataset, con sus hijos y sus instantáneas, no puede ocupar más. Una **reserva** (`reservation`) es lo contrario, una garantía: ese espacio queda apartado para el dataset aunque el resto del pool se llene. Sirven para que un departamento no se coma todo el espacio del servidor. Cuando se supera la cuota, al escribir sale el error `Disk quota exceeded`.

### Compresión

```bash
sudo zfs set compression=lz4 saber/archivo
```

`lz4` es un algoritmo muy rápido. Comprimir ahorra espacio y, aunque parezca raro, muchas veces también hace el sistema más rápido: leer y escribir menos bytes del disco compensa de sobra el trabajo de comprimir. Un texto o un registro (*log*) se encoge mucho, pero un vídeo, un `.zip` o un JPG casi nada, porque ya vienen comprimidos.

Con `zfs get compressratio` ves cuánto se ha ahorrado, y comparando `used` con `logicalused` ves lo que ocupa de verdad frente a lo que ocuparía sin comprimir.

:::nota[Solo afecta a lo que escribes a partir de ahora]
Si activas la compresión en un dataset que ya tiene datos, los antiguos se quedan como estaban. Solo se comprimen los bloques nuevos.
:::

### Otras propiedades útiles

| Propiedad | Para qué sirve |
| --- | --- |
| `atime=off` | No apunta la hora del último acceso en cada lectura. Ahorra escrituras |
| `mountpoint` | Cambia dónde se monta el dataset |
| `recordsize` | Tamaño de bloque. Se ajusta para bases de datos o vídeo, pero normalmente no hace falta tocarlo |
| `acltype=posixacl` | Permite usar ACL de Linux ([[permisos-acl]]) |
| `readonly=on` | El dataset no se puede modificar |

:::pregunta[¿Qué diferencia hay entre una cuota y una reserva?]
Una cuota es un tope: el dataset (con hijos e instantáneas) no puede ocupar más. Una reserva es una garantía: ese espacio queda apartado para el dataset aunque el resto del pool se llene.
:::

:::pregunta[¿Por qué activar la compresión puede mejorar el rendimiento?]
Porque leer y escribir menos bytes del disco compensa de sobra el trabajo de comprimir, sobre todo con un algoritmo rápido como `lz4`.
:::

:::pregunta[¿Qué tipo de archivo se beneficia poco de la compresión?]
Los que ya vienen comprimidos, como un vídeo, un `.zip` o un JPG. Un texto o un registro (*log*) se encoge mucho.
:::

## 5. Fallo de un disco

Lo que ocurre depende de la redundancia que tengas, y ZFS te lo cuenta en `zpool status`. Estos son los estados principales:

| Estado | Significado |
| --- | --- |
| `ONLINE` | Todo bien |
| `DEGRADED` | Falta algún disco, pero queda redundancia suficiente: todo funciona, aunque sin protección extra |
| `FAULTED` / `UNAVAIL` | El dispositivo (o el pool) no se puede usar |

Cuando falla un disco, el proceso normal es este:

1. Detectas el fallo, en `zpool status` o por un aviso.
2. Sustituyes el disco con `zpool replace saber disco_viejo disco_nuevo`.
3. Esperas al ***resilver***: ZFS copia o recalcula en el disco nuevo los datos que le tocan. Solo mueve los bloques que están realmente en uso, no el disco entero, así que suele ser más rápido que reconstruir un RAID clásico.
4. Compruebas con `zpool status` que todo vuelve a `ONLINE`.

Si tienes un disco de **repuesto** configurado, es el que se usa para esto. Una vez activado, se quita el disco averiado con `zpool detach` y el repuesto pasa a ser un miembro normal del pool.

### Scrub

```bash
sudo zpool scrub saber
```

Un *scrub* lee todos los datos del pool y comprueba sus sumas. Si encuentra un bloque dañado y hay redundancia, lo repara. Es como revisar un archivo de papel página a página para ver si alguna se está estropeando antes de que la necesites. Conviene programarlo de forma periódica, por ejemplo una vez al mes (Ubuntu ya lo hace por defecto).

:::aviso[Con `raidz1`, mientras se reconstruye no hay red de seguridad]
Si durante la reconstrucción de un disco en un `raidz1` falla otro, se pierde el pool. Por eso con discos grandes se usa `raidz2`, que aguanta dos fallos, y por eso nunca hay que olvidarse de las copias de seguridad.
:::

:::pregunta[Un pool aparece como `DEGRADED`. ¿Se han perdido datos? ¿Qué debes hacer?]
No: `DEGRADED` significa que falta algún disco pero queda redundancia suficiente, y todo funciona sin protección extra. Hay que sustituir el disco con `zpool replace`, esperar al *resilver* y comprobar con `zpool status` que todo vuelve a `ONLINE`.
:::

:::pregunta[¿Qué hace un scrub y cada cuánto conviene lanzarlo?]
Lee todos los datos del pool y comprueba sus sumas; si encuentra un bloque dañado y hay redundancia, lo repara. Conviene programarlo de forma periódica, por ejemplo una vez al mes.
:::

---

## Glosario

| Término | Significado |
| --- | --- |
| OpenZFS | El proyecto abierto que mantiene ZFS |
| Pool (*zpool*) | Conjunto de vdev; el espacio de almacenamiento de ZFS |
| vdev | Grupo de discos con una redundancia concreta (disco, `mirror`, `raidz`) |
| Dataset | Sistema de ficheros dentro de un pool, con propiedades propias |
| `raidz1/2/3` | RAID con paridad simple, doble o triple de ZFS |
| Copy-on-write | Escribir siempre en otro sitio en lugar de sobrescribir |
| Resilver | Reconstrucción de un disco nuevo con los datos que le tocan |
| Scrub | Lectura completa del pool para detectar y reparar errores |
| Cuota | Límite máximo de espacio de un dataset |
| Reserva | Espacio garantizado para un dataset |

## Fuentes y para saber más

| Apartado | Enlace |
| --- | --- |
| 1. Qué es ZFS | [ZFS en Wikipedia](https://es.wikipedia.org/wiki/ZFS) |
| 1–5. Documentación oficial de OpenZFS | [OpenZFS Documentation](https://openzfs.github.io/openzfs-docs/) |
| 1. Copy-on-write | [Copy-on-write](https://es.wikipedia.org/wiki/Copy-on-write) |
| 3. Crear pools | [Manual de zpool-create](https://openzfs.github.io/openzfs-docs/man/master/8/zpool-create.8.html) |
| 4. Propiedades de datasets | [Manual de zfsprops](https://openzfs.github.io/openzfs-docs/man/master/7/zfsprops.7.html) |
| 5. Sustituir discos | [Manual de zpool-replace](https://openzfs.github.io/openzfs-docs/man/master/8/zpool-replace.8.html) |
| 5. Activar repuestos y quitar el disco averiado | [Activating and Deactivating Hot Spares (Oracle Solaris ZFS)](https://docs.oracle.com/en/operating-systems/solaris/oracle-solaris/11.4/manage-zfs/activating-deactivating-hot-spares-your-storage-pool.html) |
| 5. Revisión del pool | [Manual de zpool-scrub](https://openzfs.github.io/openzfs-docs/man/master/8/zpool-scrub.8.html) |

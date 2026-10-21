---
titulo: "Discos, particiones y RAID"
licencia: CC-BY-NC-SA-4.0
---

Todo lo que guarda un ordenador acaba en un disco, y antes de hablar de carpetas compartidas, copias de seguridad o cifrado conviene entender cómo está organizado ese disco por dentro. En este primer tema vamos a recorrer las capas que hay entre el metal (o el chip) y tus archivos, y luego veremos qué se puede hacer para que un disco estropeado no se lleve tus datos por delante.

Es el primero de una serie de ocho. Los siguientes son [[zfs-pools-datasets]], [[cifrado-datos]], [[permisos-acl]], [[instantaneas-copias]], [[compartir-linux]], [[compartir-windows]] y [[monitorizacion-almacenamiento]].

## Qué vas a aprender

Al terminar este tema deberías ser capaz de:

- Explicar qué es un disco, una partición y un sistema de ficheros, y qué papel juega cada capa.
- Distinguir MBR de GPT y saber cuál conviene usar hoy.
- Montar un sistema de ficheros en Linux y hacer que se monte solo al arrancar.
- Contar qué aporta LVM frente a las particiones normales.
- Describir los niveles RAID más habituales (0, 1, 5, 6 y 10), calcular su capacidad útil y decir cuántos discos pueden fallar sin perder datos.
- Explicar por qué RAID no es una copia de seguridad.

---

## 1. Capas del almacenamiento

Cuando guardas un documento no lo mandas "al disco" y listo. Antes de llegar allí pasa por varias capas, y cada una resuelve un problema distinto.

| Capa | Qué es | Ejemplo |
| --- | --- | --- |
| Disco físico | El dispositivo: HDD, SSD o NVMe. Solo sabe leer y escribir bloques numerados | `/dev/sda`, `/dev/nvme0n1`, `Disco 0` en Windows |
| Tabla de particiones | Un mapa al principio del disco que dice dónde empieza y dónde acaba cada trozo | MBR o GPT |
| Partición | Un trozo del disco que se comporta como si fuera un disco independiente | `/dev/sda1` |
| Sistema de ficheros | La forma de organizar los bloques en archivos y carpetas, con nombres, permisos y fechas | ext4, XFS, NTFS, ZFS |
| Punto de montaje | El sitio por el que entras al contenido: una carpeta en Linux, una letra en Windows | `/datos`, `D:` |

Un disco sin sistema de ficheros es como un archivador sin cajones ni etiquetas: cabe de todo, pero no hay quien encuentre nada. Por eso, antes de usar un disco nuevo, lo normal es **particionarlo** (a veces se omite) y **formatearlo** con un sistema de ficheros.

:::nota[Nombres de disco en Linux]
En Linux los discos aparecen como archivos dentro de `/dev`. Los SATA y los USB se llaman `sda`, `sdb`, `sdc`... según el orden en que el sistema los detecta, y los NVMe se llaman `nvme0n1`. Las particiones añaden un número: `sda1`, `sda2`. Ese orden puede cambiar si conectas o quitas discos, así que en producción se prefieren nombres estables, como los de `/dev/disk/by-id/`, que incluyen el número de serie.
:::

## 2. MBR y GPT

La tabla de particiones es lo primero que lee el equipo al arrancar. Hay dos formatos y conviene conocer ambos, aunque hoy casi siempre vas a usar el segundo.

| | MBR | GPT |
| --- | --- | --- |
| Nombre completo | *Master Boot Record* | *GUID Partition Table* |
| Antigüedad | Años 80 | Parte del estándar UEFI |
| Tamaño máximo de disco | 2 TiB | Prácticamente ilimitado |
| Particiones | 4 primarias (o 3 primarias y 1 extendida con lógicas dentro) | 128 por defecto en Windows |
| Robustez | Una sola copia de la tabla | Copia de seguridad de la tabla al final del disco, con suma de comprobación |
| Arranque | BIOS clásica | UEFI (y también BIOS con algunos ajustes) |

La regla práctica es usar GPT salvo que haya un motivo para no hacerlo, como un equipo muy antiguo. Si inicializas un disco nuevo de 4 TB con MBR, solo podrás aprovechar 2 TiB. Tienes más detalle en las páginas de [MBR](https://es.wikipedia.org/wiki/Registro_de_arranque_principal) y de [GPT](https://es.wikipedia.org/wiki/Tabla_de_particiones_GUID).

Las herramientas habituales son estas:

- En Linux, `lsblk` para ver los discos, `fdisk` o `parted` para particionar (`parted` maneja GPT con comodidad) y `mkfs.ext4` para formatear.
- En Windows, la **Administración de discos** (`diskmgmt.msc`) o `diskpart`.

:::pregunta[¿Para qué sirve una tabla de particiones y qué diferencia hay entre MBR y GPT?]
Es un mapa al principio del disco que indica dónde empieza y acaba cada partición. MBR es antiguo: máximo de 2 TiB, 4 particiones primarias y una sola copia de la tabla. GPT, parte de UEFI, admite discos prácticamente ilimitados, 128 particiones por defecto en Windows y guarda una copia de la tabla al final con suma de comprobación. Hoy se usa GPT salvo que haya un motivo para no hacerlo.
:::

## 3. Sistemas de ficheros

El sistema de ficheros decide cómo se guardan los archivos en el disco. Estos son los que más te vas a encontrar:

| Sistema | Dónde se usa | Qué lo caracteriza |
| --- | --- | --- |
| [ext4](https://es.wikipedia.org/wiki/Ext4) | Linux, por defecto | Muy estable. Lleva un diario (*journal*) para recuperarse bien después de un apagón |
| [XFS](https://es.wikipedia.org/wiki/XFS) | Servidores Linux, sobre todo de la familia Red Hat | Rápido con archivos grandes. Se puede ampliar, pero no reducir |
| [NTFS](https://es.wikipedia.org/wiki/NTFS) | Windows | Permisos por usuario (ACL), cifrado (EFS), cuotas y compresión |
| FAT32 / exFAT | Memorias USB y tarjetas | No tiene permisos. FAT32 no admite archivos de más de 4 GiB |
| [ZFS](https://es.wikipedia.org/wiki/ZFS) | Servidores de almacenamiento | Se ocupa a la vez de los discos, los volúmenes y los ficheros ([[zfs-pools-datasets]]) |

Lo del diario merece una explicación. Un sistema con diario no escribe los cambios directamente: primero los apunta en un cuaderno. Si se va la luz a mitad de una operación, al volver a arrancar lee ese cuaderno y deshace o termina lo que había quedado a medias, en lugar de revisar el disco entero.

:::pregunta[¿Qué es un sistema de ficheros con diario y qué ventaja tiene?]
Uno que primero apunta los cambios en un diario (*journal*) y después los aplica. Si se va la luz a mitad de una operación, al arrancar lee el diario y deshace o termina lo pendiente, sin revisar el disco entero.
:::

## 4. Montar un sistema de ficheros en Linux

En Windows cada volumen recibe una letra (`C:`, `D:`). En Linux, en cambio, hay un único árbol de directorios que empieza en `/`, y cada sistema de ficheros se **monta** en una carpeta de ese árbol. Para ti, `/datos` y `/home` pueden estar en discos distintos y no notarías la diferencia.

```bash
sudo mount /dev/sdb1 /datos
```

Eso dura hasta el siguiente reinicio. Para que el montaje sea permanente hay que añadir una línea a `/etc/fstab`:

```text
UUID=3f1c8a2e-...  /datos  ext4  defaults  0  2
```

Las columnas son, por orden: qué se monta, dónde, de qué tipo es, con qué opciones, si la herramienta `dump` debe copiarlo (casi siempre `0`) y en qué orden lo revisa `fsck` al arrancar (`1` para `/`, `2` para el resto y `0` para no revisarlo).

:::tip[Usa el UUID en lugar de `/dev/sdb1`]
Con `blkid` ves el UUID de cada partición. Es un identificador que se guarda dentro del propio sistema de ficheros y no cambia aunque el disco pase a llamarse `sdc`. Si pones `/dev/sdb1` en `fstab` y el orden de los discos cambia, puedes acabar montando justo lo que no era.
:::

:::aviso[Un `fstab` roto puede impedir que el equipo arranque]
Si una línea está mal escrita o el disco ya no existe, el sistema puede quedarse en modo de emergencia. Cada vez que edites `fstab`, ejecuta `sudo mount -a` antes de reiniciar: si hay un error, lo verás ahí. Para discos que pueden faltar (un USB o un recurso de red) se usa la opción `nofail`.
:::

:::pregunta[¿Por qué es mejor usar el UUID que `/dev/sdb1` en `fstab`?]
Porque el UUID se guarda dentro del sistema de ficheros y no cambia aunque el disco pase a llamarse `sdc`, mientras que `/dev/sdb1` depende del orden de detección y podría acabar montando el disco equivocado.
:::

:::pregunta[Has editado `/etc/fstab`. ¿Qué haces antes de reiniciar?]
Ejecutar `sudo mount -a`: si hay un error en alguna línea, aparece ahí, y se evita que el equipo se quede en modo de emergencia al arrancar.
:::

## 5. LVM

Con particiones normales, el tamaño que eliges al principio es el que te toca. Si `/datos` se llena y el disco ya está repartido, ampliar es incómodo. **LVM** (*Logical Volume Manager*) mete una capa intermedia que lo soluciona, y funciona con tres piezas:

1. **PV** (*Physical Volume*): un disco o una partición que entregas a LVM.
2. **VG** (*Volume Group*): un depósito que junta el espacio de varios PV.
3. **LV** (*Logical Volume*): el trozo que recortas del VG y que formateas como si fuera una partición.

Lo mejor es que el LV se puede **ampliar en caliente**: añades otro disco al VG, estiras el LV y, con un sistema de ficheros como ext4 o XFS, haces crecer también el sistema que hay encima. Es lo que usa Ubuntu Server cuando eliges "usar todo el disco con LVM" durante la instalación.

Las órdenes principales son `pvcreate`, `vgcreate`, `lvcreate`, `lvextend` y, para ext4, `resize2fs`.

:::nota[¿Y ZFS?]
ZFS hace él solo lo que aquí hacen por separado las particiones, LVM, RAID y el sistema de ficheros. Lo vemos en [[zfs-pools-datasets]]. Pero conviene entender primero cada capa por su lado, porque en la mayoría de los equipos que te vas a encontrar seguirán estando separadas.
:::

:::pregunta[¿Qué ventaja da LVM frente a las particiones normales?]
Permite ampliar los volúmenes lógicos en caliente: se añade otro disco al grupo de volúmenes, se estira el LV y, con ext4 o XFS, se hace crecer el sistema de ficheros, sin repartir el disco de antemano.
:::

## 6. Sistemas RAID

Los discos fallan. No es cuestión de si ocurrirá, sino de cuándo. [RAID](https://es.wikipedia.org/wiki/RAID) (*Redundant Array of Independent Disks*) junta varios discos para que el sistema los vea como uno solo, y lo hace para ganar velocidad, tolerancia a fallos o las dos cosas a la vez.

Todo se reduce a dos ideas:

- **Striping** (reparto): los datos se trocean y cada trozo va a un disco distinto. Se lee y se escribe en paralelo, así que es más rápido, pero no hay ninguna protección.
- **Redundancia**: se guarda información de más para poder reconstruir lo que había en un disco que falle. Puede ser un **espejo** (una copia idéntica) o **paridad** (un dato calculado que permite deducir lo que falta).

### Niveles RAID más habituales

| Nivel | Cómo funciona | Discos mínimos | Capacidad útil con *N* discos iguales | Fallos que aguanta |
| --- | --- | :-: | --- | --- |
| RAID 0 | Solo striping | 2 | *N* | Ninguno: si falla un disco, se pierde todo |
| RAID 1 | Espejo: todo se escribe en dos discos | 2 | La de un disco | Un disco (más si hay más copias) |
| RAID 5 | Striping con paridad repartida | 3 | *N* − 1 | Un disco |
| RAID 6 | Striping con doble paridad | 4 | *N* − 2 | Dos discos |
| RAID 10 | Parejas en espejo (RAID 1) repartidas en striping (RAID 0) | 4 | *N* / 2 | Uno por pareja; dos si no son de la misma pareja |

Un ejemplo con cuatro discos de 1 TB: RAID 0 te da 4 TB sin ninguna protección, RAID 5 te da 3 TB, y RAID 6 y RAID 10 te dan 2 TB cada uno.

¿Cómo se recupera un disco cuando hay paridad? En RAID 5 la paridad es una operación sencilla, un XOR. Si tienes dos datos, `A` y `B`, y su paridad `P = A XOR B`, y pierdes `B`, lo recuperas calculando `A XOR P`. Con más discos funciona igual.

### Qué nivel elegir

Depende de lo que te importe:

- Si lo que buscas es velocidad y los datos son prescindibles (archivos temporales, cachés), RAID 0.
- Si tienes pocos discos y quieres algo sencillo, como un servidor pequeño con dos, RAID 1.
- Si necesitas mucho espacio con una protección razonable, RAID 5 o RAID 6. Con discos grandes se prefiere el 6: reconstruir un RAID 5 de varios TB lleva horas o días, y durante todo ese tiempo un segundo fallo se lo llevaría por delante.
- Para bases de datos y cargas con muchas escrituras, RAID 10, que es rápido y se reconstruye sin hacer cálculos.

### RAID por hardware y por software

El RAID por hardware lo hace una tarjeta controladora. Quita trabajo al procesador, pero si la tarjeta se estropea puedes necesitar otra igual para recuperar tus datos. El RAID por software lo hace el propio sistema operativo: `mdadm` en Linux, **Espacios de almacenamiento** en Windows Server, y los `mirror` y `raidz` de ZFS que veremos en el tema siguiente. Es flexible, barato y no depende de una tarjeta concreta.

:::aviso[RAID no es una copia de seguridad]
Un RAID te protege de que un disco se estropee, y de nada más. No te salva si borras un archivo por error, si un virus cifra tus datos, si falla el software, o si hay un incendio o un robo. En todos esos casos, el RAID replica el desastre en todos los discos al instante. Para eso están las copias de seguridad, que vemos en [[instantaneas-copias]].
:::

:::pregunta[Tienes 5 discos de 2 TB. ¿Qué capacidad útil tendrías en RAID 5, en RAID 6 y en RAID 0?]
RAID 5: *N* − 1 = 4 discos, 8 TB. RAID 6: *N* − 2 = 3 discos, 6 TB. RAID 0: *N* = 5 discos, 10 TB, sin ninguna protección.
:::

:::pregunta[¿Cuántos discos pueden fallar en un RAID 6 y en un RAID 10 de 4 discos?]
En RAID 6, dos discos cualesquiera. En RAID 10, uno por pareja de espejo: dos discos si no son de la misma pareja, pero si fallan los dos de una misma pareja se pierde el RAID.
:::

:::pregunta[¿Por qué se prefiere RAID 6 a RAID 5 con discos muy grandes?]
Porque reconstruir un RAID 5 de varios TB lleva horas o días, y durante todo ese tiempo un segundo fallo se llevaría los datos. RAID 6 aguanta ese segundo fallo.
:::

:::pregunta[Un compañero dice: "Ya tengo RAID 1, no necesito copia de seguridad". ¿Qué le respondes?]
Que RAID solo protege de que un disco se estropee. No salva de un borrado por error, un virus, un fallo de software, un incendio o un robo: el RAID replica el desastre en todos los discos al instante.
:::

:::pregunta[¿Qué ventaja y qué riesgo tiene el RAID por hardware frente al de software?]
Ventaja: la tarjeta controladora quita trabajo al procesador. Riesgo: si la tarjeta se estropea, puede hacer falta otra igual para recuperar los datos; el RAID por software es flexible, barato y no depende de una tarjeta concreta.
:::

---

## Glosario

| Término | Significado |
| --- | --- |
| Partición | Trozo de un disco que se trata como si fuera independiente |
| Sistema de ficheros | Forma de organizar archivos y carpetas dentro de una partición o volumen |
| Montar | Hacer accesible un sistema de ficheros en una carpeta del árbol de directorios |
| `fstab` | Fichero de Linux que lista lo que se monta al arrancar |
| UUID | Identificador único que no cambia aunque cambie el nombre del dispositivo |
| LVM | Capa de Linux para crear volúmenes lógicos que se pueden ampliar |
| Striping | Repartir los datos en trozos entre varios discos |
| Paridad | Dato calculado que permite reconstruir un trozo perdido |
| RAID | Conjunto de discos que funciona como uno solo para ganar velocidad o tolerancia a fallos |

## Fuentes y para saber más

| Apartado | Enlace |
| --- | --- |
| 2. MBR y GPT | [Tabla de particiones GUID](https://es.wikipedia.org/wiki/Tabla_de_particiones_GUID) |
| 3. Sistemas de ficheros | [Sistema de archivos](https://es.wikipedia.org/wiki/Sistema_de_archivos) |
| 5. LVM | [LVM](https://es.wikipedia.org/wiki/LVM) |
| 6. RAID | [RAID](https://es.wikipedia.org/wiki/RAID) |
| 6. RAID por software en Linux | [Manual de mdadm](https://manpages.debian.org/bookworm/mdadm/mdadm.8.en.html) |

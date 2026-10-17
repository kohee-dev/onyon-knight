---
titulo: "Compartir recursos en Linux (Samba y NFS)"
licencia: CC-BY-NC-SA-4.0
---

Tener los datos bien guardados y protegidos no sirve de mucho si nadie puede llegar a ellos. Un servidor de ficheros existe para que otros equipos de la red lean y escriban en él como si la carpeta estuviera en su propio disco. En Linux eso se hace con dos protocolos distintos, según quién sea el cliente: **Samba** para Windows y **NFS** para otros Linux.

Aquí solo nos ocupamos del servicio de compartición. Cómo se resuelven los nombres de los equipos (DNS) o cómo se reparten las direcciones IP (DHCP) lo verás a fondo en otro módulo.

## Qué vas a aprender

Al terminar este tema deberías ser capaz de:

- Explicar qué es un recurso compartido y cómo se accede a él desde Windows y desde Linux.
- Distinguir los protocolos SMB/CIFS y NFS y elegir el adecuado según el cliente.
- Instalar y configurar Samba para compartir carpetas con permisos por grupo.
- Entender por qué un usuario de Samba tiene su propia contraseña.
- Exportar una carpeta con NFS y montarla desde un cliente.
- Explicar por qué NFS depende de que los UID coincidan y qué hace `root_squash`.
- Combinar los permisos del recurso compartido con los del sistema de ficheros.

---

## 1. Qué es compartir en red

Cuando compartes una carpeta, el servidor la ofrece a la red con un nombre y el cliente la **monta** (en Windows se dice "conectar una unidad de red"), de manera que aparece como si fuera local. Por detrás hay un protocolo, un acuerdo sobre cómo se piden los archivos, cómo te identificas y qué puedes hacer.

| | SMB / CIFS | NFS |
| --- | --- | --- |
| Nace en | IBM y Microsoft | Sun Microsystems |
| Cliente típico | Windows (y también Linux y macOS) | Linux y Unix |
| Servidor en Linux | Samba | `nfs-kernel-server` |
| Cómo te identifica | Usuario y contraseña | Por defecto, tu número de usuario (UID) y la IP del cliente |
| Puerto | 445/tcp | 2049 (NFSv4) |
| Se usa para | Carpetas de usuarios y departamentos en redes con Windows | Compartir entre servidores Linux y almacenamiento de virtualización |

La regla sencilla es esta: si el cliente es Windows, Samba; si es Linux, NFS. Samba también sirve a clientes Linux, pero NFS suele integrarse mejor con los permisos de Unix.

---

## 2. Samba: compartir con Windows

[Samba](https://es.wikipedia.org/wiki/Samba_(software%29) es una implementación libre del protocolo [SMB](https://es.wikipedia.org/wiki/Protocolo_Server_Message_Block). Con ella, un servidor Linux se comporta, para un cliente Windows, como un servidor de ficheros de Windows más.

### Versiones de SMB

- **SMB1** es el original, de los años 90. Está obsoleto y es inseguro: fue el protocolo por el que se propagó el ransomware WannaCry. Windows 10 y 11 ya no lo instalan, y Samba lo trae desactivado.
- **SMB2** (2006) y **SMB3** (2012) son los actuales. Son más rápidos y más seguros, y SMB3 permite además cifrar el tráfico.

### Instalar

```bash
sudo apt install samba
```

El servicio se llama `smbd` y la configuración está en `/etc/samba/smb.conf`.

### Configurar recursos compartidos

El fichero tiene una sección `[global]` con las opciones generales y una sección por cada recurso. Un recurso sencillo se ve así:

```ini
[archivo]
   path = /saber/archivo
   valid users = @archivo @investigacion
   write list = @archivo
   create mask = 0660
   directory mask = 2770
```

| Opción | Qué hace |
| --- | --- |
| `[archivo]` | El nombre con el que se verá el recurso en la red |
| `path` | La carpeta del servidor que se comparte |
| `valid users` | Quién puede entrar. `@grupo` significa "los del grupo" |
| `write list` | Quién puede escribir. Los demás de `valid users` solo leen |
| `create mask` / `directory mask` | Permisos máximos con los que se crean los archivos y carpetas nuevos |

Después de editar, comprueba la sintaxis antes de reiniciar:

```bash
testparm -s
```

```bash
sudo systemctl restart smbd
```

### Usuarios de Samba

Los usuarios de Samba tienen que existir también como usuarios de Linux, pero Samba guarda **su propia contraseña**, distinta de la de Linux. La razón es técnica: el protocolo SMB comprueba la contraseña con un método que necesita un formato que Linux no guarda en `/etc/shadow`. Así que cada persona se da de alta con:

```bash
sudo smbpasswd -a irene
```

Es una de las causas más habituales de "usuario o contraseña incorrectos" la primera vez que pruebas: el usuario existe en Linux, pero nadie lo ha dado de alta en Samba.

### Dos capas de permisos

Un acceso por Samba tiene que pasar dos filtros, y manda el más restrictivo:

1. Los permisos **del recurso compartido** (`valid users`, `write list`, `read only`).
2. Los permisos **de Linux** de las carpetas y archivos (usuario, grupo, ACL), que se aplican al usuario que entra.

Si el recurso dice que Nuria puede escribir pero la carpeta es `2770` de otro grupo, Nuria no escribirá. Y al revés. Cuando algo no funcione, mira siempre las dos capas.

### Acceder desde el cliente

Desde **Windows** escribes la ruta UNC en el Explorador o conectas una unidad:

```text
\\192.168.50.40\archivo
```

```text
net use Z: \\192.168.50.40\archivo /user:irene
```

Windows recuerda las credenciales con las que entraste la primera vez. Si quieres probar con otro usuario, cierra antes las conexiones con `net use * /delete`.

Desde **Linux**, `smbclient` abre una sesión parecida a la de FTP, y `mount -t cifs` monta el recurso como una carpeta (necesitas los paquetes `smbclient` y `cifs-utils`):

```bash
smbclient //192.168.50.40/archivo -U irene
```

```bash
sudo mount -t cifs //192.168.50.40/archivo /mnt/archivo -o username=irene
```

---

## 3. NFS: compartir entre Linux

[NFS](https://es.wikipedia.org/wiki/Network_File_System) (*Network File System*) permite que un cliente Linux monte una carpeta de otro servidor como si fuera local. Es sencillo y muy rápido. Hoy se usa la versión **NFSv4**, que funciona por un único puerto (2049) y es más fácil de proteger que las anteriores.

### Servidor

```bash
sudo apt install nfs-kernel-server
```

Las carpetas que se ofrecen (las **exportaciones**) se definen en `/etc/exports`:

```text
/saber/docencia 192.168.50.0/24(rw,sync,no_subtree_check)
```

Cada línea tiene la carpeta, a quién se ofrece (aquí, la red `192.168.50.0/24`) y, entre paréntesis, las opciones:

| Opción | Significado |
| --- | --- |
| `rw` / `ro` | Lectura y escritura, o solo lectura |
| `sync` | El servidor confirma una escritura cuando ya está en disco. Es más seguro; `async` es más rápido, pero puede perder datos si hay un corte |
| `no_subtree_check` | Evita una comprobación costosa y propensa a errores. Es lo recomendado |
| `root_squash` | (por defecto) El `root` del cliente se trata como un usuario sin privilegios |
| `no_root_squash` | El `root` del cliente tiene poderes de `root` sobre la exportación |

Para aplicar los cambios sin reiniciar el servicio:

```bash
sudo exportfs -ra
```

Y `sudo exportfs -v` te lista lo que se está exportando.

### Cliente

```bash
sudo apt install nfs-common
```

```bash
sudo mount -t nfs 192.168.50.40:/saber/docencia /mnt/docencia
```

Para que se monte solo, se añade a `/etc/fstab`. En los recursos de red se usan opciones que evitan problemas si el servidor no responde durante el arranque:

```text
192.168.50.40:/saber/docencia /mnt/docencia nfs defaults,_netdev,noauto,x-systemd.automount,x-systemd.idle-timeout=60 0 0
```

`x-systemd.automount` hace que se monte al primer acceso y no durante el arranque, `noauto` evita que ese montaje bloquee el arranque y `_netdev` marca que depende de la red.

### Los UID tienen que coincidir

Con la configuración habitual, NFS no comprueba tu contraseña. Se fía del cliente: el cliente dice "este es el usuario 1004" y el servidor le deja actuar como el usuario 1004. Lo que cuenta son los números, no los nombres.

Por eso, si `elena` es el usuario 1004 en el servidor pero en el cliente es el 1001, el servidor verá a otra persona. La solución sencilla es crear los usuarios con el mismo UID y GID en las dos máquinas. Con unos pocos usuarios es manejable, pero con cientos no lo es, y para eso existe el directorio centralizado (LDAP) que verás más adelante: un único sitio que le dice a todas las máquinas quién es el 1004.

### `root_squash`

Si el `root` de cualquier cliente pudiera actuar como `root` en el servidor, bastaría con tener privilegios en un portátil para leer o cambiar cualquier archivo exportado. `root_squash` lo evita: el servidor convierte a `root` en el usuario anónimo `nobody`. Solo se activa `no_root_squash` cuando confías por completo en el cliente.

:::aviso[NFS por IP no es una autenticación fuerte]
Limitar la exportación a una red o una IP reduce el riesgo, pero quien consiga una IP permitida y cree un usuario con el UID que quiera podrá hacerse pasar por otra persona. NFS también puede autenticar con Kerberos, pero la configuración es más compleja y queda fuera de este tema.
:::

---

## Glosario

| Término | Significado |
| --- | --- |
| Recurso compartido | Carpeta que un servidor ofrece a la red bajo un nombre |
| SMB / CIFS | Protocolo de compartición de ficheros de Windows |
| Samba | Implementación libre de SMB para Linux |
| NFS | Protocolo de compartición de ficheros de Unix y Linux |
| Exportación | Carpeta que un servidor NFS ofrece a ciertos clientes |
| Ruta UNC | Forma de escribir una ruta de red en Windows: `\\servidor\recurso` |
| `smbpasswd` | Orden para dar de alta a un usuario y su contraseña en Samba |
| `root_squash` | Convierte al `root` del cliente en un usuario sin privilegios |

## Comprueba lo que sabes

:::ejercicio[Repaso]
1. ¿Qué protocolo usarías para compartir una carpeta con equipos Windows y cuál para otros servidores Linux?
2. ¿Por qué no se debe usar SMB1?
3. Un usuario existe en Linux pero Samba rechaza su contraseña. ¿Qué falta?
4. En `smb.conf` un recurso tiene `valid users = @archivo @investigacion` y `write list = @archivo`. ¿Qué puede hacer un miembro de `investigacion`?
5. Un usuario de `archivo` entra en el recurso pero no puede escribir, aunque está en `write list`. ¿Qué miras?
6. ¿Para qué sirve `testparm`?
7. En una exportación NFS, ¿qué diferencia hay entre `sync` y `async`?
8. `elena` es el UID 1004 en el servidor NFS y el 1001 en el cliente. ¿Qué pasará?
9. ¿Qué hace `root_squash` y por qué es útil?
10. ¿Qué ventaja tiene `x-systemd.automount` en `fstab` para un recurso de red?
:::

## Fuentes y para saber más

| Apartado | Enlace |
| --- | --- |
| 2. Samba | [Samba en Wikipedia](https://es.wikipedia.org/wiki/Samba_(software%29) |
| 2. SMB | [Protocolo Server Message Block](https://es.wikipedia.org/wiki/Protocolo_Server_Message_Block) |
| 2. Configuración de Samba | [Manual de smb.conf](https://www.samba.org/samba/docs/current/man-html/smb.conf.5.html) |
| 2. Samba en Ubuntu | [Set up Samba as a file server (Ubuntu Server)](https://ubuntu.com/server/docs/how-to/samba/file-server/) |
| 3. NFS | [Network File System](https://es.wikipedia.org/wiki/Network_File_System) |
| 3. Exportaciones | [Manual de exports](https://manpages.debian.org/bookworm/nfs-kernel-server/exports.5.en.html) |
| 3. NFS en Ubuntu | [Network File System (Ubuntu Server)](https://ubuntu.com/server/docs/how-to/networking/install-nfs/) |

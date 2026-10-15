---
titulo: "Servidor de archivos en Windows"
licencia: CC-BY-NC-SA-4.0
---

En el tema anterior compartiste carpetas desde Linux. Windows Server hace lo mismo con sus propias herramientas, y en muchísimas empresas sigue siendo el servidor de ficheros principal. Lo más importante que vas a aprender aquí es cómo se combinan dos capas de permisos, y qué herramientas te dan control sobre el espacio y el tipo de archivos que se guardan.

## Qué vas a aprender

Al terminar este tema deberías ser capaz de:

- Compartir una carpeta en Windows Server y acceder a ella con una ruta UNC o con una unidad de red.
- Explicar la diferencia entre permisos de compartición y permisos NTFS, y cómo se combinan.
- Entender qué son los recursos ocultos (`$`) y los recursos administrativos.
- Ocultar a cada usuario lo que no puede abrir con la enumeración basada en el acceso.
- Usar el Administrador de recursos del servidor de archivos (FSRM) para poner cuotas y filtros de archivos.
- Describir qué son las versiones anteriores y cómo se relacionan con las instantáneas.

---

## 1. Compartir una carpeta

En Windows Server, un **recurso compartido** (*share*) es una carpeta del servidor que se ofrece a la red con un nombre. El protocolo es el mismo [SMB](https://es.wikipedia.org/wiki/Protocolo_Server_Message_Block) que usa Samba, así que los clientes Windows y Linux acceden sin diferencias.

Se puede hacer desde varios sitios:

- **Administrador del servidor**, en *Servicios de archivo y almacenamiento* → *Recursos compartidos*.
- El **Explorador**: propiedades de la carpeta → pestaña *Compartir*.
- **PowerShell**, que es lo más repetible:

  ```powershell
  New-SmbShare -Name 'Escuela' -Path 'D:\Escuela' -ChangeAccess 'Everyone'
  ```

Desde un cliente se accede con la **ruta UNC** `\\servidor\Escuela` o conectando una unidad de red:

```text
net use Z: \\192.168.50.43\Escuela
```

Dos cosas sobre los nombres:

- Si el nombre termina en **`$`**, el recurso está **oculto**: no aparece al explorar la red, pero se abre si conoces la ruta (`\\servidor\Escuela$`). Es discreción, no seguridad.
- Windows crea por su cuenta unos **recursos administrativos** ocultos: `C$` (la raíz de cada disco), `ADMIN$` (la carpeta del sistema) e `IPC$` (para la comunicación entre procesos). Solo los administradores pueden usarlos.

## 2. Dos capas de permisos

Esta es la clave del tema. Cuando alguien accede por la red, Windows aplica dos juegos de permisos y se queda con el más restrictivo de cada caso:

| Capa | Dónde se define | A quién afecta |
| --- | --- | --- |
| Permisos de compartición | En el recurso compartido | Solo a quien entra por la red |
| Permisos NTFS | En el sistema de ficheros (pestaña *Seguridad*) | A todos: red y consola local |

Los permisos de compartición son solo tres: **Lectura**, **Cambiar** y **Control total**. Los NTFS son mucho más finos ([[permisos-acl]]). El permiso efectivo por la red es el menor de los dos.

| Compartición | NTFS | Por la red puedes | Iniciando sesión en el servidor puedes |
| --- | --- | --- | --- |
| Lectura | Control total | Solo leer | Todo |
| Control total | Lectura | Solo leer | Solo leer |
| Cambiar | Modificar | Modificar | Modificar |

:::tip[La práctica recomendada]
Para no volverse loco, la mayoría de administradores da Cambiar o Control total a `Todos` (o a `Usuarios autenticados`) en la compartición, y gestiona el control fino solo con NTFS. Así hay un único sitio donde mirar. Los permisos NTFS, además, protegen cuando alguien accede en local o cuando la carpeta se comparte con otro nombre.
:::

Para diagnosticar, en las propiedades avanzadas de seguridad tienes la pestaña **Acceso efectivo**, que calcula lo que puede hacer un usuario concreto sobre esa carpeta. Ojo: solo tiene en cuenta NTFS, y la compartición hay que mirarla aparte.

## 3. Enumeración basada en el acceso

Aunque un usuario no pueda abrir una carpeta, por defecto la ve en la lista. No es un fallo grave de seguridad, pero es incómodo y cuenta más de lo que debería: el nombre `Despidos-2026` ya cuenta una historia. La **enumeración basada en el acceso** (*Access-Based Enumeration*, ABE) hace que cada usuario vea solo lo que tiene permiso para abrir.

```powershell
Set-SmbShare -Name 'Escuela' -FolderEnumerationMode AccessBased
```

## 4. FSRM: cuotas y filtros de archivos

El **Administrador de recursos del servidor de archivos** (FSRM, *File Server Resource Manager*) es un rol de Windows Server que sirve para controlar qué se guarda y cuánto. Se instala como una característica:

```powershell
Install-WindowsFeature FS-FileServer, FS-Resource-Manager -IncludeManagementTools
```

### Cuotas

Una **cuota** limita el espacio que puede ocupar una carpeta. Las hay de dos tipos:

| Tipo | Qué hace al llegar al límite |
| --- | --- |
| Dura | Impide guardar más |
| Blanda | Deja seguir, pero avisa (por correo, en el registro de eventos...) |

Puedes definir umbrales intermedios, por ejemplo avisar al 85 % y al 95 %. Y las cuotas se pueden crear a partir de plantillas, para aplicar la misma a muchas carpetas.

```powershell
New-FsrmQuota -Path 'D:\Escuela\Archivo' -Size 100MB
```

### Filtros de archivos

Un **filtro** (*file screen*) impide o registra que se guarden ciertos tipos de archivo, agrupados por patrón. Puede ser activo, que bloquea el guardado, o pasivo, que lo permite pero lo anota. Es útil para que nadie llene el servidor de música, vídeos o ejecutables en una carpeta de documentos.

```powershell
New-FsrmFileGroup -Name 'Multimedia' -IncludePattern '*.mp3','*.mp4'
```

```powershell
New-FsrmFileScreen -Path 'D:\Escuela' -IncludeGroup 'Multimedia' -Active
```

:::aviso[Un filtro mira la extensión, no el contenido]
Si alguien renombra `cancion.mp3` a `cancion.txt`, el filtro no lo detecta. Es una barrera contra el descuido, no contra alguien decidido.
:::

FSRM también genera **informes** de almacenamiento: los archivos más grandes, los duplicados, los que nadie abre...

## 5. Versiones anteriores

Los servidores Windows pueden hacer **instantáneas de volumen** con el servicio VSS (*Volume Shadow Copy Service*), que se programan en las propiedades del disco, en la pestaña *Instantáneas*. Con ellas activadas, un usuario puede hacer clic derecho sobre un archivo o carpeta de la red, elegir *Propiedades* → **Versiones anteriores** y recuperar lo que borró sin pedir ayuda a nadie.

Es el mismo concepto que las instantáneas de ZFS de [[instantaneas-copias]]: una foto del volumen en un momento dado, que sirve para deshacer errores rápidos pero no sustituye a una copia de seguridad, porque si el disco se pierde se pierde todo.

## 6. Otras opciones

- **DFS** (*Distributed File System*): junta carpetas de varios servidores bajo un único nombre de red y puede replicarlas entre sedes. Lo verás más adelante, con los dominios.
- **Espacios de almacenamiento** y **deduplicación**: son el equivalente en Windows del RAID por software y de la deduplicación de ZFS.
- **SMB 3 con cifrado**: puedes exigir que los datos viajen cifrados por la red al acceder a un recurso (`Set-SmbShare -EncryptData $true`).

:::nota[Con un dominio, los grupos serán de dominio]
En la práctica los usuarios y grupos serán locales del servidor. En un dominio de Active Directory (que verás más adelante) se usan los grupos del dominio, pero la forma de pensar es la misma: permisos NTFS a los grupos y personas dentro de los grupos.
:::

---

## Glosario

| Término | Significado |
| --- | --- |
| Recurso compartido | Carpeta que un servidor ofrece a la red |
| Ruta UNC | `\\servidor\recurso` |
| Recurso oculto | Recurso cuyo nombre acaba en `$`; no aparece al explorar |
| Permisos de compartición | Lectura, Cambiar, Control total; solo se aplican por la red |
| Permisos NTFS | Permisos del sistema de ficheros, siempre activos |
| ABE | Enumeración basada en el acceso: cada usuario ve solo lo que puede abrir |
| FSRM | Rol de Windows Server para cuotas, filtros e informes |
| Cuota dura / blanda | Impide / solo avisa al llegar al límite |
| VSS | Servicio de instantáneas de volumen de Windows |

## Comprueba lo que sabes

:::ejercicio[Repaso]
1. ¿Qué significa que un recurso compartido termine en `$`?
2. El permiso de compartición es "Lectura" y el NTFS es "Control total". ¿Qué puede hacer el usuario por la red y qué desde la consola del servidor?
3. ¿Por qué muchos administradores dan "Cambiar" a "Todos" en la compartición?
4. ¿Qué hace la enumeración basada en el acceso?
5. ¿Qué diferencia hay entre una cuota dura y una blanda?
6. ¿Qué es un filtro de archivos activo y qué limitación tiene?
7. ¿Qué rol hay que instalar en Windows Server para usar cuotas y filtros?
8. ¿Para qué sirve la pestaña "Acceso efectivo"?
9. Un usuario ha borrado un archivo del servidor. ¿Cómo puede recuperarlo sin ayuda?
10. ¿Por qué las versiones anteriores no sustituyen a una copia de seguridad?
:::

## Fuentes y para saber más

| Apartado | Enlace |
| --- | --- |
| 1. Información general del servidor de archivos | [Información general del servidor de archivos (Microsoft Learn)](https://learn.microsoft.com/es-es/windows-server/storage/file-server/file-server-smb-overview) |
| 1. `New-SmbShare` | [New-SmbShare (Microsoft Learn)](https://learn.microsoft.com/es-es/powershell/module/smbshare/new-smbshare) |
| 3. Enumeración basada en el acceso | [Set-SmbShare (Microsoft Learn)](https://learn.microsoft.com/es-es/powershell/module/smbshare/set-smbshare) |
| 4. FSRM | [Administrador de recursos del servidor de archivos (Microsoft Learn)](https://learn.microsoft.com/es-es/windows-server/storage/fsrm/fsrm-overview) |
| 4. Cuotas | [New-FsrmQuota (Microsoft Learn)](https://learn.microsoft.com/es-es/powershell/module/fileserverresourcemanager/new-fsrmquota) |
| 4. Filtros de archivos | [New-FsrmFileScreen (Microsoft Learn)](https://learn.microsoft.com/es-es/powershell/module/fileserverresourcemanager/new-fsrmfilescreen) |
| 5. Versiones anteriores | [Servicio de instantáneas de volumen (Microsoft Learn)](https://learn.microsoft.com/es-es/windows-server/storage/file-server/volume-shadow-copy-service) |

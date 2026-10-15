---
titulo: "Permisos y ACL"
licencia: CC-BY-NC-SA-4.0
---

Ya sabes que en Linux cada archivo tiene un dueño, un grupo y unos permisos de lectura, escritura y ejecución (`rwx`). En tu ordenador personal eso sobra. Pero en un servidor de ficheros tarde o temprano aparece una petición como esta: "Investigación tiene que poder leer lo de Archivo, pero no cambiarlo, y Docencia ni siquiera debe entrar". Con los permisos clásicos no hay manera de decirlo. Para eso existen las **ACL**.

## Qué vas a aprender

Al terminar este tema deberías ser capaz de:

- Repasar los permisos clásicos de Linux y reconocer cuándo se quedan cortos.
- Explicar qué es una ACL y qué es una entrada de ACL.
- Leer y modificar ACL en Linux con `getfacl` y `setfacl`, incluidas las ACL por defecto.
- Entender qué es la máscara y por qué a veces recorta permisos.
- Explicar cómo funcionan los permisos NTFS en Windows y en qué se parecen y se diferencian de los de Linux.
- Resolver el problema típico del servidor de ficheros: una carpeta por departamento con un acceso distinto para cada grupo.

---

## 1. Repaso de los permisos clásicos

Cada archivo y cada carpeta de Linux tiene tres bloques de permisos: **usuario** (el dueño), **grupo** y **otros**. En cada bloque puede haber `r` (leer), `w` (escribir) y `x` (ejecutar o, en una carpeta, entrar).

```text
drwxrws---  2 irene archivo  4096 oct 15 10:00 manuscritos
```

Aquí la `d` indica que es un directorio. El dueño, `irene`, lo puede todo (`rwx`). El grupo `archivo` también (`rws`, donde la `s` es el SGID, que explico enseguida). Y los demás no tienen ningún permiso (`---`). En números, `2770`.

| Permiso | En un archivo | En una carpeta |
| --- | --- | --- |
| `r` | Leer el contenido | Ver qué contiene (listarla) |
| `w` | Modificar el contenido | Crear, borrar y renombrar dentro |
| `x` | Ejecutarlo como programa | Entrar en ella y acceder a sus archivos |

:::tip[El permiso que siempre se olvida]
En una carpeta, sin `x` no puedes acceder a lo que hay dentro aunque tengas `r`. Y con `x` pero sin `r` puedes entrar si conoces el nombre exacto de un archivo, pero no listar la carpeta. Si un usuario "ve la carpeta pero no puede abrirla", casi siempre es que falta la `x`.
:::

### El bit SGID en carpetas

Cuando una carpeta tiene el bit **SGID** (el `2` de `2770`), todo lo que se crea dentro hereda el grupo de la carpeta y no el grupo principal de quien lo crea. En una carpeta compartida por un departamento es imprescindible. Sin él, un archivo creado por Irene pertenecería al grupo `irene`, y su compañero Tomás no podría editarlo.

## 2. Límites de los permisos clásicos

Los permisos clásicos solo permiten **un dueño y un grupo** por archivo. Si necesitas que `archivo` escriba, que `investigacion` solo lea y que `direccion` también solo lea, no hay forma: el archivo tiene un único grupo, y "otros" vale lo mismo para todos los demás. Podrías inventar un grupo `lectores` que junte a Investigación y Dirección, pero cada combinación nueva exigiría otro grupo, y enseguida sería inmanejable.

## 3. ACL en Linux

Una **ACL** (*Access Control List*, lista de control de acceso) añade permisos para usuarios y grupos concretos además de los clásicos. Cada elemento de la lista se llama **entrada**. Las ACL de POSIX tienen estos tipos de entrada:

| Entrada | Ejemplo | Significado |
| --- | --- | --- |
| `user::` | `user::rwx` | El dueño |
| `user:nombre:` | `user:nuria:r-x` | Un usuario concreto |
| `group::` | `group::rwx` | El grupo propietario |
| `group:nombre:` | `group:investigacion:r-x` | Un grupo concreto |
| `mask::` | `mask::rwx` | El máximo que pueden tener las entradas con nombre y el grupo propietario |
| `other::` | `other::---` | Todos los demás |

Para que funcionen hace falta que el sistema de ficheros las admita (ext4, XFS y ZFS con `acltype=posixacl`) y que estén instaladas las herramientas (`sudo apt install acl`).

### Ver y cambiar una ACL

```bash
getfacl /saber/archivo
```

La salida se parece a esto:

```text
# file: saber/archivo
# owner: irene
# group: archivo
user::rwx
group::rwx
group:investigacion:r-x
mask::rwx
other::---
```

Para añadir una entrada:

```bash
sudo setfacl -m g:investigacion:rX /saber/archivo
```

- `-m` es *modify*: añade o cambia una entrada.
- `g:investigacion:rX` significa "para el grupo `investigacion`, lectura".
- La `X` en mayúscula quiere decir "ejecución solo si es una carpeta, o si alguien ya la tenía". Es lo que casi siempre quieres: poder entrar en las carpetas sin dar permiso de ejecución a los archivos de texto.

Las entradas se quitan con `-x` (una) o `-b` (todas). Con `-R` la orden actúa sobre todo el contenido, de forma recursiva. Y en `ls -l` verás un `+` al final de los permisos cuando el archivo tiene ACL.

### ACL por defecto

Una ACL normal solo afecta al archivo o carpeta sobre el que la pones. Si quieres que lo que se cree después dentro de una carpeta herede ciertas entradas, usas la ACL **por defecto** con `-d`:

```bash
sudo setfacl -d -m g:investigacion:rX /saber/archivo
```

Eso no cambia lo que ya existe, solo lo nuevo. Por eso, para dejar una carpeta bien, se suele hacer dos veces: una con `-R`, para lo que ya hay, y otra con `-d`, para lo que vaya a llegar.

### La máscara

La máscara es el techo de permisos de las entradas con nombre y del grupo propietario. Si la máscara es `r--`, un usuario con la entrada `user:nuria:rwx` tendrá en realidad solo `r--`, y `getfacl` lo mostrará como `#effective:r--`.

Cuando cambias los permisos de grupo con `chmod`, en realidad estás cambiando la máscara. Por eso un `chmod 640` descuidado sobre un archivo con ACL puede quitar permisos a todos los que tenían una entrada. Si ves permisos efectivos menores de los que esperabas, empieza mirando la máscara.

:::nota[En qué orden se evalúa]
Linux comprueba, por este orden, si eres el dueño, si hay una entrada con tu nombre de usuario, si perteneces a algún grupo con entrada (si hay varios, se suman sus permisos) y, por último, "otros". Se queda con la primera coincidencia.
:::

## 4. Permisos NTFS en Windows

Windows trabaja con ACL desde siempre. Cada archivo y cada carpeta NTFS tiene una **DACL**, una lista de entradas (ACE) donde cada una dice a quién (usuario o grupo) se aplica y qué permite o deniega.

Los permisos básicos, los que ves en la pestaña **Seguridad**, son estos:

| Permiso | Qué permite |
| --- | --- |
| Control total | Todo, incluido cambiar permisos y tomar posesión |
| Modificar | Leer, escribir, borrar y ejecutar |
| Lectura y ejecución | Ver el contenido y ejecutar programas |
| Mostrar el contenido de la carpeta | Ver los nombres de lo que hay dentro (solo en carpetas) |
| Lectura | Ver el contenido |
| Escritura | Crear archivos y carpetas, y modificar |

Hay algunos detalles que conviene saber:

- **Herencia**: por defecto, lo que creas dentro de una carpeta hereda sus permisos. Puedes romper la herencia en una subcarpeta y ponerle permisos propios.
- **Los permisos se suman**: si perteneces a varios grupos, tus permisos efectivos son la unión de todos los que te conceden algo.
- **Denegar gana a permitir**: un `Denegar` explícito anula cualquier `Permitir`. Se usa poco y con cuidado, porque da problemas difíciles de rastrear.
- **Acceso efectivo**: en las propiedades avanzadas de seguridad hay una pestaña que calcula qué puede hacer un usuario concreto sobre ese archivo. Es la herramienta para diagnosticar.
- **Línea de comandos**: `icacls` muestra y modifica los permisos.

La diferencia de filosofía con Linux es esta: en Windows, la ACL es la manera normal de dar permisos, y el administrador piensa en "grupos con permisos sobre carpetas". En Linux, lo normal son los permisos clásicos, y la ACL es el recurso para los casos que no caben.

## 5. Un modelo práctico para un servidor de ficheros

Para organizar una empresa o un centro con carpetas por departamento, la receta se repite en Linux y en Windows:

1. Crea **un grupo por departamento** (`archivo`, `investigacion`...). Las personas entran y salen de los grupos, mientras que los permisos casi no se tocan.
2. Da permisos **a los grupos, no a las personas**. Si Irene se cambia de departamento, cambias su grupo y ya está.
3. Da **lo mínimo imprescindible**: lectura a quien solo necesita leer.
4. Haz que lo nuevo herede los permisos: SGID más ACL por defecto en Linux, herencia en Windows.
5. Comprueba con usuarios reales (en Linux, `sudo -u irene touch fichero`; en Windows, el acceso efectivo), y no solo leyendo los permisos.

---

## Glosario

| Término | Significado |
| --- | --- |
| ACL | Lista de permisos para usuarios y grupos concretos |
| ACE | Cada entrada de una ACL |
| Máscara | Permisos máximos efectivos de las entradas con nombre en una ACL POSIX |
| ACL por defecto | ACL de una carpeta que heredan los elementos creados después |
| SGID en carpeta | Lo que se crea dentro hereda el grupo de la carpeta |
| DACL | Lista de ACE de un objeto NTFS |
| Herencia | Los elementos nuevos adoptan los permisos de su carpeta |
| Acceso efectivo | Lo que un usuario puede hacer realmente, sumando sus grupos |

## Comprueba lo que sabes

:::ejercicio[Repaso]
1. ¿Qué significa el `2` en `chmod 2770` aplicado a una carpeta?
2. Un usuario ve una carpeta pero al intentar entrar le sale "permiso denegado". ¿Qué permiso suele faltar?
3. ¿Por qué los permisos clásicos no pueden expresar "archivo escribe, investigación lee y docencia no entra"?
4. ¿Qué hace `setfacl -m g:investigacion:rX /datos`?
5. ¿Para qué sirve la opción `-d` de `setfacl`?
6. Has puesto una ACL por defecto, pero los archivos antiguos siguen sin los permisos nuevos. ¿Por qué?
7. `getfacl` muestra `group:docencia:rwx  #effective:r--`. ¿Qué ocurre?
8. ¿Qué indica el `+` al final de los permisos en `ls -l`?
9. En Windows, un usuario pertenece a dos grupos: uno con "Lectura" y otro con "Denegar escritura". ¿Qué puede hacer?
10. ¿Por qué se dan los permisos a grupos y no a personas?
:::

## Fuentes y para saber más

| Apartado | Enlace |
| --- | --- |
| 3. Qué es una ACL | [Lista de control de acceso](https://es.wikipedia.org/wiki/Lista_de_control_de_acceso) |
| 3. `setfacl` | [Manual de setfacl](https://manpages.debian.org/bookworm/acl/setfacl.1.en.html) |
| 3. `getfacl` | [Manual de getfacl](https://manpages.debian.org/bookworm/acl/getfacl.1.en.html) |
| 3. Detalles de las ACL POSIX | [Manual de acl(5)](https://manpages.debian.org/bookworm/acl/acl.5.en.html) |
| 4. Permisos NTFS | [Información general del servidor de archivos (Microsoft Learn)](https://learn.microsoft.com/es-es/windows-server/storage/file-server/file-server-smb-overview) |
| 4. `icacls` | [Comando icacls (Microsoft Learn)](https://learn.microsoft.com/es-es/windows-server/administration/windows-commands/icacls) |

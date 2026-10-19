---
titulo: "Cifrado de datos"
licencia: CC-BY-NC-SA-4.0
---

Imagina que roban el portátil de un directivo, o que alguien se lleva un disco duro de la sala de servidores. Si los datos están en claro, al ladrón le basta con conectar ese disco a otro ordenador para leerlo todo, sin conocer ninguna contraseña. El **cifrado en reposo** (*encryption at rest*) existe para evitar justo eso: sin la clave, el disco es solo ruido.

## Qué vas a aprender

Al terminar este tema deberías ser capaz de:

- Explicar qué protege el cifrado de disco y qué no.
- Distinguir el cifrado de disco completo, de volumen y de fichero.
- Describir cómo funcionan LUKS en Linux, BitLocker y EFS en Windows, y el cifrado nativo de ZFS.
- Crear un dataset cifrado en ZFS y montarlo y desmontarlo con su clave.
- Explicar por qué un dataset cifrado no se monta solo al arrancar y qué alternativas hay.
- Entender por qué perder la clave equivale a perder los datos.

---

## 1. Qué protege el cifrado

El cifrado de disco te protege cuando el sistema está apagado o la clave no está cargada. Un disco robado, una unidad vendida de segunda mano sin borrar o una copia de seguridad perdida dejan de ser un problema.

Pero tiene límites que conviene tener claros:

- No protege mientras el volumen está abierto y el sistema en marcha. Si un usuario con acceso (o un virus que corre con sus permisos) lee los datos, los lee con normalidad. De eso se encargan los permisos, que vemos en [[permisos-acl]].
- No evita que alguien borre archivos, ni que un ransomware los cifre por su cuenta.
- No sustituye a las copias de seguridad.

:::nota[Cifrado en reposo y en tránsito]
El cifrado en reposo protege los datos guardados. El cifrado en tránsito protege los datos mientras viajan por la red, y es lo que hacen SSH, HTTPS o SMB 3 con el cifrado activado. Son cosas distintas, y casi siempre hacen falta las dos.
:::

## 2. Cómo funciona, a grandes rasgos

Casi todos los sistemas usan **cifrado simétrico**: la misma clave sirve para cifrar y para descifrar. El algoritmo más extendido es **AES** (*Advanced Encryption Standard*) con claves de 256 bits, y hoy no se conoce ningún ataque práctico contra AES-256 bien utilizado.

Lo habitual es trabajar con dos claves:

1. Una **clave de datos**, aleatoria y muy larga, que es la que cifra de verdad el disco.
2. Una **clave de acceso** (tu contraseña, un fichero o un chip) que protege a la anterior.

Con este reparto puedes cambiar la contraseña sin recifrar terabytes de datos, porque solo hay que volver a proteger la clave de datos. Y de ahí sale lo más importante de todo el tema: si pierdes la clave de acceso, no hay forma de recuperar los datos. No existe el botón de "he olvidado mi contraseña".

La contraseña tampoco se usa tal cual. Antes pasa por una función de derivación (como PBKDF2 o Argon2) que la hace lenta de probar, de modo que alguien que intente adivinarla solo pueda probar unas pocas por segundo.

## 3. Niveles de cifrado

| Nivel | Qué cifra | Ventaja | Inconveniente |
| --- | --- | --- | --- |
| Disco o partición completa | Todo el volumen, incluidos nombres de fichero y metadatos | No se te olvida nada | Todo o nada: no puedes cifrar solo una parte |
| Sistema de ficheros o dataset | Un volumen lógico concreto | Cifras solo lo que lo necesita, cada parte con su clave | Hay que decidir qué se cifra |
| Fichero o carpeta | Archivos individuales | Muy preciso: el cifrado viaja con el fichero | Es fácil olvidarse de alguno, y los metadatos quedan a la vista |

## 4. Herramientas

### LUKS (Linux)

[LUKS](https://es.wikipedia.org/wiki/LUKS) es el estándar de cifrado de disco en Linux. Se apoya en `dm-crypt`, un módulo del núcleo, y se maneja con `cryptsetup`. Cifra una partición entera, y encima del dispositivo cifrado pones el sistema de ficheros que quieras: ext4, XFS o incluso ZFS. Admite varias contraseñas a la vez (hasta ocho "ranuras") sobre la misma clave de datos.

El proceso, resumido: `cryptsetup luksFormat` prepara la partición, `cryptsetup open` la abre y aparece un dispositivo nuevo en `/dev/mapper/`, y ese dispositivo es el que formateas y montas.

### BitLocker (Windows)

[BitLocker](https://es.wikipedia.org/wiki/BitLocker) cifra volúmenes enteros. Puede apoyarse en el **TPM**, un chip de la placa base que guarda la clave y solo la entrega si el equipo arranca sin haber sido manipulado. Así no tienes que escribir ninguna contraseña. Genera además una **clave de recuperación** de 48 dígitos, que hay que guardar fuera del equipo (en la cuenta de Microsoft, en Active Directory o impresa), porque es tu única salida si el TPM falla o cambias la placa. BitLocker está en las ediciones Pro y Enterprise; Windows Home tiene una versión simplificada que se llama cifrado de dispositivo.

### EFS (Windows)

*Encrypting File System* cifra ficheros y carpetas concretos dentro de NTFS, usando un certificado asociado al usuario. Para ti es transparente, pero solo tú (y quien tenga el certificado de recuperación) puede leer esos archivos. Si te borran el perfil de usuario sin haber guardado el certificado, los pierdes. Hoy se recomienda BitLocker en su lugar, salvo casos concretos.

### Cifrado nativo de ZFS

OpenZFS puede cifrar **por dataset**. No cifra el pool entero, sino solo los datasets que tú marques, cada uno con su propia clave. Es ideal para cifrar los papeles de Dirección sin tocar los de Docencia.

```bash
sudo zfs create -o encryption=aes-256-gcm -o keyformat=passphrase saber/direccion
```

- `encryption=aes-256-gcm` es el algoritmo, y también el que se usa por defecto con `encryption=on`. El modo `gcm` comprueba además que nadie haya manipulado los datos.
- `keyformat=passphrase` significa que la clave es una contraseña que se pide al crear el dataset (de al menos 8 caracteres). La otra opción es `raw` (o `hex`), una clave de 32 bytes guardada en un fichero.
- Hay que decidirlo **al crear el dataset**: no se puede activar después sobre uno que ya existe. Los datasets hijos heredan el cifrado del padre.
- Cifra los datos y casi todos los metadatos, pero los nombres de los datasets, las propiedades y el espacio usado quedan a la vista.
- Primero comprime y después cifra. Hacerlo al revés no tendría sentido, porque los datos cifrados no se pueden comprimir.

El uso diario tiene cuatro pasos:

```bash
sudo zfs unmount saber/direccion
```

```bash
sudo zfs unload-key saber/direccion
```

```bash
sudo zfs load-key saber/direccion
```

```bash
sudo zfs mount saber/direccion
```

Con `unload-key` el dataset queda cerrado: ya no se puede montar y los datos son ilegibles. `load-key` te pide la contraseña. Con `zfs get keystatus saber/direccion` ves si la clave está cargada (`available`) o no (`unavailable`). Existe además un atajo, `zfs mount -l`, que carga la clave y monta en un solo paso.

## 5. Cifrado y arranque del servidor

Hay una pregunta que aparece siempre que se cifran datos: ¿cómo se abre el volumen cuando el servidor arranca? Si la clave es una contraseña, alguien tiene que escribirla. Tienes varias opciones:

| Opción | Cómo funciona | Riesgo |
| --- | --- | --- |
| Escribirla a mano | Un administrador la teclea después de cada reinicio | Hasta que alguien lo haga, el servicio no está disponible |
| Clave en un fichero | La clave está guardada en el propio servidor | Quien robe el servidor entero se lleva también la clave, y el cifrado no ha servido de nada |
| Clave en un chip o en un servidor externo | Un TPM, o un servidor de claves que solo responde a máquinas autorizadas | Más complejidad |

No hay una opción perfecta: siempre es un equilibrio entre comodidad y seguridad. El cifrado tiene sentido sobre todo cuando el riesgo es que se lleven el disco, y mucho menos cuando lo que se llevan es el servidor entero y encendido.

:::aviso[Guarda la clave aparte]
Una copia de seguridad de un dataset cifrado no sirve de nada sin la clave. Guarda la contraseña (o una copia de la clave) en un sitio seguro y distinto del servidor, como un gestor de contraseñas o una caja fuerte. Y de vez en cuando comprueba que sabes restaurar.
:::

---

## Glosario

| Término | Significado |
| --- | --- |
| Cifrado en reposo | Protección de los datos guardados en disco |
| Cifrado simétrico | Se usa la misma clave para cifrar y descifrar |
| AES | Algoritmo de cifrado simétrico más extendido |
| LUKS | Estándar de cifrado de disco en Linux |
| BitLocker | Cifrado de volúmenes de Windows |
| EFS | Cifrado de ficheros dentro de NTFS |
| TPM | Chip que guarda claves y comprueba que el equipo no ha sido manipulado |
| Clave de recuperación | Clave de reserva para abrir un volumen cifrado |

## Comprueba lo que sabes

:::ejercicio[Repaso]
1. ¿De qué te protege el cifrado de disco y de qué no?
2. ¿Por qué se usan dos claves (de datos y de acceso)?
3. Has olvidado la contraseña de un dataset cifrado de ZFS. ¿Puedes recuperar los datos?
4. ¿Qué diferencia hay entre LUKS y el cifrado de ZFS?
5. ¿Se puede activar el cifrado en un dataset de ZFS que ya existe?
6. ¿Qué sucede si ejecutas `zfs mount` sobre un dataset cifrado con la clave descargada?
7. Reinicias el servidor. ¿Estará montado un dataset cifrado con contraseña?
8. ¿Por qué guardar la clave en un fichero del propio servidor reduce mucho la protección?
9. ¿Para qué sirve la clave de recuperación de BitLocker?
10. ¿Qué diferencia hay entre cifrado en reposo y cifrado en tránsito? Pon un ejemplo de cada uno.
:::

## Fuentes y para saber más

| Apartado | Enlace |
| --- | --- |
| 4. LUKS | [LUKS en Wikipedia](https://es.wikipedia.org/wiki/LUKS) |
| 4. BitLocker | [BitLocker en Wikipedia](https://es.wikipedia.org/wiki/BitLocker) |
| 4. BitLocker | [Información general sobre BitLocker (Microsoft Learn)](https://learn.microsoft.com/es-es/windows/security/operating-system-security/data-protection/bitlocker/) |
| 4. Cifrado de ZFS | [Manual de zfs-load-key](https://openzfs.github.io/openzfs-docs/man/master/8/zfs-load-key.8.html) |
| 4. Propiedades de cifrado | [Manual de zfsprops](https://openzfs.github.io/openzfs-docs/man/master/7/zfsprops.7.html) |

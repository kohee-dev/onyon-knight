---
titulo: "Las llaves del almacén"
licencia: CC-BY-NC-SA-4.0
borrador: true
---

# Elpis · Expediente 02: las llaves del almacén

## 1. Después de recuperar los gatos

Las figuras recuperadas permanecen en el **Almacén del Muelle** mientras sus propietarios acreditan su pertenencia y se organizan las devoluciones. Con el fin de comprender lo que ha podido suceder, Andrea Windrose solicita revisar los inventarios, las autorizaciones y los documentos de recogida.

La revisión descubre un problema: el personal utiliza una cuenta compartida y cualquiera puede modificar los documentos de trabajo. Las discrepancias entre el inventario y las devoluciones no permiten saber quién realizó cada cambio.

Andrea encarga abrir una pequeña oficina para administrar el almacén. Cada persona tendrá su propia cuenta y accederá a la documentación necesaria para su función. Tu trabajo consiste en preparar el dominio, incorporar un puesto y comprobar los permisos desde ese equipo.

La información personal recopilada en el expediente anterior sirve como referencia para las nuevas cuentas. Las crearemos en AD DS: no se realizará una sincronización automática con OpenLDAP.

**Objetivos:** preparar AD DS y DNS, unir un cliente al dominio, organizar cuentas y grupos, configurar permisos de carpetas, aplicar una GPO y verificar los accesos con usuarios reales del laboratorio.

## 2. Preparar el laboratorio

Esta guía toma como referencia **Windows Server 2022 con Experiencia de escritorio** y **Windows 11 Pro** ya instalados. Con Windows Server 2025 pueden cambiar algunos textos y valores predeterminados. Anota las versiones utilizadas y sigue los ajustes indicados por el docente. Windows Home no permite esta unión a dominio.

| Dato | Servidor | Cliente |
| --- | --- | --- |
| Nombre | `DC-MUELLE` | `PC-MUELLE01` |
| Dirección IPv4 | `192.168.70.10` | `192.168.70.20` |
| Máscara | `255.255.255.0` | `255.255.255.0` |
| DNS preferido | `192.168.70.10` | `192.168.70.10` |
| Puerta de enlace | Vacía en la red aislada | Vacía en la red aislada |

- Dominio DNS del laboratorio: `muelle.elpis.test`.
- Nombre corto del dominio: `MUELLE`.
- Las dos máquinas deben estar en la **misma red virtual interna**, aislada de otros laboratorios. Un adaptador por máquina basta para esta práctica.
- El docente proporciona imágenes autorizadas, máquinas preparadas y recursos suficientes. Se recomienda partir de un estado recuperable anterior a la promoción del servidor.
- Si se necesita Internet para actualizaciones, se preparará antes o mediante el encaminamiento indicado por el docente. No se añadirá un DNS público alternativo al cliente para intentar resolver fallos del dominio.

El servidor alojará AD DS, DNS y las carpetas compartidas para reducir recursos. Es una simplificación del laboratorio: en otras instalaciones el servicio de archivos estará separado.

::: aviso
Utiliza únicamente las máquinas de la práctica. No promociones un servidor del centro ni unas tu ordenador personal a este dominio. Mantén activado el cortafuegos y revisa las reglas necesarias si falla una comunicación.
:::

### 2.1. Nombres y red

**En cada máquina**, con una cuenta administrativa:

1. Pulsa `Win + R`, escribe `sysdm.cpl` y abre la pestaña **Nombre de equipo**.
2. Pulsa **Cambiar**, asigna el nombre de la tabla y reinicia.
3. Abre `ncpa.cpl`, entra en las propiedades del adaptador del laboratorio y selecciona **Protocolo de Internet versión 4**.
4. Introduce la IP, máscara y DNS de la tabla. No desactives IPv6.
5. Comprueba que fecha, hora y zona horaria son coherentes en ambas máquinas.
6. Ejecuta `ipconfig /all` y registra la configuración.

**Punto de control:** ambas máquinas están en la misma red y tienen direcciones diferentes. El servidor DNS aún no funcionará hasta instalar y configurar el rol correspondiente.

## 3. Abrir la oficina: crear el dominio

**En DC-MUELLE**, abre el Administrador del servidor:

1. Selecciona **Administrar → Agregar roles y características**.
2. Elige instalación basada en características o roles y selecciona el servidor local.
3. Marca **Servicios de dominio de Active Directory** y acepta las herramientas necesarias.
4. Completa la instalación.
5. En la notificación del Administrador del servidor, selecciona **Promover este servidor a controlador de dominio**.
6. Elige **Agregar un nuevo bosque** e introduce `muelle.elpis.test`.
7. Mantén DNS y catálogo global activados. Para el laboratorio con Server 2022, utiliza niveles funcionales de Windows Server 2016; no busques un nivel «2022». Si utilizas otra versión, registra el nivel elegido con el docente.
8. Establece y conserva de forma segura la contraseña de restauración de servicios de directorio (**DSRM**). No la incluyas en la entrega.
9. Verifica que el nombre NetBIOS sea `MUELLE` y conserva las rutas de base de datos, registros y SYSVOL propuestas para este laboratorio.
10. Revisa los requisitos previos, resuelve los errores y completa la promoción. El servidor se reiniciará.

En una zona nueva y aislada puede aparecer un aviso sobre la imposibilidad de crear una delegación DNS en la zona superior. No equivale a que el DNS del dominio haya fallado; debe distinguirse de los errores que impiden continuar.

Tras reiniciar, entra con la cuenta administrativa del dominio. Desde **Herramientas → DNS**, comprueba que existen los registros del dominio. En PowerShell ejecuta:

```powershell
Resolve-DnsName DC-MUELLE.muelle.elpis.test
Resolve-DnsName -Type SRV _ldap._tcp.dc._msdcs.muelle.elpis.test
```

La primera consulta debe resolver el servidor a `192.168.70.10`; la segunda debe localizar el controlador del dominio mediante un registro SRV.

**Evidencia:** nombre del dominio y resultados DNS. No continúes con la unión del cliente si estas consultas fallan desde él.

## 4. Organizar identidades y responsabilidades

### 4.1. Crear las unidades organizativas

En **Herramientas → Usuarios y equipos de Active Directory** (`dsa.msc`), pulsa con el botón derecho sobre el dominio y selecciona **Nuevo → Unidad organizativa**.

Crea esta estructura y conserva la protección contra eliminación accidental:

```text
muelle.elpis.test
└── OficinaMuelle
    ├── Usuarios
    ├── Grupos
    └── Equipos
```

El controlador `DC-MUELLE` permanece en la OU **Domain Controllers**. No lo muevas a `Equipos`.

### 4.2. Crear las cuentas

Dentro de `OficinaMuelle/Usuarios`, utiliza **Nuevo → Usuario**:

| Nombre completo | Nombre de inicio de sesión | Función |
| --- | --- | --- |
| Lina Ortiz | `lina.ortiz` | Inventario. |
| Darío Vera | `dario.vera` | Devoluciones. |
| Sara Niebla | `sara.niebla` | Atención a comerciantes. |
| Andrea Windrose | `andrea.windrose` | Investigación. |

Asigna contraseñas iniciales distintas que cumplan la política del dominio y mantén el cambio de contraseña en el siguiente inicio de sesión. No añadas estas cuentas a Administradores del dominio ni a Administradores del cliente.

Crea además `almacen.compartida`, con nombre visible **Antigua cuenta compartida**, para representar la cuenta heredada del caso. Mantén su contraseña bajo control del docente, no la uses para las pruebas de empleados y no le concedas acceso a las nuevas carpetas. La deshabilitaremos en el cierre. No estamos migrando una cuenta real preexistente.

### 4.3. Crear grupos de función

En `OficinaMuelle/Grupos`, utiliza **Nuevo → Grupo** y selecciona **Global** y **Seguridad**:

| Grupo | Miembro |
| --- | --- |
| `GG_Inventario` | `lina.ortiz` |
| `GG_Devoluciones` | `dario.vera` |
| `GG_Atencion` | `sara.niebla` |
| `GG_Investigacion` | `andrea.windrose` |
| `GG_ApoyoDevoluciones` | Vacío inicialmente. |

Abre las propiedades de cada grupo, pestaña **Miembros → Agregar**, introduce el usuario y pulsa **Comprobar nombres**.

### 4.4. Crear grupos de permisos

Crea ahora los siguientes grupos con ámbito **Dominio local** y tipo **Seguridad**. En su pestaña **Miembros**, añade los grupos globales indicados, no las cuentas individuales:

| Grupo de permiso | Grupos miembros |
| --- | --- |
| `DL_Inventario_R` | `GG_Devoluciones`, `GG_Investigacion` |
| `DL_Inventario_M` | `GG_Inventario` |
| `DL_Devoluciones_R` | `GG_Inventario`, `GG_Investigacion` |
| `DL_Devoluciones_M` | `GG_Devoluciones`, `GG_ApoyoDevoluciones` |
| `DL_Recogidas_R` | `GG_Inventario`, `GG_Atencion`, `GG_Investigacion` |
| `DL_Recogidas_M` | `GG_Devoluciones` |
| `DL_Investigacion_M` | `GG_Investigacion` |

`R` indica lectura y `M`, modificación. Son nombres elegidos para esta práctica, no permisos que se apliquen automáticamente por escribirlos.

```text
lina.ortiz → GG_Inventario → DL_Inventario_M → permiso sobre Inventario
```

::: nota
**Las OU organizan; los grupos reciben permisos.** Colocar una cuenta en una OU no le da acceso a una carpeta. Los grupos anteriores todavía no conceden acceso hasta configurar los recursos.
:::

## 5. Incorporar el puesto del almacén

**En PC-MUELLE01**, con la cuenta administrativa local:

1. Repite las dos consultas DNS del apartado 3 y verifica que utilizan el DNS `192.168.70.10`.
2. Abre `sysdm.cpl` y selecciona **Nombre de equipo → Cambiar**.
3. Marca **Dominio** e introduce `muelle.elpis.test`.
4. Cuando se solicite, proporciona una cuenta autorizada para unir el equipo. En este laboratorio el docente puede utilizar la cuenta administrativa del dominio para esta operación.
5. Comprueba el mensaje de bienvenida y reinicia.
6. En el servidor, localiza `PC-MUELLE01` en el contenedor **Computers** y utiliza **Mover** para llevarlo a `OficinaMuelle/Equipos`.
7. En el cliente, selecciona **Otro usuario** e inicia sesión como `MUELLE\lina.ortiz`. Cambia la contraseña inicial cuando se solicite.
8. Abre una terminal normal y ejecuta:

```cmd
whoami
hostname
```

Debes obtener la identidad de Lina en `MUELLE` y el nombre `PC-MUELLE01`. Repite el primer inicio de sesión de las demás cuentas cuando necesites probarlas.

**La sesión de los empleados se abre en el cliente, no en el controlador de dominio.** El dominio no convierte a esos usuarios en administradores del puesto.

## 6. Preparar los documentos y permisos NTFS

### 6.1. Matriz que debemos conseguir

| Carpeta | Lina | Darío | Sara | Andrea |
| --- | --- | --- | --- | --- |
| Inventario | Modificar | Leer | Sin acceso | Leer |
| Devoluciones | Leer | Modificar | Sin acceso | Leer |
| Recogidas | Leer | Modificar | Leer | Leer |
| Investigacion | Sin acceso | Sin acceso | Sin acceso | Modificar |

**Modificar incluye eliminar archivos.** No equivale a autorizar únicamente la escritura de nuevas líneas ni proporciona un historial de cambios. Trabajaremos con documentos ficticios.

### 6.2. Crear una raíz con permisos controlados

**En DC-MUELLE**, como administrador:

1. Crea la carpeta vacía `C:\DatosMuelle`.
2. Abre **Propiedades → Seguridad → Opciones avanzadas**.
3. Selecciona **Deshabilitar herencia → Convertir los permisos heredados en permisos explícitos**.
4. Asegura que `SYSTEM` y el grupo administrativo integrado **Administradores** conservan **Control total**, aplicado a **Esta carpeta, subcarpetas y archivos**. Usa el selector y comprueba los nombres; el idioma de Windows puede cambiarlos.
5. Retira de esta carpeta las demás concesiones generales, como Usuarios, Usuarios autenticados, Todos o CREATOR OWNER, si aparecen. Conserva las dos entradas administrativas anteriores. No cambies permisos de `C:\`, `Windows`, SYSVOL ni otras carpetas.
6. Confirma que la cuenta administrativa puede acceder antes de continuar.
7. Dentro de la raíz, crea `Inventario`, `Devoluciones`, `Recogidas` e `Investigacion`.

Las cuatro carpetas heredarán únicamente los permisos administrativos de la raíz. Se compartirán por separado: no es necesario permitir a los empleados listar `C:\DatosMuelle`.

### 6.3. Asignar permisos a cada carpeta

En **Propiedades → Seguridad → Editar → Agregar**, busca cada grupo del dominio. Si no se encuentra, comprueba **Ubicaciones** y selecciona el dominio.

| Carpeta | Grupo | Permiso NTFS |
| --- | --- | --- |
| Inventario | `DL_Inventario_R` | Lectura y ejecución. |
| Inventario | `DL_Inventario_M` | Modificar. |
| Devoluciones | `DL_Devoluciones_R` | Lectura y ejecución. |
| Devoluciones | `DL_Devoluciones_M` | Modificar. |
| Recogidas | `DL_Recogidas_R` | Lectura y ejecución. |
| Recogidas | `DL_Recogidas_M` | Modificar. |
| Investigacion | `DL_Investigacion_M` | Modificar. |

Revisa en **Opciones avanzadas** que estas entradas se aplican a **Esta carpeta, subcarpetas y archivos**. Mantén la herencia de los permisos de SYSTEM y Administradores.

No añadas reglas **Denegar** para representar «sin acceso»: en este diseño basta con no conceder acceso. Una denegación puede afectar a usuarios que también pertenecen a un grupo autorizado.

### 6.4. Preparar archivos de muestra

Como administrador, crea un archivo de texto en cada carpeta:

| Archivo | Contenido inicial |
| --- | --- |
| `Inventario\piezas.txt` | `GATO-001; gato azul; estanteria A; pendiente de devolucion` |
| `Devoluciones\entregas.txt` | `GATO-001; justificante pendiente; entrega no autorizada` |
| `Recogidas\horario.txt` | `Recogidas de 10:00 a 13:00. Traer justificante.` |
| `Investigacion\informe.txt` | `Expediente 02. Revisar una autorizacion anterior al hallazgo.` |

Los archivos deben heredar los permisos de sus carpetas. `Recogidas` contiene información para comunicar a los comerciantes, pero no se publica en Internet ni admite acceso anónimo.

## 7. Compartir los recursos

Para cada una de las cuatro carpetas:

1. Abre **Propiedades → Compartir → Uso compartido avanzado**.
2. Marca **Compartir esta carpeta** y utiliza su nombre: `Inventario`, `Devoluciones`, `Recogidas` o `Investigacion`.
3. En **Permisos**, retira `Todos` si existe.
4. Añade el grupo administrativo con **Control total**.
5. Añade el grupo `DL_..._R` correspondiente con **Leer**.
6. Añade el grupo `DL_..._M` con **Cambiar** y **Leer**. `Investigacion` solo tiene grupo M.
7. Aplica y registra la ruta del recurso.

Ejemplo:

```text
\\DC-MUELLE\Inventario
```

Por red deben permitir la operación **tanto los permisos del recurso compartido como los de NTFS**. Dar Modificar en NTFS no permite escribir si el recurso compartido solo concede Leer.

Desde el cliente, PowerShell permite comprobar el puerto de SMB:

```powershell
Test-NetConnection DC-MUELLE.muelle.elpis.test -Port 445
```

Si falla, revisa resolución, conectividad y las reglas de **Compartir archivos e impresoras (SMB entrante)** del perfil correspondiente en el servidor. No desactives el cortafuegos para dar la práctica por resuelta.

## 8. Comprobar cada identidad

**En PC-MUELLE01**, inicia sesión con cada empleado. Utiliza sesiones separadas: cerrar la ventana del Explorador no equivale a cerrar sesión.

1. Ejecuta `whoami` y anota la identidad.
2. Abre cada ruta UNC desde `Win + R`, por ejemplo `\\DC-MUELLE\Inventario`.
3. Intenta abrir el documento inicial.
4. Si tienes permiso de modificación, crea `prueba-NOMBRE.txt`, escribe una línea, guárdalo, vuelve a editarlo y elimínalo.
5. Si solo tienes lectura, intenta crear un archivo de prueba y modificar el documento inicial: ambas operaciones deben rechazarse.
6. Si no tienes acceso, confirma que no puedes abrir el recurso ni leer su documento mediante una ruta directa.

No introduzcas credenciales administrativas si aparece una solicitud de acceso. Eso cambiaría la identidad con la que estás comprobando los permisos.

Registra los resultados:

| Usuario | Recurso | Operación | Esperado | Obtenido |
| --- | --- | --- | --- | --- |
| Lina | Inventario | Crear y eliminar archivo de prueba | Permitido | |
| Lina | Devoluciones | Leer / modificar | Permitido / rechazado | |
| Darío | Recogidas | Modificar | Permitido | |
| Sara | Inventario | Leer | Rechazado | |
| Sara | Recogidas | Leer / modificar | Permitido / rechazado | |
| Andrea | Investigacion | Crear y modificar | Permitido | |

Completa las restantes combinaciones de la matriz. Ver el nombre de un recurso no implica poder abrirlo: en esta práctica no configuramos ocultación de recursos.

::: aviso
No pruebes con archivos importantes. Conserva los documentos iniciales y realiza las pruebas de borrado con archivos creados expresamente para ello.
:::

## 9. Aplicar una GPO al puesto

Andrea solicita que el equipo bloquee la sesión cuando quede desatendido. Utilizaremos **300 segundos —cinco minutos—** como valor didáctico.

**En el servidor:**

1. Abre **Herramientas → Administración de directivas de grupo** (`gpmc.msc`).
2. Despliega el bosque y el dominio hasta `OficinaMuelle/Equipos`.
3. Pulsa con el botón derecho y selecciona **Crear un GPO en este dominio y vincularlo aquí**.
4. Nómbralo `GPO_Muelle_Bloqueo` y selecciona **Editar**.
5. Abre **Configuración del equipo → Directivas → Configuración de Windows → Configuración de seguridad → Directivas locales → Opciones de seguridad**.
6. Configura **Inicio de sesión interactivo: límite de inactividad del equipo** en `300` segundos. En inglés: *Interactive logon: Machine inactivity limit*.
7. Conserva el filtrado de seguridad predeterminado para esta práctica. El vínculo con la OU limita los equipos afectados.

No modifiques Default Domain Policy ni vincules esta GPO a Domain Controllers. Es una configuración de **equipo**: la cuenta del cliente debe estar dentro de la OU donde se aplica.

**En el cliente**, con una terminal elevada mediante una cuenta administrativa autorizada:

```cmd
gpupdate /force
gpresult /scope computer /r
```

Comprueba que `GPO_Muelle_Bloqueo` aparece entre las directivas aplicadas. Si se pide reiniciar, hazlo. Para guardar el informe, crea una carpeta local de evidencias y ejecuta desde ella:

```cmd
gpresult /scope computer /h gpo-equipo.html
```

Cierra la sesión administrativa y entra como empleado. Deja de interactuar durante cinco minutos y comprueba que pide desbloquear la sesión. Para medir este tiempo, evita que una suspensión o un apagado de pantalla más temprano interfiera con la prueba; sigue el ajuste temporal indicado por el docente y restáuralo después.

**Bloquear no es cerrar sesión.** Las aplicaciones siguen abiertas y se solicitan credenciales para volver a trabajar. La GPO tampoco sustituye a los permisos de carpetas.

## 10. Sara cubre una ausencia

Darío estará ausente. Sara necesita modificar **solo Devoluciones**, sin adquirir permiso de modificación sobre Recogidas ni acceso a Investigación.

1. En el servidor, añade `sara.niebla` a `GG_ApoyoDevoluciones`.
2. Comprueba que ese grupo ya pertenece a `DL_Devoluciones_M`.
3. En el cliente, cierra completamente la sesión de Sara e inicia otra con conexión al controlador.
4. Prueba que puede crear y modificar un archivo en Devoluciones.
5. Comprueba que Recogidas sigue siendo de lectura y que Investigación continúa inaccesible.
6. Al terminar la sustitución, retira a Sara de `GG_ApoyoDevoluciones`.
7. Vuelve a cerrar sesión e iniciarla y repite las pruebas: Devoluciones debe quedar sin acceso.

No añadas a Sara a `GG_Devoluciones`: ese grupo concede también modificación sobre Recogidas. Esta es la razón de preparar un grupo de apoyo específico.

Los cambios de pertenencia no deben comprobarse reutilizando una sesión antigua: sus credenciales y conexiones pueden conservar autorizaciones anteriores. `gpupdate` por sí solo no renueva toda la identidad de la sesión.

## 11. Retirar la cuenta compartida

Con las cuatro cuentas comprobadas:

1. En Usuarios y equipos de Active Directory, localiza `almacen.compartida`.
2. Comprueba su descripción y que no es una de las cuentas administrativas o personales.
3. Pulsa con el botón derecho y selecciona **Deshabilitar cuenta**. No la elimines.
4. Comprueba en sus propiedades que aparece deshabilitada.
5. Con el cliente conectado al controlador, intenta un nuevo inicio de sesión con esa identidad y confirma que se rechaza.

En este laboratorio no hemos abierto sesiones previas con esa cuenta. Deshabilitar una cuenta real no equivale a cerrar inmediatamente todas sus sesiones o invalidar cada autorización ya emitida; la retirada de accesos activos requiere una revisión adicional.

## 12. Si algo falla

| Síntoma | Qué revisar primero |
| --- | --- |
| No se encuentra el dominio | DNS del cliente, consulta SRV, red virtual y nombre del dominio. |
| Se rechaza la unión | Credenciales autorizadas, hora, edición de Windows y posible cuenta de equipo anterior. |
| Se puede leer pero no escribir | Permisos del recurso compartido y NTFS; grupo y sesión utilizados. |
| Sara ve documentos inesperados | Grupos anidados y permisos generales o heredados. |
| La GPO no aparece | OU del equipo, vínculo habilitado, resolución del dominio y resultados de `gpresult`. |
| Un cambio de grupo parece no funcionar | Cierre de sesión completo, nueva autenticación y conexiones antiguas. |

Corrige la causa; no concedas Control total a Todos ni hagas administrador al usuario para superar la comprobación.

## 13. Entrega del expediente

Prepara `expediente-02` con un informe y las evidencias necesarias:

- Versiones, nombres, IP y esquema de la red.
- Comprobación DNS y cliente unido al dominio.
- Estructura de OU y pertenencias de los grupos.
- Permisos de recurso compartido y NTFS de una carpeta de ejemplo y resumen de las demás.
- Matriz completa de accesos esperados y observados, indicando la identidad utilizada.
- Resultado de la GPO y prueba de bloqueo.
- Acceso temporal de Sara, retirada y comprobación posterior.
- Estado deshabilitado de la cuenta compartida y rechazo de un nuevo inicio de sesión.
- Incidencias encontradas y cómo se resolvieron.

No incluyas contraseñas. Explica qué demuestra cada captura. Crear los objetos sin comprobar su efecto desde el cliente no completa la práctica.

Responde brevemente:

1. ¿Por qué una OU no sustituye a un grupo de seguridad?
2. ¿Qué ocurre si NTFS permite Modificar y el recurso compartido solo Leer?
3. ¿Por qué Sara utiliza un grupo de apoyo y no el grupo de Darío?
4. ¿Por qué bloquear la sesión no protege por sí solo una carpeta mal configurada?
5. ¿Qué información faltaría para investigar quién modificó un archivo ayer?

## 14. Un documento fuera de fecha

La oficina ya dispone de cuentas individuales y permisos revisados. Mientras ordena las autorizaciones, Andrea encuentra una recogida fechada antes de que se descubriera el almacén.

La mejora protege el trabajo futuro, pero no permite atribuir los cambios anteriores a una persona: se realizaron utilizando una cuenta compartida.

Andrea conserva el documento. El almacén tiene nuevas llaves, pero alguien sabía de su existencia antes que los investigadores.

**Expediente 02: accesos revisados; origen de la autorización pendiente.**

::: nota
Las cuentas individuales no activan por sí solas un historial completo de operaciones. La configuración de auditoría de archivos y la conservación e interpretación de registros se trabajarán en otro expediente.
:::

## Referencias de consulta

- [Microsoft: instalación de AD DS](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/deploy/install-active-directory-domain-services--level-100-).
- [Microsoft: configuración DNS de clientes y controladores](https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/best-practices-for-dns-client-settings).
- [Microsoft: unir un equipo al dominio](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/join-computer-to-domain).
- [Microsoft: grupos de seguridad de Active Directory](https://learn.microsoft.com/es-es/windows-server/identity/ad-ds/manage/understand-security-groups).
- [Microsoft: control de acceso](https://learn.microsoft.com/en-us/windows/security/identity-protection/access-control/access-control).
- [Microsoft: límite de inactividad del equipo](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/security-policy-settings/interactive-logon-machine-inactivity-limit).

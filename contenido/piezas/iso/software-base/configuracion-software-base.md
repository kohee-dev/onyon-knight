---
titulo: "Configuración del software de base"
licencia: CC-BY-NC-SA-4.0
---

Instalar un sistema operativo permite comenzar a utilizarlo, pero no deja resueltas todas las necesidades de un puesto de trabajo. Debemos decidir quién puede acceder, qué privilegios necesita, qué servicios estarán disponibles y cómo se conectará el equipo a la red.

El **RA2** consiste en configurar el software de base según las necesidades de uso del sistema. Trabajaremos con Windows y GNU/Linux, comparando sus herramientas y comprobando el resultado de cada cambio.

En esta unidad administraremos **cuentas y configuraciones locales**. Los dominios, las identidades centralizadas y las directivas de grupo se desarrollarán posteriormente. Utilizaremos máquinas virtuales como laboratorio, sin dedicar un bloque independiente a virtualización.

## 1. Configurar con un objetivo

Una configuración adecuada depende de la función del equipo. Un portátil compartido para realizar presentaciones no necesita los mismos ajustes que una estación de trabajo de uso individual.

Antes de modificar el sistema, debemos responder:

- ¿Quién utilizará el equipo y para qué?
- ¿Qué aplicaciones y servicios necesita?
- ¿Cómo se conectará a la red?
- ¿Qué información o recursos deben protegerse?
- ¿Qué debe ocurrir si un cambio provoca un problema?

Trabajaremos con una situación común: **preparar un puesto para dos personas que comparten ordenador**, cada una con su cuenta, mientras una cuenta administrativa se reserva para el mantenimiento.

El procedimiento será siempre el mismo: observar el estado inicial, definir el cambio, aplicarlo, verificarlo y documentarlo. Cuando un ajuste no produzca el resultado esperado, revisaremos su causa antes de acumular cambios.

::: aviso
Las operaciones de aprendizaje se realizarán en el laboratorio indicado. Antes de cambiar contraseñas, permisos de acceso o red, conserva una vía de administración y un procedimiento para recuperar la configuración anterior.
:::

## 2. Usuarios, grupos y perfiles locales

### 2.1. La cuenta de usuario

Una **cuenta** representa una identidad que el sistema puede reconocer. Tiene un identificador y una configuración asociada. El nombre visible de una persona no es necesariamente el identificador interno utilizado por el sistema.

En GNU/Linux aparecen identificadores numéricos como el **UID**; en Windows se utilizan identificadores de seguridad, como el **SID**. Crear otra cuenta con el mismo nombre después de eliminar la anterior no garantiza recuperar su identidad ni sus permisos.

Distinguiremos:

| Cuenta | Finalidad |
| --- | --- |
| De trabajo habitual | Ejecutar aplicaciones y gestionar los datos autorizados. |
| Administrativa | Realizar cambios que afectan al sistema o a otros usuarios. |
| De servicio | Permitir que un servicio se ejecute con una identidad y permisos determinados. |

El principio de **mínimo privilegio** consiste en conceder los permisos necesarios para la tarea. Una persona que necesita utilizar un editor de textos no necesita por ese motivo administrar todo el equipo.

### 2.2. Grupos

Un **grupo** reúne identidades para facilitar la administración de permisos. Si varias personas necesitan el mismo acceso, podemos concederlo a un grupo y mantener después sus miembros.

Por ejemplo, un grupo local `documentacion` puede representar a las personas que trabajan con una carpeta determinada. **Crear el grupo no configura automáticamente los permisos de esa carpeta**: hay que asignarlos y comprobarlos.

Antes de incorporar una cuenta a un grupo, debemos conocer qué privilegios proporciona. Un grupo administrativo no es una solución general para cualquier error de acceso.

### 2.3. Perfiles y directorios personales

El entorno personal conserva documentos y preferencias de cada usuario. En Windows se organiza mediante el perfil de usuario; en GNU/Linux muchas preferencias se almacenan en archivos y directorios del directorio personal.

Ubicaciones habituales:

- Windows: `C:\Users\nombre`.
- GNU/Linux: `/home/nombre` para muchas cuentas de personas.

No todas las cuentas tienen estas ubicaciones ni están destinadas a iniciar una sesión interactiva. Las cuentas de servicios pueden utilizar otras rutas o carecer de un entorno personal convencional.

**Cuenta, perfil y datos no son lo mismo.** Eliminar una cuenta puede dejar archivos pendientes de tratar o eliminar datos según la herramienta y sus opciones. Antes de darla de baja hay que decidir qué conservar, quién será responsable y cómo verificarlo.

### 2.4. Herramientas de administración

En Windows Pro podemos utilizar **Administración de equipos → Usuarios y grupos locales**. La disponibilidad de consolas cambia según la edición; Windows Home no ofrece todas las herramientas de esta unidad.

En Debian disponemos de herramientas como `adduser`, `addgroup`, `usermod` y `passwd`. No se recomienda editar directamente los archivos de cuentas para realizar las primeras altas.

Consultas iniciales en GNU/Linux:

```bash
whoami
id
getent passwd "$USER"
```

`getent` consulta las fuentes de identidades configuradas: su resultado no tiene por qué proceder exclusivamente de un archivo local.

En una terminal de Windows:

```cmd
whoami
whoami /groups
```

**Actividad:** planifica dos cuentas de trabajo y una de mantenimiento. Indica qué grupos necesitarán y qué operaciones deberían poder realizar. Después comprueba las pertenencias reales en el laboratorio.

## 3. Acceso y políticas de contraseñas

### 3.1. Autenticación y autorización

La **autenticación** comprueba la identidad. La **autorización** determina qué puede hacer esa identidad.

Introducir correctamente una contraseña no implica poder instalar aplicaciones, leer los documentos de otra persona o cambiar la configuración del sistema.

Debemos distinguir también entre bloquear la pantalla, bloquear una cuenta por intentos fallidos y deshabilitar una cuenta administrativamente. Son acciones diferentes.

### 3.2. Directivas de cuenta

Las políticas pueden establecer condiciones como longitud de contraseña, historial, caducidad y respuesta ante intentos fallidos. Los valores se eligen según las necesidades y el entorno; no se copian sin analizar sus consecuencias.

| Ajuste | Qué debemos valorar |
| --- | --- |
| Requisitos de contraseña | Resistencia frente a intentos de adivinación y facilidad de uso. |
| Historial | Evitar reutilizaciones cuando se exige cambiarla. |
| Caducidad | Política aplicable y procedimiento para cambiar o recuperar credenciales. |
| Bloqueo tras fallos | Limitar intentos sin facilitar bloqueos abusivos o accidentales. |
| Recuperación | Cómo restablecer el acceso verificando la identidad. |

En Windows Pro, `secpol.msc` permite consultar las **Directivas de cuenta** locales. En equipos administrados centralmente pueden intervenir otras políticas; nuestro laboratorio utilizará equipos independientes.

En GNU/Linux, la caducidad y otros aspectos de las cuentas pueden consultarse con herramientas como `chage`. La comprobación de contraseñas y los bloqueos dependen de la configuración de autenticación, habitualmente mediante **PAM**, y de los módulos instalados. No supondremos que cualquier instalación aplica las mismas reglas.

::: aviso
No pruebes el bloqueo con la única cuenta administrativa disponible. Utiliza una cuenta de prueba y conoce de antemano cómo recuperar el acceso. Deshabilitar una cuenta tampoco equivale necesariamente a finalizar todas sus sesiones activas.
:::

**Actividad:** documenta las políticas actuales, propone un cambio justificado y verifica su efecto con una cuenta de prueba. No incluyas contraseñas en las evidencias.

## 4. Procesos y servicios

### 4.1. Identificar procesos

Un **proceso** es una instancia de un programa en ejecución. Tiene un identificador, un propietario y recursos asociados. Un mismo programa puede originar varios procesos.

El Administrador de tareas de Windows y herramientas como `ps` o `top` en GNU/Linux permiten observarlos. Debemos distinguir el consumo puntual de una aplicación de un problema persistente.

```bash
ps -u "$USER"
```

Esta consulta muestra procesos del usuario actual. Antes de finalizar uno, identifica qué aplicación representa y si contiene trabajo sin guardar.

### 4.2. Qué es un servicio

Un **servicio** proporciona una función gestionada por el sistema, como impresión, sincronización horaria o acceso remoto. No es necesario que una persona abra una ventana para utilizarlo. Un servicio puede implicar uno o varios procesos.

En Windows podemos utilizar `services.msc`. En Debian con systemd, `systemctl` permite consultar y gestionar servicios.

Hay que distinguir **estado actual** y **modo de inicio**:

| Concepto | Pregunta |
| --- | --- |
| Estado | ¿Está funcionando ahora? |
| Inicio o activación | ¿Cuándo y mediante qué mecanismo puede iniciarse? |

Un servicio detenido puede iniciarse posteriormente. En systemd, deshabilitar su inicio automático no impide todas las formas de activación ni lo detiene necesariamente.

### 4.3. Cambiar solo lo necesario

Antes de detener, reiniciar o deshabilitar un servicio:

1. Averigua su función.
2. Revisa qué aplicaciones o servicios dependen de él.
3. Conserva el estado y la configuración iniciales.
4. Aplica el cambio autorizado.
5. Comprueba la función afectada y consulta los registros si falla.

No deshabilitaremos servicios desconocidos para «hacer el equipo más rápido». Una aparente mejora puede dejar sin impresión, red o actualizaciones al sistema.

**Actividad:** abre una aplicación de prueba, localiza su proceso y ciérrala normalmente. Después consulta un servicio elegido por el docente y diferencia su estado de su configuración de inicio. Los cambios se harán sobre un servicio de laboratorio cuya interrupción sea admisible.

## 5. Configuración de red del equipo

### 5.1. Los parámetros básicos

La interfaz de red necesita una configuración adecuada al entorno. En IPv4 trabajaremos con:

| Parámetro | Función |
| --- | --- |
| Dirección IP | Identificar una interfaz dentro de la red. |
| Prefijo o máscara | Delimitar la subred a la que pertenece. |
| Puerta de enlace | Encaminar tráfico hacia otras redes cuando corresponda. |
| Servidores DNS | Resolver nombres mediante consultas DNS. |

IPv6 también forma parte de los sistemas actuales. No lo desactivaremos como respuesta automática ante un fallo de IPv4.

La configuración puede recibirse automáticamente, por ejemplo mediante DHCP, o establecerse de forma manual. Una dirección manual debe estar planificada para evitar duplicados y solapamientos con el reparto dinámico.

### 5.2. Consultar antes de modificar

En Windows:

```cmd
ipconfig /all
```

En GNU/Linux:

```bash
ip address
ip route
```

Anota la interfaz utilizada, sus direcciones y las rutas. Que una interfaz esté conectada no demuestra que exista acceso a Internet.

En Windows se puede modificar la configuración desde las propiedades de la conexión. En Debian primero identificaremos qué herramienta la gestiona: NetworkManager, ifupdown u otra. **No configuraremos la misma interfaz simultáneamente con gestores diferentes.**

Los cambios realizados mediante ciertas órdenes pueden ser temporales. Tras modificar una conexión hay que comprobar su persistencia cuando ese sea el objetivo.

### 5.3. Diagnóstico por pasos

1. Comprueba que la interfaz está conectada.
2. Revisa IP y prefijo.
3. Prueba la comunicación con un equipo conocido de la misma red.
4. Revisa la puerta de enlace si necesitas alcanzar otra red.
5. Comprueba la resolución de nombres.
6. Prueba el servicio concreto que necesitas.

Un fallo de `ping` no demuestra por sí solo que el equipo esté apagado: puede haber filtrado de ICMP. Del mismo modo, responder a `ping` no garantiza que una aplicación o un puerto funcionen.

**Actividad:** prepara dos máquinas en la red virtual aislada indicada por el docente, asigna direcciones compatibles y comprueba su comunicación. Conserva la configuración inicial y explica cómo restaurarla.

## 6. Resolución de nombres

### 6.1. Identidad del equipo y resolución

El **nombre del equipo** permite identificarlo de forma legible. Para comunicarse con él, las aplicaciones pueden necesitar convertir un nombre en una dirección IP.

DNS es un mecanismo de resolución, pero no el único. También pueden intervenir archivos locales, cachés y mecanismos de resolución de la red local, según el sistema y la aplicación.

Cambiar el nombre del equipo no crea automáticamente todos los registros DNS necesarios.

### 6.2. Archivo hosts y DNS

El archivo `hosts` permite definir correspondencias locales:

- Windows: `C:\Windows\System32\drivers\etc\hosts`.
- GNU/Linux: `/etc/hosts`.

Una entrada didáctica podría ser:

```text
192.168.80.20 puesto2.aula.test
```

Solo debe añadirse si esa es la dirección real del segundo equipo del laboratorio. El cambio afecta al sistema donde se edita, no a toda la red. En GNU/Linux, `/etc/nsswitch.conf` participa en la selección y orden de fuentes de resolución.

No editaremos `/etc/resolv.conf` sin comprobar cómo se genera: puede estar administrado por otro servicio y perder los cambios.

### 6.3. Elegir la comprobación adecuada

`nslookup` consulta DNS; no es la prueba adecuada para demostrar una entrada añadida a `hosts`. En GNU/Linux, `getent hosts puesto2.aula.test` consulta las fuentes configuradas para resolver ese nombre.

En Windows podemos observar la dirección a la que intenta conectarse `ping puesto2.aula.test`, aunque no reciba respuestas ICMP. Esa prueba de resolución debe distinguirse de la de conectividad.

::: tip
Si una aplicación funciona usando la IP y falla usando el nombre, revisa la resolución. Si falla de ambas formas, no concluyas inmediatamente que el problema es DNS.
:::

**Actividad:** comprueba un nombre antes y después de añadir una entrada temporal a `hosts`. Guarda una copia previa, no elimines las entradas existentes y retira después únicamente la línea de la actividad.

## 7. Configuración de equipos portátiles

Un portátil alterna entre batería y alimentación externa, cambia de red y puede cerrarse o suspenderse durante el trabajo. Debemos ajustar su comportamiento a esas condiciones.

### 7.1. Energía y estados del equipo

| Acción | Qué sucede de forma general |
| --- | --- |
| Apagar la pantalla | Se reduce el consumo de la pantalla; el equipo puede seguir trabajando. |
| Bloquear la sesión | Se restringe el acceso interactivo; las aplicaciones siguen abiertas. |
| Suspender | Se reduce el consumo conservando la sesión; depende del modo disponible y sigue necesitando energía. |
| Hibernar | Se guarda el estado para recuperarlo sin mantener la RAM alimentada; requiere compatibilidad y configuración. |
| Apagar | Se cierran sesiones y se detiene el sistema según su procedimiento de apagado. |

Las opciones exactas dependen del hardware y del sistema. En Windows, `powercfg /a` permite consultar los estados disponibles. En GNU/Linux influyen el entorno de escritorio y la configuración de energía.

### 7.2. Ajustar el uso

Revisaremos brillo, tiempo de apagado de pantalla, suspensión, acción al cerrar la tapa y autenticación al reanudar. Un equipo que realiza una presentación puede necesitar ajustes distintos de uno utilizado para tomar apuntes.

También consideraremos conectividad y trabajo sin conexión. Una copia local de un documento puede permitir trabajar sin red, pero necesita protección y un procedimiento para sincronizar los cambios y resolver conflictos. No todas las aplicaciones ofrecen la misma función.

**Actividad:** compara una configuración para batería y otra para alimentación externa. Justifica cada decisión. Si trabajas en una máquina virtual, indica qué aspectos no puedes verificar, como autonomía real, tapa o batería; complétalos con una demostración del docente o documentación del equipo.

## 8. Documentar y comprobar los cambios

La documentación permite repetir una configuración, entender un fallo y recuperar el estado anterior.

| Campo | Qué registrar |
| --- | --- |
| Equipo y versión | Sistema, edición y entorno utilizado. |
| Necesidad | Problema o requisito que motiva el cambio. |
| Estado inicial | Valores antes de intervenir. |
| Acción | Herramienta, configuración u orden empleada. |
| Verificación | Resultado esperado y observado. |
| Recuperación | Cómo volver al estado anterior. |
| Incidencias | Errores y solución aplicada. |

Una captura sin explicación puede no demostrar lo que creemos. Debe quedar claro con qué usuario se realizó la prueba y qué función se verificó.

## 9. Actividad integrada: un puesto preparado para trabajar

Sobre las máquinas Windows y GNU/Linux del laboratorio:

1. Identifica versión, nombre del equipo y configuración inicial.
2. Planifica dos usuarios locales y un grupo de trabajo; crea las cuentas autorizadas.
3. Comprueba perfiles, identidades y pertenencias.
4. Consulta las políticas de acceso y prueba un cambio acordado con una cuenta de laboratorio.
5. Localiza los procesos de una aplicación y el estado de un servicio.
6. Consulta y configura la conexión de red indicada por el docente.
7. Verifica comunicación y resolución de nombres por separado.
8. Propón una configuración de energía para un portátil, indicando qué has podido comprobar.
9. Documenta los resultados y restaura los ajustes temporales solicitados.

No se exige que las herramientas ni sus interfaces sean idénticas. Debes explicar cómo resuelve cada sistema la misma necesidad.

### Relación con los criterios del RA2

| Criterio | Evidencia de esta unidad |
| --- | --- |
| a) Cuentas, grupos, perfiles y contraseñas locales | Planificación y comprobación de las identidades. |
| b) Seguridad de acceso mediante directivas | Política aplicada y prueba de acceso. |
| c) Servicios y procesos | Identificación, actuación autorizada y comprobación. |
| d) Protocolos de red | Configuración del equipo y pruebas de comunicación. |
| e) Resolución de nombres | Comparación y configuración de mecanismos de resolución. |
| f) Optimización para portátiles | Propuesta de energía, movilidad y trabajo sin conexión. |
| g) Uso de máquinas virtuales | Configuración y análisis de resultados en el laboratorio. |
| h) Documentación | Informe de cambios, incidencias y recuperación. |

## Referencias

- [BOE: ISO, módulo 0369, resultados y criterios de evaluación](https://boe.es/buscar/doc.php?id=BOE-A-2009-18355).
- [Debian: manual de administración](https://www.debian.org/doc/manuals/debian-handbook/).
- [Debian Reference: configuración de red y resolución de nombres](https://www.debian.org/doc/manuals/debian-reference/ch05).
- [Debian Reference: inicialización y servicios del sistema](https://www.debian.org/doc/manuals/debian-reference/ch03.en.html).
- [Microsoft: políticas de bloqueo de cuentas](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/security-policy-settings/account-lockout-policy).
- [Microsoft: apagar, suspender o hibernar](https://support.microsoft.com/en-us/windows/experience/power-battery/shut-down-sleep-or-hibernate-your-pc).
- [Microsoft: configuración de energía de Windows 11](https://support.microsoft.com/en-us/windows/experience/power-battery/power-settings-in-windows-11).

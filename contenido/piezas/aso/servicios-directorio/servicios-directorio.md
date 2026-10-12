---
titulo: "Servicios de Directorio"
licencia: CC-BY-NC-SA-4.0
---

# Servicios de directorio

## Antes de empezar: ¿para qué sirve un servicio de directorio?

Esta lectura te ayudará a comprender **qué problema resuelven los servicios de directorio** antes de estudiar cómo funcionan LDAP y OpenLDAP.

::: nota
Imagina que comienzas a trabajar en una empresa. Necesitas una cuenta para acceder al ordenador, utilizar el correo y consultar las carpetas de tu departamento.

¿Cómo sabe cada sistema quién eres y qué puedes utilizar? ¿Qué debe cambiar cuando te trasladan de departamento o dejas la empresa?
:::

### Un lugar común para la información

Un **servicio de directorio** almacena y organiza información sobre los **usuarios, grupos, dispositivos y recursos** de una red.

Podemos imaginarlo como una **agenda de la organización** que las aplicaciones consultan para encontrar la información que necesitan.

Por ejemplo, puede almacenar:

- El nombre y el correo electrónico de un empleado.
- Los grupos a los que pertenece.
- Información sobre equipos e impresoras.
- Datos que otros servicios utilizan para gestionar el acceso.

Esta información se administra de forma centralizada, aunque pueda mantenerse en varios servidores.

### Su relación con la gestión de identidades y accesos

Los servicios de directorio son una pieza importante de la **gestión de identidades y accesos**, o **IAM** (*Identity and Access Management*).

IAM reúne los procesos y herramientas que permiten gestionar:

- **Las identidades:** quiénes son los usuarios y qué cuentas tienen.
- **La autenticación:** cómo demuestran su identidad.
- **La autorización:** a qué recursos pueden acceder y qué acciones pueden realizar.

::: aviso
**El directorio no realiza necesariamente todas estas funciones por sí solo.**

Almacena información que pueden utilizar los sistemas de autenticación, las aplicaciones y otros servicios para aplicar sus reglas de acceso.
:::

### Usuarios y recursos en distintos lugares

En una organización, los usuarios pueden trabajar desde distintas sedes o desde casa, y las aplicaciones pueden ejecutarse en servidores propios o en la nube.

Disponer de una **fuente común de información sobre las identidades** facilita administrar ese entorno sin mantener los mismos datos por separado en cada sistema.

::: tip
Si una persona pasa del departamento de ventas al de almacén, su pertenencia a los grupos deberá actualizarse.

Los servicios integrados con el directorio podrán utilizar esa información para aplicar los permisos correspondientes a su nueva función.
:::

### ¿Cómo se organiza la información?

En los directorios que estudiaremos, la información se organiza mediante una **estructura jerárquica**, como un árbol con distintas ramas.

Por ejemplo, una empresa puede organizar sus entradas por departamentos y situar dentro de ellos a sus usuarios y recursos.

Cada entrada tiene un nombre que permite identificarla dentro de una estructura común, denominada **espacio de nombres**.

::: nota
Por ahora, quédate con esta idea: **el directorio organiza información para que distintos sistemas puedan localizarla y utilizarla de forma coherente**.

En la lectura de OpenLDAP veremos cómo se representan esas entradas, qué atributos contienen y cómo se consultan.
:::

*Lectura adaptada a partir del texto de IBM sobre servicios de directorio facilitado para esta unidad. [Enlace](https://www.ibm.com/es-es/think/topics/directory-services)*

## 1. ¿Cómo interviene el directorio cuando accedemos a un recurso?

Los servicios de directorio utilizan un **modelo cliente-servidor**:

- El **cliente** es un programa que solicita información o realiza una operación, a menudo en nombre de un usuario o dispositivo.
- El **servidor** atiende la solicitud y controla el acceso a la información del directorio.

Por ejemplo, una aplicación puede consultar el directorio para conocer los grupos a los que pertenece un usuario.

### De la identificación al acceso

Cuando intentamos acceder a un recurso protegido, podemos distinguir tres momentos:

1. **Presentación de credenciales.** El usuario aporta información o una prueba para demostrar su identidad, según el método configurado. Por ejemplo, utiliza su identificador de usuario y una contraseña.
2. **Autenticación.** El sistema comprueba esas credenciales para verificar que el usuario es quien afirma ser.
3. **Autorización.** Una vez identificada la persona, el servicio que protege el recurso comprueba qué acciones tiene permitidas.

::: aviso
**Autenticación y autorización no son lo mismo.**

- La autenticación responde a **«¿quién eres?»**.
- La autorización responde a **«¿qué puedes hacer?»**.

Una contraseña correcta no concede acceso a todos los recursos.
:::

### Ejemplo: acceder a una carpeta de departamento

::: tip
Ana intenta abrir la carpeta compartida de ventas.

1. El sistema verifica su identidad.
2. El servidor de archivos comprueba los permisos de la carpeta y los grupos de Ana.
3. Si sus permisos lo permiten, podrá acceder. Además, podría tener permiso para leer documentos, pero no para modificarlos.

El directorio puede proporcionar información sobre Ana y sus grupos; **el servidor de archivos aplica los permisos de la carpeta**.
:::

### ¿Qué son las listas de control de acceso?

Una **lista de control de acceso**, o **ACL**, contiene reglas que indican qué usuarios o grupos pueden realizar determinadas acciones sobre un recurso.

El servidor de directorio puede utilizar sus propias reglas para proteger sus entradas y atributos. Otros servicios, como un servidor de archivos, mantienen las reglas que corresponden a sus recursos.

### Tickets y tokens

Algunos sistemas de autenticación proporcionan **tickets o tokens** que permiten acreditar la identidad ante otros servicios sin volver a introducir la contraseña en cada acceso.

::: aviso
**No todos los servicios de directorio emiten tickets o tokens.**

Esto depende del sistema de autenticación integrado. Estudiaremos más adelante cómo se relacionan los directorios con mecanismos como Kerberos y el inicio de sesión único.
:::

## 2. Protocolos que trabajan junto a los servicios de directorio

En una organización, varios protocolos pueden colaborar para **consultar información, autenticar usuarios y localizar servicios**.

Cada uno tiene una función diferente:

| Protocolo | Función principal | Ejemplo |
| --- | --- | --- |
| **LDAP** | Consultar y administrar información del directorio. | Buscar un usuario y consultar sus grupos. |
| **Kerberos** | Autenticar mediante tickets con una validez limitada. | Acreditar la identidad de un usuario ante un servicio de la empresa. |
| **SAML** | Intercambiar afirmaciones de identidad entre un proveedor de identidad y una aplicación. | Acceder a una aplicación web mediante el inicio de sesión de la organización. |
| **DNS** | Resolver nombres y ayudar a localizar servicios en la red. | Encontrar la dirección de un servidor o localizar un servicio de directorio. |

### LDAP: consultar el directorio

**LDAP** permite a las aplicaciones buscar entradas, consultar atributos y solicitar modificaciones.

Por ejemplo, una aplicación puede consultar el correo electrónico de una persona o los grupos a los que pertenece.

LDAP puede utilizarse tanto en redes internas como en otras redes basadas en IP; **no requiere que el directorio sea accesible desde Internet**.

### Kerberos: demostrar la identidad mediante tickets

**Kerberos** utiliza tickets con una validez limitada para que un usuario pueda acreditar su identidad ante distintos servicios.

Esto permite acceder a servicios compatibles sin volver a introducir la contraseña en cada uno.

::: tip
Imagina que, después de identificarte, recibes un pase temporal que puedes presentar en determinados servicios.

El ticket de Kerberos cumple una función parecida: permite acreditar tu identidad, pero **el servicio sigue comprobando qué acciones tienes permitidas**.
:::

### SAML: acceder a aplicaciones con una identidad común

**SAML** permite que una aplicación confíe en la información de autenticación proporcionada por un **proveedor de identidad**.

Utiliza mensajes basados en XML y se emplea habitualmente para facilitar el **inicio de sesión único**, o **SSO** (*Single Sign-On*).

Por ejemplo, una organización puede permitir que sus usuarios accedan a varias aplicaciones web mediante su identidad corporativa.

::: aviso
**SSO no significa utilizar la misma contraseña en varias aplicaciones independientes.**

Los sistemas cooperan para aprovechar una autenticación previa, evitando que cada aplicación tenga que verificar por separado la contraseña del usuario.
:::

### DNS: encontrar los servicios

**DNS** permite resolver nombres, como `servidor.empresa.example`, para obtener información como su dirección IP.

También puede ayudar a localizar servicios mediante registros específicos. Esto permite que los clientes encuentren los servidores con los que necesitan comunicarse.

::: aviso
**DNS no autentica al usuario ni decide sus permisos.**

Ayuda a localizar los servicios; la comprobación de identidad y el control de acceso corresponden a otros mecanismos.
:::

::: nota
Estos protocolos pueden complementarse, pero **no todos son obligatorios en cualquier instalación**. Su utilización depende de la solución y de cómo esté configurada.
:::

## 3. Componentes de un servicio de directorio

Un servicio de directorio combina **programas que atienden solicitudes**, **reglas para organizar los datos** y **mecanismos para mantenerlos disponibles**.

### 1. Servidor de directorio

Es el **software que almacena y gestiona la información del directorio**, atiende las solicitudes de los clientes y aplica las reglas de acceso.

Puede ejecutarse en un equipo físico o en una máquina virtual. En OpenLDAP, este programa es **`slapd`**.

Los clientes pueden comunicarse con él mediante LDAP y proteger esa comunicación mediante TLS.

### 2. Clientes de directorio

Son las **aplicaciones que se conectan al servidor** para consultar o administrar información.

Por ejemplo:

- Una herramienta que permite crear cuentas.
- Una aplicación que consulta los grupos de un usuario.
- Una libreta de direcciones que busca correos electrónicos.

::: nota
**El cliente es el programa que realiza la solicitud**, aunque actúe en nombre de una persona o de un dispositivo.
:::

### 3. Árbol de información del directorio (DIT)

El **DIT** organiza las entradas mediante una **estructura jerárquica**.

Las entradas pueden representar personas, grupos, unidades organizativas o dispositivos. Su posición en el árbol permite situarlas dentro del directorio.

Por ejemplo, una organización podría tener una rama para personas y otra para grupos.

### 4. Esquema

El **esquema define las reglas que deben cumplir los datos** del directorio:

- Qué clases de objeto existen.
- Qué atributos son obligatorios o están permitidos.
- Qué sintaxis y restricciones se aplican a sus valores.

::: tip
Podemos comparar el directorio con un archivo de fichas:

- El **DIT** indica dónde está colocada cada ficha.
- El **esquema** establece qué campos puede contener y cuáles deben rellenarse.
:::

::: aviso
**El esquema no define la ubicación física de los datos en el disco.**

Define su estructura lógica y sus reglas. Tampoco sustituye a los permisos de acceso.
:::

### 5. Mecanismos de replicación

La **replicación** permite mantener copias de la información del directorio en varios servidores.

Estas copias pueden ayudar a:

- Mantener el servicio si un servidor falla.
- Repartir las consultas.
- Atender a los clientes desde un servidor cercano.

La replicación puede formar parte del propio servidor de directorio; no tiene por qué ser una herramienta independiente.

::: aviso
**Replicar no equivale a hacer una copia de seguridad.**

Si se elimina una entrada por error, esa eliminación también puede propagarse a las réplicas. Para recuperar estados anteriores necesitamos copias de seguridad y procedimientos de restauración.
:::

## 4. ¿Qué beneficios aporta un servicio de directorio?

Los servicios de directorio facilitan la administración de **usuarios, grupos y recursos**. Integrados con otros sistemas, también pueden mejorar la seguridad y la disponibilidad.

### 1. Centralizar la gestión de identidades

Mantener una fuente común de información reduce la necesidad de crear y actualizar los mismos datos por separado en cada aplicación.

Esto facilita tareas como:

- Dar de alta a una persona.
- Actualizar su departamento o sus datos de contacto.
- Cambiar sus grupos.
- Deshabilitar su cuenta cuando deja la organización.

### 2. Facilitar el inicio de sesión único

Cuando el directorio se integra con un sistema de **inicio de sesión único (SSO)**, los usuarios pueden acceder a varias aplicaciones sin volver a introducir sus credenciales en cada una.

Según la solución, se utilizan tickets, tokens u otros mecanismos para acreditar la identidad.

::: aviso
**Un directorio no proporciona SSO automáticamente.**

Las aplicaciones y el sistema de autenticación deben estar preparados y configurados para trabajar juntos.
:::

### 3. Administrar permisos mediante grupos

Los grupos permiten organizar la asignación de permisos sin configurar cada usuario individualmente.

::: tip
La carpeta de ventas concede acceso al grupo `Ventas`.

Cuando incorporamos una nueva empleada a ese grupo, el servidor de archivos puede reconocer su pertenencia y concederle los permisos correspondientes.

Así evitamos añadir su cuenta por separado a cada carpeta del departamento.
:::

Este enfoque **reduce el trabajo repetitivo y la posibilidad de errores**, siempre que los grupos y permisos estén bien definidos.

### 4. Aplicar medidas de seguridad coherentes

La centralización facilita administrar reglas de acceso, revisar cuentas y aplicar políticas de autenticación en los sistemas integrados.

Además, mecanismos como **TLS** permiten proteger las comunicaciones entre clientes y servidores.

::: aviso
**Ninguna herramienta garantiza por sí sola la seguridad ni el cumplimiento normativo.**

El resultado depende de la configuración, los permisos, las actualizaciones y los procedimientos de administración.
:::

### 5. Mejorar la disponibilidad y repartir la carga

Mantener réplicas del directorio en varios servidores puede permitir que el servicio continúe cuando uno falla y ayudar a repartir las consultas.

Conviene distinguir:

- **Disponibilidad:** que el servicio esté accesible cuando se necesita.
- **Rendimiento:** que responda con rapidez a las solicitudes.
- **Escalabilidad:** que pueda adaptarse al crecimiento de usuarios y operaciones.

::: nota
La replicación puede contribuir a estas capacidades, pero **no garantiza capacidad ilimitada ni ausencia de interrupciones**. Es necesario dimensionar y configurar la infraestructura.
:::

### 6. Integrar aplicaciones y automatizar tareas

Los directorios pueden conectarse con aplicaciones de recursos humanos, correo, gestión empresarial y otros servicios mediante **protocolos, conectores y API**.

::: tip
El alta de una persona en recursos humanos puede iniciar un proceso que cree su cuenta y la incorpore a los grupos correspondientes.

Para que esto ocurra, debe existir una integración que traduzca los datos del alta en acciones sobre el directorio.
:::

Estas integraciones pueden utilizarse en entornos **locales, en la nube o híbridos**. Su complejidad depende de la compatibilidad entre los sistemas y de las tareas que se quieran automatizar.

## 5. ¿Qué retos presenta un servicio de directorio?

A medida que una organización incorpora más **usuarios, dispositivos y aplicaciones**, aumenta la información que debe administrar y el número de consultas y cambios que recibe el directorio.

Mantener el servicio requiere prestar atención a su **capacidad, coherencia, disponibilidad y seguridad**.

### 1. Gestionar el crecimiento

Un directorio debe disponer de recursos suficientes para almacenar la información y atender las solicitudes.

El rendimiento depende de factores como:

- El número de clientes y las operaciones que realizan.
- La complejidad de las búsquedas.
- Los índices configurados.
- Los recursos de los servidores y la red.

::: nota
**No importa solo cuántos usuarios hay, sino cómo utilizan el servicio.**

Muchas aplicaciones realizando consultas frecuentes pueden generar una carga considerable, aunque el número de personas sea reducido.
:::

### 2. Mantener actualizadas las réplicas

Cuando existen varias copias del directorio, los cambios deben propagarse entre ellas.

Durante ese proceso puede haber **diferencias temporales**: un servidor ya conoce una actualización y otro todavía no la ha recibido.

::: tip
Si una persona deja de pertenecer al grupo de administración, interesa que ese cambio llegue a los servidores que consultan las aplicaciones.

Una réplica retrasada podría seguir indicando que pertenece al grupo anterior.
:::

::: aviso
**Tener replicación configurada no significa que esté funcionando correctamente.**

Es necesario supervisar los errores y retrasos de sincronización.
:::

### 3. Mantener el servicio disponible

Muchas aplicaciones dependen del directorio. Si deja de responder, pueden verse afectados los inicios de sesión, las consultas de usuarios y otras operaciones.

La **tolerancia a fallos** es la capacidad de continuar prestando servicio cuando falla algún componente.

Para mejorarla, se pueden utilizar:

- Servidores redundantes.
- Réplicas del directorio.
- Mecanismos para que los clientes utilicen otro servidor.
- Procedimientos de recuperación probados.

::: aviso
**Disponer de un segundo servidor no basta.**

Los clientes deben poder localizarlo y utilizarlo si el primero falla. También hay que comprobar que no dependan ambos de un mismo componente cuya caída los deje inaccesibles.
:::

### 4. Proteger un recurso crítico

El directorio contiene información sobre identidades, grupos y otros datos relevantes para el acceso a los sistemas. Por ello, comprometerlo puede afectar a muchas partes de la organización.

Entre los riesgos se encuentran:

- El robo de credenciales.
- La consulta no autorizada de información.
- La modificación de grupos o permisos.
- La eliminación o el cifrado de datos.
- La interrupción del servicio.

Para reducir estos riesgos es necesario **limitar los privilegios, proteger las comunicaciones, mantener los sistemas actualizados y revisar los registros de actividad**.

::: nota
Las **copias de seguridad y las pruebas de restauración** forman parte de la protección del directorio.

Las réplicas ayudan a mantener la disponibilidad, pero también pueden recibir cambios incorrectos o maliciosos.
:::

## 6. Casos de uso de los servicios de directorio

Los servicios de directorio ayudan a resolver necesidades habituales de una organización: **gestionar cuentas, organizar permisos y conectar aplicaciones con una fuente común de identidades**.

### 1. Gestionar el ciclo de vida de las cuentas

La **gestión de identidades y accesos (IAM)** reúne procesos y herramientas para administrar las identidades digitales y su acceso a los sistemas, tanto locales como en la nube.

El directorio puede proporcionar la información necesaria para:

- Crear una cuenta cuando se incorpora una persona.
- Actualizar sus grupos cuando cambia de función.
- Deshabilitarla cuando deja la organización.

::: tip
Una profesora se incorpora al centro. Se crea su cuenta y se añade a los grupos que necesita.

Cuando cambia de departamento, se revisan sus grupos y permisos. Cuando deja el centro, se deshabilita su cuenta y se gestionan sus accesos pendientes.
:::

### 2. Facilitar SSO y autenticación multifactor

El directorio puede integrarse con sistemas de:

- **Inicio de sesión único (SSO):** permiten aprovechar una autenticación para acceder a varias aplicaciones.
- **Autenticación multifactor (MFA):** exige pruebas de identidad de al menos dos categorías diferentes, como algo que sabes y algo que tienes.

::: tip
Para acceder al portal del centro, introduces tu contraseña y confirmas el acceso mediante un dispositivo que tienes registrado.

La contraseña representa **algo que sabes** y el dispositivo, **algo que tienes**.
:::

::: aviso
**Dos contraseñas no constituyen dos factores distintos.**

Además, SSO y MFA requieren mecanismos e integraciones específicos: no aparecen automáticamente por instalar un directorio.
:::

### 3. Administrar identidades con soluciones de código abierto

Existen soluciones de código abierto que permiten implantar servicios de directorio y gestionar identidades.

Por ejemplo:

| Solución | Qué aporta |
| --- | --- |
| **OpenLDAP** | Un servidor de directorio al que las aplicaciones pueden acceder mediante LDAP. |
| **FreeIPA** | Una plataforma que integra directorio, autenticación y administración de identidades para entornos Linux y Unix. |

Estas soluciones permiten estudiar tanto el funcionamiento del directorio como su integración con otros servicios.

::: nota
**Código abierto no significa ausencia de costes de administración.**

El despliegue, las actualizaciones, las copias de seguridad y el mantenimiento siguen requiriendo recursos y conocimientos.
:::

### 4. Conectar identidades entre entornos locales y la nube

Una organización puede tener servidores propios y utilizar aplicaciones de distintos proveedores en la nube.

La integración de identidades permite relacionar esos entornos mediante mecanismos como la sincronización y la federación.

::: tip
El centro mantiene sus cuentas en un sistema corporativo y utiliza una plataforma educativa en la nube.

Una integración puede permitir que el alumnado acceda a esa plataforma con su identidad del centro, evitando gestionar otra contraseña independiente.
:::

::: aviso
**Una cuenta centralizada no funciona automáticamente en cualquier aplicación.**

Es necesario comprobar la compatibilidad y configurar cómo se autentican los usuarios, qué datos se comparten y cómo se gestionan las bajas.
:::

### 5. Organizar el acceso a recursos de red

Los directorios pueden almacenar información sobre usuarios, grupos y recursos que utilizan otros servicios de la red.

Esto facilita administrar el acceso a:

- Carpetas compartidas.
- Impresoras.
- Aplicaciones internas.
- Otros recursos de la organización.

Por ejemplo, un servidor de archivos puede utilizar los grupos del directorio para aplicar los permisos de una carpeta.

::: nota
**El directorio aporta información; el servicio que protege cada recurso aplica sus permisos.**

Guardar una impresora o un grupo en el directorio no configura por sí solo todos los accesos necesarios.
:::

## 7. Ampliación: automatización e inteligencia artificial

::: nota
**Lectura opcional.** Este apartado presenta posibles aplicaciones de la automatización y la IA en la gestión de identidades. No es necesario utilizar estas tecnologías para administrar un directorio.
:::

Los servicios de directorio pueden integrarse con herramientas que **automatizan tareas y analizan la actividad de las cuentas**.

Conviene distinguir dos conceptos:

- **Automatización mediante reglas:** ejecuta acciones previamente definidas cuando se cumplen ciertas condiciones.
- **Inteligencia artificial:** puede analizar datos para identificar patrones y generar recomendaciones o alertas.

::: aviso
**Automatizar una tarea no implica utilizar IA.**

Crear una cuenta y añadirla a un grupo según su departamento puede hacerse mediante reglas, scripts o flujos de trabajo.
:::

### 1. Directorio como servicio

Un **directorio como servicio**, o **DaaS** (*Directory as a Service*), ofrece funciones de directorio mediante una plataforma gestionada por un proveedor.

Este modelo puede reducir parte del trabajo de mantenimiento de los servidores y facilitar la integración con aplicaciones.

::: aviso
**DaaS no depende de la inteligencia artificial.**

Es un modelo de prestación del servicio. Las funciones de IA que incorpore una plataforma son capacidades adicionales.
:::

### 2. Análisis de actividad y detección de anomalías

Las herramientas de análisis pueden examinar información como:

- Horarios de inicio de sesión.
- Dispositivos utilizados.
- Ubicaciones aproximadas de acceso.
- Recursos solicitados.
- Intentos fallidos de autenticación.

El objetivo es identificar comportamientos que merezcan una revisión.

::: tip
Una cuenta que suele utilizarse por la mañana comienza a registrar numerosos intentos de acceso de madrugada desde un dispositivo desconocido.

Una herramienta podría generar una alerta para que el equipo de administración investigue lo ocurrido.
:::

::: aviso
**Una anomalía no demuestra que exista un ataque.**

Un viaje, un cambio de horario o un dispositivo nuevo pueden producir actividad poco habitual. Las alertas deben interpretarse en su contexto.
:::

### 3. Automatización del ciclo de vida de las identidades

El **ciclo de vida de una identidad** abarca su creación, los cambios que experimenta y su retirada cuando deja de ser necesaria.

Se pueden automatizar tareas como:

- Crear cuentas a partir de un alta autorizada.
- Asignar grupos según la función de la persona.
- Revisar accesos cuando cambia de departamento.
- Deshabilitar cuentas tras una baja.
- Detectar cuentas que requieren revisión por inactividad.

Las herramientas de IA pueden apoyar el análisis y las recomendaciones, pero las reglas de acceso deben responder a las necesidades de la organización.

### 4. Aplicar el principio de mínimo privilegio

El **mínimo privilegio** consiste en conceder únicamente los accesos necesarios para realizar una función.

::: tip
Una nueva empleada de ventas necesita acceder a las herramientas de su departamento, pero no administrar el directorio.

Una regla de incorporación puede asignarle los grupos de ventas sin concederle privilegios administrativos.
:::

::: aviso
**La automatización también puede propagar errores.**

Una regla incorrecta puede conceder permisos excesivos a muchas cuentas. Por eso es necesario revisar las asignaciones, registrar los cambios y establecer controles sobre las acciones sensibles.
:::

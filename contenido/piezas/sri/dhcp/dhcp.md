---
titulo: "Teoría DHCP"
---

# 1. ¿Qué es DHCP?

**DHCP** significa *Dynamic Host Configuration Protocol*, o **protocolo de configuración dinámica de equipos**. Permite que un dispositivo obtenga automáticamente una dirección IP y otros parámetros necesarios para comunicarse en una red.

Cuando conectas un portátil a la red del aula y seleccionas «obtener una dirección IP automáticamente», un cliente DHCP puede solicitar esa configuración a un servidor. El administrador prepara las reglas en el servidor; el usuario no tiene que escribirlas en cada equipo.

::: nota
En este tema estudiaremos **DHCP para IPv4 (DHCPv4)**. DHCPv6 configura redes IPv6, pero utiliza mensajes y mecanismos diferentes. La secuencia que veremos aquí no debe trasladarse directamente a IPv6.
:::

## 1.1. Antes de automatizar: configuración manual

Imagina un aula con treinta ordenadores. Para configurarlos manualmente, tendríamos que decidir qué dirección corresponde a cada uno e introducir su máscara, puerta de enlace y servidores DNS.

Por ejemplo, un puesto podría utilizar:

| Parámetro | Valor de ejemplo | ¿Para qué sirve? |
| --- | --- | --- |
| Dirección IPv4 | `192.168.10.101` | Identifica su interfaz en esta red. |
| Máscara de subred | `255.255.255.0` | Permite determinar qué direcciones pertenecen a su subred. |
| Puerta de enlace | `192.168.10.1` | Es el router al que envía el tráfico destinado a otras redes. |
| Servidor DNS | `192.168.10.2` | Recibe las consultas para resolver nombres. |

El siguiente puesto necesitaría una dirección distinta, aunque podría compartir los demás parámetros. Habría que registrar las asignaciones para evitar que dos equipos utilizaran la misma dirección.

Con pocos dispositivos, configurar la red manualmente puede resultar sencillo. Sin embargo, cuando tenemos varias aulas y decenas de equipos, necesitamos **llevar un registro de las direcciones asignadas** e introducir los parámetros de red en cada dispositivo.

Además, esta configuración requiere mantenimiento. Si cambia la dirección del servidor DNS o de la puerta de enlace, tendremos que actualizar ese dato en todos los equipos afectados. Si un portátil se conecta a otra subred, también necesitará una configuración adecuada para esa nueva ubicación.

Cuantos más equipos tengamos que configurar, mayor será la posibilidad de cometer errores:

- **Dirección IP duplicada:** si asignamos la misma dirección a dos equipos de la misma red, se puede producir un conflicto que dificulte su comunicación.
- **Máscara incorrecta:** el equipo puede interpretar mal qué direcciones pertenecen a su propia subred.
- **Puerta de enlace incorrecta:** puede impedir el acceso a otras redes, aunque el equipo siga comunicándose con dispositivos de su subred.
- **Servidor DNS incorrecto:** puede impedir que el equipo resuelva nombres, aunque tenga conectividad IP.

::: tip
Imagina que cambia la dirección del servidor DNS del centro. Si los treinta ordenadores del aula están configurados manualmente, habrá que modificar ese dato en cada uno. Con un servicio de configuración automática, podemos centralizar el cambio y distribuirlo a los clientes cuando obtengan o renueven su configuración.
:::

Por tanto, el problema no es únicamente configurar los equipos la primera vez, sino **mantener su configuración correcta a medida que cambia la red**. Esta necesidad explica la utilidad de protocolos como BOOTP y DHCP.

**La configuración manual sigue siendo útil**, pero requiere planificación y mantenimiento. Automatizar permite reducir tareas repetitivas, especialmente en equipos de usuario.

## 1.2. BOOTP: obtener la configuración al arrancar

**BOOTP**, o *Bootstrap Protocol*, apareció para que un equipo pudiera obtener por la red información necesaria para arrancar y comunicarse. Resultaba especialmente útil en máquinas sin disco, que no podían depender de una configuración guardada localmente.

El funcionamiento de BOOTP se basaba en una **configuración preparada previamente por el administrador**. En el servidor se registraba qué dirección IP y qué información de arranque correspondían a cada equipo, identificándolo normalmente mediante su **dirección MAC**, la dirección de hardware de su interfaz de red.

Cuando el equipo arrancaba, el proceso era el siguiente:

1. **El cliente enviaba una petición BOOTP** para solicitar su configuración.
2. **El servidor buscaba la configuración asociada a ese equipo** en sus registros.
3. **El servidor respondía con los datos correspondientes**, como la dirección IP que debía utilizar. También podía indicar el servidor y el nombre del archivo necesario para continuar el arranque.

::: tip
Imagina un ordenador sin disco que necesita obtener por la red el software para arrancar. El administrador registra previamente su dirección MAC en el servidor BOOTP y le asocia una dirección IP y un archivo de arranque. Cuando el ordenador se enciende, solicita esos datos y recibe la información necesaria para localizar y descargar el archivo.
:::

::: aviso
**BOOTP no transfiere el archivo de arranque:** 

proporciona la información necesaria para localizarlo. La descarga se realiza mediante otro protocolo, como TFTP.
:::

Esto evitaba introducir los datos en cada cliente, pero el administrador seguía teniendo que preparar las asignaciones. **BOOTP no incorporaba el sistema de concesiones temporales y reutilización dinámica de direcciones propio de DHCP.** [Referencia: RFC 951](https://www.rfc-editor.org/rfc/rfc951).

## 1.3. DHCP: asignar direcciones durante un tiempo

DHCP se desarrolló a partir de BOOTP y añadió mecanismos para administrar direcciones de forma dinámica. El servidor puede elegir una dirección disponible de un conjunto y concedérsela a un cliente durante un tiempo determinado.

Esa asignación temporal se llama **concesión** o **arrendamiento** (*lease*). El cliente puede renovarla; cuando deja de ser válida, la dirección puede volver a utilizarse conforme al estado que mantiene el servidor.

| Enfoque | ¿Dónde se prepara la configuración? | Idea principal |
| --- | --- | --- |
| Manual | En cada equipo. | El administrador introduce y mantiene los parámetros. |
| BOOTP clásico | En el servidor, con asignaciones preparadas. | El equipo solicita su configuración al arrancar. |
| DHCP dinámico | En el servidor, con rangos y reglas. | El equipo obtiene una dirección disponible mediante una concesión. |

::: tip
Piensa en los portátiles de una biblioteca: no necesitamos guardar una dirección exclusiva para cada persona que pueda visitarla. Necesitamos suficientes direcciones para los dispositivos que las utilizan al mismo tiempo.
:::

# 2. ¿Para qué sirve DHCP?

DHCP permite **centralizar la configuración de red**: el administrador define en el servidor qué direcciones se pueden asignar y qué parámetros deben recibir los clientes. Así, no es necesario introducir esos datos manualmente en cada dispositivo.

Esto facilita el mantenimiento, reduce los errores de configuración y permite **reutilizar las direcciones mediante concesiones temporales**. Además, cuando un portátil cambia de subred, puede solicitar una configuración adecuada para su nueva ubicación.

El servidor no entrega únicamente una dirección IP. También puede proporcionar **opciones DHCP**, que incluyen otros parámetros necesarios para utilizar la red:

- **Máscara de subred:** permite al equipo determinar qué direcciones pertenecen a su propia subred.
- **Puerta de enlace predeterminada:** indica a qué router debe enviar el tráfico destinado a otras redes.
- **Servidores DNS:** indican dónde consultar para resolver nombres, como el de una página web, en direcciones IP.

**Los parámetros pueden variar según la subred o el cliente.** Por ejemplo, dos aulas situadas en subredes diferentes necesitarán direcciones IP y puertas de enlace adecuadas para cada una, aunque puedan utilizar el mismo servidor DNS.

::: tip
Imagina que conectas tu portátil primero a la red de casa y después a la del centro. Ambas pueden utilizar subredes, routers y servidores DNS diferentes. Si el portátil está configurado para utilizar DHCP y las dos redes ofrecen este servicio, podrá obtener los parámetros correspondientes en cada lugar sin que tengas que introducirlos manualmente.
:::

Los clientes deben admitir las opciones que reciben para poder utilizarlas. [Referencia: IBM, opciones DHCP](https://www.ibm.com/docs/en/i/7.4.0?topic=concepts-dhcp-options-lookup).

::: aviso
**DHCP proporciona configuración de red; no garantiza el acceso a Internet.** 

Un equipo puede recibir correctamente su dirección IP y comunicarse dentro del aula, pero no navegar porque falla el router, no existe conexión exterior o hay un problema con la resolución de nombres mediante DNS.
:::

## 2.1. Ejemplo

Vamos a diseñar la configuración del aula:

| Elemento | Decisión del administrador |
| --- | --- |
| Subred del aula | `192.168.10.0/24` |
| Direcciones para asignación dinámica | De `192.168.10.100` a `192.168.10.199` |
| Puerta de enlace | `192.168.10.1` |
| Servidor DNS | `192.168.10.2` |
| Servidor DHCP | `192.168.10.3` |
| Impresora con reserva DHCP | `192.168.10.50` |
| Duración de las concesiones del ejemplo | 8 horas |

El rango dinámico contiene **100 direcciones**. Las direcciones del router y de los servidores se mantienen fuera de él. La impresora tendrá una reserva, que veremos más adelante.

Las ocho horas son una elección para este ejemplo, no un valor obligatorio del protocolo. Además, los servicios indicados deben existir y estar correctamente configurados: escribir la dirección de un DNS en DHCP no crea ese servidor.

## 2.2. Lo que DHCP no resuelve automáticamente

DHCP automatiza la entrega de la configuración, pero **el administrador sigue siendo responsable de planificar la red**. Antes de poner en marcha el servicio, debe decidir:

- **Qué subred se utilizará:** determina las direcciones que pueden asignarse a los dispositivos.
- **Qué rango gestionará DHCP:** es el conjunto de direcciones que el servidor podrá repartir entre los clientes.
- **Cuántas direcciones serán necesarias:** debe tener en cuenta los equipos habituales y otros dispositivos que puedan conectarse.
- **Qué direcciones se configurarán manualmente:** deben quedar fuera del reparto dinámico para evitar que el servidor las asigne a otro equipo.

Si las cien direcciones de un rango están ocupadas por concesiones vigentes, otro cliente no podrá obtener una nueva dirección de ese conjunto. Será necesario que quede alguna disponible o revisar la planificación del rango.

::: tip
Imagina que el aula dispone de treinta ordenadores, pero el rango DHCP solo contiene veinte direcciones. Aunque el servidor funcione correctamente, no podrá proporcionar una dirección a todos a la vez. El problema está en el tamaño del rango, no en el funcionamiento del protocolo.
:::

**DHCP administra las direcciones disponibles; no amplía la subred.** Podemos aumentar el rango si quedan direcciones utilizables dentro de ella, pero, si la subred resulta insuficiente, tendremos que revisar el direccionamiento de la red.

Además, DHCP puede utilizar identificadores del dispositivo para gestionar sus concesiones, pero **no comprueba quién es la persona que lo está utilizando**. Esa función corresponde a otros mecanismos, como el inicio de sesión y los sistemas de autenticación.

::: aviso
**Recibir una dirección IP no equivale a tener autorización para acceder a los recursos de la red.** 

Un portátil puede obtener su configuración mediante DHCP y seguir necesitando una cuenta y los permisos correspondientes para acceder a una carpeta compartida o a una aplicación del centro.
:::

# 3. ¿Cómo funciona DHCP?

## 3.1. Cliente, servidor y configuración del servicio

DHCP utiliza un **modelo cliente-servidor**: un programa solicita la configuración de red y otro se encarga de proporcionarla.

- **Cliente DHCP:** es el software del dispositivo que solicita y recibe la configuración. Normalmente forma parte del sistema operativo y actúa cuando configuramos una interfaz para obtener su dirección IP automáticamente.
- **Servidor DHCP:** es el servicio que recibe las peticiones, decide qué configuración corresponde a cada cliente y registra las concesiones realizadas.

Para atender a los equipos del aula, el administrador debe configurar en el servidor varios elementos:

| Elemento | ¿Qué determina? | Ejemplo |
| --- | --- | --- |
| **Subred** | La red a la que pertenecen las direcciones de los clientes. | `192.168.10.0/24` |
| **Rango de direcciones** | Las direcciones disponibles para el reparto dinámico. | De `192.168.10.100` a `192.168.10.199` |
| **Opciones** | Los parámetros que recibirán los clientes. | Puerta de enlace y servidores DNS. |
| **Duración de la concesión** | El tiempo durante el que un cliente puede utilizar la dirección antes de que caduque si no se renueva. | 8 horas. |

En **Windows Server**, el conjunto de configuración asociado a una subred se denomina **ámbito**. En otras implementaciones, como Kea, aparecen términos como *subnet* para definir la subred y *pool* para indicar un rango de direcciones que se pueden repartir.

::: aviso
**Subred y rango no son lo mismo.** 

La subred define el espacio de direccionamiento de la red; el rango DHCP selecciona qué parte de ese espacio utilizará el servidor para asignar direcciones dinámicamente.
:::

Además de su configuración, el servidor mantiene un **registro de concesiones**: qué dirección ha asignado a cada cliente y hasta cuándo es válida.

Conviene distinguir ambas informaciones:

- **La configuración del servicio** establece las reglas: qué direcciones se pueden repartir, con qué opciones y durante cuánto tiempo.
- **El registro de concesiones** refleja las asignaciones realizadas: qué clientes tienen direcciones concedidas y cuándo caducan.

::: tip
Configurar el rango `192.168.10.100–192.168.10.199` significa que el servidor puede repartir esas direcciones. Registrar que un portátil tiene concedida `192.168.10.101` hasta las 16:00 significa que ya ha realizado una asignación concreta siguiendo esas reglas.
:::

## 3.2. La primera asignación: DORA

Cuando un cliente necesita obtener una configuración inicial, puede realizar un intercambio de cuatro mensajes con el servidor. Esta secuencia se conoce como **DORA**, por las iniciales de *Discover*, *Offer*, *Request* y *Acknowledgment*.

Para entenderla, imaginemos que conectamos por primera vez un portátil a la red del aula.

### 1. Descubrimiento: DHCPDISCOVER

El portátil necesita una dirección IP, pero todavía no sabe qué servidor puede proporcionársela. Por eso envía un mensaje **DHCPDISCOVER** mediante **difusión** (*broadcast*): una comunicación dirigida a todos los dispositivos de su red local.

Con este mensaje pregunta, de forma equivalente: «¿Hay algún servidor DHCP que pueda ofrecerme una configuración?».

### 2. Oferta: DHCPOFFER

Un servidor que puede atender la petición responde con un mensaje **DHCPOFFER**. En él propone una dirección IP y los parámetros correspondientes, incluida la duración de la concesión.

En nuestro ejemplo, podría ofrecer la dirección `192.168.10.101` durante ocho horas, junto con la máscara, la puerta de enlace y el servidor DNS del aula.

Si hay varios servidores DHCP disponibles, el cliente puede recibir **más de una oferta**.

### 3. Solicitud: DHCPREQUEST

El cliente selecciona una oferta y envía un mensaje **DHCPREQUEST**, indicando la dirección solicitada y el servidor que ha elegido.

En esta fase inicial, el mensaje se envía por difusión. Así, los servidores que realizaron ofertas pueden saber cuál ha sido seleccionado y cuáles no.

El portátil estaría comunicando: «Solicito la dirección `192.168.10.101` ofrecida por este servidor».

### 4. Confirmación: DHCPACK

El servidor seleccionado responde con un mensaje **DHCPACK**, que confirma la concesión y sus parámetros.

El cliente puede completar la configuración de su interfaz y, tras las comprobaciones correspondientes, utilizar la dirección concedida.

| Paso | Mensaje | Idea principal |
| --- | --- | --- |
| **Descubrimiento** | `DHCPDISCOVER` | «Necesito una configuración». |
| **Oferta** | `DHCPOFFER` | «Puedo ofrecerte esta dirección y estos parámetros». |
| **Solicitud** | `DHCPREQUEST` | «Selecciono esta oferta y solicito esa dirección». |
| **Confirmación** | `DHCPACK` | «Confirmo la concesión». |

::: aviso
**Una oferta no es una concesión confirmada.** 

El cliente no debe empezar a utilizar la dirección únicamente por haber recibido un `DHCPOFFER`: todavía tiene que solicitarla y recibir la confirmación del servidor.
:::

### ¿Cómo se comunican sin una dirección IP inicial?

En el descubrimiento inicial, el cliente puede utilizar `0.0.0.0` como dirección de origen y `255.255.255.255` como destino de difusión. Así puede buscar un servidor sin tener todavía una dirección asignada para esa subred.

DHCPv4 utiliza **UDP** como protocolo de transporte:

- **Puerto 67:** utilizado por el servidor DHCP.
- **Puerto 68:** utilizado por el cliente DHCP.

::: nota
La difusión inicial se limita a la red local: los routers no la reenvían normalmente a otras subredes. Más adelante veremos cómo un **agente de retransmisión DHCP**, o *relay*, permite contactar con un servidor situado en otra red.
:::

::: aviso
**No todos los intercambios DHCP siguen la secuencia DORA ni todos sus mensajes se envían por difusión.** 

Por ejemplo, un cliente que renueva una concesión no necesita repetir el descubrimiento inicial. Las respuestas del servidor también pueden enviarse de distintas formas según el estado del cliente y la presencia de un relay.
:::

[Referencia: IBM, interacción entre cliente y servidor DHCP](https://www.ibm.com/docs/en/i/7.4.0?topic=concepts-dhcp-clientserver-interaction).

## 3.3. Concesiones: renovación y caducidad

Una dirección asignada mediante DHCP tiene un **tiempo de concesión**: el periodo durante el que el cliente puede utilizarla. Para conservarla, el cliente intenta renovar la concesión **antes de que caduque**, sin que el usuario tenga que intervenir.

Durante este proceso aparecen dos momentos importantes, llamados **T1** y **T2**. Ambos se calculan desde el inicio de la concesión.

### 1. T1: renovación con el servidor original

Al llegar a **T1**, el cliente envía un mensaje `DHCPREQUEST` al servidor que le concedió la dirección para solicitar una renovación. En esta fase se dirige a ese servidor mediante **unicast**, es decir, una comunicación destinada a un receptor concreto.

Si el servidor acepta la renovación, responde con un `DHCPACK` y el cliente actualiza los tiempos de su concesión.

Si no recibe respuesta, el cliente puede seguir utilizando la dirección mientras la concesión sea válida y continúa intentando renovarla.

### 2. T2: búsqueda de otro servidor que pueda renovarla

Si llega a **T2** sin haber conseguido la renovación, el cliente entra en la fase de **revinculación** (*rebinding*).

Ahora envía su `DHCPREQUEST` por **difusión**, para que pueda responder cualquier servidor capaz de atender esa concesión. Ya no se dirige únicamente al servidor original.

::: aviso
**No basta con que exista otro servidor DHCP.** 

Ese servidor debe poder atender la concesión de acuerdo con su configuración y la información de la que dispone. Más adelante veremos cómo la alta disponibilidad permite coordinar servidores para esta situación.
:::

### 3. Caducidad: dejar de utilizar la dirección

Si termina el tiempo de concesión sin recibir una renovación válida, el cliente **debe dejar de utilizar la dirección concedida** y volver a intentar obtener configuración.

Esto evita que siga utilizando una dirección que el servidor puede volver a asignar a otro dispositivo.

### Ejemplo: una concesión de ocho horas

Si el servidor no proporciona otros valores, **T1 corresponde al 50 %** de la duración de la concesión y **T2 al 87,5 %**.

Para una concesión obtenida a las 08:00 y válida durante ocho horas:

| Momento | ¿Qué sucede si no se ha renovado antes? |
| --- | --- |
| **08:00: inicio** | El cliente obtiene la dirección y puede utilizarla. |
| **12:00: T1** | Han pasado cuatro horas. Intenta renovar con el servidor original. |
| **15:00: T2** | Han pasado siete horas. Busca por difusión un servidor que pueda renovar la concesión. |
| **16:00: caducidad** | Debe dejar de utilizar la dirección si no ha conseguido renovarla. |

::: tip
Estos momentos no son pasos que deban completarse siempre. Si el portátil renueva a las 12:00 por otras ocho horas, el vencimiento pasa a las 20:00 y se recalculan T1 y T2. Por tanto, ya no necesita llegar a la revinculación prevista inicialmente para las 15:00.
:::

### ¿Qué ocurre cuando el cliente deja de necesitar la dirección?

El cliente puede enviar un mensaje **`DHCPRELEASE`** para comunicar al servidor que libera su concesión.

Sin embargo, **no todos los equipos envían este mensaje al apagarse o desconectarse**. Por ejemplo, un portátil que pierde la conexión de forma repentina no puede comunicar la liberación. En ese caso, el servidor puede mantener la concesión registrada hasta que caduque.

::: aviso
**Desconectar un dispositivo no implica que su dirección quede disponible inmediatamente.** 

El servidor necesita recibir una liberación o determinar que la concesión ha caducado.
:::

### ¿Cómo elegimos la duración de las concesiones?

La duración debe adaptarse al uso de la red:

- **Concesiones cortas:** permiten recuperar antes las direcciones de dispositivos que se han marchado sin liberarlas, pero generan renovaciones más frecuentes.
- **Concesiones largas:** reducen la frecuencia de renovación, pero pueden mantener ocupadas durante más tiempo las direcciones de dispositivos que ya no están conectados.

Por ejemplo, una red de invitados con mucha rotación puede beneficiarse de concesiones más cortas que una red de ordenadores fijos. La decisión depende de **cuántos clientes se conectan, cuánto tiempo permanecen y cuántas direcciones hay disponibles**.

[Referencia: RFC 2131, renovación y liberación de concesiones](https://www.rfc-editor.org/rfc/rfc2131).

## 3.4. Direcciones dinámicas, reservas y configuración manual

No todos los dispositivos necesitan obtener su dirección de la misma manera. Un portátil puede utilizar cualquiera de las direcciones disponibles, mientras que resulta conveniente localizar una impresora siempre en la misma dirección.

Para organizar estas necesidades, debemos distinguir **asignación dinámica, reserva DHCP y configuración manual**.

### 1. Asignación dinámica

El servidor DHCP selecciona una dirección disponible de su rango y se la concede temporalmente al cliente.

El administrador configura las reglas de asignación, pero no necesita asociar previamente una dirección concreta a cada dispositivo. Es una opción habitual para ordenadores de usuario, móviles y portátiles.

Por ejemplo, el portátil de un alumno podría recibir `192.168.10.101` y mantenerla mientras renueve su concesión.

::: aviso
**Dinámica no significa que la dirección cambie en cada conexión.** 

Un cliente puede conservar la misma dirección durante mucho tiempo mediante sucesivas renovaciones. Sin embargo, no debemos depender de que siempre reciba esa dirección si no hemos configurado una reserva.
:::

### 2. Reserva DHCP

Una **reserva** asocia una dirección IP concreta a un cliente identificado. Cuando ese cliente solicita configuración, el servidor utiliza la asociación preparada por el administrador.

Según la implementación y la configuración, el servidor puede reconocerlo mediante un **identificador de cliente** o su **dirección MAC**.

Por ejemplo, podemos reservar `192.168.10.50` para la impresora del aula. Así, los equipos pueden utilizar una dirección conocida para enviarle sus trabajos de impresión.

**La impresora sigue configurada como cliente DHCP:** solicita su dirección y recibe del servidor los parámetros correspondientes. La diferencia es que el administrador ha determinado qué dirección debe recibir.

::: tip
Si sustituimos la impresora por otra, tendremos que revisar la reserva. El nuevo dispositivo puede tener una dirección MAC o un identificador diferente, por lo que el servidor no lo reconocerá automáticamente como el cliente anterior.
:::

### 3. Configuración manual

En la configuración manual, el administrador introduce directamente en el dispositivo su dirección IP, máscara, puerta de enlace y servidores DNS, según corresponda.

La dirección **no se obtiene mediante una concesión DHCP**. Por ejemplo, podemos configurar la interfaz del router del aula con `192.168.10.1`.

Esto permite mantener una dirección fija, pero obliga a revisar la configuración del dispositivo cuando cambian los parámetros de la red.

| Modalidad | ¿Cómo obtiene la dirección el dispositivo? | ¿Dónde se decide la dirección concreta? | Ejemplo |
| --- | --- | --- | --- |
| **Asignación dinámica** | La solicita mediante DHCP. | El servidor la selecciona según sus reglas y disponibilidad. | Portátil de un alumno. |
| **Reserva DHCP** | La solicita mediante DHCP. | En una asociación configurada en el servidor. | Impresora con `192.168.10.50`. |
| **Configuración manual** | Se introduce directamente en el dispositivo. | En la configuración del propio dispositivo. | Router con `192.168.10.1`. |

### Evitar conflictos entre las asignaciones

Las direcciones configuradas manualmente deben **quedar fuera del rango dinámico o estar excluidas de él**. De lo contrario, el servidor podría conceder a un cliente una dirección que ya utiliza otro dispositivo.

En nuestro ejemplo:

- El router utiliza manualmente `192.168.10.1`.
- La impresora tiene reservada `192.168.10.50`.
- Los clientes dinámicos reciben direcciones entre `192.168.10.100` y `192.168.10.199`.

Las reservas deben configurarse respetando las reglas del producto utilizado: algunos servidores permiten situarlas fuera del rango dinámico y otros requieren una organización diferente.

::: aviso
**Una exclusión y una reserva no son lo mismo.** 

Una exclusión impide que una dirección se reparta dinámicamente; una reserva establece qué cliente debe recibir una dirección mediante DHCP.
:::

[Referencia: IBM, configuración por cliente](https://www.ibm.com/docs/en/i/7.4.0?topic=concepts-dhcp-client-support).

## 3.5. Opciones DHCP

Los mensajes DHCP pueden incluir **opciones**, campos que transportan parámetros de configuración e información necesaria para el funcionamiento del protocolo.

Cada opción tiene un **código numérico que identifica su significado** y un valor asociado. Por ejemplo, el código `6` indica que el valor contiene direcciones de servidores DNS. De esta manera, el cliente sabe cómo interpretar los datos que recibe.

### Opciones que reconoceremos en una captura

Cuando analicemos mensajes DHCP en una herramienta como Wireshark, encontraremos opciones como estas:

| Código | Opción | ¿Qué indica? | Ejemplo |
| --- | --- | --- | --- |
| **1** | Máscara de subred | La máscara que debe utilizar el cliente. | `255.255.255.0` |
| **3** | Routers | Las direcciones de los routers que puede utilizar como puerta de enlace. | `192.168.10.1` |
| **6** | Servidores DNS | Los servidores a los que puede enviar consultas de resolución de nombres. | `192.168.10.2` |
| **51** | Duración de la concesión | Durante cuántos segundos es válida la concesión. | `28800`: ocho horas. |
| **53** | Tipo de mensaje DHCP | Qué mensaje se está intercambiando. | `1`: Discover; `2`: Offer; `3`: Request; `5`: ACK. |
| **54** | Identificador del servidor | Qué servidor DHCP participa en la oferta, selección o confirmación. | `192.168.10.3` |

::: tip
No confundas el **código de la opción** con su **valor**. La opción `53` identifica el campo «tipo de mensaje». Si su valor es `1`, estamos ante un `DHCPDISCOVER`; si es `5`, se trata de un `DHCPACK`.
:::

### Dos funciones diferentes

No todas las opciones representan parámetros que introduciríamos manualmente en la configuración de una interfaz:

- **Opciones de configuración de red:** proporcionan datos como la máscara, la puerta de enlace o los servidores DNS.
- **Opciones de funcionamiento de DHCP:** permiten reconocer el tipo de mensaje, identificar al servidor o establecer la duración de la concesión.

Por tanto, las opciones sirven tanto para **configurar al cliente** como para **organizar el intercambio entre cliente y servidor**. Las que aparecen en un mensaje dependen de su finalidad: no todos los mensajes contienen las mismas.

::: aviso
**La dirección IP concedida al cliente no debe confundirse con una opción.**

En las respuestas habituales de asignación, se transporta en un campo específico del mensaje llamado `yiaddr`, que suele mostrarse como «Your IP address» en las herramientas de análisis.
:::

::: nota
**Entregar la dirección de un servidor DNS no equivale a actualizar registros en DNS.** La opción `6` indica al cliente dónde consultar nombres; no crea una asociación entre el nombre del equipo y su nueva dirección IP. Las actualizaciones dinámicas de DNS se estudiarán en el siguiente tema.
:::

[Referencia: RFC 2132, opciones DHCP](https://www.rfc-editor.org/rfc/rfc2132).

## 3.6. DHCP entre subredes: el agente de retransmisión

Hasta ahora hemos situado al cliente y al servidor DHCP en la misma subred. Sin embargo, un centro puede tener varias aulas en subredes diferentes y querer **atenderlas desde un único servidor DHCP**.

Supongamos que tenemos esta organización:

| Elemento | Aula 1 | Aula 2 |
| --- | --- | --- |
| Subred | `192.168.10.0/24` | `192.168.20.0/24` |
| Puerta de enlace | `192.168.10.1` | `192.168.20.1` |
| Rango dinámico | `192.168.10.100–192.168.10.199` | `192.168.20.100–192.168.20.199` |

El servidor DHCP sigue estando en `192.168.10.3`, dentro de la red del aula 1.

### ¿Por qué necesitamos un intermediario?

Cuando un cliente del aula 2 envía su `DHCPDISCOVER`, lo hace por **difusión en su red local**. Los routers normalmente no reenvían esa difusión a otras subredes, por lo que la petición no llega directamente al servidor del aula 1.

Para resolverlo, podemos configurar un **agente de retransmisión DHCP**, también llamado **DHCP relay**. Este actúa como intermediario entre los clientes de una subred y el servidor situado en otra.

El relay puede ejecutarse en el router que conecta las redes o en otro dispositivo que disponga de esa función y pueda recibir las peticiones de los clientes.

### ¿Cómo interviene el relay?

1. **El cliente envía su petición por difusión.** Un portátil del aula 2 busca un servidor DHCP en su red local.
2. **El relay recibe la petición y la reenvía al servidor configurado.** En nuestro ejemplo, la dirige a `192.168.10.3`.
3. **El servidor identifica la subred del cliente.** La información añadida por el relay le permite seleccionar la configuración del aula 2.
4. **El servidor responde a través del relay.** Este hace llegar la respuesta al cliente en su red local.

El relay permite completar el intercambio DHCP sin que el cliente tenga que conocer previamente la dirección del servidor remoto.

::: tip
Aunque el servidor está en `192.168.10.3`, el portátil del aula 2 debe recibir una dirección de `192.168.20.0/24`, por ejemplo `192.168.20.100`, y utilizar `192.168.20.1` como puerta de enlace. **La configuración corresponde a la subred del cliente, no a la del servidor.**
:::

### ¿Qué debe configurar el administrador?

No basta con activar la retransmisión. Para que el servicio funcione, necesitamos:

- **En el relay:** indicar a qué servidor DHCP debe reenviar las peticiones.
- **En el servidor:** definir la subred del aula 2, su rango de direcciones y sus opciones.
- **En la red:** permitir la comunicación de ida y vuelta entre el relay y el servidor.

**El relay transporta los mensajes; no crea rangos ni decide qué direcciones conceder.** Esa responsabilidad sigue correspondiendo al servidor DHCP.

::: aviso
**Configurar una puerta de enlace no activa un relay.** 

La puerta de enlace permite enviar tráfico a otras redes; el relay retransmite específicamente los mensajes DHCP. Un router puede desempeñar ambas funciones, pero deben configurarse por separado.
:::

Gracias a este mecanismo, podemos **centralizar DHCP para varias subredes** sin instalar un servidor en cada aula.

[Referencia: IBM, agentes de retransmisión y routers](https://www.ibm.com/docs/en/i/7.4.0?topic=concepts-relay-agents-routers).

## 3.7. Alta disponibilidad: ¿qué pasa si falla el servidor?

Un servidor DHCP puede dejar de funcionar por una avería, un problema de software o una tarea de mantenimiento. Para comprender las consecuencias, debemos recordar que **los clientes no necesitan consultar continuamente al servidor para utilizar su dirección IP**.

### ¿Qué ocurre si se detiene el servidor?

Imagina que los equipos del aula reciben a las 08:00 una concesión de ocho horas y que el servidor DHCP se detiene a las 10:00.

| Situación del cliente | ¿Qué ocurre? |
| --- | --- |
| **Tiene una concesión válida** | Puede seguir utilizando su dirección mientras la concesión sea válida y el resto de la red funcione. |
| **Necesita una nueva concesión** | No podrá obtenerla del servidor detenido. |
| **Llega el momento de renovar** | Intentará renovar, pero necesitará que responda un servidor capaz de atender su concesión. |
| **La concesión caduca sin renovarse** | Deberá dejar de utilizar la dirección concedida. |

Por tanto, la caída del servidor puede pasar desapercibida al principio para algunos usuarios, mientras que otros tendrán problemas inmediatamente.

::: tip
A las 10:05, un alumno que ya estaba trabajando puede seguir accediendo a los recursos de la red. Sin embargo, un compañero que conecta por primera vez su portátil no consigue obtener configuración. Ambos están en la misma aula, pero su situación respecto a DHCP es diferente.
:::

### ¿Qué es la alta disponibilidad?

La **alta disponibilidad** busca mantener un servicio accesible y reducir sus interrupciones. En DHCP, una forma de conseguirla consiste en disponer de **servidores coordinados**, de modo que uno pueda continuar atendiendo a los clientes cuando otro deja de estar disponible.

No se trata únicamente de tener otro servidor encendido. Los servidores necesitan compartir información sobre las concesiones y aplicar reglas que eviten asignaciones incompatibles.

La **conmutación por error**, o *failover*, es el mecanismo que permite que otro servidor asuma la atención del servicio cuando se produce un fallo.

### Dos modos básicos de funcionamiento

| Modo | Funcionamiento habitual | Ante un fallo |
| --- | --- | --- |
| **Reparto de carga** | Ambos servidores atienden clientes y se distribuyen el trabajo. | El servidor disponible puede asumir la atención que correspondía al otro, según las reglas del mecanismo. |
| **Servidor en espera** (*hot-standby*) | Un servidor atiende normalmente a los clientes y otro se mantiene preparado para sustituirlo. | El servidor en espera puede asumir la atención cuando se determina que el principal no está disponible. |

La sustitución no tiene por qué ser inmediata: depende de los tiempos de detección y de las condiciones configuradas para asumir el servicio.

### Ejemplos en Windows Server y Kea

En **Windows Server**, el failover de DHCPv4 establece una relación entre **dos servidores** que comparten información de concesiones. Admite tanto reparto de carga como funcionamiento con un servidor en espera.

Debemos distinguir la sincronización de concesiones de los cambios de configuración: si modificamos posteriormente la configuración de un ámbito con failover, debemos **replicar explícitamente esos cambios al servidor compañero**.

[Referencia: Microsoft, DHCP failover](https://learn.microsoft.com/en-us/windows-server/networking/technologies/dhcp/dhcp-failover).

**Kea** dispone de una extensión de alta disponibilidad. En el modo *hot-standby*, el servidor principal atiende las solicitudes y comunica las concesiones al servidor en espera. Este puede asumir la atención cuando detecta que el principal no está disponible, según las condiciones configuradas.

[Referencia: Kea, alta disponibilidad](https://kea.readthedocs.io/en/stable/arm/hooks.html#high-availability-library).

### ¿Por qué es necesaria la coordinación?

Supongamos que instalamos dos servidores independientes y configuramos en ambos el rango `192.168.10.100–192.168.10.199`. Si no comparten información ni tienen reglas que separen sus asignaciones, los dos podrían considerar disponible la misma dirección y concedérsela a clientes diferentes.

::: aviso
**Duplicar servidores con el mismo rango no crea automáticamente alta disponibilidad.** 

Sin coordinación, podemos provocar precisamente el problema que queremos evitar: interrupciones y conflictos de direcciones.
:::

Además, los clientes deben poder comunicarse con el servidor que siga disponible. Si ambos servidores dependen de un único switch y este falla, disponer de dos servidores no resolverá la interrupción. Lo mismo ocurre si los clientes necesitan un relay y ese relay deja de funcionar.

::: nota
**La alta disponibilidad de DHCP protege frente a determinados fallos del servicio, no frente a cualquier fallo de la red.** Su eficacia depende tanto de la coordinación de los servidores como de las comunicaciones necesarias para llegar a ellos.
:::

La idea fundamental es comprender **qué ocurre cuando falla el servidor, cómo otro puede sustituirlo y por qué necesitan coordinarse**. La configuración de los tiempos de detección, la sincronización y la recuperación se abordará en las prácticas de cada producto.

## 3.8. Errores y problemas que conviene reconocer

Cuando un equipo tiene problemas de conexión, no debemos dar por hecho que DHCP es la causa. Conviene **identificar el síntoma y comprobar qué parte del proceso está fallando**: la obtención de configuración, la comunicación con otras redes o la resolución de nombres.

### Síntomas y posibles causas

| Síntoma | Posibles causas que investigar | Primera comprobación |
| --- | --- | --- |
| **Un equipo nuevo no obtiene una concesión** | Rango agotado, servicio detenido o peticiones que no llegan al servidor. | Comprobar si quedan direcciones disponibles y si el servidor recibe solicitudes. |
| **Solo falla un aula** | Error en la configuración de su subred, VLAN o relay. | Comparar la configuración del aula afectada con la planificación de la red. |
| **Hay dirección IP, pero no acceso a otras redes** | Puerta de enlace incorrecta o problema de encaminamiento. | Revisar la dirección, la máscara y la puerta de enlace del cliente. |
| **Se accede a un recurso por su dirección IP, pero no por su nombre** | Error en la configuración o el funcionamiento del DNS. | Comprobar qué servidor DNS utiliza el cliente y si responde a las consultas. |
| **El cliente recibe parámetros inesperados** | Opciones incorrectas en el servidor previsto u otro servidor DHCP que está respondiendo. | Identificar qué servidor ha proporcionado la concesión y revisar sus opciones. |

Estas situaciones ofrecen **pistas, no diagnósticos definitivos**. Un mismo síntoma puede tener varias causas.

### ¿Qué información debemos revisar?

Para investigar el problema, podemos consultar:

- **La configuración del cliente:** dirección IP, máscara, puerta de enlace, servidores DNS y datos de la concesión.
- **La configuración del servidor:** subredes, rangos, exclusiones, reservas y opciones.
- **Las concesiones registradas:** qué direcciones están asignadas y cuántas quedan disponibles.
- **Los registros del servicio:** solicitudes recibidas, asignaciones realizadas y errores.
- **El tráfico de red:** mensajes DHCP intercambiados entre cliente, servidor y relay.

::: tip
Si una captura muestra varios `DHCPDISCOVER` sin ninguna oferta, sabemos que el cliente está intentando encontrar un servidor. Sin embargo, todavía debemos averiguar si las peticiones llegan al servidor, si este puede atenderlas y si sus respuestas regresan al cliente.
:::

### Servidores DHCP no autorizados

Un **servidor DHCP no autorizado** es un servicio que responde a los clientes sin formar parte de la configuración prevista por el administrador.

Puede aparecer por un error, como conectar un router con DHCP activado a la red del aula, o por una acción malintencionada. Sus respuestas pueden proporcionar una puerta de enlace, un servidor DNS o una dirección que no corresponden a la red.

::: aviso
**Recibir una respuesta DHCP no garantiza que proceda del servidor previsto.** 

Si aparecen parámetros inesperados, debemos comprobar quién ha enviado la oferta y la confirmación, además de revisar sus valores.
:::

### Agotamiento del rango

Un rango puede agotarse porque se conectan más dispositivos de los previstos o porque siguen vigentes concesiones de equipos que ya se han marchado.

También puede producirse un **agotamiento provocado**, mediante solicitudes abusivas que consumen las direcciones disponibles. Esto puede impedir que los clientes legítimos obtengan nuevas concesiones.

Por eso, administrar DHCP también implica **vigilar la ocupación de los rangos, investigar aumentos anómalos de solicitudes y controlar qué servidores pueden responder en la red**.

::: nota
**Un rango agotado no demuestra por sí solo que exista un ataque.** Antes de concluirlo, debemos revisar su tamaño, la duración de las concesiones y el número de dispositivos que utilizan la red.
:::

# 4. Ejemplos de aplicaciones del protocolo

Hasta ahora hemos estudiado las reglas de funcionamiento de DHCP. Para ofrecer este servicio en una red, necesitamos un programa que las implemente.

**DHCP es el protocolo; Windows Server DHCP y Kea son implementaciones.** Ambos permiten proporcionar configuración a los clientes, aunque utilizan herramientas y formatos de administración diferentes.

El sistema operativo del cliente no tiene que coincidir con el del servidor. Por ejemplo, un equipo Linux puede recibir configuración de Windows Server DHCP y un equipo Windows puede obtenerla de Kea.

::: nota
El cliente y el servidor pueden comunicarse porque utilizan un protocolo común. Lo que cambia entre productos es cómo administramos el servicio y qué funciones adicionales ofrece cada uno.
:::

## 4.1. DHCP en Windows Server

Windows Server permite instalar DHCP como un **rol de servidor**, es decir, una función que añadimos al sistema para que proporcione ese servicio.

Su administración puede realizarse mediante herramientas gráficas o **PowerShell**. Desde ellas podemos definir ámbitos, configurar opciones y reservas, y consultar las concesiones realizadas.

### Aplicación al aula

Para configurar nuestra red, tendríamos que:

1. **Crear un ámbito** asociado a la subred `192.168.10.0/24`.
2. **Definir el rango dinámico**, de `192.168.10.100` a `192.168.10.199`, y organizar las exclusiones y reservas de acuerdo con las reglas del producto.
3. **Establecer las opciones**, como la puerta de enlace `192.168.10.1` y el servidor DNS `192.168.10.2`.
4. **Configurar la duración de las concesiones**, por ejemplo, ocho horas.
5. **Comprobar el resultado** conectando un cliente y revisando su configuración y la concesión registrada en el servidor.

La interfaz de administración facilita estas tareas, pero debemos comprender qué representa cada ajuste. Un rango incorrecto o una puerta de enlace equivocada siguen provocando problemas aunque se hayan introducido mediante un asistente.

[Referencia: Microsoft, servidor DHCP](https://learn.microsoft.com/en-us/windows-server/networking/technologies/dhcp/dhcp-top).

## 4.2. Kea DHCP

**Kea**, desarrollado por **ISC**, permite proporcionar el servicio DHCP. En nuestras prácticas utilizaremos su servidor **DHCPv4** para trasladar los conceptos del tema a una configuración real.

Kea utiliza configuración en formato **JSON**, donde los parámetros se organizan mediante nombres y valores. En lugar de completar los campos de un asistente, identificaremos qué parte de la configuración define cada aspecto del servicio.

### Elementos que reconoceremos

| Elemento de Kea | ¿Qué representa? | Relación con el ejemplo del aula |
| --- | --- | --- |
| `interfaces-config` | Las interfaces de red donde atenderá el servicio. | La interfaz conectada a la red correspondiente. |
| `subnet4` | Las subredes IPv4 gestionadas. | `192.168.10.0/24`. |
| `pools` | Los rangos para asignación dinámica. | De `192.168.10.100` a `192.168.10.199`. |
| `option-data` | Las opciones entregadas a los clientes. | Puerta de enlace y servidores DNS. |
| `reservations` | La configuración específica de clientes identificados. | La dirección reservada para la impresora. |
| `valid-lifetime` | La duración de las concesiones, expresada en segundos. | `28800`, equivalente a ocho horas. |

No necesitamos memorizar todavía la estructura completa del archivo. Lo importante es **relacionar cada elemento con una decisión de administración**: qué red atender, qué direcciones repartir y qué parámetros proporcionar.

::: aviso
**La configuración y las concesiones son informaciones diferentes.** 

Definir un rango en el archivo de configuración no indica qué direcciones están ocupadas. Para conocer las asignaciones realizadas, debemos consultar las concesiones que mantiene el servicio.
:::

La instalación, la estructura completa del archivo y las comprobaciones del servicio se trabajarán en la práctica.

[Referencia: manual de Kea, servidor DHCPv4](https://kea.readthedocs.io/en/stable/arm/dhcp4-srv.html).

## 4.3. DHCP en un router doméstico

En una vivienda, el router suele incorporar un **servidor DHCP** que proporciona configuración a ordenadores, móviles y otros dispositivos.

Aunque se encuentre dentro del mismo aparato, es una función distinta del encaminamiento:

- **El servicio DHCP** entrega direcciones y parámetros de red.
- **La función de router** permite comunicar la red local con otras redes.

Por eso, un dispositivo puede recibir configuración del router y no tener acceso a Internet si falla la conexión exterior.

::: tip
Un mismo aparato puede desempeñar varias funciones. Que el router doméstico proporcione también DHCP no significa que ambos servicios sean lo mismo ni que tengan que ejecutarse siempre en el mismo equipo.
:::

## 4.4. El mismo protocolo, distintas formas de administrarlo

| Implementación | ¿Dónde se ofrece el servicio? | Forma de administración que estudiaremos |
| --- | --- | --- |
| **Windows Server DHCP** | En un sistema Windows Server con el rol instalado. | Herramientas gráficas y PowerShell. |
| **Kea DHCP** | En el sistema donde instalemos y ejecutemos el servicio. | Configuración JSON y herramientas de administración. |
| **DHCP de un router doméstico** | Integrado en el propio router. | Habitualmente, su interfaz de configuración. |

En todos los casos debemos responder a las mismas preguntas:

- **¿Qué subredes vamos a atender?**
- **¿Qué direcciones podemos asignar y cuáles debemos mantener fuera del reparto dinámico?**
- **¿Qué clientes necesitan una reserva?**
- **¿Cuánto durarán las concesiones?**
- **¿Qué opciones deben recibir los equipos?**

Comprender estas decisiones permite aplicar lo aprendido aunque cambie la herramienta.

::: tip
Para comprobar que has entendido el tema, explica estas situaciones:

1. Un portátil nuevo se conecta al aula: ¿qué mensajes intercambia para obtener configuración?
2. Una impresora debe mantener una dirección conocida: ¿cómo utilizarías una reserva?
3. El servidor DHCP se detiene: ¿qué diferencia hay entre un equipo con concesión válida y otro que necesita una nueva?
4. Se abre un aula en otra subred: ¿para qué serviría un relay?

Justifica las respuestas utilizando los conceptos estudiados.
:::

---

**Fuentes y referencias:** material elaborado a partir de documentación de Fortinet, IBM, Microsoft, la IETF e ISC/Kea. Las referencias de cada apartado permiten consultar las especificaciones y ampliar la información.

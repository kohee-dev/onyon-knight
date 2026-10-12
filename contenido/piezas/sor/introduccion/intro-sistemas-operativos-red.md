---
titulo: "Introducción a los sistemas operativos en red"
---

Este es tu material de estudio del bloque. Está escrito para que lo puedas leer con calma y entender no solo *qué* es cada cosa, sino *por qué* existe. Lo que veas aquí es la base de todo el módulo: más adelante vas a construir un dominio de Windows, gestionar usuarios en Linux, montar un servidor de archivos y hacer que los dos mundos convivan. Si entiendes bien estas ideas, todo lo demás encaja mucho más fácil.

# Qué vas a aprender

Al terminar el bloque deberías ser capaz de:

- Explicar con tus palabras qué hace distinto a un sistema operativo de red frente a uno de escritorio.
- Decidir entre cliente-servidor y punto a punto, y entre grupo de trabajo y dominio, y saber defender tu elección.
- Reconocer los servicios típicos de un servidor y los puertos de los más comunes.
- Comparar Windows Server y Ubuntu Server: licencias, forma de administrarlos y para qué se usa cada uno.
- Entender por qué las organizaciones centralizan las cuentas de usuario.
- Montar tu propia red virtual de laboratorio y encontrar el fallo cuando algo no conecta.

:::nota
Cosas como DNS, DHCP, el servidor web o el correo se estudian a fondo en SER. Aquí solo aparecen para que sepas que existen y qué papel tienen dentro de una red. No hace falta que los domines todavía.
:::

# 1. Qué es un sistema operativo de red

Cuando usas tu ordenador en casa, el sistema operativo se ocupa de lo que tienes delante: abrir programas, guardar tus archivos, conectarte a internet. Todo gira alrededor de ti y de tu equipo.

Un **sistema operativo de red** hace eso mismo, pero además tiene otro trabajo: **dar servicio a otros equipos**. Mientras tú estás trabajando en tu ordenador, hay un servidor atendiendo a decenas o cientos de equipos a la vez. Les dice quién es cada usuario, les entrega los archivos que piden, les deja imprimir, les resuelve los nombres de las páginas, y todo ello sin que la gente se entere de que está ahí.

Hoy cualquier sistema operativo sabe comunicarse por red, así que la frontera no es tan clara como parece. Lo que distingue a uno de servidor es sobre todo para qué está pensado y qué trae incluido.

| | SO de escritorio | SO de servidor |
| --- | --- | --- |
| Pensado para | Una persona trabajando en su equipo | Atender a muchos equipos y usuarios a la vez |
| Qué se espera de él | Que sea cómodo y vistoso | Que sea estable, seguro y que no se caiga |
| Disponibilidad | Se apaga por la noche y no pasa nada | Tiene que estar encendido casi siempre: si falla, falla para todos |
| Cómo se administra | Sentado delante del equipo | A distancia, por consola o con scripts |
| Ejemplos | Windows 11, Ubuntu Desktop | Windows Server, Ubuntu Server |

Esto es lo que suele hacer un sistema operativo de red:

- **Gestionar usuarios y permisos.** Sabe quién es cada persona y qué puede hacer: quién puede leer una carpeta, quién puede modificarla y quién ni siquiera debería verla.
- **Compartir recursos.** Carpetas, archivos e impresoras que están en un sitio y se usan desde muchos equipos.
- **Ofrecer servicios de red.** Cosas que los demás equipos necesitan para funcionar: nombres, direcciones, páginas web, correo.
- **Cuidar la seguridad.** Comprobar quién entra, aplicar permisos, filtrar el tráfico con un cortafuegos y guardar un registro de lo que pasa.
- **Facilitar la administración.** Poder gestionar el servidor desde lejos, programar tareas, vigilar su estado y hacer copias de seguridad.

:::nota
"Servidor" no es un tipo de ordenador: es un **papel** que cumple un equipo. Un servidor puede ser un portátil viejo en un armario o una máquina enorme en un centro de datos. Lo que cambia es el hardware que se elige cuando se espera que no falle: más memoria, discos redundantes, fuentes de alimentación dobles.
:::

:::nota[En resumen]
Un SO de red ofrece servicios a otros equipos. Lo que lo distingue del de escritorio es su papel (atender a muchos), su necesidad de estar siempre disponible y que se administra a distancia.
:::

# 2. Modelos de red

## Cliente-servidor y punto a punto

Hay dos formas básicas de organizar los equipos de una red.

En el modelo [cliente-servidor](https://es.wikipedia.org/wiki/Cliente-servidor) hay equipos que ofrecen servicios (los servidores) y otros que los usan (los clientes). Es como un restaurante: los clientes piden y la cocina prepara. Los clientes no necesitan saber cómo funciona la cocina, solo saber a quién pedir.

En el modelo [punto a punto](https://es.wikipedia.org/wiki/Peer-to-peer) (*peer-to-peer*, o P2P) no hay jerarquía: cada equipo es a la vez cliente y servidor de los demás. Es más parecido a un grupo de amigos que se prestan cosas entre sí, sin nadie al mando.

| | Cliente-servidor | Punto a punto |
| --- | --- | --- |
| Quién administra | Todo desde un punto central | Cada equipo se administra por separado |
| Seguridad | Los permisos se definen en un único sitio | Cada equipo define los suyos, y es fácil que se descuiden |
| Cuando la red crece | Aguanta bien | Se vuelve ingobernable a partir de pocos equipos |
| Coste | Más alto: servidor, licencias y alguien que lo cuide | Muy bajo |
| Qué pasa si algo falla | Si cae el servidor, caen los servicios (a menos que haya redundancia) | Cada equipo sigue funcionando por su cuenta |
| Dónde se usa | Empresas, centros educativos | Casas, oficinas muy pequeñas, intercambio de ficheros |

Piensa en una oficina de cuatro personas que comparten una impresora y unas carpetas: montar un servidor sería exagerado. Ahora piensa en un instituto con cientos de alumnos y profesores que entran con su usuario desde cualquier aula: ahí es imprescindible.

## Grupo de trabajo y dominio

En el mundo Windows este mismo contraste tiene otros nombres.

En un **grupo de trabajo** (*workgroup*) cada equipo guarda sus propias cuentas. Si quieres entrar en el ordenador de tu compañero, necesitas que alguien cree una cuenta para ti *en ese equipo*. Con diez equipos, ya es un lío.

En un **dominio** las cuentas viven todas en un servidor central, y los equipos del dominio confían en él. Tienes una sola cuenta, y con ella puedes entrar en cualquier equipo que pertenezca al dominio. Esto es lo que vas a construir tú en el bloque 2, usando [Active Directory](https://es.wikipedia.org/wiki/Active_Directory).

:::aviso
Un error muy común es pensar que "servidor" y "cliente" son máquinas distintas. No lo son: son papeles. Un mismo equipo puede ser cliente de un servicio y, al mismo tiempo, servidor de otro. Por ejemplo, un servidor de archivos suele actuar como cliente cuando pregunta a otro equipo quién es un usuario.
:::

:::nota[En resumen]
Cliente-servidor centraliza, escala bien y se controla mejor, pero cuesta más. Punto a punto es sencillo y barato, pero solo sirve para redes muy pequeñas. En Windows, lo primero equivale a un dominio y lo segundo a un grupo de trabajo.
:::

# 3. Roles y servicios típicos de un servidor

Un servidor rara vez hace una sola cosa. Normalmente reúne varios **roles**, y cada rol es un servicio que ofrece a los demás: guardar archivos, gestionar las cuentas, resolver nombres, publicar una web...

La tabla siguiente es un mapa de lo que te vas a ir encontrando a lo largo del módulo y de la carrera. No tienes que memorizarla entera hoy, pero sí te conviene ir reconociendo qué hace cada servicio y en qué puerto suele escuchar. Un **puerto** es como el número de una ventanilla: la dirección IP te lleva al edificio y el puerto te dice a qué ventanilla ir.

| Servicio | Para qué sirve | Puerto habitual | En Windows Server | En Ubuntu Server | Dónde lo verás |
| --- | --- | --- | --- | --- | --- |
| Directorio | Guarda cuentas, grupos y políticas de forma centralizada | 389 (LDAP), 636 (LDAPS), 88 (Kerberos) | Active Directory | OpenLDAP, SSSD | Bloques 2, 4 y 6 |
| [DNS](https://es.wikipedia.org/wiki/Sistema_de_nombres_de_dominio) | Traduce nombres en direcciones IP | 53 | Rol Servidor DNS | BIND 9 | SER |
| [DHCP](https://es.wikipedia.org/wiki/Protocolo_de_configuraci%C3%B3n_din%C3%A1mica_de_host) | Reparte direcciones IP automáticamente | 67 y 68 | Rol Servidor DHCP | Kea | SER |
| [Servidor web](https://es.wikipedia.org/wiki/Servidor_web) | Publica páginas y aplicaciones | 80 y 443 | IIS | Apache, Nginx | SER |
| Correo | Envía y recibe mensajes de correo | 25, 143, 993 | Exchange (de pago) | Postfix, Dovecot | SER |
| Archivos (SMB) | Comparte carpetas con clientes Windows | 445 | Servicios de archivos | Samba | Bloques 5 y 6 |
| Archivos (NFS) | Comparte carpetas entre sistemas Linux | 2049 | Cliente NFS (opcional) | nfs-kernel-server | Bloque 5 |
| Impresión | Colas e impresoras compartidas | 631 (IPP) | Servicios de impresión | CUPS | Solo se cita |
| Acceso remoto | Administrar el servidor sin estar delante | 3389 (RDP), 22 (SSH) | Escritorio remoto, PowerShell remoto | [SSH](https://es.wikipedia.org/wiki/Secure_Shell) | Bloques 2 y 3 |

En este módulo vas a trabajar sobre todo con tres cosas: el **directorio**, los **archivos compartidos** y el **acceso remoto**. El resto lo encontrarás en SER.

:::tip
Los puertos de la tabla son los habituales, pero se pueden cambiar. Lo importante es reconocer a qué servicio pertenece cada uno cuando lo veas en un cortafuegos o en un registro del sistema. Con el tiempo, el 22, el 80, el 443 o el 3389 te van a sonar solos.
:::

:::nota[En resumen]
Un servidor puede ofrecer muchos servicios a la vez. Cada servicio escucha en un puerto, y en este módulo te centrarás en el directorio, los archivos compartidos y el acceso remoto.
:::

# 4. Familias de sistemas operativos de red

Hay muchos sistemas operativos de servidor, pero en el día a día de una empresa se acaba hablando casi siempre de dos grandes familias: **Windows Server** y **Linux**. Los vas a usar los dos en este módulo, así que conviene entender qué ofrece cada uno.

## Windows Server

[Windows Server](https://es.wikipedia.org/wiki/Windows_Server) es el sistema operativo de servidor de Microsoft. Su licencia es **propietaria**: pagas por usarlo y no puedes modificarlo ni redistribuirlo.

Lo más importante que debes saber de él:

- **Se licencia de una forma peculiar.** Se paga por los núcleos del servidor y, además, por cada usuario o dispositivo que se conecta, lo que se llama CAL (*Client Access License*). Por eso el coste crece con el tamaño de la organización.
- **Tiene varias ediciones.** Las principales son Standard y Datacenter, que se diferencian sobre todo en cuántas máquinas virtuales permiten y en algunas funciones avanzadas.
- **Se puede instalar de dos maneras.** Con interfaz gráfica (*Desktop Experience*), como un Windows de escritorio, o sin ella (*Server Core*), que se maneja solo por comandos. La segunda gasta menos recursos y expone menos superficie a ataques.
- **Se administra con herramientas gráficas y con [PowerShell](https://es.wikipedia.org/wiki/PowerShell).** Hace años se hacía casi todo con el ratón; hoy se espera que sepas automatizar con scripts.
- **Su punto fuerte es el directorio.** Active Directory viene incluido y está muy integrado con todo el ecosistema Microsoft, desde los equipos de los usuarios hasta el correo y las aplicaciones.

## Linux y Ubuntu Server

[Linux](https://es.wikipedia.org/wiki/Linux) es un núcleo libre, y las [distribuciones](https://es.wikipedia.org/wiki/Distribuci%C3%B3n_Linux) lo empaquetan junto con el resto de programas para formar un sistema completo. [Ubuntu Server](https://es.wikipedia.org/wiki/Ubuntu) es una de las distribuciones más usadas en servidores.

Lo más importante que debes saber:

- **Es software libre.** Normalmente se distribuye bajo la [GPL](https://es.wikipedia.org/wiki/GNU_General_Public_License), una licencia que te permite usarlo, estudiarlo, modificarlo y compartirlo sin pagar por usarlo. Ojo: libre no significa que no se pueda cobrar por el soporte, solo que la licencia en sí no cuesta nada.
- **Tiene versiones de soporte largo (LTS).** Se publican cada dos años y reciben cinco años de soporte estándar. Son las que se usan en producción, porque nadie quiere reinstalar un servidor cada seis meses.
- **Se administra sobre todo por línea de comandos.** Normalmente accedes por SSH desde otro equipo y actualizas con el gestor de paquetes `apt`. No es raro que el servidor no tenga ni pantalla instalada.
- **El soporte viene de la comunidad,** y también hay opciones comerciales de pago para las empresas que necesitan un contrato con garantías.
- **Hay muchas otras familias.** Debian, de la que Ubuntu desciende, y las derivadas de Red Hat (RHEL, Rocky Linux, AlmaLinux), muy habituales en entornos empresariales.

## Comparativa

| Criterio | Windows Server | Ubuntu Server |
| --- | --- | --- |
| Licencia | Propietaria | Libre |
| Coste | Núcleos + CAL | Sin coste de licencia (el soporte opcional sí cuesta) |
| Forma habitual de administrarlo | Herramientas gráficas y PowerShell | Consola y SSH |
| Directorio nativo | Active Directory | No tiene uno propio: usa LDAP, Samba o se integra con AD |
| Uso típico | Entornos Microsoft, aplicaciones .NET, SQL Server | Web, contenedores, servicios de infraestructura |
| Puesta en marcha | Más guiada | Más manual, pero más flexible |

¿Cómo se elige entre uno y otro? Depende de varias cosas: lo que cuesta en total (licencias, soporte y formación), lo que sabe hacer el equipo de administradores, qué software tiene que ejecutarse, con qué clientes tiene que convivir y cuánto soporte se necesita.

:::nota
No existe un sistema "mejor" que otro, sino el que encaja con cada necesidad. De hecho, en la mayoría de las organizaciones conviven los dos. Por eso el último bloque del módulo se dedica a hacer que se entiendan entre ellos.
:::

:::nota[En resumen]
Windows Server es propietario, se licencia por núcleos y CAL, y su punto fuerte es Active Directory. Ubuntu Server es libre, se administra por consola y SSH, y es muy flexible. Se elige según el coste, los conocimientos del equipo y el software que haga falta.
:::

# 5. Gestión centralizada de usuarios

Esta es la idea más importante del bloque, y la que da sentido a buena parte del módulo.

Imagina un instituto con 30 equipos y 100 usuarios, y que cada equipo guarda sus propias cuentas. Para que cada persona pueda entrar en cualquier equipo, habría que crearle una cuenta en los 30. Cada usuario tendría 30 contraseñas, y cada vez que alguien la cambiara habría que repetirlo en todos los equipos. Si alguien se marcha del centro, habría que acordarse de borrarlo de los 30. Es insostenible.

La solución es un **directorio**. Es una especie de agenda central del sistema: un servidor guarda todas las cuentas, los grupos y las políticas, y los equipos le delegan la tarea de comprobar quién es cada uno. Cuando alguien escribe su usuario y contraseña en cualquier equipo, ese equipo le pregunta al servidor si son correctos.

Para entenderlo bien, conviene distinguir dos ideas que se confunden mucho:

- **Autenticación:** comprobar *quién eres*. Es lo que ocurre cuando escribes tu usuario y contraseña, o usas una clave o un certificado.
- **Autorización:** decidir *qué puedes hacer* una vez que sabemos quién eres. Es lo que determina que puedas abrir esta carpeta, pero no aquella.

Tener un directorio trae muchas ventajas:

- Cada persona tiene **una sola cuenta**, válida en todos los equipos.
- Las altas y las bajas se hacen **en un único sitio**.
- Los permisos y las políticas se asignan a **grupos**, no persona a persona.
- Queda un **registro centralizado** de quién ha entrado, cuándo y desde dónde.

Pero también hay un riesgo. Si todo depende de un servidor, ese servidor pasa a ser **crítico**: si cae, nadie puede iniciar sesión. Por eso se protege con especial cuidado y, en entornos serios, se duplica.

Durante el módulo vas a trabajar con dos tecnologías de directorio:

- [Active Directory](https://es.wikipedia.org/wiki/Active_Directory) es el directorio de Microsoft y el protagonista del bloque 2.
- [LDAP](https://es.wikipedia.org/wiki/Lightweight_Directory_Access_Protocol) es el protocolo estándar para consultar un directorio. Es el protagonista del bloque 4 y también la base de la integración del bloque 6.

:::nota[En resumen]
Un directorio centraliza cuentas, grupos y políticas en un único servidor. Autenticar es comprobar quién eres y autorizar es decidir qué puedes hacer. Todo funciona mejor con un directorio, pero el servidor se convierte en un punto crítico.
:::

# 6. Virtualización como entorno de trabajo

Montar una red real con servidores, clientes y cables para aprender sería carísimo y poco práctico. La solución es la [virtualización](https://es.wikipedia.org/wiki/Virtualizaci%C3%B3n): ejecutar varios sistemas operativos a la vez en un solo equipo físico, cada uno dentro de una [máquina virtual](https://es.wikipedia.org/wiki/M%C3%A1quina_virtual) (o VM). Para cada sistema, la VM parece un ordenador de verdad, con su procesador, su memoria, su disco y su tarjeta de red.

El programa que lo hace posible se llama [hipervisor](https://es.wikipedia.org/wiki/Hipervisor), y hay de dos tipos:

| Tipo | Dónde funciona | Ejemplos | Para qué se usa |
| --- | --- | --- | --- |
| Tipo 1 | Directamente sobre el hardware, sin sistema operativo debajo | Hyper-V, KVM (en Proxmox), VMware ESXi, Xen | Servidores y centros de datos |
| Tipo 2 | Como un programa más dentro de un sistema operativo | [VirtualBox](https://es.wikipedia.org/wiki/VirtualBox), VMware Workstation, Parallels, QEMU | Laboratorios, aprendizaje y pruebas |

En este módulo vas a usar uno de tipo 2, porque te permite montar una red entera en tu portátil, equivocarte sin consecuencias y volver atrás cuando algo sale mal.

**Qué recursos tiene una VM.** Procesadores virtuales, memoria RAM, un disco virtual y una o varias tarjetas de red virtuales. Cuando enciendes la VM, esos recursos se reservan, así que la suma de todas las máquinas que tengas encendidas no puede superar lo que tiene tu equipo físico. Si tu portátil tiene 16 GB de RAM, no puedes encender tres máquinas con 8 GB cada una. El disco virtual puede ser de tamaño fijo o dinámico, que va creciendo según lo usas.

**Las instantáneas.** Una instantánea (*snapshot*) guarda el estado exacto de una VM en un momento determinado, para poder volver a él cuando quieras. Es la herramienta más útil del laboratorio: haz una antes de cada cambio importante y, si algo se rompe, vuelves en segundos en lugar de reinstalar.

## Modos de red de una máquina virtual

Esta es la parte que más cuesta al principio, pero es fundamental. Cuando creas una VM, tienes que decidir cómo se conecta a la red, y de eso depende quién la ve y a quién ve ella. Los nombres cambian según el hipervisor; los de esta tabla son los de VirtualBox.

| Modo | Salida a Internet | Entre VM | Con el equipo anfitrión | Desde la red real |
| --- | --- | --- | --- | --- |
| NAT | Sí | No | La VM llega a él; él a la VM solo con reenvío de puertos | No (salvo reenvío de puertos) |
| Red NAT | Sí | Sí | La VM llega a él; él a la VM solo con reenvío de puertos | No (salvo reenvío de puertos) |
| Red interna | No | Sí, dentro de la misma red | No | No |
| Solo anfitrión | No | Sí | Sí | No |
| Adaptador puente | Sí | Sí | Sí | Sí (la VM es un equipo más de la red) |

El **equipo anfitrión** es tu ordenador físico, el que ejecuta el hipervisor. Y el **reenvío de puertos** es una regla que permite que una conexión que llega a tu equipo en un puerto se redirija a una VM concreta.

:::tip
Para un laboratorio de dominio necesitas una red en la que las VM se vean entre sí y que además tenga salida a Internet, para instalar paquetes y actualizaciones. Ese es exactamente el modo **Red NAT**. El NAT simple no sirve, porque aísla a cada máquina de las demás.
:::

:::aviso
No clones una VM de Windows sin prepararla antes con `sysprep`. Un clon comparte el identificador de seguridad del original, y dos equipos con el mismo identificador dan problemas al unirse a un dominio que son muy difíciles de explicar. En Linux, un clon también duplica el nombre del equipo y algunos identificadores de la máquina, así que conviene cambiarlos.
:::

:::nota[En resumen]
Una VM es un equipo completo dentro de otro. Las instantáneas permiten volver atrás, y el modo de red decide quién ve a quién. Para el laboratorio, usa Red NAT.
:::

# 7. Conceptos de red mínimos

Para montar el laboratorio necesitas unos pocos conceptos de red. No vamos a profundizar, porque el funcionamiento de la red y de sus servicios lo verás en otros módulos, pero sí tienes que manejar estas ideas:

- **[Dirección IP](https://es.wikipedia.org/wiki/Direcci%C3%B3n_IP).** Es el identificador de un equipo dentro de una red, como su número de teléfono. En las redes privadas (las de casa, de un instituto o de tu laboratorio) se usan estos rangos: `10.0.0.0/8`, `172.16.0.0/12` y `192.168.0.0/16`. Verás muchísimo el último.
- **Máscara de red, o prefijo.** Indica qué parte de la dirección corresponde a la red y qué parte al equipo. En `192.168.50.10/24`, los 24 primeros bits son la red, y puede haber hasta 254 equipos en ella. Quien no comparta esos 24 bits no está en tu red.
- **[Puerta de enlace](https://es.wikipedia.org/wiki/Puerta_de_enlace) (*gateway*).** Es el equipo al que se manda todo el tráfico que tiene que salir de tu red local, normalmente el enrutador. Sin ella, tus equipos se ven entre sí, pero no salen a Internet.
- **Servidor DNS.** Es el equipo al que se pregunta por los nombres, para traducirlos en direcciones. Es el responsable de que escribas un nombre en el navegador y no tengas que saberte su IP. Cuando un equipo hace ping a una IP pero no abre un nombre, casi seguro que el problema es de DNS.
- **IP estática o dinámica.** Los servidores suelen tener una dirección fija, para que los demás siempre sepan dónde encontrarlos. Los clientes, en cambio, suelen recibir una dirección de un servidor DHCP. En tu laboratorio no vas a tener DHCP, así que configurarás todo a mano.
- **Nombre de equipo (*hostname*).** Es el nombre con el que se identifica cada máquina en la red. No puede repetirse, o empiezan los problemas.

## Comandos básicos de diagnóstico

Cuando algo no funciona, estos comandos son tu primera herramienta. Conviene que los tengas en la memoria, porque los vas a usar constantemente.

| Para… | Windows | Linux |
| --- | --- | --- |
| Ver la configuración de red | `ipconfig /all` | `ip a` |
| Comprobar si hay conexión con otro equipo | `ping` | `ping` |
| Preguntar por un nombre | `nslookup` | `nslookup`, `dig` |
| Ver el camino hasta un destino | `tracert` | `traceroute` |
| Ver la tabla de rutas | `route print` | `ip route` |
| Ver qué puertos están en uso | `netstat -an` | `ss -tuln` |

:::tip
Cuando algo no conecta, no empieces por lo más complicado. Comprueba **de dentro hacia fuera**: primero tu propia IP, después la puerta de enlace, luego una IP de Internet y, por último, un nombre. En cuanto falle un paso, ya sabes dónde está el problema, y no tienes que seguir mirando más lejos.
:::

:::nota[En resumen]
Para que un equipo funcione en red necesita IP, máscara, puerta de enlace y servidor DNS. Y cuando algo falla, se diagnostica de dentro hacia fuera.
:::

# Glosario

| Término | Significado |
| --- | --- |
| Servidor | Equipo (o software) que ofrece un servicio a otros |
| Cliente | Equipo (o software) que usa un servicio |
| Punto a punto | Red en la que todos los equipos son a la vez clientes y servidores |
| Grupo de trabajo | Conjunto de equipos Windows con cuentas independientes |
| Dominio | Conjunto de equipos que confían en un servidor central de cuentas |
| Directorio | Base de datos centralizada de cuentas, grupos y políticas |
| Autenticación | Comprobar la identidad de un usuario |
| Autorización | Decidir qué puede hacer un usuario identificado |
| Puerto | Número que identifica el servicio al que va dirigida una conexión |
| Hipervisor | Programa que crea y ejecuta máquinas virtuales |
| Instantánea | Copia del estado de una VM para poder volver a él |
| CAL | Licencia de acceso por usuario o dispositivo de Windows Server |
| LTS | Versión de soporte largo de Ubuntu |
| Puerta de enlace | Equipo que da salida al tráfico fuera de la red local |

# Comprueba lo que sabes

Contesta por tu cuenta y después comprueba tus respuestas en las soluciones, al final del tema.

:::ejercicio[Preguntas]
1. ¿Qué diferencia a un SO de red de uno de escritorio?
2. Una oficina de 4 personas comparte una impresora y unos documentos. ¿Qué modelo elegirías y por qué?
3. ¿En qué se parecen y en qué se diferencian un grupo de trabajo y un dominio?
4. ¿Qué servicio corresponde a los puertos 445, 3389 y 22?
5. Una empresa usa SQL Server y aplicaciones .NET. ¿Qué sistema operativo de servidor le encaja mejor y por qué?
6. ¿Qué problema resuelve un directorio?
7. ¿Qué diferencia hay entre autenticar y autorizar?
8. Necesitas una red de laboratorio en la que tus VM se vean entre sí y tengan Internet. ¿Qué modo de red eliges?
9. Un cliente no puede abrir `ejemplo.com` pero sí hace ping a `8.8.8.8`. ¿Dónde está el problema?
10. ¿Por qué no se debe clonar una VM de Windows sin `sysprep`?
:::

# Temas para la presentación

Las presentaciones del alumnado duran unos 8 a 10 minutos. Algunas ideas de tema:

- Familias de sistemas operativos de red: Debian y derivadas, Red Hat y derivadas, FreeBSD, Windows Server.
- Un servicio de los vistos en la tabla de la sección 3, salvo los que se estudian en SER (DNS, DHCP, servidor web y correo).
- Hipervisores: Hyper-V, KVM, VMware ESXi, VirtualBox y Proxmox.
- Licencias y ciclo de vida: cómo se licencia y se da soporte a Windows Server y a las distribuciones Linux.

# Soluciones

1. No es una diferencia técnica tajante, sino de papel: el SO de red atiende a muchos equipos y usuarios, debe estar disponible casi siempre, se administra a distancia e incluye servicios como directorio, archivos o nombres.
2. Punto a punto: son pocos equipos y no justifican el coste de un servidor. Si la oficina creciera, convendría pasar a cliente-servidor.
3. Los dos agrupan equipos Windows. En un grupo de trabajo cada equipo guarda sus cuentas; en un dominio las cuentas están en un servidor central y los equipos confían en él.
4. 445 es SMB (archivos compartidos con Windows, o Samba en Linux), 3389 es el escritorio remoto de Windows (RDP) y 22 es SSH.
5. Windows Server, porque el software que debe ejecutar es de su ecosistema y se integra de forma nativa. Aun así, hay que tener en cuenta el coste de las licencias (núcleos y CAL).
6. Evita crear y mantener una cuenta en cada equipo: las cuentas, los grupos y las políticas se definen en un único sitio y todos los equipos le delegan la autenticación.
7. Autenticar es comprobar quién eres; autorizar es decidir qué puedes hacer una vez identificado.
8. Red NAT. El modo NAT simple no permite que las VM se vean entre sí y la red interna no tiene salida a Internet.
9. En la resolución de nombres: la red funciona, así que lo más probable es un fallo del servidor DNS configurado en ese equipo.
10. Porque el clon comparte el identificador de seguridad del equipo original, y eso provoca fallos al unirlo a un dominio.

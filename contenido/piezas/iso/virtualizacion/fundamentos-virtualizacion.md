---
titulo: "Virtualización"
licencia: CC-BY-NC-SA-4.0
---

:::nota[Objetivo]
Comprender qué es la [virtualización](https://es.wikipedia.org/wiki/Virtualizaci%C3%B3n), cómo funciona un [hipervisor](https://es.wikipedia.org/wiki/Hipervisor), qué recursos se reparten entre las máquinas virtuales y qué diferencias hay entre una máquina virtual y un contenedor. Es la base del laboratorio con el que se trabajará el resto del módulo.
:::

## 1. Qué es la virtualización

Virtualizar es crear una versión **simulada** de un recurso físico (un ordenador completo, un disco, una red) que se comporta como el real pero funciona sobre otro recurso distinto. Lo habitual en este módulo es la **virtualización de hardware**: una [máquina virtual](https://es.wikipedia.org/wiki/M%C3%A1quina_virtual) (VM) es un «ordenador» completo, con su CPU, memoria, disco y red, que se ejecuta como un programa dentro de otro ordenador.

Se usan estos términos:

| Término | Significado |
|---|---|
| **Anfitrión** (*host*) | El equipo físico, con su sistema operativo (si lo tiene), sobre el que se ejecutan las máquinas virtuales |
| **Invitado** (*guest*) | La máquina virtual y el sistema operativo que corre en ella |
| **Hipervisor** | El software que crea las máquinas virtuales y reparte entre ellas los recursos del anfitrión |

El sistema operativo invitado cree que trabaja sobre hardware real. En realidad, el hipervisor le presenta un hardware **virtual** y traduce lo que hace a los recursos físicos.

Este cambio ha transformado la forma de trabajar con servidores. Hace unos años, cada servicio se alojaba en una máquina física, que a menudo albergaba varios servicios a la vez. Hoy lo normal es lo contrario: muchas máquinas virtuales sobre el mismo hardware, cada una con **un único servicio**, para limitar el alcance de un fallo.

:::pregunta[¿Qué es un hipervisor y qué le presenta a una máquina virtual?]
Es el software que crea las máquinas virtuales y reparte entre ellas los recursos del anfitrión. A cada una le presenta un hardware **virtual** (CPU, memoria, disco y red) y traduce lo que hace el sistema invitado a los recursos físicos, de modo que este cree que trabaja sobre hardware real.
:::

## 2. Por qué se virtualiza

- **Aprovechar mejor el hardware**: un servidor físico suele estar poco cargado. Varias máquinas virtuales comparten uno solo y reducen el número de equipos, el espacio y el consumo.
- **Aislamiento**: cada máquina es independiente. Un fallo o un ataque en una no afecta a las demás.
- **Flexibilidad**: se crea, copia o elimina una máquina en minutos, sin comprar ni instalar hardware. Los ordenadores se sustituyen por un conjunto (*pool*) de máquinas que se crean, clonan y destruyen a demanda.
- **Pruebas sin riesgo**: se puede probar un cambio, o un programa en el que no confiamos, y volver atrás.
- **Copias y recuperación más sencillas**: una máquina virtual es, en esencia, un conjunto de ficheros.
- **Migración sencilla**: una máquina se mueve de un equipo físico a otro copiando esos ficheros.
- **Compatibilidad**: permite mantener sistemas antiguos, usar programas que no existen para nuestro sistema habitual o ejecutar varios sistemas operativos en el mismo equipo.
- **Venta de capacidad**: los proveedores alquilan máquinas virtuales a otras empresas como servidores privados virtuales (*Virtual Private Servers*, VPS).

:::aviso[No es gratis]
Virtualizar añade una capa que consume recursos y todas las máquinas dependen del mismo equipo físico: si el anfitrión cae, caen todas las que aloja. Por eso los servidores de virtualización llevan redundancia en discos, memoria, red y fuente de alimentación.
:::

## 3. Tipos de virtualización

| Tipo | Qué se virtualiza | Ejemplo |
|---|---|---|
| **De hardware (de servidores)** | Un ordenador completo | Máquinas virtuales con VirtualBox, Hyper-V, KVM |
| **A nivel de sistema operativo** | Un entorno aislado que comparte el núcleo del anfitrión | [Contenedores](https://es.wikipedia.org/wiki/Virtualizaci%C3%B3n_a_nivel_de_sistema_operativo) (Docker) |
| **De escritorio** | El escritorio de un usuario, que se ejecuta en un servidor | Escritorios virtuales (VDI) |
| **De aplicaciones** | Una aplicación aislada, sin instalarla en el sistema | Aplicaciones empaquetadas |
| **De almacenamiento** | Varios discos presentados como uno solo | Sistemas de almacenamiento en red |
| **De red** | Redes lógicas sobre una red física | VLAN, redes virtuales de los hipervisores |

## 4. Hipervisores

### Tipo 1 y tipo 2

| | Tipo 1 (*bare metal*) | Tipo 2 (*alojado*) |
|---|---|---|
| Dónde se ejecuta | Directamente sobre el hardware | Como un programa dentro de un sistema operativo |
| Capas | Hardware → hipervisor → máquinas virtuales | Hardware → SO anfitrión → hipervisor → máquinas virtuales |
| Rendimiento | Mejor | Algo menor |
| Uso típico | Servidores y centros de datos | Equipos de escritorio, aprendizaje y pruebas |
| Ejemplos | VMware ESXi, [Xen](https://es.wikipedia.org/wiki/Xen), [Proxmox VE](https://en.wikipedia.org/wiki/Proxmox_Virtual_Environment) (con [KVM](https://es.wikipedia.org/wiki/Kernel-based_Virtual_Machine)), Hyper-V | [VirtualBox](https://es.wikipedia.org/wiki/VirtualBox), VMware Workstation |

:::nota[Los límites no están tan claros]
KVM está integrado en el núcleo de Linux, por lo que el propio Linux actúa como hipervisor de tipo 1. [Hyper-V](https://es.wikipedia.org/wiki/Hyper-V) también se instala como rol de Windows, pero en cuanto se activa, Windows pasa a ejecutarse **encima** del hipervisor, como una máquina más. Por eso se discute a qué tipo pertenecen. La distinción es útil como guía, no como regla estricta.
:::

### Cómo se consigue virtualizar

| Técnica | Idea | Resultado |
|---|---|---|
| **Emulación** | El software imita por completo el hardware, incluida la CPU, instrucción a instrucción | Muy flexible (permite otra arquitectura) pero lenta. Ejemplo: [QEMU](https://es.wikipedia.org/wiki/QEMU) emulando |
| **Virtualización completa** | Las instrucciones del invitado se ejecutan directamente en la CPU real, y el hipervisor solo interviene en las instrucciones delicadas | Rápida; el invitado no necesita modificarse |
| **Paravirtualización** | El invitado sabe que está virtualizado y coopera con el hipervisor mediante controladores especiales | Más eficiente en la E/S; requiere un invitado adaptado |
| **Asistida por hardware** | La propia CPU incorpora instrucciones para virtualizar | Es la base de los hipervisores modernos |

La asistencia por hardware se llama **[Intel VT-x](https://en.wikipedia.org/wiki/X86_virtualization)** en Intel y **AMD-V** en AMD. Suele venir desactivada de fábrica y hay que habilitarla en la BIOS o UEFI. Sin ella, la mayoría de los hipervisores no pueden ejecutar máquinas de 64 bits o van muy lentos.

:::pregunta[¿Qué diferencia hay entre un hipervisor de tipo 1 y uno de tipo 2? ¿Por qué no siempre está clara?]
El tipo 1 (*bare metal*) se ejecuta directamente sobre el hardware y es el habitual en servidores; el tipo 2 es un programa dentro de un sistema operativo anfitrión, con algo menos de rendimiento, y se usa en escritorio y pruebas. No siempre está clara porque KVM está integrado en el núcleo de Linux y Hyper-V, al activarse, coloca a Windows como una máquina más sobre el hipervisor, así que se discute a qué tipo pertenecen.
:::

:::pregunta[¿Para qué sirve la asistencia por hardware (VT-x / AMD-V) y por qué hay que comprobar que esté activada?]
Son instrucciones de la propia CPU para virtualizar, y son la base de los hipervisores modernos. Suele venir desactivada de fábrica y hay que habilitarla en la BIOS o UEFI; sin ella, la mayoría de los hipervisores no pueden ejecutar máquinas de 64 bits o van muy lentos.
:::

## 5. Recursos de una máquina virtual

Al crear una VM se decide qué parte de los recursos del anfitrión le corresponde.

| Recurso | Cómo se reparte | A tener en cuenta |
|---|---|---|
| **CPU** | Se asignan núcleos virtuales (vCPU) que el hipervisor planifica sobre los físicos | Asignar más vCPU de las necesarias puede empeorar el rendimiento |
| **Memoria** | Se reserva una cantidad de la RAM del anfitrión | La suma de las VM no debería superar la RAM física; si la supera, se usa el disco y todo se ralentiza |
| **Disco** | Un fichero del anfitrión que hace de disco duro | Ver el apartado siguiente |
| **Red** | Una o varias tarjetas virtuales conectadas a una red virtual | Ver el apartado de redes |
| **Otros** | Memoria de vídeo, USB, unidad óptica, tarjeta de sonido | El firmware virtual puede ser BIOS o UEFI |

Un ejemplo: si tu portátil tiene 16 GB de RAM, no puedes encender a la vez tres máquinas con 8 GB cada una. Y hay que dejar memoria libre para el propio anfitrión.

:::nota[Sobreasignación]
Algunos hipervisores permiten asignar entre todas las VM **más** recursos de los que existen realmente (por ejemplo, más vCPU que núcleos), confiando en que no todas los usen a la vez. Es práctico en servidores poco cargados, pero un error de cálculo degrada a todas las máquinas.
:::

:::pregunta[¿Qué pasa si se asigna a las máquinas virtuales más RAM de la que tiene el anfitrión?]
Se empieza a usar el disco como memoria y todo se ralentiza. Por eso la suma de la RAM de las VM no debería superar la física, y hay que dejar memoria libre para el propio anfitrión.
:::

## 6. Discos virtuales

El disco de una máquina virtual es un **fichero** en el anfitrión. El sistema invitado lo ve como un disco normal, con su tabla de particiones y su sistema de archivos.

### Formatos

| Formato | Origen |
|---|---|
| **VDI** | VirtualBox |
| **VMDK** | VMware (soportado también por otros) |
| **VHD / VHDX** | Microsoft (Hyper-V). VHDX es el más reciente y admite discos mayores |
| **qcow2** | QEMU y KVM. Admite compresión y *snapshots* |
| **raw** | Imagen en bruto, sin metadatos. Sencillo y rápido |

### Aprovisionamiento

| Tipo | Cómo se comporta |
|---|---|
| **De tamaño fijo** | Reserva todo el espacio en el anfitrión desde el principio. Algo más rápido, sin sorpresas |
| **De tamaño dinámico** (*thin provisioning*) | El fichero crece conforme el invitado escribe datos, hasta el máximo indicado. Ahorra espacio, pero si el anfitrión se queda sin disco, las VM se paran |

### Instantáneas y clones

- Una **instantánea** (*[snapshot](https://en.wikipedia.org/wiki/Snapshot_(computer_storage))*) guarda el estado de la máquina en un momento dado, para poder volver a él. Los cambios posteriores se almacenan en un fichero aparte (diferencial), no en el disco original. En el laboratorio es la herramienta más útil: haz una antes de cada cambio importante y, si algo se rompe, vuelves en segundos en lugar de reinstalar.
- Un **clon** es una copia de una máquina. Puede ser **completo** (una copia independiente) o **enlazado** (comparte el disco base con la original y solo guarda las diferencias; ocupa poco, pero depende de ella).
- Una **plantilla** es una máquina preparada que se usa como modelo para crear otras rápidamente.

:::aviso[Instantánea no es copia de seguridad]
Una instantánea depende del disco original: si este se pierde o se corrompe, la instantánea no sirve. Además, mantener muchas hace que la máquina vaya más lenta y que los ficheros crezcan sin control.
:::

:::pregunta[¿Qué ventaja e inconveniente tiene un disco de tamaño dinámico frente a uno de tamaño fijo?]
Ventaja: ahorra espacio, porque el fichero crece solo conforme el invitado escribe, hasta el máximo indicado. Inconveniente: es algo más lento que el fijo, y si el anfitrión se queda sin disco, las máquinas virtuales se paran.
:::

:::pregunta[¿Por qué una instantánea no es una copia de seguridad?]
Porque depende del disco original: los cambios posteriores se guardan en un fichero diferencial, y si el disco se pierde o se corrompe, la instantánea no sirve. Además, acumular muchas ralentiza la máquina y hace crecer los ficheros sin control.
:::

:::pregunta[¿Qué diferencia hay entre un clon completo y uno enlazado?]
El clon completo es una copia independiente. El enlazado comparte el disco base con la máquina original y solo guarda las diferencias: ocupa poco, pero depende de ella.
:::

## 7. Redes virtuales

Cada tarjeta de red virtual se conecta a una red virtual que el hipervisor gestiona. Los modos de conexión más habituales (con los nombres de VirtualBox) son:

| Modo | Qué hace | Visible desde el exterior | Las VM se ven entre sí |
|---|---|---|---|
| **[NAT](https://es.wikipedia.org/wiki/Traducci%C3%B3n_de_direcciones_de_red)** | La VM sale a Internet a través de la IP del anfitrión | No | No |
| **Adaptador puente** (*bridge*) | La VM se conecta a la red física como un equipo más, con su propia IP | Sí | Sí |
| **Red interna** | Red privada solo entre las VM que la comparten | No | Sí |
| **Red solo anfitrión** (*host-only*) | Red privada entre el anfitrión y las VM | Solo el anfitrión | Sí |
| **Red NAT** | NAT compartido por varias VM, que sí se ven entre sí | No | Sí |

La elección depende de lo que se quiera probar. Un laboratorio de servicios (DHCP, DNS, web) suele combinar una **red interna** para el tráfico entre máquinas y una salida por NAT para actualizar paquetes. El modo puente puede interferir con la red real, por ejemplo, si una VM con un servidor DHCP responde a otros equipos.

:::pregunta[¿Qué modo de red elegirías para un laboratorio con un servidor DHCP propio? ¿Por qué?]
Una red interna (o solo anfitrión), para que el tráfico quede entre las máquinas del laboratorio, con una salida por NAT si se necesita Internet. El modo puente se evita porque la VM con DHCP respondería a otros equipos de la red real e interferiría con ella.
:::

## 8. Herramientas del invitado

Los fabricantes ofrecen controladores y servicios que se instalan **dentro** del sistema invitado y mejoran su integración con el anfitrión: *VirtualBox Guest Additions*, *VMware Tools*, *Hyper-V Integration Services* o *QEMU Guest Agent*. Aportan:

- Controladores optimizados de vídeo, red y disco.
- Portapapeles y carpetas compartidas con el anfitrión.
- Ajuste automático de la resolución.
- Apagado ordenado y sincronización de la hora.

:::pregunta[¿Qué aportan las herramientas del invitado?]
Controladores optimizados de vídeo, red y disco, portapapeles y carpetas compartidas con el anfitrión, ajuste automático de la resolución, apagado ordenado y sincronización de la hora.
:::

## 9. Máquinas virtuales y contenedores

Los contenedores (*containers*) son el siguiente paso en la evolución de la virtualización. Su objetivo es **optimizar** el uso de los recursos del anfitrión: en lugar de que cada invitado ejecute un sistema operativo completo, todos comparten el núcleo del anfitrión.

| | Máquina virtual | Contenedor |
|---|---|---|
| Qué virtualiza | El hardware | El sistema operativo |
| Núcleo | Cada VM tiene el suyo | Comparten el del anfitrión |
| Tamaño | Gigabytes (un SO completo) | Megabytes (solo la aplicación y sus dependencias) |
| Arranque | Segundos o minutos | Instantáneo |
| Aislamiento | Muy fuerte | Menor, al compartir núcleo |
| Sistemas invitados | Cualquiera | El mismo núcleo que el anfitrión |
| Ejemplo | Windows Server sobre un anfitrión Linux | [Docker](https://es.wikipedia.org/wiki/Docker_(software)) |

Los contenedores de Linux se apoyan en dos funciones del núcleo: los **espacios de nombres** (*namespaces*), que aíslan lo que ve cada proceso (procesos, red, sistema de archivos), y los **[cgroups](https://es.wikipedia.org/wiki/Cgroups)**, que limitan los recursos que puede usar.

Como arrancan en segundos, los contenedores permiten infraestructuras muy dinámicas, gestionadas de forma automática con orquestadores como [Kubernetes](https://es.wikipedia.org/wiki/Kubernetes). Los más conocidos son Docker, LXC/LXD y los contenedores de Windows Server.

### Docker

Docker se ha impuesto como sistema de contenedores para aplicaciones:

- Nació para GNU/Linux. Hoy también funciona en Windows Server 2016 y posteriores.
- Sus contenedores rinden mejor que las máquinas virtuales.
- Permite crear redes virtuales privadas entre contenedores.
- El núcleo es Docker Engine, y existen herramientas para gestionar varios contenedores a la vez, como [Docker Compose](https://docs.docker.com/compose/).
- Hay que instalarlo antes en el sistema operativo, preferiblemente en una VM con Linux Server, donde ya viene en los repositorios por defecto.

:::nota[No compiten, se complementan]
Es muy frecuente ejecutar contenedores **dentro** de máquinas virtuales, combinando el aislamiento fuerte de las VM con la ligereza de los contenedores.
:::

:::pregunta[¿Qué comparten y qué no comparten los contenedores con el anfitrión? ¿Qué implica para la seguridad?]
Comparten el núcleo del anfitrión, mientras que cada uno tiene aislados sus procesos, su red y su sistema de archivos mediante espacios de nombres, con los recursos limitados por cgroups. Al compartir núcleo, el aislamiento es menor que el de una VM, por eso se suelen ejecutar contenedores dentro de máquinas virtuales.
:::

## 10. Funciones avanzadas

Estas funciones aparecen sobre todo en hipervisores de tipo 1 y en entornos con varios servidores:

- **[Migración en vivo](https://en.wikipedia.org/wiki/Live_migration)**: mover una VM encendida de un anfitrión a otro sin interrumpir el servicio.
- **Alta disponibilidad**: si un anfitrión cae, sus VM se reinician automáticamente en otro.
- **Almacenamiento compartido**: los discos de las VM residen en un almacenamiento al que acceden varios anfitriones, lo que hace posibles las dos funciones anteriores.
- **Exportación e importación**: un formato estándar como **[OVF/OVA](https://en.wikipedia.org/wiki/Open_Virtualization_Format)** permite mover una VM entre hipervisores distintos.

### Virtualización en la nube

Consiste en usar máquinas virtuales alojadas en los centros de datos de un proveedor, con las ventajas del *cloud computing*: se crean en minutos, se paga por uso y no hay que mantener el hardware. Los principales proveedores son Microsoft Azure, Amazon Web Services (AWS) y Google Cloud.

## 11. Productos habituales

| Producto | Tipo | Plataforma | Notas |
|---|---|---|---|
| VirtualBox | 2 | Windows, Linux, macOS | Gratuito. Muy usado en formación |
| VMware Workstation | 2 | Windows, Linux | Muy completo |
| Hyper-V | 1 | Windows (Server y Pro) | Integrado en Windows |
| KVM con QEMU | 1 | Linux | Integrado en el núcleo |
| Proxmox VE | 1 | Linux (Debian) | Gestión web de KVM y contenedores LXC |
| VMware ESXi | 1 | Propio | Muy extendido en empresas |
| Xen | 1 | Linux | Base de algunos servicios en la nube |

## 12. Seguridad y buenas prácticas

- Mantener **actualizado** el anfitrión y el hipervisor: una vulnerabilidad en ellos expone a todas las máquinas.
- Aislar las redes de prueba y no usar el modo puente sin necesidad.
- No dejar **instantáneas antiguas** acumuladas.
- Hacer **copia de seguridad** de los ficheros de las VM, no solo instantáneas.
- Asignar recursos con medida y vigilar el espacio del anfitrión.
- Tener en cuenta las **licencias**: el sistema operativo invitado también está sujeto a licencia, igual que si fuera físico.

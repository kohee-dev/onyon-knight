---
titulo: "Virtualización"
licencia: CC-BY-NC-SA-4.0
---

El funcionamiento de los servidores hoy día no tiene nada que ver con lo que sucedía hace unos pocos años. Se ha pasado de un alojamiento en máquinas reales, las cuales incluso albergaban varios servicios, a trabajar con máquinas simuladas que ofrecen únicamente un servicio. Estas técnicas reciben el nombre de *virtualización*. La virtualización de sistemas es una potente técnica de abstracción mediante la cual podemos crear una capa intermedia que se encarga de posibilitar la comunicación entre una máquina física (anfitrión o *host*) y el sistema o sistemas huésped (*guest*) virtuales.

:::aviso[Imagen pendiente]
Falta la imagen «maquina-virtual.png». Se añadirá con su licencia.
:::

Los dos tipos de hipervisor, el 1 (sobre el hardware) y el 2 (sobre un sistema operativo), ya los has visto en la tabla del apartado «Virtualización como entorno de trabajo».

### Ventajas

- Reducción de costes y mejor gestión de los recursos hardware. Cada máquina física puede usarse para varios propósitos a la vez, con los recursos adecuados.

- Sustitución de ordenadores por un fondo de MV (*pool*) que puedan ser creadas, clonadas y destruidas a demanda.

- Posibilidad de vender capacidad de cálculo a otras empresas (*Virtual Private Servers*).

- Simplificación de los sistemas de copia de seguridad. Entornos para aprendizaje y pruebas. Se simplifica el montaje y experimentación de otros sistemas operativos y software distinto al que usamos habitualmente. Ideal para estudiantes.

- Compatibilidad de programas. Posibilidad de usar programas que no ofrezcan versiones para nuestro sistema habitual.

- Entornos controlados. Se pueden probar programas en los que no confiamos.

- Fácil migración de unos ordenadores a otros.

### Inconvenientes

- Un único punto de fallo para todas las máquinas virtuales que se ejecuten en un único servidor físico. Para solucionarlo se deben utilizar servidores con un alto nivel de redundancia de discos, memoria, red, fuente de alimentación y demás componentes (algo bastante más fácil de conseguir si trabajamos en entornos virtualizados).

Actualmente se asocia un único servicio a cada servidor, con el fin de limitar el alcance de un hipotético fallo.

## Virtualización en la nube

Consiste en usar máquinas virtuales alojadas en sistemas remotos, con todas las ventajas del *cloud computing*: se crean en minutos, se paga por uso y no hay que mantener el hardware. Los principales proveedores son Azure, AWS y Google Cloud.

# Contenedores

Los contenedores (*containers*) son el siguiente paso en la evolución de la virtualización, y su objetivo principal es **optimizar** el uso de los recursos de la máquina anfitriona (*host*). Se pueden entender como una virtualización a nivel de sistema operativo: todos los contenedores comparten el núcleo del anfitrión, así que se evita la sobrecarga de que cada huésped ejecute un sistema operativo completo. Por eso arrancan en segundos y permiten diseñar infraestructuras más dinámicas, gestionadas de forma automática con herramientas como Kubernetes.

A cambio, tienen dos desventajas: cada contenedor debe usar el mismo tipo de sistema operativo que el anfitrión (contenedores Linux sobre un núcleo Linux) y su nivel de aislamiento es menor que el de una máquina virtual.

:::aviso[Imagen pendiente]
Falta la imagen «contenedores.png». Se añadirá con su licencia.
:::

:::aviso[Imagen pendiente]
Falta la imagen «contenedores_2.png». Se añadirá con su licencia.
:::

Ejemplos:

* Docker
* LXC/LXD
* Contenedores de Windows Server

## Docker

Se ha impuesto como sistema de virtualización de aplicaciones mediante contenedores, y en la web hay muchísimos tutoriales y cursos sobre él. Varios aspectos destacan:

* Inicialmente se creó para GNU/Linux. Actualmente también funciona en Windows Server 2016 y posteriores.

* Los contenedores ofrecen un mejor rendimiento que las MV.

* Pueden crearse redes virtuales privadas de contenedores.

* El núcleo es Docker Engine, y existen herramientas para gestionar varios contenedores a la vez, como [Docker Compose](https://docs.docker.com/compose/).

* Para poder usar Docker hay que instalarlo antes en el sistema operativo, preferiblemente en una MV con Linux Server, donde ya viene en los repositorios por defecto.

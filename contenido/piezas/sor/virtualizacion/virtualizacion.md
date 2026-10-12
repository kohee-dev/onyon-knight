---
titulo: "Virtualización"
licencia: CC-BY-NC-SA-4.0
---

El funcionamiento de los servidores hoy día no tiene nada que ver con lo que sucedía hace unos pocos años. Se ha pasado de un alojamiento en máquinas reales, las cuales incluso albergaban varios servicios, a trabajar con máquinas simuladas que ofrecen únicamente un servicio. Estas técnicas reciben el nombre de *Virtualización*. La virtualización de sistemas es una potente técnica de abstracción mediante la cual podemos crear una capa intermedia que se encarga de posibilitar la comunicación entre una máquina física (anfitrión o host) y el sistema o sistemas huésped (guest) virtuales.

:::aviso[Imagen pendiente]
Falta la imagen «maquina-virtual.png». Se añadirá con su licencia.
:::

### Ventajas

- Reducción de costes y mejor gestión de los recursos hardware. Cada máquina física puede usarse para varios propósitos a la vez, con los recursos adecuados.

- Sustitución de ordenadores por un fondo de MV (pool) que puedan ser creadas, clonadas y destruidas a demanda.

- Posibilidad de vender capacidad de cálculo a otras empresas (Virtual Private Servers).

- Simplificación de los sistemas de copia de seguridad. Entornos para aprendizaje y pruebas. Se simplifica el montaje y experimentación de otros sistemas operativos y software distinto al que usamos habitualmente. Ideal para estudiantes.

- Compatibilidad de programas. Posibilidad de usar programas que no ofrezcan versiones para nuestro sistema habitual.

- Entornos controlados. Se pueden probar programas en los que no confiamos,

- Fácil migración de unos ordenadores a otros.

### Inconvenientes

- Un único punto de fallo para todas las máquinas virtuales que se ejecuten en un único servidor físico. Para solucionarlo se deben utilizar servidores con un alto nivel de redundancia de discos, memoria, red, fuente de alimentación, y demás componentes (algo bastante más fácil de conseguir si trabajamos en entornos virtualizados)

Actualmente se asocia un único servicio a cada servidor, con el fin de limitar el alcance de un hipotético fallo.


## Herramientas

**TIPO 1:** Denominada **nativa o unhosted**, es software que se ejecuta directamente sobre el hardware, para ofrecer la funcionalidad. El hipervisor es un SO cuya única misión es gestionar conjuntos de clusters, Máq. Virtuales, unidades de almacenamiento, etc… 

:::aviso[Imagen pendiente]
Falta la imagen «v_nativa.png». Se añadirá con su licencia.
:::

Ejemplos

* Proxmox
* PowerVM (IBM)
* ESXi (VmWare)
* Xen
* OpenVZ

**TIPO 2:** denominada **hosted o paravirtualización**, es software que se ejecuta sobre un SO para ofrecer la funcionalidad(con la consiguiente penlización en rendimiento). 

:::aviso[Imagen pendiente]
Falta la imagen «v_hosted.png». Se añadirá con su licencia.
:::

Ejemplos

* Parallels (Windows/Mac/Linux)
* VMware (Windows / Linux)
* VirtualBox (Windows/Mac/Linux, Gratis)
* QEMU(Linux, Gratis)
* Windows Virtual PC (Windows, Gratis)

**CONTENEDORES:** Es una alternativa más de virtualización, que persigue mejorar el rendimiento y permitiendo el diseño de infraestructuras de trabajo más dinámicas. Posibilidad de aplicaciones de gestión automática (Kubernetes..)

:::aviso[Imagen pendiente]
Falta la imagen «contenedores.png». Se añadirá con su licencia.
:::

Ejemplos

* Docker
* LXC/LXD
* Windows servers containers

**CLOUD virtualization**: Virtualización en sistemas remotos, con todas la ventajas del cloud computing (Azure, AWS, GoogleCloud..)

# Contenedores

Los contenedores(containers) son el siguiente paso en la evolución de la virtualización de sistemas operativos, su objetivo principal es OPTIMIZAR el uso de los recursos de la máquina anfitrión(host). Se puede entender como una virtualización a nivel de sistema operativo. Se evita la sobrecarga asociada con tener a cada huésped ejecutando un sistema operativo completamente instalado. Una desventaja de la virtualización basada en contenedores, sin embargo, es que cada invitado debe utilizar el mismo sistema operativo que utiliza el host, además de tener un menor nivel de aislamiento.

:::aviso[Imagen pendiente]
Falta la imagen «contenedores_2.png». Se añadirá con su licencia.
:::

## Docker

Se ha impuesto como sistema de virtualización de aplicaciones mediante contenedores. Podemos encontrar muchos tutoriales y formaciones en la web 1. Varios aspectos destacan:

* Inicialmente creada para GNU/Linux. Actualmente también existe como aplicación para Windows 2010/2016/2019 Srv

* Los contenedores ofrecen un mejor rendimiento que las MV.

* Pueden crearse redes virtuales privadas de contenedores

* El núcleo es el Docker Engine, pero existen opciones para gestionar contenedores.

    - [Docker Compose](https://docs.docker.com/compose/) 
    - Docker Machine. Para poder ejecutar docker, debemos instalarlo previamente en nuestro SO (preferiblemente una MV Linux Server, donde ya viene incluido en los repositorios por defecto)
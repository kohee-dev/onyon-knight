---
titulo: "Kea DHCP"
---

# 1. Del protocolo al servidor

Ya conocemos cómo un cliente solicita configuración mediante DHCP, qué es una concesión y para qué sirven las opciones. Ahora necesitamos un programa que atienda esas solicitudes y aplique las decisiones del administrador.

**Kea es una implementación de servidor DHCP desarrollada por Internet Systems Consortium (ISC).** Permite administrar direcciones y parámetros de red para los clientes. DHCP es el protocolo; Kea es el software que utilizaremos para proporcionarlo.

En esta práctica trabajaremos con **DHCPv4 en Debian 13.7**. El cliente recibirá una dirección de una subred preparada para el laboratorio y comprobaremos la concesión tanto desde el cliente como desde el servidor.

# 2. De dónde viene Kea

ISC también desarrolló **ISC DHCP**, conocido por su servidor `dhcpd` y por configuraciones como `dhcpd.conf`. Durante años fue una herramienta habitual en sistemas Unix y Linux.

El desarrollo de Kea procede del componente DHCP del proyecto **BIND 10**. Cuando ISC dejó de trabajar en la parte DNS de ese proyecto en 2014, el desarrollo de DHCP continuó como proyecto independiente.

Kea es un diseño nuevo, no un simple cambio de nombre. Separa componentes para DHCPv4, DHCPv6 y actualizaciones dinámicas de DNS, y dispone de mecanismos de administración y extensiones. En nuestro primer montaje solo necesitamos el servidor DHCPv4.

[Recurso: historia de las implementaciones DHCP de ISC](https://www.isc.org/dhcphistory/).

## 2.1. Por qué utilizaremos Kea en lugar de ISC DHCP

ISC anunció el final del mantenimiento activo de ISC DHCP en **2022**. En su explicación destaca las dificultades para modificar y probar una base de código antigua con garantías.

Esto no significa que los servidores existentes dejaran de funcionar al día siguiente. Significa que, para preparar nuevas instalaciones, debemos valorar software con una evolución y mantenimiento adecuados.

**Los conocimientos de DHCP siguen siendo útiles:** subredes, rangos, reservas, opciones y concesiones continúan existiendo. Cambian las herramientas con las que expresamos y administramos esa configuración.

[Recurso: anuncio del fin de mantenimiento de ISC DHCP](https://www.isc.org/blogs/isc-dhcp-eol/).

::: nota
La presencia de un paquete en una distribución y el soporte de su desarrollador original son cuestiones diferentes. Para administrar un sistema real hay que revisar tanto las actualizaciones de la distribución como el ciclo de vida del producto.
:::

# 3. Qué cambia al administrar Kea

| Aspecto | Qué nos interesa conocer |
| --- | --- |
| Componentes separados | Podemos preparar DHCPv4 sin desplegar todos los servicios de Kea. |
| Configuración estructurada | El archivo utiliza JSON extendido. |
| Administración | Existen interfaces para consultar y administrar el servicio. |
| Extensiones | Algunas funcionalidades se incorporan mediante bibliotecas adicionales. |
| Concesiones | El servicio conserva el estado de las direcciones asignadas mediante el almacenamiento configurado. |

No necesitamos desplegar una base de datos externa ni una plataforma de administración para conseguir nuestra primera concesión. Empezaremos con una configuración local sencilla.

[Recurso: presentación oficial de Kea](https://www.isc.org/kea/).

# 4. Cómo leer la configuración

Kea utiliza **JSON extendido**. Antes de modificar el archivo, debemos reconocer:

- **Objetos**, delimitados por `{ }`: agrupan propiedades.
- **Listas**, delimitadas por `[ ]`: contienen varios elementos.
- **Pares de clave y valor**, separados por `:`.
- **Comas**, que separan propiedades o elementos.
- **Cadenas**, escritas entre comillas dobles.
- **Números y booleanos**, sin comillas; los booleanos se escriben `true` y `false`.

Por ejemplo, este fragmento establece una duración de una hora:

```json
{
  "Dhcp4": {
    "valid-lifetime": 3600
  }
}
```

**Es un ejemplo de estructura, no una configuración suficiente para atender al laboratorio.** Todavía faltan la interfaz, la subred y el rango, entre otras decisiones.

Kea admite comentarios en los archivos locales, pero los comentarios no forman parte de JSON estricto. En los primeros ejemplos mantendremos una sintaxis sencilla, sin claves duplicadas ni comas sobrantes.

::: aviso
Un validador de JSON puede ayudar a encontrar errores de formato, pero no sabe si la configuración es válida para Kea. También utilizaremos el comprobador del propio servidor.
:::

[Recurso: sintaxis y organización de la configuración](https://kea.readthedocs.io/en/kea-2.6.3/arm/config.html).

## 4.1. Relación con la teoría de DHCP

| Elemento | Decisión que representa |
| --- | --- |
| `Dhcp4` | Configuración del servidor DHCPv4. |
| `interfaces-config` | Interfaz o interfaces donde atenderá a los clientes. |
| `subnet4` | Subredes IPv4 administradas. |
| `pools` | Direcciones disponibles para asignación dinámica. |
| `valid-lifetime` | Duración de las concesiones. |
| `renew-timer` y `rebind-timer` | Tiempos de renovación y reenlace, cuando se configuran explícitamente. |
| `option-data` | Parámetros adicionales para los clientes. |
| `reservations` | Asignaciones específicas para clientes identificados. |
| `lease-database` | Almacenamiento de la información de las concesiones. |

El archivo de configuración describe **las reglas**. Las concesiones registran **lo que el servidor ha asignado**. Son informaciones diferentes.

[Recurso: servidor DHCPv4 y ejemplos de configuración](https://kea.readthedocs.io/en/kea-2.6.3/arm/dhcp4-srv.html).

# 5. Referencia para Debian 13.7

La práctica utilizará el paquete **`kea-dhcp4-server`** del repositorio de Debian. Antes de seguir un manual, comprobaremos la versión que realmente se instala:

```bash
apt policy kea-dhcp4-server
kea-dhcp4 -v
```

El segundo comando se ejecuta después de instalarlo. La referencia consultada para Trixie ofrece Kea 2.6.3; por eso enlazamos ese manual. Si cambia el origen o la versión del paquete, debemos revisar también la documentación correspondiente.

| Elemento del paquete Debian | Ubicación o nombre |
| --- | --- |
| Archivo principal | `/etc/kea/kea-dhcp4.conf` |
| Ejecutable | `/usr/sbin/kea-dhcp4` |
| Unidad de servicio | `kea-dhcp4-server.service` |

[Paquete Debian](https://packages.debian.org/trixie/kea-dhcp4-server) y [archivos instalados](https://packages.debian.org/trixie/amd64/kea-dhcp4-server/filelist).

# 6. Esquema de la práctica

::: nota
Este apartado es la estructura técnica inicial. El enunciado narrativo, las capturas y el archivo completo de configuración se incorporarán al desarrollar la práctica.
:::

## 6.1. Objetivo

**Instalar y configurar Kea para que un cliente reciba una concesión DHCPv4, comprobar el resultado y añadir una reserva.**

## 6.2. Escenario de partida

Utilizaremos dos máquinas virtuales: un servidor Debian 13.7 y un cliente con configuración automática. Estarán conectadas a una red interna de laboratorio, sin otro servidor DHCP.

| Elemento | Propuesta inicial |
| --- | --- |
| Subred de laboratorio | `192.168.10.0/24` |
| Dirección fija del servidor | `192.168.10.3/24` |
| Rango dinámico | `192.168.10.100` a `192.168.10.150` |
| Duración inicial | 3600 segundos |
| Dirección para la reserva | `192.168.10.50` |
| Interfaz de servicio | La que esté conectada a la red interna; se identificará en cada máquina. |

El servidor podrá disponer de una segunda interfaz para descargar paquetes. **Kea atenderá únicamente por la interfaz del laboratorio.** El cliente no necesita Internet para demostrar que recibe una concesión.

No entregaremos una puerta de enlace o un DNS ficticios: se añadirán esas opciones cuando existan servicios accesibles que desempeñen esas funciones. La primera prueba será comunicación local entre cliente y servidor.

## 6.3. Fases y evidencias

| Fase | Trabajo previsto | Resultado que comprobaremos |
| --- | --- | --- |
| **1. Preparar la red** | Identificar interfaces, conectar la red interna y asignar IP fija al servidor. | Direccionamiento coherente y ausencia de otro DHCP en el segmento. |
| **2. Instalar** | Instalar el paquete y localizar configuración y servicio. | Versión identificada y archivos localizados. |
| **3. Configurar** | Guardar copia del archivo inicial y definir interfaz, subred, rango, duración y almacenamiento de concesiones. | Cada parámetro se relaciona con una decisión de red. |
| **4. Validar** | Ejecutar la comprobación de Kea y corregir errores. | El comprobador no detecta errores; todavía falta verificar el funcionamiento real. |
| **5. Poner en marcha** | Reiniciar el servicio y consultar estado y registros. | Servicio activo sin errores de arranque. |
| **6. Probar el cliente** | Solicitar configuración automática y examinar la concesión. | IP dentro del rango, máscara correcta y servidor DHCP esperado. |
| **7. Contrastar** | Buscar la concesión en el servidor y comprobar comunicación local. | Cliente y servidor muestran datos compatibles. |
| **8. Añadir una reserva** | Identificar el cliente y asociarlo a la dirección prevista. | Tras liberar/renovar según el cliente, recibe la dirección reservada. |
| **9. Diagnosticar** | Analizar una incidencia preparada y recuperar el servicio. | Explicación de la causa y evidencia de la corrección. |

Comandos de referencia para las fases de validación y puesta en marcha:

```bash
sudo kea-dhcp4 -t /etc/kea/kea-dhcp4.conf
sudo systemctl restart kea-dhcp4-server
systemctl status kea-dhcp4-server --no-pager
sudo journalctl -u kea-dhcp4-server -n 50 --no-pager
```

**Solo reiniciaremos después de corregir los errores de validación.** La opción `-t` no comprueba todas las condiciones que pueden fallar durante el funcionamiento.

## 6.4. Incidencias para elegir al desarrollar el guion

- Una coma ausente o un valor mal escrito.
- Una interfaz que no corresponde a la red interna.
- El cliente conectado a otra red virtual.
- Un cliente que conserva una concesión anterior al cambio.

Se introducirá una sola incidencia cada vez y se conservará una configuración funcional para poder recuperarla.

## 6.5. Entrega prevista

- Archivo final de configuración.
- Evidencia del servicio activo y de la concesión inicial del cliente.
- Evidencia de la reserva funcionando.
- Respuesta breve: diferencia entre rango y reserva, función de la interfaz seleccionada y explicación de la incidencia resuelta.

La captura de DORA puede incorporarse como ampliación. Las actualizaciones dinámicas de DNS, el relay y la alta disponibilidad quedan fuera de este primer montaje.

## 6.6. Decisiones pendientes para el guion definitivo

1. Hipervisor y nombres de las redes virtuales.
2. Sistema operativo del cliente y método para solicitar una nueva concesión.
3. Método de configuración de la IP fija de Debian.
4. Ambientación, nombres de los equipos y presentación de la entrega.

# 7. Recursos reunidos

| Recurso | Para qué consultarlo |
| --- | --- |
| [Historia de DHCP en ISC](https://www.isc.org/dhcphistory/) | Origen y evolución; contiene referencias históricas que deben leerse junto al anuncio de fin de mantenimiento. |
| [Fin del mantenimiento de ISC DHCP](https://www.isc.org/blogs/isc-dhcp-eol/) | Motivos del cambio de implementación. |
| [Presentación de Kea](https://www.isc.org/kea/) | Componentes y capacidades del proyecto. |
| [Inicio rápido de Kea 2.6.3](https://kea.readthedocs.io/en/kea-2.6.3/arm/quickstart.html) | Orientación para el primer despliegue. |
| [Sintaxis de configuración](https://kea.readthedocs.io/en/kea-2.6.3/arm/config.html) | Objetos, listas, tipos de datos y comentarios. |
| [Manual DHCPv4](https://kea.readthedocs.io/en/kea-2.6.3/arm/dhcp4-srv.html) | Interfaces, subredes, opciones, reservas y comprobaciones. |
| [Paquete de Debian](https://packages.debian.org/trixie/kea-dhcp4-server) | Versión y dependencias de la distribución. |
| [Archivos del paquete](https://packages.debian.org/trixie/amd64/kea-dhcp4-server/filelist) | Rutas de configuración, ejecutable y servicio. |
| [Migración de ISC DHCP a Kea](https://www.isc.org/dhcp_migration/) | Comparación y ampliación: KeaMA traduce parcialmente configuraciones, pero requiere revisión manual. |

**Elaboración docente a partir de documentación oficial de ISC y Debian.** El escenario de red y la secuencia de trabajo son una propuesta para el aula; el montaje todavía no se ha ejecutado ni validado en las máquinas de clase.

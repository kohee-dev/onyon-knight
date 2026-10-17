---
titulo: "DNS: Sistema de Nombres de Dominio"
licencia: CC-BY-NC-SA-4.0
---

:::nota[Objetivo]
Comprender qué problema resuelve [DNS](https://es.wikipedia.org/wiki/Sistema_de_nombres_de_dominio), cómo se organiza, cómo se resuelve un nombre paso a paso y qué piezas hay que conocer para montar y mantener un servicio de nombres propio.
:::

# 1. Para qué sirve DNS

Las máquinas se comunican por dirección IP, pero las personas recordamos nombres. DNS es la base de datos distribuida y jerárquica que traduce **nombres** a **direcciones** (y al revés), además de publicar otra información del dominio (servidores de correo, claves, textos de verificación…).

Antes de DNS, la correspondencia se mantenía en un único fichero, [hosts](https://es.wikipedia.org/wiki/Archivo_hosts), que se distribuía a todas las máquinas. Al crecer Internet esto dejó de ser viable: el fichero era enorme, cambiaba constantemente y no tenía un punto único de coordinación. DNS (RFC 1034 y 1035, 1987) nace para resolverlo con tres ideas:

- **Jerarquía**: el espacio de nombres tiene forma de árbol.
- **Delegación**: cada rama la administra quien la posee, sin depender de un punto central.
- **Distribución y caché**: ningún servidor lo sabe todo, y las respuestas se reutilizan.

:::tip[El fichero hosts sigue existiendo]
Sigue consultándose antes que DNS en la mayoría de sistemas (el orden lo marca `nsswitch.conf` en Linux). Es útil para pruebas, pero no escala.
:::

# 2. El espacio de nombres

Un [nombre de dominio](https://es.wikipedia.org/wiki/Nombre_de_dominio) se lee de derecha a izquierda, de lo general a lo particular. Cada parte separada por puntos es una **etiqueta**.

- La **raíz** (`.`) está en lo más alto y es invisible en el uso diario.
- Debajo están los [dominios de nivel superior (TLD)](https://es.wikipedia.org/wiki/Dominio_de_nivel_superior): genéricos (`.com`, `.org`), de país (`.es`, `.fr`) y otros. La [IANA](https://es.wikipedia.org/wiki/Internet_Assigned_Numbers_Authority) gestiona la raíz y la [ICANN](https://es.wikipedia.org/wiki/ICANN) coordina su política.
- Debajo de cada TLD se registran dominios, y cada propietario crea los subdominios que quiera.

Un nombre es un [FQDN](https://es.wikipedia.org/wiki/Nombre_de_dominio_completamente_calificado) (*Fully Qualified Domain Name*) cuando está completo hasta la raíz, y entonces termina en punto: `www.ejemplo.org.`. Sin el punto final es un nombre **relativo**, y el resolutor puede completarlo con un sufijo de búsqueda (`search` en `/etc/resolv.conf`).

Límites del estándar:

| Elemento | Límite |
|---|---|
| Longitud de una etiqueta | 63 caracteres |
| Longitud del nombre completo | 253 caracteres (textual) |
| Caracteres permitidos | letras, dígitos y guion (sin distinguir mayúsculas de minúsculas) |

# 3. Dominio y zona

Son conceptos distintos y se confunden con frecuencia.

- **Dominio**: una rama del árbol con todo lo que cuelga de ella.
- **Zona**: la parte de esa rama que un servidor administra directamente, es decir, el fichero de datos que contiene.

Si `ejemplo.org` delega `aula.ejemplo.org` a otro servidor, ambos son dominios, pero son **dos zonas** distintas. La delegación se hace con registros `NS` en la zona padre. Cuando el servidor de nombres del subdominio está dentro del propio subdominio (`ns1.aula.ejemplo.org`), el padre necesita publicar también su dirección: es el **registro glue** (pegamento). Sin él habría una dependencia circular, porque para encontrar el servidor habría que resolver un nombre que solo ese servidor sabe resolver.

# 4. Tipos de servidores

| Tipo | Función |
|---|---|
| **Servidor raíz** | Conoce los servidores de cada TLD. Existen 13 identidades (de la `a` a la `m`), replicadas en cientos de instancias mediante [anycast](https://es.wikipedia.org/wiki/Anycast). Más información: [servidores raíz](https://en.wikipedia.org/wiki/Root_name_server). |
| **Servidor de TLD** | Conoce los servidores autoritativos de cada dominio registrado bajo él. |
| **Servidor autoritativo** | Tiene los datos originales de una zona y responde con autoridad sobre ella. Solo responde de lo que es suyo. |
| **Servidor recursivo (resolutor)** | Recibe las preguntas de los clientes, las resuelve consultando a otros servidores y guarda las respuestas en caché. Es el que usa un usuario normal. |
| **Reenviador (forwarder)** | Recursivo que, en lugar de resolver por sí mismo, delega en otro recursivo. |
| **Stub resolver** | La parte mínima del cliente (en el sistema operativo) que pregunta a un recursivo y espera la respuesta final. |

:::aviso[Autoritativo y recursivo son roles, no productos]
Un mismo programa puede hacer las dos cosas, pero mezclarlas en el mismo servidor expuesto a Internet se considera mala práctica por razones de seguridad.
:::

# 5. Cómo se resuelve un nombre

Hay dos tipos de consulta:

- **Recursiva**: el cliente pide la respuesta definitiva y el servidor se encarga de conseguirla. Es lo que hace el stub resolver con su recursivo.
- **Iterativa**: el servidor responde con lo que sabe o con una referencia («pregunta a este otro»), y quien consulta continúa el camino. Es lo que hace el recursivo con raíz, TLD y autoritativos.

Secuencia típica para `www.ejemplo.org` con la caché vacía:

1. El cliente pregunta a su recursivo.
2. El recursivo pregunta a un servidor raíz y recibe los servidores del TLD `org`.
3. Pregunta a un servidor de `org` y recibe los servidores autoritativos de `ejemplo.org`.
4. Pregunta a uno de ellos y recibe la respuesta final (`A` de `www`).
5. El recursivo la entrega al cliente y la guarda en caché.

## Caché y TTL

Cada registro lleva un **[TTL](https://es.wikipedia.org/wiki/Tiempo_de_vida)** (tiempo de vida, en segundos) que indica cuánto tiempo puede conservarse en caché. Consecuencias prácticas:

- Un TTL alto reduce el tráfico y acelera las respuestas, pero los cambios tardan en propagarse.
- Un TTL bajo permite cambios rápidos, a costa de más consultas.
- La «propagación de DNS» no es un proceso activo: es simplemente la caducidad de las cachés.
- También se cachean las respuestas negativas (el nombre no existe), con un tiempo que marca el campo mínimo del SOA.

# 6. Registros de recursos

Cada dato de una zona es un **registro de recurso (RR)**: nombre, TTL, clase (`IN` = Internet), tipo y datos. Listado completo: [tipos de registros DNS](https://en.wikipedia.org/wiki/List_of_DNS_record_types).

| Tipo | Contenido |
|---|---|
| `SOA` | Inicio de autoridad: parámetros de la zona (obligatorio, uno por zona) |
| `NS` | Servidores de nombres de la zona o de una zona delegada |
| `A` | Dirección IPv4 |
| `AAAA` | Dirección IPv6 |
| `CNAME` | Alias: un nombre apunta a otro nombre «canónico» |
| `MX` | Servidor de correo del dominio, con prioridad |
| `PTR` | Resolución inversa: dirección → nombre |
| `TXT` | Texto libre (verificaciones, SPF, DKIM…) |
| `SRV` | Localización de un servicio concreto (host, puerto, prioridad y peso) |
| `CAA` | Qué autoridades de certificación pueden emitir certificados para el dominio |

Reglas que conviene recordar:

- Un `CNAME` no puede convivir con otros registros en el mismo nombre, y no puede estar en el vértice de la zona (donde está el SOA).
- Un `NS` y un `MX` deben apuntar a un **nombre** con registro `A`/`AAAA`, nunca a un `CNAME` ni directamente a una IP.
- Un mismo nombre puede tener varios registros del mismo tipo (por ejemplo, varios `A`): el conjunto se llama **RRset**.

## El registro SOA

Contiene los parámetros que gobiernan la zona:

| Campo | Significado |
|---|---|
| MNAME | Servidor primario de la zona |
| RNAME | Correo del responsable (la `@` se escribe como punto) |
| Serial | Número de versión de la zona: **hay que incrementarlo en cada cambio** |
| Refresh | Cada cuánto consulta un secundario si hay cambios |
| Retry | Cada cuánto reintenta si el primario no responde |
| Expire | Cuándo el secundario deja de responder si no logra contactar con el primario |
| Minimum | TTL para las respuestas negativas |

## Fichero de zona

El formato clásico de [fichero de zona](https://en.wikipedia.org/wiki/Zone_file) es texto plano con una línea por registro. Directivas habituales: `$ORIGIN` (dominio por defecto para los nombres relativos) y `$TTL` (TTL por defecto). Un punto final marca un nombre absoluto; sin él, se le añade el `$ORIGIN`. Olvidar el punto final es uno de los errores más frecuentes.

# 7. Resolución inversa

Permite obtener el nombre a partir de una IP mediante registros `PTR`. Se organiza en dominios especiales:

- IPv4: `in-addr.arpa`, con los octetos **en orden inverso**. La IP `192.0.2.10` se consulta como `10.2.0.192.in-addr.arpa`.
- IPv6: `ip6.arpa`, con cada nibble (medio byte) invertido.

La zona inversa la delega quien posee el bloque de direcciones (normalmente el proveedor), no el dueño del dominio directo. Se usa en registros de logs, en diagnóstico y, sobre todo, en servidores de correo, que suelen comprobar que la IP emisora tenga un `PTR` coherente.

# 8. Redundancia: servidores primario y secundario

Toda zona debería tener al menos dos servidores autoritativos, idealmente en redes distintas.

- El **primario** (maestro) tiene la copia editable de la zona.
- Los **secundarios** (esclavos) la obtienen del primario mediante una [transferencia de zona](https://en.wikipedia.org/wiki/DNS_zone_transfer): completa (`AXFR`) o solo las diferencias (`IXFR`).
- El primario avisa de los cambios con un mensaje `NOTIFY`; si se pierde, el secundario consulta por su cuenta cada `Refresh`.
- Un secundario solo se actualiza si el **serial** es mayor que el que tiene. Si se olvida incrementarlo, los cambios no se replican.

Una transferencia de zona entrega el contenido completo de la zona, por lo que debe restringirse a los secundarios autorizados.

# 9. El protocolo

DNS usa el **puerto 53**:

- **UDP** para las consultas normales (rápido y ligero).
- **TCP** cuando la respuesta no cabe en un datagrama (bandera TC, *truncated*), en las transferencias de zona y cada vez más en general.
- [EDNS(0)](https://en.wikipedia.org/wiki/Extension_Mechanisms_for_DNS) amplía el tamaño de los mensajes UDP más allá del límite clásico de 512 bytes.

Elementos de una respuesta que hay que saber leer:

| Elemento | Significado |
|---|---|
| `aa` (*authoritative answer*) | Responde un servidor autoritativo, no una caché |
| `rd` / `ra` | Recursión deseada por el cliente / disponible en el servidor |
| `NOERROR` | Consulta correcta (puede venir sin datos) |
| `NXDOMAIN` | El nombre no existe |
| `SERVFAIL` | El servidor no pudo completar la resolución |
| `REFUSED` | El servidor se niega a responder (política o ACL) |

# 10. Seguridad

DNS se diseñó sin autenticación ni cifrado, y de ahí vienen sus riesgos:

- **[Envenenamiento de caché](https://en.wikipedia.org/wiki/DNS_spoofing)**: se introduce en la caché de un recursivo una respuesta falsa para redirigir el tráfico.
- **Amplificación y reflexión**: un servidor abierto y mal configurado se usa para atacar a terceros con respuestas desproporcionadas a consultas falsificadas.
- **Fuga de información** mediante transferencias de zona no restringidas.

Defensas básicas: no ofrecer recursión a Internet (limitarla a las redes propias con ACL), restringir las transferencias, mantener el software actualizado y separar los roles autoritativo y recursivo.

Mecanismos más avanzados:

- **[DNSSEC](https://es.wikipedia.org/wiki/Domain_Name_System_Security_Extensions)**: firma criptográfica de los registros para comprobar su **autenticidad e integridad**. No cifra ni oculta nada.
- **[DNS over TLS](https://en.wikipedia.org/wiki/DNS_over_TLS) y [DNS over HTTPS](https://en.wikipedia.org/wiki/DNS_over_HTTPS)**: cifran la comunicación entre cliente y recursivo para ganar **privacidad**.
- **[Split-horizon DNS](https://en.wikipedia.org/wiki/Split-horizon_DNS)** (vistas): un mismo servidor responde distinto según quién pregunta, por ejemplo con direcciones internas para la red local y públicas para el exterior.

# 11. Herramientas de diagnóstico

Para consultar a mano y ver la respuesta completa (secciones, banderas, TTL restante) existen [`dig`](https://en.wikipedia.org/wiki/Dig_(command)), `host` y `nslookup`. `dig` es la referencia para diagnosticar porque muestra todos los campos de la respuesta y permite elegir el servidor y el tipo de registro.

# 12. Software de servidor DNS

| Software | Rol principal |
|---|---|
| [BIND](https://es.wikipedia.org/wiki/BIND) | Autoritativo y recursivo; la implementación de referencia, de ISC |
| [Unbound](https://en.wikipedia.org/wiki/Unbound_(DNS_server)) | Recursivo y validador, ligero y seguro |
| [dnsmasq](https://en.wikipedia.org/wiki/Dnsmasq) | Reenviador y caché sencillo para redes pequeñas (junto con DHCP) |
| [Knot DNS](https://en.wikipedia.org/wiki/Knot_DNS) | Autoritativo de alto rendimiento |
| [PowerDNS](https://en.wikipedia.org/wiki/PowerDNS) | Autoritativo y recursivo, con almacenamiento en base de datos |
| [CoreDNS](https://en.wikipedia.org/wiki/CoreDNS) | DNS por plugins, habitual en Kubernetes |

# 13. Preguntas de repaso

:::ejercicio[Preguntas]
1. ¿Qué diferencia hay entre un dominio y una zona?
2. ¿Para qué sirve un registro glue y cuándo es imprescindible?
3. ¿Qué pasa si modificas una zona y no incrementas el serial?
4. ¿Qué diferencia hay entre una consulta recursiva y una iterativa? ¿Quién hace cada una?
5. ¿Por qué un cambio de IP puede tardar horas en ser visible para todos los usuarios?
6. ¿Por qué no se puede poner un `CNAME` en el vértice de una zona?
7. ¿Cómo se escribe la consulta inversa de `198.51.100.25`?
8. ¿Qué protege DNSSEC y qué no protege?
9. ¿Qué significa `NXDOMAIN` frente a `SERVFAIL`?
10. ¿Por qué no conviene que un servidor autoritativo de Internet ofrezca recursión abierta?
:::

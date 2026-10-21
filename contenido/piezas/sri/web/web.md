---
titulo: "Servidores web"
licencia: CC-BY-NC-SA-4.0
---

:::nota[Objetivo]
Comprender cómo funciona un servidor web: el protocolo [HTTP](https://es.wikipedia.org/wiki/Protocolo_de_transferencia_de_hipertexto), el cifrado con TLS, cómo un mismo servidor atiende varios sitios, cómo genera contenido dinámico y qué diferencias de diseño hay entre los servidores más usados.
:::

# 1. Qué es un servidor web

Un servidor web es un programa que escucha peticiones de clientes (navegadores, aplicaciones, otros servicios) y responde con recursos: ficheros, páginas generadas, datos. Se apoya en el modelo **cliente-servidor** sobre TCP y habitualmente en los puertos **80** (HTTP) y **443** (HTTPS).

Lo que hace, en esencia:

1. Escuchar en un puerto.
2. Recibir una petición y localizar el recurso que corresponde.
3. Devolver una respuesta con un código de estado, cabeceras y, normalmente, un cuerpo.
4. Registrar lo que ha ocurrido.

# 2. URL y recursos

Una [URL](https://es.wikipedia.org/wiki/Localizador_de_recursos_uniforme) identifica un recurso y cómo llegar a él:

`https://www.ejemplo.org:443/docs/guia.html?v=2#intro`

| Parte | Ejemplo | Significado |
|---|---|---|
| Esquema | `https` | Protocolo a usar |
| Host | `www.ejemplo.org` | Nombre del servidor (se resuelve por DNS) |
| Puerto | `443` | Se omite si es el de por defecto |
| Ruta | `/docs/guia.html` | Recurso dentro del servidor |
| Consulta | `?v=2` | Parámetros |
| Fragmento | `#intro` | Lo gestiona el cliente, **no se envía** al servidor |

# 3. El protocolo HTTP

HTTP es un protocolo de petición y respuesta, **sin estado**: cada petición es independiente y el servidor no recuerda las anteriores. Las sesiones se construyen encima, con *cookies* o *tokens*.

## Petición

Una petición lleva:

- **Línea inicial**: método, ruta y versión (`GET /index.html HTTP/1.1`).
- **Cabeceras**: metadatos (`Host`, `User-Agent`, `Accept`, `Cookie`…).
- **Cuerpo** (opcional): datos enviados, por ejemplo en un formulario.

| Método | Uso | ¿Modifica datos? |
|---|---|---|
| `GET` | Obtener un recurso | No |
| `HEAD` | Igual que GET pero solo cabeceras | No |
| `POST` | Enviar datos para su procesamiento | Sí |
| `PUT` | Crear o reemplazar un recurso | Sí |
| `DELETE` | Eliminar un recurso | Sí |
| `OPTIONS` | Consultar qué métodos admite | No |

## Respuesta

Una respuesta lleva una línea de estado (`HTTP/1.1 200 OK`), cabeceras (`Content-Type`, `Content-Length`, `Cache-Control`, `Set-Cookie`…) y el cuerpo.

| Familia | Significado | Ejemplos |
|---|---|---|
| 1xx | Informativo | `101 Switching Protocols` |
| 2xx | Éxito | `200 OK`, `201 Created`, `204 No Content` |
| 3xx | Redirección | `301 Moved Permanently`, `302 Found`, `304 Not Modified` |
| 4xx | Error del cliente | `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found` |
| 5xx | Error del servidor | `500 Internal Server Error`, `502 Bad Gateway`, `503 Service Unavailable` |

:::aviso[401 y 403 no son lo mismo]
`401` significa «no sé quién eres» (falta autenticación). `403` significa «sé quién eres, pero no tienes permiso».
:::

:::aviso[502 y 503]
Son típicos de los servidores que trabajan detrás de un proxy o delante de una aplicación: `502` indica que la respuesta del servidor de atrás es inválida o no llega, y `503` que el servicio no está disponible o está saturado.
:::

## Versiones

| Versión | Característica principal |
|---|---|
| HTTP/1.0 | Una conexión TCP por petición |
| HTTP/1.1 | Conexiones persistentes (*keep-alive*) y cabecera `Host`, que hizo posibles los hosts virtuales |
| HTTP/2 | Multiplexa varias peticiones en una misma conexión, comprime cabeceras. En la práctica va cifrado |
| HTTP/3 | Funciona sobre [QUIC](https://es.wikipedia.org/wiki/QUIC) (UDP) en lugar de TCP, para reducir latencia y evitar bloqueos |

:::pregunta[¿Qué significa que HTTP no tiene estado y cómo se consigue una sesión?]
Que cada petición es independiente y el servidor no recuerda las anteriores. Las sesiones se construyen por encima del protocolo, con *cookies* o *tokens* que el cliente envía en cada petición.
:::

:::pregunta[¿Qué diferencia hay entre un `401` y un `403`? ¿Y entre un `502` y un `503`?]
`401` significa que falta autenticación («no sé quién eres») y `403` que sé quién eres pero no tienes permiso. `502` indica que la respuesta del servidor de atrás es inválida o no llega, y `503` que el servicio no está disponible o está saturado.
:::

# 4. HTTPS: TLS y certificados

[HTTPS](https://es.wikipedia.org/wiki/Protocolo_seguro_de_transferencia_de_hipertexto) es HTTP dentro de un canal cifrado con [TLS](https://es.wikipedia.org/wiki/Seguridad_de_la_capa_de_transporte). Aporta tres garantías:

- **Confidencialidad**: nadie en el camino puede leer el contenido.
- **Integridad**: nadie puede modificarlo sin que se note.
- **Autenticidad del servidor**: el cliente comprueba que habla con quien dice ser.

La autenticidad se basa en el **[certificado digital](https://es.wikipedia.org/wiki/Certificado_de_clave_p%C3%BAblica)** del servidor, que une un nombre de dominio con una clave pública y está firmado por una [autoridad de certificación (CA)](https://es.wikipedia.org/wiki/Autoridad_de_certificaci%C3%B3n) en la que el cliente confía.

Resumen del establecimiento de la conexión:

1. El cliente se conecta y propone las versiones y cifrados que admite.
2. El servidor responde con su certificado.
3. El cliente valida la cadena de confianza, la fecha de validez y que el nombre coincide con el que pidió.
4. Ambos acuerdan unas claves de sesión y, desde ahí, todo va cifrado con ellas.

Conceptos clave:

| Concepto | Qué es |
|---|---|
| Clave privada | Se queda en el servidor y **nunca se comparte** |
| CSR | Solicitud de firma de certificado, que se envía a la CA |
| Cadena de confianza | Certificado del servidor → CA intermedia → CA raíz |
| Autofirmado | Firmado por sí mismo. Cifra igual, pero el cliente no tiene por qué confiar |
| [Let's Encrypt](https://es.wikipedia.org/wiki/Let%27s_Encrypt) | CA gratuita y automatizada, con certificados de corta duración y renovación automática |
| [SNI](https://en.wikipedia.org/wiki/Server_Name_Indication) | Extensión por la que el cliente indica el nombre al que se conecta antes de recibir el certificado |
| [HSTS](https://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security) | Cabecera que obliga al navegador a usar siempre HTTPS con ese sitio |

:::nota[Por qué importa SNI]
Sin SNI, un servidor con una sola IP no sabría qué certificado presentar antes de leer la cabecera `Host`, que ya va cifrada. SNI resuelve el problema y permite HTTPS en varios sitios sobre la misma IP.
:::

:::aviso[Errores típicos con certificados]
Nombre que no coincide con el del certificado, certificado caducado, cadena incompleta (falta el intermedio) y CA no reconocida por el cliente.
:::

:::pregunta[¿Qué garantías da HTTPS y cuál de ellas depende de la confianza en una CA?]
Confidencialidad, integridad y autenticidad del servidor. La autenticidad depende de la CA: el certificado une el dominio con una clave pública y está firmado por una autoridad en la que el cliente confía.
:::

:::pregunta[¿Por qué hace falta SNI para varios sitios HTTPS en una misma IP?]
Porque el servidor debe elegir qué certificado presentar antes de poder leer la cabecera `Host`, que ya va cifrada. Con SNI el cliente indica el nombre al que se conecta antes de recibir el certificado.
:::

:::pregunta[Un cliente ve un aviso de certificado no válido: enumera tres causas posibles.]
El nombre no coincide con el del certificado, el certificado ha caducado, la cadena está incompleta (falta el intermedio) o la CA no es reconocida por el cliente.
:::

# 5. Varios sitios en un servidor: hosts virtuales

Un servidor puede alojar muchos sitios. Para decidir cuál responde se usa uno de estos criterios:

| Tipo | Se distingue por | Observación |
|---|---|---|
| Basado en nombre | Cabecera `Host` (y SNI en HTTPS) | El más común. Una sola IP para todos |
| Basado en IP | IP a la que llega la petición | Requiere una IP por sitio |
| Basado en puerto | Puerto de destino | Habitual en entornos internos y pruebas |

En el modelo basado en nombre, el DNS hace que varios nombres apunten a la misma IP y el servidor web elige el sitio por la cabecera. Siempre hay un **sitio por defecto** que responde cuando ningún nombre coincide.

Cada sitio tiene su **raíz de documentos** (*document root*): el directorio del que se sirven los ficheros.

:::pregunta[¿Cómo decide el servidor qué sitio responde en un host virtual basado en nombre?]
Por la cabecera `Host` de la petición (y por SNI en HTTPS). Varios nombres apuntan a la misma IP y, si ninguno coincide, responde el sitio por defecto.
:::

# 6. Contenido estático y dinámico

- **Estático**: el servidor lee un fichero y lo devuelve tal cual (HTML, imágenes, CSS, JavaScript). Es muy eficiente.
- **Dinámico**: la respuesta se genera en el momento, normalmente consultando una base de datos.

Para el contenido dinámico, el servidor web puede:

| Mecanismo | Cómo funciona |
|---|---|
| Módulo embebido | El intérprete va dentro del propio servidor (por ejemplo, `mod_php` en Apache) |
| [CGI](https://es.wikipedia.org/wiki/Common_Gateway_Interface) | Lanza un programa por cada petición. Sencillo pero lento |
| [FastCGI](https://en.wikipedia.org/wiki/FastCGI) | Mantiene procesos externos en marcha y les envía las peticiones (por ejemplo, PHP-FPM) |
| Proxy a una aplicación | Reenvía la petición a otro servicio que ejecuta la aplicación (Node.js, Python, Java…) |

:::tip[Por qué se separa]
Con FastCGI o proxy, el servidor web se dedica a lo que hace mejor (conexiones, ficheros, TLS) y el motor de la aplicación se escala o se reinicia por separado.
:::

:::pregunta[¿Qué ventaja tiene FastCGI sobre CGI?]
CGI lanza un programa por cada petición, lo que es sencillo pero lento. FastCGI mantiene procesos externos en marcha (como PHP-FPM) y les envía las peticiones, evitando ese coste.
:::

# 7. Arquitecturas de los servidores

La diferencia de diseño más relevante es **cómo atiende varias conexiones a la vez**.

- **Un proceso o hilo por conexión.** Cada conexión ocupa un proceso o un hilo mientras dura. Es simple y robusto, pero con miles de conexiones el consumo de memoria crece mucho.
- **Orientado a eventos.** Unos pocos procesos atienden muchas conexiones simultáneas con E/S asíncrona, sin bloquearse a la espera de cada cliente. Es mucho más eficiente con muchas conexiones lentas.

[Apache](https://es.wikipedia.org/wiki/Servidor_HTTP_Apache) ofrece distintos **MPM** (*Multi-Processing Modules*):

| MPM | Modelo |
|---|---|
| `prefork` | Un proceso por conexión, sin hilos. Compatible con código no seguro para hilos |
| `worker` | Varios procesos con varios hilos cada uno |
| `event` | Como `worker`, pero con hilos dedicados a las conexiones inactivas. El habitual hoy |

[nginx](https://es.wikipedia.org/wiki/Nginx) fue diseñado desde el principio con arquitectura orientada a eventos.

:::pregunta[¿Por qué un servidor orientado a eventos aguanta mejor miles de conexiones lentas?]
Porque unos pocos procesos atienden muchas conexiones a la vez con E/S asíncrona, sin quedarse bloqueados esperando a cada cliente. Con un proceso o hilo por conexión, la memoria crece mucho al aumentar las conexiones.
:::

# 8. Comparativa de servidores

| | Apache HTTP Server | nginx | [IIS](https://es.wikipedia.org/wiki/Internet_Information_Services) |
|---|---|---|---|
| Plataforma | Multiplataforma | Multiplataforma | Solo Windows Server |
| Licencia | Libre (Apache) | Libre (BSD) | Incluido con Windows |
| Modelo | Procesos/hilos (MPM) | Eventos | Eventos con grupos de aplicaciones |
| Configuración | Ficheros de texto, con `.htaccess` por directorio | Ficheros de texto, centralizada | Consola gráfica, PowerShell y XML |
| Módulos | Carga dinámica | Se eligen sobre todo al compilar (con módulos dinámicos recientes) | Módulos nativos y administrados |
| Punto fuerte | Flexibilidad, muchos módulos, `.htaccess` | Rendimiento con mucha concurrencia, proxy | Integración con Windows, AD y .NET |

:::nota[El `.htaccess`]
Apache permite configurar un directorio con un fichero dentro de él, sin tocar la configuración principal. Es cómodo en alojamientos compartidos, pero se lee en cada petición y reduce el rendimiento. nginx no lo tiene.
:::

:::pregunta[¿Por qué `.htaccess` perjudica al rendimiento?]
Porque Apache lee ese fichero en cada petición, en lugar de leer la configuración principal una sola vez.
:::

# 9. Proxy inverso, balanceo y caché

Un [proxy inverso](https://en.wikipedia.org/wiki/Reverse_proxy) recibe las peticiones de los clientes y las reenvía a uno o varios servidores internos. Los clientes solo ven al proxy.

Para qué se usa:

- **Terminar TLS** en un punto y hablar en claro con los servidores internos.
- **Repartir la carga** entre varios servidores ([balanceo](https://en.wikipedia.org/wiki/Load_balancing_(computing))): por turnos, por menor número de conexiones, por IP del cliente…
- **Ocultar** la estructura interna.
- **Guardar en caché** respuestas frecuentes para aliviar a los servidores de atrás.
- Publicar en un único nombre varias aplicaciones que viven en servidores distintos.

nginx se usa mucho para esta función, y Apache también puede hacerlo con sus módulos de proxy.

:::pregunta[¿Qué ventajas tiene poner un proxy inverso delante de una aplicación?]
Permite terminar TLS en un punto, repartir la carga entre varios servidores, ocultar la estructura interna, guardar en caché respuestas frecuentes y publicar varias aplicaciones bajo un único nombre.
:::

# 10. Registros (logs)

Un servidor web guarda dos tipos de registro:

- **Acceso**: una línea por petición (IP del cliente, fecha, método y ruta, código de estado, tamaño, cliente).
- **Error**: problemas del propio servidor o de la aplicación.

Son la primera herramienta de diagnóstico y también de seguridad: permiten ver intentos de acceso a rutas que no existen, picos de errores o ataques.

# 11. Seguridad básica

- **Mínimo privilegio**: el servicio corre con un usuario sin privilegios y solo tiene permiso de lectura sobre la raíz del sitio.
- **Todo por HTTPS**, con redirección desde HTTP y HSTS.
- **Ocultar** la versión del servidor y no mostrar listados de directorios.
- **Mantener actualizado** el servidor y sus módulos, y activar solo los necesarios.
- **Cabeceras de seguridad** (como `Content-Security-Policy` o `X-Content-Type-Options`).
- **Limitar** métodos, tamaño de peticiones y tasa de conexiones.
- **Autenticación**: básica (siempre sobre HTTPS), integrada con el sistema o delegada en la aplicación.
- **Un cortafuegos** que solo exponga los puertos necesarios.

:::aviso[Directorios fuera de la raíz]
Todo lo que está dentro de la raíz de documentos es potencialmente público. Las copias de seguridad, ficheros de configuración o credenciales no deben estar ahí.
:::

# 12. Herramientas de diagnóstico

| Herramienta | Para qué sirve |
|---|---|
| [`curl`](https://es.wikipedia.org/wiki/CURL) | Hacer peticiones a mano. `curl -I` muestra solo las cabeceras y `curl -v` el diálogo completo, incluido TLS |
| Herramientas del navegador | Ver las peticiones, cabeceras, tiempos y errores |
| `openssl s_client` | Comprobar el certificado y la cadena de un servidor |
| Registros del servidor | Ver qué ha llegado y qué se ha respondido |

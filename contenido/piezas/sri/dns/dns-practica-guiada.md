---
titulo: "Servicio DNS con BIND9 (práctica guiada)"
licencia: CC-BY-NC-SA-4.0
tipo: caso
horas: 6
resumen: Un servicio de nombres completo con BIND9, de la resolución básica a las zonas dinámicas, documentado en un repositorio Git.
---

::: aviso
Para la realización de esta actividad voy a tener los siguientes supuestos:

+ Manejas la terminal de Linux y SSH con soltura.
+ Cada pregunta parte de lo que dejó la anterior: **hazlas en orden**.
+ Los apartados de cada pregunta también se hacen **en orden**.
+ Las explicaciones se redactan con tus propias palabras.
+ Si alguien hace *trampa* o *plagio*, lo sabré.
:::

# Planteamiento

Vas a montar, paso a paso, el servicio de nombres de una pequeña red con **BIND9**. Empiezas observando cómo se resuelven los nombres, después instalas un servidor autoritativo, creas una zona directa y otra inversa, añades un servidor caché con reenviadores, un servidor secundario con transferencia de zona protegida y, por último, una zona de DNS dinámico. Todo lo que hagas queda documentado en un repositorio Git.

# Conocimientos previos

Antes de empezar deberías repasar la teoría de [[dns|DNS]] y [[dns-bind|Implantación de DNS con BIND en Linux]]. En concreto, necesitas saber:

- Qué es un **servicio de nombres**, la **jerarquía** DNS y la diferencia entre consulta recursiva e iterativa.
- Los tipos de registro: `A`, `AAAA`, `CNAME`, `MX`, `TXT`, `NS`, `SOA` y `PTR`.
- Qué es una zona **directa** y una **inversa**, y para qué sirven la caché, los reenviadores y las transferencias de zona.
- Lo básico de **Git**: `commit`, `status` y `.gitignore`.

# Entorno

Trabajas con tres máquinas virtuales Linux (Debian 12 o Ubuntu 24.04) en la misma red `192.168.56.0/24`. Las direcciones son estas y no se cambian:

| Máquina | Dirección | Papel | Se usa desde |
|---|---|---|---|
| `ns1` | `192.168.56.10` | Servidor DNS primario (autoritativo) | Pregunta 1 |
| `ns2` | `192.168.56.11` | Servidor DNS secundario | Pregunta 8 |
| `ns3` | `192.168.56.12` | Servidor caché con reenviadores | Pregunta 6 |

El dominio de la práctica es `sri.test` (la terminación `.test` está reservada para pruebas y nunca existe en Internet). Las máquinas ya tienen su dirección IP fija y acceso a Internet para instalar paquetes. Los comandos que empiezan por `sudo` se ejecutan con privilegios de administrador.

**Datos que se usan en toda la práctica:**

| Nombre | Tipo | Valor |
|---|---|---|
| `ns1.sri.test` | A | `192.168.56.10` |
| `ns2.sri.test` | A | `192.168.56.11` |
| `dnscache.sri.test` | A | `192.168.56.12` |
| `www.sri.test` | A | `192.168.56.20` |
| `www.sri.test` | AAAA | `fd00:56::20` |
| `mail.sri.test` | A | `192.168.56.25` |
| `web.sri.test`, `ftp.sri.test` | CNAME | `www.sri.test.` |
| `sri.test` | MX | prioridad 10, `mail.sri.test.` |
| `sri.test` | TXT | `"v=spf1 mx -all"` |

# Cómo entregar el trabajo

**Qué se entrega.** Un repositorio Git con el trabajo de las diez preguntas. El repositorio se llama `sri-dns-apellido-nombre` (minúsculas, sin tildes ni espacios) y se entrega en el canal que indique el profesorado. El plazo lo indicará el profesorado.

Descarga la plantilla de respuestas, rellénala y guárdala en la raíz del repositorio con el nombre `respuestas_apellido_nombre.docx` (minúsculas, sin tildes ni espacios):

- [Plantilla de respuestas (preguntas 1 a 9)](descarga:dns-respuestas.docx)

**Estructura del repositorio:**

```text
sri-dns-apellido-nombre/
├── README.md                      # Pregunta 10
├── respuestas_apellido_nombre.docx # Respuestas y salidas de las preguntas 1 a 9
├── .gitignore                     # Debe excluir los ficheros de claves (*.key)
├── ns1/
│   ├── named.conf.options
│   ├── named.conf.local
│   ├── zones/db.sri.test
│   ├── zones/db.192.168.56
│   └── db.dinamico.sri.test
├── ns2/
│   ├── named.conf.options
│   └── named.conf.local
└── ns3/
    ├── named.conf.options
    └── named.conf.local
```

**Reglas de la entrega:**

- Copia al repositorio los ficheros de configuración **tal como quedan al final** en cada máquina.
- **Nunca subas las claves** (`transfer.key`, `ddns.key`) ni escribas el secreto en ningún fichero del repositorio. Con `git status` no debe aparecer ningún `.key`.
- Haz **al menos un commit por pregunta**, con un mensaje claro que diga qué has hecho (por ejemplo, «Pregunta 5: zonas directa e inversa de sri.test»).
- En la plantilla hay una fila por apartado. Si un apartado no tiene resultado, escribe `—`.
- Pega las salidas de los comandos **como texto**, no como capturas.
- Las explicaciones, con tus propias palabras.

**Qué debe contener la entrega:**

| Parte | Fichero | Preguntas | Además del comando, hay que incluir | Evidencia |
|---|---|---|---|---|
| Única | `respuestas_apellido_nombre.docx` + ficheros de configuración + `README.md` | 1 a 10 | Las explicaciones pedidas en las preguntas 1, 2, 3, 5, 6, 7, 8 y 9 y las salidas de los comandos `dig` | Los cinco comandos de «Evidencia final» |

**Cómo se califica.** Cada pregunta vale 1 punto, hasta 10 en total. Cada pregunta se revisa con una lista de cotejo con sus apartados.

# Práctica guiada

## Pregunta 1 — Para qué hace falta un servicio de nombres *(1 punto)*

Trabaja en `ns1`.

1. Comprueba que el nombre `www.sri.test` todavía no se conoce: `getent hosts www.sri.test`. Anota qué ocurre.
2. Añade al final de `/etc/hosts` la línea `192.168.56.20 www.sri.test` (con `sudo`) y repite el comando anterior. Anota el resultado.
3. Deja `/etc/hosts` como estaba (borra la línea que has añadido).
4. Explica con tus palabras, en 4 o 5 líneas, **dos escenarios reales** en los que mantener un fichero `hosts` en cada equipo deja de ser práctico y un servicio DNS lo resuelve.

## Pregunta 2 — Mecanismos de resolución de nombres *(1 punto)*

Sigue en `ns1`.

1. Ejecuta `grep '^hosts' /etc/nsswitch.conf` y explica en qué orden consulta el sistema los mecanismos que aparecen.
2. Ejecuta `cat /etc/resolv.conf` y anota qué servidor DNS usa el equipo.
3. Completa una tabla con estos cuatro mecanismos: *fichero `/etc/hosts`*, *servidor DNS autoritativo*, *servidor DNS recursivo con caché* y *reenviador*. Para cada uno indica si es local o remoto, quién mantiene los datos y un ejemplo de uso.
4. Explica con tus palabras la diferencia entre una **consulta recursiva** y una **consulta iterativa**.

## Pregunta 3 — La jerarquía del sistema de nombres *(1 punto)*

Sigue en `ns1`, que necesita acceso a Internet.

1. Ejecuta `dig +trace www.example.org` y localiza los cuatro niveles por los que pasa la consulta: servidores raíz, servidores del dominio de primer nivel (`org`), servidores del dominio `example.org` y la respuesta final. Anota el nombre de un servidor de cada nivel.
2. Ejecuta `dig . NS +short` y anota cuántos servidores raíz aparecen y qué patrón siguen sus nombres.
3. Para el nombre `www.sri.test.` indica cuántas etiquetas tiene, cuál es el dominio de primer nivel y por qué se escribe un punto al final (nombre completo o *FQDN*).
4. En la salida del apartado 1 señala una línea en la que un servidor **delega** el dominio en otros servidores y explica qué tipo de registro se usa para delegar.

## Pregunta 4 — Instalar y configurar el servidor *(1 punto)*

Trabaja en `ns1`, que será el servidor primario.

1. Instala el servicio: `sudo apt update && sudo apt install -y bind9 bind9-utils dnsutils`. Anota la versión que devuelve `named -v` y comprueba con `systemctl status bind9` que el servicio está activo.
2. Edita `/etc/bind/named.conf.options` y deja un único bloque `options` (y delante de él una `acl`) que cumpla todo esto:
   - una `acl` llamada `red_lab` con la red `192.168.56.0/24` y `localhost`;
   - el servidor escucha solo en `192.168.56.10` y `127.0.0.1` (`listen-on`) y no escucha en IPv6 (`listen-on-v6 { none; }`);
   - solo contestan consultas los equipos de `red_lab` (`allow-query`);
   - sin recursión (`recursion no`) y sin transferencias de zona (`allow-transfer { none; }`);
   - `dnssec-validation no` (solo para el laboratorio).

   Mantén la línea `directory "/var/cache/bind";`.
3. Comprueba la sintaxis con `sudo named-checkconf` (si no escribe nada, es correcta), reinicia con `sudo systemctl restart bind9` y ejecuta `sudo ss -lntup | grep named` para ver en qué direcciones y puertos escucha.
4. Quita a propósito un punto y coma de la configuración, ejecuta `sudo named-checkconf`, anota el mensaje de error y arréglalo.

## Pregunta 5 — Una zona nueva con sus registros *(1 punto)*

Sigue en `ns1`.

1. Crea la carpeta `/etc/bind/zones` y dentro el fichero `db.sri.test` con la zona **directa** de `sri.test`. Debe llevar una cabecera `$TTL 3600`, un registro `SOA` (responsable `admin.sri.test.` y número de serie con el formato `AAAAMMDDNN`, por ejemplo `2026111301`), dos registros `NS` (`ns1` y `ns2`) y todos los registros de la tabla de datos: `A`, `AAAA`, `CNAME`, `MX` y `TXT`.
2. Comprueba el fichero con `named-checkzone sri.test /etc/bind/zones/db.sri.test`.
3. Crea el fichero `db.192.168.56` con la zona **inversa** `56.168.192.in-addr.arpa`: mismo `SOA` y `NS`, y un registro `PTR` para cada dirección de la tabla de datos que tenga nombre `A` (`.10`, `.11`, `.12`, `.20` y `.25`). Compruébalo con `named-checkzone`.
4. Declara las dos zonas en `/etc/bind/named.conf.local` con `type primary;` y la ruta de su fichero. Ejecuta `sudo named-checkconf` y `sudo rndc reload`.
5. Verifica con `dig` y anota el resultado de cada consulta (usa `@192.168.56.10`): el registro `A` de `www`, el `CNAME` de `web`, el `MX` y el `TXT` de `sri.test`, el `AAAA` de `www`, la consulta inversa `-x 192.168.56.20` y un nombre que no existe (observa el estado `NXDOMAIN`).
6. En la respuesta del registro `A` de `www`, localiza la marca `aa` de la línea `flags` y explica qué significa.

## Pregunta 6 — Reenviar consultas a otros servidores *(1 punto)*

**Preparación.** En `ns3` instala el servicio: `sudo apt update && sudo apt install -y bind9 bind9-utils dnsutils`.

1. En `ns3`, deja `/etc/bind/named.conf.options` con: la misma `acl` `red_lab`; `listen-on` en `192.168.56.12` y `127.0.0.1`; `listen-on-v6 { none; }`; `allow-query { red_lab; }`; `recursion yes;` y `allow-recursion { red_lab; }`; `dnssec-validation no;`; y, como reenviadores para todo lo demás, `forwarders { 1.1.1.1; 8.8.8.8; };` con `forward only;`.
2. En `/etc/bind/named.conf.local` de `ns3` declara las zonas `sri.test` y `56.168.192.in-addr.arpa` como zonas de **reenvío** (`type forward;`, `forward only;`) hacia `192.168.56.10`. Así, las consultas internas van a `ns1` y el resto a Internet.
3. Comprueba la sintaxis y reinicia el servicio. Consulta `dig @192.168.56.12 www.sri.test` y `dig @192.168.56.12 www.example.org`. Anota la respuesta y las marcas de la línea `flags` de cada consulta.
4. Explica por qué la respuesta de `www.sri.test` que da `ns3` **no** lleva la marca `aa`, aunque la información venga de `ns1`. Explica también la diferencia entre `forward only` y `forward first`.

## Pregunta 7 — Almacenar y reutilizar las respuestas (caché) *(1 punto)*

Sigue en `ns3`.

1. Vacía la caché con `sudo rndc flush`. Ejecuta `dig @192.168.56.12 mail.sri.test +noall +answer`, espera tres segundos y repite el mismo comando. Anota los dos valores de TTL y explica por qué son distintos.
2. Vuelca la caché con `sudo rndc dumpdb -cache` y busca `mail.sri.test` en `/var/cache/bind/named_dump.db`. Copia la línea que encuentres.
3. Para `ns1` (`sudo systemctl stop bind9` en `ns1`). Desde `ns3` consulta `mail.sri.test` (ya está en caché) y `ftp.sri.test` (no está). Anota qué ocurre con cada una y explica la diferencia. Vuelve a arrancar `ns1`.
4. Explica en 2 o 3 líneas qué riesgo habría si `ns3` tuviera `recursion yes;` y **no** limitara `allow-recursion`.

## Pregunta 8 — Transferencia de zona entre dos servidores *(1 punto)*

**Preparación.** En `ns2` instala el servicio (`sudo apt update && sudo apt install -y bind9 bind9-utils dnsutils`). Déjale `/etc/bind/named.conf.options` igual que el de `ns1`, cambiando solo `listen-on` a `192.168.56.11` y `127.0.0.1`.

1. En `ns1` genera una clave TSIG para proteger las transferencias: `sudo tsig-keygen -a hmac-sha256 transfer-key | sudo tee /etc/bind/transfer.key`. Deja el fichero con `sudo chown root:bind /etc/bind/transfer.key` y `sudo chmod 640 /etc/bind/transfer.key`. Copia el **mismo** fichero a `ns2` (por ejemplo con `scp`) y aplícale los mismos permisos.
2. En `ns1`, en `named.conf.local`, añade `include "/etc/bind/transfer.key";` y, en las dos zonas, `notify yes;`, `also-notify { 192.168.56.11; };` y `allow-transfer { key transfer-key; };`. Ejecuta `sudo named-checkconf` y `sudo rndc reload`.
3. En `ns2`, en `named.conf.local`, añade `include "/etc/bind/transfer.key";`, la línea `server 192.168.56.10 { keys transfer-key; };` y las dos zonas con `type secondary;`, `primaries { 192.168.56.10; };` y `file "db.sri.test";` (para la inversa, `file "db.192.168.56";`). Reinicia el servicio.
4. Verifica en `ns2`: lista `/var/cache/bind` (deben aparecer los ficheros de las zonas), consulta `dig @192.168.56.11 www.sri.test` (con marca `aa`) y compara el número de serie con `dig @192.168.56.11 sri.test SOA +short` y `dig @192.168.56.10 sri.test SOA +short`.
5. Desde `ns2`, prueba una transferencia completa **sin clave**: `dig @192.168.56.10 sri.test AXFR`. Anota el resultado. Repítela **con** la clave: `dig @192.168.56.10 sri.test AXFR -y hmac-sha256:transfer-key:<secreto>` (el secreto está en `transfer.key`). No pegues el secreto en tus respuestas.
6. En `ns1`, cambia el registro `www` a `192.168.56.21`, **sube el número de serie en 1** y ejecuta `sudo rndc reload sri.test`. Comprueba en `ns2`, en unos segundos, que ya conoce la nueva dirección. Explica qué ocurriría si hubieras cambiado el registro sin subir el serial. Después devuelve `www` a `192.168.56.20` y sube otra vez el serial.
7. En `ns3`, añade `192.168.56.11` como segundo servidor de reenvío de las dos zonas internas (`forwarders { 192.168.56.10; 192.168.56.11; };`), reinicia y comprueba que `ns3` sigue resolviendo `www.sri.test`.

## Pregunta 9 — Direcciones IP dinámicas: DNS dinámico *(1 punto)*

Trabaja en `ns1`.

1. Genera una segunda clave: `sudo tsig-keygen -a hmac-sha256 ddns-key | sudo tee /etc/bind/ddns.key`, con los mismos permisos que la anterior, y añade `include "/etc/bind/ddns.key";` a `named.conf.local`.
2. Crea la zona dinámica `dinamico.sri.test` con el fichero `/var/lib/bind/db.dinamico.sri.test` (esa carpeta es la que `named` puede modificar). Contenido inicial: `$TTL 60`, un `SOA` con número de serie `1` y un registro `NS` hacia `ns1.sri.test.`. Decláralo en `named.conf.local` como `type primary;` con `allow-update { key ddns-key; };`. Ejecuta `named-checkzone` sobre el fichero, `sudo named-checkconf` y `sudo rndc reconfig`.
3. Con `nsupdate` y la clave (`nsupdate -k /etc/bind/ddns.key fichero.txt`), da de alta `pc1.dinamico.sri.test` con la dirección `192.168.56.77` y TTL 60. Un fichero de órdenes `nsupdate` tiene este aspecto (completa los puntos):

   ```text
   server 192.168.56.10
   zone dinamico.sri.test
   update add ... 60 A ...
   send
   ```

   Comprueba la respuesta con `dig @192.168.56.10 pc1.dinamico.sri.test +short`.
4. Simula que el equipo ha cambiado de dirección: borra el registro `A` de `pc1` y añade otro con `192.168.56.88` en la **misma** actualización. Comprueba el cambio con `dig`.
5. Intenta la misma actualización **sin** clave y anota el resultado.
6. Lista `/var/lib/bind` (aparece un fichero `.jnl`, el diario de cambios) y ejecuta `sudo rndc sync -clean dinamico.sri.test`. Abre el fichero de la zona y comprueba que ya contiene `pc1` con la dirección nueva. Explica en una línea por qué no se debe editar a mano una zona dinámica mientras el servidor está en marcha.

## Pregunta 10 — Documentación de lo que has hecho *(1 punto)*

Desde la carpeta de tu repositorio (mira el apartado «Cómo entregar el trabajo»), escribe un `README.md` que permita a otra persona repetir la práctica sin ayuda. Debe tener estos apartados:

1. **Esquema de red**: tabla con las tres máquinas, su dirección y su papel.
2. **Instalación**: comandos para instalar el servicio en cada máquina.
3. **Configuración**: por cada servidor, qué ficheros se han tocado y qué hace cada directiva importante (`listen-on`, `allow-query`, `recursion`, `forwarders`, `allow-transfer`, `allow-update`, `type primary/secondary/forward`).
4. **Verificación**: los comandos `dig` que demuestran que cada servicio funciona, con el resultado esperado.
5. **Seguridad**: qué protege la `acl`, qué protegen las claves TSIG y por qué las claves no se suben al repositorio.
6. **Problemas encontrados**: al menos dos errores que hayas tenido de verdad y cómo los resolviste.

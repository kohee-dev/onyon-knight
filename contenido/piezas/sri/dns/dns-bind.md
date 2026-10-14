---
titulo: "Implantación de DNS con BIND en Linux"
licencia: CC-BY-NC-SA-4.0
---

:::nota[Objetivo]
Montar un servidor DNS autoritativo y recursivo con [BIND](https://es.wikipedia.org/wiki/BIND) sobre Linux: una zona directa, su zona inversa, un servidor secundario y la comprobación de todo con `dig`. Se da por leída la teoría del servicio DNS.
:::

# Escenario de partida

| Elemento | Valor de ejemplo |
|---|---|
| Servidor primario | `ns1`, IP fija `192.168.10.2/24` |
| Servidor secundario | `ns2`, IP fija `192.168.10.3/24` |
| Dominio | `ejemplo.test` |
| Red | `192.168.10.0/24` |
| Clientes | 1 Linux y 1 Windows en la misma red |

:::aviso[No uses `.local` en Linux]
El sufijo `.local` está reservado para [mDNS](https://es.wikipedia.org/wiki/Multicast_DNS) y puede dar problemas de resolución en clientes Linux y macOS. Para pruebas se usan `.test`, `.example` o `.lan`.
:::

# Instalación

```bash
sudo apt update
sudo apt install bind9 bind9-utils dnsutils
```

| Paquete | Contenido |
|---|---|
| `bind9` | El servidor, que corre como servicio `named` |
| `bind9-utils` | Herramientas de comprobación (`named-checkconf`, `named-checkzone`) y `rndc` |
| `dnsutils` | Herramientas de consulta (`dig`, `nslookup`) |

:::nota[Ficheros de BIND en Debian y Ubuntu]
Todo está en `/etc/bind/`. `named.conf` solo incluye otros tres ficheros: `named.conf.options` (opciones globales), `named.conf.local` (tus zonas) y `named.conf.default-zones` (zonas por defecto). Se edita casi siempre `options` y `local`.
:::

# Opciones globales

Fichero `/etc/bind/named.conf.options`:

```
options {
    directory "/var/cache/bind";

    listen-on { 127.0.0.1; 192.168.10.2; };
    allow-query { localhost; 192.168.10.0/24; };

    recursion yes;
    allow-recursion { localhost; 192.168.10.0/24; };

    forwarders { 1.1.1.1; };
    dnssec-validation auto;
};
```

Qué hace cada línea:

| Opción | Para qué sirve |
|---|---|
| `listen-on` | Direcciones por las que escucha el servidor |
| `allow-query` | Quién puede hacer consultas |
| `recursion` y `allow-recursion` | Activa la recursión y la limita a la red propia. **Nunca abierta a Internet.** |
| `forwarders` | Recursivo al que se reenvía lo que no se sabe resolver. Sin él, el servidor consulta a la raíz directamente |
| `dnssec-validation` | Valida las firmas [DNSSEC](https://es.wikipedia.org/wiki/Domain_Name_System_Security_Extensions) de las respuestas |

:::tip[Reenviar o resolver desde la raíz]
Con forwarders se depende del recursivo elegido, pero se aprovecha su caché. Sin ellos BIND resuelve por sí mismo usando las *root hints* que trae incluidas. Ambas opciones son válidas.
:::

# Zona directa

Declarar la zona en `/etc/bind/named.conf.local`:

```
zone "ejemplo.test" {
    type primary;
    file "/etc/bind/zones/db.ejemplo.test";
    allow-transfer { 192.168.10.3; };
    also-notify { 192.168.10.3; };
};
```

Crear el directorio y el fichero de zona:

```bash
sudo mkdir /etc/bind/zones
sudo nano /etc/bind/zones/db.ejemplo.test
```

```
$TTL 1h
@       IN SOA  ns1.ejemplo.test. admin.ejemplo.test. (
                2026101201  ; serial (AAAAMMDDNN)
                3h          ; refresh
                1h          ; retry
                1w          ; expire
                1h )        ; minimum (caché negativa)

        IN NS   ns1.ejemplo.test.
        IN NS   ns2.ejemplo.test.
        IN MX   10 mail.ejemplo.test.

ns1     IN A    192.168.10.2
ns2     IN A    192.168.10.3
srv01   IN A    192.168.10.2
mail    IN A    192.168.10.4
www     IN CNAME srv01
```

:::aviso[Errores típicos del fichero de zona]
- **Olvidar el punto final** en un nombre completo: `ns1.ejemplo.test` sin punto se interpreta como `ns1.ejemplo.test.ejemplo.test.`.
- **No incrementar el serial** tras un cambio: los secundarios no se enteran.
- Poner un `CNAME` en el nombre donde ya existe otro registro.
- Apuntar un `NS` o un `MX` a un `CNAME` o a una IP.
:::

:::nota[Formato del serial]
`AAAAMMDDNN` (año, mes, día y número de cambio en el día) es una convención. Solo importa que **siempre crezca**.
:::

# Zona inversa

Para `192.168.10.0/24` la zona es `10.168.192.in-addr.arpa`.

```
zone "10.168.192.in-addr.arpa" {
    type primary;
    file "/etc/bind/zones/db.192.168.10";
    allow-transfer { 192.168.10.3; };
    also-notify { 192.168.10.3; };
};
```

Fichero `/etc/bind/zones/db.192.168.10`:

```
$TTL 1h
@       IN SOA  ns1.ejemplo.test. admin.ejemplo.test. (
                2026101201 3h 1h 1w 1h )

        IN NS   ns1.ejemplo.test.
        IN NS   ns2.ejemplo.test.

2       IN PTR  ns1.ejemplo.test.
3       IN PTR  ns2.ejemplo.test.
4       IN PTR  mail.ejemplo.test.
```

Los nombres de la izquierda son solo el **último octeto**, porque el resto lo aporta el nombre de la zona.

# Comprobar antes de arrancar

BIND valida la configuración y las zonas sin necesidad de reiniciar el servicio:

```bash
sudo named-checkconf
sudo named-checkzone ejemplo.test /etc/bind/zones/db.ejemplo.test
sudo named-checkzone 10.168.192.in-addr.arpa /etc/bind/zones/db.192.168.10
```

Si todo está bien, `named-checkzone` responde `OK` con el serial cargado. Entonces:

```bash
sudo systemctl restart named
sudo systemctl status named
```

Para cambios posteriores no hace falta reiniciar: tras editar una zona y subir el serial, `sudo rndc reload`.

:::tip[Registro del servicio]
`journalctl -u named -f` muestra en tiempo real si carga las zonas y si hay errores.
:::

# Servidor secundario

En `ns2`, instalar BIND igual y declarar la zona como secundaria en `named.conf.local`:

```
zone "ejemplo.test" {
    type secondary;
    primaries { 192.168.10.2; };
    file "/var/cache/bind/db.ejemplo.test";
};
```

Se hace igual con la zona inversa. El secundario **no se edita**: recibe la zona del primario por [transferencia](https://en.wikipedia.org/wiki/DNS_zone_transfer) y la guarda en `/var/cache/bind`, directorio donde `named` tiene permiso de escritura.

:::nota[Por qué no en `/etc/bind`]
El servicio corre con un usuario sin privilegios y, en Ubuntu, [AppArmor](https://es.wikipedia.org/wiki/AppArmor) restringe a dónde puede escribir. Los datos que BIND genera por sí mismo van a `/var/cache/bind`.
:::

# Cortafuegos

DNS usa el puerto 53 en **UDP y en TCP** (las transferencias y las respuestas grandes van por TCP).

```bash
sudo ufw allow 53
```

# Cliente y verificación

Configurar el DNS de un cliente Linux (con `resolvectl` o en el netplan) apuntando a `192.168.10.2` y comprobar:

```bash
dig @192.168.10.2 www.ejemplo.test          # A, siguiendo el CNAME
dig @192.168.10.2 ejemplo.test MX
dig @192.168.10.2 -x 192.168.10.4           # resolución inversa
dig @192.168.10.2 ejemplo.test SOA          # mira el serial
dig @192.168.10.3 ejemplo.test SOA          # el secundario debe tener el mismo
dig @192.168.10.2 ejemplo.test AXFR         # transferencia (solo desde ns2)
dig @192.168.10.2 www.ejemplo.test +norecurse
```

Qué mirar en la respuesta:

- Bandera **`aa`** en las consultas a servidores autoritativos de su zona.
- Bandera **`ra`** cuando el servidor ofrece recursión.
- Estado `NOERROR`, `NXDOMAIN` o `REFUSED`.
- El **TTL** de la respuesta, que baja en consultas sucesivas cuando viene de caché.

:::aviso[`REFUSED` en la transferencia]
Es el comportamiento correcto si se pide `AXFR` desde un equipo que no está en `allow-transfer`. Pruébalo desde el cliente y desde `ns2`.
:::

# Cómo funciona por dentro

- **`named`** carga las zonas en memoria al arrancar; los ficheros son solo la fuente.
- **`rndc`** controla el servicio en caliente: `reload`, `flush` (vacía la caché), `status`, `zonestatus ejemplo.test`.
- El primario envía **`NOTIFY`** al secundario cuando recarga la zona. Si se pierde, el secundario consulta el SOA cada `refresh`.
- Si el serial del primario es mayor, el secundario pide `IXFR` (solo diferencias) o `AXFR` (completa).

:::nota[Actualización dinámica]
BIND admite `allow-update` para que un cliente (por ejemplo, un servidor DHCP) añada y borre registros sin editar el fichero a mano. Hay que protegerlo con una clave TSIG; no se abre nunca a toda la red.
:::

# Ejercicios

:::ejercicio[1. Un error buscado]
Quita un punto final de un `NS` y pasa `named-checkzone`. ¿Qué dice? Corrígelo.
:::

:::ejercicio[2. Serial]
Cambia un registro **sin** subir el serial, recarga y consulta el secundario. Repite subiendo el serial y compara.
:::

:::ejercicio[3. Caché y TTL]
Consulta dos veces seguidas un nombre que BIND resuelva por reenvío y observa cómo baja el TTL. Después, `rndc flush` y repite.
:::

:::ejercicio[4. Recursión]
Quita `allow-recursion` o cambia la red permitida, y comprueba desde el cliente qué respuesta da el servidor.
:::

:::ejercicio[5. Caída del primario]
Para `named` en `ns1` y comprueba que `ns2` sigue respondiendo. ¿Hasta cuándo, según los parámetros del SOA?
:::

:::ejercicio[6. Delegación]
Crea el subdominio `aula.ejemplo.test` como zona independiente delegada en otro servidor, con su registro `glue`.
:::

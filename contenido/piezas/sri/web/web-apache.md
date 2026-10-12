---
titulo: "Implantación de un servidor web con Apache en Linux"
licencia: CC-BY-NC-SA-4.0
---

:::nota[Objetivo]
Instalar [Apache HTTP Server](https://es.wikipedia.org/wiki/Servidor_HTTP_Apache) en Linux, alojar dos sitios con hosts virtuales por nombre, activar HTTPS con un certificado autofirmado y proteger una zona con contraseña. Se da por leída la teoría de servidores web y se reutiliza la zona DNS de la práctica de BIND.
:::

# Escenario de partida

| Elemento | Valor de ejemplo |
|---|---|
| Servidor | `srv01`, IP fija `192.168.10.2/24` (Debian o Ubuntu) |
| Dominio | `ejemplo.test`, resuelto por el BIND de la práctica anterior |
| Sitio 1 | `www.ejemplo.test` |
| Sitio 2 | `intranet.ejemplo.test` |
| Clientes | 1 Linux y 1 Windows con su DNS apuntando a `192.168.10.2` |

:::ejercicio[Preparar el DNS]
Añade `intranet` como `CNAME` de `srv01` en la zona `ejemplo.test`, sube el serial y recarga. Comprueba con `dig` que `www` e `intranet` resuelven a la misma IP.
:::

:::nota[Debian y Ubuntu frente a Red Hat]
Aquí se usan las rutas de Debian y Ubuntu (paquete `apache2`, carpeta `/etc/apache2`). En Red Hat y derivados el servicio se llama `httpd`, la carpeta es `/etc/httpd` y no existen `a2ensite` ni `a2enmod`. Los conceptos son los mismos.
:::

# 1. Instalación

```bash
sudo apt update
sudo apt install apache2
sudo systemctl status apache2
```

Al instalar, el servicio `apache2` se crea y arranca solo. Desde un cliente abre `http://192.168.10.2`: aparece la página por defecto, servida desde `/var/www/html`.

:::aviso[Si no responde]
Si el servidor tiene `ufw` activo, permite el tráfico web con `sudo ufw allow "Apache Full"` (puertos 80 y 443).
:::

# 2. Estructura de la configuración

Apache en Debian reparte su configuración en `/etc/apache2`. Cada pieza se escribe en una carpeta `*-available` y se **activa** con un comando que crea un enlace en la carpeta `*-enabled`, que es lo que Apache lee.

| Ruta | Contenido | Se activa con |
|---|---|---|
| `apache2.conf` | Configuración principal | (siempre cargada) |
| `sites-available/` | Un fichero por sitio | `a2ensite` |
| `mods-available/` | Módulos | `a2enmod` |

Así se puede apagar un sitio sin borrar su fichero. El servicio corre con el usuario `www-data`, sin privilegios.

# 3. Dos hosts virtuales

Crea la raíz de cada sitio y una página de prueba:

```bash
sudo mkdir /var/www/www.ejemplo.test
sudo mkdir /var/www/intranet.ejemplo.test
sudo nano /var/www/www.ejemplo.test/index.html
sudo nano /var/www/intranet.ejemplo.test/index.html
```

Con `<h1>Sitio público</h1>` y `<h1>Intranet</h1>` como contenido. Fichero del primer sitio:

```bash
sudo nano /etc/apache2/sites-available/www.ejemplo.test.conf
```

```apache
<VirtualHost *:80>
    ServerName www.ejemplo.test
    DocumentRoot /var/www/www.ejemplo.test
</VirtualHost>
```

| Línea | Significado |
|---|---|
| `<VirtualHost *:80>` | Host virtual que atiende el puerto 80 por cualquier IP del servidor |
| `ServerName` | Nombre que debe traer la petición (cabecera `Host`) para que responda este sitio |
| `DocumentRoot` | **Raíz de documentos**: carpeta de la que se sirven los ficheros |

Crea `intranet.ejemplo.test.conf` igual, cambiando `ServerName` y `DocumentRoot`. Después, actívalos:

```bash
sudo a2ensite www.ejemplo.test.conf
sudo a2ensite intranet.ejemplo.test.conf
```

- `a2ensite`: *Apache 2 enable site*. Crea el enlace del fichero en `sites-enabled`, que es lo que Apache lee.
- Se indica un sitio por comando.

```bash
sudo apache2ctl configtest
sudo systemctl reload apache2
```

- `apache2ctl configtest`: revisa la configuración sin tocar el servicio en marcha. Debe responder `Syntax OK`; si no, indica fichero y línea.
- `reload`: Apache vuelve a leer la configuración **sin cortar** las conexiones en curso. `restart` las cortaría.

Prueba `http://www.ejemplo.test` y `http://intranet.ejemplo.test`.

:::nota[El sitio por defecto]
Si llega una petición con un nombre que no coincide con ningún `ServerName` (por ejemplo, por IP), responde el **primer** sitio que Apache carga, y los ficheros se leen por orden alfabético. Por eso el sitio de fábrica se llama `000-default.conf`. Pruébalo con `curl http://192.168.10.2`.
:::

# 4. HTTPS

## Certificado autofirmado

```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/www.key -out /etc/ssl/certs/www.crt
```

| Parte | Significado |
|---|---|
| `req -x509` | En lugar de una solicitud para una CA, crea directamente un certificado **autofirmado** |
| `-nodes` | La clave privada no lleva contraseña (así Apache arranca sin pedirla) |
| `-days 365` | Validez de un año |
| `-newkey rsa:2048` | Crea una clave nueva RSA de 2048 bits |
| `-keyout` | Dónde guarda la **clave privada**, que nunca sale del servidor |
| `-out` | Dónde guarda el **certificado** |

Responde Enter a todas las preguntas salvo `Common Name`, donde escribes `www.ejemplo.test`. Como nadie de confianza lo ha firmado, los clientes mostrarán un aviso.

## Módulo SSL

```bash
sudo a2enmod ssl
sudo systemctl restart apache2
```

- `a2enmod`: *Apache 2 enable module*. Activa un módulo. `ssl` da soporte a TLS; sin él, Apache no entiende `SSLEngine`.
- Al activar un módulo hace falta `restart`, no basta con `reload`.

## Host virtual seguro

Edita `www.ejemplo.test.conf` y déjalo así:

```apache
<VirtualHost *:80>
    ServerName www.ejemplo.test
    Redirect permanent / https://www.ejemplo.test/
</VirtualHost>

<VirtualHost *:443>
    ServerName www.ejemplo.test
    DocumentRoot /var/www/www.ejemplo.test
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/www.crt
    SSLCertificateKeyFile /etc/ssl/private/www.key
</VirtualHost>
```

| Línea | Significado |
|---|---|
| `Redirect permanent` | Responde `301` y manda al cliente a la versión HTTPS |
| `<VirtualHost *:443>` | Host virtual para HTTPS |
| `SSLEngine on` | Activa TLS en este host virtual |
| `SSLCertificateFile` y `SSLCertificateKeyFile` | Certificado y clave privada |

```bash
sudo apache2ctl configtest
sudo systemctl reload apache2
```

# 5. Contraseña en una zona

```bash
sudo apt install apache2-utils
sudo htpasswd -c /etc/apache2/.htpasswd ana
```

- `htpasswd`: gestiona un fichero de usuarios con las contraseñas cifradas.
- `-c`: crea el fichero. **Solo la primera vez**: si se repite, lo borra y empieza otro.

En `intranet.ejemplo.test.conf`, dentro del `<VirtualHost>`:

```apache
    <Directory /var/www/intranet.ejemplo.test>
        AuthType Basic
        AuthName "Zona restringida"
        AuthUserFile /etc/apache2/.htpasswd
        Require valid-user
    </Directory>
```

| Línea | Significado |
|---|---|
| `<Directory>` | Las reglas se aplican a esa carpeta |
| `AuthType Basic` | El navegador pide usuario y contraseña |
| `AuthName` | Texto de la ventana de acceso |
| `AuthUserFile` | Fichero de usuarios |
| `Require valid-user` | Basta con ser un usuario válido del fichero |

```bash
sudo apache2ctl configtest
sudo systemctl reload apache2
```

:::aviso[La autenticación básica no cifra]
Envía las credenciales en Base64, que es reversible. Solo es aceptable **sobre HTTPS**, así que la intranet también debe servirse por TLS (ejercicio 3).
:::

# 6. Verificación

```bash
curl -I http://www.ejemplo.test
curl -k https://www.ejemplo.test
curl -k -u ana https://intranet.ejemplo.test
```

- La primera debe dar `301` con la cabecera `Location` hacia HTTPS.
- `-k` ignora el error de certificado: solo se usa en pruebas.
- Sin `-u`, la intranet responde `401 Unauthorized`.

Registros, en `/var/log/apache2/`: `access.log` (una línea por petición) y `error.log`. Se siguen en directo con `sudo tail -f`.

# 7. Cómo funciona por dentro

- **Elección del sitio**: Apache mira IP y puerto y después compara el `Host` con los `ServerName`. Si no hay coincidencia, responde el primero.
- **MPM**: módulo de multiprocesamiento con el que Apache atiende las conexiones. Se ve con `apache2ctl -V` en la línea `Server MPM`; suele ser `event`.
- **Módulos**: casi todo en Apache es un módulo. `apache2ctl -M` lista los cargados.
- **`.htaccess`**: configuración dentro de las carpetas del sitio. Apache lo lee en cada petición, lo que lo hace más lento. Está desactivado mientras `AllowOverride` no lo permita.

# Ejercicios

:::ejercicio[1. Sitio por defecto]
Haz una petición por IP y otra con un nombre que no existe pero resuelve a `srv01`. ¿Qué sitio responde? Haz que responda una página de «sitio no encontrado».
:::

:::ejercicio[2. Un `403` y un `404`]
Provócalos a propósito: un `404` pidiendo un fichero inexistente y un `403` quitando permisos a un fichero (`sudo chmod 000 fichero`). Localiza cada uno en `access.log` y `error.log`.
:::

:::ejercicio[3. HTTPS en la intranet]
Crea otro certificado para `intranet.ejemplo.test` y sirve esa zona por HTTPS. Comprueba que los dos sitios, en la misma IP, presentan certificados distintos.
:::

:::ejercicio[4. Confiar en el certificado]
Importa el certificado en el cliente como autoridad de confianza y comprueba que el aviso desaparece. ¿Por qué esto no se hace en Internet?
:::

:::ejercicio[5. Listado de directorios]
Crea una carpeta sin `index.html` dentro de un sitio y accede a ella. Añade `Options -Indexes` en un `<Directory>` y vuelve a probar.
:::

:::ejercicio[6. Ocultar la versión]
Compara la cabecera `Server` antes y después de poner `ServerTokens Prod` en `/etc/apache2/conf-available/security.conf`.
:::

:::ejercicio[7. Carga]
Ejecuta `ab -n 1000 -c 50 http://www.ejemplo.test/` (`-n` son las peticiones totales y `-c` las simultáneas) y anota las peticiones por segundo para compararlas con nginx.
:::

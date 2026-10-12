---
titulo: "Implantación de un servidor web con nginx en Linux"
licencia: CC-BY-NC-SA-4.0
---

:::nota[Objetivo]
Instalar [nginx](https://es.wikipedia.org/wiki/Nginx) en Linux, alojar dos sitios por nombre, activar HTTPS, proteger una zona con contraseña y usarlo como **proxy inverso** delante de otra aplicación. Se da por hecha la práctica de Apache: aquí se repite el mismo recorrido para poder comparar ambos servidores.
:::

# Escenario de partida

| Elemento | Valor de ejemplo |
|---|---|
| Servidor | `srv01`, IP fija `192.168.10.2/24` (Debian o Ubuntu) |
| Dominio | `ejemplo.test`, resuelto por el BIND de la práctica anterior |
| Sitios | `www.ejemplo.test` e `intranet.ejemplo.test` |
| Aplicación para el proxy | `app.ejemplo.test` (apartado 6) |

:::aviso[Apache y nginx no pueden usar el mismo puerto]
Si Apache sigue activo en la misma máquina, ocupa los puertos 80 y 443. Antes de empezar: `sudo systemctl stop apache2`, y `sudo systemctl disable apache2` para que no arranque solo.
:::

:::ejercicio[Preparar el DNS]
Añade `app` como `CNAME` de `srv01` en la zona `ejemplo.test`, sube el serial y recarga.
:::

# 1. Instalación

```bash
sudo apt update
sudo apt install nginx
sudo systemctl status nginx
```

Abre `http://192.168.10.2`: aparece la página de bienvenida de nginx, servida desde `/var/www/html`.

# 2. Estructura de la configuración

| Ruta | Contenido |
|---|---|
| `/etc/nginx/nginx.conf` | Configuración principal. Incluye al resto |
| `/etc/nginx/conf.d/` | Un fichero `.conf` por sitio. **Es donde trabajaremos** |
| `/etc/nginx/sites-available/` y `sites-enabled/` | Estilo de Debian, parecido al de Apache. Aquí no se usa para simplificar |

:::nota[Diferencias con Apache]
No hay `a2ensite` ni `a2enmod`: un sitio queda activo con solo dejar su fichero en `conf.d`. Tampoco hay `.htaccess`: toda la configuración está centralizada.
:::

La configuración de nginx se escribe en **bloques** con llaves. Cada sitio es un bloque `server`, y **cada directiva acaba en punto y coma**.

# 3. Dos sitios por nombre

```bash
sudo mkdir /var/www/www.ejemplo.test
sudo mkdir /var/www/intranet.ejemplo.test
sudo nano /var/www/www.ejemplo.test/index.html
sudo nano /var/www/intranet.ejemplo.test/index.html
```

Con `<h1>Sitio público</h1>` y `<h1>Intranet</h1>` como contenido. Fichero del primer sitio:

```bash
sudo nano /etc/nginx/conf.d/www.ejemplo.test.conf
```

```nginx
server {
    listen 80;
    server_name www.ejemplo.test;
    root /var/www/www.ejemplo.test;
    index index.html;
}
```

| Línea | Significado |
|---|---|
| `server { }` | Un sitio (equivale al `VirtualHost` de Apache) |
| `listen` | Puerto en el que escucha |
| `server_name` | Nombre que debe traer la petición para que responda este sitio |
| `root` | Carpeta de la que se sirven los ficheros |
| `index` | Fichero que se sirve cuando se pide una carpeta |

Crea `intranet.ejemplo.test.conf` igual, cambiando `server_name` y `root`.

```bash
sudo nginx -t
sudo systemctl reload nginx
```

- `nginx -t`: *test*. Revisa la configuración sin tocar el servicio. Debe decir `syntax is ok` y `test is successful`.
- `reload`: vuelve a leer la configuración sin cortar las conexiones en curso.

:::nota[El sitio por defecto]
Cuando ningún `server_name` coincide, nginx usa el servidor marcado como `default_server` en `listen` o, si no hay ninguno, el primero que cargó. En Debian, el sitio de fábrica es `/etc/nginx/sites-enabled/default` con `listen 80 default_server`. Pruébalo con `curl http://192.168.10.2`.
:::

# 4. HTTPS

## Certificado autofirmado

```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/www.key -out /etc/ssl/certs/www.crt
```

Es el mismo comando que en Apache (`-x509` autofirmado, `-nodes` sin contraseña en la clave, `-keyout` clave privada, `-out` certificado). En `Common Name` escribe `www.ejemplo.test`. Si ya lo hiciste con Apache, puedes reutilizar los mismos ficheros.

## Bloque HTTPS y redirección

Edita `www.ejemplo.test.conf`:

```nginx
server {
    listen 80;
    server_name www.ejemplo.test;
    return 301 https://www.ejemplo.test$request_uri;
}

server {
    listen 443 ssl;
    server_name www.ejemplo.test;
    root /var/www/www.ejemplo.test;
    index index.html;

    ssl_certificate /etc/ssl/certs/www.crt;
    ssl_certificate_key /etc/ssl/private/www.key;
}
```

| Línea | Significado |
|---|---|
| `return 301 ...$request_uri;` | Redirección permanente a HTTPS. `$request_uri` es una variable con la ruta pedida, para conservarla |
| `listen 443 ssl;` | Escucha en el 443 con TLS. nginx no necesita activar ningún módulo aparte |
| `ssl_certificate` | Ruta del certificado |
| `ssl_certificate_key` | Ruta de la clave privada |

```bash
sudo nginx -t
sudo systemctl reload nginx
```

# 5. Contraseña en una zona

```bash
sudo apt install apache2-utils
sudo htpasswd -c /etc/nginx/.htpasswd ana
```

nginx no trae `htpasswd`, así que se instala el paquete de utilidades de Apache solo para esa herramienta. `-c` crea el fichero (**solo la primera vez**). En el bloque `server` de `intranet.ejemplo.test.conf`:

```nginx
    auth_basic "Zona restringida";
    auth_basic_user_file /etc/nginx/.htpasswd;
```

| Línea | Significado |
|---|---|
| `auth_basic` | Activa la autenticación básica; el texto aparece en la ventana de acceso |
| `auth_basic_user_file` | Fichero de usuarios |

```bash
sudo nginx -t
sudo systemctl reload nginx
```

:::aviso[La autenticación básica no cifra]
Solo es aceptable sobre HTTPS. Sirve la intranet también por TLS (ejercicio 3).
:::

# 6. Proxy inverso

Un [proxy inverso](https://en.wikipedia.org/wiki/Reverse_proxy) recibe las peticiones de los clientes y las reenvía a otro servidor. Aquí, nginx atenderá a `app.ejemplo.test` y se la pasará a una aplicación que corre en el puerto 8080 de la misma máquina.

## La «aplicación»

En una **segunda terminal**:

```bash
mkdir ~/app
echo "Hola desde la aplicación" > ~/app/index.html
cd ~/app
python3 -m http.server 8080
```

`python3 -m http.server` es el servidor web mínimo de Python: sirve la carpeta actual en el puerto indicado. Déjalo abierto. Desde la primera terminal comprueba `curl http://127.0.0.1:8080`.

## nginx como proxy

```bash
sudo nano /etc/nginx/conf.d/app.ejemplo.test.conf
```

```nginx
server {
    listen 80;
    server_name app.ejemplo.test;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

| Línea | Significado |
|---|---|
| `location / { }` | Reglas para las peticiones cuya ruta empieza por `/`, es decir, todas |
| `proxy_pass` | A dónde se reenvía la petición |
| `proxy_set_header Host $host;` | Pasa a la aplicación el nombre que pidió el cliente |
| `proxy_set_header X-Real-IP $remote_addr;` | Le pasa la IP real del cliente; si no, vería siempre la de nginx |

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Visita `http://app.ejemplo.test`: ves la aplicación servida **a través** de nginx. El cliente no sabe que existe el puerto 8080.

:::nota[Para qué sirve]
La aplicación queda oculta en la red interna, nginx puede encargarse del HTTPS por ella y delante de ella se pueden poner varias instancias para repartir la carga (ejercicio 6).
:::

# 7. Verificación

```bash
curl -I http://www.ejemplo.test
curl -k https://www.ejemplo.test
curl -I http://app.ejemplo.test
```

- La primera debe dar `301` con `Location` hacia HTTPS.
- `-k` ignora el error del certificado autofirmado: solo en pruebas.
- Observa la cabecera `Server`: dice `nginx` con su versión.

Registros en `/var/log/nginx/`: `access.log` y `error.log`.

# 8. Cómo funciona por dentro

- **Arquitectura por eventos**: un proceso *master* lee la configuración y varios procesos *worker* atienden miles de conexiones a la vez sin bloquearse en ninguna. Se ven con `systemctl status nginx`.
- **Elección del sitio**: primero por IP y puerto (`listen`), luego por `server_name`. Si no coincide, `default_server`.
- **`location`**: dentro de un sitio, decide qué hacer según la ruta de la URL: servir ficheros, reenviar a una aplicación, denegar…
- **Sin `.htaccess`**: nginx no lee configuración dentro de las carpetas del sitio. Es más rápido, pero obliga a recargar la configuración central.

# 9. Comparativa con Apache

| Concepto | Apache | nginx |
|---|---|---|
| Un sitio | `<VirtualHost>` | `server { }` |
| Nombre del sitio | `ServerName` | `server_name` |
| Raíz | `DocumentRoot` | `root` |
| Activar un sitio | `a2ensite` | Poner el fichero en `conf.d` |
| Activar un módulo | `a2enmod` | No hace falta para lo básico |
| Probar la configuración | `apache2ctl configtest` | `nginx -t` |
| TLS | Módulo `ssl` + `SSLEngine on` | `listen 443 ssl;` |
| Contraseña | `AuthType Basic` + `AuthUserFile` | `auth_basic` + `auth_basic_user_file` |
| Configuración por carpeta | `.htaccess` | No existe |
| Modelo de conexiones | Procesos/hilos (MPM) | Eventos |

# Ejercicios

:::ejercicio[1. Un `502`]
Con el proxy funcionando, para la aplicación (`Ctrl+C` en la otra terminal) y visita `app.ejemplo.test`. ¿Qué código aparece? Busca la causa en `error.log` y vuelve a arrancarla.
:::

:::ejercicio[2. Sitio por defecto]
Haz una petición por IP y otra con un nombre desconocido. Haz que no se sirva ningún sitio real, devolviendo `return 444;` (cierra la conexión sin responder).
:::

:::ejercicio[3. HTTPS en la intranet]
Sirve la intranet por HTTPS con su propio certificado y comprueba que cada sitio presenta el suyo.
:::

:::ejercicio[4. Ocultar la versión]
En `/etc/nginx/nginx.conf`, descomenta `server_tokens off;` dentro del bloque `http`. Recarga y compara la cabecera `Server`.
:::

:::ejercicio[5. Comparar rendimiento]
Ejecuta `ab -n 1000 -c 50 http://www.ejemplo.test/` con nginx (y Apache parado) y compáralo con lo anotado en la práctica de Apache. Para que sea justo, usa en ambos HTTP o en ambos HTTPS.
:::

:::ejercicio[6. Repartir carga (opcional)]
Arranca una segunda aplicación en el puerto 8081, define un bloque `upstream` con ambos servidores y apunta `proxy_pass` a él. Comprueba cómo se reparten las peticiones.
:::

:::ejercicio[7. Registros propios]
Haz que `www.ejemplo.test` guarde sus registros en ficheros propios con `access_log` y `error_log`.
:::

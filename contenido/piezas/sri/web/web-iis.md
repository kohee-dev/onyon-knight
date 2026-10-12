---
titulo: "Implantación de un servidor web con IIS en Windows Server"
licencia: CC-BY-NC-SA-4.0
---

:::nota[Objetivo]
Instalar [IIS](https://es.wikipedia.org/wiki/Internet_Information_Services) (*Internet Information Services*), el servidor web de Windows Server, alojar dos sitios por nombre, activar HTTPS con un certificado autofirmado y proteger una zona con autenticación de Windows. Se da por hecha la teoría de servidores web y se reutiliza el dominio de las prácticas de DNS y DHCP en Windows.
:::

# Escenario de partida

| Elemento | Valor de ejemplo |
|---|---|
| Servidor | `srv01`, IP fija `192.168.10.2/24` (Windows Server) |
| Dominio | `ejemplo.local`, resuelto por el DNS de Windows de la práctica anterior |
| Sitio 1 | `www.ejemplo.local` |
| Sitio 2 | `intranet.ejemplo.local` |
| Clientes | 1 Windows y 1 Linux con su DNS apuntando a `192.168.10.2` |

:::ejercicio[Preparar el DNS]
Comprueba que `www` existe como `CNAME` de `srv01` en la zona `ejemplo.local` y añade `intranet` igual. Verifica con `Resolve-DnsName`.
:::

:::nota[Apache, nginx e IIS]
Si en la misma máquina hay otro servidor web escuchando en los puertos 80 o 443, IIS no podrá arrancar sus sitios. Aquí se asume una máquina Windows sin ellos.
:::

# 1. Conceptos propios de IIS

| Concepto | Qué es | Equivalente en Apache |
|---|---|---|
| **Sitio** (*site*) | Un sitio web con su carpeta, sus enlaces y su configuración | `VirtualHost` |
| **Enlace** (*binding*) | Combinación de protocolo, IP, puerto y nombre de host por la que un sitio recibe peticiones | `ServerName` + `<VirtualHost *:80>` |
| **Grupo de aplicaciones** (*application pool*) | Proceso de trabajo (`w3wp.exe`) que ejecuta las aplicaciones de uno o varios sitios, con su propia identidad | No tiene equivalente directo |
| **Módulos** | Piezas que dan funciones al servidor (autenticación, compresión, redirección…). Se instalan como características de Windows | Módulos (`a2enmod`) |
| **`web.config`** | Fichero XML de configuración que puede estar en la carpeta de un sitio | `.htaccess` |

Los grupos de aplicaciones aíslan los sitios: si el de uno falla o se bloquea, los demás siguen funcionando. Cada uno corre con una identidad sin privilegios (`IIS AppPool\nombre`).

# 2. Instalación

```powershell
Install-WindowsFeature Web-Server -IncludeManagementTools
Get-Service W3SVC
```

- `Web-Server` es la característica que instala el rol IIS con los módulos mínimos.
- `W3SVC` es el servicio *World Wide Web Publishing Service*, el que atiende las peticiones.

Abre `http://192.168.10.2` desde un cliente: aparece la página por defecto de IIS, del sitio `Default Web Site` cuya carpeta es `C:\inetpub\wwwroot`.

La consola de administración se abre con `inetmgr`. Para trabajar con IIS desde PowerShell:

```powershell
Import-Module WebAdministration
```

:::tip[Consola y PowerShell]
Todo lo que se hace aquí con comandos se puede ver y hacer también en `inetmgr`. Conviene abrirla tras cada paso para comprobar qué ha cambiado.
:::

# 3. Dos sitios por nombre

Crea las carpetas y las páginas:

```powershell
New-Item -ItemType Directory -Path C:\sitios\www
New-Item -ItemType Directory -Path C:\sitios\intranet
Set-Content C:\sitios\www\index.html "<h1>Sitio público</h1>"
Set-Content C:\sitios\intranet\index.html "<h1>Intranet</h1>"
```

Crea los sitios:

```powershell
New-Website -Name "www" -PhysicalPath C:\sitios\www -Port 80 -HostHeader www.ejemplo.local
New-Website -Name "intranet" -PhysicalPath C:\sitios\intranet -Port 80 -HostHeader intranet.ejemplo.local
```

| Parámetro | Significado |
|---|---|
| `-Name` | Nombre del sitio dentro de IIS (no tiene que ser el del dominio) |
| `-PhysicalPath` | Carpeta de la que se sirven los ficheros (la **raíz** del sitio) |
| `-Port` | Puerto del enlace |
| `-HostHeader` | Nombre que debe traer la petición (cabecera `Host`). Es lo que distingue un sitio de otro en el mismo puerto |

Comprueba el resultado:

```powershell
Get-Website
Get-WebBinding
```

`Get-Website` lista los sitios con su estado y ruta; `Get-WebBinding` muestra todos los enlaces. Prueba `http://www.ejemplo.local` y `http://intranet.ejemplo.local` desde un cliente.

:::nota[El sitio por defecto]
`Default Web Site` tiene un enlace al puerto 80 **sin nombre de host**, lo que significa «cualquier nombre». IIS elige siempre el enlace más específico: las peticiones a `www.ejemplo.local` van al sitio `www`, y las que llegan por IP o con un nombre desconocido caen en `Default Web Site`. Pruébalo con `curl.exe http://192.168.10.2`.
:::

:::aviso[En PowerShell, `curl` no es curl]
En Windows PowerShell, `curl` es un alias de `Invoke-WebRequest`. Para usar la herramienta de verdad hay que escribir `curl.exe`.
:::

## Grupos de aplicaciones

Cada sitio nuevo crea su propio grupo con el nombre del sitio. Compruébalo:

```powershell
Get-IISAppPool
```

Verás `www`, `intranet` y `DefaultAppPool` con estado `Started`.

:::aviso[Permisos de carpeta]
Si un sitio responde `401.3` o `403`, el problema suele ser de permisos NTFS: la carpeta debe ser legible por el usuario anónimo de IIS (`IUSR`) y por el grupo `IIS_IUSRS`. Las carpetas creadas bajo `C:\inetpub` ya los heredan; las de otras ubicaciones, a veces, no.
:::

# 4. HTTPS

## Certificado autofirmado

```powershell
$cert = New-SelfSignedCertificate -DnsName www.ejemplo.local -CertStoreLocation Cert:\LocalMachine\My
```

- `New-SelfSignedCertificate` crea clave y certificado de una vez y los guarda directamente en el **almacén de certificados** de la máquina.
- `-DnsName` es el nombre del sitio. Incluye ya el `subjectAltName`, que los navegadores modernos exigen.
- `Cert:\LocalMachine\My` es el almacén «Personal» del equipo, el que IIS consulta. Se ve también en `certlm.msc`.
- Se guarda el resultado en `$cert` para usar su huella en el siguiente paso.

## Enlace HTTPS

```powershell
New-WebBinding -Name "www" -Protocol https -Port 443 -HostHeader www.ejemplo.local -SslFlags 1
(Get-WebBinding -Name "www" -Protocol https).AddSslCertificate($cert.Thumbprint, "My")
```

| Elemento | Significado |
|---|---|
| `-Protocol https -Port 443` | Nuevo enlace seguro para el sitio |
| `-SslFlags 1` | Activa **SNI**: IIS elige el certificado según el nombre que pide el cliente, lo que permite varios sitios HTTPS en la misma IP |
| `AddSslCertificate` | Asocia el certificado al enlace mediante su **huella** (`Thumbprint`), que identifica de forma única al certificado |
| `"My"` | Almacén donde está el certificado |

Prueba `https://www.ejemplo.local` en un navegador: aparecerá el aviso de certificado no fiable. Con `curl.exe -k https://www.ejemplo.local` se ve el contenido.

:::aviso[La redirección de HTTP a HTTPS es más complicada en IIS]
Con la característica `Web-Http-Redirect` se redirige **todo el sitio**, y si el mismo sitio tiene enlaces HTTP y HTTPS, la redirección también se aplica a HTTPS y crea un bucle. Las soluciones habituales son un sitio aparte solo para el puerto 80, o instalar el módulo adicional *URL Rewrite*. Se deja como ejercicio.
:::

# 5. Autenticación

IIS ofrece varios métodos, que se activan o desactivan por sitio:

| Método | Cómo funciona | ¿Seguro sin HTTPS? |
|---|---|---|
| **Anónima** | Cualquiera entra, como el usuario `IUSR` | No hay credenciales que proteger |
| **Básica** | Usuario y contraseña en Base64 | No, solo con HTTPS |
| **Windows** | Autenticación integrada con las credenciales de la sesión del usuario (Kerberos o NTLM) | Sí: no envía la contraseña en claro |

Instala el módulo de autenticación de Windows:

```powershell
Install-WindowsFeature Web-Windows-Auth
```

Después, en `inetmgr`: sitio `intranet` → **Autenticación**:

- **Autenticación anónima** → Deshabilitar.
- **Autenticación de Windows** → Habilitar.

Desde un cliente del dominio, abrir `http://intranet.ejemplo.local` entrará directamente con la sesión del usuario. Con `curl.exe` o desde un equipo fuera del dominio, pedirá usuario y contraseña, y sin ellos responde `401`.

:::nota[Autenticación en IIS frente a Apache y nginx]
En Apache y nginx se gestiona un fichero propio de usuarios. En IIS se delegan en las cuentas de Windows (del equipo o de Active Directory), y por eso la autenticación de Windows se integra con el dominio sin más.
:::

# 6. Verificación y registros

```powershell
curl.exe -I http://www.ejemplo.local
curl.exe -k https://www.ejemplo.local
curl.exe -I http://intranet.ejemplo.local
```

- `-I` muestra solo las cabeceras. Fíjate en `Server: Microsoft-IIS/…`.
- La intranet debe responder `401 Unauthorized`.

Los registros están en `C:\inetpub\logs\LogFiles\W3SVC<id>\`, donde `<id>` es el identificador del sitio, que aparece en `Get-Website`. Cada línea es una petición, en formato W3C. Los errores de arranque y de servicio se ven en el **Visor de eventos**.

Para reiniciar todo IIS:

```powershell
iisreset
```

`iisreset` detiene y arranca los servicios de IIS. Para parar solo un sitio: `Stop-Website -Name "www"` y `Start-Website -Name "www"`.

# 7. Cómo funciona por dentro

- **HTTP.sys**: controlador del kernel de Windows que recibe las peticiones TCP, las compara con los enlaces registrados y las envía al sitio correcto. Por eso IIS comparte puertos con otros servicios de Windows.
- **WAS y W3SVC**: el servicio de activación (WAS) gestiona los grupos de aplicaciones y los procesos de trabajo; `W3SVC` se encarga del protocolo HTTP.
- **`w3wp.exe`**: proceso de trabajo de un grupo de aplicaciones. Se puede ver en el Administrador de tareas. Si un grupo no recibe peticiones durante un tiempo, se apaga solo y arranca de nuevo en la siguiente.
- **Configuración**: la global está en `C:\Windows\System32\inetsrv\config\applicationHost.config` y la de cada sitio, opcionalmente, en un `web.config` dentro de su carpeta. IIS recarga ambos automáticamente al cambiarlos.
- **Módulos**: cada función es un módulo (autenticación, compresión, filtrado…) que se instala como característica de Windows, no como configuración del servidor.

# 8. Comparativa con Apache y nginx

| Concepto | Apache | nginx | IIS |
|---|---|---|---|
| Un sitio | `<VirtualHost>` | `server { }` | Sitio (`New-Website`) |
| Nombre del sitio | `ServerName` | `server_name` | `HostHeader` del enlace |
| Raíz | `DocumentRoot` | `root` | `PhysicalPath` |
| Configuración | Ficheros de texto | Ficheros de texto | Consola, PowerShell y XML |
| Config. por carpeta | `.htaccess` | No existe | `web.config` |
| Activar módulos | `a2enmod` | Casi todo incluido | Característica de Windows |
| TLS | Fichero y clave PEM | Fichero y clave PEM | Almacén de certificados de Windows |
| Autenticación | Fichero `.htpasswd` | Fichero `.htpasswd` | Cuentas de Windows (anónima, básica, Windows) |
| Aislamiento | MPM de procesos/hilos | Procesos *worker* | Grupos de aplicaciones |
| Probar configuración | `apache2ctl configtest` | `nginx -t` | No hace falta: se valida al aplicar |

# Ejercicios

:::ejercicio[1. Sitio por defecto]
Haz una petición por IP y otra con un nombre desconocido. ¿Qué sitio responde? Cambia el comportamiento para que no responda ninguno de contenido real.
:::

:::ejercicio[2. Un `404` y un `403`]
Provócalos: un `404` pidiendo un fichero inexistente y un `403` desactivando los permisos NTFS de una carpeta. Localízalos en el registro del sitio (`sc-status`).
:::

:::ejercicio[3. HTTPS en la intranet]
Crea otro certificado para `intranet.ejemplo.local` con SNI. Comprueba con `inetmgr` que los dos sitios usan el mismo puerto 443 con certificados distintos.
:::

:::ejercicio[4. Confiar en el certificado]
Exporta el certificado de `www` desde `certlm.msc`, impórtalo en el almacén *Entidades de certificación raíz de confianza* del cliente y comprueba que el aviso desaparece. ¿Por qué no se hace así en Internet?
:::

:::ejercicio[5. Grupos de aplicaciones]
Crea un grupo nuevo con `New-WebAppPool -Name "pool_www"` y asígnalo al sitio `www` desde la consola. Comprueba en el Administrador de tareas que aparece otro proceso `w3wp.exe` al hacer una petición.
:::

:::ejercicio[6. Redirección HTTP a HTTPS]
Haz la redirección creando un sitio solo para el puerto 80 que use la característica `Web-Http-Redirect`.
:::

:::ejercicio[7. Autenticación básica]
Instala `Web-Basic-Auth`, activa la autenticación básica en `intranet` y desactiva la de Windows. Observa con una captura de red qué se envía. ¿Por qué solo es aceptable con HTTPS?
:::

:::ejercicio[8. Comparar con Apache y nginx]
Ejecuta `ab` contra IIS como hiciste con los otros dos servidores y anota las peticiones por segundo. Ten en cuenta que no es una comparación justa si las máquinas son distintas.
:::

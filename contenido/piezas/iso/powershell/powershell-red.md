---
titulo: "PowerShell 9: red y resolución de nombres"
tipo: teoria
---

# PowerShell 9: red y resolución de nombres

Un servidor sin red no sirve de mucho, y la mayoría de los problemas que se te van a presentar empiezan con «no llego a esa máquina». Esta pieza reúne lo mínimo para entender cómo se identifica un equipo, comprobar si hay conexión, ver qué servicios ofrece, resolver nombres y pedir una página web, todo desde la terminal.

## Lo mínimo para empezar

| Orden | Qué hace |
|---|---|
| `ipconfig` | enseña las direcciones, la máscara y la puerta de enlace (`/all` añade la MAC y el DNS) |
| `Get-NetIPAddress` | las direcciones IP de cada interfaz, como objetos |
| `Get-NetIPConfiguration` | resumen de cada interfaz: IP, puerta de enlace y servidores DNS |
| `Get-NetAdapter` | las tarjetas de red, con su estado y su MAC |
| `Test-Connection host -Count 2` | envía 2 «pings» y dice si hay respuesta (`-Quiet` devuelve `True` o `False`) |
| `Test-NetConnection host -Port 443` | comprueba si un **puerto** TCP está abierto |
| `Get-NetTCPConnection -State Listen` | los puertos TCP en los que tu máquina **está escuchando** |
| `Resolve-DnsName nombre` | pregunta a DNS qué dirección tiene un nombre |
| `Resolve-DnsName nombre -Server 8.8.8.8` | lo mismo, pero preguntando a **otro** servidor DNS |
| `Get-DnsClientServerAddress` | qué servidores DNS usa tu equipo |
| `Clear-DnsClientCache` | vacía la caché de nombres (administrador) |
| `Invoke-WebRequest url` | descarga una página (`-OutFile f` la guarda en `f`) |
| `ssh usuario@host` | abre una terminal en otra máquina |
| `scp origen usuario@host:ruta` | copia ficheros entre máquinas |

Ideas que conviene tener claras:

- Una máquina se identifica por su **dirección IP** y, dentro de ella, cada servicio escucha en un **puerto**: 80 la web, 443 la web segura, 22 `ssh`, 53 DNS, 445 compartir ficheros, 3389 escritorio remoto. La **máscara** dice qué parte de la dirección es la red: con `255.255.255.0`, las direcciones que comparten los tres primeros números están en la misma red.
- Para salir de la red local se usa la **puerta de enlace** (*gateway*), el router al que el equipo envía todo lo que no es de su red.
- Que `Test-Connection` falle **no significa** que la máquina esté apagada: el cortafuegos de Windows bloquea por defecto las respuestas a `ping`. Para saber si un servicio responde se prueba **su puerto** con `Test-NetConnection`.
- Cuando se escribe un **nombre** y no una dirección, el sistema lo traduce a IP con varios métodos, por orden: primero mira la caché, luego el fichero `hosts` (`C:\Windows\System32\drivers\etc\hosts`) y después pregunta al servidor **DNS**. Si funciona escribiendo la IP pero no el nombre, el problema está en esa traducción, no en la red.
- `Invoke-WebRequest` devuelve un objeto con `StatusCode` (200 es «todo bien», 404 «no existe») y `Content`. En Windows PowerShell 5.1 conviene añadir `-UseBasicParsing`, para que no dependa de Internet Explorer.
- `ssh` y `scp` vienen con Windows en las versiones recientes. Para administrar otro Windows, PowerShell tiene además `Enter-PSSession`, que abre una terminal remota si el otro equipo lo permite.

## Ejercicios

### 1. Leer `ipconfig`

Un equipo escribe esto al ejecutar `ipconfig`:

```text
Adaptador de Ethernet Ethernet:
   Dirección IPv4. . . . . . . . . . . . . . : 192.168.1.25
   Máscara de subred . . . . . . . . . . . . : 255.255.255.0
   Puerta de enlace predeterminada . . . . . : 192.168.1.1
```

:::pregunta[¿Está `192.168.1.40` en la misma red? ¿Y `192.168.2.40`? ¿Qué papel hace `192.168.1.1`?]
`192.168.1.40` **sí**: con esa máscara los tres primeros números (`192.168.1`) identifican la red, y los dos los comparten. `192.168.2.40` **no**: es otra red, y para llegar hasta ella el tráfico tiene que pasar por la puerta de enlace.

`192.168.1.1` es el router por el que sale todo lo que no es de la red local.
:::

### 2. Dónde está la MAC

Quieres la dirección física de la tarjeta de red, para ponerla en una lista de equipos autorizados.

:::pregunta[Escribe dos formas de verla]
```powershell
Get-NetAdapter
ipconfig /all
```

`Get-NetAdapter` la enseña en la columna `MacAddress`. `ipconfig /all` la enseña como `Dirección física`.
:::

### 3. Un ping que responde

Lee esta orden:

```powershell
Test-Connection 192.168.1.1 -Count 2
```

:::pregunta[¿Qué escribe si todo va bien?]
Dos filas, una por cada paquete enviado, con el equipo de origen, el de destino, la dirección y el tiempo de respuesta (`ResponseTime`) en milisegundos. Si no hay respuesta, escribe un error por cada paquete que no ha vuelto.

Con `-Quiet` no escribe filas: solo `True` o `False`, que es lo cómodo para usarlo en un script.
:::

### 4. Funciona la dirección, falla el nombre

Escribes estas dos órdenes:

```powershell
Test-Connection 192.168.1.50 -Count 1 -Quiet
Test-Connection servidor1 -Count 1 -Quiet
```

La primera da `True`. La segunda falla con un error que dice que no se encuentra el host.

:::pregunta[¿Dónde está el problema y qué orden usas para confirmarlo?]
Está en la **resolución de nombres**, no en la red: la máquina responde cuando se la llama por su IP. El sistema no sabe qué dirección tiene `servidor1`.

Se confirma con `Resolve-DnsName servidor1`, que también fallará, y se mira qué servidores DNS usa el equipo con `Get-DnsClientServerAddress`.
:::

### 5. Un puerto cerrado

Lee esta orden y su salida:

```powershell
Test-NetConnection 192.168.1.50 -Port 3389
```

```text
ComputerName     : 192.168.1.50
RemotePort       : 3389
PingSucceeded    : True
TcpTestSucceeded : False
```

:::pregunta[¿Qué significa? ¿Qué puede estar pasando?]
La máquina **está encendida y alcanzable** (`PingSucceeded` es `True`), pero **no hay nadie escuchando en el puerto 3389**, el del escritorio remoto, o algo lo bloquea (`TcpTestSucceeded` es `False`).

Las causas habituales son que el escritorio remoto no esté activado en esa máquina, que el servicio esté parado, o que el cortafuegos bloquee el puerto.
:::

### 6. Qué escucha

En un servidor ejecutas `Get-NetTCPConnection -State Listen` y entre los resultados ves los puertos locales 135, 445 y 3389.

:::pregunta[¿Qué servicios ofrece ese servidor?]
El 445 es **compartir ficheros e impresoras** (SMB), el 3389 es el **escritorio remoto**, y el 135 es el servicio de llamadas remotas de Windows (RPC), que usan muchas herramientas de administración.

Esta es la lista que revisas al **asegurar** un servidor: todo lo que escucha y no necesitas es una puerta abierta de más.
:::

### 7. Preguntar a otro DNS

Lee estas órdenes:

```powershell
Resolve-DnsName example.com
Resolve-DnsName example.com -Server 8.8.8.8
```

:::pregunta[¿Para qué sirve la segunda?]
Pregunta lo mismo, pero a un servidor DNS **distinto** del que usa tu equipo: aquí, uno público. Si la segunda da una dirección y la primera no, el fallo está en el servidor DNS de tu red, no en el nombre.

Es la prueba más rápida para decidir de quién es el problema.
:::

### 8. Pedir una página

Lee esta orden:

```powershell
(Invoke-WebRequest https://example.com -UseBasicParsing).StatusCode
```

:::pregunta[¿Qué escribe si la página existe? ¿Y si no?]
Si todo va bien escribe `200`, el código de «correcto». Si la página no existe, `Invoke-WebRequest` no devuelve un `404`: lanza un **error**, y el código está dentro del mensaje.

Dentro de un script esto se controla con `try/catch`, que verás más adelante.
:::

## Hazlo tú

Copia este bloque y pégalo en PowerShell. Abre un puerto de pruebas, el 30001, que **solo escucha dentro de tu propio equipo** (`127.0.0.1`), para que haya algo que encontrar.

```powershell
if ($escucha) { $escucha.Stop() }
$escucha = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 30001)
$escucha.Start()
Write-Host "Puerto 30001 abierto en 127.0.0.1"
```

Al terminar los ejercicios, ciérralo con `$escucha.Stop()`. Los ejercicios 12 y 13 necesitan Internet y, el 13, permisos de administrador: hazlos solo en una máquina virtual.

### 9. Tus direcciones

Escribe las direcciones IPv4 de tu equipo, con el nombre de su interfaz.

:::pregunta[Escribe la orden y qué direcciones esperas]
```powershell
Get-NetIPAddress -AddressFamily IPv4 | Select-Object InterfaceAlias, IPAddress
```

Salen al menos dos filas: la de la red real, con una dirección como `192.168.1.25`, y la de **bucle local**, `127.0.0.1`, que siempre es tu propia máquina.
:::

### 10. Hablar contigo mismo

Comprueba con una sola orden que tu equipo responde en `127.0.0.1`, y que el resultado es `True`.

:::pregunta[Escribe la orden y el resultado]
```powershell
Test-Connection 127.0.0.1 -Count 2 -Quiet
```

Sale `True`. La dirección `127.0.0.1` nunca sale a la red: es la forma de comprobar que la pila de red del propio equipo funciona.
:::

### 11. Encontrar tu puerto

Averigua si hay algo escuchando en el puerto 30001 y en qué dirección.

:::pregunta[Escribe la orden y la salida]
```powershell
Get-NetTCPConnection -State Listen -LocalPort 30001
```

Sale una fila con `LocalAddress` `127.0.0.1`, `LocalPort` `30001` y `State` `Listen`. Como escucha solo en `127.0.0.1`, **ninguna otra máquina de la red puede conectar** con él.
:::

### 12. Abierto y cerrado

Comprueba que el puerto 30001 está abierto en `127.0.0.1` y que el 30002 **no** lo está. Que cada resultado salga como `True` o `False`.

:::pregunta[Escribe las órdenes y los dos resultados]
```powershell
Test-NetConnection 127.0.0.1 -Port 30001 -InformationLevel Quiet
Test-NetConnection 127.0.0.1 -Port 30002 -InformationLevel Quiet -WarningAction SilentlyContinue
```

Salen `True` y `False`. `-InformationLevel Quiet` hace que devuelva solo el resultado, y `-WarningAction SilentlyContinue` esconde el aviso de que la conexión ha fallado.
:::

### 13. Un nombre inventado (solo en una máquina virtual, como administrador)

Haz que el nombre `servidor.prueba` apunte a `127.0.0.1` **sin usar DNS**, comprueba que funciona y deja el equipo como estaba.

:::pregunta[Escribe las órdenes y la comprobación]
```powershell
$hosts = "C:\Windows\System32\drivers\etc\hosts"
Add-Content $hosts "127.0.0.1 servidor.prueba"
Test-Connection servidor.prueba -Count 1 -Quiet
(Get-Content $hosts) | Where-Object { $_ -notmatch "servidor.prueba" } | Set-Content $hosts
```

La comprobación da `True`: el sistema ha encontrado el nombre en el fichero `hosts`, antes de preguntar a ningún DNS. La última orden **borra la línea que añadiste**, dejando el fichero como estaba. Sin permisos de administrador, la escritura falla.
:::

### 14. Traer una página (necesita Internet)

Descarga la página `https://example.com` a un fichero `pagina.html`, y demuestra que no está vacía.

:::pregunta[Escribe las órdenes y la comprobación]
```powershell
cd ~\practica
Invoke-WebRequest https://example.com -UseBasicParsing -OutFile pagina.html
(Get-Item pagina.html).Length
```

La tercera orden escribe un tamaño mayor que cero. Después, no olvides cerrar el puerto de pruebas con `$escucha.Stop()`. Sustituye la dirección por una que exista en tu aula si `example.com` no responde.
:::

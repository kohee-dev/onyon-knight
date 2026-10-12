---
titulo: "Implantación de DHCP en Windows Server"
licencia: CC-BY-NC-SA-4.0
---

:::nota[Objetivo]
Instalar y configurar el rol de [DHCP](https://es.wikipedia.org/wiki/Protocolo_de_configuraci%C3%B3n_din%C3%A1mica_de_host) en [Windows Server](https://es.wikipedia.org/wiki/Windows_Server), entender qué hace cada pieza y compararlo con la implantación de Kea en Linux.
:::

# Escenario de partida

| Elemento | Valor de ejemplo |
|---|---|
| Servidor | `srv01`, IP fija `192.168.10.2/24` |
| Dominio | `ejemplo.local` (controlador de dominio con [Active Directory](https://es.wikipedia.org/wiki/Active_Directory), o servidor independiente) |
| Puerta de enlace | `192.168.10.1` |
| Clientes | 1 equipo Windows y 1 Linux en la misma red |

:::aviso[El servidor DHCP necesita IP fija]
No puede obtener su propia dirección por DHCP. Compruébalo antes de empezar.
:::

Todos los pasos se pueden hacer con la consola gráfica (Administrador del servidor y consola DHCP) o con [PowerShell](https://es.wikipedia.org/wiki/Windows_PowerShell). Aquí se muestran ambos caminos; usar PowerShell es lo que permite automatizarlo después con scripts.

# Instalación del rol

El rol añade el servicio `DHCP Server` (`dhcpserver`) y la consola de administración.

```powershell
Install-WindowsFeature DHCP -IncludeManagementTools
```

Alternativa gráfica: *Administrador del servidor → Administrar → Agregar roles y características → Servidor DHCP*.

:::nota[Qué crea la instalación]
Los grupos locales **Administradores de DHCP** y **Usuarios de DHCP**, que delegan la gestión sin dar permisos de administrador completo. En el asistente gráfico se crean en *Completar la configuración de DHCP*. Por PowerShell:
```powershell
netsh dhcp add securitygroups
Restart-Service dhcpserver
```
:::

# Autorización en Active Directory

En un dominio, un servidor DHCP **no atiende peticiones hasta que está autorizado** en AD. Es una protección contra servidores DHCP no autorizados (*rogue DHCP*): si alguien conecta uno por su cuenta en la red, el servicio detecta que no figura en AD y se detiene.

```powershell
Add-DhcpServerInDC -DnsName srv01.ejemplo.local -IPAddress 192.168.10.2
Get-DhcpServerInDC
```

:::tip[Servidor independiente]
Si el servidor no pertenece a un dominio, no hay nada que autorizar y el servicio funciona directamente.
:::

# Ámbito

El **ámbito** (*scope*) es el conjunto de direcciones que el servidor puede conceder en una red, y es la unidad básica de trabajo de DHCP en Windows.

```powershell
Add-DhcpServerv4Scope -Name "LAN" `
  -StartRange 192.168.10.100 -EndRange 192.168.10.200 `
  -SubnetMask 255.255.255.0 -LeaseDuration 8.00:00:00 -State Active
```

Qué decide cada parámetro:

| Parámetro | Para qué sirve |
|---|---|
| Rango de inicio y fin | Direcciones que se pueden repartir. Las que quedan fuera (servidores, impresoras, red) se mantienen estáticas. |
| Máscara | Define la red del ámbito. |
| Duración de la concesión | Tiempo que un cliente conserva la IP antes de renovarla. Por defecto, 8 días. |

:::nota[Duración de la concesión]
Un valor largo reduce el tráfico DHCP, pero tarda en recuperar direcciones de equipos que ya no existen. Un valor corto es útil en redes con muchos equipos temporales (wifi de invitados). El cliente intenta renovar a la mitad del tiempo (T1) y, si no lo consigue, vuelve a intentarlo hacia el 87,5 % (T2).
:::

## Exclusiones

Direcciones **dentro del rango** que el servidor no debe repartir.

```powershell
Add-DhcpServerv4ExclusionRange -ScopeId 192.168.10.0 `
  -StartRange 192.168.10.150 -EndRange 192.168.10.160
```

:::tip[Exclusión o fuera del rango]
Si un conjunto de direcciones es fijo y conocido, la forma más limpia es no incluirlo en el rango. La exclusión es útil cuando hay que reservar un hueco en mitad de un rango ya en uso.
:::

# Opciones

Además de la IP y la máscara, el servidor entrega **opciones** con el resto de la configuración de red.

| Opción | Nombre | Contenido |
|---|---|---|
| 003 | Router | Puerta de enlace |
| 006 | DNS Servers | Servidores DNS |
| 015 | DNS Domain Name | Sufijo DNS del dominio |

```powershell
Set-DhcpServerv4OptionValue -ScopeId 192.168.10.0 `
  -Router 192.168.10.1 -DnsServer 192.168.10.2 -DnsDomain ejemplo.local
```

Las opciones se pueden definir en cuatro niveles. Si se repite una opción, gana el nivel **más específico**:

1. **Servidor**: afecta a todos los ámbitos.
2. **Ámbito**: solo a esa red.
3. **Clase**: según un identificador que envía el cliente (por ejemplo, por fabricante).
4. **Reserva**: para un cliente concreto.

# Reservas

Una **reserva** asocia una IP a una dirección MAC, de modo que el cliente recibe siempre la misma dirección pero sigue configurándose por DHCP. La IP reservada debe estar dentro del ámbito.

```powershell
Add-DhcpServerv4Reservation -ScopeId 192.168.10.0 `
  -IPAddress 192.168.10.50 -ClientId "00-15-5D-01-02-03" -Name "impresora"
```

:::nota[Reserva frente a IP estática]
Con la reserva, el cambio de dirección o de puerta de enlace se hace en el servidor y no equipo a equipo, y los dispositivos no se quedan fuera si cambia la red.
:::

# Verificación

1. En el cliente Windows: `ipconfig /release` y después `ipconfig /renew`, y comprobar con `ipconfig /all` la IP, la puerta de enlace, el DNS y la duración de la concesión.
2. En el servidor, consultar las concesiones:
   ```powershell
   Get-DhcpServerv4Lease -ScopeId 192.168.10.0
   ```
3. Capturar el intercambio con [Wireshark](https://es.wikipedia.org/wiki/Wireshark) (filtro `bootp` o `dhcp`) y localizar los cuatro mensajes **DORA**: *Discover*, *Offer*, *Request*, *Acknowledge*.
4. Revisar el registro de eventos: *Visor de eventos → Registros de aplicaciones y servicios → Microsoft → Windows → DHCP-Server*.

:::aviso[Dirección 169.254.x.x]
Si un cliente muestra una dirección de ese rango, no ha encontrado ningún servidor DHCP y se ha autoasignado una [dirección de enlace local (APIPA)](https://en.wikipedia.org/wiki/Link-local_address). Revisa que el servicio esté iniciado, que el servidor esté autorizado, que el ámbito esté activo y que no haya un cortafuegos o un salto de red por medio.
:::

# Cómo funciona por dentro

- **Base de datos**: las concesiones se guardan en una base de datos en `C:\Windows\System32\dhcp`, no en un fichero de texto. Se puede hacer copia con `Backup-DhcpServer -Path C:\dhcpbackup`.
- **Detección de conflictos**: opcionalmente, el servidor hace un *ping* a la dirección antes de concederla para evitar duplicados. Retrasa la concesión, así que se usa con moderación.
- **Alta disponibilidad**: dos servidores pueden compartir un ámbito mediante **DHCP Failover** (reparto de carga o servidor en espera). Se configura con `Add-DhcpServerv4Failover`. Sustituye al antiguo reparto 80/20.
- **Actualización dinámica de DNS**: el servidor puede registrar en DNS los nombres de los clientes que reciben concesión. Es una buena razón para tener ya montado DNS.

# Comparativa con Kea

| Concepto | Kea (Linux) | Windows Server |
|---|---|---|
| Configuración | Fichero JSON | Consola gráfica, PowerShell y base de datos del servicio |
| Red atendida | Subred (`subnet4`) | Ámbito (*scope*) |
| Rango | `pools` | Rango, con exclusiones |
| Opciones | `option-data` | Opciones por servidor, ámbito, clase y reserva |
| Reserva | `reservations` | Reserva por MAC |
| Alta disponibilidad | Hook de alta disponibilidad | DHCP Failover |
| Autorización | No existe | Autorización en AD |
| Almacén de concesiones | Fichero CSV o base de datos | Base de datos integrada |

# Ejercicios

:::ejercicio[1. Dos ámbitos]
Crea un segundo ámbito para otra red (`192.168.20.0/24`). ¿Qué hace falta en el servidor y en el router para que los clientes de esa red reciban dirección?
:::

:::ejercicio[2. Prioridad de opciones]
Define la opción 006 a nivel de servidor con un DNS y, a nivel de ámbito, con otro distinto. ¿Cuál recibe el cliente? Compruébalo con `ipconfig /all`.
:::

:::ejercicio[3. Reserva]
Reserva una IP para un cliente Linux de la red usando su MAC y confirma que la recibe siempre, incluso tras liberar la concesión.
:::

:::ejercicio[4. Servidor no autorizado]
Anula la autorización con `Remove-DhcpServerInDC` y observa qué ocurre con los clientes y con el registro de eventos. Vuelve a autorizarlo.
:::

:::ejercicio[5. Comparar]
Haz la misma captura DORA contra Kea y contra Windows. ¿Qué diferencias ves en las opciones que entrega cada uno?
:::

---
titulo: "Implantación de DNS en Windows Server"
licencia: CC-BY-NC-SA-4.0
---

:::nota[Objetivo]
Instalar y configurar el rol de servidor DNS en [Windows Server](https://es.wikipedia.org/wiki/Windows_Server): zona directa, zona inversa, reenviadores, servidor secundario y comprobación. Se da por leída la teoría del servicio DNS, y conviene haber hecho antes la implantación de BIND para poder compararlas.
:::

# Escenario de partida

| Elemento | Valor de ejemplo |
|---|---|
| Servidor | `srv01`, IP fija `192.168.10.2/24` |
| Servidor secundario | `srv02`, IP fija `192.168.10.3/24` |
| Dominio | `ejemplo.local` (el mismo de la práctica de DHCP en Windows) |
| Clientes | 1 Windows y 1 Linux en la misma red |

:::nota[DNS y Active Directory]
[Active Directory](https://es.wikipedia.org/wiki/Active_Directory) depende de DNS: los clientes localizan los controladores de dominio mediante registros `SRV` (como `_ldap._tcp.dc._msdcs.ejemplo.local`) que el propio controlador registra. Por eso, al promover un servidor a controlador de dominio, el asistente ofrece instalar también el rol DNS, y es lo habitual.
:::

# Instalación del rol

```powershell
Install-WindowsFeature DNS -IncludeManagementTools
```

Alternativa gráfica: *Administrador del servidor → Agregar roles y características → Servidor DNS*. La consola de administración se abre desde *Herramientas → DNS*.

El servicio se llama `DNS` y escucha por el puerto 53, UDP y TCP. El cortafuegos de Windows abre los puertos al instalar el rol.

# Tipos de zona

Windows ofrece más tipos que BIND. Los que hay que distinguir:

| Tipo | Dónde se almacena | Cuándo se usa |
|---|---|---|
| **Principal estándar** | Fichero de texto `.dns` en `C:\Windows\System32\dns` | Servidor independiente o compatibilidad con otros servidores (por ejemplo, un BIND) |
| **Principal integrada en AD** | En la base de datos de Active Directory | Controladores de dominio. Se replica con AD, **todos** los controladores son editables y permite actualizaciones dinámicas seguras |
| **Secundaria** | Copia de solo lectura recibida por transferencia | Redundancia con servidores estándar |
| **Stub** | Solo los `NS` y el `SOA` de otra zona | Saber qué servidores atienden una zona ajena |
| **Reenvío condicional** | No es una zona: es una regla | Mandar las consultas de un dominio concreto a un servidor concreto |

:::nota[Integrada en AD frente a estándar]
En una zona estándar hay un único primario editable. En una integrada en AD no existe «primario y secundario»: cada controlador tiene su copia editable y AD se encarga de replicarla. Eso reemplaza el mecanismo de transferencias, que solo se usa con servidores fuera de AD.
:::

# Zona directa

En un servidor independiente (sin AD):

```powershell
Add-DnsServerPrimaryZone -Name ejemplo.local -ZoneFile ejemplo.local.dns -DynamicUpdate None
```

En un controlador de dominio, integrada en AD y con actualizaciones dinámicas seguras:

```powershell
Add-DnsServerPrimaryZone -Name ejemplo.local -ReplicationScope Domain -DynamicUpdate Secure
```

Actualización dinámica:

| Opción | Efecto |
|---|---|
| `None` | Los registros se crean solo a mano |
| `NonsecureAndSecure` | Cualquier cliente puede registrarse. **No recomendable** |
| `Secure` | Solo equipos autenticados del dominio (solo en zonas integradas) |

# Registros

```powershell
Add-DnsServerResourceRecordA -ZoneName ejemplo.local -Name srv01 -IPv4Address 192.168.10.2 -CreatePtr
Add-DnsServerResourceRecordA -ZoneName ejemplo.local -Name mail  -IPv4Address 192.168.10.4 -CreatePtr
Add-DnsServerResourceRecordCName -ZoneName ejemplo.local -Name www -HostNameAlias srv01.ejemplo.local
Add-DnsServerResourceRecordMX -ZoneName ejemplo.local -Name "." -MailExchange mail.ejemplo.local -Preference 10
```

`-CreatePtr` crea también el registro inverso, siempre que **exista la zona inversa**. Para comprobarlo:

```powershell
Get-DnsServerResourceRecord -ZoneName ejemplo.local
```

:::aviso[Nombres relativos y completos]
En PowerShell, `-Name srv01` es relativo a la zona. En la consola gráfica, el nombre completo se escribe con punto final. Es el mismo concepto que en BIND, con la diferencia de que aquí es mucho más difícil equivocarse.
:::

:::tip[Punto del vértice]
`-Name "."` indica el nombre de la propia zona (lo que en BIND es `@`).
:::

# Zona inversa

```powershell
Add-DnsServerPrimaryZone -NetworkId "192.168.10.0/24" -ZoneFile "10.168.192.in-addr.arpa.dns"
```

Windows calcula el nombre `10.168.192.in-addr.arpa` a partir de la red. Si la zona directa está integrada en AD, la inversa suele estarlo también (`-ReplicationScope Domain`).

# Reenviadores y raíz

Cuando el servidor recibe una consulta de un nombre que no es suyo, puede:

1. **Reenviar** a otro recursivo, si hay reenviadores configurados.
2. **Resolver desde la raíz**, usando las *sugerencias de raíz* (*root hints*) que trae el servidor.

```powershell
Set-DnsServerForwarder -IPAddress 1.1.1.1
Get-DnsServerForwarder
```

Reenvío condicional, para un dominio concreto:

```powershell
Add-DnsServerConditionalForwarderZone -Name ejemplo.test -MasterServers 192.168.10.5
```

:::nota[Equivalencia con BIND]
El reenviador global equivale a `forwarders { }` y el condicional a una zona `type forward` en BIND.
:::

# Servidor secundario

Para replicar con un servidor ajeno a AD (por ejemplo, un BIND), se usa una zona estándar:

En el primario:

```powershell
Set-DnsServerPrimaryZone -Name ejemplo.local -SecureSecondaries TransferToSecureServers -SecondaryServers 192.168.10.3
Set-DnsServerPrimaryZone -Name ejemplo.local -Notify NotifyServers -NotifyServers 192.168.10.3
```

En el secundario:

```powershell
Add-DnsServerSecondaryZone -Name ejemplo.local -ZoneFile ejemplo.local.dns -MasterServers 192.168.10.2
```

:::aviso[La zona principal debe ser estándar]
Una zona integrada en AD no se transfiere a servidores estándar si no se habilita expresamente. Para replicar con servidores que no son controladores, usa una zona principal estándar.
:::

# Verificación

Desde un cliente con el DNS apuntando a `192.168.10.2`:

```powershell
Resolve-DnsName www.ejemplo.local
Resolve-DnsName ejemplo.local -Type MX
Resolve-DnsName 192.168.10.4              # inversa
Resolve-DnsName www.ejemplo.local -Server 192.168.10.3
```

o con `nslookup`:

```
nslookup www.ejemplo.local 192.168.10.2
nslookup -type=SOA ejemplo.local
```

Cachés:

| Dónde | Cómo vaciarla |
|---|---|
| Cliente | `ipconfig /flushdns` o `Clear-DnsClientCache` |
| Servidor | `Clear-DnsServerCache` |

Registro del servicio: *Visor de eventos → Registros de aplicaciones y servicios → DNS Server*.

:::tip[Desde Linux]
También puedes preguntar al servidor Windows con `dig @192.168.10.2 www.ejemplo.local` y comprobar el mismo conjunto de banderas que con BIND.
:::

# Cómo funciona por dentro

- **Zonas estándar** en ficheros de texto y **zonas integradas** en la base de datos de AD. En las segundas no hay fichero de zona que editar.
- **Actualizaciones dinámicas**: los equipos del dominio registran su propio nombre, y el servidor DHCP puede registrar los de los clientes que reciben concesión. Es la unión con la práctica anterior.
- **Envejecimiento y limpieza** (*aging* y *scavenging*): como los registros dinámicos no se borran al apagar el equipo, el servidor puede eliminar los que llevan tiempo sin renovarse. Está desactivado por defecto.
- **Caché**: el servicio guarda las respuestas y respeta el TTL. Existe además el TTL máximo de la caché, ajustable.

# Comparativa con BIND

| Concepto | BIND (Linux) | Windows Server |
|---|---|---|
| Configuración | Ficheros de texto en `/etc/bind` | Consola gráfica y PowerShell |
| Zona | Fichero en cada zona | Fichero estándar o integrada en AD |
| Edición de registros | Editar el fichero y subir el serial | Alta con cmdlet o consola, el serial se actualiza solo |
| Comprobar | `named-checkconf`, `named-checkzone` | No hace falta: la consola valida |
| Redundancia | Primario y secundario con transferencia | Replicación de AD, o transferencia con zonas estándar |
| Actualizaciones dinámicas | `allow-update` con TSIG | Seguras con Kerberos (zonas integradas) |
| Reenvío | `forwarders` y zonas `forward` | Reenviadores y reenvío condicional |
| Servicio | `named` | `DNS` |
| Diagnóstico | `dig`, `rndc` | `Resolve-DnsName`, `nslookup`, `dnscmd` |

# Ejercicios

:::ejercicio[1. Estándar frente a integrada]
Crea una zona estándar y otra integrada en AD con distintos nombres. ¿Dónde se guarda cada una? Localiza el fichero de la estándar.
:::

:::ejercicio[2. Registro automático]
Pon un cliente Windows en el dominio y comprueba que su registro `A` aparece solo en la zona. Después fuerza el registro con `ipconfig /registerdns`.
:::

:::ejercicio[3. DHCP y DNS]
Con el servidor DHCP de la práctica anterior, haz que registre en DNS los nombres de los clientes que reciben concesión.
:::

:::ejercicio[4. Reenvío condicional]
Configura el reenvío condicional hacia el BIND de la práctica anterior para el dominio `ejemplo.test` y resuelve nombres de ese dominio desde un cliente Windows.
:::

:::ejercicio[5. Secundario de BIND]
Haz que BIND sea servidor secundario de una zona estándar de Windows, y al revés.
:::

:::ejercicio[6. Registros SRV]
Localiza en la zona `_msdcs` los registros `SRV` del controlador de dominio y consúltalos con `Resolve-DnsName -Type SRV`.
:::

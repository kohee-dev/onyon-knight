---
titulo: "Monitorización y salud del almacenamiento"
licencia: CC-BY-NC-SA-4.0
---

Un servidor de ficheros no avisa de que va a fallar: un martes por la mañana deja de funcionar y ya está. Lo que separa una incidencia molesta de un desastre es enterarte antes, cuando un disco empieza a dar errores o la capacidad llega al 90 %. A eso se le llama monitorizar: medir de forma continua, guardar lo que ves y avisar cuando algo se sale de lo normal.

## Qué vas a aprender

Al terminar este tema deberías ser capaz de:

- Explicar qué se monitoriza en un servidor y por qué.
- Usar herramientas básicas de Linux para ver CPU, memoria, disco y red.
- Interpretar el estado de un pool de ZFS y de un disco con SMART.
- Leer los registros del sistema con `journalctl` y enviar mensajes propios con `logger`.
- Escribir un script que compruebe la salud del servidor y se ejecute cada cierto tiempo con `cron`.
- Conocer las herramientas de monitorización de Windows y las plataformas profesionales.

---

## 1. Qué se monitoriza y por qué

Casi cualquier problema de rendimiento o de disponibilidad se explica por uno de estos cuatro recursos:

| Recurso | Qué preguntas responde | Señales de problema |
| --- | --- | --- |
| CPU | ¿Está el procesador saturado? | Uso al 100 % sostenido; carga (*load*) muy superior al número de núcleos |
| Memoria | ¿Hay suficiente RAM? ¿Se está usando *swap*? | Poca memoria disponible y mucha *swap* |
| Disco | ¿Queda espacio? ¿Responde rápido? ¿Está sano? | Ocupación alta, latencias grandes, errores |
| Red | ¿Hay ancho de banda? ¿Se pierden paquetes? | Saturación, errores, retransmisiones |

De cada uno conviene mirar tres cosas: cuánto se **usa** (utilización), cuánto trabajo **espera** sin ser atendido (saturación) y si hay **errores**.

Y hay dos maneras de trabajar. Puedes **observar en el momento**, cuando algo va lento y miras ahora mismo qué pasa (`top`, `iostat`...). O puedes **vigilar de forma continua**, dejando que sea un script o una plataforma quien mida y avise a todas horas. Hacen falta las dos: la primera te ayuda a diagnosticar y la segunda evita que tengas que estar delante.

:::pregunta[¿Cuáles son los cuatro recursos principales que se monitorizan en un servidor?]
CPU, memoria, disco y red. De cada uno conviene mirar cuánto se usa, cuánto trabajo espera sin ser atendido y si hay errores.
:::

:::pregunta[¿Qué diferencia hay entre observar en el momento y vigilar de forma continua?]
Observar en el momento es mirar ahora mismo qué pasa cuando algo va lento (`top`, `iostat`...), y sirve para diagnosticar. Vigilar de forma continua deja que un script o una plataforma mida y avise a todas horas, sin que tengas que estar delante. Hacen falta las dos.
:::

## 2. Herramientas de Linux

| Herramienta | Qué muestra |
| --- | --- |
| `top` / `htop` | Procesos, uso de CPU y de memoria en directo. `htop` es más cómoda (`sudo apt install htop`) |
| `uptime` | La carga media del sistema (1, 5 y 15 minutos) |
| `free -h` | Memoria total, usada y disponible, y *swap* |
| `vmstat 2` | Una línea cada 2 segundos con procesos, memoria, *swap*, entrada/salida y CPU |
| `df -h` | Ocupación de los sistemas de ficheros |
| `du -sh carpeta` | Cuánto ocupa una carpeta concreta |
| `iostat -xz 2` | Lecturas, escrituras, latencia (`await`) y porcentaje de uso (`%util`) de cada disco. Está en el paquete `sysstat` |
| `ss -tulpn` | Qué puertos tienen abiertos los servicios |

:::nota[La memoria en Linux parece siempre llena]
Linux aprovecha la RAM libre como caché de disco, así que `free` mostrará poca memoria "libre". Lo que importa es la columna `available` (disponible), que cuenta lo que se puede recuperar al instante. ZFS, además, usa su propia caché (ARC), que puede ocupar bastante memoria. Es normal, y se libera cuando otros programas la necesitan.
:::

### Herramientas de ZFS

```bash
zpool status
```

Muestra el estado de los pools y de los discos (`ONLINE`, `DEGRADED`...), el avance de un *resilver* o un *scrub* y los errores de lectura, escritura y suma de comprobación (columnas `READ`, `WRITE` y `CKSUM`).

```bash
zpool iostat -v 2
```

Enseña, cada 2 segundos, las operaciones y el ancho de banda por disco y por vdev. Sirve para ver si un disco concreto va peor que los demás.

```bash
zfs list -o name,used,avail,quota
```

Muestra el uso de cada dataset junto a su cuota. Cuando hay cuotas, el espacio libre de un dataset es el que le queda hasta su cuota, y no el del pool.

:::pregunta[`free -h` muestra muy poca memoria "libre". ¿Es un problema?]
No necesariamente. Linux aprovecha la RAM libre como caché de disco (y ZFS usa su propia caché, el ARC), y la libera cuando otros programas la necesitan. Lo que importa es la columna `available`.
:::

:::pregunta[En `zpool status`, ¿qué indican las columnas READ, WRITE y CKSUM?]
Los errores de lectura, de escritura y de suma de comprobación de cada disco o vdev del pool.
:::

## 3. Salud del disco: SMART

[S.M.A.R.T.](https://es.wikipedia.org/wiki/S.M.A.R.T.) (*Self-Monitoring, Analysis and Reporting Technology*) es un sistema que llevan los discos para vigilar su propio estado y guardar contadores internos. En Linux se consulta con `smartctl`, del paquete `smartmontools`:

```bash
sudo smartctl -H /dev/sda
```

Da un veredicto general: `PASSED` o `FAILED`. Un `FAILED` significa que el disco está en riesgo inminente y hay que sustituirlo. Con `-a` ves todo el detalle.

Estos son los atributos que merece la pena conocer:

| Atributo | Qué indica |
| --- | --- |
| `Reallocated_Sector_Ct` | Sectores dañados que el disco ha sustituido por otros de reserva. Si el valor crece, mala señal |
| `Current_Pending_Sector` | Sectores sospechosos que esperan ser comprobados |
| `Offline_Uncorrectable` | Sectores que no se han podido leer ni corregir |
| `Power_On_Hours` | Horas de funcionamiento |
| `Temperature_Celsius` | Temperatura |

:::aviso[Un `PASSED` no garantiza nada]
Estudios hechos con grandes flotas de discos han mostrado que muchos fallan sin que SMART haya avisado de nada. Es una señal útil cuando avisa, pero que todo esté bien no significa que el disco vaya a durar.
:::

Con `smartctl -t short /dev/sda` lanzas una prueba rápida en el propio disco, y `smartd` es un servicio que vigila los discos y envía avisos. En las máquinas virtuales los discos son simulados y `smartctl` normalmente no puede leerlos, así que en las prácticas del aula no verás datos reales.

:::pregunta[¿Qué significa un `FAILED` en `smartctl -H`? ¿Y un `PASSED`?]
`FAILED` indica que el disco está en riesgo inminente y hay que sustituirlo. `PASSED` no garantiza nada: muchos discos fallan sin que SMART haya avisado, así que es una señal útil cuando avisa, pero no asegura que el disco vaya a durar.
:::

:::pregunta[¿Qué atributo SMART te preocuparía si no deja de crecer?]
`Reallocated_Sector_Ct`: son sectores dañados que el disco ha sustituido por otros de reserva, y si el valor crece es mala señal. También preocupan `Current_Pending_Sector` y `Offline_Uncorrectable`.
:::

## 4. Los registros del sistema

Los programas dejan constancia de lo que hacen en los **registros** (*logs*). En los Ubuntu actuales casi todos van al **diario de systemd**, que se consulta con `journalctl`:

| Orden | Qué hace |
| --- | --- |
| `journalctl -b` | Todo desde el último arranque |
| `journalctl -p warning` | Solo avisos y errores (`warning`, `err`, `crit`...) |
| `journalctl -u smbd` | Mensajes de un servicio concreto |
| `journalctl -t salud` | Mensajes con una etiqueta concreta |
| `journalctl -f` | Seguir los mensajes nuevos en directo |
| `journalctl --since "1 hour ago"` | Filtrar por tiempo |

Y con `logger` tú también puedes escribir en el diario:

```bash
logger -t salud -p user.warning "El dataset docencia está al 90 %"
```

Esto es lo que une tus scripts con el resto del sistema: lo que escribes con `logger` lo recoge el mismo mecanismo que usan las herramientas de alerta profesionales.

:::pregunta[¿Cómo verías solo los avisos y errores de un servicio llamado `smbd` desde el último arranque?]
Con `journalctl -b -p warning -u smbd`: `-b` limita al último arranque, `-p warning` muestra avisos y errores, y `-u smbd` filtra por el servicio.
:::

:::pregunta[¿Para qué sirve `logger` en un script de vigilancia?]
Para escribir mensajes propios en el diario del sistema. Así lo que anota el script lo recoge el mismo mecanismo que usan las herramientas de alerta profesionales.
:::

## 5. Un script de salud con `cron`

Un script de vigilancia hace tres cosas: comprueba algo, decide si es un problema y avisa. Por ejemplo, puede mirar si todos los pools están `ONLINE`, si algún dataset supera el 80 % de su cuota y si el disco del sistema está lleno.

Si no hay problemas escribe `OK`, y si los hay `AVISO` o `ERROR`, lo anota en un fichero de registro y lo manda al diario con `logger`. Al terminar devuelve un **código de salida** con el resultado: 0 si todo va bien y distinto de 0 si no. Eso permite que otro programa lo encadene.

Para ejecutarlo cada cierto tiempo se usa **`cron`**. Con `sudo crontab -e` editas la tabla de tareas del administrador. Cada línea tiene cinco campos de tiempo y la orden:

```text
*/5 * * * * /opt/ciudad/salud.sh
```

Los campos son, en orden, minuto, hora, día del mes, mes y día de la semana. Un `*/5` en el primero significa "cada 5 minutos".

:::aviso[`cron` y el `PATH`]
`cron` ejecuta las tareas con un `PATH` muy reducido (`/usr/bin:/bin`). Las herramientas de ZFS están en `/usr/sbin`, así que un script que funciona perfectamente a mano puede fallar en `cron`. Usa rutas completas (`/usr/sbin/zpool`) o declara el `PATH` al principio del script.
:::

:::pregunta[¿Qué hace la línea de `cron` `*/10 * * * * /opt/salud.sh`?]
Ejecuta el script `/opt/salud.sh` cada 10 minutos: los cinco campos son minuto, hora, día del mes, mes y día de la semana, y `*/10` en el primero significa "cada 10 minutos".
:::

:::pregunta[Tu script funciona a mano pero no desde `cron`, y usa `zpool`. ¿Cuál es la causa más probable?]
`cron` ejecuta las tareas con un `PATH` muy reducido (`/usr/bin:/bin`) y `zpool` está en `/usr/sbin`. Se soluciona con rutas completas (`/usr/sbin/zpool`) o declarando el `PATH` al principio del script.
:::

## 6. Monitorización en Windows

| Herramienta | Para qué sirve |
| --- | --- |
| Administrador de tareas | Vista rápida de CPU, memoria, disco y red, y de los procesos |
| Monitor de recursos (`resmon`) | Detalle por proceso del disco y la red |
| Monitor de rendimiento (`perfmon`) | Contadores de rendimiento que se pueden dibujar, guardar y usar para lanzar alertas |
| Visor de eventos (`eventvwr`) | Los registros del sistema y de los servicios |
| PowerShell | `Get-Counter`, `Get-EventLog` / `Get-WinEvent`, `Get-Volume`, `Get-PhysicalDisk` |

En el Monitor de rendimiento hay contadores muy útiles para almacenamiento: el porcentaje de espacio libre de un disco, la longitud de la cola del disco (cuántas operaciones esperan) y los segundos por lectura y escritura. Una cola de disco alta de forma sostenida indica un disco saturado. Los nombres de los contadores cambian según el idioma de Windows; con `Get-Counter -ListSet LogicalDisk` ves los de tu equipo.

FSRM, que viste en el tema anterior, genera además avisos propios (por ejemplo, al alcanzar un umbral de cuota) en el Visor de eventos.

## 7. Plataformas de monitorización

Cuando hay más de unos pocos servidores, los scripts sueltos se quedan cortos. Las plataformas profesionales hacen lo que tú haces a mano, pero para cientos de equipos, guardando el **histórico**, dibujando **gráficas** y enviando **alertas** por correo, Telegram o móvil:

| Plataforma | Idea |
| --- | --- |
| Zabbix | Plataforma completa con agentes en cada equipo, alertas y gráficas |
| Nagios / Icinga | Veteranos, centrados en comprobar si algo está bien o mal |
| Prometheus + Grafana | Prometheus recoge métricas y Grafana las dibuja en paneles |
| Netdata | Muy fácil de instalar; paneles en tiempo real |
| PRTG | Comercial, muy popular en entornos Windows |

Muchas hablan el protocolo **SNMP**, una forma estándar de que impresoras, conmutadores y servidores respondan a "¿cómo estás?". ZFS tiene además su propio demonio, **ZED** (*ZFS Event Daemon*), que reacciona a los eventos del pool (un disco que falla, un *scrub* que termina) y puede enviar un correo o activar un repuesto.

---

## Glosario

| Término | Significado |
| --- | --- |
| Monitorizar | Medir de forma continua, registrar y avisar |
| Carga (*load*) | Cuántos procesos esperan CPU de media |
| SMART | Sistema de autodiagnóstico de los discos |
| *Journal* / diario | Registro de eventos del sistema, que se consulta con `journalctl` |
| `logger` | Orden que escribe un mensaje en el diario |
| Código de salida | Número con el que termina un programa: 0 es correcto |
| `cron` | Programador de tareas periódicas de Linux |
| SNMP | Protocolo estándar para consultar el estado de dispositivos de red |
| ZED | Demonio de eventos de ZFS |

## Fuentes y para saber más

| Apartado | Enlace |
| --- | --- |
| 2. `iostat` | [Manual de iostat](https://manpages.debian.org/bookworm/sysstat/iostat.1.en.html) |
| 2. Estado de ZFS | [Manual de zpool-status](https://openzfs.github.io/openzfs-docs/man/master/8/zpool-status.8.html) |
| 2. Estadísticas de ZFS | [Manual de zpool-iostat](https://openzfs.github.io/openzfs-docs/man/master/8/zpool-iostat.8.html) |
| 3. SMART | [S.M.A.R.T.](https://es.wikipedia.org/wiki/S.M.A.R.T.) |
| 3. `smartctl` | [Manual de smartctl](https://manpages.debian.org/bookworm/smartmontools/smartctl.8.en.html) |
| 4. El diario de systemd | [Manual de journalctl](https://manpages.debian.org/bookworm/systemd/journalctl.1.en.html) |
| 4. `logger` | [Manual de logger](https://manpages.debian.org/bookworm/bsdutils/logger.1.en.html) |
| 5. `cron` | [Manual de crontab(5)](https://manpages.debian.org/bookworm/cron/crontab.5.en.html) |
| 6. Contadores de rendimiento | [Get-Counter (Microsoft Learn)](https://learn.microsoft.com/es-es/powershell/module/microsoft.powershell.diagnostics/get-counter) |
| 7. ZED | [Manual de zed](https://openzfs.github.io/openzfs-docs/man/master/8/zed.8.html) |

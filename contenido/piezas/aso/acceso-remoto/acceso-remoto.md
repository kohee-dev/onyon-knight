---
titulo: "Acceso y administración remota"
licencia: CC-BY-NC-SA-4.0
fuentes:
  - "Criterios de evaluación (RA4, UT4) de la programación didáctica de ASO 2026-27. Los ejemplos de OpenSSH (claves, permisos, AllowUsers, scp, órdenes remotas y bucle por varios equipos) se comprobaron con un servidor de pruebas con OpenSSH 9.6; las órdenes de apt-cacher-ng y unattended-upgrades siguen su documentación y no se ejecutaron en el entorno de pruebas."
---

Cuando un servidor está en otra sala, en otro edificio o en un centro de datos a cientos de kilómetros, no vas a llevarle teclado y pantalla cada vez que haya que reiniciar un servicio. Lo administras de forma **remota**: desde tu equipo abres una sesión en el suyo, ejecutas órdenes, copias ficheros y supervisas lo que ocurre, todo a través de la red.

Esa comodidad tiene un precio: si tú puedes entrar en el servidor desde fuera, cualquiera que consiga tus credenciales también. Por eso este tema no trata solo de *cómo* conectarse, sino de hacerlo con **criterios de seguridad**: cifrar lo que viaja, limitar quién puede entrar y dejar constancia de lo que se hace.

::: nota
Este tema se centra en GNU/Linux (OpenSSH) y termina con la gestión centralizada de actualizaciones. Los conceptos de la primera parte (protocolos, puertos, sesiones, cifrado) valen para cualquier sistema; en la práctica los comprobarás también entre sistemas distintos.
:::

# Qué evalúa este tema

El RA4 dice: *«Administra de forma remota el sistema operativo en red valorando su importancia y aplicando criterios de seguridad»*. Estos son sus criterios de evaluación y dónde los trabajas:

| CE | Criterio | Dónde se trata |
|---|---|---|
| a | Se han descrito métodos de acceso y administración remota de sistemas | 1 y 2 |
| b | Se ha diferenciado entre los servicios orientados a sesión y los no orientados a sesión | 3 |
| c | Se han utilizado herramientas de administración remota suministradas por el propio sistema operativo | 7 y 8 |
| d | Se han instalado servicios de acceso y administración remota | 6 |
| e | Se han utilizado comandos y herramientas gráficas para gestionar los servicios de acceso y administración remota | 6, 10 y 12 |
| f | Se han creado cuentas de usuario para el acceso remoto | 7 |
| g | Se han realizado pruebas de acceso y administración remota entre sistemas heterogéneos | 11 |
| h | Se han utilizado mecanismos de encriptación de la información transferida | 4 y 9 |
| i | Se han documentado los procesos y servicios del sistema administrados de forma remota | 13 |

# 1. ¿Por qué administrar de forma remota?

Administrar un sistema «en persona» no escala. Con diez servidores todavía es posible; con cien, o con servidores en otra ciudad, es inviable. La administración remota permite:

- **Ahorrar tiempo y desplazamientos**: una incidencia a las tres de la madrugada se resuelve desde casa.
- **Gestionar muchos equipos igual**: lo que haces en uno, lo repites en todos (a menudo con un script).
- **Centralizar el control**: un único puesto desde el que se vigila y se configura toda la red.
- **Trabajar en equipos sin pantalla**: la mayoría de los servidores no tienen monitor; el acceso remoto es, de hecho, la única forma de administrarlos.

Y trae riesgos que conviene tener presentes desde el principio:

- Un servicio de acceso remoto expuesto es **el primer sitio al que atacan** los bots: basta mirar los registros de cualquier servidor con el puerto 22 abierto a Internet para ver cientos de intentos de entrada al día.
- Si la comunicación va **sin cifrar**, cualquiera que pueda ver el tráfico lee tus contraseñas y tus órdenes.
- Una cuenta con demasiados privilegios convierte un descuido en un desastre.

::: tip
Piensa siempre en tres preguntas antes de abrir un acceso remoto: *¿quién puede entrar?*, *¿por dónde pasa la información?* y *¿qué podrá hacer una vez dentro?* El resto del tema son respuestas técnicas a esas tres preguntas.
:::

# 2. Métodos de acceso y administración remota

Hay varias formas de manejar un sistema a distancia. Se distinguen sobre todo por **qué ves y qué controlas**:

| Método | Qué ofrece | Ejemplos |
|---|---|---|
| **Terminal remoto** | Una línea de órdenes del equipo remoto, en modo texto. Ligero, rápido y automatizable. | SSH (seguro), Telnet (obsoleto e inseguro) |
| **Escritorio remoto** | El escritorio gráfico del equipo remoto en tu pantalla, con ratón y teclado. | RDP, VNC, xrdp |
| **Herramientas de gestión** | Consolas que administran uno o varios equipos mediante protocolos de gestión. | PowerShell remoto (WinRM), consolas MMC, paneles web como Webmin o Cockpit |
| **Transferencia de ficheros** | Copiar y sincronizar ficheros entre equipos. | `scp`, `sftp`, `rsync` |
| **Gestión centralizada** | Una herramienta que aplica cambios o actualizaciones a muchos equipos a la vez. | WSUS, repositorios espejo, herramientas de automatización |

En cada sistema operativo hay herramientas **suministradas por el propio sistema** (el cliente `ssh` viene instalado en prácticamente cualquier Linux y en las versiones actuales de Windows) y herramientas **externas** que se instalan aparte (PuTTY, clientes de escritorio remoto, paneles de gestión).

::: nota
El terminal remoto es la opción preferida para administrar servidores: consume muy poco ancho de banda, funciona incluso con conexiones malas y se puede automatizar con scripts. El escritorio remoto se reserva para tareas que necesitan interfaz gráfica.
:::

# 3. Servicios orientados a sesión y no orientados a sesión

Una **sesión** es un diálogo con principio y fin entre dos equipos: se establece, se identifica a quien se conecta, se mantiene un estado mientras dura y se cierra. Según trabajen o no así, los servicios de red se dividen en dos grupos.

**Servicios orientados a sesión.** Antes de intercambiar datos se establece una sesión, normalmente sobre TCP, y el servidor recuerda quién eres mientras dura. Son los que usas para **administrar**: te autenticas una vez y a partir de ahí todo lo que envías pertenece a esa sesión.

- SSH, Telnet, RDP, VNC, FTP y SFTP.

**Servicios no orientados a sesión.** Cada petición es independiente: se envía, se responde (o no) y el servidor no guarda nada de ti entre una y otra. Suelen usar UDP y son ligeros.

- SNMP, syslog, NTP y TFTP; también las consultas de DNS.

| | Orientado a sesión | No orientado a sesión |
|---|---|---|
| Estado | El servidor recuerda la sesión | Cada petición es independiente |
| Autenticación | Una vez, al empezar | Por petición, o ninguna |
| Transporte habitual | TCP | UDP |
| Fiabilidad | Alta (reenvío, orden) | Menor (puede perderse un mensaje) |
| Uso típico en administración | Terminal y escritorio remoto | Supervisión y registro de eventos |

::: nota
«Sesión» no es exactamente lo mismo que «conexión TCP»: la sesión es una idea de nivel de aplicación (te identificas y se mantiene tu contexto) y la conexión es un mecanismo de transporte. En la práctica los servicios con sesión se apoyan en TCP, por eso se asocian.
:::

::: tip
Una regla útil: si el servicio **te pide que inicies sesión**, está orientado a sesión. Si solo envía o recibe mensajes sueltos (una alerta de syslog, una petición de hora a NTP), no lo está.
:::

# 4. Protocolos y puertos

Cada servicio de red escucha en un **puerto**, un número que identifica «qué servicio» dentro de un equipo. Para administrar y proteger un sistema hay que conocer los habituales:

| Servicio | Puerto | Transporte | Cifrado | Comentario |
|---|---|---|---|---|
| Telnet | 23 | TCP | No | Obsoleto: contraseña y órdenes viajan en claro |
| SSH (y SCP/SFTP) | 22 | TCP | Sí | El estándar para administración remota en Linux |
| RDP (escritorio de Windows) | 3389 | TCP | Sí | Escritorio remoto de Windows |
| VNC | 5900 y siguientes | TCP | No por defecto | Conviene tunelizarlo por SSH |
| WinRM (PowerShell remoto) | 5985 (HTTP) / 5986 (HTTPS) | TCP | Según el transporte | Administración remota de Windows |
| HTTPS (paneles web) | 443 | TCP | Sí | Webmin, Cockpit u otros paneles |
| SNMP | 161 / 162 | UDP | Depende de la versión | Supervisión de dispositivos |
| Syslog | 514 | UDP | No por defecto | Registros centralizados |
| NTP | 123 | UDP | No | Sincronización de hora |

Dos ideas de seguridad se derivan de esta tabla:

1. **Si no lo necesitas, no lo abras.** Cada puerto que escucha es una puerta; la regla es dejar abiertos solo los imprescindibles y, si puedes, solo para las direcciones que los necesitan.
2. **Prefiere siempre la versión cifrada.** Telnet y SSH hacen lo mismo (dar un terminal remoto), pero con Telnet cualquiera que capture el tráfico lee tu contraseña.

Para saber qué escucha tu propio equipo:

```bash
ss -tlnp          # puertos TCP en escucha (-t TCP, -l escucha, -n números, -p proceso)
ss -ulnp          # lo mismo para UDP
```

Y para comprobar desde otro equipo si un puerto responde:

```bash
nc -zv servidor 22      # ¿responde el puerto 22 de «servidor»?
```

# 5. Seguridad en el acceso remoto

Los criterios de seguridad que pide el RA4 se concretan en medidas muy repetidas en la práctica:

- **Cifrar el canal**: nada de contraseñas ni datos en claro (SSH, RDP con NLA, HTTPS).
- **Autenticación fuerte**: contraseñas largas y, mejor aún, **claves criptográficas** que no se pueden adivinar por fuerza bruta.
- **Mínimo privilegio**: cada persona entra con su cuenta, con los permisos que necesita y no más; el acceso directo como `root` se desactiva.
- **Restringir quién y desde dónde**: lista de usuarios o grupos permitidos y cortafuegos limitando las direcciones de origen.
- **Mantener el sistema actualizado**: un servicio de acceso con una vulnerabilidad conocida es una invitación (por eso el último apartado del tema trata las actualizaciones).
- **Registrar y vigilar**: revisar los registros de acceso y bloquear los intentos repetidos.
- **Documentar**: saber qué se administra, quién puede entrar y cómo.

# 6. Instalar y comprobar el servicio SSH (CE d, e)

**OpenSSH** es la implementación libre de SSH y la que usan casi todos los sistemas Linux. Tiene dos partes:

- El **cliente** (`ssh`), que sirve para conectarte a otros equipos.
- El **servidor** (`sshd`), el demonio que atiende las conexiones entrantes. En una instalación de Ubuntu Server suele venir ya instalado; en un escritorio, normalmente no.

En Debian y Ubuntu:

```bash
sudo apt update
sudo apt install openssh-server
```

Se gestiona como cualquier otro servicio de `systemd` (en Debian y Ubuntu el servicio se llama `ssh`; en otras distribuciones, `sshd`):

```bash
sudo systemctl status ssh        # ¿está en marcha?
sudo systemctl enable --now ssh  # arrancarlo ahora y en cada arranque
sudo systemctl reload ssh        # releer la configuración sin cortar las sesiones
sudo journalctl -u ssh -n 20     # últimos mensajes del servicio
```

Y se comprueba que escucha en el puerto 22:

```bash
ss -tlnp | grep ':22'
```

```text
LISTEN 0 128 0.0.0.0:22 0.0.0.0:* users:(("sshd",pid=812,fd=3))
```

Si hay un cortafuegos activo, hay que permitir el puerto. Con `ufw` (el cortafuegos sencillo de Ubuntu):

```bash
sudo ufw allow 22/tcp     # permitir SSH
sudo ufw limit ssh        # alternativa: permitir limitando los intentos repetidos
sudo ufw status           # ver las reglas
```

::: aviso
Si activas el cortafuegos con `sudo ufw enable` **antes** de permitir SSH, te quedas fuera de un servidor que solo administras por red. Añade siempre la regla primero.
:::

# 7. Conectarse y crear cuentas para el acceso remoto (CE c, f)

## 7.1 Primera conexión

```bash
ssh usuario@servidor           # conexión básica
ssh -p 2222 usuario@servidor   # si el servicio escucha en otro puerto
ssh usuario@servidor 'uptime'  # ejecutar una orden y volver
```

La primera vez que te conectas aparece una pregunta como esta:

```text
The authenticity of host 'servidor (192.168.1.20)' can't be established.
ED25519 key fingerprint is SHA256:gALPfmdtV/Zap4CLantN/YH57JV0E3K/XTGumCqO7as.
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

El servidor se identifica con su **clave de equipo** y te muestra su *huella*. Si respondes `yes`, el cliente la guarda en `~/.ssh/known_hosts`; las siguientes veces comprobará que sigue siendo el mismo servidor. Así se detecta que alguien se haya interpuesto suplantándolo.

::: tip
En un entorno real, comprueba la huella con el administrador del servidor antes de aceptarla (puedes verla en el propio servidor con `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub`). Aceptarla a ciegas deja la puerta abierta al ataque que la huella pretende evitar.
:::

Si más adelante ves el mensaje `WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!`, **no lo ignores**: o el servidor se ha reinstalado (cambió su clave) o alguien lo suplanta. Si estás seguro de que ha sido una reinstalación, borra la entrada vieja con:

```bash
ssh-keygen -R servidor
```

## 7.2 Cuentas para el acceso remoto

Cada persona que administre o use el sistema remotamente debe tener **su propia cuenta**: así se sabe quién hizo qué y se le puede quitar el acceso sin afectar a nadie más. Nunca compartas una cuenta.

```bash
sudo adduser ana                 # crea la cuenta (pide contraseña) con su carpeta personal
sudo groupadd sshusers           # un grupo para quienes pueden entrar por SSH
sudo usermod -aG sshusers ana    # añadir a ana a ese grupo (¡con -a!)
```

Para que las cuentas del grupo (y solo ellas) puedan entrar, se limita en el servidor (apartado 8):

```text
AllowGroups sshusers
```

::: aviso
Si creas la cuenta con `useradd` en lugar de `adduser`, la contraseña queda **bloqueada** (marcada con `!`). En un servidor configurado sin PAM (`UsePAM no`) eso impide incluso la entrada por clave, aunque la clave sea correcta. Para tener una cuenta sin contraseña pero que sí admita clave, usa `sudo usermod -p '*' usuario`. Se comprueba fácilmente en un servidor de pruebas sin PAM: con la contraseña bloqueada se rechaza la entrada; con `*`, entra con la clave.
:::

::: aviso
Al crear una cuenta administrativa, dale permisos de `sudo` (grupo `sudo` en Ubuntu) solo si de verdad los necesita. Trabajar como `root` por SSH es una mala práctica: no deja rastro de quién fue y un error cuesta mucho más.
:::

# 8. Configurar el servidor SSH (CE d, e)

El comportamiento del servidor se define en `/etc/ssh/sshd_config`. Las directivas más importantes para un acceso seguro:

| Directiva | Valor recomendado | Qué hace |
|---|---|---|
| `PermitRootLogin` | `no` | Prohíbe entrar directamente como `root` |
| `PasswordAuthentication` | `no` | Obliga a usar claves (cuando ya las tengas instaladas) |
| `PubkeyAuthentication` | `yes` | Permite la entrada con clave pública |
| `AllowUsers` / `AllowGroups` | tus usuarios o grupo | Solo ellos pueden entrar; el resto, rechazados |
| `MaxAuthTries` | `3` o `4` | Intentos de autenticación por conexión |
| `Port` | `22` (u otro) | Puerto de escucha |

Un ejemplo de configuración razonable:

```text
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AllowGroups sshusers
MaxAuthTries 3
```

## Cómo aplicar los cambios sin quedarte fuera

Una configuración errónea del servidor SSH puede impedirte volver a entrar, y si solo administras el equipo por red, **no hay forma de arreglarlo**. Hay tres hábitos que lo evitan:

1. **Comprueba la sintaxis antes de aplicar** con `sudo sshd -t`. Si no escribe nada, el fichero es válido; si hay un error, te dice la línea.
2. **Recarga, no reinicies**, con `sudo systemctl reload ssh`. Las sesiones abiertas se mantienen.
3. **Mantén tu sesión actual abierta** y prueba la nueva configuración abriendo **otra** conexión en otra terminal. Solo cierras la primera si la segunda funciona.

```bash
sudo sshd -t && sudo systemctl reload ssh
```

::: aviso
En las versiones recientes de Ubuntu (a partir de la 22.10, incluida la 24.04) `ssh` puede arrancar a través de un *socket* de `systemd` (`ssh.socket`), de modo que cambiar `Port` en `sshd_config` **no basta** para cambiar el puerto: hay que ajustar también la unidad del socket y reiniciarla. Comprueba siempre con `ss -tlnp` en qué puerto escucha de verdad, según tu versión.
:::

::: nota
Cambiar el puerto 22 por otro reduce el ruido de los bots en los registros, pero **no es una medida de seguridad real**: un atacante detecta el nuevo puerto con un escaneo. La seguridad la dan las claves, la restricción de usuarios y el cortafuegos.
:::

# 9. Autenticación por clave y cifrado (CE h)

## 9.1 Qué cifra SSH

SSH protege la conexión entera. Al conectarte ocurre, simplificado, lo siguiente:

1. Cliente y servidor **negocian** los algoritmos y acuerdan una **clave de sesión** que solo ellos conocen.
2. El servidor **demuestra su identidad** con su clave de equipo (la huella que viste en la primera conexión).
3. Tú te **autenticas** (contraseña o clave).
4. Todo lo que viaja a partir de ahí —tus órdenes, la salida, los ficheros— va **cifrado e íntegro**.

Con Telnet, en cambio, cualquiera que capture el tráfico en la red (con una herramienta como Wireshark) lee tu usuario, tu contraseña y todo lo que escribes. Esa es la razón de que Telnet esté en desuso.

## 9.2 Criptografía de clave pública

Las claves SSH son un **par**: una **clave privada**, que nunca sale de tu equipo, y una **clave pública**, que puedes repartir sin riesgo. Lo que se cifra o firma con una solo se puede comprobar con la otra. El servidor guarda tu clave pública; para entrar, tu cliente demuestra que posee la privada sin enviarla jamás.

Frente a una contraseña, la clave:

- **No viaja por la red**, así que no se puede capturar.
- **No se puede adivinar** por fuerza bruta de forma práctica.
- Se puede **proteger con una frase de paso** y gestionar con un agente.

## 9.3 Crear y desplegar el par de claves

En **tu** equipo (el cliente):

```bash
ssh-keygen -t ed25519 -C "ana@portatil"
```

Acepta la ruta por defecto (`~/.ssh/id_ed25519`) y **pon una frase de paso**. Se crean dos ficheros:

```text
~/.ssh/id_ed25519       clave privada  (nunca la compartas)
~/.ssh/id_ed25519.pub   clave pública  (esta es la que se instala en el servidor)
```

Se instala la clave pública en el servidor con:

```bash
ssh-copy-id ana@servidor            # (usa -p 2222 si el puerto no es el 22)
```

Eso añade tu clave pública al fichero `~/.ssh/authorized_keys` de la cuenta `ana` en el servidor. A partir de ahí, `ssh ana@servidor` entra con la clave (te pide la frase de paso, no la contraseña de la cuenta).

::: aviso
Los permisos importan. El servidor rechaza la clave si los ficheros son accesibles por otros usuarios (`StrictModes`): `~/.ssh` debe ser `700` y `authorized_keys` debe ser `600`. Se comprueba fácilmente en un servidor de pruebas: con `authorized_keys` en `666`, la entrada por clave se rechaza.
:::

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

Cuando compruebes que entras con clave, ya puedes poner `PasswordAuthentication no` en el servidor (recuerda comprobar y recargar como en el apartado 8), de forma que las contraseñas dejen de ser una vía de ataque.

::: tip
Para no escribir la frase de paso en cada conexión, usa el **agente SSH** (`ssh-agent` y `ssh-add`), que la guarda en memoria durante la sesión de tu equipo. Es la combinación de comodidad y seguridad más habitual.
:::

# 10. Transferir ficheros y ejecutar órdenes remotas (CE e)

Con SSH no solo abres un terminal. El mismo canal cifrado sirve para más cosas:

**Copiar ficheros** con `scp` (copia simple) o `sftp` (sesión interactiva):

```bash
scp informe.txt ana@servidor:/home/ana/        # subir
scp ana@servidor:/home/ana/hola.txt .          # bajar
scp -r carpeta ana@servidor:/tmp/              # una carpeta entera
scp -P 2222 informe.txt ana@servidor:          # otro puerto: -P mayúscula en scp
sftp ana@servidor                              # sesión interactiva (get, put, ls, cd...)
```

::: aviso
`scp` usa **`-P`** (mayúscula) para el puerto, mientras que `ssh` usa `-p` (minúscula). Es un error muy común. Además, las versiones recientes de OpenSSH hacen funcionar `scp` sobre el subsistema SFTP, así que el servidor debe tenerlo activado (la línea `Subsystem sftp ...` de `sshd_config`, que viene por defecto). Sin él, `scp` falla con el mensaje `subsystem request failed`.
:::

Para **sincronizar** carpetas copiando solo lo que cambia, `rsync` sobre SSH es más eficiente:

```bash
rsync -av --delete origen/ ana@servidor:/destino/
```

**Ejecutar órdenes** sin abrir una sesión interactiva:

```bash
ssh ana@servidor 'df -h /'                       # una orden
ssh ana@servidor 'systemctl status nginx'        # estado de un servicio
ssh ana@servidor 'sudo journalctl -u ssh -n 5'   # con sudo (si la cuenta puede)
```

Esto es la base de la **automatización**: lo que escribes a mano en un servidor lo puedes repetir en muchos con un bucle.

**Redirigir puertos (túneles).** SSH puede transportar por su canal cifrado el tráfico de otro servicio, lo que es muy útil para proteger servicios que no cifran:

```bash
ssh -L 5901:localhost:5901 ana@servidor    # el puerto 5901 de tu equipo apunta al 5901 del servidor
ssh -X ana@servidor                        # reenvío de ventanas gráficas (X11)
```

Con el primer ejemplo, un cliente VNC apuntando a `localhost:5901` en tu equipo llega al VNC del servidor, pero el tráfico viaja cifrado por SSH.

# 11. Pruebas entre sistemas heterogéneos (CE g)

En una red real conviven sistemas distintos: administradores con Windows que manejan servidores Linux, o al revés. Lo importante es que **SSH es un estándar**: cualquier cliente que lo cumpla se conecta a cualquier servidor que lo cumpla.

- **Desde Windows a Linux**: las versiones actuales de Windows incluyen el cliente OpenSSH, así que `ssh ana@servidor` funciona igual en PowerShell. También existen clientes externos como PuTTY.
- **De Linux a Windows**: se puede usar el servidor OpenSSH que Windows ofrece como característica opcional, o el escritorio remoto (RDP) con un cliente como Remmina o `xfreerdp`.
- **De Linux a Linux** y entre distribuciones distintas: funciona igual; solo cambia el nombre del servicio (`ssh` o `sshd`) y el sistema de cortafuegos.

Cuando pruebes un acceso entre sistemas distintos, sigue siempre el mismo orden para localizar los fallos:

1. **¿Hay conectividad?** `ping servidor`.
2. **¿Responde el puerto?** `nc -zv servidor 22`. Si no responde: servicio parado o cortafuegos.
3. **¿Funciona el servicio?** `sudo systemctl status ssh` en el servidor.
4. **¿Falla la autenticación?** Mira el mensaje de error y los registros (`sudo journalctl -u ssh`).
5. **¿Es el cortafuegos?** `sudo ufw status` en el servidor.

Los mensajes de error orientan: `Connection refused` (nada escucha o lo bloquea), `Connection timed out` (no se llega, normalmente cortafuegos o red) y `Permission denied (publickey)` (el servicio responde pero no te acepta: usuario, clave o permisos).

# 12. Escritorio remoto y herramientas gráficas (CE e)

Cuando se necesita interfaz gráfica, hay dos caminos habituales:

- **Reenviar una aplicación concreta**, con `ssh -X`: abre en tu pantalla la ventana de un programa que se ejecuta en el servidor. Útil para una herramienta puntual de administración.
- **Escritorio remoto completo**: en Linux se instala un servidor como `xrdp` (acceso con el cliente RDP de Windows) o un servidor VNC. Los servicios VNC no cifran por defecto, así que lo correcto es **no exponerlos** y llegar a ellos mediante un túnel SSH (apartado 10).

::: tip
Aunque el escritorio remoto es cómodo, en un servidor es casi siempre peor que el terminal: consume recursos, amplía la superficie de ataque y no se automatiza. Úsalo solo cuando no haya otra opción.
:::

# 13. Documentar la administración remota (CE i)

Un acceso remoto que no está documentado es un problema esperando a ocurrir: cuando falla algo o se va un administrador, nadie sabe qué hay montado. La documentación mínima de un servicio administrado de forma remota debería recoger:

| Apartado | Qué anotar |
|---|---|
| Sistema | Nombre, dirección IP, sistema operativo y versión |
| Servicio de acceso | Servicio (SSH, RDP...), puerto en el que escucha y versión |
| Cuentas | Quién puede entrar (usuarios o grupo) y con qué privilegios |
| Autenticación | Método (clave o contraseña), dónde están las claves públicas autorizadas |
| Seguridad | Restricciones aplicadas (root deshabilitado, cortafuegos, límite de intentos) |
| Cambios | Qué se modificó, cuándo, por quién y cómo volver atrás |
| Comprobaciones | Órdenes para verificar que funciona (`ss -tlnp`, `systemctl status ssh`) |

Un ejemplo de ficha corta:

```text
Servidor: srv-web01 · 192.168.1.20 · Ubuntu Server 24.04
Acceso remoto: OpenSSH, puerto 22, solo grupo sshusers (ana, luis)
Autenticación: solo clave pública; PasswordAuthentication no; root deshabilitado
Cortafuegos: ufw, 22/tcp permitido solo desde 192.168.1.0/24
Cambios: 25/11/2026 · ana · desactivada la contraseña tras instalar las claves
Comprobación: systemctl status ssh · ss -tlnp | grep :22
```

# 14. Gestión centralizada de actualizaciones

Un sistema sin actualizar es un sistema vulnerable: la mayoría de los ataques con éxito aprovechan fallos **ya corregidos** por el fabricante, en equipos donde nadie instaló el parche. Actualizar uno a uno, a mano, es lento y se olvida. La **gestión centralizada** consiste en controlar desde un punto cómo y cuándo se actualizan muchos equipos.

## 14.1 Por qué centralizar

- **Control**: decides qué actualizaciones se aprueban y cuándo se aplican (por ejemplo, probándolas antes en un equipo de pruebas).
- **Ahorro de ancho de banda**: cada paquete se descarga de Internet **una sola vez** y los demás equipos lo reciben de la red local.
- **Uniformidad**: todos los equipos están en la misma versión de cada paquete.
- **Seguimiento**: sabes qué equipos están al día y cuáles no.

## 14.2 Estrategias en Linux

| Estrategia | Cómo funciona | Cuándo usarla |
|---|---|---|
| **Actualización automática** (`unattended-upgrades`) | Cada equipo instala solo las actualizaciones, sin intervención | Parches de seguridad en equipos poco críticos |
| **Caché de paquetes** (`apt-cacher-ng`) | Un servidor guarda los paquetes descargados y los sirve a los demás | Muchos equipos iguales; ahorro de ancho de banda |
| **Espejo local del repositorio** | Una copia completa del repositorio en la red local | Redes grandes o con poca salida a Internet |
| **Actualización remota dirigida** | El administrador lanza la actualización en cada equipo por SSH | Control total del momento; pocos o muchos equipos con scripts |

::: nota
En entornos Windows el equivalente es **WSUS** (Windows Server Update Services), un servidor que descarga las actualizaciones de Microsoft y las distribuye a los equipos de la red, con aprobación por parte del administrador. La idea es la misma que la de la caché o el espejo en Linux: un punto central entre los equipos e Internet.
:::

## 14.3 Actualización automática con `unattended-upgrades`

```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades    # activarlo (responder «Sí»)
```

La activación se guarda en `/etc/apt/apt.conf.d/20auto-upgrades`, con un contenido como este:

```text
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
```

Esto actualiza la lista de paquetes e instala las actualizaciones **de seguridad** cada día. Para comprobar qué haría sin aplicar nada y revisar lo ocurrido:

```bash
sudo unattended-upgrade --dry-run --debug
sudo less /var/log/unattended-upgrades/unattended-upgrades.log
```

::: aviso
Las actualizaciones automáticas son cómodas pero un parche puede, ocasionalmente, romper algo. En servidores críticos es habitual limitarlas a las de seguridad, probar antes en un entorno de pruebas y tener copia de seguridad.
:::

## 14.4 Una caché central con `apt-cacher-ng`

Con una caché, el **primer** equipo que pide un paquete lo descarga de Internet, el servidor lo guarda y los demás lo reciben de la red local. En el equipo que hará de servidor de caché:

```bash
sudo apt install apt-cacher-ng      # escucha por defecto en el puerto 3142
sudo systemctl status apt-cacher-ng
```

En cada **cliente**, indicando el proxy de apt en un fichero de configuración:

```bash
echo 'Acquire::http::Proxy "http://192.168.1.10:3142";' | sudo tee /etc/apt/apt.conf.d/00proxy
sudo apt update
```

A partir de ahí, `apt` pide los paquetes al servidor de caché. La caché tiene una página de estadísticas en `http://192.168.1.10:3142/acng-report.html`.

::: aviso
La caché funciona de forma sencilla con repositorios por HTTP. Los repositorios por HTTPS no se pueden almacenar en caché de la misma manera (el tráfico va cifrado de extremo a extremo) y requieren una configuración adicional; consulta la documentación de `apt-cacher-ng` antes de usarla con ellos.
:::

## 14.5 Actualizar muchos equipos por SSH

Con SSH y un fichero con la lista de equipos, una actualización dirigida a todos es un bucle sencillo:

```bash
# hosts.txt: un equipo por línea
for h in $(cat hosts.txt); do
    echo "== $h =="
    ssh ana@"$h" 'sudo apt update && sudo apt -y upgrade'
done
```

Para que funcione sin intervención la cuenta debe tener **clave SSH** instalada y permiso de `sudo`. Si no quieres que `sudo` pida contraseña (algo que conviene limitar a cuentas y órdenes concretas), se configura con `visudo`; si no, el bucle se detendrá a pedirla.

::: tip
Esto enlaza con la automatización con scripts de Bash del módulo: el bucle de arriba es el punto de partida de un script que, además, compruebe si cada equipo responde, anote los fallos y escriba un informe al final.
:::

# 15. Resumen

- La administración remota permite gestionar sistemas a distancia, pero amplía la superficie de ataque; hay que aplicar criterios de seguridad.
- Hay varios métodos: **terminal remoto** (SSH), **escritorio remoto** (RDP, VNC), **herramientas de gestión**, **transferencia de ficheros** y **gestión centralizada**.
- Los servicios **orientados a sesión** (SSH, RDP, Telnet, FTP) establecen una sesión y recuerdan quién eres; los **no orientados a sesión** (SNMP, syslog, NTP, TFTP) tratan cada petición de forma independiente.
- Cada servicio escucha en un **puerto** (SSH 22, RDP 3389, Telnet 23...); abre solo los necesarios y prefiere siempre las versiones cifradas.
- **OpenSSH**: se instala con `openssh-server`, se gestiona con `systemctl` y se configura en `sshd_config` (sin root, solo usuarios permitidos, mejor sin contraseñas).
- Al cambiar la configuración: `sshd -t`, `reload` y **no cerrar** la sesión abierta hasta probar con otra.
- La **autenticación por clave** (`ssh-keygen`, `ssh-copy-id`) no envía secretos por la red; los permisos de `~/.ssh` (700) y `authorized_keys` (600) son obligatorios.
- Con SSH también se copian ficheros (`scp`, `sftp`, `rsync`), se ejecutan órdenes remotas y se crean túneles cifrados.
- Cada persona tiene **su cuenta**; nunca se comparte ni se trabaja como `root` por la red.
- Ante un fallo de acceso: conectividad → puerto → servicio → autenticación → cortafuegos.
- La **gestión centralizada de actualizaciones** da control, ahorra ancho de banda y uniformiza los equipos: `unattended-upgrades`, caché `apt-cacher-ng`, actualización dirigida por SSH (y WSUS en Windows).
- Todo servicio administrado de forma remota se **documenta**: sistema, servicio, cuentas, seguridad, cambios y comprobaciones.

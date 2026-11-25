---
titulo: "Acceso y administración remota"
licencia: CC-BY-NC-SA-4.0
fuentes:
  - "Los ejemplos de OpenSSH (claves, permisos, AllowUsers, scp, órdenes remotas y bucle por varios equipos) se comprobaron con un servidor de pruebas con OpenSSH 9.6; las órdenes de apt-cacher-ng y unattended-upgrades siguen su documentación y no se ejecutaron en el entorno de pruebas."
---

Cuando un servidor está en otra sala, en otro edificio o en un centro de datos a cientos de kilómetros, no vas a llevarle teclado y pantalla cada vez que haya que reiniciar un servicio. Lo administras de forma **remota**: desde tu equipo abres una sesión en el suyo, ejecutas órdenes, copias ficheros y supervisas lo que ocurre, todo a través de la red.

Esa comodidad tiene un precio: si tú puedes entrar en el servidor desde fuera, cualquiera que consiga tus credenciales también. Por eso este tema no trata solo de *cómo* conectarse, sino de hacerlo con **criterios de seguridad**: cifrar lo que viaja, limitar quién puede entrar y dejar constancia de lo que se hace.

::: nota
Este tema se centra en GNU/Linux (OpenSSH) y termina con la gestión centralizada de actualizaciones. Los conceptos de la primera parte (protocolos, puertos, sesiones, cifrado) valen para cualquier sistema; en la práctica los comprobarás también entre sistemas distintos.
:::

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

::: pregunta[Un administrador necesita (a) reiniciar un servicio de un servidor sin monitor, (b) instalar un programa con asistente gráfico en un Windows Server y (c) copiar cada noche una carpeta a otro equipo. ¿Qué método de acceso elegirías en cada caso?]
(a) **Terminal remoto** con SSH: basta una orden y consume poco ancho de banda. (b) **Escritorio remoto** (RDP): el asistente es gráfico y no se puede hacer solo con órdenes. (c) **Transferencia de ficheros** con `rsync` sobre SSH, que además se puede programar y solo copia lo que ha cambiado.
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

::: pregunta[Clasifica SSH, NTP, RDP, syslog y TFTP en servicios orientados a sesión o no, y justifica el criterio.]
**Con sesión:** SSH y RDP, porque te identificas al empezar y el servidor recuerda tu contexto hasta que cierras. **Sin sesión:** NTP, syslog y TFTP, porque cada mensaje se envía y se responde (o no) de forma independiente y no hay inicio de sesión. La regla práctica: si el servicio te pide iniciar sesión, está orientado a sesión.
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

::: pregunta[Un compañero dice que Telnet y SSH «dan lo mismo». ¿En qué se parecen, en qué se diferencian y cuál usarías?]
Se parecen en que los dos dan un **terminal remoto** sobre TCP (Telnet en el puerto 23, SSH en el 22). Se diferencian en que Telnet va **sin cifrar**: cualquiera que capture el tráfico lee usuario, contraseña y órdenes. SSH cifra toda la conexión y además verifica la identidad del servidor. Se usa siempre SSH; Telnet solo tendría sentido en un laboratorio aislado.
:::

::: pregunta[Ejecutas `ss -tlnp | grep :22` en un servidor y sale `LISTEN 0 128 127.0.0.1:22 ...`. Desde otro equipo, `ssh` da `Connection refused`. ¿Por qué?]
El servicio escucha en `127.0.0.1`, la dirección de **bucle local**, así que solo acepta conexiones del propio servidor. Cuando escucha en todas las interfaces aparece `0.0.0.0:22`. Hay que revisar la directiva `ListenAddress` de `sshd_config`, corregirla, comprobar con `sudo sshd -t` y recargar el servicio.
:::

# 5. Seguridad en el acceso remoto

Los criterios de seguridad se concretan en medidas muy repetidas en la práctica:

- **Cifrar el canal**: nada de contraseñas ni datos en claro (SSH, RDP con NLA, HTTPS).
- **Autenticación fuerte**: contraseñas largas y, mejor aún, **claves criptográficas** que no se pueden adivinar por fuerza bruta.
- **Mínimo privilegio**: cada persona entra con su cuenta, con los permisos que necesita y no más; el acceso directo como `root` se desactiva.
- **Restringir quién y desde dónde**: lista de usuarios o grupos permitidos y cortafuegos limitando las direcciones de origen.
- **Mantener el sistema actualizado**: un servicio de acceso con una vulnerabilidad conocida es una invitación (por eso el último apartado del tema trata las actualizaciones).
- **Registrar y vigilar**: revisar los registros de acceso y bloquear los intentos repetidos.
- **Documentar**: saber qué se administra, quién puede entrar y cómo.

# 6. Instalar y comprobar el servicio SSH

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

::: pregunta[Administras un servidor solo por SSH. Escribes `sudo ufw enable` y después `sudo ufw allow 22/tcp`. ¿Qué puede pasar y cómo se evita?]
Al activar el cortafuegos sin ninguna regla que permita el puerto 22 puede cortarse la conexión y quedarte **fuera del servidor**, sin forma de arreglarlo por red. Se evita permitiendo SSH **antes** de activar el cortafuegos: primero `sudo ufw allow 22/tcp` (o `sudo ufw limit ssh`) y después `sudo ufw enable`, comprobando el resultado con `sudo ufw status`.
:::

# 7. Conectarse y crear cuentas para el acceso remoto

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
Si creas la cuenta con `useradd` en lugar de `adduser`, la contraseña queda **bloqueada** (marcada con `!`). En un servidor configurado sin PAM (`UsePAM no`) eso impide incluso la entrada por clave, aunque la clave sea correcta. Para tener una cuenta sin contraseña pero que sí admita clave, usa `sudo usermod -p '*' usuario`.
:::

::: aviso
Al crear una cuenta administrativa, dale permisos de `sudo` (grupo `sudo` en Ubuntu) solo si de verdad los necesita. Trabajar como `root` por SSH es una mala práctica: no deja rastro de quién fue y un error cuesta mucho más.
:::

::: pregunta[Quieres crear una cuenta, `juan`, y limitar el acceso por SSH al grupo `sshusers`. Escribe las órdenes para crear la cuenta y meterla en el grupo, y la línea de `sshd_config` que limita el acceso.]
```bash
sudo adduser juan
sudo groupadd sshusers          # solo si el grupo no existe todavía
sudo usermod -aG sshusers juan
```

```text
AllowGroups sshusers
```

Después se comprueba con `sudo sshd -t` y se recarga con `sudo systemctl reload ssh`. Si en `usermod` se olvida la opción `-a`, `juan` **pierde** el resto de sus grupos suplementarios y queda solo en `sshusers`.
:::

# 8. Configurar el servidor SSH

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

::: pregunta[Has aplicado `PasswordAuthentication no` pero aún no has copiado ninguna clave. ¿Qué ocurre al recargar y qué habría evitado el problema?]
Nadie podrá entrar: las contraseñas se rechazan y no hay clave autorizada, así que si solo se administra por red no hay forma de arreglarlo. Se evita **instalando y probando primero la clave** (`ssh-copy-id`), comprobando que se entra con ella desde **otra** terminal, y solo entonces desactivando la contraseña con `sudo sshd -t && sudo systemctl reload ssh`, sin cerrar la sesión abierta.
:::

::: pregunta[¿Por qué es mejor `reload` que `restart` al cambiar la configuración de SSH y por qué hay que mantener abierta la sesión actual?]
Con `reload` el servicio relee la configuración **sin cortar** las sesiones ya abiertas. Con `restart` se reinicia el demonio y, si la nueva configuración tiene un fallo, puede no volver a arrancar y se pierde el acceso. La sesión abierta es la red de seguridad: si la nueva configuración falla al probar con otra conexión, aún se puede entrar para corregirla.
:::

# 9. Autenticación por clave y cifrado

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
Los permisos importan. El servidor rechaza la clave si los ficheros son accesibles por otros usuarios (`StrictModes`): `~/.ssh` debe ser `700` y `authorized_keys` debe ser `600`.
:::

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

Cuando compruebes que entras con clave, ya puedes poner `PasswordAuthentication no` en el servidor (recuerda comprobar y recargar como en el apartado 8), de forma que las contraseñas dejen de ser una vía de ataque.

::: tip
Para no escribir la frase de paso en cada conexión, usa el **agente SSH** (`ssh-agent` y `ssh-add`), que la guarda en memoria durante la sesión de tu equipo. Es la combinación de comodidad y seguridad más habitual.
:::

::: pregunta[Un compañero te pide tu fichero `id_ed25519` para entrar en el servidor con tu cuenta. ¿Qué haces?]
**No se lo das**: la clave privada nunca sale del equipo de su dueño. Si necesita acceso, genera **su propio par** con `ssh-keygen -t ed25519` y se instala su clave **pública** (`id_ed25519.pub`) en su cuenta con `ssh-copy-id`. Cada persona tiene su cuenta y sus claves, para saber quién hizo cada cosa.
:::

::: pregunta[`ssh-copy-id` funcionó, pero el servidor sigue pidiendo la contraseña en lugar de usar la clave. Nombra dos causas posibles y cómo las comprobarías.]
(1) **Permisos incorrectos**: `~/.ssh` debe ser `700` y `authorized_keys` `600`; se revisa con `ls -ld ~/.ssh` y `ls -l ~/.ssh/authorized_keys` y se corrige con `chmod`. (2) **`PubkeyAuthentication no`** (o un `AllowUsers`/`AllowGroups` que no incluye la cuenta) en `sshd_config`. Para ver el motivo exacto, se mira `sudo journalctl -u ssh -n 20` en el servidor o se prueba con `ssh -v` desde el cliente.
:::

# 10. Transferir ficheros y ejecutar órdenes remotas

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

::: pregunta[Escribe la orden para (a) subir `copia.tar.gz` al directorio `/home/ana/` del servidor, que escucha en el puerto 2222, y (b) ver el espacio libre del disco del servidor sin abrir una sesión interactiva.]
```bash
scp -P 2222 copia.tar.gz ana@servidor:/home/ana/    # (a) -P mayúscula en scp
ssh -p 2222 ana@servidor 'df -h /'                  # (b) -p minúscula en ssh
```
:::

::: pregunta[El servidor web de `servidor` solo escucha en `localhost:80` y no está abierto en el cortafuegos. ¿Cómo ves su página desde tu equipo sin abrir ningún puerto?]
Con un **túnel SSH**: `ssh -L 8080:localhost:80 ana@servidor`. Mientras la sesión esté abierta, el puerto 8080 de tu equipo apunta al puerto 80 del servidor, y al abrir `http://localhost:8080` en el navegador llegas a su página, con el tráfico cifrado dentro de SSH.
:::

# 11. Pruebas entre sistemas heterogéneos

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

::: pregunta[Explica qué significa cada mensaje y qué revisarías primero: `Connection refused`, `Connection timed out` y `Permission denied (publickey)`.]
- **`Connection refused`**: se llega al equipo, pero nada escucha en ese puerto o algo lo rechaza. Se revisa si el servicio está en marcha (`systemctl status ssh`) y el puerto (`ss -tlnp`).
- **`Connection timed out`**: no se llega al equipo o el tráfico se descarta. Se revisa la conectividad (`ping`), la dirección y el cortafuegos.
- **`Permission denied (publickey)`**: el servicio responde, pero no acepta la autenticación. Se revisa el usuario, la clave instalada y los permisos de `~/.ssh` y `authorized_keys`.
:::

# 12. Escritorio remoto y herramientas gráficas

Cuando se necesita interfaz gráfica, hay dos caminos habituales:

- **Reenviar una aplicación concreta**, con `ssh -X`: abre en tu pantalla la ventana de un programa que se ejecuta en el servidor. Útil para una herramienta puntual de administración.
- **Escritorio remoto completo**: en Linux se instala un servidor como `xrdp` (acceso con el cliente RDP de Windows) o un servidor VNC. Los servicios VNC no cifran por defecto, así que lo correcto es **no exponerlos** y llegar a ellos mediante un túnel SSH (apartado 10).

::: tip
Aunque el escritorio remoto es cómodo, en un servidor es casi siempre peor que el terminal: consume recursos, amplía la superficie de ataque y no se automatiza. Úsalo solo cuando no haya otra opción.
:::

# 13. Documentar la administración remota

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

::: pregunta[Completa la ficha de un servidor nuevo con estos datos: `srv-db01`, 192.168.1.30, Ubuntu Server 24.04, SSH en el 22, entran Ana y Luis del grupo `sshusers`, solo con clave, root desactivado, `ufw` permite el 22 solo desde 192.168.1.0/24.]
```text
Servidor: srv-db01 · 192.168.1.30 · Ubuntu Server 24.04
Acceso remoto: OpenSSH, puerto 22, solo grupo sshusers (ana, luis)
Autenticación: solo clave pública; PasswordAuthentication no; root deshabilitado
Cortafuegos: ufw, 22/tcp permitido solo desde 192.168.1.0/24
Cambios: (fecha) · (quién) · (qué se cambió y cómo volver atrás)
Comprobación: systemctl status ssh · ss -tlnp | grep :22
```
:::

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

::: pregunta[Tienes 40 equipos iguales con Ubuntu y poca conexión a Internet. ¿Qué estrategia de actualización elegirías y por qué?]
Una **caché de paquetes** (`apt-cacher-ng`) o un espejo local: cada paquete se descarga de Internet **una sola vez** y los 40 equipos lo reciben de la red local. Además, todos quedan en la misma versión. Para los parches de seguridad se puede combinar con `unattended-upgrades`, y para lanzar una actualización en el momento que decida el administrador, con un bucle de `ssh` sobre la lista de equipos.
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

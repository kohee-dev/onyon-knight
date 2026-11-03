---
titulo: "Comandos 12: red y acceso remoto"
tipo: teoria
---

# Comandos 12: red y acceso remoto

Los servidores se administran casi siempre **de forma remota**, desde otra máquina, por la red. Esta pieza reúne lo mínimo para entender cómo se identifica una máquina, qué servicios ofrece, cómo hablar con ellos a mano y cómo conectarte a otra máquina con una clave. Es la herramienta con la que se resuelven los retos online de acceso remoto.

## Lo mínimo para empezar

| Orden | Qué hace |
|---|---|
| `ip a` | enseña las interfaces de red de tu máquina y sus direcciones |
| `ping -c 3 host` | envía 3 paquetes de prueba y dice si hay respuesta |
| `ss -tln` | enseña los **puertos TCP** en los que tu máquina está escuchando |
| `curl url` | descarga una página o fichero (`-s` sin barra de progreso, `-o f` lo guarda en `f`) |
| `nc host puerto` | abre una conexión a mano con ese puerto, para escribir y leer |
| `nc -z host puerto` | solo comprueba si el puerto está abierto |
| `ssh usuario@host` | abre una terminal en otra máquina |
| `ssh -p 2220 usuario@host` | lo mismo, con un puerto distinto del habitual |
| `ssh -i clave usuario@host` | entra con una clave privada, no con contraseña |
| `ssh-keygen` | crea un par de claves, una privada y otra pública |
| `scp origen destino` | copia ficheros entre máquinas (el remoto se escribe `usuario@host:ruta`) |

Qué debes saber:

- Una máquina se identifica por su **dirección IP** (por ejemplo `192.168.1.20`). La dirección `127.0.0.1`, o el nombre `localhost`, es **la propia máquina**.
- Cada servicio escucha en un **puerto**, un número del 1 al 65535. Los más habituales: `22` ssh, `80` http, `443` https, `53` dns, `25` correo.
- Un puerto escuchando en `127.0.0.1` solo se alcanza desde la propia máquina. Si escucha en `0.0.0.0`, se alcanza desde fuera.
- Con `nc` o `curl` puedes hablar con un servicio sin usar ninguna aplicación: escribes y lees el texto a mano.
- **Claves SSH:** `ssh-keygen` crea dos ficheros. La **privada** (`id_ed25519`) es tuya y no se enseña a nadie: debe tener permisos `600`, y `ssh` se niega a usarla si otros pueden leerla. La **pública** (`id_ed25519.pub`) se copia en la máquina remota para que te reconozca.
- Las conexiones que escriben una contraseña por teclado no se pueden automatizar bien. Por eso en los retos se pasa la contraseña o la clave por tubería, con `nc` y `echo`.

## Ejercicios

### 1. Leer una dirección

Esta es una parte de la salida de `ip a`:

```text
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 192.168.1.20/24 brd 192.168.1.255 scope global eth0
```

:::pregunta[¿Qué dirección IP tiene la máquina en la red? ¿Para qué sirve `lo`?]
La máquina tiene la IP **192.168.1.20**, en la interfaz `eth0`.

`lo` es la interfaz de **loopback**, con la dirección `127.0.0.1`: sirve para que la máquina hable consigo misma. Es la que se usa cuando escribes `localhost`.
:::

### 2. Leer un ping

Esta es la salida de `ping -c 3 localhost`:

```text
64 bytes from localhost (127.0.0.1): icmp_seq=1 ttl=64 time=0.04 ms
64 bytes from localhost (127.0.0.1): icmp_seq=2 ttl=64 time=0.05 ms
64 bytes from localhost (127.0.0.1): icmp_seq=3 ttl=64 time=0.05 ms

--- localhost ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
```

:::pregunta[¿Hay conexión? ¿Cómo lo sabes?]
Sí. Se enviaron 3 paquetes y se recibieron los 3, con un 0 % de pérdida. Cada línea es la respuesta a un paquete, con el tiempo que tardó (`time`).

Un `100% packet loss` indicaría que el destino no responde (o que el `ping` está bloqueado, que no es lo mismo que estar caído).
:::

### 3. Los puertos habituales

:::pregunta[¿Qué servicio esperas encontrar en los puertos 22, 80, 443 y 53?]
- **22**: SSH, el acceso remoto a una terminal.
- **80**: HTTP, la web sin cifrar.
- **443**: HTTPS, la web cifrada.
- **53**: DNS, la traducción de nombres a direcciones IP.

Es un convenio, no una regla: un servicio puede escuchar en otro puerto (por ejemplo SSH en el 2220), y por eso existe la opción `-p`.
:::

### 4. Puertos que escuchan

Esta es una parte de la salida de `ss -tln`:

```text
State   Recv-Q  Send-Q  Local Address:Port   Peer Address:Port
LISTEN  0       128           0.0.0.0:22          0.0.0.0:*
LISTEN  0       128         127.0.0.1:631         0.0.0.0:*
LISTEN  0       128         127.0.0.1:8080        0.0.0.0:*
```

:::pregunta[¿Qué puertos hay escuchando? ¿Cuáles se alcanzan desde otra máquina?]
Escuchan los puertos **22**, **631** y **8080**.

Solo el **22** (SSH) se alcanza desde otra máquina: escucha en `0.0.0.0`, es decir, en todas las interfaces. El 631 y el 8080 escuchan en `127.0.0.1` y solo se pueden usar desde la propia máquina.
:::

### 5. Descargar a mano

Lee estas órdenes. Hay un servidor web local que responde en el puerto 8080:

```bash
curl -s localhost:8080/clave.txt
curl -s -o copia.txt localhost:8080/clave.txt
```

:::pregunta[¿Qué hace cada una?]
La primera **escribe en pantalla** el contenido de `clave.txt` tal y como lo sirve el servidor. La segunda no escribe nada: `-o copia.txt` guarda ese contenido en el fichero `copia.txt`.

`-s` (de *silent*) quita la barra de progreso que `curl` pintaría en la terminal.
:::

### 6. Hablar con un servicio

Hay un servicio en el puerto 30001 que, al conectarte, pregunta por una contraseña. Lee estas dos órdenes:

```bash
nc localhost 30001
echo mal | nc localhost 30001
```

:::pregunta[¿Qué ocurre con cada una?]
La primera abre una conexión y el servicio te escribe `Contrasena:`; tú escribes la contraseña y pulsas Intro y el servicio responde. La segunda hace lo mismo sin teclear: `echo` escribe `mal` por una tubería a `nc`, que se lo envía al servicio, y la respuesta será `Incorrecta`.

Enviar con `echo ... | nc` es la forma de automatizar la conversación: el texto de `echo` hace el papel de lo que escribirías a mano.
:::

### 7. ¿Está abierto?

Lee estas dos órdenes:

```bash
nc -z localhost 30001 && echo abierto
nc -z localhost 30009 || echo cerrado
```

:::pregunta[¿Qué escribe cada una, si el 30001 escucha y el 30009 no?]
```text
abierto
cerrado
```

`-z` no envía nada, solo comprueba si se puede conectar. Su código de salida es 0 si el puerto está abierto y distinto de 0 si no, y `&&` y `||` ejecutan la orden siguiente según ese código.
:::

### 8. Escribir un `ssh`

Escribe la orden para cada caso:

1. Entrar a `servidor.ejemplo.org` como usuario `alex`.
2. Entrar en el puerto `2220` como usuario `bandit0`, a `juegos.ejemplo.org`.
3. Entrar como `alex` a `servidor.ejemplo.org` usando la clave privada `clave.pem`.
4. Ejecutar solo la orden `ls` en el servidor, sin abrir una terminal.

:::pregunta[Escribe las cuatro órdenes]
```bash
ssh alex@servidor.ejemplo.org
ssh -p 2220 bandit0@juegos.ejemplo.org
ssh -i clave.pem alex@servidor.ejemplo.org
ssh alex@servidor.ejemplo.org ls
```

Lo que hay detrás de `usuario@host` es la orden que se ejecuta en el servidor: sin nada, abre una terminal; con `ls`, ejecuta `ls` y vuelve.
:::

### 9. Claves y permisos

Ejecutas `ssh-keygen -t ed25519 -f llave` y se crean dos ficheros: `llave` y `llave.pub`. Después, `ssh -i llave alex@servidor.ejemplo.org` te dice que la clave es «demasiado abierta».

:::pregunta[¿Cuál de los dos ficheros se envía al servidor? ¿Qué falla y cómo se arregla?]
Se envía **`llave.pub`**, la pública. `llave` es la privada: no se comparte.

`ssh` se niega a usar una clave privada que otras personas puedan leer (por ejemplo, con permisos `644`). Se arregla con:

```bash
chmod 600 llave
```

Es el mismo `chmod` de la pieza 4. Un fichero que solo puede leer su dueño es lo mínimo exigible a una clave privada.
:::

### 10. Copiar con scp

Quieres subir el fichero `informe.txt` al servidor y bajar `datos.csv` de él.

:::pregunta[Escribe las dos órdenes]
```bash
scp informe.txt alex@servidor.ejemplo.org:/home/alex/
scp alex@servidor.ejemplo.org:/home/alex/datos.csv .
```

El origen va primero y el destino después. El lado remoto se escribe `usuario@host:ruta`. El punto final es «la carpeta actual».
:::

## Hazlo tú

Guarda este script como `preparar-12.sh` y ejecútalo con `bash preparar-12.sh`. Crea en `practica` una carpeta `red` y deja en marcha, en tu propia máquina, tres servicios: una web en el puerto 8080 y dos servicios de texto en los puertos 30001 y 30002. El servidor es un pequeño script en Python que puedes leer.

```bash
pkill -f servidor.py
rm -rf ~/practica/red
mkdir -p ~/practica/red/web
cd ~/practica/red
echo "CLAVE-O-6543" > web/clave.txt
echo "La contrasena del puerto 30001 es alexandria" > web/pista.txt
cat > servidor.py <<'X'
import http.server, os, socketserver, threading

class Reto(socketserver.StreamRequestHandler):
    def handle(self):
        self.wfile.write(b"Contrasena: ")
        if self.rfile.readline().strip() == b"alexandria":
            self.wfile.write(b"CLAVE-P-8086\n")
        else:
            self.wfile.write(b"Incorrecta\n")

class Aviso(socketserver.StreamRequestHandler):
    def handle(self):
        self.wfile.write(b"Bienvenido. Aqui no hay nada.\n")

socketserver.ThreadingTCPServer.allow_reuse_address = True
for puerto, clase in ((30001, Reto), (30002, Aviso)):
    servidor = socketserver.ThreadingTCPServer(("127.0.0.1", puerto), clase)
    threading.Thread(target=servidor.serve_forever, daemon=True).start()
os.chdir("web")
http.server.ThreadingHTTPServer(("127.0.0.1", 8080), http.server.SimpleHTTPRequestHandler).serve_forever()
X
nohup python3 servidor.py > /dev/null 2>&1 &
sleep 1
echo "Servicios de la practica en marcha"
```

Cuando termines, para los servicios con `pkill -f servidor.py`.

### 11. ¿Qué escucha?

Averigua en qué puertos de tu máquina escuchan los servicios que acabas de lanzar, y comprueba cuál de los puertos `30001`, `30002` y `30003` **no** está abierto.

:::pregunta[Escribe las órdenes y los puertos]
```bash
ss -tln
nc -z localhost 30003 || echo cerrado
```

En la salida aparecen `127.0.0.1:8080`, `127.0.0.1:30001` y `127.0.0.1:30002` (y quizá otros del sistema). El `30003` está cerrado.
:::

### 12. La web

Descarga el fichero `clave.txt` del servidor web que escucha en el puerto 8080 y escribe la clave que contiene.

:::pregunta[Escribe la orden y la clave]
```bash
curl -s localhost:8080/clave.txt
```

La clave es `CLAVE-O-6543`.
:::

### 13. La contraseña del puerto 30001

Hay otro fichero en el servidor web que cuenta cuál es la contraseña del puerto 30001. Úsala para conseguir la clave que entrega ese servicio, enviándola desde la propia orden en vez de escribirla cuando el servicio te la pida.

:::pregunta[Escribe las órdenes y la clave]
```bash
curl -s localhost:8080/pista.txt
echo alexandria | nc localhost 30001
```

La pista dice que la contraseña es `alexandria`. El servicio responde `Contrasena: ` y `CLAVE-P-8086`, que es la clave.
:::

### 14. El servicio que no tiene nada

El puerto 30002 también está abierto. Averigua qué dice y si merece la pena seguir.

:::pregunta[Escribe la orden y lo que dice]
```bash
nc localhost 30002
```

Responde `Bienvenido. Aqui no hay nada.` y se cierra. No hay más que hacer: es un señuelo.
:::

### 15. Tu propia clave

Crea un par de claves SSH **ed25519** sin contraseña en una carpeta nueva `~/practica/red/claves`, y demuestra que la privada tiene los permisos correctos y la pública no es secreta.

:::pregunta[Escribe las órdenes y los permisos esperados]
```bash
mkdir -p ~/practica/red/claves
cd ~/practica/red/claves
ssh-keygen -t ed25519 -N "" -f llave
ls -l
```

Salen `llave` con permisos `-rw-------` (la privada, solo tú) y `llave.pub` con `-rw-r--r--` (la pública, que se puede copiar).
:::

---
titulo: "Sockets en Java: TCP y UDP"
licencia: CC-BY-NC-SA-4.0
tipo: caso
horas: 5
resumen: "Seis partes para programar en Java clientes y servidores con sockets TCP y UDP, atender a varios clientes con hilos y ver qué falla cuando la red no se porta bien."
fuentes:
  - "API de java.net (Socket, ServerSocket, DatagramSocket, DatagramPacket) de la documentación de Java SE; el código y el texto son obra original."
  - "RFC 793 (TCP) y RFC 768 (UDP) para las diferencias entre ambos protocolos."
---

# Planteamiento

En este caso programas comunicaciones en red con **sockets** en Java: primero un cliente y un servidor TCP, después un servidor que atiende a varios clientes a la vez, un protocolo de texto con estado compartido, los fallos típicos de la red, el equivalente con UDP y, al final, una sala de mensajes.

En cada parte harás un recorrido parecido:

1. **Ejecuta** lo que se te da y observa qué ocurre, con tus propios ojos.
2. **Programa** lo que falta. Al principio se te dice qué clases usar; según avances, los enunciados solo dicen qué hay que lograr.
3. **Demuestra** que funciona, con la salida real de tu programa.

::: nota
Necesitas un JDK (Java 17 o posterior) y **dos o tres terminales abiertas a la vez**: casi siempre habrá un servidor corriendo en una y clientes en las otras. Compila todo con `javac *.java` y ejecuta cada clase con `java NombreDeLaClase`.

Los programas escriben con tres prefijos: `[+]` para contar lo que hace el programa, `[!]` para un aviso y `[X]` para un error. Usa los mismos en los tuyos.

Todo se ejecuta en tu propio equipo, con la dirección `localhost`. Los puertos usados son el **9090** (eco), **9091** (contador), **9092** (servidor silencioso), **9093** (sala) y el **9100** UDP (sensor). No se usa el 5000 porque en algunos equipos ya lo ocupa el sistema.
:::

::: aviso
Con redes y hilos, **no todo falla siempre igual**: un puerto puede seguir ocupado de una ejecución anterior, un servidor puede quedarse esperando en otra terminal sin que te acuerdes. Antes de dar un programa por roto, comprueba que no queda ninguno de los tuyos ejecutándose (`Ctrl+C` en cada terminal).
:::

# Conocimientos previos

- Crear y arrancar hilos con `Thread`, y la sección crítica con `synchronized` (lo has visto en los casos de hilos).
- Qué son una **dirección IP** y un **puerto**.
- Leer y escribir con `BufferedReader` y `PrintWriter`.
- Qué es un **cliente** y qué es un **servidor**.

Las clases nuevas se explican donde aparecen: `Socket` y `ServerSocket` (TCP) en la parte 1, y `DatagramSocket` y `DatagramPacket` (UDP) en la parte 5.

# Parte 1. Un cliente y un servidor

**Herramientas de esta parte: `ServerSocket`, `Socket`, `BufferedReader` y `PrintWriter`.**

TCP conecta dos programas con un canal fiable: lo que escribe uno, lo lee el otro, en orden y sin pérdidas. Uno de los dos **espera** y el otro **llama**:

- El **servidor** crea un `ServerSocket` en un puerto y llama a `accept()`, que **se queda esperando** hasta que alguien se conecta. Cuando llega alguien, `accept()` devuelve un `Socket` que es el canal con ese cliente.
- El **cliente** crea un `Socket` indicando la dirección y el puerto del servidor, y ya está conectado.

A partir de ahí los dos tratan el socket como un fichero: `getInputStream()` para leer y `getOutputStream()` para escribir. Envolviéndolos en un `BufferedReader` y un `PrintWriter`, se lee y se escribe **por líneas**.

Este es un servidor de eco: devuelve cada línea con la palabra `ECO` delante, y termina cuando el cliente envía `FIN`.

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;

/** Parte 1. Un servidor de eco que atiende a un solo cliente. */
public class ServidorEco {

    static final int PUERTO = 9090;

    public static void main(String[] args) throws IOException {
        ServerSocket servidor = new ServerSocket(PUERTO);
        System.out.println("[+] Servidor escuchando en el puerto " + PUERTO);

        Socket cliente = servidor.accept();
        System.out.println("[+] Cliente conectado desde " + cliente.getRemoteSocketAddress());

        BufferedReader entrada = new BufferedReader(new InputStreamReader(cliente.getInputStream()));
        PrintWriter salida = new PrintWriter(cliente.getOutputStream(), true);

        String linea = entrada.readLine();
        while (linea != null && !linea.equals("FIN")) {
            System.out.println("[+] Recibido: " + linea);
            salida.println("ECO " + linea);
            linea = entrada.readLine();
        }

        System.out.println("[+] Cliente desconectado");
        cliente.close();
        servidor.close();
    }
}
```

**Ejecútalo.** Compila y arranca el servidor. Sin escribir ningún cliente, conéctate a él con una herramienta que ya tengas (`nc localhost 9090`, o `telnet localhost 9090`) y escribe un par de líneas.

:::ejercicio[Entiende el servidor]
1. ¿Qué escribe el servidor en cuanto lo arrancas, y qué hace el hilo principal mientras nadie se conecta?
2. ¿Qué ocurre si, con el servidor ya conectado a tu primer cliente, intentas conectar otro?
3. ¿Por qué `PrintWriter` se crea con el segundo argumento `true`? Pruébalo quitándolo y cuéntalo.
:::

:::ejercicio[Escribe el cliente]
Escribe `ClienteEco.java`: se conecta al servidor, lee líneas del teclado y las envía, escribe por pantalla lo que contesta el servidor, y termina cuando escribes `FIN`.

Ejecútalo contra el servidor y apunta tres líneas de la conversación. Comprueba que el servidor, al terminar, escribe `Cliente desconectado`.
:::

# Parte 2. Varios clientes a la vez

**Herramientas de esta parte: `Thread` y el servidor de la parte 1.**

El servidor de la parte 1 atiende a un solo cliente y se apaga. Este lo repite en un bucle, pero siempre **de uno en uno**:

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;

/** Parte 2. El mismo servidor de eco, pero que atiende a un cliente detrás de otro. */
public class ServidorSecuencial {

    static final int PUERTO = 9090;

    static void atender(Socket cliente) throws IOException {
        System.out.println("[+] Cliente conectado desde " + cliente.getRemoteSocketAddress());
        BufferedReader entrada = new BufferedReader(new InputStreamReader(cliente.getInputStream()));
        PrintWriter salida = new PrintWriter(cliente.getOutputStream(), true);

        String linea = entrada.readLine();
        while (linea != null && !linea.equals("FIN")) {
            System.out.println("[+] Recibido: " + linea);
            salida.println("ECO " + linea);
            linea = entrada.readLine();
        }

        System.out.println("[+] Cliente desconectado");
        cliente.close();
    }

    public static void main(String[] args) throws IOException {
        ServerSocket servidor = new ServerSocket(PUERTO);
        System.out.println("[+] Servidor escuchando en el puerto " + PUERTO);

        while (true) {
            Socket cliente = servidor.accept();
            atender(cliente);
        }
    }
}
```

**Provócalo.** Arranca el servidor, conecta un primer cliente y **no escribas nada en él**. Conecta ahora un segundo cliente y escribe una línea en el segundo.

:::ejercicio[Entiende la espera]
1. ¿Contesta el servidor al segundo cliente? ¿Qué hace el servidor en ese momento?
2. El segundo cliente dijo `Conectado al servidor` en cuanto se lanzó. Entonces, ¿quién estaba esperando en realidad? ¿En qué parte del código?
3. Ahora cierra el primer cliente con `FIN`. ¿Qué pasa con el segundo? Explica por qué.
:::

:::ejercicio[Atiéndelos a la vez]
Escribe `ServidorHilos.java`: un servidor que atienda **a todos los clientes que lleguen a la vez**.

Demuéstralo con la salida del servidor mientras dos clientes están conectados al mismo tiempo, y comprueba que ambos reciben su eco sin esperarse. ¿Qué hilo atiende a cada cliente?
:::

# Parte 3. Un contador compartido

**Esta parte solo dice lo que hay que lograr.**

Un servidor que atiende a varios clientes a la vez comparte memoria entre ellos. Si lo que comparten se modifica, vuelves a tener todos los problemas de los hilos que ya conoces, pero ahora con red por medio.

El servidor guarda **un único contador** que todos los clientes pueden modificar. Se habla con él con un **protocolo de texto**: el cliente envía una línea, y el servidor contesta con una línea.

| El cliente envía | El servidor contesta |
|---|---|
| `SUMAR n` | `OK` (y suma `n` al contador) |
| `VER` | `TOTAL x`, con el valor actual |
| `SALIR` | `ADIOS` y cierra la conexión |
| cualquier otra cosa | `ERROR comando desconocido` |
| `SUMAR` sin número | `ERROR falta el numero` |
| `SUMAR` con algo que no es un número | `ERROR numero no valido` |

El puerto es el **9091**. Este cliente de prueba lanza ocho clientes a la vez, cada uno suma 1 cinco mil veces, y después pregunta el total:

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

/** Parte 3. Lanza varios clientes a la vez, cada uno suma 1 muchas veces, y comprueba el total. */
public class ClientePrueba {

    static final int PUERTO = 9091;

    static class Sumador extends Thread {
        private final int repeticiones;

        Sumador(String nombre, int repeticiones) {
            super(nombre);
            this.repeticiones = repeticiones;
        }

        @Override
        public void run() {
            try {
                Socket socket = new Socket("localhost", PUERTO);
                BufferedReader entrada = new BufferedReader(new InputStreamReader(socket.getInputStream()));
                PrintWriter salida = new PrintWriter(socket.getOutputStream(), true);
                for (int i = 0; i < repeticiones; i++) {
                    salida.println("SUMAR 1");
                    entrada.readLine();
                }
                salida.println("SALIR");
                entrada.readLine();
                socket.close();
            } catch (IOException e) {
                System.out.println("[X] " + getName() + ": " + e.getMessage());
            }
        }
    }

    public static void main(String[] args) throws Exception {
        final int clientes = 8;
        final int repeticiones = 5_000;

        Sumador[] hilos = new Sumador[clientes];
        for (int i = 0; i < clientes; i++) {
            hilos[i] = new Sumador("cliente-" + (i + 1), repeticiones);
            hilos[i].start();
        }
        for (Sumador hilo : hilos) {
            hilo.join();
        }

        Socket socket = new Socket("localhost", PUERTO);
        BufferedReader entrada = new BufferedReader(new InputStreamReader(socket.getInputStream()));
        PrintWriter salida = new PrintWriter(socket.getOutputStream(), true);
        salida.println("VER");
        String respuesta = entrada.readLine();
        salida.println("SALIR");
        socket.close();

        System.out.println("[+] Total esperado: " + (clientes * repeticiones));
        System.out.println("[+] Respuesta del servidor: " + respuesta);
        if (!respuesta.equals("TOTAL " + (clientes * repeticiones))) {
            System.out.println("[X] El servidor ha perdido sumas");
        }
    }
}
```

:::ejercicio[El servidor del contador]
Escribe `ServidorContador.java` que cumpla el protocolo de la tabla y atienda a varios clientes a la vez.

Ejecuta `ClientePrueba` **cinco veces** contra tu servidor, reiniciándolo cada vez. El total tiene que ser siempre `40000`.
:::

:::ejercicio[Quita la sincronización]
Haz una copia de tu servidor sin ninguna protección sobre el contador y ejecuta `ClientePrueba` otras cinco veces. Apunta qué total obtiene en cada ocasión.

Explica con tus palabras **por qué** se pierden sumas aunque cada cliente espera la respuesta `OK` antes de enviar la siguiente. ¿Dónde está la sección crítica? Después devuelve el servidor a su versión correcta.
:::

:::ejercicio[Prueba los errores]
Conéctate con `nc localhost 9091` y prueba a mano las tres líneas de error de la tabla. Pega lo que contesta tu servidor a cada una. ¿Qué ocurre con la conexión después de un error: se cierra o sigue abierta? ¿Por qué es mejor así?
:::

# Parte 4. Cuando la red falla

**Esta parte solo dice lo que hay que lograr.**

En local todo va bien, pero una red real falla: el servidor no está, el servidor no contesta, el cliente desaparece. Un programa de red que no prevé esto se queda colgado o se rompe sin explicar nada.

El **servidor silencioso** acepta conexiones y no contesta nunca, que es lo que le pasa a un servidor atascado:

```java
import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;

/** Parte 4. Acepta conexiones y no contesta nunca. */
public class ServidorSilencioso {

    static final int PUERTO = 9092;

    public static void main(String[] args) throws IOException, InterruptedException {
        ServerSocket servidor = new ServerSocket(PUERTO);
        System.out.println("[+] Servidor silencioso en el puerto " + PUERTO);

        while (true) {
            Socket cliente = servidor.accept();
            System.out.println("[+] Conexión aceptada de " + cliente.getRemoteSocketAddress() + ", no voy a contestar");
            Thread.sleep(60_000);
        }
    }
}
```

:::ejercicio[Provoca tres fallos]
Provoca cada uno de estos fallos con tus programas y apunta el **nombre de la excepción** y su mensaje:

1. Un cliente que se conecta a un puerto en el que **no hay nadie escuchando**.
2. Dos servidores que intentan escuchar en el **mismo puerto** a la vez.
3. Tu `ClienteEco`, cambiando el puerto a 9092 para que se conecte al servidor silencioso: ¿qué hace y cuánto tarda en darse por vencido?
:::

:::ejercicio[Un cliente que no se cuelga]
Escribe `ClienteRobusto.java`. Recibe como argumento el puerto, se conecta, envía una línea y espera la respuesta **como máximo 3 segundos**. Debe distinguir y explicar, con un mensaje distinto cada uno, estos tres casos: no hay nadie escuchando, el servidor no contesta a tiempo y cualquier otro error de red.

Demuéstralo con los puertos 9099 (nadie), 9092 (silencioso) y 9090 (el eco, con su servidor arrancado).
:::

:::ejercicio[El cliente desaparece]
Con tu servidor de la parte 2 en marcha, conecta un cliente y **mátalo sin avisar** (cierra la terminal, o `Ctrl+C`). ¿Cómo se entera el servidor de que se ha ido? ¿Se cae el servidor? ¿Se ve afectado otro cliente conectado en ese momento? Razona con la salida del servidor.
:::

# Parte 5. UDP

**Herramientas de esta parte: `DatagramSocket`, `DatagramPacket` y `InetAddress`.**

UDP no tiene conexión. No hay `accept()` ni canal: cada mensaje es un **datagrama** independiente que se envía a una dirección y un puerto, y **nadie garantiza** que llegue, ni que llegue en orden, ni que llegue una sola vez. A cambio es más ligero, y es lo que se usa para lecturas de sensores, voz o juegos.

- El **emisor** crea un `DatagramSocket`, empaqueta los bytes en un `DatagramPacket` con el destino y lo envía con `send()`.
- El **receptor** crea un `DatagramSocket` en un puerto, prepara un `DatagramPacket` con un **búfer vacío** y llama a `receive()`, que espera hasta que llega un datagrama. Después, `getLength()` dice cuántos bytes llegaron de verdad.

Este sensor manda diez lecturas numeradas, `número;temperatura`, a una por cada 200 milisegundos. Con el argumento `perdidas`, **se salta una de cada cuatro**, para simular una red que las pierde:

```java
import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;

/** Parte 5. Manda diez lecturas numeradas por UDP. Con el argumento "perdidas", se salta una de cada cuatro. */
public class Sensor {

    static final int PUERTO = 9100;

    public static void main(String[] args) throws IOException, InterruptedException {
        boolean perdidas = args.length > 0 && args[0].equals("perdidas");
        DatagramSocket socket = new DatagramSocket();
        InetAddress destino = InetAddress.getByName("localhost");

        for (int seq = 1; seq <= 10; seq++) {
            if (perdidas && seq % 4 == 0) {
                System.out.println("[!] Se pierde la lectura " + seq);
                continue;
            }
            String texto = seq + ";" + (20.0 + seq * 0.5);
            byte[] datos = texto.getBytes();
            socket.send(new DatagramPacket(datos, datos.length, destino, PUERTO));
            System.out.println("[+] Enviada: " + texto);
            Thread.sleep(200);
        }
        socket.close();
    }
}
```

Este receptor tiene un problema:

```java
import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.SocketTimeoutException;

/** Parte 5. Un receptor con un búfer demasiado pequeño. */
public class ReceptorCorto {

    static final int PUERTO = 9100;

    public static void main(String[] args) throws IOException {
        DatagramSocket socket = new DatagramSocket(PUERTO);
        socket.setSoTimeout(3000);
        byte[] bufer = new byte[4];
        System.out.println("[+] Receptor escuchando en el puerto " + PUERTO);

        try {
            while (true) {
                DatagramPacket paquete = new DatagramPacket(bufer, bufer.length);
                socket.receive(paquete);
                String texto = new String(paquete.getData(), 0, paquete.getLength());
                System.out.println("[+] Recibido: " + texto);
            }
        } catch (SocketTimeoutException e) {
            System.out.println("[+] No llega nada más, termino");
        }
        socket.close();
    }
}
```

:::ejercicio[Observa UDP]
1. Ejecuta `Sensor` **sin receptor**. ¿Da algún error? Compara con lo que pasó en la parte 4 al conectar con TCP a un puerto sin servidor, y explica la diferencia.
2. Arranca `ReceptorCorto` y después `Sensor`. ¿Qué texto llega de cada lectura? ¿Por qué? ¿Dónde está el límite?
3. ¿Qué valor devuelve `getLength()` y qué valor tiene `getData().length`? ¿Por qué hay que usar el primero?
:::

:::ejercicio[Detecta lo que falta]
Escribe `Receptor.java`: un receptor con un búfer de tamaño razonable, que escriba cada lectura recibida y **avise de las que faltan** usando el número de secuencia. Debe terminar solo cuando pasen 3 segundos sin recibir nada, escribiendo cuántas lecturas recibió.

Demuéstralo ejecutando el sensor con `perdidas` y sin él.
:::

:::ejercicio[TCP o UDP]
Rellena una tabla con una fila por cada aspecto: conexión, garantía de entrega, orden, qué pasa si el otro no está, y velocidad. Después elige, y justifica, qué protocolo usarías para: (a) la lectura de un termómetro cada segundo, (b) la transferencia de un fichero y (c) un chat.
:::

# Parte 6. Una sala de mensajes

**Esta parte solo dice lo que hay que lograr.**

Para terminar, un servidor TCP que reparte mensajes entre todos los clientes: una **sala**. Lo que escribe un cliente lo reciben todos los demás, nunca el que lo escribió.

El protocolo es de texto:

- La **primera línea** que envía el cliente es su nombre.
- Cada línea siguiente es un mensaje, que el servidor reenvía a los demás como `nombre: texto`.
- `/salir` cierra la conexión.
- Cuando alguien entra o sale, el servidor avisa a los demás con `nombre ha entrado` o `nombre ha salido`.

El puerto es el **9093**. Este es el cliente, que ya trae dos hilos: uno escribe lo que llega del servidor y el principal envía lo que tecleas. Se ejecuta con tu nombre como argumento (`java ClienteSala ana`).

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

/** Parte 6. Cliente de la sala: un hilo escribe lo que llega y el principal manda lo que tecleas. */
public class ClienteSala {

    static class Lector extends Thread {
        private final BufferedReader entrada;

        Lector(BufferedReader entrada) {
            this.entrada = entrada;
        }

        @Override
        public void run() {
            try {
                String linea = entrada.readLine();
                while (linea != null) {
                    System.out.println("[+] " + linea);
                    linea = entrada.readLine();
                }
            } catch (IOException e) {
                System.out.println("[!] Conexión cerrada");
            }
        }
    }

    public static void main(String[] args) throws IOException {
        String nombre = args[0];
        Socket socket = new Socket("localhost", 9093);
        BufferedReader entrada = new BufferedReader(new InputStreamReader(socket.getInputStream()));
        PrintWriter salida = new PrintWriter(socket.getOutputStream(), true);
        BufferedReader teclado = new BufferedReader(new InputStreamReader(System.in));

        salida.println(nombre);
        new Lector(entrada).start();

        String linea = teclado.readLine();
        while (linea != null) {
            salida.println(linea);
            if (linea.equals("/salir")) {
                break;
            }
            linea = teclado.readLine();
        }
        socket.close();
    }
}
```

:::ejercicio[La sala]
Escribe `ServidorSala.java` que cumpla el protocolo y atienda a todos los clientes a la vez. Conecta **tres clientes**, haz que cada uno escriba un mensaje y que uno salga con `/salir`. Pega la salida de uno de ellos.
:::

:::ejercicio[Pregunta por lo compartido]
1. ¿Qué estructura comparte tu servidor entre todos los hilos y cómo la proteges? ¿Qué pasaría si dos clientes escribieran a la vez y dos hilos recorrieran la lista de miembros al mismo tiempo que otro hilo añade a un cliente nuevo?
2. Conecta un cliente y **mátalo** sin enviar `/salir`. ¿Lo quita tu servidor de la sala? ¿Cómo lo sabes?
3. El servidor es un punto único de fallo. Explica en tres frases qué cambiaría en una arquitectura **entre pares** (*peer to peer*) y qué problemas nuevos traería.
:::

:::ejercicio[Documenta tu trabajo]
Escribe una descripción de una página con: qué hace cada una de tus clases, qué protocolo habla cada una, qué puertos usan y cómo se prueban. Debe poder seguirla alguien que no ha hecho el caso.
:::

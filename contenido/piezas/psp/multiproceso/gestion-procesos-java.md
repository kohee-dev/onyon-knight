---
titulo: "Gestión de procesos en Java"
licencia: "CC-BY-NC-SA-4.0"
fuentes:
  - "Vicente Martínez (IES Doctor Balmis), apuntes de Programación de Servicios y Procesos, CC BY-NC-SA 4.0: https://psp2dam.github.io/psp_sources/es/"
  - "Luis del Moral Martínez, «01. Programación multiproceso» (v. 20.10), CC BY-NC-SA 4.0"
---

# 1. De la teoría al lanzamiento de procesos

Una aplicación Java puede iniciar otros programas, proporcionarles datos y recoger sus resultados. Por ejemplo, puede ejecutar un conversor de documentos o una herramienta de red sin implementar de nuevo esa herramienta.

Trabajaremos con **JDK 17 o posterior**. Los ejemplos completos se guardan en archivos con el nombre de su clase pública, sin declaración de paquete para simplificar la ejecución inicial.

| Elemento | Responsabilidad |
| --- | --- |
| `ProcessBuilder` | Configura el programa, sus argumentos, el directorio, el entorno y las redirecciones. |
| `Process` | Representa al proceso iniciado y permite comunicarse con él y consultar su ejecución. |
| `Runtime` | Proporciona acceso al entorno de ejecución de la JVM; incluye métodos `exec()` que también inician procesos. |
| `ProcessHandle` | Permite identificar procesos y obtener información sobre ellos. |

**Crear un `ProcessBuilder` no inicia el programa.** El lanzamiento se realiza al llamar a `start()`. Cada llamada puede crear un hijo diferente. Cambiar la configuración posteriormente afecta a futuros lanzamientos, no al hijo que ya está ejecutándose.

::: aviso
Llamar a `Hijo.main(...)` ejecuta un método dentro de la JVM actual. Lanzar el ejecutable `java` para cargar `Hijo` crea **otro proceso con otra JVM**. Sus variables no quedan compartidas automáticamente.
:::

# 2. Comunicación entre procesos y flujos estándar

La **IPC**, comunicación entre procesos, puede realizarse mediante tuberías, mensajes, memoria compartida, señales o sockets. En este tema empezaremos con la entrada y salida estándar.

## 2.1. Los tres canales

| Canal | Descriptor habitual en Unix | Uso | En un programa Java |
| --- | --- | --- | --- |
| `stdin` | 0 | Recibir datos. | `System.in` |
| `stdout` | 1 | Producir resultados. | `System.out` |
| `stderr` | 2 | Emitir diagnósticos, avisos o errores. | `System.err` |

En una ejecución interactiva pueden estar conectados al teclado y a la pantalla. También pueden conectarse a archivos o a otros procesos.

::: nota
**Escribir en stderr no implica terminar con error.** El canal de diagnóstico y el código de salida son decisiones diferentes. Algunas herramientas muestran información normal, como su versión, en stderr.
:::

## 2.2. Redirecciones desde el shell

Los siguientes ejemplos se interpretan en un shell como Bash o en `cmd.exe`; otras consolas, como PowerShell, pueden presentar diferencias, especialmente al redirigir la entrada.

| Expresión | Efecto |
| --- | --- |
| `java MiClase < entrada.txt` | Lee stdin desde un archivo. |
| `java MiClase > salida.txt` | Guarda stdout; crea el archivo o vacía su contenido previo. |
| `java MiClase >> salida.txt` | Añade stdout al final. |
| `java MiClase 2> errores.txt` | Guarda stderr sobrescribiendo el archivo. |
| `java MiClase 2>> errores.txt` | Añade stderr al final. |
| `java Productor \| java Consumidor` | Conecta stdout del primero con stdin del segundo. |

Una **tubería** establece una relación productor-consumidor. El consumidor puede tener que esperar a que haya datos, y el productor puede bloquearse si llena el buffer antes de que el consumidor lo vacíe.

La aplicación puede seguir leyendo de `System.in` o escribiendo en `System.out`: la redirección cambia el destino o el origen desde fuera.

## 2.3. Señales y sockets

En Unix, las señales permiten notificar eventos. Por ejemplo, `kill -s SIGUSR1 PID` envía una señal a un proceso identificado; su efecto depende de cómo la gestione el programa o de la acción predeterminada. No debe enviarse a procesos arbitrarios.

En Windows, `taskkill` permite finalizar procesos, pero no equivale a enviar cualquier señal Unix. La gestión es específica del sistema.

Los **sockets** permiten comunicar procesos del mismo equipo o de equipos diferentes. Los trabajaremos al abordar comunicaciones en red. La ventaja de comenzar por stdin y stdout es que podemos observar la comunicación con herramientas sencillas.

# 3. Preparar el comando con ProcessBuilder

Podemos construirlo con argumentos separados:

```java
ProcessBuilder pb = new ProcessBuilder("java", "-version");
```

También admite una lista de cadenas:

```java
ProcessBuilder pb = new ProcessBuilder(
    java.util.List.of("java", "-version")
);
```

La primera cadena es el ejecutable y las siguientes son sus argumentos. Si una ruta o un argumento contiene espacios, se mantiene como **un solo elemento**.

::: aviso
No utilices `new ProcessBuilder("java -version")`: intentaría localizar un ejecutable con ese nombre completo. Tampoco es una solución general dividir un comando con `split(" ")` o `split("\\s")`, porque rompe los argumentos y las rutas que contienen espacios.
:::

## 3.1. Consultar y modificar el comando

Los siguientes fragmentos suponen que existe el constructor `pb`:

```java
pb.command("java", "-version");
System.out.println(pb.command());
```

`command()` devuelve la lista utilizada por el constructor. Si necesitas modificar esa lista mediante `add()`, prepara una lista mutable; `List.of(...)` crea una lista inmutable.

```java
java.util.List<String> orden = new java.util.ArrayList<>();
orden.add("java");
orden.add("-version");
ProcessBuilder pb = new ProcessBuilder(orden);
```

## 3.2. Cuándo interviene un intérprete de comandos

Los ejecutables externos se pueden lanzar directamente. Para órdenes internas como `dir` o sintaxis del shell, hay que iniciar el intérprete correspondiente.

```java
// Windows: dir es una orden interna de cmd.exe.
ProcessBuilder windows = new ProcessBuilder("cmd.exe", "/c", "dir");

// GNU/Linux: ls es un ejecutable y no necesita un shell.
ProcessBuilder linux = new ProcessBuilder("ls", "-l");

// Una expresión fija que necesita que el shell interprete la tubería.
ProcessBuilder shell = new ProcessBuilder(
    "sh", "-c", "printf 'uno\\ndos\\n' | wc -l"
);
```

Con `sh -c`, la expresión completa del shell ocupa un argumento. `ProcessBuilder` no convierte por sí solo `>`, `|` o `&&` en operadores. Para redirigir archivos preferiremos los métodos de la API.

::: aviso
No construyas expresiones de shell concatenando texto introducido por el usuario. Ese texto podría interpretarse como órdenes. Separa los argumentos y utiliza ejecutables y opciones definidos por la aplicación.
:::

# 4. Configurar el directorio y el entorno

## 4.1. Directorio de trabajo

El directorio de trabajo es la referencia para muchas rutas relativas del proceso. Se configura antes de arrancarlo:

```java
pb.directory(new java.io.File(System.getProperty("user.home")));
```

`pb.directory()` puede devolver `null` si no se ha fijado un directorio explícito; en ese caso se utiliza el directorio de trabajo del proceso actual. La carpeta elegida debe existir y ser accesible.

**Cambiar `System.setProperty("user.dir", ...)` no equivale a cambiar el directorio nativo del proceso.** Para el hijo, utiliza `directory(...)`.

## 4.2. Variables de entorno

El constructor parte de una copia del entorno del padre. Podemos modificar lo que recibirá el hijo:

```java
pb.environment().put("PSP_GRUPO", "2DAM");
```

Esto no cambia el entorno del sistema ni el del padre. El hijo Java puede consultar el valor con `System.getenv("PSP_GRUPO")`.

No confundamos:

| Concepto | Consulta | Ejemplo |
| --- | --- | --- |
| Propiedades de la JVM | `System.getProperty(...)` | `java.home`, `os.name`, `user.dir` |
| Variables de entorno | `System.getenv(...)` | `PATH`, `PSP_GRUPO` |
| Entorno preparado para un hijo | `pb.environment()` | Mapa modificable antes del arranque. |

La grafía y el tratamiento de las variables de entorno dependen del sistema. No supongas que `path` y `PATH` se comportan igual en todas las plataformas.

# 5. El objeto Process y el ciclo de vida

```java
Process proceso = pb.start();
```

El padre puede continuar mientras el hijo trabaja. Disponer de un objeto `Process` significa que el proceso se ha iniciado, no que haya terminado correctamente.

| Método | Qué permite hacer |
| --- | --- |
| `pid()` | Obtener el identificador del hijo. |
| `isAlive()` | Consultar si continúa vivo en ese momento. |
| `waitFor()` | Esperar su terminación y obtener el código de salida. |
| `waitFor(tiempo, unidad)` | Esperar hasta un límite; devuelve si ha terminado. |
| `exitValue()` | Consultar el código cuando ya ha terminado. |
| `destroy()` | Solicitar su terminación; los detalles dependen de la plataforma. |
| `destroyForcibly()` | Solicitar la terminación forzosa. |
| `toHandle()` | Obtener un `ProcessHandle`. |

`exitValue()` lanza `IllegalThreadStateException` si el proceso sigue vivo. Una llamada a `destroy()` o `destroyForcibly()` no garantiza que ya haya terminado cuando la llamada retorna: hay que comprobarlo o esperar.

## 5.1. Códigos y excepciones

Por convención, **0 suele indicar éxito** y otros valores indican situaciones definidas por el programa. No existe un significado universal para cada número ni un rango portable único para todos los sistemas.

Un programa Java puede terminar mediante `System.exit(codigo)`. No lo confundas con devolver un valor desde `main`, que tiene retorno `void`.

| Situación | Qué observamos |
| --- | --- |
| No se encuentra el ejecutable o no puede iniciarse. | `start()` puede lanzar `IOException`. |
| El hijo arranca, pero rechaza sus argumentos. | Puede emitir un diagnóstico y terminar con un código distinto de cero. |
| El hilo Java que espera es interrumpido. | `waitFor()` puede lanzar `InterruptedException`. |

Los ejemplos propagan excepciones desde `main` para centrar la lectura. En una aplicación completa debemos tratarlas, cerrar recursos y decidir qué hacer con los hijos todavía activos. Si capturamos una interrupción sin propagarla, no debemos ignorarla: normalmente se restaura con `Thread.currentThread().interrupt()` tras la limpieza necesaria.

# 6. Ejemplo completo: lanzar otra clase Java

Crearemos tres archivos en una misma carpeta: `Hijo.java`, `Rutas.java` y `Lanzador.java`.

## 6.1. El programa hijo

**Archivo `Hijo.java`:**

```java
public class Hijo {
    public static void main(String[] args) throws InterruptedException {
        String mensaje = args.length == 0 ? "Hola PSP" : args[0];
        System.out.println("Mensaje: " + mensaje);
        System.out.println("PID: " + ProcessHandle.current().pid());
        System.out.println("Directorio: " + System.getProperty("user.dir"));
        System.out.println("Grupo: " + System.getenv("PSP_GRUPO"));
        System.err.println("Diagnostico del hijo");

        if (mensaje.equals("lento")) {
            Thread.sleep(10_000);
        }
        if (mensaje.equals("error")) {
            System.err.println("Fallo simulado");
            System.exit(2);
        }
    }
}
```

Este programa también funciona de forma independiente. El argumento `error` provoca un código 2; `lento` introduce una espera para probar límites de tiempo. La llamada a `sleep` solo simula duración y no sustituye a la sincronización entre procesos.

## 6.2. Localizar Java y las clases

Utilizaremos una pequeña clase de apoyo. Localiza Java dentro de la JVM actual y convierte las entradas del classpath en rutas absolutas, para que cambiar el directorio del hijo no impida encontrar sus clases.

**Archivo `Rutas.java`:**

```java
import java.io.File;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class Rutas {
    public static String java() {
        boolean windows = System.getProperty("os.name")
                .toLowerCase(java.util.Locale.ROOT).startsWith("windows");
        return Path.of(System.getProperty("java.home"), "bin",
                windows ? "java.exe" : "java").toString();
    }

    public static String classpath() {
        return Arrays.stream(System.getProperty("java.class.path")
                .split(Pattern.quote(File.pathSeparator), -1))
                .map(ruta -> Path.of(ruta.isEmpty() ? "." : ruta)
                        .toAbsolutePath().normalize().toString())
                .collect(Collectors.joining(File.pathSeparator));
    }

    public static List<String> comando(String clase, String... argumentos) {
        List<String> orden = new ArrayList<>();
        orden.add(java());
        orden.add("-cp");
        orden.add(classpath());
        orden.add(clase);
        orden.addAll(Arrays.asList(argumentos));
        return orden;
    }
}
```

En estos ejemplos utilizamos clases compiladas y un classpath convencional de directorios o archivos JAR. No es una configuración para proyectos modulares.

## 6.3. Lanzar y mostrar la consola

**Archivo `Lanzador.java`:**

```java
public class Lanzador {
    public static void main(String[] args) throws Exception {
        String mensaje = args.length == 0 ? "Hola grupo PSP" : args[0];
        ProcessBuilder pb = new ProcessBuilder(Rutas.comando("Hijo", mensaje));
        pb.inheritIO();
        Process hijo = pb.start();
        int codigo = hijo.waitFor();
        System.out.println("Codigo de salida: " + codigo);
    }
}
```

Desde la carpeta de los archivos:

```bash
javac -encoding UTF-8 Hijo.java Rutas.java Lanzador.java
java Hijo "Hola grupo PSP"
java Lanzador
java Lanzador error
```

Con `inheritIO()`, el hijo utiliza los canales estándar heredados del padre. Esto permite observarlo sin programar lectores. En determinadas consolas integradas en IDE, especialmente para la entrada, puede ser preferible utilizar una terminal externa.

::: nota
Si utilizas paquetes, pasa el nombre completo, como `psp.ejemplo.Hijo`. El classpath debe apuntar a la raíz que contiene la carpeta `psp`, no al archivo `.class`. `build/classes` es una disposición posible de un proyecto Ant, no una carpeta obligatoria en Java.
:::

# 7. Gestionar los flujos desde el padre

Por defecto, `ProcessBuilder` conecta los canales del hijo a tuberías accesibles desde el padre. El nombre de cada método se interpreta **desde la perspectiva del padre**:

| Canal del hijo | Método de Process | Acción del padre |
| --- | --- | --- |
| stdin | `getOutputStream()` | Escribir lo que recibirá el hijo. |
| stdout | `getInputStream()` | Leer lo que produce el hijo. |
| stderr | `getErrorStream()` | Leer sus diagnósticos. |

```text
Padre escribe ──getOutputStream()──> stdin del hijo
Padre lee     <──getInputStream()── stdout del hijo
Padre lee     <──getErrorStream()── stderr del hijo
```

Los flujos transportan bytes. `InputStreamReader` los convierte en caracteres y `BufferedReader` permite leer líneas. En sentido contrario, `OutputStreamWriter` convierte caracteres en bytes. Este encadenamiento de envoltorios añade funcionalidades sin reescribir las clases internas.

## 7.1. Leer la salida del hijo

**Archivo `LeerSalida.java`:** utiliza `Hijo` y `Rutas` ya compilados.

```java
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

public class LeerSalida {
    public static void main(String[] args) throws Exception {
        String mensaje = args.length == 0 ? "Hola grupo PSP" : args[0];
        ProcessBuilder pb = new ProcessBuilder(Rutas.comando("Hijo", mensaje));
        pb.redirectErrorStream(true);
        Process hijo = pb.start();
        try {
            // Este hijo no necesita recibir datos por stdin.
            hijo.getOutputStream().close();
            try (BufferedReader lector = new BufferedReader(
                    new InputStreamReader(hijo.getInputStream(),
                            StandardCharsets.UTF_8))) {
                String linea;
                while ((linea = lector.readLine()) != null) {
                    System.out.println("HIJO > " + linea);
                }
            }
            System.out.println("Codigo de salida: " + hijo.waitFor());
        } finally {
            if (hijo.isAlive()) {
                hijo.destroyForcibly();
                hijo.waitFor();
            }
        }
    }
}
```

El hijo de este ejemplo emite texto ASCII, compatible con UTF-8. Para intercambiar caracteres generales entre programas propios, acordaremos explícitamente la codificación, como en el siguiente ejemplo.

`redirectErrorStream(true)` mezcla stdout y stderr: se leen juntos mediante `getInputStream()`, perdiendo la distinción entre canales. Si queremos conservarla, podemos redirigirlos a archivos separados o atenderlos concurrentemente.

::: aviso
**Esperar a que termine el hijo sin consumir o redirigir sus salidas puede bloquear el programa.** Si se llena una tubería, el hijo puede esperar a que el padre lea mientras el padre espera a que el hijo termine. Leer stdout completo y después stderr también puede bloquearse.
:::

El lector anterior espera hasta el fin del flujo. Es adecuado para el hijo conocido del ejemplo, que termina. No incorpora un tiempo máximo: añadir un `waitFor` con timeout después de una lectura que ya se ha quedado bloqueada no resolvería el problema.

## 7.2. Enviar datos al hijo y recoger su respuesta

Vamos a acordar un protocolo sencillo: **el padre envía una línea UTF-8, cierra la entrada y el hijo devuelve esa línea en mayúsculas**.

**Archivo `Eco.java`:**

```java
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

public class Eco {
    public static void main(String[] args) throws Exception {
        BufferedReader entrada = new BufferedReader(
                new InputStreamReader(System.in, StandardCharsets.UTF_8));
        PrintWriter salida = new PrintWriter(
                new OutputStreamWriter(System.out, StandardCharsets.UTF_8), true);
        String linea = entrada.readLine();
        if (linea != null) {
            salida.println(linea.toUpperCase(Locale.ROOT));
        }
    }
}
```

**Archivo `Conversacion.java`:**

```java
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;

public class Conversacion {
    public static void main(String[] args) throws Exception {
        ProcessBuilder pb = new ProcessBuilder(Rutas.comando("Eco"));
        pb.redirectError(ProcessBuilder.Redirect.INHERIT);
        Process hijo = pb.start();
        try {
            try (BufferedWriter escritor = new BufferedWriter(
                    new OutputStreamWriter(hijo.getOutputStream(),
                            StandardCharsets.UTF_8))) {
                escritor.write("Hola, programación de procesos");
                escritor.newLine();
                escritor.flush();
            }
            try (BufferedReader lector = new BufferedReader(
                    new InputStreamReader(hijo.getInputStream(),
                            StandardCharsets.UTF_8))) {
                String linea;
                while ((linea = lector.readLine()) != null) {
                    System.out.println("Respuesta: " + linea);
                }
            }
            System.out.println("Codigo: " + hijo.waitFor());
        } finally {
            if (hijo.isAlive()) {
                hijo.destroyForcibly();
                hijo.waitFor();
            }
        }
    }
}
```

Compilación y ejecución:

```bash
javac -encoding UTF-8 Eco.java Conversacion.java Rutas.java
java Conversacion
```

La línea nueva permite que `readLine()` complete la lectura; `flush()` envía lo que todavía estaba en el buffer y el cierre indica fin de entrada. Este protocolo pequeño no debe generalizarse a enviar volúmenes ilimitados antes de empezar a leer: una conversación extensa puede requerir atender ambos sentidos concurrentemente.

# 8. Redirigir a archivos y controlar el tiempo

Las redirecciones se configuran **antes de `start()`**. Los flujos del objeto `Process` se utilizan **después del arranque**.

| Configuración | Efecto |
| --- | --- |
| `redirectInput(archivo)` | Entrada desde un archivo. |
| `redirectOutput(archivo)` | Salida a un archivo, reemplazando su contenido. |
| `redirectError(archivo)` | Diagnósticos a otro archivo. |
| `Redirect.appendTo(archivo)` | Añadir a un archivo existente o crearlo. |
| `Redirect.INHERIT` | Utilizar el canal heredado. |
| `Redirect.DISCARD` | Descartar una salida. |
| `Redirect.PIPE` | Utilizar una tubería. |

`Redirect.from(...)` es una fuente de entrada; `to(...)` y `appendTo(...)` son destinos de salida. No son intercambiables.

**Archivo `Registro.java`:** combina directorio, entorno, registro y límite de tiempo.

```java
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;

public class Registro {
    public static void main(String[] args) throws Exception {
        String mensaje = args.length == 0 ? "Hola grupo PSP" : args[0];
        Path carpeta = Path.of("trabajo PSP").toAbsolutePath();
        Files.createDirectories(carpeta);
        Path registro = carpeta.resolve("salida.txt");

        ProcessBuilder pb = new ProcessBuilder(Rutas.comando("Hijo", mensaje));
        pb.directory(carpeta.toFile());
        pb.environment().put("PSP_GRUPO", "2DAM");
        pb.redirectErrorStream(true);
        pb.redirectOutput(registro.toFile());

        Process hijo = pb.start();
        try {
            hijo.getOutputStream().close();
            if (!hijo.waitFor(3, TimeUnit.SECONDS)) {
                System.out.println("Tiempo agotado: se solicita la terminacion");
                hijo.destroy();
                if (!hijo.waitFor(1, TimeUnit.SECONDS)) {
                    hijo.destroyForcibly();
                    hijo.waitFor();
                }
            }
            System.out.println("Codigo: " + hijo.exitValue());
            System.out.println("Registro: " + registro);
            System.out.println(Files.readString(registro));
        } finally {
            if (hijo.isAlive()) {
                hijo.destroyForcibly();
                hijo.waitFor();
            }
        }
    }
}
```

```bash
javac -encoding UTF-8 Hijo.java Rutas.java Registro.java
java Registro
java Registro error
java Registro lento
```

El archivo se sobrescribe en cada ejecución. Para acumular registros, sustituye la redirección por:

```java
pb.redirectOutput(ProcessBuilder.Redirect.appendTo(registro.toFile()));
```

::: aviso
Cuando stdout se redirige a un archivo, **no recibimos una copia leyendo `getInputStream()`**: ese canal devuelve fin de flujo. Cuando stdin procede de un archivo, no debemos intentar escribir mediante `getOutputStream()`.
:::

El ejemplo espera sin tener que vaciar tuberías, porque la salida va a un archivo. El tiempo máximo limita la espera inicial; la terminación y recogida del proceso requieren pasos posteriores. Terminar un proceso tampoco garantiza terminar todos los descendientes que haya creado.

# 9. Runtime.exec y ProcessBuilder

`Runtime.getRuntime().exec(...)` también devuelve un `Process`. Para mantener los argumentos separados, se puede utilizar un array:

```java
String[] comando = Rutas.comando("Hijo", "Hola grupo PSP")
        .toArray(String[]::new);
Process proceso = Runtime.getRuntime().exec(comando);
```

Este fragmento solo muestra el lanzamiento: después hay que atender sus canales y esperar o gestionar su terminación. No hereda automáticamente la consola.

| Aspecto | Runtime.exec | ProcessBuilder |
| --- | --- | --- |
| Configuración | Argumentos de una llamada. | Métodos que preparan la ejecución. |
| Argumentos con espacios | Se conservan utilizando `String[]`. | Se conservan separando argumentos. |
| Directorio y entorno | Disponibles en sobrecargas. | `directory()` y `environment()`. |
| Redirecciones previas | Menos cómodo; exige gestionar los flujos o preparar otras soluciones. | Métodos específicos e `inheritIO()`. |
| Proceso resultante | `Process`. | `Process` devuelto por `start()`. |

Preferiremos **ProcessBuilder por claridad de configuración**, no por una garantía de mayor velocidad. Las sobrecargas de `Runtime.exec` que reciben una sola cadena están obsoletas desde Java 18; esto no afecta por ese motivo a las que reciben un array.

# 10. Información sobre procesos

Desde Java 9 disponemos de `ProcessHandle`. Podemos consultar el proceso actual o convertir el objeto `Process` de un hijo mediante `toHandle()`.

Fragmento para el cuerpo de un método:

```java
ProcessHandle actual = ProcessHandle.current();
ProcessHandle.Info info = actual.info();
System.out.println("PID: " + actual.pid());
System.out.println("Comando: " + info.command().orElse("No disponible"));
System.out.println("Usuario: " + info.user().orElse("No disponible"));
info.arguments().ifPresent(valores ->
        System.out.println(java.util.Arrays.toString(valores)));
info.startInstant().ifPresent(instante ->
        System.out.println("Inicio: " + instante));
info.totalCpuDuration().ifPresent(duracion ->
        System.out.println("Tiempo de CPU: " + duracion));
```

La información puede no estar disponible, por permisos o porque el proceso haya terminado. Por eso muchos campos se devuelven mediante `Optional`. El tiempo de CPU no es lo mismo que el tiempo transcurrido desde que comenzó el programa.

# 11. Actividades de consolidación

Estas propuestas mantienen la progresión de los apuntes originales y se pueden realizar por separado.

1. **Preparar un comando.** Construye y muestra la lista de argumentos de una orden. Como adaptación del ejercicio de apagado del original, prepara sus opciones sin ejecutar `start()`. Compara la sintaxis documentada de Windows y Linux.
2. **Directorio de trabajo.** Lanza `dir` mediante `cmd /c` en Windows o `ls` directamente en Linux. Utiliza `inheritIO()` y configura una carpeta existente. Observa `directory()` antes y después de configurarla.
3. **Códigos de salida.** Ejecuta el hijo normalmente y con `error`. Después prueba un ejecutable inexistente y explica por qué no es el mismo tipo de fallo.
4. **Lanzador de clases.** Crea una clase intermedia que lance `Hijo`, espere su terminación y propague el código con `System.exit(...)`. Comprueba la cadena de procesos.
5. **Conversación.** Modifica `Eco` para recibir dos números mediante un protocolo de líneas acordado y devolver su suma. Define cómo responderá a datos incorrectos.
6. **Registro y tiempo máximo.** Ejecuta `Registro` en modo normal, `error` y `lento`. Explica el destino de los canales y el momento en que se aplica el límite.

# Anexo A. Propiedades del sistema y consola

## A.1. Información del entorno Java

| Propiedad | Contenido |
| --- | --- |
| `java.version` | Versión de Java. |
| `java.home` | Instalación de Java utilizada. |
| `java.class.path` | Classpath de la aplicación. |
| `os.name` | Nombre del sistema operativo. |
| `user.home` | Carpeta personal asociada al usuario. |
| `user.dir` | Propiedad que describe el directorio de trabajo de la aplicación. |
| `java.io.tmpdir` | Directorio temporal. |
| `file.separator` | Separador de componentes de ruta. |
| `path.separator` | Separador de entradas de listas de rutas. |

Para construir rutas, utiliza `Path.of(...)` y `resolve(...)`, como en los ejemplos. No cambies `file.separator` para intentar adaptar el sistema operativo.

```java
System.getProperties().forEach((clave, valor) ->
        System.out.println(clave + " = " + valor));

Runtime runtime = Runtime.getRuntime();
long total = runtime.totalMemory();
long libre = runtime.freeMemory();
System.out.println("Memoria reservada para el heap: " + total);
System.out.println("Memoria libre dentro de ese heap: " + libre);
System.out.println("Memoria utilizada aproximada: " + (total - libre));
System.out.println("Limite del heap: " + runtime.maxMemory());
System.out.println("Procesadores disponibles: " + runtime.availableProcessors());
```

Estas medidas de memoria corresponden al **heap de la JVM**, no a toda la RAM del equipo. El número de procesadores disponibles puede reflejar restricciones del entorno.

## A.2. Leer y dar formato

```java
java.util.Scanner teclado = new java.util.Scanner(System.in);
System.out.print("Nombre: ");
String nombre = teclado.nextLine();
System.out.printf("Hola, %s%n", nombre);
System.out.printf("Importe: %10.2f%n", 12.5);
String mensaje = String.format("Resultado: %d", 7);
System.out.println(mensaje);
```

`%s` representa texto, `%d` un entero, `%.2f` dos decimales y `%n` un salto de línea adecuado a la plataforma. `String.format()` devuelve una cadena; `printf()` la escribe. El separador decimal depende de la configuración regional. `NumberFormat` y `DecimalFormat` ofrecen otras posibilidades para representar números y monedas.

Para entrada interactiva, conviene evitar mezclar sin cuidado `nextInt()` y `nextLine()`: el salto de línea pendiente puede producir una lectura vacía. Leer una línea y convertirla es una alternativa.

## A.3. Codificaciones y colores

El emisor y el receptor deben acordar cómo se codifica el texto. **No todas las consolas de Windows utilizan CP850**, ni cambiar una propiedad de la JVM convierte automáticamente los bytes producidos por otro programa. Para datos propios, usa una codificación explícita como UTF-8 en lectores y escritores.

Algunos terminales interpretan secuencias ANSI de color:

```java
String verde = "\u001B[32m";
String restablecer = "\u001B[0m";
System.out.println(verde + "Proceso completado" + restablecer);
```

Es una ampliación de presentación. Una consola que no las admita puede mostrar caracteres extraños. No introduzcas colores en un flujo que otro programa espera interpretar como datos.

# Anexo B. curl como programa externo

`curl` es una herramienta de transferencia de datos mediante URLs. Nos permite practicar el lanzamiento de un programa real, sus argumentos, los canales de salida y el código de terminación.

Comprueba primero `curl --version`. La disponibilidad de protocolos depende de cómo se haya compilado la herramienta. En Windows, `curl.exe` permite seleccionar el ejecutable cuando la consola tenga un alias con otro significado.

## B.1. Peticiones y archivos

```bash
curl https://example.com/
curl -L -o pagina.html https://example.com/
curl -sS --max-time 15 https://example.com/
```

| Opción | Utilidad |
| --- | --- |
| `-o archivo` / `--output archivo` | Guardar el cuerpo en un archivo. |
| `-L` / `--location` | Seguir redirecciones HTTP. |
| `-s` / `--silent` | Ocultar el progreso y los mensajes de error. |
| `-S` / `--show-error` | Mostrar errores cuando se usa junto con `-s`. |
| `-v` / `--verbose` | Mostrar detalles del intercambio, normalmente en stderr. |
| `-i` / `--include` | Incluir cabeceras de respuesta junto al cuerpo. |
| `-I` / `--head` | Solicitar cabeceras mediante HEAD para HTTP. |
| `-w` / `--write-out` | Mostrar métricas o información seleccionada. |
| `--max-time 15` | Limitar la duración total de la operación. |
| `--fail` | Tratar respuestas HTTP de error como fallo de la operación. |

`-s` no es necesario para cambiar la posición de la URL. `-L` sigue redirecciones HTTP, pero no ejecuta JavaScript como un navegador.

```bash
curl -I https://example.com/
curl -sS -o pagina.html -w "HTTP: %{http_code}; tiempo: %{time_total}\n" https://example.com/
```

::: aviso
**El código de salida de curl y el estado HTTP son datos diferentes.** Sin opciones como `--fail`, recibir una respuesta HTTP 404 puede dejar código de proceso 0 porque la transferencia se completó. Un fallo DNS o de conexión puede producir un código distinto de cero sin respuesta HTTP.
:::

## B.2. Métodos, rutas y cabeceras — ampliación

Una API expone operaciones mediante un método HTTP y una ruta. Por ejemplo, `GET /libros` puede listar libros y `GET /libros/341` consultar uno. El servicio define el significado de cada operación; una URL base no es lo mismo que todos sus endpoints.

| Método | Uso habitual |
| --- | --- |
| GET | Consultar un recurso. |
| HEAD | Consultar cabeceras sin cuerpo. |
| POST | Enviar datos para crear o procesar un recurso. |
| PUT | Crear o sustituir la representación de un recurso según la API. |
| DELETE | Solicitar la eliminación de un recurso. |

Los siguientes ejemplos son para **un servicio de prácticas preparado por el docente en localhost:8080**. No funcionarán si ese servicio no existe. La sintaxis de comillas mostrada corresponde a Bash.

```bash
curl --data-urlencode 'nombre=Ana García' http://localhost:8080/alumnos
curl -H 'Content-Type: application/json' -d '{"nombre":"Ana"}' http://localhost:8080/alumnos
curl -X PUT -H 'Content-Type: application/json' -d '{"nombre":"Ana"}' http://localhost:8080/alumnos/1
```

`-d` selecciona normalmente POST y, por defecto, el formato de formulario. `--data-urlencode` codifica los datos de formulario. Con JSON indicamos el tipo mediante `Content-Type`. `-X` modifica el nombre del método, pero no configura por sí solo todos los demás detalles de la petición.

## B.3. Autenticación — ampliación

Un servicio puede exigir autenticación Basic, una clave en una cabecera o un token Bearer. Debe utilizarse el método documentado por la API y proteger las credenciales.

Ejemplos de sintaxis con un dominio reservado, **no un servicio real de prácticas**:

```bash
curl --user alumno https://api.example.test/recurso
curl -H 'Authorization: Bearer TOKEN_DE_PRUEBA' https://api.example.test/recurso
```

Al indicar solo el usuario, curl puede solicitar la contraseña. Basic no cifra las credenciales por sí mismo: se utiliza HTTPS. Los tokens y claves no deben incluirse en entregas, capturas o repositorios. Los detalles de autenticación y servicios web se ampliarán en sus unidades correspondientes.

## B.4. Lanzar curl desde Java

**Archivo `ConsultaCurl.java`:**

```java
import java.nio.file.Path;

public class ConsultaCurl {
    public static void main(String[] args) throws Exception {
        boolean windows = System.getProperty("os.name")
                .toLowerCase(java.util.Locale.ROOT).startsWith("windows");
        ProcessBuilder pb = new ProcessBuilder(
                windows ? "curl.exe" : "curl",
                "--fail", "--silent", "--show-error", "--location",
                "--max-time", "15", "https://example.com/");
        Path cuerpo = Path.of("respuesta.html").toAbsolutePath();
        Path errores = Path.of("curl-errores.txt").toAbsolutePath();
        pb.redirectOutput(cuerpo.toFile());
        pb.redirectError(errores.toFile());
        Process proceso = pb.start();
        try {
            proceso.getOutputStream().close();
            System.out.println("Codigo de curl: " + proceso.waitFor());
            System.out.println("Respuesta: " + cuerpo);
            System.out.println("Diagnosticos: " + errores);
        } finally {
            if (proceso.isAlive()) {
                proceso.destroyForcibly();
                proceso.waitFor();
            }
        }
    }
}
```

Necesita curl instalado y conectividad. Las redirecciones mantienen el HTML separado de los diagnósticos y evitan esperar con tuberías sin atender. El límite de la operación se solicita a curl mediante sus opciones.

# Procedencia, adaptación y referencias

Adaptación docente de **Alejandro Bartolomé** a partir de los PDF de **Vicente Martínez, IES Doctor Balmis**: *2.1 Comunicación entre procesos*, *2.2 Gestión de procesos en Java - ProcessBuilder y Process*, *2.3 Gestión de la E-S de un proceso*, *2.4 Anexo I - Propiedades del sistema y programación en consola* y *2.5 Anexo II - Curl*. [Apuntes originales de PSP](https://psp2dam.github.io/psp_sources/es/).

Complementado con *01. Programación multiproceso*, versión 20.10, de **Luis del Moral Martínez**, y con la sesión local *Procesos en Java: Runtime.exec y ProcessBuilder*. Los materiales de ambos autores indican **[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es)**; esta adaptación conserva la misma licencia.

Se han agrupado apartados, reconstruido ejemplos completos y revisado argumentos con espacios, directorios, entorno, codificaciones, redirecciones y terminación. Las instrucciones de IDE se expresan también mediante consola para que no dependan de un proyecto concreto. Los anexos se mantienen como consulta y ampliación.

Referencias técnicas de contraste:

- [Java: ProcessBuilder](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/ProcessBuilder.html).
- [Java: Process](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Process.html).
- [Java: Runtime](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Runtime.html).
- [Java: ProcessHandle](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/ProcessHandle.html).
- [Manual oficial de curl](https://curl.se/docs/manpage.html) y [Everything curl](https://everything.curl.dev/).
